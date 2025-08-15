import { useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ToastManager } from "./ToastNotifications";

// Keyboard shortcut mappings
const shortcuts = {
  // Navigation
  'alt+d': '/dashboard',
  'alt+a': '/articles',
  'alt+s': '/suppliers',
  'alt+r': '/requestors',
  'alt+p': '/purchase-requests',
  'alt+e': '/reception',
  'alt+o': '/outbound',
  'alt+t': '/reports',

  // Quick actions
  'ctrl+n': 'new',
  'ctrl+s': 'save',
  'ctrl+f': 'search',
  'esc': 'escape',
  'ctrl+shift+e': 'export',
  'ctrl+shift+i': 'import',
  
  // Bulk operations
  'ctrl+a': 'select_all',
  'ctrl+shift+d': 'bulk_delete',
  'ctrl+shift+u': 'bulk_update',
};

interface KeyboardShortcutsProps {
  onShortcut?: (action: string) => void;
  disabled?: boolean;
}

export function KeyboardShortcuts({ onShortcut, disabled = false }: KeyboardShortcutsProps) {
  const [, setLocation] = useLocation();

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const key = getShortcutKey(event);
    const action = shortcuts[key as keyof typeof shortcuts];

    if (action) {
      event.preventDefault();
      
      if (action.startsWith('/')) {
        // Navigation shortcuts
        setLocation(action);
        ToastManager.info(`Navigation: ${getPageName(action)}`);
      } else {
        // Action shortcuts
        if (onShortcut) {
          onShortcut(action);
        }
        handleGlobalAction(action);
      }
    }
  }, [setLocation, onShortcut, disabled]);

  useEffect(() => {
    if (disabled) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress, disabled]);

  return null; // This component doesn't render anything
}

function getShortcutKey(event: KeyboardEvent): string {
  const parts = [];
  
  if (event.ctrlKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  
  parts.push(event.key.toLowerCase());
  
  return parts.join('+');
}

function getPageName(path: string): string {
  const names: Record<string, string> = {
    '/dashboard': 'Tableau de bord',
    '/articles': 'Articles',
    '/suppliers': 'Fournisseurs',
    '/requestors': 'Demandeurs',
    '/purchase-requests': 'Demandes d\'achat',
    '/reception': 'Réceptions',
    '/outbound': 'Sorties',
    '/reports': 'Rapports',
  };
  return names[path] || path;
}

function handleGlobalAction(action: string) {
  switch (action) {
    case 'search':
      // Focus search input if available
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Rechercher"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        ToastManager.info("Mode recherche activé");
      }
      break;
      
    case 'escape':
      // Close modals, clear selections, etc.
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      break;
      
    case 'select_all':
      // Trigger select all if in a data table
      const selectAllCheckbox = document.querySelector('input[type="checkbox"][aria-label*="Sélectionner"]') as HTMLInputElement;
      if (selectAllCheckbox) {
        selectAllCheckbox.click();
        ToastManager.info("Tous les éléments sélectionnés");
      }
      break;
      
    default:
      ToastManager.info(`Action: ${action}`);
  }
}

// Shortcut help component
export function ShortcutHelp() {
  const shortcutGroups = [
    {
      name: "Navigation",
      shortcuts: [
        { key: "Alt + D", action: "Tableau de bord" },
        { key: "Alt + A", action: "Articles" },
        { key: "Alt + S", action: "Fournisseurs" },
        { key: "Alt + R", action: "Demandeurs" },
        { key: "Alt + P", action: "Demandes d'achat" },
        { key: "Alt + E", action: "Réceptions" },
        { key: "Alt + O", action: "Sorties" },
        { key: "Alt + T", action: "Rapports" },
      ]
    },
    {
      name: "Actions rapides",
      shortcuts: [
        { key: "Ctrl + N", action: "Nouveau" },
        { key: "Ctrl + S", action: "Sauvegarder" },
        { key: "Ctrl + F", action: "Rechercher" },
        { key: "Échap", action: "Fermer/Annuler" },
        { key: "Ctrl + Maj + E", action: "Exporter" },
        { key: "Ctrl + Maj + I", action: "Importer" },
      ]
    },
    {
      name: "Opérations groupées",
      shortcuts: [
        { key: "Ctrl + A", action: "Sélectionner tout" },
        { key: "Ctrl + Maj + D", action: "Supprimer la sélection" },
        { key: "Ctrl + Maj + U", action: "Mettre à jour la sélection" },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Raccourcis clavier</h3>
      
      {shortcutGroups.map((group, index) => (
        <div key={index} className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">{group.name}</h4>
          <div className="grid grid-cols-1 gap-2">
            {group.shortcuts.map((shortcut, shortcutIndex) => (
              <div key={shortcutIndex} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                <span>{shortcut.action}</span>
                <kbd className="px-2 py-1 bg-background border rounded text-xs font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook for using shortcuts in components
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        return;
      }

      const key = getShortcutKey(event);
      const handler = shortcuts[key];
      
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts, enabled]);
}