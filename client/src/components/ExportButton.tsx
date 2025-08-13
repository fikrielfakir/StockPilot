import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, File } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonProps {
  data: any[];
  filename: string;
  title: string;
  columns: Array<{
    key: string;
    label: string;
    format?: (value: any) => string;
  }>;
  className?: string;
}

export function ExportButton({ data, filename, title, columns, className = "" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatData = (rawData: any[]) => {
    return rawData.map(item => {
      const formatted: any = {};
      columns.forEach(col => {
        const value = item[col.key];
        formatted[col.label] = col.format ? col.format(value) : value || '';
      });
      return formatted;
    });
  };

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      const formattedData = formatData(data);
      
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title);
      
      // Auto-size columns
      const colWidths = columns.map(col => ({
        wch: Math.max(col.label.length, 15)
      }));
      ws['!cols'] = colWidths;
      
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Excel réussi",
        description: `${data.length} enregistrements exportés`
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter vers Excel",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      doc.setFontSize(11);
      doc.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
      
      // Prepare table data
      const tableHeaders = columns.map(col => col.label);
      const tableData = data.map(item => 
        columns.map(col => {
          const value = item[col.key];
          return col.format ? col.format(value) : (value?.toString() || '');
        })
      );
      
      // Generate table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 35, right: 14, bottom: 20, left: 14 },
      });
      
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export PDF réussi",
        description: `${data.length} enregistrements exportés`
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter vers PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    try {
      setIsExporting(true);
      const formattedData = formatData(data);
      
      const exportData = {
        title,
        exportedAt: new Date().toISOString(),
        totalRecords: data.length,
        data: formattedData
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export JSON réussi",
        description: `${data.length} enregistrements exportés`
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter vers JSON",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (data.length === 0) {
    return (
      <Button variant="outline" disabled className={className}>
        <Download className="w-4 h-4 mr-2" />
        Aucune donnée à exporter
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} className={className}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Export en cours..." : "Exporter"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <File className="w-4 h-4 mr-2 text-blue-600" />
          JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}