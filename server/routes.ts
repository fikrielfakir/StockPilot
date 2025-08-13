import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertSupplierSchema, insertRequestorSchema, insertPurchaseRequestSchema, insertReceptionSchema, insertOutboundSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'article" });
    }
  });

  app.post("/api/articles", async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      const article = await storage.createArticle(validatedData);
      res.status(201).json(article);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.updateArticle(req.params.id, req.body);
      res.json(article);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/articles/:id", async (req, res) => {
    try {
      await storage.deleteArticle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  app.get("/api/articles/low-stock", async (req, res) => {
    try {
      const lowStockArticles = await storage.getLowStockArticles();
      if (!lowStockArticles || lowStockArticles.length === 0) {
        return res.json([]);
      }
      res.json(lowStockArticles);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des articles en stock bas" });
    }
  });

  // Bulk import articles
  app.post("/api/articles/bulk-import", async (req, res) => {
    try {
      const { data } = req.body;
      const results = {
        success: 0,
        errors: [] as Array<{ row: number; error: string; data: any }>,
        total: data.length
      };

      for (let index = 0; index < data.length; index++) {
        try {
          const item = data[index];
          const validated = insertArticleSchema.parse({
            ...item,
            stockActuel: item.stockInitial || 0,
          });
          await storage.createArticle(validated);
          results.success++;
        } catch (error) {
          results.errors.push({
            row: index + 1,
            error: error instanceof Error ? error.message : 'Erreur de validation',
            data: data[index]
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error bulk importing articles:", error);
      res.status(500).json({ message: "Erreur lors de l'import en masse" });
    }
  });

  // Export articles
  app.get("/api/articles/export", async (req, res) => {
    try {
      const format = req.query.format as string;
      const articles = await storage.getArticles();
      
      if (format === 'csv') {
        const csvData = articles.map(article => ({
          codeArticle: article.codeArticle,
          designation: article.designation,
          categorie: article.categorie,
          marque: article.marque || '',
          reference: article.reference || '',
          stockActuel: article.stockActuel,
          unite: article.unite,
          prixUnitaire: article.prixUnitaire || 0,
          seuilMinimum: article.seuilMinimum,
          fournisseurId: article.fournisseurId || ''
        }));
        
        // Simple CSV generation
        const headers = Object.keys(csvData[0] || {});
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => headers.map(header => 
            typeof row[header as keyof typeof row] === 'string' 
              ? `"${row[header as keyof typeof row]}"`
              : row[header as keyof typeof row]
          ).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=articles.csv');
        res.send(csvContent);
      } else if (format === 'pdf') {
        // Simple PDF response - in real app you'd use jsPDF or similar
        const pdfContent = `Articles Export\n\nTotal: ${articles.length} articles\n\n${
          articles.map(a => `${a.codeArticle}: ${a.designation} (Stock: ${a.stockActuel})`).join('\n')
        }`;
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=articles.txt');
        res.send(pdfContent);
      } else {
        res.status(400).json({ message: "Format non supporté" });
      }
    } catch (error) {
      console.error("Error exporting articles:", error);
      res.status(500).json({ message: "Erreur lors de l'export" });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des fournisseurs" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(req.params.id, req.body);
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      await storage.deleteSupplier(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Bulk import suppliers
  app.post("/api/suppliers/bulk-import", async (req, res) => {
    try {
      const { data } = req.body;
      const results = {
        success: 0,
        errors: [] as Array<{ row: number; error: string; data: any }>,
        total: data.length
      };

      for (let index = 0; index < data.length; index++) {
        try {
          const item = data[index];
          const validated = insertSupplierSchema.parse(item);
          await storage.createSupplier(validated);
          results.success++;
        } catch (error) {
          results.errors.push({
            row: index + 1,
            error: error instanceof Error ? error.message : 'Erreur de validation',
            data: data[index]
          });
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Error bulk importing suppliers:", error);
      res.status(500).json({ message: "Erreur lors de l'import en masse" });
    }
  });

  // Export suppliers
  app.get("/api/suppliers/export", async (req, res) => {
    try {
      const format = req.query.format as string;
      const suppliers = await storage.getSuppliers();
      
      if (format === 'csv') {
        const csvData = suppliers.map(supplier => ({
          nom: supplier.nom,
          contact: supplier.contact || '',
          telephone: supplier.telephone || '',
          email: supplier.email || '',
          adresse: supplier.adresse || '',
          conditionsPaiement: supplier.conditionsPaiement || '',
          delaiLivraison: supplier.delaiLivraison || 0
        }));
        
        const headers = Object.keys(csvData[0] || {});
        const csvContent = [
          headers.join(','),
          ...csvData.map(row => headers.map(header => 
            typeof row[header as keyof typeof row] === 'string' 
              ? `"${row[header as keyof typeof row]}"`
              : row[header as keyof typeof row]
          ).join(','))
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=suppliers.csv');
        res.send(csvContent);
      } else if (format === 'pdf') {
        const pdfContent = `Suppliers Export\n\nTotal: ${suppliers.length} suppliers\n\n${
          suppliers.map(s => `${s.nom}: ${s.contact} (${s.telephone})`).join('\n')
        }`;
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', 'attachment; filename=suppliers.txt');
        res.send(pdfContent);
      } else {
        res.status(400).json({ message: "Format non supporté" });
      }
    } catch (error) {
      console.error("Error exporting suppliers:", error);
      res.status(500).json({ message: "Erreur lors de l'export" });
    }
  });

  // Requestors routes
  app.get("/api/requestors", async (req, res) => {
    try {
      const requestors = await storage.getRequestors();
      res.json(requestors);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des demandeurs" });
    }
  });

  app.post("/api/requestors", async (req, res) => {
    try {
      const validatedData = insertRequestorSchema.parse(req.body);
      const requestor = await storage.createRequestor(validatedData);
      res.status(201).json(requestor);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/requestors/:id", async (req, res) => {
    try {
      const requestor = await storage.updateRequestor(req.params.id, req.body);
      res.json(requestor);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/requestors/:id", async (req, res) => {
    try {
      await storage.deleteRequestor(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Purchase Requests routes
  app.get("/api/purchase-requests", async (req, res) => {
    try {
      const requests = await storage.getPurchaseRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des demandes d'achat" });
    }
  });

  app.post("/api/purchase-requests", async (req, res) => {
    try {
      const validatedData = insertPurchaseRequestSchema.parse(req.body);
      const request = await storage.createPurchaseRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/purchase-requests/:id", async (req, res) => {
    try {
      const request = await storage.updatePurchaseRequest(req.params.id, req.body);
      res.json(request);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/purchase-requests/:id", async (req, res) => {
    try {
      await storage.deletePurchaseRequest(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Receptions routes
  app.get("/api/receptions", async (req, res) => {
    try {
      const receptions = await storage.getReceptions();
      res.json(receptions);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des réceptions" });
    }
  });

  app.post("/api/receptions", async (req, res) => {
    try {
      const validatedData = insertReceptionSchema.parse(req.body);
      const reception = await storage.createReception(validatedData);
      res.status(201).json(reception);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  // Outbounds routes
  app.get("/api/outbounds", async (req, res) => {
    try {
      const outbounds = await storage.getOutbounds();
      res.json(outbounds);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des sorties" });
    }
  });

  app.post("/api/outbounds", async (req, res) => {
    try {
      const validatedData = insertOutboundSchema.parse(req.body);
      const outbound = await storage.createOutbound(validatedData);
      res.status(201).json(outbound);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  // Stock movements
  app.get("/api/stock-movements", async (req, res) => {
    try {
      const articleId = req.query.articleId as string;
      const movements = await storage.getStockMovements(articleId);
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des mouvements" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
  });

  // Chart data endpoints
  app.get("/api/dashboard/stock-evolution", async (req, res) => {
    try {
      const data = await storage.getStockEvolutionData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'évolution du stock" });
    }
  });

  app.get("/api/dashboard/purchase-status", async (req, res) => {
    try {
      const data = await storage.getPurchaseStatusData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du statut des achats" });
    }
  });

  app.get("/api/dashboard/category-distribution", async (req, res) => {
    try {
      const data = await storage.getCategoryDistributionData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de la distribution par catégorie" });
    }
  });

  app.get("/api/dashboard/recent-movements", async (req, res) => {
    try {
      const data = await storage.getRecentMovementsData();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des mouvements récents" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
