import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Copy, 
  Tags,
  DollarSign,
  Package,
  AlertTriangle
} from "lucide-react";
import { ToastManager } from "./ToastNotifications";

interface BulkOperationsProps<T> {
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  onOperation: (operation: BulkOperation, data?: any) => Promise<void>;
  itemType: string;
  availableOperations?: BulkOperationType[];
}

export type BulkOperationType = 
  | 'delete' 
  | 'update_category' 
  | 'update_supplier' 
  | 'update_price' 
  | 'update_stock'
  | 'export'
  | 'duplicate'
  | 'tag'
  | 'archive';

export interface BulkOperation {
  type: BulkOperationType;
  data?: any;
}

export function BulkOperations<T>({ 
  selectedItems, 
  onSelectionChange, 
  onOperation,
  itemType,
  availableOperations = ['delete', 'update_category', 'export']
}: BulkOperationsProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BulkOperationType | ''>('');
  const [operationData, setOperationData] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const operationConfigs = {
    delete: {
      icon: Trash2,
      label: 'Supprimer',
      color: 'destructive' as const,
      description: 'Supprimer définitivement les éléments sélectionnés'
    },
    update_category: {
      icon: Tags,
      label: 'Changer catégorie',
      color: 'default' as const,
      description: 'Modifier la catégorie des articles sélectionnés'
    },
    update_supplier: {
      icon: Package,
      label: 'Changer fournisseur',
      color: 'default' as const,
      description: 'Assigner un nouveau fournisseur'
    },
    update_price: {
      icon: DollarSign,
      label: 'Mettre à jour prix',
      color: 'default' as const,
      description: 'Modifier les prix unitaires'
    },
    update_stock: {
      icon: AlertTriangle,
      label: 'Ajuster stock',
      color: 'secondary' as const,
      description: 'Modification en lot des quantités'
    },
    export: {
      icon: Download,
      label: 'Exporter',
      color: 'default' as const,
      description: 'Télécharger les données sélectionnées'
    },
    duplicate: {
      icon: Copy,
      label: 'Dupliquer',
      color: 'default' as const,
      description: 'Créer des copies des éléments'
    }
  };

  const handleExecuteOperation = async () => {
    if (!selectedOperation || selectedItems.length === 0) return;

    setIsProcessing(true);
    ToastManager.operationInProgress(`Traitement de ${selectedItems.length} éléments...`);

    try {
      await onOperation({ type: selectedOperation, data: operationData });
      ToastManager.bulkOperationCompleted(selectedItems.length, operationConfigs[selectedOperation].label);
      
      // Reset state
      setSelectedOperation('');
      setOperationData({});
      onSelectionChange([]);
    } catch (error) {
      ToastManager.error(
        'Erreur lors de l\'opération groupée', 
        error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOperationInput = () => {
    if (!selectedOperation) return null;

    switch (selectedOperation) {
      case 'update_category':
        return (
          <div className="space-y-2">
            <Label>Nouvelle catégorie</Label>
            <Input
              placeholder="Entrez la nouvelle catégorie"
              value={operationData.category || ''}
              onChange={(e) => setOperationData({ ...operationData, category: e.target.value })}
            />
          </div>
        );

      case 'update_supplier':
        return (
          <div className="space-y-2">
            <Label>Nouveau fournisseur</Label>
            <Select onValueChange={(value) => setOperationData({ ...operationData, supplierId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supplier1">Fournisseur 1</SelectItem>
                <SelectItem value="supplier2">Fournisseur 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'update_price':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de modification</Label>
              <Select onValueChange={(value) => setOperationData({ ...operationData, priceType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Prix fixe</SelectItem>
                  <SelectItem value="percentage">Pourcentage</SelectItem>
                  <SelectItem value="increment">Augmentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valeur</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={operationData.priceValue || ''}
                onChange={(e) => setOperationData({ ...operationData, priceValue: e.target.value })}
              />
            </div>
          </div>
        );

      case 'update_stock':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type d'ajustement</Label>
              <Select onValueChange={(value) => setOperationData({ ...operationData, stockType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="set">Définir quantité</SelectItem>
                  <SelectItem value="add">Ajouter</SelectItem>
                  <SelectItem value="subtract">Retrancher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                placeholder="0"
                value={operationData.stockValue || ''}
                onChange={(e) => setOperationData({ ...operationData, stockValue: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Package className="mx-auto h-8 w-8 mb-2" />
            <p>Sélectionnez des éléments pour accéder aux opérations groupées</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Checkbox 
                checked={true} 
                className="h-5 w-5"
                onCheckedChange={() => onSelectionChange([])}
              />
              Opérations groupées
              <Badge variant="secondary">{selectedItems.length} {itemType}(s)</Badge>
            </CardTitle>
            <CardDescription>
              Appliquer des modifications à tous les éléments sélectionnés
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Réduire' : 'Développer'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Opération</Label>
              <Select onValueChange={(value: BulkOperationType) => setSelectedOperation(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une opération" />
                </SelectTrigger>
                <SelectContent>
                  {availableOperations.map((op) => {
                    const config = operationConfigs[op];
                    const Icon = config.icon;
                    return (
                      <SelectItem key={op} value={op}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedOperation && (
              <div className="space-y-2">
                <Label>Configuration</Label>
                {renderOperationInput()}
              </div>
            )}
          </div>

          {selectedOperation && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  operationConfigs[selectedOperation].color === 'destructive' 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30' 
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                }`}>
                  {(() => {
                    const Icon = operationConfigs[selectedOperation].icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{operationConfigs[selectedOperation].label}</p>
                  <p className="text-sm text-muted-foreground">
                    {operationConfigs[selectedOperation].description}
                  </p>
                </div>
                <Button
                  onClick={handleExecuteOperation}
                  variant={operationConfigs[selectedOperation].color}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? 'Traitement...' : 'Exécuter'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Selection utilities
export function useItemSelection<T extends { id: string }>() {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);

  const toggleSelection = (item: T) => {
    setSelectedItems(prev => 
      prev.some(selected => selected.id === item.id)
        ? prev.filter(selected => selected.id !== item.id)
        : [...prev, item]
    );
  };

  const selectAll = (items: T[]) => {
    setSelectedItems(items);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const isSelected = (item: T) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  return {
    selectedItems,
    setSelectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedItems.length > 0
  };
}