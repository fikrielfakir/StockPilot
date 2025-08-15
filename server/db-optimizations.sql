-- Database Optimization Script for StockCéramique
-- Strategic indexing for high-performance queries

-- 1. COMPOSITE INDEXES FOR FREQUENT QUERY PATTERNS
-- Articles: Frequently searched by code + category combination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_code_category 
ON articles (code_article, categorie);

-- Articles: Stock analysis queries (current stock vs minimum threshold)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_stock_analysis 
ON articles (stock_actuel, seuil_minimum, categorie);

-- Articles: Supplier-based queries for procurement
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_supplier_active 
ON articles (fournisseur_id, stock_actuel) 
WHERE fournisseur_id IS NOT NULL;

-- Purchase Requests: Status-based filtering with date ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_requests_status_date 
ON purchase_requests (statut, date_demande DESC);

-- Purchase Request Items: Joint queries with articles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_request_items_composite 
ON purchase_request_items (purchase_request_id, article_id);

-- Stock Movements: Time-series analysis by article
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_movements_article_date 
ON stock_movements (article_id, date_movement DESC);

-- Stock Movements: Type-based reporting with date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_movements_type_date 
ON stock_movements (type, date_movement DESC, quantite);

-- Receptions: Supplier delivery tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_receptions_supplier_date 
ON receptions (supplier_id, date_reception DESC);

-- Outbounds: Requestor consumption analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_outbounds_requestor_date 
ON outbounds (requestor_id, date_sortie DESC);

-- 2. PARTIAL INDEXES FOR SPECIFIC CONDITIONS
-- Low stock alerts (only items below threshold)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_low_stock 
ON articles (stock_actuel, code_article) 
WHERE stock_actuel <= seuil_minimum;

-- Active purchase requests (excluding completed/refused)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_requests_active 
ON purchase_requests (date_demande DESC) 
WHERE statut IN ('en_attente', 'approuve', 'commande');

-- Recent stock movements (last 90 days for performance dashboards)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stock_movements_recent 
ON stock_movements (date_movement DESC, article_id) 
WHERE date_movement >= NOW() - INTERVAL '90 days';

-- 3. FULL-TEXT SEARCH INDEXES
-- Articles: Full-text search across description and reference
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_fulltext 
ON articles USING gin((
  setweight(to_tsvector('french', designation), 'A') ||
  setweight(to_tsvector('french', coalesce(reference, '')), 'B') ||
  setweight(to_tsvector('french', coalesce(marque, '')), 'C')
));

-- Suppliers: Full-text search for supplier information
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_fulltext 
ON suppliers USING gin((
  setweight(to_tsvector('french', nom), 'A') ||
  setweight(to_tsvector('french', coalesce(contact, '')), 'B') ||
  setweight(to_tsvector('french', coalesce(adresse, '')), 'C')
));

-- 4. HASH INDEXES FOR EXACT MATCHES
-- Articles: Fast exact code lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_code_hash 
ON articles USING hash (code_article);

-- User authentication
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_hash 
ON users USING hash (username);

-- 5. EXPRESSION INDEXES FOR CALCULATED VALUES
-- Articles: Stock value calculation (frequently used in reports)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_stock_value 
ON articles ((stock_actuel * COALESCE(prix_unitaire::numeric, 0)));

-- Stock movements: Movement value for financial reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_movements_value 
ON stock_movements ((quantite * COALESCE((SELECT prix_unitaire::numeric FROM articles WHERE id = article_id), 0)));

-- 6. COVERING INDEXES FOR DASHBOARD QUERIES
-- Dashboard stats: All-in-one index for summary statistics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_dashboard_stats 
ON articles (categorie) 
INCLUDE (stock_actuel, seuil_minimum, prix_unitaire);

-- Purchase request summary with item counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_purchase_requests_summary 
ON purchase_requests (statut, date_demande) 
INCLUDE (total_articles, requestor_id);

-- 7. UNIQUE CONSTRAINTS FOR DATA INTEGRITY
-- Ensure unique article codes (business rule)
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_code_unique 
ON articles (code_article);

-- Unique supplier names
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_suppliers_nom_unique 
ON suppliers (nom);

-- Unique usernames for authentication
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username_unique 
ON users (username);

