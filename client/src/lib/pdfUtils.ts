import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

export interface PDFOptions {
  title: string;
  subtitle?: string;
  headers: string[];
  data: any[][];
  filename: string;
}

export const generatePDF = ({ title, subtitle, headers, data, filename }: PDFOptions) => {
  const doc = new jsPDF();

  // Add company logo/header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('StockCéramique', 20, 20);

  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 35);

  // Add subtitle if provided
  let yPosition = 45;
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 20, yPosition);
    yPosition += 10;
  }

  // Add generation date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, yPosition);

  // Generate table
  autoTable(doc, {
    startY: yPosition + 10,
    head: [headers],
    body: data,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 98, 255], // Microsoft blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25 },
    },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};

export const generatePurchaseRequestPDF = (request: any, article: any, requestor: any, supplier: any) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('StockCéramique', 20, 20);

  doc.setFontSize(16);
  doc.text('DEMANDE D\'ACHAT', 20, 35);

  // Request details
  let yPos = 55;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations de la demande:', 20, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Date de demande: ${new Date(request.dateDemande).toLocaleDateString('fr-FR')}`, 25, yPos);
  
  yPos += 8;
  doc.text(`Statut: ${request.statut === 'en_attente' ? 'En attente' : 
                     request.statut === 'approuve' ? 'Approuvé' : 
                     request.statut === 'refuse' ? 'Refusé' : 'Commandé'}`, 25, yPos);

  // Requestor details
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Demandeur:', 20, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nom: ${requestor.prenom} ${requestor.nom}`, 25, yPos);
  
  yPos += 8;
  doc.text(`Département: ${requestor.departement}`, 25, yPos);
  
  if (requestor.poste) {
    yPos += 8;
    doc.text(`Poste: ${requestor.poste}`, 25, yPos);
  }

  // Article details
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Article demandé:', 20, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Code: ${article.codeArticle}`, 25, yPos);
  
  yPos += 8;
  doc.text(`Désignation: ${article.designation}`, 25, yPos);
  
  yPos += 8;
  doc.text(`Catégorie: ${article.categorie}`, 25, yPos);
  
  yPos += 8;
  doc.text(`Quantité demandée: ${request.quantiteDemandee} ${article.unite}`, 25, yPos);

  // Supplier details if available
  if (supplier) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Fournisseur suggéré:', 20, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.text(`Nom: ${supplier.nom}`, 25, yPos);
    
    if (supplier.contact) {
      yPos += 8;
      doc.text(`Contact: ${supplier.contact}`, 25, yPos);
    }
  }

  // Observations
  if (request.observations) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Observations:', 20, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(request.observations, 160);
    doc.text(splitText, 25, yPos);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 20, pageHeight - 20);

  // Save
  doc.save(`demande-achat-${request.id}.pdf`);
};

export const generateStockReportPDF = (articles: any[], title: string = 'Rapport de Stock') => {
  const headers = ['Code Article', 'Désignation', 'Catégorie', 'Stock Actuel', 'Unité', 'Prix Unit.', 'Valeur'];
  
  const data = articles.map(article => [
    article.codeArticle,
    article.designation,
    article.categorie,
    article.stockActuel.toString(),
    article.unite,
    article.prixUnitaire ? `${article.prixUnitaire}€` : '-',
    article.prixUnitaire ? `${(article.prixUnitaire * article.stockActuel).toFixed(2)}€` : '-'
  ]);

  const totalValue = articles.reduce((total, article) => {
    const price = parseFloat(article.prixUnitaire || "0");
    return total + (price * article.stockActuel);
  }, 0);

  generatePDF({
    title,
    subtitle: `Total articles: ${articles.length} - Valeur totale: ${totalValue.toFixed(2)}€`,
    headers,
    data,
    filename: 'rapport-stock'
  });
};