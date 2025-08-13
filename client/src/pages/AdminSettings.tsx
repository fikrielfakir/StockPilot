import { useState, useEffect } from "react";
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
  Settings, 
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
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  lastLogin?: string;
  createdAt: string;
}

interface BackupLog {
  id: string;
  fileName: string;
  filePath: string;
  status: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  createdAt: string;
}

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("stock");
  const [settings, setSettings] = useState<SystemSettings>({
    globalMinimumStock: 10,
    autoReorderThreshold: 5,
    defaultUnit: 'pcs',
    trackExpiration: false,
    passwordComplexity: true,
    sessionTimeout: 60,
    twoFactorAuth: false,
    databaseEncryption: false,
    autoBackupEnabled: true,
    backupFrequency: 'weekly',
    backupRetentionDays: 30,
    backupLocation: 'local',
    companyName: 'StockCéramique',
    companyLogo: '',
    currency: 'MAD',
    dateFormat: 'dd/mm/yyyy',
    language: 'fr',
    theme: 'light',
    auditLogging: true,
    logRetentionDays: 90,
    barcodeScanning: false,
    apiKeysEnabled: false,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: activeTab === "users"
  });

  const { data: auditLogs = [], isLoading: auditLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit-logs"],
    enabled: activeTab === "audit"
  });

  const { data: backupLogs = [], isLoading: backupsLoading } = useQuery<BackupLog[]>({
    queryKey: ["/api/admin/backup-logs"],
    enabled: activeTab === "backup"
  });

  const saveSettings = useMutation({
    mutationFn: async (newSettings: SystemSettings) => {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Paramètres sauvegardés avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  });

  const createBackup = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/backup", { method: "POST" });
      if (!response.ok) throw new Error("Failed to create backup");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sauvegarde créée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/backup-logs"] });
    },
    onError: () => {
      toast({ title: "Erreur lors de la sauvegarde", variant: "destructive" });
    }
  });

  const optimizeDatabase = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/optimize-database", { method: "POST" });
      if (!response.ok) throw new Error("Failed to optimize database");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Base de données optimisée" });
    }
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Administration Système</h1>
          <p className="text-gray-600 dark:text-gray-400">Gestion complète des paramètres système</p>
        </div>
        <Button onClick={() => saveSettings.mutate(settings)} disabled={saveSettings.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {saveSettings.isPending ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Sauvegardes
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Système
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Gestion du Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seuil minimum global</Label>
                  <Input 
                    type="number" 
                    value={settings.globalMinimumStock}
                    onChange={(e) => setSettings(prev => ({ ...prev, globalMinimumStock: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Seuil de réapprovisionnement automatique</Label>
                  <Input 
                    type="number" 
                    value={settings.autoReorderThreshold}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoReorderThreshold: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unité par défaut</Label>
                  <Select value={settings.defaultUnit} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultUnit: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pièces</SelectItem>
                      <SelectItem value="kg">Kilogrammes</SelectItem>
                      <SelectItem value="m">Mètres</SelectItem>
                      <SelectItem value="l">Litres</SelectItem>
                      <SelectItem value="cartons">Cartons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={settings.trackExpiration}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, trackExpiration: checked }))}
                  />
                  <Label>Suivi des dates d'expiration</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Utilisateurs du système</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Ajouter un utilisateur</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Nouvel utilisateur</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nom d'utilisateur</Label>
                            <Input placeholder="username" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" placeholder="email@example.com" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Rôle</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrateur</SelectItem>
                              <SelectItem value="magasinier">Magasinier</SelectItem>
                              <SelectItem value="demandeur">Demandeur</SelectItem>
                              <SelectItem value="read_only">Lecture seule</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Annuler</Button>
                          <Button>Créer</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="border rounded-lg">
                  <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 font-semibold">
                    <div>Utilisateur</div>
                    <div>Email</div>
                    <div>Rôle</div>
                    <div>Statut</div>
                    <div>Actions</div>
                  </div>
                  {usersLoading ? (
                    <div className="p-8 text-center text-gray-500">Chargement des utilisateurs...</div>
                  ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Aucun utilisateur trouvé</div>
                  ) : (
                    users.map((user: AdminUser) => (
                      <div key={user.id} className="grid grid-cols-5 gap-4 p-4 border-t">
                        <div className="font-medium">{user.username}</div>
                        <div>{user.email}</div>
                        <div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant={user.isActive ? 'default' : 'destructive'}>
                            {user.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Modifier</Button>
                          <Button size="sm" variant="destructive">Supprimer</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Configuration des sauvegardes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={settings.autoBackupEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackupEnabled: checked }))}
                  />
                  <Label>Sauvegardes automatiques</Label>
                </div>
                
                <div className="space-y-2">
                  <Label>Fréquence des sauvegardes</Label>
                  <Select 
                    value={settings.backupFrequency} 
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setSettings(prev => ({ ...prev, backupFrequency: value }))}
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
                
                <div className="space-y-2">
                  <Label>Rétention (jours): {settings.backupRetentionDays}</Label>
                  <Slider 
                    value={[settings.backupRetentionDays]} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, backupRetentionDays: value[0] }))}
                    max={365}
                    min={7}
                    step={1}
                  />
                </div>
                
                <Button 
                  onClick={() => createBackup.mutate()} 
                  disabled={createBackup.isPending}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {createBackup.isPending ? "Création..." : "Créer une sauvegarde maintenant"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique des sauvegardes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {backupsLoading ? (
                    <div className="text-center text-gray-500">Chargement...</div>
                  ) : backupLogs.length === 0 ? (
                    <div className="text-center text-gray-500">Aucune sauvegarde trouvée</div>
                  ) : (
                    backupLogs.map((backup: BackupLog) => (
                      <div key={backup.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <div className="font-medium">{backup.fileName}</div>
                          <div className="text-sm text-gray-500">{backup.createdAt}</div>
                        </div>
                        <Badge variant={backup.status === 'completed' ? 'default' : 'destructive'}>
                          {backup.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Informations de l'entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de l'entreprise</Label>
                  <Input 
                    value={settings.companyName}
                    onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select value={settings.currency} onValueChange={(value: 'MAD' | 'EUR' | 'USD') => setSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAD">Dirham Marocain (MAD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar US (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Format de date</Label>
                  <Select value={settings.dateFormat} onValueChange={(value: any) => setSettings(prev => ({ ...prev, dateFormat: value }))}>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préférences d'affichage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Langue</Label>
                  <Select value={settings.language} onValueChange={(value: 'fr' | 'ar' | 'en') => setSettings(prev => ({ ...prev, language: value }))}>
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
                
                <div className="space-y-2">
                  <Label>Thème</Label>
                  <Select value={settings.theme} onValueChange={(value: any) => setSettings(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="auto">Automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Paramètres de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={settings.passwordComplexity}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, passwordComplexity: checked }))}
                    />
                    <Label>Complexité des mots de passe</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                    />
                    <Label>Authentification à deux facteurs</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={settings.databaseEncryption}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, databaseEncryption: checked }))}
                    />
                    <Label>Chiffrement de la base de données</Label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Timeout de session (minutes): {settings.sessionTimeout}</Label>
                    <Slider 
                      value={[settings.sessionTimeout]} 
                      onValueChange={(value) => setSettings(prev => ({ ...prev, sessionTimeout: value[0] }))}
                      max={480}
                      min={5}
                      step={5}
                    />
                  </div>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  Les modifications de sécurité prendront effet après la prochaine connexion des utilisateurs.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Journal d'audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={settings.auditLogging}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auditLogging: checked }))}
                    />
                    <Label>Activer l'audit des activités</Label>
                  </div>
                  <Button variant="outline">Exporter les logs</Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Rétention des logs (jours): {settings.logRetentionDays}</Label>
                  <Slider 
                    value={[settings.logRetentionDays]} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, logRetentionDays: value[0] }))}
                    max={365}
                    min={30}
                    step={1}
                  />
                </div>
                
                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-800 font-semibold text-sm">
                    <div>Utilisateur</div>
                    <div>Action</div>
                    <div>Entité</div>
                    <div>Date</div>
                  </div>
                  {auditLoading ? (
                    <div className="p-8 text-center text-gray-500">Chargement...</div>
                  ) : auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Aucun log d'audit</div>
                  ) : (
                    auditLogs.slice(0, 10).map((log: AuditLog) => (
                      <div key={log.id} className="grid grid-cols-4 gap-4 p-3 border-t text-sm">
                        <div>{log.userId || 'Système'}</div>
                        <div>{log.action}</div>
                        <div>{log.entityType}</div>
                        <div>{log.createdAt}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Outils de maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => optimizeDatabase.mutate()} 
                  disabled={optimizeDatabase.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {optimizeDatabase.isPending ? "Optimisation..." : "Optimiser la base de données"}
                </Button>
                
                <Button className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recalculer les stocks
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vider le cache
                </Button>
                
                <Button className="w-full" variant="outline">
                  <Server className="w-4 h-4 mr-2" />
                  Tester la configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intégrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={settings.barcodeScanning}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, barcodeScanning: checked }))}
                  />
                  <Label>Scanner de codes-barres/QR</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={settings.apiKeysEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, apiKeysEnabled: checked }))}
                  />
                  <Label>API pour intégrations externes</Label>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Gérer les clés API
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}