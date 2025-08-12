import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, TrendingUp, AlertTriangle } from "lucide-react";
import { WindowsCard, WindowsCardContent } from "@/components/WindowsCard";

interface SearchFilters {
  query: string;
  category: string;
  stockLevel: string;
  priceRange: string;
  supplier: string;
  status: string;
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  categories?: string[];
  suppliers?: Array<{ id: string; nom: string }>;
  showAnalytics?: boolean;
}

export default function AdvancedSearch({ 
  onFiltersChange, 
  categories = [], 
  suppliers = [],
  showAnalytics = false 
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "",
    stockLevel: "",
    priceRange: "",
    supplier: "",
    status: ""
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  // AI-powered search suggestions based on query
  useEffect(() => {
    if (filters.query.length > 2) {
      const suggestions = generateSmartSuggestions(filters.query, categories);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [filters.query, categories]);

  const generateSmartSuggestions = (query: string, categories: string[]): string[] => {
    const suggestions: string[] = [];
    const lowercaseQuery = query.toLowerCase();

    // Suggest categories that match
    categories.forEach(cat => {
      if (cat.toLowerCase().includes(lowercaseQuery)) {
        suggestions.push(`Catégorie: ${cat}`);
      }
    });

    // Smart search patterns
    if (lowercaseQuery.includes('stock') || lowercaseQuery.includes('bas')) {
      suggestions.push("Articles en stock bas");
    }
    if (lowercaseQuery.includes('cher') || lowercaseQuery.includes('prix')) {
      suggestions.push("Articles les plus chers");
    }
    if (lowercaseQuery.includes('recent') || lowercaseQuery.includes('nouveau')) {
      suggestions.push("Articles récents");
    }

    return suggestions.slice(0, 5);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      stockLevel: "",
      priceRange: "",
      supplier: "",
      status: ""
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== "").length;
  };

  const getFilterBadges = () => {
    const badges: Array<{ key: keyof SearchFilters; label: string; value: string }> = [];
    
    if (filters.category) badges.push({ key: 'category', label: 'Catégorie', value: filters.category });
    if (filters.stockLevel) badges.push({ key: 'stockLevel', label: 'Stock', value: filters.stockLevel });
    if (filters.priceRange) badges.push({ key: 'priceRange', label: 'Prix', value: filters.priceRange });
    if (filters.supplier) badges.push({ key: 'supplier', label: 'Fournisseur', value: suppliers.find(s => s.id === filters.supplier)?.nom || filters.supplier });
    if (filters.status) badges.push({ key: 'status', label: 'Statut', value: filters.status });

    return badges;
  };

  return (
    <WindowsCard className="mb-6">
      <WindowsCardContent className="p-6">
        <div className="space-y-4">
          {/* Main Search Bar */}
          <div className="relative">
            <div className="relative flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par code, désignation, marque... (ex: 'stock bas', 'céramique', 'roulement')"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Search Suggestions */}
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                    onClick={() => handleFilterChange('query', suggestion)}
                  >
                    <div className="flex items-center space-x-2">
                      <Search className="w-3 h-3 text-gray-400" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Filter Badges */}
          {getFilterBadges().length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getFilterBadges().map((badge) => (
                <Badge
                  key={badge.key}
                  variant="secondary"
                  className="flex items-center space-x-1 px-2 py-1"
                >
                  <span className="text-xs">{badge.label}: {badge.value}</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-600"
                    onClick={() => handleFilterChange(badge.key, "")}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau de Stock</label>
                <Select value={filters.stockLevel} onValueChange={(value) => handleFilterChange('stockLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous niveaux</SelectItem>
                    <SelectItem value="critical">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>Stock critique</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Stock bas</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="normal">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>Stock normal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">Stock élevé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fourchette de Prix</label>
                <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous prix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous prix</SelectItem>
                    <SelectItem value="0-10">0€ - 10€</SelectItem>
                    <SelectItem value="10-50">10€ - 50€</SelectItem>
                    <SelectItem value="50-100">50€ - 100€</SelectItem>
                    <SelectItem value="100-500">100€ - 500€</SelectItem>
                    <SelectItem value="500+">500€+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <Select value={filters.supplier} onValueChange={(value) => handleFilterChange('supplier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous fournisseurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous fournisseurs</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="discontinued">Discontinué</SelectItem>
                    <SelectItem value="new">Nouveau</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Quick Analytics Insights */}
          {showAnalytics && filters.query && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-sm">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Recherche Intelligente</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Utilisez des termes comme "stock bas", "cher", "récent" pour des suggestions automatiques
                  </p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-sm">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Recherche Floue</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Pas besoin d'orthographe exacte - nous trouvons les articles similaires
                  </p>
                </div>

                <div className="bg-amber-50 p-3 rounded-sm">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Filtres Combinés</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Combinez plusieurs filtres pour des résultats précis
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </WindowsCardContent>
    </WindowsCard>
  );
}