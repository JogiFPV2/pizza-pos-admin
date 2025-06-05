
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Plus } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Ingredient, CreateIngredientInput, IngredientType } from '../../../server/src/schema';

export function IngredientsTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateIngredientInput>({
    name: '',
    ingredient_type_id: 0
  });

  const loadIngredients = useCallback(async () => {
    try {
      const result = await trpc.getIngredients.query();
      setIngredients(result);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
    }
  }, []);

  const loadIngredientTypes = useCallback(async () => {
    try {
      const result = await trpc.getIngredientTypes.query();
      setIngredientTypes(result);
    } catch (error) {
      console.error('Failed to load ingredient types:', error);
    }
  }, []);

  useEffect(() => {
    loadIngredients();
    loadIngredientTypes();
  }, [loadIngredients, loadIngredientTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.ingredient_type_id) return;

    setIsLoading(true);
    try {
      const newIngredient = await trpc.createIngredient.mutate(formData);
      setIngredients((prev: Ingredient[]) => [...prev, newIngredient]);
      setFormData({ name: '', ingredient_type_id: 0 });
    } catch (error) {
      console.error('Failed to create ingredient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteIngredient.mutate(id);
      setIngredients((prev: Ingredient[]) => prev.filter(ingredient => ingredient.id !== id));
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
    }
  };

  const getIngredientTypeName = (typeId: number) => {
    const type = ingredientTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Ingredient
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Ingredient name (e.g., Mozzarella, Pepperoni)"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateIngredientInput) => ({ ...prev, name: e.target.value }))
                }
                className="flex-1"
                required
              />
              <Select
                value={formData.ingredient_type_id.toString()}
                onValueChange={(value: string) =>
                  setFormData((prev: CreateIngredientInput) => ({ ...prev, ingredient_type_id: parseInt(value) }))
                }
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select ingredient type" />
                </SelectTrigger>
                <SelectContent>
                  {ingredientTypes.map((type: IngredientType) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading || ingredientTypes.length === 0} className="bg-green-500 hover:bg-green-600">
              {isLoading ? 'Adding...' : 'Add Ingredient'}
            </Button>
            {ingredientTypes.length === 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ Please create ingredient types first in the "Ingredient Types" tab
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle>Existing Ingredients ({ingredients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {ingredients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No ingredients yet. Add your first ingredient above! 🥬
            </p>
          ) : (
            <div className="space-y-3">
              {ingredients.map((ingredient: Ingredient) => (
                <div key={ingredient.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      #{ingredient.id}
                    </Badge>
                    <span className="font-medium text-gray-900">{ingredient.name}</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {getIngredientTypeName(ingredient.ingredient_type_id)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Created: {ingredient.created_at.toLocaleDateString()}
                    </span>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(ingredient.id)}
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
