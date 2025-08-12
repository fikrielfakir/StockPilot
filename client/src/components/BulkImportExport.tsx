import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WindowsCard, WindowsCardContent, WindowsCardHeader } from "@/components/WindowsCard";
import { WindowsButton } from "@/components/WindowsButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  X
} from "lucide-react";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

interface BulkImportExportProps {
  entityType: 'articles' | 'suppliers' | 'requestors';
  onClose?: () => void;
}

interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string; data: any }>;
  total: number;
}

export default function BulkImportExport({ entityType, onClose }: BulkImportExportProps) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Template data for different entity types
  const getTemplateData = (): any[] => {
    switch (entityType) {
      case 'articles':
        return [
          {
            codeArticle: 'ART001',
            designation: 'Exemple Article',
            categorie: 'Électronique',
            marque: 'Samsung',
            reference: 'REF123',
            stockInitial: 100,
            unite: 'pcs',
            prixUnitaire: 25.50,
            seuilMinimum: 10,
            fournisseurId: 'FOURNISSEUR_ID'
          }
        ];
      case 'suppliers':
        return [
          {
            nom: 'Exemple Fournisseur',
            contact: 'Jean Dupont',
            telephone: '+33123456789',
            email: 'contact@fournisseur.com',
            adresse: '123 Rue de la Paix, Paris',
            conditionsPaiement: '30 jours',
            delaiLivraison: 7
          }
        ];
      case 'requestors':
        return [
          {
            nom: 'Dupont',
            prenom: 'Jean',
            departement: 'Production',
            poste: 'Superviseur',
            email: 'jean.dupont@entreprise.com',
            telephone: '+33987654321'
          }
        ];
      default:
        return [];
    }
  };

  const downloadTemplate = (format: 'csv' | 'xlsx') => {
    const data = getTemplateData();
    const filename = `template_${entityType}.${format}`;

    if (format === 'csv') {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, entityType);
      XLSX.writeFile(wb, filename);
    }

    toast({
      title: "Modèle téléchargé",
      description: `Le modèle ${format.toUpperCase()} a été téléchargé avec succès.`,
    });
  };

  const exportData = useMutation({
    mutationFn: async (format: 'csv' | 'xlsx' | 'pdf') => {
      const response = await fetch(`/api/${entityType}/export?format=${format}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const contentType = response.headers.get('content-type');
      if (format === 'pdf' || contentType?.includes('application/pdf')) {
        return response.blob();
      } else {
        return response.text();
      }
    },
    onSuccess: (data, format) => {
      const filename = `export_${entityType}_${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'pdf') {
        const blob = new Blob([data as Blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([data as string], { 
          type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Export réussi",
        description: `Les données ont été exportées en ${format.toUpperCase()}.`,
      });
      setExporting(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur d'export",
        description: "Une erreur s'est produite lors de l'export.",
        variant: "destructive",
      });
      setExporting(false);
    }
  });

  const processFile = async (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => {
            reject(error);
          }
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Format de fichier non supporté. Utilisez CSV ou XLSX.'));
      }
    });
  };

  const importData = useMutation({
    mutationFn: async (data: any[]): Promise<ImportResult> => {
      const response = await fetch(`/api/${entityType}/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      
      if (!response.ok) {
        throw new Error('Import failed');
      }
      
      return response.json();
    },
    onSuccess: (result: ImportResult) => {
      setImportResults(result);
      setImporting(false);
      setProgress(100);
      
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      
      toast({
        title: "Import terminé",
        description: `${result.success}/${result.total} enregistrements importés avec succès.`,
        variant: result.errors.length > 0 ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'import",
        description: "Une erreur s'est produite lors de l'import.",
        variant: "destructive",
      });
      setImporting(false);
      setProgress(0);
    }
  });

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setProgress(10);
    setImportResults(null);

    try {
      setProgress(30);
      const data = await processFile(file);
      setProgress(60);
      
      if (data.length === 0) {
        throw new Error('Le fichier est vide ou ne contient pas de données valides.');
      }

      setProgress(80);
      importData.mutate(data);
    } catch (error) {
      toast({
        title: "Erreur de lecture",
        description: error instanceof Error ? error.message : "Erreur lors de la lecture du fichier.",
        variant: "destructive",
      });
      setImporting(false);
      setProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getEntityDisplayName = () => {
    switch (entityType) {
      case 'articles': return 'Articles';
      case 'suppliers': return 'Fournisseurs';
      case 'requestors': return 'Demandeurs';
      default: return entityType;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-windows-gray-dark">
          Import/Export - {getEntityDisplayName()}
        </h2>
        {onClose && (
          <WindowsButton variant="outline" onClick={onClose} size="sm">
            <X className="w-4 h-4" />
          </WindowsButton>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <WindowsCard>
          <WindowsCardHeader>
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-windows-blue" />
              <h3 className="text-lg font-semibold text-windows-gray-dark">Import en Masse</h3>
            </div>
          </WindowsCardHeader>
          <WindowsCardContent className="space-y-4">
            <div>
              <Label htmlFor="import-file">Sélectionner un fichier (CSV, XLSX)</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileImport}
                disabled={importing}
                ref={fileInputRef}
                className="mt-1"
              />
            </div>

            {importing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Import en cours...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-windows-gray-dark">Télécharger un modèle</h4>
              <div className="flex space-x-2">
                <WindowsButton
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('csv')}
                  className="flex items-center space-x-1"
                >
                  <FileText className="w-4 h-4" />
                  <span>CSV</span>
                </WindowsButton>
                <WindowsButton
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('xlsx')}
                  className="flex items-center space-x-1"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Excel</span>
                </WindowsButton>
              </div>
            </div>
          </WindowsCardContent>
        </WindowsCard>

        {/* Export Section */}
        <WindowsCard>
          <WindowsCardHeader>
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-windows-green" />
              <h3 className="text-lg font-semibold text-windows-gray-dark">Export des Données</h3>
            </div>
          </WindowsCardHeader>
          <WindowsCardContent className="space-y-4">
            <p className="text-sm text-windows-gray">
              Exportez toutes vos données dans le format de votre choix.
            </p>

            <div className="space-y-2">
              <h4 className="font-medium text-windows-gray-dark">Formats disponibles</h4>
              <div className="grid grid-cols-1 gap-2">
                <WindowsButton
                  variant="outline"
                  onClick={() => {
                    setExporting(true);
                    exportData.mutate('csv');
                  }}
                  disabled={exporting}
                  className="flex items-center justify-start space-x-2 p-3"
                >
                  <FileText className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-windows-gray">Compatible avec Excel, LibreOffice</p>
                  </div>
                </WindowsButton>

                <WindowsButton
                  variant="outline"
                  onClick={() => {
                    setExporting(true);
                    exportData.mutate('xlsx');
                  }}
                  disabled={exporting}
                  className="flex items-center justify-start space-x-2 p-3"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-medium">Excel</p>
                    <p className="text-xs text-windows-gray">Format natif Excel (.xlsx)</p>
                  </div>
                </WindowsButton>

                <WindowsButton
                  variant="outline"
                  onClick={() => {
                    setExporting(true);
                    exportData.mutate('pdf');
                  }}
                  disabled={exporting}
                  className="flex items-center justify-start space-x-2 p-3"
                >
                  <FileText className="w-4 h-4" />
                  <div className="text-left">
                    <p className="font-medium">PDF</p>
                    <p className="text-xs text-windows-gray">Document imprimable</p>
                  </div>
                </WindowsButton>
              </div>
            </div>
          </WindowsCardContent>
        </WindowsCard>
      </div>

      {/* Import Results */}
      {importResults && (
        <WindowsCard>
          <WindowsCardHeader>
            <div className="flex items-center space-x-2">
              {importResults.errors.length === 0 ? (
                <CheckCircle className="w-5 h-5 text-windows-green" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-windows-amber" />
              )}
              <h3 className="text-lg font-semibold text-windows-gray-dark">Résultats de l'Import</h3>
            </div>
          </WindowsCardHeader>
          <WindowsCardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-sm">
                <div className="text-2xl font-bold text-windows-green">{importResults.success}</div>
                <div className="text-sm text-windows-gray">Succès</div>
              </div>
              <div className="p-3 bg-red-50 rounded-sm">
                <div className="text-2xl font-bold text-windows-red">{importResults.errors.length}</div>
                <div className="text-sm text-windows-gray">Erreurs</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-sm">
                <div className="text-2xl font-bold text-windows-blue">{importResults.total}</div>
                <div className="text-sm text-windows-gray">Total</div>
              </div>
            </div>

            {importResults.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-windows-gray-dark mb-2">Erreurs détectées :</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {importResults.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded-sm text-sm">
                      <span className="font-medium">Ligne {error.row}:</span> {error.error}
                    </div>
                  ))}
                  {importResults.errors.length > 10 && (
                    <div className="text-sm text-windows-gray">
                      ... et {importResults.errors.length - 10} autres erreurs
                    </div>
                  )}
                </div>
              </div>
            )}
          </WindowsCardContent>
        </WindowsCard>
      )}
    </div>
  );
}