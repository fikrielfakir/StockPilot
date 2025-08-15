import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Printer,
  Database,
  FileText,
  Save
} from "lucide-react";

interface UserProfile {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  
  // Preferences
  defaultView: string;
  itemsPerPage: number;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  
  // Workflow
  defaultSupplier: string;
  defaultRequestor: string;
  autoApprovalLimit: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Display
  showPrices: boolean;
  showStock: boolean;
  compactMode: boolean;
  showThumbnails: boolean;
  
  // Reports
  defaultReportFormat: string;
  includeImages: boolean;
  watermark: boolean;
}

interface UserPreferencesProps {
  onClose?: () => void;
}

export default function UserPreferences({ onClose }: UserPreferencesProps) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    // Personal Info defaults
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Logistique',
    role: 'Gestionnaire de Stock',
    
    // Preferences defaults
    defaultView: 'grid',
    itemsPerPage: 25,
    defaultCurrency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: 'fr-FR',
    
    // Workflow defaults
    defaultSupplier: '',
    defaultRequestor: '',
    autoApprovalLimit: 1000,
    emailNotifications: true,
    smsNotifications: false,
    
    // Display defaults
    showPrices: true,
    showStock: true,
    compactMode: false,
    showThumbnails: true,
    
    // Reports defaults
    defaultReportFormat: 'PDF',
    includeImages: true,
    watermark: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  const updateProfile = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveProfile = () => {
    localStorage.setItem('stockceramique-user-profile', JSON.stringify(profile));
    setHasChanges(false);
    toast({
      title: "Profil sauvegardé",
      description: "Vos préférences utilisateur ont été enregistrées",
    });
  };

  const departments = [
    'Logistique',
    'Achats',
    'Production',
    'Maintenance',
    'Qualité',
    'Administration',
    'Direction'
  ];

  const roles = [
    'Gestionnaire de Stock',
    'Responsable Achats',
    'Technicien',
    'Superviseur',
    'Directeur',
    'Utilisateur'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-50 rounded-sm flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Préférences Utilisateur</h2>
            <p className="text-sm text-gray-600">Personnalisez votre profil et vos préférences de travail</p>
          </div>
        </div>
        {hasChanges && (
          <Badge variant="secondary" className="text-orange-600 bg-orange-50">
            Modifications non sauvegardées
          </Badge>
        )}
      </div>

      {/* Personal Information */}
      <WindowsCard>
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informations Personnelles
          </h3>
        </div>
        <WindowsCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => updateProfile('firstName', e.target.value)}
                placeholder="Votre prénom"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => updateProfile('lastName', e.target.value)}
                placeholder="Votre nom"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile('email', e.target.value)}
                  placeholder="votre.email@entreprise.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => updateProfile('phone', e.target.value)}
                  placeholder="01 23 45 67 89"
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="department">Département</Label>
              <Select value={profile.department} onValueChange={(value) => updateProfile('department', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={profile.role} onValueChange={(value) => updateProfile('role', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </WindowsCardContent>
      </WindowsCard>

      {/* Display Preferences */}
      <WindowsCard>
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Monitor className="w-5 h-5 mr-2" />
            Préférences d'Affichage
          </h3>
        </div>
        <WindowsCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Vue par défaut</Label>
              <Select value={profile.defaultView} onValueChange={(value) => updateProfile('defaultView', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grille</SelectItem>
                  <SelectItem value="list">Liste</SelectItem>
                  <SelectItem value="card">Cartes</SelectItem>
                  <SelectItem value="table">Tableau</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Éléments par page</Label>
              <Select 
                value={profile.itemsPerPage.toString()} 
                onValueChange={(value) => updateProfile('itemsPerPage', parseInt(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Afficher les prix</Label>
                <p className="text-xs text-gray-600">Montre les prix dans les listes d'articles</p>
              </div>
              <Switch
                checked={profile.showPrices}
                onCheckedChange={(checked) => updateProfile('showPrices', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Afficher le stock</Label>
                <p className="text-xs text-gray-600">Montre les quantités en stock</p>
              </div>
              <Switch
                checked={profile.showStock}
                onCheckedChange={(checked) => updateProfile('showStock', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Mode compact</Label>
                <p className="text-xs text-gray-600">Affichage plus dense pour économiser l'espace</p>
              </div>
              <Switch
                checked={profile.compactMode}
                onCheckedChange={(checked) => updateProfile('compactMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Afficher les miniatures</Label>
                <p className="text-xs text-gray-600">Montre les images d'aperçu des articles</p>
              </div>
              <Switch
                checked={profile.showThumbnails}
                onCheckedChange={(checked) => updateProfile('showThumbnails', checked)}
              />
            </div>
          </div>
        </WindowsCardContent>
      </WindowsCard>

      {/* Workflow Preferences */}
      <WindowsCard>
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Préférences de Workflow
          </h3>
        </div>
        <WindowsCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Monnaie par défaut</Label>
              <Select value={profile.defaultCurrency} onValueChange={(value) => updateProfile('defaultCurrency', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MAD">Dirham Marocain (MAD)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                  <SelectItem value="CHF">Franc Suisse (CHF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Format de date</Label>
              <Select value={profile.dateFormat} onValueChange={(value) => updateProfile('dateFormat', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="DD.MM.YYYY">DD.MM.YYYY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Format d'heure</Label>
              <Select value={profile.timeFormat} onValueChange={(value) => updateProfile('timeFormat', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 heures</SelectItem>
                  <SelectItem value="12h">12 heures (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Limite d'approbation automatique</Label>
              <Input
                type="number"
                value={profile.autoApprovalLimit}
                onChange={(e) => updateProfile('autoApprovalLimit', parseFloat(e.target.value))}
                className="mt-2"
                placeholder="1000"
              />
              <p className="text-xs text-gray-600 mt-1">Montant maximum pour approbation automatique (MAD)</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notifications email</Label>
                <p className="text-xs text-gray-600">Recevoir les alertes par email</p>
              </div>
              <Switch
                checked={profile.emailNotifications}
                onCheckedChange={(checked) => updateProfile('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Notifications SMS</Label>
                <p className="text-xs text-gray-600">Recevoir les alertes urgentes par SMS</p>
              </div>
              <Switch
                checked={profile.smsNotifications}
                onCheckedChange={(checked) => updateProfile('smsNotifications', checked)}
              />
            </div>
          </div>
        </WindowsCardContent>
      </WindowsCard>

      {/* Report Preferences */}
      <WindowsCard>
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Préférences de Rapports
          </h3>
        </div>
        <WindowsCardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Format par défaut</Label>
              <Select value={profile.defaultReportFormat} onValueChange={(value) => updateProfile('defaultReportFormat', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                  <SelectItem value="Word">Word</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Inclure les images</Label>
                <p className="text-xs text-gray-600">Ajouter les photos d'articles dans les rapports</p>
              </div>
              <Switch
                checked={profile.includeImages}
                onCheckedChange={(checked) => updateProfile('includeImages', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Filigrane</Label>
                <p className="text-xs text-gray-600">Ajouter un filigrane sur les documents</p>
              </div>
              <Switch
                checked={profile.watermark}
                onCheckedChange={(checked) => updateProfile('watermark', checked)}
              />
            </div>
          </div>
        </WindowsCardContent>
      </WindowsCard>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button 
          onClick={saveProfile}
          disabled={!hasChanges}
          className="flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Sauvegarder</span>
        </Button>
      </div>
    </div>
  );
}