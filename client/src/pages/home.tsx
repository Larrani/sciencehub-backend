import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContentFilters } from "@shared/schema";
import Header from "@/components/header";
import Footer from "@/components/footer";
import SearchFilters from "@/components/search-filters";
import ContentCard from "@/components/content-card";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function Home() {
  const [filters, setFilters] = useState<ContentFilters>({
    search: "",
    category: "all",
    type: "all",
    sort: "newest",
  });

  const { data: content = [], isLoading, error } = useQuery({
    queryKey: ['/api/content', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const res = await fetch(`/api/content?${params}`);
      if (!res.ok) throw new Error('Failed to fetch content');
      return res.json();
    },
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Welcome to ScienceHeaven
          </h1>
          <p className="text-lg lg:text-xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">Discover thought-provoking articles and videos where technology meets spirituality — exploring innovation, consciousness, and the deeper questions of our time.</p>
          
          <SearchFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </section>
      {/* Content Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="bg-gray-700 h-48 rounded mb-4"></div>
                      <div className="bg-gray-700 h-4 rounded mb-2"></div>
                      <div className="bg-gray-700 h-4 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-500 text-lg">Failed to load content</div>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-16">
              <Search className="mx-auto h-16 w-16 text-gray-600 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-400 mb-4">No content found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-4xl text-blue-500 mb-6">📧</div>
            <h2 className="text-3xl font-bold mb-4">Stay Updated with Science & Spirituality</h2>
            <p className="text-gray-400 mb-8">Subscribe to our newsletter and never miss the latest discoveries in science and spirituality.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
