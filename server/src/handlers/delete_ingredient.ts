
import { db } from '../db';
import { ingredientsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteIngredient = async (id: number): Promise<void> => {
  try {
    await db.delete(ingredientsTable)
      .where(eq(ingredientsTable.id, id))
      .execute();
  } catch (error) {
    console.error('Ingredient deletion failed:', error);
    throw error;
  }
};
