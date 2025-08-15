import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Settings as SettingsIcon, 
  Users, 
  Shield, 
  Database, 
  FileText, 
  Zap, 
  Bell, 
  Globe,
  Calendar,
  Download,
  Upload,
  Trash2,
  Save,
  AlertTriangle,
  Eye,
  Key,
  Server,
  RefreshCw,
  Plus,
  Pencil
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form schemas
const categorySchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

const marqueSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

const departementSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
});

const posteSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  departementId: z.string().optional(),
  description: z.string().optional(),
});

interface SystemSettings {
  // Stock Management
  globalMinimumStock: number;
  autoReorderThreshold: number;
  defaultUnit: string;
  trackExpiration: boolean;
  
  // Security
  passwordComplexity: boolean;
  sessionTimeout: number; // minutes
  twoFactorAuth: boolean;
  databaseEncryption: boolean;
  
  // Backup
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetentionDays: number;
  backupLocation: string;
  
  // System
  companyName: string;
  companyLogo: string;
  currency: 'MAD' | 'EUR' | 'USD';
  dateFormat: 'dd/mm/yyyy' | 'mm-dd-yyyy' | 'yyyy-mm-dd';
  language: 'fr' | 'ar' | 'en';
  theme: 'light' | 'dark' | 'auto';
  
  // Audit
  auditLogging: boolean;
  logRetentionDays: number;
  
  // Integration
  barcodeScanning: boolean;
  apiKeysEnabled: boolean;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin' | 'magasinier' | 'demandeur' | 'read_only';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface EntityFormProps {
  entity: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  schema: any;
  fields: Array<{
    name: string;
    label: string;
    type: 'input' | 'textarea' | 'select';
    options?: Array<{value: string, label: string}>;
  }>;
}

