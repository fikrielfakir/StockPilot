import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Shield, 
  Bell, 
  Database, 
  Zap,
  Users,
  FileText,
  Globe,
  Smartphone,
  Eye,
  Clock,
  Save,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";

interface AppSettings {
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  language: string;
  density: 'compact' | 'comfortable' | 'spacious';
  accentColor: string;
  fontSize: number;
  animations: boolean;
  
  // Functionality
  autoSave: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: boolean;
  soundEffects: boolean;
  confirmActions: boolean;
  
  // Data & Performance
  cacheSize: number;
  offlineMode: boolean;
  dataValidation: boolean;
  performanceMode: 'standard' | 'optimized' | 'maximum';
  
  // Security
  sessionTimeout: number;
  autoLogout: boolean;
  auditLogging: boolean;
  twoFactorAuth: boolean;
  
  // Advanced
  developerMode: boolean;
  debugMode: boolean;
  apiTimeout: number;
  maxRetries: number;
}

interface SettingsProps {
  onClose?: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>({
    // Appearance defaults
    theme: 'light',
    language: 'fr',
    density: 'comfortable',
    accentColor: '#3B82F6',
    fontSize: 14,
    animations: true,
    
    // Functionality defaults
    autoSave: true,
    autoRefresh: true,
    refreshInterval: 30,
    notifications: true,
    soundEffects: false,
    confirmActions: true,
    
    // Data & Performance defaults
    cacheSize: 100,
    offlineMode: true,
    dataValidation: true,
    performanceMode: 'standard',
    
    // Security defaults
    sessionTimeout: 60,
    autoLogout: true,
    auditLogging: true,
    twoFactorAuth: false,
    
    // Advanced defaults
    developerMode: false,
    debugMode: false,
    apiTimeout: 10000,
    maxRetries: 3
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('stockceramique-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme based on system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply accent color
    root.style.setProperty('--primary', settings.accentColor);
    
    // Apply font size
    root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
    
    // Apply density
    const densityMap = {
      compact: '0.75rem',
      comfortable: '1rem',
      spacious: '1.25rem'
    };
    root.style.setProperty('--spacing-unit', densityMap[settings.density]);
    
    // Apply animations
    if (!settings.animations) {
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.setProperty('--animation-duration', '0.2s');
    }
  }, [settings.theme, settings.accentColor, settings.fontSize, settings.density, settings.animations]);

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('stockceramique-settings', JSON.stringify(settings));
    setHasChanges(false);
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos préférences ont été enregistrées avec succès",
    });
  };

  const resetSettings = () => {
    if (window.confirm("Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?")) {
      localStorage.removeItem('stockceramique-settings');
      window.location.reload();
    }
  };

  const exportSettings = async () => {
    setIsExporting(true);
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'stockceramique-settings.json';
      link.click();
      
      URL.revokeObjectURL(url);
      toast({
        title: "Paramètres exportés",
        description: "Le fichier de configuration a été téléchargé",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings(prev => ({ ...prev, ...imported }));
        setHasChanges(true);
        toast({
          title: "Paramètres importés",
          description: "Configuration restaurée avec succès",
        });
      } catch (error) {
        toast({
          title: "Erreur d'import",
          description: "Fichier de configuration invalide",
          variant: "destructive",
        });
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.readAsText(file);
  };

  const accentColors = [
    { name: 'Bleu', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Violet', value: '#8B5CF6' },
    { name: 'Rose', value: '#EC4899' },
    { name: 'Vert', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Rouge', value: '#EF4444' },
    { name: 'Gris', value: '#6B7280' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-sm flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Paramètres</h2>
                <p className="text-sm text-gray-600">Personnalisez votre expérience StockCéramique</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="secondary" className="text-orange-600 bg-orange-50">
                  Modifications non sauvegardées
                </Badge>
              )}
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)]">
          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
              <TabsTrigger value="appearance" className="text-xs sm:text-sm">
                <Palette className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Apparence</span>
                <span className="sm:hidden">App</span>
              </TabsTrigger>
              <TabsTrigger value="functionality" className="text-xs sm:text-sm">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Fonctions</span>
                <span className="sm:hidden">Fn</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs sm:text-sm">
                <Database className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Données</span>
                <span className="sm:hidden">Data</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs sm:text-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sécurité</span>
                <span className="sm:hidden">Sec</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs sm:text-sm">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Alertes</span>
                <span className="sm:hidden">Alert</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs sm:text-sm">
                <SettingsIcon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Avancé</span>
                <span className="sm:hidden">Adv</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              <WindowsCard>
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Personnalisation Visuelle</h3>
                </div>
                <WindowsCardContent className="p-6 space-y-6">
                  {/* Theme */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <Label className="text-sm font-medium">Thème</Label>
                      <Select value={settings.theme} onValueChange={(value: any) => updateSetting('theme', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="auto">Automatique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Langue</Label>
                      <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="de">Deutsch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Density */}
                  <div>
                    <Label className="text-sm font-medium">Densité d'affichage</Label>
                    <Select value={settings.density} onValueChange={(value: any) => updateSetting('density', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Confortable</SelectItem>
                        <SelectItem value="spacious">Spacieux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Accent Colors */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Couleur d'accent</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                      {accentColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => updateSetting('accentColor', color.value)}
                          className={`p-2 sm:p-3 rounded-lg border-2 flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 transition-all ${
                            settings.accentColor === color.value 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-xs sm:text-sm truncate">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <Label className="text-sm font-medium">Taille de police: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={(value) => updateSetting('fontSize', value[0])}
                      max={20}
                      min={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Animations */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Animations</Label>
                      <p className="text-xs text-gray-600">Active les transitions et animations</p>
                    </div>
                    <Switch
                      checked={settings.animations}
                      onCheckedChange={(checked) => updateSetting('animations', checked)}
                    />
                  </div>
                </WindowsCardContent>
              </WindowsCard>
            </TabsContent>

            <TabsContent value="functionality" className="space-y-6">
              <WindowsCard>
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Comportement de l'Application</h3>
                </div>
                <WindowsCardContent className="p-6 space-y-6">
                  {/* Auto Save */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Sauvegarde automatique</Label>
                      <p className="text-xs text-gray-600">Sauvegarde automatiquement vos modifications</p>
                    </div>
                    <Switch
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                    />
                  </div>

                  {/* Auto Refresh */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Actualisation automatique</Label>
                      <p className="text-xs text-gray-600">Met à jour les données automatiquement</p>
                    </div>
                    <Switch
                      checked={settings.autoRefresh}
                      onCheckedChange={(checked) => updateSetting('autoRefresh', checked)}
                    />
                  </div>

                  {/* Refresh Interval */}
                  {settings.autoRefresh && (
                    <div>
                      <Label className="text-sm font-medium">Intervalle de rafraîchissement: {settings.refreshInterval}s</Label>
                      <Slider
                        value={[settings.refreshInterval]}
                        onValueChange={(value) => updateSetting('refreshInterval', value[0])}
                        max={300}
                        min={10}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {/* Confirm Actions */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Confirmer les actions</Label>
                      <p className="text-xs text-gray-600">Demande confirmation pour les actions importantes</p>
                    </div>
                    <Switch
                      checked={settings.confirmActions}
                      onCheckedChange={(checked) => updateSetting('confirmActions', checked)}
                    />
                  </div>

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Effets sonores</Label>
                      <p className="text-xs text-gray-600">Sons pour les notifications et actions</p>
                    </div>
                    <Switch
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
                    />
                  </div>
                </WindowsCardContent>
              </WindowsCard>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <WindowsCard>
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Gestion des Données</h3>
                </div>
                <WindowsCardContent className="p-6 space-y-6">
                  {/* Performance Mode */}
                  <div>
                    <Label className="text-sm font-medium">Mode de performance</Label>
                    <Select value={settings.performanceMode} onValueChange={(value: any) => updateSetting('performanceMode', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="optimized">Optimisé</SelectItem>
                        <SelectItem value="maximum">Performance maximale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cache Size */}
                  <div>
                    <Label className="text-sm font-medium">Taille du cache: {settings.cacheSize}MB</Label>
                    <Slider
                      value={[settings.cacheSize]}
                      onValueChange={(value) => updateSetting('cacheSize', value[0])}
                      max={1000}
                      min={50}
                      step={50}
                      className="mt-2"
                    />
                  </div>

                  {/* Offline Mode */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Mode hors ligne</Label>
                      <p className="text-xs text-gray-600">Permet l'utilisation sans connexion internet</p>
                    </div>
                    <Switch
                      checked={settings.offlineMode}
                      onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
                    />
                  </div>

                  {/* Data Validation */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Validation des données</Label>
                      <p className="text-xs text-gray-600">Vérifie la cohérence des données saisies</p>
                    </div>
                    <Switch
                      checked={settings.dataValidation}
                      onCheckedChange={(checked) => updateSetting('dataValidation', checked)}
                    />
                  </div>
                </WindowsCardContent>
              </WindowsCard>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <WindowsCard>
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Sécurité et Confidentialité</h3>
                </div>
                <WindowsCardContent className="p-6 space-y-6">
                  {/* Session Timeout */}
                  <div>
                    <Label className="text-sm font-medium">Délai d'expiration de session: {settings.sessionTimeout} min</Label>
                    <Slider
                      value={[settings.sessionTimeout]}
                      onValueChange={(value) => updateSetting('sessionTimeout', value[0])}
                      max={480}
                      min={15}
                      step={15}
                      className="mt-2"
                    />
                  </div>

                  {/* Auto Logout */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Déconnexion automatique</Label>
                      <p className="text-xs text-gray-600">Se déconnecte après inactivité</p>
                    </div>
                    <Switch
                      checked={settings.autoLogout}
                      onCheckedChange={(checked) => updateSetting('autoLogout', checked)}
                    />
                  </div>

                  {/* Audit Logging */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Journalisation d'audit</Label>
                      <p className="text-xs text-gray-600">Enregistre toutes les actions utilisateur</p>
                    </div>
                    <Switch
                      checked={settings.auditLogging}
                      onCheckedChange={(checked) => updateSetting('auditLogging', checked)}
                    />
                  </div>

                  {/* Two Factor Auth */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Authentification à deux facteurs</Label>
                      <p className="text-xs text-gray-600">Sécurité renforcée pour la connexion</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                    />
                  </div>
                </WindowsCardContent>
              </WindowsCard>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <WindowsCard>
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications et Alertes</h3>
                </div>
                <WindowsCardContent className="p-6 space-y-6">
                  {/* Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Notifications</Label>
                      <p className="text-xs text-gray-600">Active les notifications système</p>
                    </div>
                    <Switch
                      checked={settings.notifications}
                      onCheckedChange={(checked) => updateSetting('notifications', checked)}
                    />
                  </div>

                  {settings.notifications && (
                    <Alert>
                      <Bell className="h-4 w-4" />
                      <AlertDescription>
                        Les notifications vous aideront à rester informé des alertes de stock bas, 
                        des demandes d'achat en attente et des échéances importantes.
                      </AlertDescription>
                    </Alert>
                  )}
                </WindowsCardContent>
              </WindowsCard>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <WindowsCard>
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Paramètres Avancés</h3>
                </div>
                <WindowsCardContent className="p-6 space-y-6">
                  {/* API Timeout */}
                  <div>
                    <Label className="text-sm font-medium">Délai d'attente API: {settings.apiTimeout}ms</Label>
                    <Slider
                      value={[settings.apiTimeout]}
                      onValueChange={(value) => updateSetting('apiTimeout', value[0])}
                      max={30000}
                      min={5000}
                      step={1000}
                      className="mt-2"
                    />
                  </div>

                  {/* Max Retries */}
                  <div>
                    <Label className="text-sm font-medium">Nombre maximum de tentatives: {settings.maxRetries}</Label>
                    <Slider
                      value={[settings.maxRetries]}
                      onValueChange={(value) => updateSetting('maxRetries', value[0])}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Developer Mode */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Mode développeur</Label>
                      <p className="text-xs text-gray-600">Active les outils de développement</p>
                    </div>
                    <Switch
                      checked={settings.developerMode}
                      onCheckedChange={(checked) => updateSetting('developerMode', checked)}
                    />
                  </div>

                  {/* Debug Mode */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Mode debug</Label>
                      <p className="text-xs text-gray-600">Affiche les informations de débogage</p>
                    </div>
                    <Switch
                      checked={settings.debugMode}
                      onCheckedChange={(checked) => updateSetting('debugMode', checked)}
                    />
                  </div>

                  {/* Import/Export */}
                  <div className="pt-4 border-t border-gray-200">
                    <Label className="text-sm font-medium mb-3 block">Sauvegarde et Restauration</Label>
                    <div className="flex space-x-3">
                      <Button
                        onClick={exportSettings}
                        disabled={isExporting}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span>Exporter</span>
                      </Button>
                      
                      <div className="relative">
                        <Button
                          disabled={isImporting}
                          variant="outline"
                          className="flex items-center space-x-2"
                          onClick={() => document.getElementById('import-settings')?.click()}
                        >
                          {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          <span>Importer</span>
                        </Button>
                        <input
                          id="import-settings"
                          type="file"
                          accept=".json"
                          onChange={importSettings}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </WindowsCardContent>
              </WindowsCard>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <div className="flex space-x-3 order-2 sm:order-1">
              <Button
                onClick={resetSettings}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                Réinitialiser
              </Button>
            </div>
            <div className="flex space-x-3 order-1 sm:order-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                onClick={saveSettings}
                disabled={!hasChanges}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Sauvegarder</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}