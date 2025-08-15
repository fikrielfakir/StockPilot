import { useState, useEffect, useMemo, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { BulkOperations, useItemSelection, type BulkOperationType } from "./BulkOperations";
import { ToastManager } from "./ToastNotifications";

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  render?: (item: T, value: any) => React.ReactNode;
  className?: string;
}

interface VirtualizedDataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  itemHeight?: number;
  height?: number;
  searchable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  onItemClick?: (item: T) => void;
  onItemEdit?: (item: T) => void;
  onItemDelete?: (item: T) => void;
  onBulkOperation?: (operation: any, selectedItems: T[]) => Promise<void>;
  availableBulkOperations?: BulkOperationType[];
  loading?: boolean;
  emptyMessage?: string;
}

export function VirtualizedDataTable<T extends { id: string }>({
  data,
  columns,
  itemHeight = 60,
  height = 400,
  searchable = true,
  sortable = true,
  selectable = false,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onBulkOperation,
  availableBulkOperations = ['delete', 'export'],
  loading = false,
  emptyMessage = "Aucune donnée disponible"
}: VirtualizedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const listRef = useRef<List>(null);
  
  const {
    selectedItems,
    setSelectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection
  } = useItemSelection<T>();

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        columns.some(col => {
          const value = getNestedValue(item, col.key as string);
          return String(value || '').toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => {
          const itemValue = getNestedValue(item, key);
          return String(itemValue || '').toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = getNestedValue(a, sortConfig.key);
        const bVal = getNestedValue(b, sortConfig.key);
        
        if (aVal === bVal) return 0;
        
        const result = aVal > bVal ? 1 : -1;
        return sortConfig.direction === 'asc' ? result : -result;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, filters, columns]);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    setSortConfig(prev => {
      if (prev?.key === columnKey) {
        return prev.direction === 'asc' 
          ? { key: columnKey, direction: 'desc' }
          : null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === processedData.length) {
      clearSelection();
    } else {
      selectAll(processedData);
    }
  };

  const handleBulkOperation = async (operation: any) => {
    if (!onBulkOperation) return;
    
    try {
      await onBulkOperation(operation, selectedItems);
      clearSelection();
    } catch (error) {
      ToastManager.error('Erreur lors de l\'opération groupée');
    }
  };

  // Row renderer for react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = processedData[index];
    const selected = isSelected(item);

    return (
      <div style={style} className={`flex items-center border-b hover:bg-muted/50 ${selected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
        {selectable && (
          <div className="w-12 px-4">
            <Checkbox
              checked={selected}
              onCheckedChange={() => toggleSelection(item)}
              className="h-4 w-4"
            />
          </div>
        )}
        
        {columns.map((column, columnIndex) => {
          const value = getNestedValue(item, column.key as string);
          const content = column.render ? column.render(item, value) : String(value || '');
          
          return (
            <div
              key={`${column.key as string}-${columnIndex}`}
              className={`px-4 py-2 ${column.className || ''} ${column.width ? '' : 'flex-1'}`}
              style={column.width ? { width: column.width, minWidth: column.width } : {}}
              onClick={() => onItemClick?.(item)}
            >
              {content}
            </div>
          );
        })}
        
        {(onItemEdit || onItemDelete) && (
          <div className="w-16 px-4">
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              // Show action menu
            }}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Chargement des données...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      {(searchable || columns.some(col => col.filterable)) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {searchable && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans tous les champs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}
              
              {columns.filter(col => col.filterable).map((column) => (
                <div key={column.key as string} className="min-w-48">
                  <Input
                    placeholder={`Filtrer ${column.header}...`}
                    value={filters[column.key as string] || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      [column.key as string]: e.target.value
                    }))}
                  />
                </div>
              ))}
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {processedData.length} résultat{processedData.length > 1 ? 's' : ''}
                </Badge>
                {(searchTerm || Object.values(filters).some(f => f)) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({});
                    }}
                  >
                    Effacer
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Operations */}
      {selectable && hasSelection && (
        <BulkOperations
          selectedItems={selectedItems}
          onSelectionChange={setSelectedItems}
          onOperation={handleBulkOperation}
          itemType="élément"
          availableOperations={availableBulkOperations}
        />
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {processedData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="border-b bg-muted/30">
                <div className="flex items-center">
                  {selectable && (
                    <div className="w-12 px-4 py-3">
                      <Checkbox
                        checked={selectedItems.length === processedData.length && processedData.length > 0}
                        indeterminate={selectedItems.length > 0 && selectedItems.length < processedData.length}
                        onCheckedChange={handleSelectAll}
                        className="h-4 w-4"
                      />
                    </div>
                  )}
                  
                  {columns.map((column, index) => (
                    <div
                      key={`header-${column.key as string}-${index}`}
                      className={`px-4 py-3 font-medium text-sm ${column.className || ''} ${column.width ? '' : 'flex-1'} ${column.sortable !== false && sortable ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                      style={column.width ? { width: column.width, minWidth: column.width } : {}}
                      onClick={() => column.sortable !== false && handleSort(column.key as string)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.header}</span>
                        {column.sortable !== false && sortable && (
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                        )}
                        {sortConfig?.key === column.key && (
                          <Badge variant="secondary" className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(onItemEdit || onItemDelete) && (
                    <div className="w-16 px-4 py-3">
                      <span className="text-sm font-medium">Actions</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Virtualized List */}
              <List
                ref={listRef}
                height={height}
                itemCount={processedData.length}
                itemSize={itemHeight}
                className="overflow-auto"
              >
                {Row}
              </List>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}