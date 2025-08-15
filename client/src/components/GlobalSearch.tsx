import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Package, 
  Building, 
  ShoppingCart, 
  Users, 
  Truck, 
  LogOut,
  Clock
} from "lucide-react";
import { useLocation } from "wouter";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  extra: string;
  path: string;
  data: any;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  categories: {
    articles: number;
    suppliers: number;
    requests: number;
    requestors: number;
    receptions: number;
    outbounds: number;
  };
}

export default function GlobalSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [, setLocation] = useLocation();
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery<SearchResponse>({
    queryKey: [`/api/search/global?query=${encodeURIComponent(debouncedQuery)}`],
    enabled: debouncedQuery.length >= 2,
  });

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show/hide results based on query and data
  useEffect(() => {
    setShowResults(debouncedQuery.length >= 2 && ((searchResults?.results?.length ?? 0) > 0 || isLoading));
  }, [debouncedQuery, searchResults, isLoading]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return Package;
      case 'supplier': return Building;
      case 'purchase-request': return ShoppingCart;
      case 'requestor': return Users;
      case 'reception': return Truck;
      case 'outbound': return LogOut;
      default: return Search;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'article': return 'Article';
      case 'supplier': return 'Fournisseur';
      case 'purchase-request': return 'Demande';
      case 'requestor': return 'Demandeur';
      case 'reception': return 'Réception';
      case 'outbound': return 'Sortie';
      default: return 'Résultat';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'supplier': return 'bg-green-100 text-green-800';
      case 'purchase-request': return 'bg-orange-100 text-orange-800';
      case 'requestor': return 'bg-purple-100 text-purple-800';
      case 'reception': return 'bg-indigo-100 text-indigo-800';
      case 'outbound': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setLocation(result.path);
    setSearchQuery("");
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-8" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Rechercher articles, fournisseurs, demandes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => debouncedQuery.length >= 2 && setShowResults(true)}
          className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 rounded-lg focus:bg-white focus:border-windows-blue focus:ring-1 focus:ring-windows-blue"
        />

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Recherche en cours...
              </div>
            ) : (searchResults?.results?.length ?? 0) > 0 ? (
              <>
                {/* Results Header */}
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {searchResults?.totalCount ?? 0} résultat(s) trouvé(s)
                    </span>
                    <div className="flex items-center space-x-2">
                      {Object.entries(searchResults?.categories ?? {}).map(([key, count]) => 
                        count > 0 && (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {getTypeLabel(key)}: {count}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Results */}
                <div className="py-2">
                  {(searchResults?.results ?? []).map((result, index) => {
                    const Icon = getTypeIcon(result.type);
                    return (
                      <div
                        key={`${result.type}-${result.id}-${index}`}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-blue-500 transition-colors"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            <Icon className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {result.title}
                              </h4>
                              <Badge className={`text-xs ${getTypeColor(result.type)}`}>
                                {getTypeLabel(result.type)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 truncate mb-1">
                              {result.subtitle}
                            </p>
                            {result.extra && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {result.extra}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View All Results Footer */}
                {(searchResults?.totalCount ?? 0) > (searchResults?.results?.length ?? 0) && (
                  <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                    <span className="text-xs text-gray-500">
                      Affichage de {searchResults?.results?.length ?? 0} sur {searchResults?.totalCount ?? 0} résultats
                    </span>
                  </div>
                )}
              </>
            ) : debouncedQuery.length >= 2 && (
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun résultat trouvé pour "{debouncedQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">
                  Essayez avec des termes différents
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}