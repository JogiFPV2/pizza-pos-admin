
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type UpdateProductInput, type Product } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProduct = async (input: UpdateProductInput): Promise<Product> => {
  try {
    const result = await db.update(productsTable)
      .set({
        ...(input.code !== undefined && { code: input.code }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.category_id !== undefined && { category_id: input.category_id }),
        ...(input.ingredients_enabled !== undefined && { ingredients_enabled: input.ingredients_enabled })
      })
      .where(eq(productsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Product with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Product update failed:', error);
    throw error;
  }
};
