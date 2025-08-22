import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { initializeDatabase, db, sqlite3 } from "./db-local.js";

// Handle both ESM and CommonJS environments
const __filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const __dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.DESKTOP_PORT || '3001');

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS for desktop app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize database
const dbInitialized = initializeDatabase();
if (!dbInitialized) {
  console.error('Failed to initialize database');
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Desktop server running', 
    database: 'SQLite connected',
    dbPath: sqlite3.name
  });
});

// Basic CRUD endpoints for articles (example)
app.get('/api/articles', (req, res) => {
  try {
    const articles = sqlite3.prepare('SELECT * FROM articles ORDER BY created_at DESC').all();
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.post('/api/articles', (req, res) => {
  try {
    const { reference, designation, stock_quantity, min_stock, unit_price, supplier_id, category, location } = req.body;
    const stmt = sqlite3.prepare(`
      INSERT INTO articles (reference, designation, stock_quantity, min_stock, unit_price, supplier_id, category, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(reference, designation, stock_quantity || 0, min_stock || 0, unit_price || 0, supplier_id, category, location);
    
    const newArticle = sqlite3.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalArticles = sqlite3.prepare('SELECT COUNT(*) as count FROM articles').get();
    const lowStock = sqlite3.prepare('SELECT COUNT(*) as count FROM articles WHERE stock_quantity <= min_stock').get();
    const totalValue = sqlite3.prepare('SELECT SUM(stock_quantity * unit_price) as total FROM articles').get();
    
    res.json({
      totalArticles: totalArticles.count || 0,
      lowStock: lowStock.count || 0,
      totalValue: totalValue.total || 0,
      pendingRequests: 0 // Placeholder
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Serve static files in production - corrected path
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../dist/public');
  app.use(express.static(publicPath));
  
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(publicPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🖥️  Desktop server running on http://127.0.0.1:${PORT}`);
  console.log(`📁 Database path: ${sqlite3.name}`);
  console.log(`🚀 Mode: ${process.env.NODE_ENV || 'development'}`);
});

// Export for graceful shutdown
export default server;