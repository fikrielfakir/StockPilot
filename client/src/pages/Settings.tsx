import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Download,
  Upload,
  Plus,
  Pencil,
  Trash2,
  Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    enabled: fields.some(f => f.name === 'departementId')
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name}>
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === 'input' && (
            <Input
              {...register(field.name)}
              className={errors[field.name] ? 'border-red-500' : ''}
            />
          )}
          {field.type === 'textarea' && (
            <Textarea
              {...register(field.name)}
              className={errors[field.name] ? 'border-red-500' : ''}
            />
          )}
          {field.type === 'select' && field.name === 'departementId' && (
            <Select onValueChange={(value) => setValue(field.name, value)} defaultValue={entity?.[field.name]}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un département" />
              </SelectTrigger>
              <SelectContent>
                {departements.filter(dept => dept && dept.nom).map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors[field.name] && (
            <p className="text-sm text-red-500 mt-1">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
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

  // Entity configurations
  const entityConfigs = {
    categories: {
      title: "Catégories",
      data: categories,
      schema: categorySchema,
      fields: [
        { name: 'nom', label: 'Nom', type: 'input' as const },
        { name: 'description', label: 'Description', type: 'textarea' as const }
      ]
    },
    marques: {
      title: "Marques",
      data: marques,
      schema: marqueSchema,
      fields: [
        { name: 'nom', label: 'Nom', type: 'input' as const },
        { name: 'description', label: 'Description', type: 'textarea' as const }
      ]
    },
    departements: {
      title: "Départements",
      data: departements,
      schema: departementSchema,
      fields: [
        { name: 'nom', label: 'Nom', type: 'input' as const },
        { name: 'description', label: 'Description', type: 'textarea' as const }
      ]
    },
    postes: {
      title: "Postes",
      data: postes,
      schema: posteSchema,
      fields: [
        { name: 'nom', label: 'Nom', type: 'input' as const },
        { name: 'departementId', label: 'Département', type: 'select' as const },
        { name: 'description', label: 'Description', type: 'textarea' as const }
      ]
    }
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => fetch(`/api/${entityType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      setShowDialog(false);
      toast({ title: `${entityConfigs[entityType as keyof typeof entityConfigs]?.title?.slice(0, -1)} créé(e) avec succès` });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      fetch(`/api/${entityType}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      setShowDialog(false);
      toast({ title: `${entityConfigs[entityType as keyof typeof entityConfigs]?.title?.slice(0, -1)} mis(e) à jour avec succès` });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      fetch(`/api/${entityType}/${id}`, {
        method: "DELETE",
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      toast({ title: `${entityConfigs[entityType as keyof typeof entityConfigs]?.title?.slice(0, -1)} supprimé(e) avec succès` });
    },
  });

  const handleAdd = (type: string) => {
    setEntityType(type);
    setEditingEntity(null);
    setShowDialog(true);
  };

  const handleEdit = (type: string, entity: any) => {
    setEntityType(type);
    setEditingEntity(entity);
    setShowDialog(true);
  };

  const handleDelete = (type: string, id: string) => {
    setEntityType(type);
    if (confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingEntity) {
      updateMutation.mutate({ id: editingEntity.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleExport = () => {
    const dataToExport = {
      categories,
      marques,
      departements,
      postes,
      systemSettings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockceramique-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.systemSettings) {
          setSystemSettings(importedData.systemSettings);
          localStorage.setItem('systemSettings', JSON.stringify(importedData.systemSettings));
          toast({ title: "Paramètres importés avec succès" });
        }
      } catch (error) {
        toast({ title: "Erreur lors de l'importation", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const renderEntityTab = (type: string) => {
    const config = entityConfigs[type as keyof typeof entityConfigs];
    if (!config) return null;

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{config.title}</span>
          </CardTitle>
          <Button onClick={() => handleAdd(type)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {config.data.filter(item => item && item.nom).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{item.nom}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600">{item.description}</div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(type, item)}>
                    <Pencil className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(type, item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
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
          <SettingsIcon className="w-4 h-4 mr-2" />
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