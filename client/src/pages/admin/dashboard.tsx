import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Video, 
  LogOut
} from "lucide-react";
import logoPath from "@assets/SCIENCE HEAVEN ICON PNG_1751016773425.png";
import type { Content } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: adminStatus } = useQuery({
    queryKey: ['/api/admin/status'],
    retry: false,
  });

  const { data: content = [], isLoading: contentLoading } = useQuery({
    queryKey: ['/api/content'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this content?')) {
      deleteMutation.mutate(id);
    }
  };

  const admin = adminStatus?.admin;

  // Stats
  const totalContent = content.length;
  const articles = content.filter((item: Content) => item.type === 'article').length;
  const videos = content.filter((item: Content) => item.type === 'video').length;
  const published = content.filter((item: Content) => item.published).length;

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
              <span className="text-sm text-gray-400">
                Welcome, {admin?.username || 'Admin'}
              </span>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
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
              <div className="text-2xl font-bold text-white">{totalContent}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{articles}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{videos}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{published}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Content Management</h2>
          <Button 
            onClick={() => window.location.href = '/admin/content/new'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>

        {/* Content List */}
        {contentLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-400">Loading content...</div>
          </div>
        ) : (
          <div className="grid gap-4">
            {content.map((item: Content) => (
              <Card key={item.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {item.type === 'article' ? (
                          <FileText className="h-4 w-4 text-blue-400" />
                        ) : (
                          <Video className="h-4 w-4 text-red-400" />
                        )}
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <Badge 
                          variant={item.published ? "default" : "secondary"}
                          className={item.published ? "bg-green-600" : "bg-gray-600"}
                        >
                          {item.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{item.excerpt}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Category: {item.category}</span>
                        <span>Author: {item.author}</span>
                        <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/admin/content/${item.id}/edit`}
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                        className="border-red-700 text-red-400 hover:bg-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {content.length === 0 && !contentLoading && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No content yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first article or video.</p>
            <Button 
              onClick={() => window.location.href = '/admin/content/new'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}