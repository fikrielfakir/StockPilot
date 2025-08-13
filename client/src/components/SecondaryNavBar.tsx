import { Link, useLocation } from "wouter";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Truck, 
  Users, 
  FileText, 
  BarChart3,
  Settings,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/articles", label: "Articles", icon: Package },
  { href: "/purchase-requests", label: "Demandes", icon: ShoppingCart },
  { href: "/stock-status", label: "État Stock", icon: TrendingUp },
  { href: "/reception", label: "Réception", icon: Truck },
  { href: "/sortie", label: "Sortie", icon: Package },
  { href: "/suppliers", label: "Fournisseurs", icon: Users },
  { href: "/requestors", label: "Demandeurs", icon: Users },
  { href: "/reports", label: "Rapports", icon: FileText },
];

export default function SecondaryNavBar() {
  const [location] = useLocation();

  return (
    <div className="bg-blue-600 text-white shadow-sm">
      <div className="px-6">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`
                    flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 transition-all whitespace-nowrap
                    ${isActive 
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
    </div>
  );
}