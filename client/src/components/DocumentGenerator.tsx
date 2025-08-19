import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DocumentGeneratorProps {
  type: "bon_commande" | "bon_reception" | "bon_sortie";
  entityId: string;
  className?: string;
}

export function DocumentGenerator({ type, entityId, className = "" }: DocumentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getDocumentConfig = () => {
    switch (type) {
      case "bon_commande":
        return {
          title: "Bon de Commande",
          endpoint: "purchase-requests",
          icon: FileText,
          color: "text-blue-600"
        };
      case "bon_reception":
        return {
          title: "Bon de Réception",
          endpoint: "receptions",
          icon: Download,
          color: "text-green-600"
        };
      case "bon_sortie":
        return {
          title: "Bon de Sortie",
          endpoint: "outbounds",
          icon: Printer,
          color: "text-red-600"
        };
    }
  };

  const generateDocument = async () => {
    try {
      setIsGenerating(true);
      const config = getDocumentConfig();
      
      // Fetch document data
      const response = await fetch(`/api/${config.endpoint}/${entityId}/${type.replace('_', '-')}`);
      if (!response.ok) throw new Error('Erreur de génération');
      
      const documentData = await response.json();
      
      // Generate PDF
      const doc = new jsPDF();
      
      // Header with company info
      doc.setFontSize(20);
      doc.text("StockCéramique", 14, 20);
      doc.setFontSize(12);
      doc.text("Système de Gestion d'Inventaire", 14, 28);
      
      // Document title
      doc.setFontSize(16);
      doc.text(config.title, 14, 45);
      
      // Document info
      doc.setFontSize(10);
      doc.text(`Document généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 55);
      doc.text(`Heure: ${new Date().toLocaleTimeString('fr-FR')}`, 14, 60);
      
      let currentY = 75;
      
      if (type === "bon_commande") {
        // Purchase request details
        const { purchaseRequest, article, requestor, supplier } = documentData;
        
        doc.setFontSize(12);
        doc.text("Détails de la Commande:", 14, currentY);
        currentY += 10;
        
        const orderDetails = [
          [`Article:`, article?.designation || 'N/A'],
          [`Code Article:`, article?.codeArticle || 'N/A'],
          [`Quantité demandée:`, purchaseRequest.quantiteDemandee?.toString() || 'N/A'],
          [`Demandeur:`, `${requestor?.prenom || ''} ${requestor?.nom || ''}`.trim() || 'N/A'],
          [`Département:`, requestor?.departement || 'N/A'],
          [`Fournisseur:`, supplier?.nom || 'N/A'],
          [`Statut:`, purchaseRequest.statut || 'N/A'],
        ];
        
        orderDetails.forEach(([label, value]) => {
          doc.setFont(undefined, 'bold');
          doc.text(label, 14, currentY);
          doc.setFont(undefined, 'normal');
          doc.text(value, 80, currentY);
          currentY += 8;
        });
        
      } else if (type === "bon_reception") {
        // Reception details
        const { reception, article, supplier } = documentData;
        
        doc.setFontSize(12);
        doc.text("Détails de la Réception:", 14, currentY);
        currentY += 10;
        
        const receptionDetails = [
          [`Article:`, article?.designation || 'N/A'],
          [`Code Article:`, article?.codeArticle || 'N/A'],
          [`Quantité reçue:`, reception.quantiteRecue?.toString() || 'N/A'],
          [`Prix unitaire:`, reception.prixUnitaire ? `${reception.prixUnitaire} MAD` : 'N/A'],
          [`Fournisseur:`, supplier?.nom || 'N/A'],
          [`N° Bon de livraison:`, reception.numeroBonLivraison || 'N/A'],
          [`Date de réception:`, new Date(reception.dateReception).toLocaleDateString('fr-FR') || 'N/A'],
        ];
        
        receptionDetails.forEach(([label, value]) => {
          doc.setFont(undefined, 'bold');
          doc.text(label, 14, currentY);
          doc.setFont(undefined, 'normal');
          doc.text(value, 80, currentY);
          currentY += 8;
        });
        
      } else if (type === "bon_sortie") {
        // Outbound details
        const { outbound, article, requestor } = documentData;
        
        doc.setFontSize(12);
        doc.text("Détails de la Sortie:", 14, currentY);
        currentY += 10;
        
        const outboundDetails = [
          [`Article:`, article?.designation || 'N/A'],
          [`Code Article:`, article?.codeArticle || 'N/A'],
          [`Quantité sortie:`, outbound.quantiteSortie?.toString() || 'N/A'],
          [`Motif:`, outbound.motifSortie || 'N/A'],
          [`Demandeur:`, `${requestor?.prenom || ''} ${requestor?.nom || ''}`.trim() || 'N/A'],
          [`Département:`, requestor?.departement || 'N/A'],
          [`Date de sortie:`, new Date(outbound.dateSortie).toLocaleDateString('fr-FR') || 'N/A'],
        ];
        
        outboundDetails.forEach(([label, value]) => {
          doc.setFont(undefined, 'bold');
          doc.text(label, 14, currentY);
          doc.setFont(undefined, 'normal');
          doc.text(value, 80, currentY);
          currentY += 8;
        });
      }
      
      // Add observations if available
      const observations = documentData[Object.keys(documentData)[1]]?.observations;
      if (observations) {
        currentY += 10;
        doc.setFont(undefined, 'bold');
        doc.text("Observations:", 14, currentY);
        currentY += 8;
        doc.setFont(undefined, 'normal');
        const splitText = doc.splitTextToSize(observations, 180);
        doc.text(splitText, 14, currentY);
      }
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text("Document généré automatiquement par StockCéramique", 14, pageHeight - 20);
      doc.text(`ID: ${entityId}`, 14, pageHeight - 15);
      
      // Save PDF
      const fileName = `${type}_${entityId}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Document généré",
        description: `${config.title} créé avec succès`
      });
      
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer le document",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const config = getDocumentConfig();
  const Icon = config.icon;

  return (
    <Button
      onClick={generateDocument}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className={`${config.color} hover:bg-gray-50 ${className}`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {isGenerating ? "Génération..." : config.title}
    </Button>
  );
}