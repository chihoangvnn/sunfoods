import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit3, Trash2, Save, X, Monitor, Layers, Settings } from "lucide-react";

// TypeScript interfaces
interface FrontendCategoryAssignment {
  id: string;
  frontendId: string;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  industryId: string;
  isActive: boolean;
  sortOrder: number;
}

interface AssignmentFormData {
  frontendId: string;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
}

export default function FrontendManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<FrontendCategoryAssignment | null>(null);
  const [selectedFrontend, setSelectedFrontend] = useState<string>("all");

  // Predefined frontend IDs
  const frontends = [
    { id: "frontend-a", name: "Frontend A", description: "Nhang sạch chính" },
    { id: "frontend-b", name: "Frontend B", description: "Nhang cao cấp" },
    { id: "frontend-c", name: "Frontend C", description: "Phân phối đặc biệt" }
  ];

  const [formData, setFormData] = useState<AssignmentFormData>({
    frontendId: "",
    categoryId: "",
    sortOrder: 1,
    isActive: true
  });

  // Fetch all frontend category assignments
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["frontend-category-assignments"],
    queryFn: async (): Promise<FrontendCategoryAssignment[]> => {
      const response = await fetch("/api/frontend-categories");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      return await response.json();
    }
  });

  // Fetch all categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return await response.json();
    }
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: Omit<AssignmentFormData, 'id'>) => {
      const response = await fetch("/api/frontend-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentData)
      });
      if (!response.ok) throw new Error("Failed to create assignment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frontend-category-assignments"] });
      setShowForm(false);
      resetForm();
      toast({
        title: "✅ Assignment Created",
        description: "Category assignment created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update assignment mutation
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, ...assignmentData }: Partial<AssignmentFormData> & { id: string }) => {
      const response = await fetch(`/api/frontend-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignmentData)
      });
      if (!response.ok) throw new Error("Failed to update assignment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frontend-category-assignments"] });
      setEditingAssignment(null);
      setShowForm(false);
      resetForm();
      toast({
        title: "✅ Assignment Updated",
        description: "Category assignment updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/frontend-categories/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete assignment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frontend-category-assignments"] });
      toast({
        title: "✅ Assignment Deleted",
        description: "Category assignment removed successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      frontendId: "",
      categoryId: "",
      sortOrder: 1,
      isActive: true
    });
    setEditingAssignment(null);
  };

  const handleCreate = () => {
    setShowForm(true);
    resetForm();
  };

  const handleEdit = (assignment: FrontendCategoryAssignment) => {
    setEditingAssignment(assignment);
    setFormData({
      frontendId: assignment.frontendId,
      categoryId: assignment.categoryId,
      sortOrder: assignment.sortOrder,
      isActive: assignment.isActive
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.frontendId || !formData.categoryId) {
      toast({
        title: "❌ Validation Error",
        description: "Please select both frontend and category",
        variant: "destructive"
      });
      return;
    }

    if (editingAssignment) {
      updateAssignmentMutation.mutate({
        id: editingAssignment.id,
        ...formData
      });
    } else {
      createAssignmentMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      deleteAssignmentMutation.mutate(id);
    }
  };

  // Filter assignments by selected frontend
  const filteredAssignments = selectedFrontend === "all" 
    ? assignments 
    : assignments.filter(a => a.frontendId === selectedFrontend);

  // Group assignments by frontend for overview
  const assignmentsByFrontend = frontends.map(frontend => ({
    ...frontend,
    assignments: assignments.filter(a => a.frontendId === frontend.id),
    categoryCount: assignments.filter(a => a.frontendId === frontend.id).length
  }));

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "Unknown Category";
  };

  const getFrontendName = (frontendId: string) => {
    return frontends.find(f => f.id === frontendId)?.name || "Unknown Frontend";
  };

  if (isLoadingAssignments || isLoadingCategories) {
    return (
      <div className="p-6">
        <div className="text-center">Loading frontend management...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layers className="text-blue-600" />
            Frontend Management
          </h1>
          <p className="text-gray-600 mt-1">
            Assign categories to different frontends for customized product catalogs
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus size={16} />
          New Assignment
        </Button>
      </div>

      {/* Frontend Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assignmentsByFrontend.map(frontend => (
          <Card key={frontend.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor size={18} className="text-blue-600" />
                {frontend.name}
              </CardTitle>
              <CardDescription>{frontend.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Categories assigned:</span>
                <Badge variant="secondary">{frontend.categoryCount}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {frontend.assignments.slice(0, 3).map(assignment => (
                  <Badge key={assignment.id} variant="outline" className="text-xs">
                    {getCategoryName(assignment.categoryId)}
                  </Badge>
                ))}
                {frontend.categoryCount > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{frontend.categoryCount - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={18} />
            Filter Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="frontend-filter">Frontend</Label>
              <Select value={selectedFrontend} onValueChange={setSelectedFrontend}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frontend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frontends</SelectItem>
                  {frontends.map(frontend => (
                    <SelectItem key={frontend.id} value={frontend.id}>
                      {frontend.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frontend">Frontend *</Label>
                  <Select 
                    value={formData.frontendId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, frontendId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frontend" />
                    </SelectTrigger>
                    <SelectContent>
                      {frontends.map(frontend => (
                        <SelectItem key={frontend.id} value={frontend.id}>
                          {frontend.name} - {frontend.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.isActive).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="1"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                  />
                  <Label htmlFor="isActive">Global Access (All Customers)</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createAssignmentMutation.isPending || updateAssignmentMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingAssignment ? "Update" : "Create"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>Category Assignments</CardTitle>
          <CardDescription>
            Showing {filteredAssignments.length} assignment(s)
            {selectedFrontend !== "all" && ` for ${getFrontendName(selectedFrontend)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Layers size={48} className="mx-auto mb-4 opacity-50" />
              <p>No assignments found</p>
              <p className="text-sm">Create your first category assignment to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssignments
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{getFrontendName(assignment.frontendId)}</Badge>
                      <span className="font-medium">{getCategoryName(assignment.categoryId)}</span>
                      <Badge variant={assignment.isActive ? "default" : "secondary"}>
                        {assignment.isActive ? "Global" : "VIP Only"}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Sort Order: {assignment.sortOrder}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(assignment)}
                      className="flex items-center gap-1"
                    >
                      <Edit3 size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(assignment.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}