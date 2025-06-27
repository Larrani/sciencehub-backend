import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Play } from "lucide-react";
import { Content } from "@shared/schema";

interface ContentCardProps {
  content: Content;
}

export default function ContentCard({ content }: ContentCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      physics: "category-physics",
      chemistry: "category-chemistry", 
      biology: "category-biology",
      astronomy: "category-astronomy",
      technology: "category-technology",
    };
    return colors[category as keyof typeof colors] || "bg-gray-600";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-gray-900 border-gray-800 hover:shadow-2xl transition-all duration-300 hover:border-gray-700 group overflow-hidden">
      {/* Featured Image */}
      {content.featuredImage && (
        <div className="relative">
          <img 
            src={content.featuredImage} 
            alt={content.title}
            className="w-full h-48 object-cover"
          />
          {content.type === 'video' && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <Play className="h-12 w-12 text-white group-hover:text-blue-400 transition-colors" />
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`${getCategoryColor(content.category)} text-white capitalize`}>
            {content.category}
          </Badge>
          <div className="flex items-center text-gray-400 text-sm">
            {content.type === 'article' ? (
              <FileText className="h-4 w-4 mr-1" />
            ) : (
              <Video className="h-4 w-4 mr-1" />
            )}
            <span className="capitalize">{content.type}</span>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-2">
          {content.title}
        </h3>

        {content.excerpt && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {content.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{content.author}</span>
          <span>{formatDate(content.createdAt)}</span>
        </div>

        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {content.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs border-gray-700 text-gray-400"
              >
                {tag}
              </Badge>
            ))}
            {content.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                +{content.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
