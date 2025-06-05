
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import all schemas
import { 
  createSizeInputSchema, updateSizeInputSchema,
  createIngredientTypeInputSchema, updateIngredientTypeInputSchema,
  createIngredientTypePriceInputSchema, updateIngredientTypePriceInputSchema,
  createIngredientInputSchema, updateIngredientInputSchema,
  createCategoryInputSchema, updateCategoryInputSchema,
  createProductInputSchema, updateProductInputSchema,
  createProductPriceInputSchema, updateProductPriceInputSchema,
  createProductIngredientInputSchema, deleteProductIngredientInputSchema
} from './schema';

// Import all handlers
import { createSize } from './handlers/create_size';
import { getSizes } from './handlers/get_sizes';
import { updateSize } from './handlers/update_size';
import { deleteSize } from './handlers/delete_size';

import { createIngredientType } from './handlers/create_ingredient_type';
import { getIngredientTypes } from './handlers/get_ingredient_types';
import { updateIngredientType } from './handlers/update_ingredient_type';
import { deleteIngredientType } from './handlers/delete_ingredient_type';

import { createIngredientTypePrice } from './handlers/create_ingredient_type_price';
import { getIngredientTypePrices } from './handlers/get_ingredient_type_prices';
import { updateIngredientTypePrice } from './handlers/update_ingredient_type_price';
import { deleteIngredientTypePrice } from './handlers/delete_ingredient_type_price';

import { createIngredient } from './handlers/create_ingredient';
import { getIngredients } from './handlers/get_ingredients';
import { updateIngredient } from './handlers/update_ingredient';
import { deleteIngredient } from './handlers/delete_ingredient';

import { createCategory } from './handlers/create_category';
import { getCategories } from './handlers/get_categories';
import { updateCategory } from './handlers/update_category';
import { deleteCategory } from './handlers/delete_category';

import { createProduct } from './handlers/create_product';
import { getProducts } from './handlers/get_products';
import { updateProduct } from './handlers/update_product';
import { deleteProduct } from './handlers/delete_product';

import { createProductPrice } from './handlers/create_product_price';
import { getProductPrices } from './handlers/get_product_prices';
import { updateProductPrice } from './handlers/update_product_price';
import { deleteProductPrice } from './handlers/delete_product_price';

import { createProductIngredient } from './handlers/create_product_ingredient';
import { getProductIngredients } from './handlers/get_product_ingredients';
import { deleteProductIngredient } from './handlers/delete_product_ingredient';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Sizes endpoints
  createSize: publicProcedure
    .input(createSizeInputSchema)
    .mutation(({ input }) => createSize(input)),
  getSizes: publicProcedure
    .query(() => getSizes()),
  updateSize: publicProcedure
    .input(updateSizeInputSchema)
    .mutation(({ input }) => updateSize(input)),
  deleteSize: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteSize(input)),

  // Ingredient Types endpoints
  createIngredientType: publicProcedure
    .input(createIngredientTypeInputSchema)
    .mutation(({ input }) => createIngredientType(input)),
  getIngredientTypes: publicProcedure
    .query(() => getIngredientTypes()),
  updateIngredientType: publicProcedure
    .input(updateIngredientTypeInputSchema)
    .mutation(({ input }) => updateIngredientType(input)),
  deleteIngredientType: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteIngredientType(input)),

  // Ingredient Type Prices endpoints
  createIngredientTypePrice: publicProcedure
    .input(createIngredientTypePriceInputSchema)
    .mutation(({ input }) => createIngredientTypePrice(input)),
  getIngredientTypePrices: publicProcedure
    .query(() => getIngredientTypePrices()),
  updateIngredientTypePrice: publicProcedure
    .input(updateIngredientTypePriceInputSchema)
    .mutation(({ input }) => updateIngredientTypePrice(input)),
  deleteIngredientTypePrice: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteIngredientTypePrice(input)),

  // Ingredients endpoints
  createIngredient: publicProcedure
    .input(createIngredientInputSchema)
    .mutation(({ input }) => createIngredient(input)),
  getIngredients: publicProcedure
    .query(() => getIngredients()),
  updateIngredient: publicProcedure
    .input(updateIngredientInputSchema)
    .mutation(({ input }) => updateIngredient(input)),
  deleteIngredient: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteIngredient(input)),

  // Categories endpoints
  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),
  getCategories: publicProcedure
    .query(() => getCategories()),
  updateCategory: publicProcedure
    .input(updateCategoryInputSchema)
    .mutation(({ input }) => updateCategory(input)),
  deleteCategory: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteCategory(input)),

  // Products endpoints
  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),
  getProducts: publicProcedure
    .query(() => getProducts()),
  updateProduct: publicProcedure
    .input(updateProductInputSchema)
    .mutation(({ input }) => updateProduct(input)),
  deleteProduct: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteProduct(input)),

  // Product Prices endpoints
  createProductPrice: publicProcedure
    .input(createProductPriceInputSchema)
    .mutation(({ input }) => createProductPrice(input)),
  getProductPrices: publicProcedure
    .query(() => getProductPrices()),
  updateProductPrice: publicProcedure
    .input(updateProductPriceInputSchema)
    .mutation(({ input }) => updateProductPrice(input)),
  deleteProductPrice: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteProductPrice(input)),

  // Product Ingredients endpoints
  createProductIngredient: publicProcedure
    .input(createProductIngredientInputSchema)
    .mutation(({ input }) => createProductIngredient(input)),
  getProductIngredients: publicProcedure
    .query(() => getProductIngredients()),
  deleteProductIngredient: publicProcedure
    .input(deleteProductIngredientInputSchema)
    .mutation(({ input }) => deleteProductIngredient(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
