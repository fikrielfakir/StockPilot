import { Button } from "@/components/ui/button";
import { useLocalStorageBackup } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

interface TopBarProps {
  activeModule: string;
}

const moduleLabels: Record<string, { title: string; description: string }> = {
  dashboard: { title: "Tableau de Bord", description: "Vue d'ensemble de votre stock" },
  articles: { title: "Gestion des Articles", description: "Pièces de rechange céramiques" },
  suppliers: { title: "Gestion des Fournisseurs", description: "Base de données fournisseurs" },
  requestors: { title: "Gestion des Demandeurs", description: "Personnel et départements" },
  "purchase-requests": { title: "Demandes d'Achat", description: "Suivi des demandes" },
  reception: { title: "Réception de Marchandises", description: "Enregistrement des livraisons" },
  outbound: { title: "Sortie de Stock", description: "Gestion des sorties" },
  reports: { title: "Rapports et Analyses", description: "Statistiques et exports" },
};

export default function TopBar({ activeModule }: TopBarProps) {
  const { exportData } = useLocalStorageBackup();
  const { toast } = useToast();
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleBackup = () => {
    try {
      exportData();
      toast({
        title: "Sauvegarde créée",
        description: "Les données ont été exportées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de créer la sauvegarde",
        variant: "destructive",
      });
    }
  };

  const moduleInfo = moduleLabels[activeModule] || { title: "Module", description: "Description" };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4" data-testid="top-bar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ms-gray-dark" data-testid="page-title">
            {moduleInfo.title}
          </h2>
          <p className="text-sm text-ms-gray" data-testid="page-description">
            {moduleInfo.description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleBackup}
            className="btn-ms-blue flex items-center space-x-2"
            data-testid="button-backup"
          >
            <i className="fas fa-download"></i>
            <span>Sauvegarde</span>
          </Button>
          <div className="text-sm text-ms-gray" data-testid="current-date">
            <span>{currentDate}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
