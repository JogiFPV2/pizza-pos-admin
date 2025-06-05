
import { db } from '../db';
import { ingredientTypesTable } from '../db/schema';
import { type IngredientType } from '../schema';

export const getIngredientTypes = async (): Promise<IngredientType[]> => {
  try {
    const results = await db.select()
      .from(ingredientTypesTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get ingredient types:', error);
    throw error;
  }
};
