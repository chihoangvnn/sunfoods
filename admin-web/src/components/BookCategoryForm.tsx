import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { X, Save, Tag, Palette, Hash, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { normalizeVietnamese } from "@/utils/vietnameseSearch";
import type { BookCategory } from "@shared/schema";

interface BookCategoryFormProps {
  category?: BookCategory | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const COLOR_PRESETS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
];

const generateSlug = (text: string): string => {
  if (!text) return '';
  
  return normalizeVietnamese(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export function BookCategoryForm({ category, onClose, onSuccess }: BookCategoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = Boolean(category);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: null as string | null,
    level: 0,
    description: "",
    icon: "",
    color: "#3b82f6",
    sortOrder: 0,
    isActive: true,
    isFeatured: false,
    amazonCategoryId: "",
    amazonBestsellerUrl: "",
    metaTitle: "",
    metaDescription: "",
  });

  const [autoSlug, setAutoSlug] = useState(true);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        parentId: category.parentId || null,
        level: category.level || 0,
        description: category.description || "",
        icon: category.icon || "",
        color: category.color || "#3b82f6",
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive ?? true,
        isFeatured: category.isFeatured ?? false,
        amazonCategoryId: category.amazonCategoryId || "",
        amazonBestsellerUrl: category.amazonBestsellerUrl || "",
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
      });
      setAutoSlug(false);
    }
  }, [category]);

  const { data: categories = [] } = useQuery<BookCategory[]>({
    queryKey: ['/api/book-categories'],
  });

  const parentCategories = categories.filter(c => 
    !isEditing || c.id !== category?.id
  );

  const createUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = isEditing ? `/api/book-categories/${category!.id}` : '/api/book-categories';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/book-categories'] });
      toast({
        title: "Success",
        description: isEditing ? "Category has been updated" : "Category has been created successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
    if (autoSlug) {
      setFormData({ ...formData, name, slug: generateSlug(name) });
    }
  };

  const handleSlugChange = (slug: string) => {
    setAutoSlug(false);
    setFormData({ ...formData, slug: generateSlug(slug) });
  };

  const handleParentChange = (parentId: string) => {
    const parent = categories.find(c => c.id === parentId);
    const level = parent ? (parent.level || 0) + 1 : 0;
    setFormData({ ...formData, parentId: parentId || null, level });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter category name",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Please enter slug",
        variant: "destructive",
      });
      return;
    }

    const categoryData = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      parentId: formData.parentId || null,
      level: formData.level,
      description: formData.description.trim() || null,
      icon: formData.icon.trim() || null,
      color: formData.color,
      sortOrder: formData.sortOrder,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      amazonCategoryId: formData.amazonCategoryId.trim() || null,
      amazonBestsellerUrl: formData.amazonBestsellerUrl.trim() || null,
      metaTitle: formData.metaTitle.trim() || null,
      metaDescription: formData.metaDescription.trim() || null,
    };

    createUpdateMutation.mutate(categoryData);
  };

  const renderCategoryHierarchy = (cat: BookCategory, depth: number = 0): JSX.Element => {
    const prefix = '└─ '.repeat(depth);
    return (
      <SelectItem key={cat.id} value={cat.id}>
        {prefix}{cat.icon ? `${cat.icon} ` : ''}{cat.name}
      </SelectItem>
    );
  };

  const buildCategoryTree = () => {
    const rootCategories = parentCategories.filter(c => !c.parentId);
    const result: JSX.Element[] = [];

    const addChildren = (parent: BookCategory, depth: number = 0) => {
      result.push(renderCategoryHierarchy(parent, depth));
      const children = parentCategories.filter(c => c.parentId === parent.id);
      children.forEach(child => addChildren(child, depth + 1));
    };

    rootCategories.forEach(root => addChildren(root));
    return result;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Book Category' : 'Create New Book Category'}
              </h2>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">Category Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Example: Children's Literature"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="childrens-literature"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {autoSlug ? '🤖 Auto-generated from name' : '✏️ Manual edit'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="parentId">Parent Category</Label>
                    <Select 
                      value={formData.parentId || "none"} 
                      onValueChange={(value) => handleParentChange(value === "none" ? "" : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None (Root Category)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Root Category)</SelectItem>
                        {buildCategoryTree()}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Input
                      id="level"
                      type="number"
                      value={formData.level}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto-calculated from parent category
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description about this book category"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Display and Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon">Icon (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="📚"
                      maxLength={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter emoji as icon
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="sortOrder">Sort Order</Label>
                    <Input
                      id="sortOrder"
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 mb-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            formData.color === preset.value 
                              ? 'border-foreground scale-110' 
                              : 'border-muted-foreground/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: preset.value }}
                          onClick={() => setFormData({ ...formData, color: preset.value })}
                          title={preset.name}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2 mb-3">
                      <Eye className="h-4 w-4" />
                      Preview
                    </Label>
                    <div className="flex gap-3">
                      <div 
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: formData.color }}
                      >
                        {formData.icon && <span className="text-xl">{formData.icon}</span>}
                        <span>{formData.name || 'Category Name'}</span>
                      </div>
                      
                      <div 
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border-2"
                        style={{ 
                          borderColor: formData.color,
                          color: formData.color,
                        }}
                      >
                        {formData.icon && <span>{formData.icon}</span>}
                        <span>{formData.name || 'Category Name'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Activate category
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked as boolean })}
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Featured category
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Amazon Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="amazonCategoryId">Amazon Category ID</Label>
                    <Input
                      id="amazonCategoryId"
                      value={formData.amazonCategoryId}
                      onChange={(e) => setFormData({ ...formData, amazonCategoryId: e.target.value })}
                      placeholder="Example: books-literature-fiction"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amazonBestsellerUrl">Amazon Bestseller URL</Label>
                    <Input
                      id="amazonBestsellerUrl"
                      type="url"
                      value={formData.amazonBestsellerUrl}
                      onChange={(e) => setFormData({ ...formData, amazonBestsellerUrl: e.target.value })}
                      placeholder="https://www.amazon.com/..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SEO and Marketing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="SEO optimized title"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Brief description for search engines"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createUpdateMutation.isPending}
              className="min-w-[100px]"
            >
              {createUpdateMutation.isPending ? (
                "Saving..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
