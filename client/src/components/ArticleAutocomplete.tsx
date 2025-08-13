import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Article } from "@shared/schema";

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

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const filteredArticles = articles.filter((article) => {
    const searchLower = search.toLowerCase();
    return (
      article.nom.toLowerCase().includes(searchLower) ||
      article.reference.toLowerCase().includes(searchLower) ||
      article.description?.toLowerCase().includes(searchLower) ||
      article.emplacement?.toLowerCase().includes(searchLower)
    );
  });

  const selectedArticle = articles.find((article) => article.id === value);

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
                <span className="font-medium">{selectedArticle.nom}</span>
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
            placeholder="Tapez pour rechercher..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Aucun article trouvé.</CommandEmpty>
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
                      <span className="font-medium">{article.nom}</span>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Réf: {article.reference}</span>
                        <span>Stock: {article.stockActuel}</span>
                        {article.prixUnitaire && (
                          <span>Prix: {article.prixUnitaire}€</span>
                        )}
                      </div>
                      {article.description && (
                        <span className="text-xs text-gray-400 mt-1 max-w-[300px] truncate">
                          {article.description}
                        </span>
                      )}
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