import { Link, useLocation } from "wouter";

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

const menuItems = [
  { id: "dashboard", path: "/", icon: "fas fa-tachometer-alt", label: "Tableau de Bord" },
  { id: "articles", path: "/articles", icon: "fas fa-cogs", label: "Articles" },
  { id: "purchase-requests", path: "/purchase-requests", icon: "fas fa-shopping-cart", label: "Demandes d'Achat" },
  { id: "purchase-follow", path: "/purchase-follow", icon: "fas fa-clipboard-list", label: "Suivi des Achats" },
  { id: "stock-status", path: "/stock-status", icon: "fas fa-chart-bar", label: "État du Stock" },
  { id: "reception", path: "/reception", icon: "fas fa-truck", label: "Réception" },
  { id: "outbound", path: "/outbound", icon: "fas fa-sign-out-alt", label: "Sortie de Stock" },
  { id: "suppliers", path: "/suppliers", icon: "fas fa-building", label: "Fournisseurs" },
  { id: "requestors", path: "/requestors", icon: "fas fa-users", label: "Demandeurs" },
];

const secondaryItems = [
  { id: "analytics", path: "/analytics", icon: "fas fa-brain", label: "Analytics IA" },
  { id: "reports", path: "/reports", icon: "fas fa-chart-line", label: "Rapports" },
];

export default function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/dashboard")) return true;
    return location === path;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col" data-testid="sidebar">
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-ms-blue rounded-lg flex items-center justify-center">
            <i className="fas fa-boxes text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ms-gray-dark">StockCéramique</h1>
            <p className="text-xs text-ms-gray">Gestion de Stock</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2" data-testid="navigation-menu">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className={`sidebar-item px-3 py-2 rounded-lg cursor-pointer transition-smooth flex items-center space-x-3 ${
              isActive(item.path) ? 'active' : ''
            }`}
            onClick={() => setActiveModule(item.id)}
            data-testid={`nav-${item.id}`}
          >
            <i className={`${item.icon} w-5 ${isActive(item.path) ? 'text-white' : 'text-ms-gray'}`}></i>
            <span className={`text-sm font-medium ${isActive(item.path) ? 'text-white' : 'text-ms-gray-dark'}`}>
              {item.label}
            </span>
          </Link>
        ))}
        
        <hr className="my-4 border-gray-200" />
        
        {secondaryItems.map((item) => (
          <Link
            key={item.id}
            href={item.path}
            className={`sidebar-item px-3 py-2 rounded-lg cursor-pointer transition-smooth flex items-center space-x-3 ${
              isActive(item.path) ? 'active' : ''
            }`}
            onClick={() => setActiveModule(item.id)}
            data-testid={`nav-${item.id}`}
          >
            <i className={`${item.icon} w-5 ${isActive(item.path) ? 'text-white' : 'text-ms-gray'}`}></i>
            <span className={`text-sm font-medium ${isActive(item.path) ? 'text-white' : 'text-ms-gray-dark'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-ms-gray">
          <div className="w-2 h-2 bg-ms-green rounded-full"></div>
          <span>Mode Hors Ligne</span>
        </div>
        <div className="text-xs text-ms-gray mt-1">Version 1.0.0</div>
      </div>
    </div>
  );
}
