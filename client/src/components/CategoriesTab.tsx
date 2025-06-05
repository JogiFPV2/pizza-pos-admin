
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Category, CreateCategoryInput } from '../../../server/src/schema';

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: ''
  });

  const loadCategories = useCallback(async () => {
    try {
      const result = await trpc.getCategories.query();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const newCategory = await trpc.createCategory.mutate(formData);
      setCategories((prev: Category[]) => [...prev, newCategory]);
      setFormData({ name: '' });
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteCategory.mutate(id);
      setCategories((prev: Category[]) => prev.filter(category => category.id !== id));
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              placeholder="Category name (e.g., Pizzas, Drinks, Desserts)"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ name: e.target.value })
              }
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isLoading} className="bg-purple-500 hover:bg-purple-600">
              {isLoading ? 'Adding...' : 'Add Category'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle>Existing Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No categories yet. Add your first menu category above! 📂
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((category: Category) => (
                <div key={category.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                      #{category.id}
                    </Badge>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Created: {category.created_at.toLocaleDateString()}
                    </span>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
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
