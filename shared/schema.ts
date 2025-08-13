import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Articles (Spare Parts)
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey(),
  codeArticle: text("code_article").notNull().unique(),
  designation: text("designation").notNull(),
  categorie: text("categorie").notNull(),
  marque: text("marque"),
  reference: text("reference"),
  stockInitial: integer("stock_initial").notNull().default(0),
  stockActuel: integer("stock_actuel").notNull().default(0),
  unite: text("unite").notNull().default("pcs"),
  prixUnitaire: decimal("prix_unitaire", { precision: 10, scale: 2 }),
  seuilMinimum: integer("seuil_minimum").default(10),
  fournisseurId: varchar("fournisseur_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey(),
  nom: text("nom").notNull(),
  contact: text("contact"),
  telephone: text("telephone"),
  email: text("email"),
  adresse: text("adresse"),
  conditionsPaiement: text("conditions_paiement"),
  delaiLivraison: integer("delai_livraison"), // in days
  createdAt: timestamp("created_at").defaultNow(),
});

// Requestors
export const requestors = pgTable("requestors", {
  id: varchar("id").primaryKey(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  departement: text("departement").notNull(),
  poste: text("poste"),
  email: text("email"),
  telephone: text("telephone"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Purchase Requests
export const purchaseRequests = pgTable("purchase_requests", {
  id: varchar("id").primaryKey(),
  dateDemande: timestamp("date_demande").notNull().defaultNow(),
  requestorId: varchar("requestor_id").notNull(),
  articleId: varchar("article_id").notNull(),
  quantiteDemandee: integer("quantite_demandee").notNull(),
  dateInitiation: timestamp("date_initiation").defaultNow(),
  observations: text("observations"),
  statut: text("statut").notNull().default("en_attente"), // en_attente, approuve, refuse, commande
  supplierId: varchar("supplier_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goods Reception
export const receptions = pgTable("receptions", {
  id: varchar("id").primaryKey(),
  dateReception: timestamp("date_reception").notNull().defaultNow(),
  supplierId: varchar("supplier_id").notNull(),
  articleId: varchar("article_id").notNull(),
  quantiteRecue: integer("quantite_recue").notNull(),
  prixUnitaire: decimal("prix_unitaire", { precision: 10, scale: 2 }),
  numeroBonLivraison: text("numero_bon_livraison"),
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stock Outbound
export const outbounds = pgTable("outbounds", {
  id: varchar("id").primaryKey(),
  dateSortie: timestamp("date_sortie").notNull().defaultNow(),
  requestorId: varchar("requestor_id").notNull(),
  articleId: varchar("article_id").notNull(),
  quantiteSortie: integer("quantite_sortie").notNull(),
  motifSortie: text("motif_sortie").notNull(),
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Stock Movements (for history tracking)
export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey(),
  articleId: varchar("article_id").notNull(),
  type: text("type").notNull(), // entree, sortie
  quantite: integer("quantite").notNull(),
  quantiteAvant: integer("quantite_avant").notNull(),
  quantiteApres: integer("quantite_apres").notNull(),
  reference: text("reference"), // Reference to reception/outbound ID
  dateMovement: timestamp("date_movement").notNull().defaultNow(),
  description: text("description"),
});

// Insert schemas
export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  stockActuel: true,
}).extend({
  prixUnitaire: z.coerce.number().nullable().optional(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertRequestorSchema = createInsertSchema(requestors).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseRequestSchema = createInsertSchema(purchaseRequests).omit({
  id: true,
  createdAt: true,
  dateInitiation: true,
}).extend({
  supplierId: z.string().nullable().optional(),
  dateDemande: z.string().transform((str) => new Date(str)),
});

export const insertReceptionSchema = createInsertSchema(receptions).omit({
  id: true,
  createdAt: true,
}).extend({
  prixUnitaire: z.coerce.number().nullable().optional(),
  dateReception: z.string().transform((str) => new Date(str)),
});

export const insertOutboundSchema = createInsertSchema(outbounds).omit({
  id: true,
  createdAt: true,
}).extend({
  dateSortie: z.string().transform((str) => new Date(str)),
});

// Schema for converting purchase request to reception
export const convertToReceptionSchema = z.object({
  quantiteRecue: z.number().positive().optional(),
  prixUnitaire: z.coerce.number().nullable().optional(),
  numeroBonLivraison: z.string().optional(),
  observations: z.string().optional(),
  dateReception: z.string().optional(),
});

// Types
export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Requestor = typeof requestors.$inferSelect;
export type InsertRequestor = z.infer<typeof insertRequestorSchema>;

export type PurchaseRequest = typeof purchaseRequests.$inferSelect;
export type InsertPurchaseRequest = z.infer<typeof insertPurchaseRequestSchema>;

export type Reception = typeof receptions.$inferSelect;
export type InsertReception = z.infer<typeof insertReceptionSchema>;

export type Outbound = typeof outbounds.$inferSelect;
export type InsertOutbound = z.infer<typeof insertOutboundSchema>;

export type StockMovement = typeof stockMovements.$inferSelect;

export type ConvertToReception = z.infer<typeof convertToReceptionSchema>;
