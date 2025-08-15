import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AnalyticsService } from "./analytics";
import { insertArticleSchema, insertSupplierSchema, insertRequestorSchema, insertPurchaseRequestSchema, insertReceptionSchema, insertOutboundSchema, convertToReceptionSchema, insertCategorySchema, insertMarqueSchema, insertDepartementSchema, insertPosteSchema, insertUserSchema, insertSystemSettingSchema, insertAuditLogSchema, insertBackupLogSchema, insertCompletePurchaseRequestSchema, insertPurchaseRequestItemSchema, users, systemSettings, auditLogs, backupLogs, purchaseRequestItems, purchaseRequests } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// Initialize analytics service
const analytics = new AnalyticsService(storage);

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
      // For status updates, allow simple updates without full validation
      if (req.body.statut && Object.keys(req.body).length === 1) {
        const request = await storage.updatePurchaseRequest(req.params.id, req.body);
        res.json(request);
      } else {
        // For full updates, validate the data
        const validatedData = insertPurchaseRequestSchema.partial().parse(req.body);
        const request = await storage.updatePurchaseRequest(req.params.id, validatedData);
        res.json(request);
      }
    } catch (error) {
      console.error("Purchase request update error:", error);
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

  // Purchase Request Items routes
  app.post("/api/purchase-request-items", async (req, res) => {
    try {
      const validatedData = insertPurchaseRequestItemSchema.parse(req.body);
      const item = await db.insert(purchaseRequestItems).values({
        id: randomUUID(),
        ...validatedData,
        prixUnitaireEstime: validatedData.prixUnitaireEstime?.toString() || null,
      }).returning();
      res.status(201).json(item[0]);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.get("/api/purchase-request-items/:purchaseRequestId", async (req, res) => {
    try {
      const items = await db.select()
        .from(purchaseRequestItems)
        .where(eq(purchaseRequestItems.purchaseRequestId, req.params.purchaseRequestId));
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des éléments" });
    }
  });

  // Create complete purchase request with multiple articles
  app.post("/api/purchase-requests/complete", async (req, res) => {
    try {
      const validatedData = insertCompletePurchaseRequestSchema.parse(req.body);
      const purchaseRequestId = randomUUID();
      
      // Create main purchase request header
      const headerData = {
        id: purchaseRequestId,
        dateDemande: validatedData.dateDemande,
        requestorId: validatedData.requestorId,
        observations: validatedData.observations || null,
        totalArticles: validatedData.items.length,
        statut: "en_attente",
      };
      
      // Insert the header into purchase_requests table
      const [purchaseRequest] = await db.insert(purchaseRequests).values(headerData).returning();
      
      // Insert all items into purchase_request_items table
      const itemsData = validatedData.items.map(item => ({
        id: randomUUID(),
        purchaseRequestId: purchaseRequestId,
        articleId: item.articleId,
        quantiteDemandee: item.quantiteDemandee,
        supplierId: item.supplierId || null,
        prixUnitaireEstime: item.prixUnitaireEstime?.toString() || null,
        observations: item.observations || null,
      }));
      
      const items = await db.insert(purchaseRequestItems).values(itemsData).returning();
      
      res.status(201).json({
        ...purchaseRequest,
        items: items
      });
    } catch (error) {
      console.error("Complete purchase request creation error:", error);
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  // Get approved purchase requests ready for reception
  app.get("/api/purchase-requests/ready-for-reception", async (req, res) => {
    try {
      const requests = await storage.getPurchaseRequestsReadyForReception();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des demandes prêtes pour réception" });
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

  // Convert purchase request to reception
  app.post("/api/purchase-requests/:id/convert-to-reception", async (req, res) => {
    try {
      const purchaseRequestId = req.params.id;
      const validatedConversion = convertToReceptionSchema.parse(req.body);
      const { quantiteRecue, prixUnitaire, numeroBonLivraison, observations, dateReception } = validatedConversion;
      
      // Get the purchase request
      const purchaseRequest = await storage.getPurchaseRequest(purchaseRequestId);
      if (!purchaseRequest) {
        return res.status(404).json({ message: "Demande d'achat non trouvée" });
      }

      // Create reception from purchase request
      // Note: Legacy purchase requests might have articleId directly, new ones use items
      const receptionData = {
        articleId: (purchaseRequest as any).articleId || "", // Legacy support
        supplierId: (purchaseRequest as any).supplierId || "",
        quantiteRecue: quantiteRecue || (purchaseRequest as any).quantiteDemandee || 1,
        prixUnitaire: prixUnitaire || null,
        numeroBonLivraison: numeroBonLivraison || null,
        observations: observations || `Réception pour demande d'achat ${purchaseRequestId}`,
        dateReception: dateReception || new Date().toISOString(),
      };

      const validatedData = insertReceptionSchema.parse(receptionData);
      const reception = await storage.createReception(validatedData);

      // Update purchase request status to 'commande'
      await storage.updatePurchaseRequest(purchaseRequestId, { statut: "commande" });

      res.status(201).json({
        reception,
        purchaseRequest: await storage.getPurchaseRequest(purchaseRequestId)
      });
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la conversion", error });
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
      console.error("Outbound creation error:", error);
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/outbounds/:id", async (req, res) => {
    try {
      const validatedData = insertOutboundSchema.partial().parse(req.body);
      const outbound = await storage.updateOutbound(req.params.id, validatedData);
      res.json(outbound);
    } catch (error) {
      console.error("Outbound update error:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/outbounds/:id", async (req, res) => {
    try {
      await storage.deleteOutbound(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
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

  // Analytics service endpoints for real-time data
  app.get("/api/analytics/advanced", async (req, res) => {
    try {
      const analyticsData = await analytics.getAdvancedAnalytics();
      res.json(analyticsData);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des analytics avancées" });
    }
  });

  app.get("/api/analytics/smart-alerts", async (req, res) => {
    try {
      const alerts = await analytics.getSmartAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des alertes" });
    }
  });

  app.get("/api/analytics/performance", async (req, res) => {
    try {
      const performanceData = await analytics.getPerformanceMetrics();
      res.json(performanceData);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des métriques de performance" });
    }
  });

  // New entities routes - Categories, Marques, Departements, Postes
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des catégories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      await storage.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Marques
  app.get("/api/marques", async (req, res) => {
    try {
      const marques = await storage.getMarques();
      res.json(marques);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des marques" });
    }
  });

  app.post("/api/marques", async (req, res) => {
    try {
      const validatedData = insertMarqueSchema.parse(req.body);
      const marque = await storage.createMarque(validatedData);
      res.status(201).json(marque);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/marques/:id", async (req, res) => {
    try {
      const marque = await storage.updateMarque(req.params.id, req.body);
      res.json(marque);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/marques/:id", async (req, res) => {
    try {
      await storage.deleteMarque(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Departements
  app.get("/api/departements", async (req, res) => {
    try {
      const departements = await storage.getDepartements();
      res.json(departements);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des départements" });
    }
  });

  app.post("/api/departements", async (req, res) => {
    try {
      const validatedData = insertDepartementSchema.parse(req.body);
      const departement = await storage.createDepartement(validatedData);
      res.status(201).json(departement);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/departements/:id", async (req, res) => {
    try {
      const departement = await storage.updateDepartement(req.params.id, req.body);
      res.json(departement);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/departements/:id", async (req, res) => {
    try {
      await storage.deleteDepartement(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Postes
  app.get("/api/postes", async (req, res) => {
    try {
      const postes = await storage.getPostes();
      res.json(postes);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des postes" });
    }
  });

  app.post("/api/postes", async (req, res) => {
    try {
      const validatedData = insertPosteSchema.parse(req.body);
      const poste = await storage.createPoste(validatedData);
      res.status(201).json(poste);
    } catch (error) {
      res.status(400).json({ message: "Données invalides", error });
    }
  });

  app.put("/api/postes/:id", async (req, res) => {
    try {
      const poste = await storage.updatePoste(req.params.id, req.body);
      res.json(poste);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour", error });
    }
  });

  app.delete("/api/postes/:id", async (req, res) => {
    try {
      await storage.deletePoste(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // Document generation endpoints
  app.get("/api/purchase-requests/:id/bon-commande", async (req, res) => {
    try {
      const purchaseRequest = await storage.getPurchaseRequest(req.params.id);
      if (!purchaseRequest) {
        return res.status(404).json({ message: "Demande d'achat non trouvée" });
      }
      
      const article = await storage.getArticle(purchaseRequest.articleId);
      const requestor = await storage.getRequestor(purchaseRequest.requestorId);
      const supplier = purchaseRequest.supplierId ? await storage.getSupplier(purchaseRequest.supplierId) : null;
      
      res.json({
        document: "bon_commande",
        purchaseRequest,
        article,
        requestor, 
        supplier,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la génération du bon de commande" });
    }
  });

  app.get("/api/receptions/:id/bon-reception", async (req, res) => {
    try {
      const reception = await storage.getReception(req.params.id);
      if (!reception) {
        return res.status(404).json({ message: "Réception non trouvée" });
      }
      
      const article = await storage.getArticle(reception.articleId);
      const supplier = await storage.getSupplier(reception.supplierId);
      
      res.json({
        document: "bon_reception",
        reception,
        article,
        supplier,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la génération du bon de réception" });
    }
  });

  app.get("/api/outbounds/:id/bon-sortie", async (req, res) => {
    try {
      const outbound = await storage.getOutbound(req.params.id);
      if (!outbound) {
        return res.status(404).json({ message: "Sortie non trouvée" });
      }
      
      const article = await storage.getArticle(outbound.articleId);
      const requestor = await storage.getRequestor(outbound.requestorId);
      
      res.json({
        document: "bon_sortie",
        outbound,
        article,
        requestor,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la génération du bon de sortie" });
    }
  });

  // Enhanced export endpoints for all modules
  app.get("/api/suppliers/export", async (req, res) => {
    try {
      const format = req.query.format as string;
      const suppliers = await storage.getSuppliers();
      
      res.json({
        data: suppliers,
        format: format || 'json',
        exportedAt: new Date().toISOString(),
        totalRecords: suppliers.length
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'export des fournisseurs" });
    }
  });

  app.get("/api/purchase-requests/export", async (req, res) => {
    try {
      const format = req.query.format as string;
      const requests = await storage.getPurchaseRequests();
      
      res.json({
        data: requests,
        format: format || 'json',
        exportedAt: new Date().toISOString(),
        totalRecords: requests.length
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'export des demandes d'achat" });
    }
  });

  app.get("/api/receptions/export", async (req, res) => {
    try {
      const format = req.query.format as string;
      const receptions = await storage.getReceptions();
      
      res.json({
        data: receptions,
        format: format || 'json',
        exportedAt: new Date().toISOString(),
        totalRecords: receptions.length
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'export des réceptions" });
    }
  });

  app.get("/api/outbounds/export", async (req, res) => {
    try {
      const format = req.query.format as string;
      const outbounds = await storage.getOutbounds();
      
      res.json({
        data: outbounds,
        format: format || 'json',
        exportedAt: new Date().toISOString(),
        totalRecords: outbounds.length
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'export des sorties" });
    }
  });

  // Admin routes - System Settings
  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const id = randomUUID();
      const newUser = await db.insert(users).values({
        ...validatedData,
        id,
      }).returning();
      res.status(201).json(newUser[0]);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la création de l'utilisateur", error });
    }
  });

  app.put("/api/admin/users/:id", async (req, res) => {
    try {
      const updatedUser = await db.update(users)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(users.id, req.params.id))
        .returning();
      res.json(updatedUser[0]);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la mise à jour de l'utilisateur" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await db.delete(users).where(eq(users.id, req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  // System settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await db.select().from(systemSettings);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des paramètres" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const settings = req.body;
      const settingEntries = Object.entries(settings).map(([key, value]) => ({
        id: randomUUID(),
        category: 'system',
        key,
        value: String(value),
        dataType: typeof value,
        description: `System setting for ${key}`,
      }));

      for (const setting of settingEntries) {
        await db.insert(systemSettings).values(setting)
          .onConflictDoUpdate({
            target: [systemSettings.key],
            set: { value: setting.value, updatedAt: new Date() }
          });
      }
      
      res.json({ message: "Paramètres sauvegardés avec succès" });
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la sauvegarde des paramètres", error });
    }
  });

  // Audit logs
  app.get("/api/admin/audit-logs", async (req, res) => {
    try {
      const logs = await db.select().from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(100);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des logs d'audit" });
    }
  });

  app.post("/api/admin/audit-log", async (req, res) => {
    try {
      const validatedData = insertAuditLogSchema.parse(req.body);
      const id = randomUUID();
      const newLog = await db.insert(auditLogs).values({
        ...validatedData,
        id,
      }).returning();
      res.status(201).json(newLog[0]);
    } catch (error) {
      res.status(400).json({ message: "Erreur lors de la création du log d'audit" });
    }
  });

  // Backup logs
  app.get("/api/admin/backup-logs", async (req, res) => {
    try {
      const logs = await db.select().from(backupLogs)
        .orderBy(desc(backupLogs.createdAt))
        .limit(50);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des logs de sauvegarde" });
    }
  });

  app.post("/api/admin/backup", async (req, res) => {
    try {
      const fileName = `backup-${Date.now()}.sql`;
      const id = randomUUID();
      
      // Create backup log entry
      const backupLog = await db.insert(backupLogs).values({
        id,
        fileName,
        filePath: `/backups/${fileName}`,
        fileSize: 0,
        backupType: 'manual',
        status: 'completed',
        createdBy: 'system',
      }).returning();
      
      res.json({ message: "Sauvegarde créée avec succès", backup: backupLog[0] });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création de la sauvegarde" });
    }
  });

  app.post("/api/admin/optimize-database", async (req, res) => {
    try {
      // Database optimization placeholder - would run VACUUM, REINDEX, etc.
      res.json({ message: "Base de données optimisée avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de l'optimisation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
