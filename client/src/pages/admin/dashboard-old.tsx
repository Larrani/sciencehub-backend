import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Video, 
  LogOut
} from "lucide-react";
import logoPath from "@assets/SCIENCE HEAVEN ICON PNG_1751016773425.png";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: content = [], isLoading: contentLoading } = useQuery({
    queryKey: ['/api/admin/content'],
    enabled: isAuthenticated && user?.isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      physics: "bg-blue-600",
      chemistry: "bg-red-600", 
      biology: "bg-green-600",
      astronomy: "bg-purple-600",
      technology: "bg-orange-600",
    };
    return colors[category as keyof typeof colors] || "bg-gray-600";
  };

  if (isLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-lg mb-4">Access Denied</div>
            <p className="text-gray-400">Admin privileges required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={logoPath} alt="ScienceHeaven" className="h-8 w-8" />
              <h1 className="text-xl font-bold">ScienceHeaven Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Welcome, {user.firstName || user.email}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{content.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {content.filter(item => item.type === 'article').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {content.filter(item => item.type === 'video').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {content.filter(item => item.published).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Content Management</h2>
          <Link href="/admin/content/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </Link>
        </div>

        {/* Content List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-0">
            {content.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No content available. Create your first piece of content.
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {content.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {item.type === 'article' ? (
                            <FileText className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Video className="h-5 w-5 text-green-500" />
                          )}
                          <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                          <Badge className={`${getCategoryColor(item.category)} text-white`}>
                            {item.category}
                          </Badge>
                          {!item.published && (
                            <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                              Draft
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{item.excerpt}</p>
                        <div className="text-xs text-gray-500">
                          By {item.author} • {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/admin/content/${item.id}/edit`}>
                          <Button variant="outline" size="sm" className="border-gray-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                          className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
