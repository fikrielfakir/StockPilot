import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorageBackup } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [reportType, setReportType] = useState("stock");
  const [exportFormat, setExportFormat] = useState("csv");
  const { exportData } = useLocalStorageBackup();
  const { toast } = useToast();

  const { data: articles = [] } = useQuery({
    queryKey: ["/api/articles"],
  });

  const { data: stockMovements = [] } = useQuery({
    queryKey: ["/api/stock-movements"],
  });

  const { data: purchaseRequests = [] } = useQuery({
    queryKey: ["/api/purchase-requests"],
  });

  const { data: receptions = [] } = useQuery({
    queryKey: ["/api/receptions"],
  });

  const { data: outbounds = [] } = useQuery({
    queryKey: ["/api/outbounds"],
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["/api/suppliers"],
  });

  const { data: requestors = [] } = useQuery({
    queryKey: ["/api/requestors"],
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: "Aucune donnée",
        description: "Aucune donnée à exporter",
        variant: "destructive",
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateStockReport = () => {
    const stockData = articles.map((article: any) => ({
      'Code Article': article.codeArticle,
      'Désignation': article.designation,
      'Catégorie': article.categorie,
      'Marque': article.marque || '',
      'Stock Actuel': article.stockActuel,
      'Unité': article.unite,
      'Prix Unitaire': article.prixUnitaire || '',
      'Seuil Minimum': article.seuilMinimum || '',
      'Valeur Stock': article.prixUnitaire ? (parseFloat(article.prixUnitaire) * article.stockActuel).toFixed(2) : '',
    }));

    return stockData;
  };

  const generateMovementsReport = () => {
    const movementsData = stockMovements.map((movement: any) => {
      const article = articles.find((a: any) => a.id === movement.articleId);
      return {
        'Date': new Date(movement.dateMovement).toLocaleDateString('fr-FR'),
        'Article': article ? `${article.codeArticle} - ${article.designation}` : 'Inconnu',
        'Type': movement.type === 'entree' ? 'Entrée' : 'Sortie',
        'Quantité': movement.quantite,
        'Stock Avant': movement.quantiteAvant,
        'Stock Après': movement.quantiteApres,
        'Description': movement.description || '',
      };
    });

    return movementsData.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
  };

  const generateSuppliersReport = () => {
    const suppliersData = suppliers.map((supplier: any) => ({
      'Nom': supplier.nom,
      'Contact': supplier.contact || '',
      'Téléphone': supplier.telephone || '',
      'Email': supplier.email || '',
      'Adresse': supplier.adresse || '',
      'Conditions Paiement': supplier.conditionsPaiement || '',
      'Délai Livraison': supplier.delaiLivraison ? `${supplier.delaiLivraison} jours` : '',
    }));

    return suppliersData;
  };

  const generateRequestorsReport = () => {
    const requestorsData = requestors.map((requestor: any) => ({
      'Nom': requestor.nom,
      'Prénom': requestor.prenom,
      'Département': requestor.departement,
      'Poste': requestor.poste || '',
      'Email': requestor.email || '',
      'Téléphone': requestor.telephone || '',
    }));

    return requestorsData;
  };

  const handleExport = () => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'stock':
        data = generateStockReport();
        filename = 'rapport-stock';
        break;
      case 'movements':
        data = generateMovementsReport();
        filename = 'rapport-mouvements';
        break;
      case 'suppliers':
        data = generateSuppliersReport();
        filename = 'rapport-fournisseurs';
        break;
      case 'requestors':
        data = generateRequestorsReport();
        filename = 'rapport-demandeurs';
        break;
      default:
        toast({
          title: "Erreur",
          description: "Type de rapport non valide",
          variant: "destructive",
        });
        return;
    }

    if (exportFormat === 'csv') {
      exportToCSV(data, filename);
      toast({
        title: "Export réussi",
        description: `Le rapport ${reportType} a été exporté en CSV`,
      });
    }
  };

  const handleBackup = () => {
    try {
      exportData();
      toast({
        title: "Sauvegarde créée",
        description: "Toutes les données ont été sauvegardées",
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const lowStockArticles = articles.filter((article: any) => 
    article.stockActuel <= (article.seuilMinimum || 10)
  );

  const totalStockValue = articles.reduce((total: number, article: any) => {
    const price = parseFloat(article.prixUnitaire || "0");
    return total + (price * article.stockActuel);
  }, 0);

  return (
    <div className="space-y-6" data-testid="reports-page">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="card-hover transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ms-gray">Total Articles</p>
                <p className="text-2xl font-bold text-ms-gray-dark">{articles.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-boxes text-ms-blue text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ms-gray">Stock Bas</p>
                <p className="text-2xl font-bold text-ms-red">{lowStockArticles.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-ms-red text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ms-gray">Fournisseurs</p>
                <p className="text-2xl font-bold text-ms-gray-dark">{suppliers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-building text-ms-green text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover transition-smooth">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ms-gray">Valeur Stock</p>
                <p className="text-2xl font-bold text-ms-gray-dark">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  }).format(totalStockValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-euro-sign text-ms-amber text-xl"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-ms-gray-dark">Export de Données</h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Type de rapport</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock">État des Stocks</SelectItem>
                  <SelectItem value="movements">Mouvements de Stock</SelectItem>
                  <SelectItem value="suppliers">Liste des Fournisseurs</SelectItem>
                  <SelectItem value="requestors">Liste des Demandeurs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger data-testid="select-export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ms-gray-dark mb-2">Action</label>
              <Button 
                onClick={handleExport}
                className="w-full btn-ms-blue"
                data-testid="button-export"
              >
                <i className="fas fa-download mr-2"></i>
                Exporter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Section */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-ms-gray-dark">Sauvegarde et Restauration</h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-ms-gray-dark mb-3">Sauvegarde Complète</h4>
              <p className="text-sm text-ms-gray mb-4">
                Exportez toutes vos données dans un fichier de sauvegarde JSON.
              </p>
              <Button 
                onClick={handleBackup}
                className="btn-ms-green"
                data-testid="button-backup"
              >
                <i className="fas fa-download mr-2"></i>
                Créer une sauvegarde
              </Button>
            </div>

            <div>
              <h4 className="font-medium text-ms-gray-dark mb-3">Informations</h4>
              <div className="space-y-2 text-sm text-ms-gray">
                <p>• Les données sont stockées localement dans votre navigateur</p>
                <p>• Effectuez des sauvegardes régulières</p>
                <p>• Les rapports incluent toutes les données actuelles</p>
                <p>• Format CSV compatible avec Excel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-ms-gray-dark">Statistiques Rapides</h3>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-ms-blue mb-2">{stockMovements.length}</div>
              <div className="text-sm text-ms-gray">Mouvements de stock</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ms-amber mb-2">{purchaseRequests.length}</div>
              <div className="text-sm text-ms-gray">Demandes d'achat</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ms-green mb-2">{receptions.length + outbounds.length}</div>
              <div className="text-sm text-ms-gray">Transactions totales</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
