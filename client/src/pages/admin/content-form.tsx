import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertContentSchema, updateContentSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Atom } from "lucide-react";
import { z } from "zod";

const formSchema = insertContentSchema.extend({
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ContentForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);

  const isEdit = !!id;

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

  const { data: existingContent } = useQuery({
    queryKey: [`/api/content/${id}`],
    enabled: isEdit && !!id,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      body: "",
      category: "physics",
      type: "article",
      author: "",
      tags: "",
      videoUrl: "",
      published: true,
    },
  });

  // Set form values when editing
  useEffect(() => {
    if (existingContent && isEdit) {
      form.reset({
        title: existingContent.title,
        excerpt: existingContent.excerpt || "",
        body: existingContent.body || "",
        category: existingContent.category,
        type: existingContent.type,
        author: existingContent.author,
        tags: existingContent.tags?.join(", ") || "",
        videoUrl: existingContent.videoUrl || "",
        published: existingContent.published,
      });
    }
  }, [existingContent, isEdit, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      
      // Convert form data to FormData for file upload
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(value ? value.split(',').map(tag => tag.trim()) : []));
        } else {
          formData.append(key, String(value));
        }
      });

      if (featuredImageFile) {
        formData.append('featuredImage', featuredImageFile);
      }

      const url = isEdit ? `/api/admin/content/${id}` : '/api/admin/content';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content'] });
      toast({
        title: "Success",
        description: `Content ${isEdit ? 'updated' : 'created'} successfully`,
      });
      navigate('/admin');
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
        description: `Failed to ${isEdit ? 'update' : 'create'} content`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
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
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Atom className="h-6 w-6 text-blue-500" />
              <h1 className="text-lg font-bold">
                {isEdit ? 'Edit Content' : 'Create Content'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {isEdit ? 'Edit Content' : 'Create New Content'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-white">Title</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter content title"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type" className="text-white">Type</Label>
                  <Select onValueChange={(value) => form.setValue('type', value as 'article' | 'video')}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category" className="text-white">Category</Label>
                  <Select onValueChange={(value) => form.setValue('category', value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="astronomy">Astronomy</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Author */}
              <div>
                <Label htmlFor="author" className="text-white">Author</Label>
                <Input
                  id="author"
                  {...form.register('author')}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter author name"
                />
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...form.register('excerpt')}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Brief description of the content"
                  rows={3}
                />
              </div>

              {/* Video URL (conditional) */}
              {form.watch('type') === 'video' && (
                <div>
                  <Label htmlFor="videoUrl" className="text-white">Video URL</Label>
                  <Input
                    id="videoUrl"
                    {...form.register('videoUrl')}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter video URL"
                  />
                </div>
              )}

              {/* Body Content */}
              <div>
                <Label htmlFor="body" className="text-white">
                  {form.watch('type') === 'video' ? 'Description' : 'Article Content'}
                </Label>
                <Textarea
                  id="body"
                  {...form.register('body')}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder={form.watch('type') === 'video' ? 'Enter video description' : 'Enter article content'}
                  rows={10}
                />
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags" className="text-white">Tags</Label>
                <Input
                  id="tags"
                  {...form.register('tags')}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* Featured Image */}
              <div>
                <Label htmlFor="featuredImage" className="text-white">Featured Image</Label>
                <Input
                  id="featuredImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFeaturedImageFile(e.target.files?.[0] || null)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB
                </p>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={form.watch('published')}
                  onCheckedChange={(checked) => form.setValue('published', checked)}
                />
                <Label htmlFor="published" className="text-white">
                  Published
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={mutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {mutation.isPending ? 'Saving...' : (isEdit ? 'Update Content' : 'Create Content')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
