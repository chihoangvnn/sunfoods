import { useState } from "react";
import { 
  FolderTree, 
  MoreHorizontal, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft,
  ToggleRight,
  Star,
  Book,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { useResponsive, useTouchFriendly } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookCategoryForm } from "./BookCategoryForm";

interface BookCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  level: number;
  sortOrder: number;
  description: string | null;
  icon: string | null;
  color: string | null;
  amazonCategoryId: string | null;
  amazonBestsellerUrl: string | null;
  bookCount: number;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BookCategoryWithChildren extends BookCategory {
  children?: BookCategoryWithChildren[];
  childrenCount?: number;
  parentName?: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US');
};

const getLevelBadge = (level: number) => {
  const levelConfig = {
    0: { 
      label: "📘 Root", 
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
    },
    1: { 
      label: "📗 Sub", 
      className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
    },
    2: { 
      label: "📕 Sub-Sub", 
      className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
    },
  };

  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig[0];
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

const getStatusBadge = (isActive: boolean) => {
  if (isActive) {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        ✅ Active
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
      ⏸️ Inactive
    </Badge>
  );
};

export function BookCategoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BookCategoryWithChildren | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<BookCategoryWithChildren | null>(null);
  const [viewingCategory, setViewingCategory] = useState<BookCategoryWithChildren | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { isMobile, isTablet } = useResponsive();
  const { touchButtonSize } = useTouchFriendly();

  const { data: categories = [], isLoading, error } = useQuery<BookCategoryWithChildren[]>({
    queryKey: ["/api/book-categories"],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/book-categories');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      await apiRequest('DELETE', `/api/book-categories/${categoryId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Category has been deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/book-categories"] });
      setDeletingCategory(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const response = await apiRequest('PUT', `/api/book-categories/${categoryId}/toggle-active`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Updated successfully",
        description: `Category has been ${data.isActive ? 'activated' : 'deactivated'}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/book-categories"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCategories = categories.filter(category => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === "all" || category.level.toString() === levelFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && category.isActive) ||
      (statusFilter === "inactive" && !category.isActive);
    const matchesFeatured = featuredFilter === "all" ||
      (featuredFilter === "featured" && category.isFeatured) ||
      (featuredFilter === "not-featured" && !category.isFeatured);
    
    return matchesSearch && matchesLevel && matchesStatus && matchesFeatured;
  });

  const checkCanDelete = async (categoryId: string): Promise<{ canDelete: boolean; reason?: string }> => {
    try {
      const childrenResponse = await apiRequest('GET', `/api/book-categories/${categoryId}/children`);
      const children = await childrenResponse.json();
      
      if (children.length > 0) {
        return { 
          canDelete: false, 
          reason: `This category has ${children.length} subcategories. Please delete or move the subcategories first.` 
        };
      }

      const booksResponse = await apiRequest('GET', `/api/book-categories/${categoryId}/books-count`);
      const { count } = await booksResponse.json();
      
      if (count > 0) {
        return { 
          canDelete: false, 
          reason: `This category has ${count} books. Please move or delete the books first.` 
        };
      }

      return { canDelete: true };
    } catch (error) {
      return { canDelete: false, reason: "Unable to check category" };
    }
  };

  const handleDeleteClick = async (category: BookCategoryWithChildren) => {
    const check = await checkCanDelete(category.id);
    if (!check.canDelete) {
      toast({
        title: "Cannot delete",
        description: check.reason,
        variant: "destructive",
      });
      return;
    }
    setDeletingCategory(category);
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
  };

  const handleToggleActive = (category: BookCategoryWithChildren) => {
    toggleActiveMutation.mutate(category.id);
  };

  const buildHierarchyPath = (category: BookCategoryWithChildren): string => {
    const parts: string[] = [];
    if (category.parentName) {
      parts.push(category.parentName);
    }
    parts.push(category.name);
    return parts.join(' → ');
  };

  const featuredCount = categories.filter(c => c.isFeatured).length;
  const activeCount = categories.filter(c => c.isActive).length;
  const totalBooks = categories.reduce((sum, c) => sum + (c.bookCount || 0), 0);

  if (isLoading) {
    return (
      <Card data-testid="book-category-table">
        <CardHeader>
          <CardTitle>Book Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="book-category-table">
        <CardHeader>
          <CardTitle>Book Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Unable to load book category data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card data-testid="book-category-table">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-blue-600" />
                <CardTitle>Book Categories</CardTitle>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  📚 {categories.length} categories
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {featuredCount} featured
                </span>
                <span className="flex items-center gap-1">
                  ✅ {activeCount} active
                </span>
                <span className="flex items-center gap-1">
                  <Book className="h-3 w-3 text-blue-500" />
                  {totalBooks} books
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                data-testid="button-create-category"
                className="md:order-last"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Category
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="category-search"
                  name="category-search"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 md:w-64"
                  data-testid="input-search-categories"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-level">
                  <Filter className="h-4 w-4 mr-2" />
                  {levelFilter === "all" ? "All Levels" : 
                   levelFilter === "0" ? "Root" :
                   levelFilter === "1" ? "Sub" : "Sub-Sub"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLevelFilter("all")}>
                  All Levels
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLevelFilter("0")}>
                  📘 Root
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLevelFilter("1")}>
                  📗 Sub
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLevelFilter("2")}>
                  📕 Sub-Sub
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-status">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter === "all" ? "All Status" : 
                   statusFilter === "active" ? "Active" : "Inactive"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                  ✅ Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                  ⏸️ Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" data-testid="button-filter-featured">
                  <Star className="h-4 w-4 mr-2" />
                  {featuredFilter === "all" ? "All" : 
                   featuredFilter === "featured" ? "Featured" : "Regular"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFeaturedFilter("all")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFeaturedFilter("featured")}>
                  ⭐ Featured
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFeaturedFilter("not-featured")}>
                  Regular
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Book Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} data-testid={`category-row-${category.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {category.level > 0 && (
                            <div className="flex items-center" style={{ marginLeft: `${category.level * 16}px` }}>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <span className="text-lg">{category.icon || '📚'}</span>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            {category.parentName && (
                              <div className="text-xs text-muted-foreground">
                                {category.parentName} → {category.name}
                              </div>
                            )}
                          </div>
                          {category.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>{getLevelBadge(category.level)}</TableCell>
                      <TableCell>{getStatusBadge(category.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="font-mono">
                          {category.bookCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingCategory(category)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(category)}>
                              {category.isActive ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(category)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Category Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete category <strong>{deletingCategory?.name}</strong>?
              <br />
              <span className="text-destructive">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isCreateDialogOpen && (
        <BookCategoryForm
          onClose={() => setIsCreateDialogOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/book-categories"] });
          }}
        />
      )}

      {editingCategory && (
        <BookCategoryForm
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/book-categories"] });
          }}
        />
      )}

      <Dialog open={!!viewingCategory} onOpenChange={(open) => !open && setViewingCategory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{viewingCategory?.icon || '📚'}</span>
              {viewingCategory?.name}
              {viewingCategory?.isFeatured && (
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              )}
            </DialogTitle>
            <DialogDescription>
              Book Category Details
            </DialogDescription>
          </DialogHeader>
          
          {viewingCategory && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Slug</Label>
                  <code className="block text-sm bg-gray-100 px-2 py-1 rounded mt-1">
                    {viewingCategory.slug}
                  </code>
                </div>
                <div>
                  <Label className="text-muted-foreground">Level</Label>
                  <div className="mt-1">
                    {getLevelBadge(viewingCategory.level)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(viewingCategory.isActive)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Books</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="font-mono">
                      {viewingCategory.bookCount || 0} books
                    </Badge>
                  </div>
                </div>
              </div>

              {viewingCategory.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{viewingCategory.description}</p>
                </div>
              )}

              {viewingCategory.parentName && (
                <div>
                  <Label className="text-muted-foreground">Hierarchy</Label>
                  <div className="text-sm mt-1 flex items-center gap-2">
                    {buildHierarchyPath(viewingCategory)}
                  </div>
                </div>
              )}

              {viewingCategory.color && (
                <div>
                  <Label className="text-muted-foreground">Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: viewingCategory.color }}
                    />
                    <code className="text-sm">{viewingCategory.color}</code>
                  </div>
                </div>
              )}

              {viewingCategory.amazonBestsellerUrl && (
                <div>
                  <Label className="text-muted-foreground">Amazon URL</Label>
                  <a 
                    href={viewingCategory.amazonBestsellerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline block mt-1 break-all"
                  >
                    {viewingCategory.amazonBestsellerUrl}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <div className="mt-1">{formatDate(viewingCategory.createdAt)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Updated</Label>
                  <div className="mt-1">{formatDate(viewingCategory.updatedAt)}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingCategory(null)}>
              Close
            </Button>
            <Button onClick={() => {
              setEditingCategory(viewingCategory);
              setViewingCategory(null);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen || !!editingCategory} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setEditingCategory(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Sửa danh mục' : 'Tạo danh mục mới'}
            </DialogTitle>
            <DialogDescription>
              Tính năng này đang được phát triển
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setEditingCategory(null);
            }}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
