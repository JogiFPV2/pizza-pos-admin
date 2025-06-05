
import { db } from '../db';
import { productIngredientsTable } from '../db/schema';
import { type ProductIngredient } from '../schema';

export const getProductIngredients = async (): Promise<ProductIngredient[]> => {
  try {
    const results = await db.select()
      .from(productIngredientsTable)
      .execute();

    return results.map(productIngredient => ({
      ...productIngredient,
      created_at: productIngredient.created_at
    }));
  } catch (error) {
    console.error('Failed to get product ingredients:', error);
    throw error;
  }
};
