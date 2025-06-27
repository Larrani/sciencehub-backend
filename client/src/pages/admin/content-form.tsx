import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import logoPath from "@assets/SCIENCE HEAVEN ICON PNG_1751016773425.png";
import { z } from "zod";
import { insertContentSchema, type Content } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertContentSchema.extend({
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ContentForm() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const isEdit = Boolean(id);

  // Fetch existing content for editing
  const { data: existingContent, isLoading: contentLoading } = useQuery({
    queryKey: ['/api/content', id],
    enabled: isEdit,
    queryFn: () => fetch(`/api/content/${id}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch content');
      return res.json();
    }),
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      body: "",
      category: "Physics",
      type: "article",
      author: "",
      tags: "",
      videoUrl: "",
      published: true,
    },
  });

  // Update form when existing content loads
  useEffect(() => {
    if (existingContent && isEdit) {
      const content = existingContent as Content;
      form.reset({
        title: content.title,
        excerpt: content.excerpt || "",
        body: content.body || "",
        category: content.category,
        type: content.type,
        author: content.author,
        tags: content.tags?.join(", ") || "",
        videoUrl: content.videoUrl || "",
        published: content.published,
      });
    }
  }, [existingContent, isEdit, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      
      // Convert tags string to array
      const tagsArray = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [];
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(tagsArray));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append file if selected
      if (selectedFile) {
        formData.append('featuredImage', selectedFile);
      }

      const url = isEdit ? `/api/content/${id}` : '/api/content';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save content');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content'] });
      toast({
        title: "Success",
        description: `Content ${isEdit ? 'updated' : 'created'} successfully`,
      });
      setLocation('/admin');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} content`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please select a valid image file (JPG, PNG, or WebP)",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  if (contentLoading && isEdit) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/admin')}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <img src={logoPath} alt="ScienceHeaven" className="h-6 w-6" />
              <h1 className="text-lg font-bold">
                {isEdit ? 'Edit Content' : 'Create Content'}
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">
              {isEdit ? 'Edit Content' : 'Create New Content'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter content title"
                />
                {form.formState.errors.title && (
                  <p className="text-red-400 text-sm">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Category and Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Category *</Label>
                  <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Astronomy">Astronomy</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Type *</Label>
                  <Select value={form.watch("type")} onValueChange={(value) => form.setValue("type", value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author" className="text-white">Author *</Label>
                <Input
                  id="author"
                  {...form.register("author")}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter author name"
                />
                {form.formState.errors.author && (
                  <p className="text-red-400 text-sm">{form.formState.errors.author.message}</p>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-white">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  {...form.register("excerpt")}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Brief description or excerpt"
                  rows={3}
                />
              </div>

              {/* Video URL (only for video type) */}
              {form.watch("type") === "video" && (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl" className="text-white">Video URL</Label>
                  <Input
                    id="videoUrl"
                    {...form.register("videoUrl")}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  />
                </div>
              )}

              {/* Featured Image */}
              <div className="space-y-2">
                <Label htmlFor="featuredImage" className="text-white">Featured Image</Label>
                <Input
                  id="featuredImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="bg-gray-800 border-gray-700 text-white file:bg-gray-700 file:text-white file:border-0"
                />
                <p className="text-gray-400 text-sm">
                  Supported formats: JPG, PNG, WebP. Max size: 5MB
                </p>
                {selectedFile && (
                  <p className="text-green-400 text-sm">Selected: {selectedFile.name}</p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-white">Tags</Label>
                <Input
                  id="tags"
                  {...form.register("tags")}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-gray-400 text-sm">
                  Separate multiple tags with commas (e.g., quantum, physics, research)
                </p>
              </div>

              {/* Body Content */}
              <div className="space-y-2">
                <Label htmlFor="body" className="text-white">Content</Label>
                <Textarea
                  id="body"
                  {...form.register("body")}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter the main content..."
                  rows={12}
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={form.watch("published")}
                  onCheckedChange={(checked) => form.setValue("published", checked)}
                />
                <Label htmlFor="published" className="text-white">
                  Publish immediately
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/admin')}
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {mutation.isPending ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}