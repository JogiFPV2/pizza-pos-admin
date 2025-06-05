
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, DollarSign, Settings } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { 
  Product, 
  CreateProductInput, 
  Category, 
  Size, 
  ProductPrice, 
  CreateProductPriceInput,
  Ingredient,
  ProductIngredient
} from '../../../server/src/schema';

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [productPrices, setProductPrices] = useState<ProductPrice[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [productIngredients, setProductIngredients] = useState<ProductIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductInput>({
    code: '',
    name: '',
    category_id: 0,
    ingredients_enabled: false
  });
  const [priceFormData, setPriceFormData] = useState<CreateProductPriceInput>({
    product_id: 0,
    size_id: 0,
    price: 0
  });

  const loadProducts = useCallback(async () => {
    try {
      const result = await trpc.getProducts.query();
      setProducts(result);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const result = await trpc.getCategories.query();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
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

  const loadProductPrices = useCallback(async () => {
    try {
      const result = await trpc.getProductPrices.query();
      setProductPrices(result);
    } catch (error) {
      console.error('Failed to load product prices:', error);
    }
  }, []);

  const loadIngredients = useCallback(async () => {
    try {
      const result = await trpc.getIngredients.query();
      setIngredients(result);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
    }
  }, []);

  const loadProductIngredients = useCallback(async () => {
    try {
      const result = await trpc.getProductIngredients.query();
      setProductIngredients(result);
    } catch (error) {
      console.error('Failed to load product ingredients:', error);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSizes();
    loadProductPrices();
    loadIngredients();
    loadProductIngredients();
  }, [loadProducts, loadCategories, loadSizes, loadProductPrices, loadIngredients, loadProductIngredients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim() || !formData.category_id) return;

    setIsLoading(true);
    try {
      const newProduct = await trpc.createProduct.mutate(formData);
      setProducts((prev: Product[]) => [...prev, newProduct]);
      setFormData({ code: '', name: '', category_id: 0, ingredients_enabled: false });
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceFormData.product_id || !priceFormData.size_id || priceFormData.price <= 0) return;

    try {
      const newPrice = await trpc.createProductPrice.mutate(priceFormData);
      setProductPrices((prev: ProductPrice[]) => [...prev, newPrice]);
      setPriceFormData({ product_id: 0, size_id: 0, price: 0 });
    } catch (error) {
      console.error('Failed to create product price:', error);
    }
  };

  const handleIngredientToggle = async (productId: number, ingredientId: number, isChecked: boolean) => {
    try {
      if (isChecked) {
        const newProductIngredient = await trpc.createProductIngredient.mutate({
          product_id: productId,
          ingredient_id: ingredientId
        });
        setProductIngredients((prev: ProductIngredient[]) => [...prev, newProductIngredient]);
      } else {
        await trpc.deleteProductIngredient.mutate({
          product_id: productId,
          ingredient_id: ingredientId
        });
        setProductIngredients((prev: ProductIngredient[]) => 
          prev.filter(pi => !(pi.product_id === productId && pi.ingredient_id === ingredientId))
        );
      }
    } catch (error) {
      console.error('Failed to update product ingredient:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteProduct.mutate(id);
      setProducts((prev: Product[]) => prev.filter(product => product.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getPrice = (productId: number, sizeId: number) => {
    const price = productPrices.find(p => p.product_id === productId && p.size_id === sizeId);
    return price ? price.price : null;
  };

  const isIngredientSelected = (productId: number, ingredientId: number) => {
    return productIngredients.some(pi => pi.product_id === productId && pi.ingredient_id === ingredientId);
  };

  const getProductIngredients = (productId: number) => {
    return productIngredients
      .filter(pi => pi.product_id === productId)
      .map(pi => ingredients.find(i => i.id === pi.ingredient_id))
      .filter(Boolean);
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Product code (e.g., P001)"
                value={formData.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProductInput) => ({ ...prev, code: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Product name (e.g., Margherita Pizza)"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateProductInput) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex gap-4 items-center">
              <select
                value={formData.category_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData((prev: CreateProductInput) => ({ ...prev, category_id: parseInt(e.target.value) }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              >
                <option value={0}>Select category</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ingredients-enabled"
                  checked={formData.ingredients_enabled}
                  onCheckedChange={(checked: boolean) =>
                    setFormData((prev: CreateProductInput) => ({ ...prev, ingredients_enabled: checked }))
                  }
                />
                <label htmlFor="ingredients-enabled" className="text-sm font-medium">
                  Enable Ingredients
                </label>
              </div>
            </div>
            <Button type="submit" disabled={isLoading || categories.length === 0} className="bg-red-500 hover:bg-red-600">
              {isLoading ? 'Adding...' : 'Add Product'}
            </Button>
            {categories.length === 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ Please create categories first in the "Categories" tab
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {products.length > 0 && sizes.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Set Product Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handlePriceSubmit} className="flex gap-4 mb-6">
              <select
                value={priceFormData.product_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPriceFormData((prev: CreateProductPriceInput) => ({ ...prev, product_id: parseInt(e.target.value) }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                required
              >
                <option value={0}>Select product</option>
                {products.map((product: Product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <select
                value={priceFormData.size_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPriceFormData((prev: CreateProductPriceInput) => ({ ...prev, size_id: parseInt(e.target.value) }))
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
                  setPriceFormData((prev: CreateProductPriceInput) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
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
                    <TableHead>Product</TableHead>
                    {sizes.map((size: Size) => (
                      <TableHead key={size.id} className="text-center">{size.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: Product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      {sizes.map((size: Size) => {
                        const price = getPrice(product.id, size.id);
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

      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle>Existing Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No products yet. Add your first menu item above! 🍕
            </p>
          ) : (
            <div className="space-y-4">
              {products.map((product: Product) => (
                <Card key={product.id} className="border border-red-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                          {product.code}
                        </Badge>
                        <span className="font-medium text-gray-900 text-lg">{product.name}</span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          {getCategoryName(product.category_id)}
                        </Badge>
                        {product.ingredients_enabled && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            🥬 Ingredients Enabled
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {selectedProduct?.id === product.id && product.ingredients_enabled && ingredients.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-3">Available Ingredients:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {ingredients.map((ingredient: Ingredient) => (
                            <div key={ingredient.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`ingredient-${product.id}-${ingredient.id}`}
                                checked={isIngredientSelected(product.id, ingredient.id)}
                                onCheckedChange={(checked: boolean) =>
                                  handleIngredientToggle(product.id, ingredient.id, checked)
                                }
                              />
                              <label
                                htmlFor={`ingredient-${product.id}-${ingredient.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {ingredient.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-sm text-gray-500">
                      Created: {product.created_at.toLocaleDateString()}
                      {product.ingredients_enabled && (
                        <span className="ml-4">
                          Ingredients: {getProductIngredients(product.id).length > 0 
                            ? getProductIngredients(product.id).map(i => i?.name).join(', ')
                            : 'None selected'
                          }
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