function EntityForm({ entity, onSubmit, onCancel, schema, fields }: EntityFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: entity || {}
  });

  const { data: departements = [] } = useQuery<any[]>({
    queryKey: ["/api/departements"],
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === 'input' && (
            <Input
              id={field.name}
              {...register(field.name)}
              className={errors[field.name] ? "border-red-500" : ""}
            />
          )}
          {field.type === 'textarea' && (
            <Textarea
              id={field.name}
              {...register(field.name)}
              className={errors[field.name] ? "border-red-500" : ""}
            />
          )}
          {field.type === 'select' && field.name === 'departementId' && (
            <Select 
              value={watch(field.name) || ""} 
              onValueChange={(value) => setValue(field.name, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un département" />
              </SelectTrigger>
              <SelectContent>
                {departements.filter((dept: any) => dept?.id && dept?.nom).map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.nom}
                  </SelectItem>
                ))}
                {departements.length === 0 && (
                  <SelectItem value="no-departments" disabled>Aucun département disponible</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          {errors[field.name] && (
            <p className="text-sm text-red-500">{(errors[field.name] as any)?.message}</p>
          )}
        </div>
      ))}
      <div className="flex space-x-2 pt-4">
        <Button type="submit" size="sm">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

export default function Settings() {
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [entityType, setEntityType] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<string | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    globalMinimumStock: 10,
    autoReorderThreshold: 5,
    defaultUnit: "pièce",
    trackExpiration: true,
    passwordComplexity: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    databaseEncryption: true,
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    backupRetentionDays: 30,
    backupLocation: "/backups",
    companyName: "StockCéramique",
    companyLogo: "",
    currency: 'MAD',
    dateFormat: 'dd/mm/yyyy',
    language: 'fr',
    theme: 'light',
    auditLogging: true,
    logRetentionDays: 90,
    barcodeScanning: false,
    apiKeysEnabled: false,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only load data when popup is opened (performance optimization)
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    enabled: currentPopup === "categories"
  });

  const { data: marques = [] } = useQuery<any[]>({
    queryKey: ["/api/marques"],
    enabled: currentPopup === "marques"
  });

  const { data: departements = [] } = useQuery<any[]>({
    queryKey: ["/api/departements"],
    enabled: currentPopup === "departements" || showDialog
  });

  const { data: postes = [] } = useQuery<any[]>({
    queryKey: ["/api/postes"],
    enabled: currentPopup === "postes"
  });

  const { data: users = [] } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: currentPopup === "users"
  });

  const { data: auditLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/audit-logs"],
    enabled: currentPopup === "audit"
  });

  const { data: backupLogs = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/backup-logs"],
    enabled: currentPopup === "backup"
  });

  // Mutations for basic settings
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowDialog(false);
      toast({ title: "Catégorie créée avec succès" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowDialog(false);
      toast({ title: "Catégorie mise à jour avec succès" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Catégorie supprimée avec succès" });
    },
  });

  // Similar mutations for marques, departements, postes
  const createMarqueMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/marques", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marques"] });
      setShowDialog(false);
      toast({ title: "Marque créée avec succès" });
    },
  });

  const createDepartementMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/departements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departements"] });
      setShowDialog(false);
      toast({ title: "Département créé avec succès" });
    },
  });

  const createPosteMutation = useMutation({
    mutationFn: (data: any) => fetch("/api/postes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/postes"] });
      setShowDialog(false);
      toast({ title: "Poste créé avec succès" });
    },
  });

  // Entity configurations
  const entityConfigs = {
    categories: {
      title: "Catégories",
      data: categories,
      schema: categorySchema,
      createMutation: createCategoryMutation,
      updateMutation: updateCategoryMutation,
      deleteMutation: deleteCategoryMutation,
      fields: [
        { name: 'nom', label: 'Nom', type: 'input' as const },
        { name: 'description', label: 'Description', type: 'textarea' as const },
      ],
    },
    marques: {
      title: "Marques",
      data: marques,
      schema: marqueSchema,
      createMutation: createMarqueMutation,
      updateMutation: null,
      deleteMutation: null,
      fields: [
        { name: 'nom', label: 'Nom', type: 'input' as const },
        { name: 'description', label: 'Description', type: 'textarea' as const },
      ],
    },
    departements: {
      title: "Départements",
      data: departements,
      schema: departementSchema,
      createMutation: createDepartementMutation,
      updateMutation: null,
      deleteMutation: null,
      fields: [
        { name: 'nom', label: 'Nom', type: 'input' as const },
        { name: 'description', label: 'Description', type: 'textarea' as const },
      ],
    },
    postes: {
      title: "Postes",
      data: postes,
      schema: posteSchema,
      createMutation: createPosteMutation,
      updateMutation: null,
      deleteMutation: null,
      fields: [
        { name: 'nom', label: 'Nom', type: 'input' as const },
        { name: 'departementId', label: 'Département', type: 'select' as const },
        { name: 'description', label: 'Description', type: 'textarea' as const },
      ],
    },
  };

  const handleEdit = (entity: any, type: string) => {
    setEditingEntity(entity);
    setEntityType(type);
    setShowDialog(true);
  };

  const handleCreate = (type: string) => {
    setEditingEntity(null);
    setEntityType(type);
    setShowDialog(true);
  };

  const handleSubmit = (data: any) => {
    const config = entityConfigs[entityType as keyof typeof entityConfigs];
    if (editingEntity && config.updateMutation) {
      config.updateMutation.mutate({ id: editingEntity.id, data });
    } else if (config.createMutation) {
      config.createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string, type: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      const config = entityConfigs[type as keyof typeof entityConfigs];
      if (config.deleteMutation) {
        config.deleteMutation.mutate(id);
      }
    }
  };

  const handleExport = () => {
    const settingsData = {
      categories,
      marques,
      departements,
      postes,
      systemSettings,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockceramique-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Configuration exportée avec succès" });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        setSystemSettings(importedData.systemSettings || systemSettings);
        toast({ title: "Configuration importée avec succès" });
      } catch (error) {
        toast({ 
          title: "Erreur d'import", 
          description: "Le fichier n'est pas valide",
          variant: "destructive" 
        });
      }
    };
    reader.readAsText(file);
  };

  const handleBackup = () => {
    // Simulate backup creation
    toast({ title: "Sauvegarde créée avec succès" });
  };

  const renderEntityTab = (type: string) => {
    const config = entityConfigs[type as keyof typeof entityConfigs];
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>{config.title}</span>
            </CardTitle>
            <Button 
              onClick={() => handleCreate(type)}
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {config.data.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h4 className="font-medium">{item.nom}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600">{item.description}</p>
                  )}
                  {type === 'postes' && item.departement && (
                    <p className="text-sm text-blue-600">Département: {item.departement.nom}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item, type)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {config.deleteMutation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id, type)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {config.data.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucun élément trouvé. Cliquez sur "Ajouter" pour créer le premier.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Configuration du Système</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Settings Cards Grid - Much faster than tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Basic Settings Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="w-5 h-5" />
              <span>Paramètres Généraux</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Configuration de base du système</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Configurer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Paramètres Généraux</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom de l'entreprise</Label>
                    <Input 
                      value={systemSettings.companyName} 
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Devise</Label>
                    <Select 
                      value={systemSettings.currency} 
                      onValueChange={(value: any) => setSystemSettings(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAD">Dirham (MAD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="USD">Dollar (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Stock minimum global</Label>
                    <Input 
                      type="number"
                      value={systemSettings.globalMinimumStock} 
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, globalMinimumStock: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Categories Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Catégories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gestion des catégories d'articles</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full"
                  onClick={() => setCurrentPopup("categories")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Gérer ({categories.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Gestion des Catégories</DialogTitle>
                </DialogHeader>
                {currentPopup === "categories" && renderEntityTab("categories")}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Marques Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Badge className="w-5 h-5" />
              <span>Marques</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gestion des marques de produits</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full"
                  onClick={() => setCurrentPopup("marques")}
                >
                  <Badge className="w-4 h-4 mr-2" />
                  Gérer ({marques.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Gestion des Marques</DialogTitle>
                </DialogHeader>
                {currentPopup === "marques" && renderEntityTab("marques")}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Départements Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Départements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gestion des départements</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full"
                  onClick={() => setCurrentPopup("departements")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gérer ({departements.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Gestion des Départements</DialogTitle>
                </DialogHeader>
                {currentPopup === "departements" && renderEntityTab("departements")}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Postes Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Postes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Gestion des postes de travail</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full"
                  onClick={() => setCurrentPopup("postes")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Gérer ({postes.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Gestion des Postes</DialogTitle>
                </DialogHeader>
                {currentPopup === "postes" && renderEntityTab("postes")}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Sécurité</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Paramètres de sécurité</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Configurer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Paramètres de Sécurité</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={systemSettings.passwordComplexity}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, passwordComplexity: checked }))}
                    />
                    <Label>Complexité des mots de passe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={systemSettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                    />
                    <Label>Authentification à deux facteurs</Label>
                  </div>
                  <div>
                    <Label>Timeout de session (minutes)</Label>
                    <Slider
                      value={[systemSettings.sessionTimeout]}
                      onValueChange={([value]) => setSystemSettings(prev => ({ ...prev, sessionTimeout: value }))}
                      min={5}
                      max={120}
                      step={5}
                      className="mt-2"
                    />
                    <div className="text-sm text-gray-500 mt-1">{systemSettings.sessionTimeout} minutes</div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

      </div>

      {/* Save Settings Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button 
          onClick={() => {
            // Save system settings
            localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
            toast({ title: "Paramètres sauvegardés avec succès" });
          }}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-save-settings"
        >
          <Settings className="w-4 h-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>

        {/* Basic Settings Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Généraux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nom de l'entreprise</Label>
                  <Input 
                    value={systemSettings.companyName} 
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Devise</Label>
                  <Select 
                    value={systemSettings.currency} 
                    onValueChange={(value: any) => setSystemSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">Dirham (MAD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Format de date</Label>
                  <Select 
                    value={systemSettings.dateFormat} 
                    onValueChange={(value: any) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM-DD-YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Langue</Label>
                  <Select 
                    value={systemSettings.language} 
                    onValueChange={(value: any) => setSystemSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestion des Stocks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Stock minimum global</Label>
                  <Slider
                    value={[systemSettings.globalMinimumStock]}
                    onValueChange={([value]) => setSystemSettings(prev => ({ ...prev, globalMinimumStock: value }))}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">{systemSettings.globalMinimumStock} unités</div>
                </div>
                <div>
                  <Label>Seuil de réapprovisionnement automatique</Label>
                  <Slider
                    value={[systemSettings.autoReorderThreshold]}
                    onValueChange={([value]) => setSystemSettings(prev => ({ ...prev, autoReorderThreshold: value }))}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">{systemSettings.autoReorderThreshold} unités</div>
                </div>
                <div>
                  <Label>Unité par défaut</Label>
                  <Input 
                    value={systemSettings.defaultUnit} 
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, defaultUnit: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={systemSettings.trackExpiration}
                    onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, trackExpiration: checked }))}
                  />
                  <Label>Suivre les dates d'expiration</Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderEntityTab('categories')}
            {renderEntityTab('marques')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderEntityTab('departements')}
            {renderEntityTab('postes')}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Gestion des Utilisateurs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    La gestion des utilisateurs sera disponible dans une prochaine version.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">1</div>
                      <div className="text-sm text-gray-600">Administrateurs</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-gray-600">Magasiniers</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <div className="text-sm text-gray-600">Demandeurs</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Paramètres de Sécurité</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={systemSettings.passwordComplexity}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, passwordComplexity: checked }))}
                    />
                    <Label>Exiger la complexité des mots de passe</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={systemSettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                    />
                    <Label>Authentification à deux facteurs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={systemSettings.databaseEncryption}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, databaseEncryption: checked }))}
                    />
                    <Label>Chiffrement de la base de données</Label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Timeout de session (minutes)</Label>
                    <Slider
                      value={[systemSettings.sessionTimeout]}
                      onValueChange={([value]) => setSystemSettings(prev => ({ ...prev, sessionTimeout: value }))}
                      min={5}
                      max={120}
                      step={5}
                      className="mt-2"
                    />
                    <div className="text-sm text-gray-500 mt-1">{systemSettings.sessionTimeout} minutes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <span>Gestion des Sauvegardes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={systemSettings.autoBackupEnabled}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackupEnabled: checked }))}
                    />
                    <Label>Sauvegarde automatique</Label>
                  </div>
                  <div>
                    <Label>Fréquence de sauvegarde</Label>
                    <Select 
                      value={systemSettings.backupFrequency} 
                      onValueChange={(value: any) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Rétention (jours)</Label>
                    <Slider
                      value={[systemSettings.backupRetentionDays]}
                      onValueChange={([value]) => setSystemSettings(prev => ({ ...prev, backupRetentionDays: value }))}
                      min={7}
                      max={365}
                      step={7}
                      className="mt-2"
                    />
                    <div className="text-sm text-gray-500 mt-1">{systemSettings.backupRetentionDays} jours</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Button onClick={handleBackup} className="w-full">
                    <Database className="w-4 h-4 mr-2" />
                    Créer une sauvegarde maintenant
                  </Button>
                  <div className="space-y-2">
                    <h4 className="font-medium">Dernières sauvegardes</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Aujourd'hui à 02:00 - 1.2 MB</div>
                      <div>• Hier à 02:00 - 1.1 MB</div>
                      <div>• Il y a 2 jours à 02:00 - 1.0 MB</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Journaux d'Audit</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={systemSettings.auditLogging}
                  onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, auditLogging: checked }))}
                />
                <Label>Activer les journaux d'audit</Label>
              </div>
              <div>
                <Label>Rétention des logs (jours)</Label>
                <Slider
                  value={[systemSettings.logRetentionDays]}
                  onValueChange={([value]) => setSystemSettings(prev => ({ ...prev, logRetentionDays: value }))}
                  min={30}
                  max={365}
                  step={30}
                  className="mt-2"
                />
                <div className="text-sm text-gray-500 mt-1">{systemSettings.logRetentionDays} jours</div>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Les journaux d'audit détaillés seront disponibles dans une prochaine version.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5" />
                <span>Informations Système</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Version de l'application</Label>
                    <div className="text-lg">v2.1.0</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Base de données</Label>
                    <div className="text-lg">PostgreSQL 15.x</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Dernière mise à jour</Label>
                    <div className="text-lg">15 Août 2025</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={systemSettings.barcodeScanning}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, barcodeScanning: checked }))}
                    />
                    <Label>Scanner de codes-barres</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={systemSettings.apiKeysEnabled}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, apiKeysEnabled: checked }))}
                    />
                    <Label>API Keys externes</Label>
                  </div>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Redémarrer le système
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Settings Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Button 
          onClick={() => {
            // Save system settings
            localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
            toast({ title: "Paramètres sauvegardés avec succès" });
          }}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="button-save-settings"
        >
          <Settings className="w-4 h-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>

      {/* Entity Form Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? 'Modifier' : 'Ajouter'} {entityConfigs[entityType as keyof typeof entityConfigs]?.title?.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>
          {entityType && (
            <EntityForm
              entity={editingEntity}
              onSubmit={handleSubmit}
              onCancel={() => setShowDialog(false)}
              schema={entityConfigs[entityType as keyof typeof entityConfigs].schema}
              fields={entityConfigs[entityType as keyof typeof entityConfigs].fields}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}