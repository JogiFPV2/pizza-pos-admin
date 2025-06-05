
import { z } from 'zod';

// Size schema
export const sizeSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type Size = z.infer<typeof sizeSchema>;

export const createSizeInputSchema = z.object({
  name: z.string().min(1)
});

export type CreateSizeInput = z.infer<typeof createSizeInputSchema>;

export const updateSizeInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional()
});

export type UpdateSizeInput = z.infer<typeof updateSizeInputSchema>;

// Ingredient Type schema
export const ingredientTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type IngredientType = z.infer<typeof ingredientTypeSchema>;

export const createIngredientTypeInputSchema = z.object({
  name: z.string().min(1)
});

export type CreateIngredientTypeInput = z.infer<typeof createIngredientTypeInputSchema>;

export const updateIngredientTypeInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional()
});

export type UpdateIngredientTypeInput = z.infer<typeof updateIngredientTypeInputSchema>;

// Ingredient Type Price schema (price per size for each ingredient type)
export const ingredientTypePriceSchema = z.object({
  id: z.number(),
  ingredient_type_id: z.number(),
  size_id: z.number(),
  price: z.number(),
  created_at: z.coerce.date()
});

export type IngredientTypePrice = z.infer<typeof ingredientTypePriceSchema>;

export const createIngredientTypePriceInputSchema = z.object({
  ingredient_type_id: z.number(),
  size_id: z.number(),
  price: z.number().positive()
});

export type CreateIngredientTypePriceInput = z.infer<typeof createIngredientTypePriceInputSchema>;

export const updateIngredientTypePriceInputSchema = z.object({
  id: z.number(),
  price: z.number().positive().optional()
});

export type UpdateIngredientTypePriceInput = z.infer<typeof updateIngredientTypePriceInputSchema>;

// Ingredient schema
export const ingredientSchema = z.object({
  id: z.number(),
  name: z.string(),
  ingredient_type_id: z.number(),
  created_at: z.coerce.date()
});

export type Ingredient = z.infer<typeof ingredientSchema>;

export const createIngredientInputSchema = z.object({
  name: z.string().min(1),
  ingredient_type_id: z.number()
});

export type CreateIngredientInput = z.infer<typeof createIngredientInputSchema>;

export const updateIngredientInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  ingredient_type_id: z.number().optional()
});

export type UpdateIngredientInput = z.infer<typeof updateIngredientInputSchema>;

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryInputSchema = z.object({
  name: z.string().min(1)
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional()
});

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

// Product schema
export const productSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  category_id: z.number(),
  ingredients_enabled: z.boolean(),
  created_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

export const createProductInputSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  category_id: z.number(),
  ingredients_enabled: z.boolean().default(false)
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

export const updateProductInputSchema = z.object({
  id: z.number(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  category_id: z.number().optional(),
  ingredients_enabled: z.boolean().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Product Price schema (price per size for each product)
export const productPriceSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  size_id: z.number(),
  price: z.number(),
  created_at: z.coerce.date()
});

export type ProductPrice = z.infer<typeof productPriceSchema>;

export const createProductPriceInputSchema = z.object({
  product_id: z.number(),
  size_id: z.number(),
  price: z.number().positive()
});

export type CreateProductPriceInput = z.infer<typeof createProductPriceInputSchema>;

export const updateProductPriceInputSchema = z.object({
  id: z.number(),
  price: z.number().positive().optional()
});

export type UpdateProductPriceInput = z.infer<typeof updateProductPriceInputSchema>;

// Product Ingredient schema (many-to-many relationship)
export const productIngredientSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  ingredient_id: z.number(),
  created_at: z.coerce.date()
});

export type ProductIngredient = z.infer<typeof productIngredientSchema>;

export const createProductIngredientInputSchema = z.object({
  product_id: z.number(),
  ingredient_id: z.number()
});

export type CreateProductIngredientInput = z.infer<typeof createProductIngredientInputSchema>;

export const deleteProductIngredientInputSchema = z.object({
  product_id: z.number(),
  ingredient_id: z.number()
});

export type DeleteProductIngredientInput = z.infer<typeof deleteProductIngredientInputSchema>;
