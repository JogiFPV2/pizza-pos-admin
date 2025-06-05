
import { db } from '../db';
import { productIngredientsTable } from '../db/schema';
import { type DeleteProductIngredientInput } from '../schema';
import { eq, and } from 'drizzle-orm';

export const deleteProductIngredient = async (input: DeleteProductIngredientInput): Promise<void> => {
  try {
    await db.delete(productIngredientsTable)
      .where(
        and(
          eq(productIngredientsTable.product_id, input.product_id),
          eq(productIngredientsTable.ingredient_id, input.ingredient_id)
        )
      )
      .execute();
  } catch (error) {
    console.error('Product ingredient deletion failed:', error);
    throw error;
  }
};
