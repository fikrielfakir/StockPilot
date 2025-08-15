import { Link, useLocation } from "wouter";
import { useState } from "react";
import SettingsModal from "@/components/Settings";
import UserPreferences from "@/components/UserPreferences";
import GlobalSearch from "@/components/GlobalSearch";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  BarChart3, 
  Truck, 
  LogOut, 
  Building, 
  Users, 
  FileText,
  Settings,
  Bell,
  User,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { id: "dashboard", path: "/", icon: Home, label: "Accueil" },
  { id: "articles", path: "/articles", icon: Package, label: "Articles" },
  { id: "purchase-requests", path: "/purchase-requests", icon: ShoppingCart, label: "Demandes" },
  { id: "purchase-follow", path: "/purchase-follow", icon: ClipboardList, label: "Suivi Achats" },
  { id: "stock-status", path: "/stock-status", icon: BarChart3, label: "État Stock" },
  { id: "reception", path: "/reception", icon: Truck, label: "Réception" },
  { id: "outbound", path: "/outbound", icon: LogOut, label: "Sortie" },
  { id: "suppliers", path: "/suppliers", icon: Building, label: "Fournisseurs" },
  { id: "requestors", path: "/requestors", icon: Users, label: "Demandeurs" },
  { id: "reports", path: "/reports", icon: FileText, label: "Rapports" },
];

export default function TopNavigation() {
  const [location] = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showUserPreferences, setShowUserPreferences] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/dashboard")) return true;
    return location === path;
  };

  return (
    <div className="windows-nav bg-white shadow-sm">
      {/* Main Top Bar - Profile, Settings, Alerts, Search */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
        {/* Left Section - Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-windows-blue rounded-lg flex items-center justify-center shadow-sm">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">StockCéramique</h1>
              <p className="text-xs text-gray-500">Gestion de Stock</p>
            </div>
          </div>
        </div>

        {/* Center Section - Global Search */}
        <GlobalSearch />

        {/* Right Section - Alerts, Settings, Profile */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm"
            className="p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => window.location.href = '/settings'}
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </Button>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-windows-blue rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">Utilisateur</p>
                  <p className="text-xs text-gray-500">Administrateur</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowUserPreferences(true)}>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Secondary Navigation Bar - Main Menu Items */}
      <div className="h-12 px-6 bg-windows-blue text-white">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link key={item.id} href={item.path}>
                <Button
                  variant="ghost"
                  className={`
                    flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-all whitespace-nowrap h-12
                    ${active 
                      ? 'text-white border-white bg-blue-700/30' 
                      : 'text-blue-100 border-transparent hover:text-white hover:bg-blue-700/20 hover:border-blue-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation - Collapsed Menu */}
      <div className="md:hidden px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-1">
          {navigationItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`windows-nav-item-mobile px-2 py-2 rounded text-xs flex flex-col items-center space-y-1 ${
                  isActive(item.path) 
                    ? 'bg-windows-blue text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {/* User Preferences Modal */}
      {showUserPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <UserPreferences onClose={() => setShowUserPreferences(false)} />
          </div>
        </div>
      )}
    </div>
  );
}