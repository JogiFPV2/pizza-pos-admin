
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Size, CreateSizeInput } from '../../../server/src/schema';

export function SizesTab() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSizeInput>({
    name: ''
  });

  const loadSizes = useCallback(async () => {
    try {
      const result = await trpc.getSizes.query();
      setSizes(result);
    } catch (error) {
      console.error('Failed to load sizes:', error);
    }
  }, []);

  useEffect(() => {
    loadSizes();
  }, [loadSizes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const newSize = await trpc.createSize.mutate(formData);
      setSizes((prev: Size[]) => [...prev, newSize]);
      setFormData({ name: '' });
    } catch (error) {
      console.error('Failed to create size:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteSize.mutate(id);
      setSizes((prev: Size[]) => prev.filter(size => size.id !== id));
    } catch (error) {
      console.error('Failed to delete size:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Size
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              placeholder="Size name (e.g., Small, Medium, Large)"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ name: e.target.value })
              }
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
              {isLoading ? 'Adding...' : 'Add Size'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle>Existing Sizes ({sizes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {sizes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No sizes yet. Add your first pizza size above! 📏
            </p>
          ) : (
            <div className="space-y-3">
              {sizes.map((size: Size) => (
                <div key={size.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                      #{size.id}
                    </Badge>
                    <span className="font-medium text-gray-900">{size.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Created: {size.created_at.toLocaleDateString()}
                    </span>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(size.id)}
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
