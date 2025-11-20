import { Search, Filter } from 'lucide-react';
import { Input, Button } from '../ui';
import type { CategoryId } from '../../types';
import { CATEGORY_ICONS } from '../../types';

interface SealFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryId | 'all';
  onCategoryChange: (category: CategoryId | 'all') => void;
  categories: Array<{ id: string; name: string; icon: string }>;
}

export function SealFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: SealFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <Input
        placeholder="Buscar Digimon o ubicación..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        icon={<Search size={18} />}
      />

      {/* Filtros de categoría */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onCategoryChange('all')}
        >
          📋 Todas
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onCategoryChange(cat.id as CategoryId)}
          >
            {cat.icon} {cat.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
