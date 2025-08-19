import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, AlertTriangle, TrendingDown, Clock, Zap, X, Settings, Filter } from "lucide-react";
import { ToastManager } from "./ToastNotifications";

interface SmartAlert {
  id: string;
  type: 'stock' | 'price' | 'delivery' | 'maintenance' | 'budget' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: Date;
  affectedItems: string[];
  actionable: boolean;
  autoResolvable: boolean;
  estimatedImpact: {
    financial: number;
    operational: 'low' | 'medium' | 'high';
  };
  recommendedActions: Array<{
    action: string;
    priority: number;
    estimatedTime: string;
  }>;
  metadata: {
    source: 'ml_model' | 'rule_engine' | 'user_defined' | 'external_api';
    confidence: number;
    relatedAlerts: string[];
  };
}

interface SmartAlertsProps {
  alerts?: SmartAlert[];
  onAlertAction?: (alertId: string, action: string) => void;
  onAlertDismiss?: (alertId: string) => void;
  autoResolve?: boolean;
  maxAlertsShown?: number;
}

export function SmartAlerts({ 
  alerts = [], 
  onAlertAction, 
  onAlertDismiss,
  autoResolve = false,
  maxAlertsShown = 10
}: SmartAlertsProps) {
  const [filteredAlerts, setFilteredAlerts] = useState<SmartAlert[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Mock alerts for demonstration
  const mockAlerts: SmartAlert[] = [
    {
      id: 'alert-001',
      type: 'stock',
      severity: 'critical',
      title: 'Stock critique: Joint d\'étanchéité JOINT-ETANCH-001',
      description: 'Stock actuel: 3 unités (seuil: 10). Rupture prévue dans 2 jours.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      affectedItems: ['JOINT-ETANCH-001'],
      actionable: true,
      autoResolvable: true,
      estimatedImpact: {
        financial: 2500,
        operational: 'high'
      },
      recommendedActions: [
        { action: 'Commande urgente', priority: 1, estimatedTime: '2h' },
        { action: 'Contact fournisseur express', priority: 2, estimatedTime: '30min' },
        { action: 'Vérification stock alternatif', priority: 3, estimatedTime: '1h' }
      ],
      metadata: {
        source: 'ml_model',
        confidence: 0.94,
        relatedAlerts: ['alert-003']
      }
    },
    {
      id: 'alert-002',
      type: 'price',
      severity: 'medium',
      title: 'Augmentation de prix détectée',
      description: 'Le prix du roulement BR-205 a augmenté de 15% chez TechCeramics Pro.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      affectedItems: ['ROULEMENT-BR-205'],
      actionable: true,
      autoResolvable: false,
      estimatedImpact: {
        financial: 800,
        operational: 'low'
      },
      recommendedActions: [
        { action: 'Rechercher fournisseurs alternatifs', priority: 1, estimatedTime: '4h' },
        { action: 'Négocier nouveau prix', priority: 2, estimatedTime: '2h' }
      ],
      metadata: {
        source: 'external_api',
        confidence: 0.87,
        relatedAlerts: []
      }
    },
    {
      id: 'alert-003',
      type: 'maintenance',
      severity: 'high',
      title: 'Maintenance prédictive: Équipement ligne 2',
      description: 'Consommation anormale de pièces détectée. Maintenance recommandée.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      affectedItems: ['Ligne production 2'],
      actionable: true,
      autoResolvable: false,
      estimatedImpact: {
        financial: 5000,
        operational: 'high'
      },
      recommendedActions: [
        { action: 'Planifier maintenance', priority: 1, estimatedTime: '1 jour' },
        { action: 'Commander pièces préventives', priority: 2, estimatedTime: '2h' }
      ],
      metadata: {
        source: 'ml_model',
        confidence: 0.91,
        relatedAlerts: ['alert-001']
      }
    },
    {
      id: 'alert-004',
      type: 'delivery',
      severity: 'medium',
      title: 'Retard de livraison probable',
      description: 'Commande #CMD-2025-0156 risque un retard de 3 jours.',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      affectedItems: ['CMD-2025-0156'],
      actionable: true,
      autoResolvable: false,
      estimatedImpact: {
        financial: 300,
        operational: 'medium'
      },
      recommendedActions: [
        { action: 'Contacter transporteur', priority: 1, estimatedTime: '30min' },
        { action: 'Ajuster planning production', priority: 2, estimatedTime: '1h' }
      ],
      metadata: {
        source: 'rule_engine',
        confidence: 0.78,
        relatedAlerts: []
      }
    },
    {
      id: 'alert-005',
      type: 'budget',
      severity: 'medium',
      title: 'Dépassement budgétaire prévu',
      description: 'Budget mensuel à 85%. Dépassement prévu dans 5 jours.',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      affectedItems: ['Budget Avril 2025'],
      actionable: true,
      autoResolvable: false,
      estimatedImpact: {
        financial: 1200,
        operational: 'low'
      },
      recommendedActions: [
        { action: 'Réviser achats planifiés', priority: 1, estimatedTime: '2h' },
        { action: 'Reporter achats non-critiques', priority: 2, estimatedTime: '1h' }
      ],
      metadata: {
        source: 'rule_engine',
        confidence: 0.83,
        relatedAlerts: []
      }
    }
  ];

  const alertData = alerts.length > 0 ? alerts : mockAlerts;

  useEffect(() => {
    let filtered = alertData;

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    // Sort by severity and timestamp
    filtered = filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setFilteredAlerts(filtered.slice(0, maxAlertsShown));
  }, [alertData, selectedSeverity, selectedType, maxAlertsShown]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Bell className="h-4 w-4 text-yellow-600" />;
      case 'low': return <Bell className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock': return '📦';
      case 'price': return '💰';
      case 'delivery': return '🚚';
      case 'maintenance': return '🔧';
      case 'budget': return '📊';
      case 'anomaly': return '⚠️';
      default: return '🔔';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const handleAlertAction = (alertId: string, action: string) => {
    if (onAlertAction) {
      onAlertAction(alertId, action);
    }
    ToastManager.success('Action exécutée', `${action} pour l'alerte ${alertId}`);
  };

  const handleAlertDismiss = (alertId: string) => {
    if (onAlertDismiss) {
      onAlertDismiss(alertId);
    }
    setFilteredAlerts(prev => prev.filter(alert => alert.id !== alertId));
    ToastManager.info('Alerte fermée', 'L\'alerte a été supprimée');
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `il y a ${diffMins}min`;
    } else if (diffHours < 24) {
      return `il y a ${diffHours}h`;
    } else {
      return `il y a ${diffDays}j`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Alertes Intelligentes</h3>
          <Badge variant="secondary">{filteredAlerts.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showSettings && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Filtres des alertes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sévérité</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['all', 'critical', 'high', 'medium', 'low'].map(severity => (
                    <Button
                      key={severity}
                      variant={selectedSeverity === severity ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSeverity(severity)}
                    >
                      {severity === 'all' ? 'Toutes' : 
                       severity === 'critical' ? 'Critique' :
                       severity === 'high' ? 'Élevée' :
                       severity === 'medium' ? 'Moyenne' : 'Faible'}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['all', 'stock', 'price', 'delivery', 'maintenance', 'budget', 'anomaly'].map(type => (
                    <Button
                      key={type}
                      variant={selectedType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(type)}
                    >
                      {type === 'all' ? 'Tous' :
                       type === 'stock' ? 'Stock' :
                       type === 'price' ? 'Prix' :
                       type === 'delivery' ? 'Livraison' :
                       type === 'maintenance' ? 'Maintenance' :
                       type === 'budget' ? 'Budget' : 'Anomalie'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune alerte pour les critères sélectionnés</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-white rounded border">
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityIcon(alert.severity)}
                        <CardTitle className="text-base">{alert.title}</CardTitle>
                        {alert.autoResolvable && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto-résolvable
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{alert.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(alert.timestamp)}
                        </span>
                        <span>Impact: {alert.estimatedImpact.financial} MAD</span>
                        <span>Confiance: {(alert.metadata.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAlertDismiss(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              {alert.actionable && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Actions recommandées:</p>
                    <div className="flex flex-wrap gap-2">
                      {alert.recommendedActions
                        .sort((a, b) => a.priority - b.priority)
                        .slice(0, 3)
                        .map((action, index) => (
                        <Button
                          key={index}
                          variant={index === 0 ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleAlertAction(alert.id, action.action)}
                        >
                          {action.action}
                          <span className="ml-1 text-xs opacity-70">({action.estimatedTime})</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {filteredAlerts.length > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-lg font-bold text-red-600">
                  {filteredAlerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actionnables</p>
                <p className="text-lg font-bold text-blue-600">
                  {filteredAlerts.filter(a => a.actionable).length}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Impact total</p>
                <p className="text-lg font-bold text-orange-600">
                  {filteredAlerts.reduce((sum, a) => sum + a.estimatedImpact.financial, 0).toLocaleString()} MAD
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-résolvables</p>
                <p className="text-lg font-bold text-green-600">
                  {filteredAlerts.filter(a => a.autoResolvable).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}