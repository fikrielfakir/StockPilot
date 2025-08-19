import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "../shared/schema.js";
import path from 'path';
import fs from 'fs';

// Get user data directory for SQLite database
const getUserDataPath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'data');
  }
  
  // For production desktop app - use a standard data directory
  return path.join(process.cwd(), 'data');
};

// Ensure data directory exists
const dataDir = getUserDataPath();
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'stockceramique.db');

// Create SQLite database connection
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with schema
export const initializeDatabase = () => {
  try {
    console.log('Initializing local SQLite database...');
    console.log('Database path:', dbPath);
    
    // Run schema creation directly since we don't have migrations for SQLite
    const schemaSQL = `
      -- Articles table
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        designation TEXT NOT NULL,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        min_stock INTEGER NOT NULL DEFAULT 0,
        unit_price REAL NOT NULL DEFAULT 0,
        supplier_id INTEGER,
        category TEXT,
        location TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

      -- Suppliers table
      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Requestors table
      CREATE TABLE IF NOT EXISTS requestors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        department TEXT,
        email TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      -- Purchase Requests table
      CREATE TABLE IF NOT EXISTS purchase_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestor_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        total_amount REAL NOT NULL DEFAULT 0,
        notes TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (requestor_id) REFERENCES requestors(id)
      );

      -- Purchase Request Items table
      CREATE TABLE IF NOT EXISTS purchase_request_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_request_id INTEGER NOT NULL,
        article_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        supplier_id INTEGER,
        FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES articles(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

      -- Receptions table
      CREATE TABLE IF NOT EXISTS receptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_request_id INTEGER,
        supplier_id INTEGER NOT NULL,
        delivery_note TEXT,
        total_amount REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending',
        received_at INTEGER DEFAULT (unixepoch()),
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
      );

      -- Reception Items table
      CREATE TABLE IF NOT EXISTS reception_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reception_id INTEGER NOT NULL,
        article_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        FOREIGN KEY (reception_id) REFERENCES receptions(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES articles(id)
      );

      -- Outbounds table
      CREATE TABLE IF NOT EXISTS outbounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requestor_id INTEGER NOT NULL,
        total_quantity INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (requestor_id) REFERENCES requestors(id)
      );

      -- Outbound Items table
      CREATE TABLE IF NOT EXISTS outbound_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        outbound_id INTEGER NOT NULL,
        article_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (outbound_id) REFERENCES outbounds(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES articles(id)
      );

      -- Stock Movements table
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reference_id INTEGER,
        reference_type TEXT,
        notes TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (article_id) REFERENCES articles(id)
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_articles_reference ON articles(reference);
      CREATE INDEX IF NOT EXISTS idx_articles_supplier ON articles(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_article ON stock_movements(article_id);
      CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(type);
      CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
      CREATE INDEX IF NOT EXISTS idx_receptions_status ON receptions(status);
    `;

    // Execute schema creation
    sqlite.exec(schemaSQL);
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
};

// Export sqlite connection for direct queries if needed
export const sqlite3 = sqlite;

// Graceful shutdown
process.on('exit', () => {
  sqlite.close();
});

process.on('SIGINT', () => {
  sqlite.close();
  process.exit(0);
});