import { Link, useLocation } from "wouter";
import { useState } from "react";
import SettingsModal from "@/components/Settings";
import UserPreferences from "@/components/UserPreferences";
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
  Search,
  Settings,
  Bell,
  User,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showUserPreferences, setShowUserPreferences] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/dashboard")) return true;
    return location === path;
  };

  return (
    <div className="windows-nav bg-white border-b border-gray-200 shadow-sm">
      {/* Title Bar */}
      <div className="h-8 bg-windows-title-bar flex items-center justify-between px-4" style={{ minHeight: '32px', position: 'relative', zIndex: 10 }}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-windows-blue rounded-sm flex items-center justify-center shadow-sm">
            <Package className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-xs font-medium text-gray-700 select-none">StockCéramique - Gestion de Stock</span>
        </div>
        <div className="flex items-center space-x-1">
          <button className="windows-title-button hover:bg-gray-200">
            <div className="w-3 h-0.5 bg-gray-600"></div>
          </button>
          <button className="windows-title-button hover:bg-gray-200">
            <div className="w-3 h-3 border border-gray-600"></div>
          </button>
          <button className="windows-title-button hover:bg-red-500 hover:text-white">
            <div className="w-3 h-3 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-current rotate-45"></div>
                <div className="w-2 h-0.5 bg-current -rotate-45 absolute"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="h-14 px-4 flex items-center justify-between">
        {/* Left Section - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-windows-blue rounded-lg flex items-center justify-center shadow-sm">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900">StockCéramique</h1>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`windows-nav-item px-3 py-2 rounded-md flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-windows-blue text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section - Search and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 windows-search-input"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-windows-blue rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowUserPreferences(true)}>
                <User className="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
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

      {/* Mobile Navigation */}
      <div className="md:hidden px-4 pb-2">
        <div className="flex flex-wrap gap-1">
          {navigationItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`windows-nav-item-mobile px-2 py-1 rounded text-xs flex items-center space-x-1 ${
                  isActive(item.path) 
                    ? 'bg-windows-blue text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
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