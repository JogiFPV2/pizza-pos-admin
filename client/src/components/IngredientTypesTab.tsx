
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, DollarSign } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { IngredientType, CreateIngredientTypeInput, Size, IngredientTypePrice, CreateIngredientTypePriceInput } from '../../../server/src/schema';

export function IngredientTypesTab() {
  const [ingredientTypes, setIngredientTypes] = useState<IngredientType[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [ingredientTypePrices, setIngredientTypePrices] = useState<IngredientTypePrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateIngredientTypeInput>({
    name: ''
  });
  const [priceFormData, setPriceFormData] = useState<CreateIngredientTypePriceInput>({
    ingredient_type_id: 0,
    size_id: 0,
    price: 0
  });

  const loadIngredientTypes = useCallback(async () => {
    try {
      const result = await trpc.getIngredientTypes.query();
      setIngredientTypes(result);
    } catch (error) {
      console.error('Failed to load ingredient types:', error);
    }
  }, []);

  const loadSizes = useCallback(async () => {
    try {
      const result = await trpc.getSizes.query();
      setSizes(result);
    } catch (error) {
      console.error('Failed to load sizes:', error);
    }
  }, []);

  const loadIngredientTypePrices = useCallback(async () => {
    try {
      const result = await trpc.getIngredientTypePrices.query();
      setIngredientTypePrices(result);
    } catch (error) {
      console.error('Failed to load ingredient type prices:', error);
    }
  }, []);

  useEffect(() => {
    loadIngredientTypes();
    loadSizes();
    loadIngredientTypePrices();
  }, [loadIngredientTypes, loadSizes, loadIngredientTypePrices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const newIngredientType = await trpc.createIngredientType.mutate(formData);
      setIngredientTypes((prev: IngredientType[]) => [...prev, newIngredientType]);
      setFormData({ name: '' });
    } catch (error) {
      console.error('Failed to create ingredient type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceFormData.ingredient_type_id || !priceFormData.size_id || priceFormData.price <= 0) return;

    try {
      const newPrice = await trpc.createIngredientTypePrice.mutate(priceFormData);
      setIngredientTypePrices((prev: IngredientTypePrice[]) => [...prev, newPrice]);
      setPriceFormData({ ingredient_type_id: 0, size_id: 0, price: 0 });
    } catch (error) {
      console.error('Failed to create ingredient type price:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteIngredientType.mutate(id);
      setIngredientTypes((prev: IngredientType[]) => prev.filter(type => type.id !== id));
    } catch (error) {
      console.error('Failed to delete ingredient type:', error);
    }
  };

  const getPrice = (typeId: number, sizeId: number) => {
    const price = ingredientTypePrices.find(p => p.ingredient_type_id === typeId && p.size_id === sizeId);
    return price ? price.price : null;
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Ingredient Type
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              placeholder="Ingredient type name (e.g., Cheese, Meat, Vegetable)"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ name: e.target.value })
              }
              className="flex-1"
              required
            />
            <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
              {isLoading ? 'Adding...' : 'Add Type'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {ingredientTypes.length > 0 && sizes.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Set Pricing by Size
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePriceSubmit} className="flex gap-4 mb-6">
              <select
                value={priceFormData.ingredient_type_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPriceFormData((prev: CreateIngredientTypePriceInput) => ({ ...prev, ingredient_type_id: parseInt(e.target.value) }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              >
                <option value={0}>Select ingredient type</option>
                {ingredientTypes.map((type: IngredientType) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <select
                value={priceFormData.size_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPriceFormData((prev: CreateIngredientTypePriceInput) => ({ ...prev, size_id: parseInt(e.target.value) }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              >
                <option value={0}>Select size</option>
                {sizes.map((size: Size) => (
                  <option key={size.id} value={size.id}>{size.name}</option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Price"
                value={priceFormData.price || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPriceFormData((prev: CreateIngredientTypePriceInput) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                }
                step="0.01"
                min="0"
                required
              />
              <Button type="submit" className="bg-green-500 hover:bg-green-600">
                Set Price
              </Button>
            </form>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient Type</TableHead>
                    {sizes.map((size: Size) => (
                      <TableHead key={size.id} className="text-center">{size.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredientTypes.map((type: IngredientType) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.name}</TableCell>
                      {sizes.map((size: Size) => {
                        const price = getPrice(type.id, size.id);
                        return (
                          <TableCell key={size.id} className="text-center">
                            {price !== null ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                ${price.toFixed(2)}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle>Existing Ingredient Types ({ingredientTypes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {ingredientTypes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No ingredient types yet. Add your first type above! 🏷️
            </p>
          ) : (
            <div className="space-y-3">
              {ingredientTypes.map((type: IngredientType) => (
                <div key={type.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                      #{type.id}
                    </Badge>
                    <span className="font-medium text-gray-900">{type.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Created: {type.created_at.toLocaleDateString()}
                    </span>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(type.id)}
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
