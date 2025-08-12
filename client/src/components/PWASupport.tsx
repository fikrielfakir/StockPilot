import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Download, Wifi, WifiOff, RefreshCw } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export default function PWASupport() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showPWACard, setShowPWACard] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isInWebAppiOS);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  handleServiceWorkerUpdate();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Auto-hide PWA card after 3 seconds
    const timer = setTimeout(() => {
      setShowPWACard(false);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleUpdateClick = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.update();
          window.location.reload();
        }
      });
    }
  };

  const getConnectionType = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      return connection.effectiveType || connection.type || 'unknown';
    }
    return 'unknown';
  };

  const getNetworkStatus = () => {
    if (!isOnline) return { color: 'bg-red-500', text: 'Hors ligne' };
    const connectionType = getConnectionType();
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return { color: 'bg-red-500', text: 'Connexion lente' };
      case '3g':
        return { color: 'bg-yellow-500', text: 'Connexion modérée' };
      case '4g':
        return { color: 'bg-green-500', text: 'Connexion rapide' };
      default:
        return { color: 'bg-blue-500', text: 'En ligne' };
    }
  };

  const networkStatus = getNetworkStatus();

  return (
    <>
      {/* Offline Alert */}
      {showOfflineAlert && (
        <Alert className="fixed top-4 right-4 z-50 w-80 sm:w-72 md:w-80 max-w-[calc(100vw-2rem)] border-orange-200 bg-orange-50">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Mode hors ligne</strong><br />
            Certaines fonctionnalités peuvent être limitées. Les données seront synchronisées lors de la reconnexion.
          </AlertDescription>
        </Alert>
      )}

      {/* Update Available Alert */}
      {updateAvailable && (
        <Alert className="fixed top-4 right-4 z-50 w-80 sm:w-72 md:w-80 max-w-[calc(100vw-2rem)] border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <strong>Mise à jour disponible</strong><br />
                Une nouvelle version de l'application est prête.
              </div>
              <Button size="sm" onClick={handleUpdateClick} className="ml-2">
                Mettre à jour
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* PWA Status Card */}
      {showPWACard && (
        <WindowsCard className="fixed bottom-4 right-4 z-40 w-80 sm:w-72 md:w-80 lg:w-80 xl:w-80 max-w-[calc(100vw-2rem)] transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in">
          <WindowsCardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              Application Mobile
            </h4>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${networkStatus.color}`}></div>
              <Badge variant="secondary" className="text-xs">
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Statut:</span>
              <Badge variant={isInstalled ? "default" : "secondary"}>
                {isInstalled ? "Installée" : "Navigateur"}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Connexion:</span>
              <span className="text-gray-900 text-xs">{networkStatus.text}</span>
            </div>

            {!isInstalled && deferredPrompt && (
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="w-full mt-3 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Installer l'app</span>
              </Button>
            )}

            {isInstalled && (
              <div className="text-xs text-green-600 text-center mt-2">
                ✓ Application installée et prête à l'utilisation hors ligne
              </div>
            )}
            </div>
          </WindowsCardContent>
        </WindowsCard>
      )}
    </>
  );
}