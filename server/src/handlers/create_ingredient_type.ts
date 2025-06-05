
import { db } from '../db';
import { ingredientTypesTable } from '../db/schema';
import { type CreateIngredientTypeInput, type IngredientType } from '../schema';

export const createIngredientType = async (input: CreateIngredientTypeInput): Promise<IngredientType> => {
  try {
    // Insert ingredient type record
    const result = await db.insert(ingredientTypesTable)
      .values({
        name: input.name
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Ingredient type creation failed:', error);
    throw error;
  }
};
