
import { db } from '../db';
import { ingredientsTable } from '../db/schema';
import { type CreateIngredientInput, type Ingredient } from '../schema';

export const createIngredient = async (input: CreateIngredientInput): Promise<Ingredient> => {
  try {
    // Insert ingredient record
    const result = await db.insert(ingredientsTable)
      .values({
        name: input.name,
        ingredient_type_id: input.ingredient_type_id
      })
      .returning()
      .execute();

    const ingredient = result[0];
    return ingredient;
  } catch (error) {
    console.error('Ingredient creation failed:', error);
    throw error;
  }
};
