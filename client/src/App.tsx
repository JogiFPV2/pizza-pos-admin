
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SizesTab } from '@/components/SizesTab';
import { IngredientsTab } from '@/components/IngredientsTab';
import { IngredientTypesTab } from '@/components/IngredientTypesTab';
import { CategoriesTab } from '@/components/CategoriesTab';
import { ProductsTab } from '@/components/ProductsTab';
import { Pizza, Settings } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-orange-500 p-3 rounded-full">
            <Pizza className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">🍕 Pizzeria POS</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings & Management Panel
            </p>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
            <CardTitle className="text-2xl">System Configuration</CardTitle>
            <CardDescription className="text-orange-100">
              Manage your pizzeria's menu, ingredients, and pricing structure
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="sizes" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-orange-100">
                <TabsTrigger value="sizes" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  📏 Sizes
                </TabsTrigger>
                <TabsTrigger value="ingredients" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  🥬 Ingredients
                </TabsTrigger>
                <TabsTrigger value="ingredient-types" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  🏷️ Ingredient Types
                </TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  📂 Categories
                </TabsTrigger>
                <TabsTrigger value="products" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                  🍕 Menu
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sizes" className="mt-6">
                <SizesTab />
              </TabsContent>

              <TabsContent value="ingredients" className="mt-6">
                <IngredientsTab />
              </TabsContent>

              <TabsContent value="ingredient-types" className="mt-6">
                <IngredientTypesTab />
              </TabsContent>

              <TabsContent value="categories" className="mt-6">
                <CategoriesTab />
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                <ProductsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
