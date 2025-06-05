
import { db } from '../db';
import { ingredientTypePricesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteIngredientTypePrice = async (id: number): Promise<void> => {
  try {
    await db.delete(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.id, id))
      .execute();
  } catch (error) {
    console.error('Ingredient type price deletion failed:', error);
    throw error;
  }
};
