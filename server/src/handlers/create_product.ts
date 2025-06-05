
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type CreateProductInput, type Product } from '../schema';

export const createProduct = async (input: CreateProductInput): Promise<Product> => {
  try {
    // Insert product record
    const result = await db.insert(productsTable)
      .values({
        code: input.code,
        name: input.name,
        category_id: input.category_id,
        ingredients_enabled: input.ingredients_enabled // Zod default of false will be applied
      })
      .returning()
      .execute();

    // Return the created product
    const product = result[0];
    return product;
  } catch (error) {
    console.error('Product creation failed:', error);
    throw error;
  }
};