-- 8. DATE-BASED PARTITIONING SETUP (for future growth)
-- Note: These would be implemented when data volume grows significantly

-- Audit logs partitioning by month
-- CREATE TABLE audit_logs_y2025m01 PARTITION OF audit_logs 
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Stock movements partitioning by quarter
-- CREATE TABLE stock_movements_2025_q1 PARTITION OF stock_movements
-- FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');

-- 9. MATERIALIZED VIEWS FOR COMPLEX ANALYTICS
-- Pre-calculated dashboard metrics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT 
  COUNT(*) as total_articles,
  COUNT(*) FILTER (WHERE stock_actuel <= seuil_minimum) as low_stock_count,
  SUM(stock_actuel * COALESCE(prix_unitaire::numeric, 0)) as total_stock_value,
  COUNT(DISTINCT categorie) as total_categories,
  COUNT(DISTINCT fournisseur_id) FILTER (WHERE fournisseur_id IS NOT NULL) as active_suppliers,
  NOW() as last_updated
FROM articles;

-- Monthly stock evolution for charts
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_stock_evolution AS
SELECT 
  DATE_TRUNC('month', sm.date_movement) as month,
  sm.article_id,
  a.code_article,
  a.categorie,
  SUM(CASE WHEN sm.type = 'entree' THEN sm.quantite ELSE -sm.quantite END) as net_movement,
  AVG(sm.quantite_apres) as avg_stock_level,
  SUM(sm.quantite * COALESCE(a.prix_unitaire::numeric, 0)) as movement_value
FROM stock_movements sm
JOIN articles a ON sm.article_id = a.id
WHERE sm.date_movement >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', sm.date_movement), sm.article_id, a.code_article, a.categorie
ORDER BY month DESC, a.code_article;

-- Supplier performance metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_supplier_performance AS
SELECT 
  s.id,
  s.nom,
  COUNT(r.id) as total_deliveries,
  AVG(EXTRACT(DAY FROM (r.date_reception - pr.date_demande))) as avg_delivery_days,
  SUM(r.quantite_recue * COALESCE(r.prix_unitaire::numeric, 0)) as total_value,
  COUNT(DISTINCT r.article_id) as unique_articles,
  MAX(r.date_reception) as last_delivery_date,
  NOW() as last_updated
FROM suppliers s
LEFT JOIN receptions r ON s.id = r.supplier_id
LEFT JOIN purchase_requests pr ON pr.id = (
  SELECT pri.purchase_request_id 
  FROM purchase_request_items pri 
  WHERE pri.article_id = r.article_id 
  AND pri.supplier_id = s.id 
  LIMIT 1
)
WHERE r.date_reception >= NOW() - INTERVAL '12 months'
GROUP BY s.id, s.nom;

-- Create indexes on materialized views
CREATE INDEX IF NOT EXISTS idx_mv_dashboard_stats_updated ON mv_dashboard_stats (last_updated);
CREATE INDEX IF NOT EXISTS idx_mv_monthly_evolution_month ON mv_monthly_stock_evolution (month, categorie);
CREATE INDEX IF NOT EXISTS idx_mv_supplier_perf_delivery ON mv_supplier_performance (avg_delivery_days, total_value);

-- 10. REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_stock_evolution;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_supplier_performance;
END;
$$;

-- 11. QUERY OPTIMIZATION HINTS
-- Enable JIT compilation for complex queries
SET jit = on;
SET jit_above_cost = 100000;

-- Optimize work memory for sorting and joins
-- SET work_mem = '256MB'; -- Adjust based on available RAM

-- Enable parallel query execution
-- SET max_parallel_workers_per_gather = 4;

-- 12. MONITORING QUERIES
-- Check index usage statistics
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Identify slow queries
-- SELECT query, mean_time, calls, total_time
-- FROM pg_stat_statements 
-- ORDER BY mean_time DESC 
-- LIMIT 10;

-- Check table sizes and index sizes
-- SELECT 
--   schemaname,
--   tablename,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
--   pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
--   pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
-- FROM pg_tables 
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Performance optimization complete!
-- Indexes created with CONCURRENTLY to avoid locking during creation
-- Materialized views provide pre-calculated metrics for dashboards
-- Full-text search enabled for advanced filtering
-- Query patterns optimized for the most common use cases