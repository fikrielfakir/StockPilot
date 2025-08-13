import { useState } from "react";
import { Search, Bell, Settings, User, Grid3X3 } from "lucide-react";

export default function FluentTopNav() {
  const [searchValue, setSearchValue] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="mica-surface h-16 px-6 flex items-center justify-between border-b border-white/10">
      {/* Logo and Title */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <Grid3X3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="fluent-title text-xl">StockCéramique</h1>
          <p className="fluent-caption text-xs">Gestion de Stock Intelligente</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-white/60 backdrop-blur-md border border-white/20 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/80 
                     transition-all duration-200 fluent-body text-sm"
          />
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-md border border-white/20 
                     flex items-center justify-center hover:bg-white/80 transition-all duration-200 
                     hover:transform hover:scale-105 active:scale-95"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full"></span>
            </span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white/90 backdrop-blur-md border border-white/20 
                          rounded-xl shadow-lg overflow-hidden z-50">
              <div className="p-4 border-b border-gray-100">
                <h3 className="fluent-subtitle text-lg">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 hover:bg-gray-50/50 border-b border-gray-100 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="fluent-body text-sm font-medium">Stock bas détecté</p>
                      <p className="fluent-caption text-xs mt-1">3 articles nécessitent un réapprovisionnement</p>
                      <p className="fluent-caption text-xs text-gray-500 mt-1">Il y a 2h</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-50/50 border-b border-gray-100 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="fluent-body text-sm font-medium">Réception confirmée</p>
                      <p className="fluent-caption text-xs mt-1">Commande #1234 réceptionnée avec succès</p>
                      <p className="fluent-caption text-xs text-gray-500 mt-1">Il y a 4h</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 hover:bg-gray-50/50 cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="fluent-body text-sm font-medium">Demande d'achat en attente</p>
                      <p className="fluent-caption text-xs mt-1">Nouvelle demande nécessite approbation</p>
                      <p className="fluent-caption text-xs text-gray-500 mt-1">Il y a 1j</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 text-center">
                <button className="fluent-caption text-blue-600 hover:text-blue-800 font-medium">
                  Voir toutes les notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <button className="w-10 h-10 rounded-lg bg-white/60 backdrop-blur-md border border-white/20 
                         flex items-center justify-center hover:bg-white/80 transition-all duration-200 
                         hover:transform hover:scale-105 active:scale-95">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center space-x-3 ml-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 
                         flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="fluent-body text-sm font-medium">Utilisateur</p>
            <p className="fluent-caption text-xs">Administrateur</p>
          </div>
        </div>
      </div>
    </div>
  );
}