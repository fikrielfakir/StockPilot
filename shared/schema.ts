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

// Users and Authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  hashedPassword: text("hashed_password").notNull(),
  role: text("role").notNull().default("demandeur"), // admin, super_admin, magasinier, demandeur, read_only
  isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = inactive
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Settings
export const systemSettings = pgTable("system_settings", {
  id: varchar("id").primaryKey(),
  category: text("category").notNull(), // stock_management, security, backup, etc.
  key: text("key").notNull(),
  value: text("value"),
  dataType: text("data_type").notNull().default("string"), // string, number, boolean, json
  description: text("description"),
  isEditable: integer("is_editable").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id"),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  entityType: text("entity_type"), // articles, suppliers, etc.
  entityId: varchar("entity_id"),
  oldValues: text("old_values"), // JSON string
  newValues: text("new_values"), // JSON string
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Backup Logs
export const backupLogs = pgTable("backup_logs", {
  id: varchar("id").primaryKey(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"), // bytes
  backupType: text("backup_type").notNull(), // manual, scheduled
  status: text("status").notNull().default("in_progress"), // in_progress, completed, failed
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  stockActuel: true,
}).extend({
  prixUnitaire: z.coerce.number().nullable().optional(),
  fournisseurId: z.coerce.string().nullable().optional(),
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

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
});

// New schemas for admin settings
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertBackupLogSchema = createInsertSchema(backupLogs).omit({
  id: true,
  createdAt: true,
});

// Schema for converting purchase request to reception
export const convertToReceptionSchema = z.object({
  quantiteRecue: z.number().positive().optional(),
  prixUnitaire: z.coerce.number().nullable().optional(),
  numeroBonLivraison: z.string().optional(),
  observations: z.string().optional(),
  dateReception: z.string().optional(),
});

export type ConvertToReception = z.infer<typeof convertToReceptionSchema>;

// New tables for categories, brands, departments, and positions
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  nom: text("nom").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marques = pgTable("marques", {
  id: varchar("id").primaryKey(),
  nom: text("nom").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const departements = pgTable("departements", {
  id: varchar("id").primaryKey(),
  nom: text("nom").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postes = pgTable("postes", {
  id: varchar("id").primaryKey(),
  nom: text("nom").notNull().unique(),
  departementId: varchar("departement_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for new tables
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertMarqueSchema = createInsertSchema(marques).omit({
  id: true,
  createdAt: true,
});

export const insertDepartementSchema = createInsertSchema(departements).omit({
  id: true,
  createdAt: true,
});

export const insertPosteSchema = createInsertSchema(postes).omit({
  id: true,
  createdAt: true,
});

// Types for new tables
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Marque = typeof marques.$inferSelect;
export type InsertMarque = z.infer<typeof insertMarqueSchema>;

export type Departement = typeof departements.$inferSelect;
export type InsertDepartement = z.infer<typeof insertDepartementSchema>;

export type Poste = typeof postes.$inferSelect;
export type InsertPoste = z.infer<typeof insertPosteSchema>;
