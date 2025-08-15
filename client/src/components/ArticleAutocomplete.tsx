import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { articles } from "@shared/schema";

type Article = typeof articles.$inferSelect;

interface ArticleAutocompleteProps {
  value?: string;
  onSelect: (articleId: string, article: Article) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ArticleAutocomplete({ 
  value, 
  onSelect, 
  placeholder = "Rechercher un article...",
  disabled = false 
}: ArticleAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Use search endpoint when search term is 3+ characters
  const { data: searchResults = [], isLoading: isSearching } = useQuery<Article[]>({
    queryKey: [`/api/articles/search?query=${encodeURIComponent(search)}`],
    enabled: search.length >= 3,
  });

  // Fallback to all articles for initial load and selection display
  const { data: allArticles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const filteredArticles = search.length >= 3 ? searchResults : [];
  
  // Debug logging
  console.log('ArticleAutocomplete Debug:', {
    search,
    searchLength: search.length,
    searchResults,
    filteredArticles,
    isSearching
  });

  const selectedArticle = allArticles.find((article) => article.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center space-x-2 flex-1">
            <Package className="w-4 h-4 text-gray-500" />
            {selectedArticle ? (
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">{selectedArticle.designation}</span>
                <span className="text-xs text-gray-500">
                  {selectedArticle.reference} • Stock: {selectedArticle.stockActuel}
                </span>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Tapez au moins 3 caractères pour rechercher..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {isSearching 
                ? "Recherche en cours..." 
                : search.length < 3 
                  ? "Tapez au moins 3 caractères..." 
                  : "Aucun article trouvé."}
            </CommandEmpty>
            <CommandGroup>
              {filteredArticles.slice(0, 10).map((article) => (
                <CommandItem
                  key={article.id}
                  value={article.id}
                  onSelect={() => {
                    onSelect(article.id, article);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center justify-between p-3"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col">
                      <span className="font-medium">{article.designation}</span>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Réf: {article.reference}</span>
                        <span>Stock: {article.stockActuel}</span>
                        {article.prixUnitaire && (
                          <span>Prix: {article.prixUnitaire}€</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 mt-1 max-w-[300px] truncate">
                        {article.categorie} - {article.codeArticle}
                      </span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === article.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}