import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

export interface ToastConfig {
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export class ToastManager {
  static show({ title, description, type, duration = 5000 }: ToastConfig) {
    const icons = {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
      error: <XCircle className="h-4 w-4 text-red-600" />,
      warning: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      info: <Info className="h-4 w-4 text-blue-600" />,
    };

    const styles = {
      success: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
      info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    };

    toast({
      title: (
        <div className="flex items-center gap-2">
          {icons[type]}
          <span>{title}</span>
        </div>
      ),
      description,
      duration,
      className: `${styles[type]} border`,
    });
  }

  static success(title: string, description?: string) {
    this.show({ title, description, type: 'success' });
  }

  static error(title: string, description?: string) {
    this.show({ title, description, type: 'error' });
  }

  static warning(title: string, description?: string) {
    this.show({ title, description, type: 'warning' });
  }

  static info(title: string, description?: string) {
    this.show({ title, description, type: 'info' });
  }

  // Specialized business operation toasts
  static articleCreated(articleCode: string) {
    this.success(
      "Article créé avec succès",
      `L'article ${articleCode} a été ajouté au stock`
    );
  }

  static stockUpdated(articleCode: string, newStock: number) {
    this.info(
      "Stock mis à jour",
      `${articleCode}: nouveau stock ${newStock} unités`
    );
  }

  static lowStockAlert(articleCode: string, currentStock: number, threshold: number) {
    this.warning(
      "Alerte stock bas",
      `${articleCode}: ${currentStock} unités restantes (seuil: ${threshold})`
    );
  }

  static purchaseRequestApproved(requestId: string) {
    this.success(
      "Demande d'achat approuvée",
      `Demande ${requestId} prête pour commande`
    );
  }

  static receptionCompleted(articleCode: string, quantity: number) {
    this.success(
      "Réception enregistrée",
      `${quantity} unités de ${articleCode} ajoutées au stock`
    );
  }

  static operationInProgress(operation: string) {
    this.info(
      "Opération en cours...",
      operation
    );
  }

  static dataExported(filename: string) {
    this.success(
      "Export terminé",
      `Fichier ${filename} téléchargé avec succès`
    );
  }

  static bulkOperationCompleted(count: number, operation: string) {
    this.success(
      `Opération groupée terminée`,
      `${count} éléments traités: ${operation}`
    );
  }
}

// Hook for easy access
export const useToastManager = () => ToastManager;