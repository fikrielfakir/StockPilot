import { useRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BarcodeGeneratorProps {
  article: {
    id: string;
    codeArticle: string;
    designation: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function BarcodeGenerator({ article, isOpen, onClose }: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && article && canvasRef.current) {
      generateQRCode();
    }
  }, [isOpen, article]);

  const generateQRCode = async () => {
    try {
      const qrData = JSON.stringify({
        id: article.id,
        code: article.codeArticle,
        name: article.designation,
        type: "article"
      });

      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });

      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Erreur lors de la génération du QR code:", error);
    }
  };

  const downloadQRCode = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `qr-${article.codeArticle}.png`;
      link.href = qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && qrDataUrl) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${article.codeArticle}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 20px; 
              }
              .qr-container {
                border: 2px solid #333;
                padding: 20px;
                display: inline-block;
                margin: 20px;
              }
              h2 { margin-bottom: 10px; }
              p { margin: 5px 0; }
              img { margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>${article.codeArticle}</h2>
              <p><strong>${article.designation}</strong></p>
              <img src="${qrDataUrl}" alt="QR Code" />
              <p>Scanner ce code pour accéder aux détails</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="barcode-generator-modal">
        <DialogHeader>
          <DialogTitle>Code QR - {article.codeArticle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-ms-gray-dark mb-2">
              {article.designation}
            </h3>
            <p className="text-sm text-ms-gray mb-4">
              Code Article: {article.codeArticle}
            </p>
          </div>

          {qrDataUrl && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img 
                  src={qrDataUrl} 
                  alt="QR Code" 
                  className="border border-gray-200 rounded p-2"
                />
              </div>
              
              <p className="text-sm text-ms-gray">
                Scanner ce code QR pour accéder rapidement aux informations de l'article
              </p>

              <div className="flex space-x-3 justify-center">
                <Button 
                  onClick={downloadQRCode}
                  className="btn-ms-blue"
                  data-testid="button-download-qr"
                >
                  <i className="fas fa-download mr-2"></i>
                  Télécharger
                </Button>
                <Button 
                  onClick={printQRCode}
                  variant="outline"
                  data-testid="button-print-qr"
                >
                  <i className="fas fa-print mr-2"></i>
                  Imprimer
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}