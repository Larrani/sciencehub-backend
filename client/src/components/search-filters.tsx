import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ContentFilters } from "@shared/schema";

interface SearchFiltersProps {
  filters: ContentFilters;
  onFiltersChange: (filters: ContentFilters) => void;
}

export default function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const categories = [
    { value: 'all', label: 'All' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'astronomy', label: 'Astronomy' },
    { value: 'technology', label: 'Technology' },
  ];

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category: category as ContentFilters['category'] });
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({ ...filters, type: type as ContentFilters['type'] });
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({ ...filters, sort: sort as ContentFilters['sort'] });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Bar */}
      <div className="relative mb-6">
        <Input 
          type="text" 
          placeholder="Search articles and videos..." 
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-6 py-4 pl-12 bg-gray-800 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-400 mr-2">Category:</span>
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={filters.category === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category.value)}
              className={
                filters.category === category.value
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Type and Sort Filters */}
        <div className="flex gap-4">
          <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="article">Articles</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.sort || 'newest'} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
