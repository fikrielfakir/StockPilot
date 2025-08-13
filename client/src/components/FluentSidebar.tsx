import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  ClipboardCheck, 
  TrendingDown, 
  Truck, 
  ArrowDownLeft, 
  Users, 
  UserCheck, 
  BarChart3,
  ChevronRight
} from "lucide-react";

const navigationItems = [
  {
    path: "/",
    icon: LayoutDashboard,
    label: "Tableau de bord",
    description: "Vue d'ensemble"
  },
  {
    path: "/articles",
    icon: Package,
    label: "Articles",
    description: "Gestion stock"
  },
  {
    path: "/purchase-requests",
    icon: ShoppingCart,
    label: "Demandes",
    description: "Achats"
  },
  {
    path: "/purchase-follow",
    icon: ClipboardCheck,
    label: "Suivi Achats",
    description: "Commandes"
  },
  {
    path: "/stock-status",
    icon: TrendingDown,
    label: "État Stock",
    description: "Niveaux"
  },
  {
    path: "/reception",
    icon: Truck,
    label: "Réception",
    description: "Entrées"
  },
  {
    path: "/outbound",
    icon: ArrowDownLeft,
    label: "Sortie",
    description: "Consommation"
  },
  {
    path: "/suppliers",
    icon: Users,
    label: "Fournisseurs",
    description: "Contacts"
  },
  {
    path: "/requestors",
    icon: UserCheck,
    label: "Demandeurs",
    description: "Utilisateurs"
  },
  {
    path: "/reports",
    icon: BarChart3,
    label: "Rapports",
    description: "Analytics"
  }
];

export default function FluentSidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 fluent-sidebar h-full">
      <div className="p-4">
        {/* Navigation Title */}
        <div className="mb-6 px-2">
          <h2 className="fluent-subtitle text-sm uppercase tracking-wide text-gray-600 mb-2">
            Navigation
          </h2>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path || (location === "/" && item.path === "/");
            
            return (
              <Link key={item.path} to={item.path}>
                <div className={`fluent-nav-item group ${isActive ? 'active' : ''}`}>
                  <div className="flex items-center flex-1">
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.label}</p>
                      <p className="text-xs opacity-75 truncate">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl">
          <h3 className="fluent-subtitle text-sm mb-3">Aperçu Rapide</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="fluent-caption text-xs">Articles actifs</span>
              <span className="text-sm font-semibold text-blue-600">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="fluent-caption text-xs">Stock bas</span>
              <span className="text-sm font-semibold text-yellow-600">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="fluent-caption text-xs">En attente</span>
              <span className="text-sm font-semibold text-orange-600">0</span>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-6 px-2">
          <div className="fluent-caption text-xs text-center text-gray-500">
            StockCéramique v2.0
          </div>
        </div>
      </div>
    </div>
  );
}