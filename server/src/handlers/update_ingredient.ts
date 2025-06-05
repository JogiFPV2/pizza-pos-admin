
import { db } from '../db';
import { ingredientsTable } from '../db/schema';
import { type UpdateIngredientInput, type Ingredient } from '../schema';
import { eq } from 'drizzle-orm';

export const updateIngredient = async (input: UpdateIngredientInput): Promise<Ingredient> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof ingredientsTable.$inferInsert> = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    
    if (input.ingredient_type_id !== undefined) {
      updateData.ingredient_type_id = input.ingredient_type_id;
    }

    // If no fields to update, just return the existing ingredient
    if (Object.keys(updateData).length === 0) {
      const existing = await db.select()
        .from(ingredientsTable)
        .where(eq(ingredientsTable.id, input.id))
        .execute();

      if (existing.length === 0) {
        throw new Error('Ingredient not found');
      }

      return existing[0];
    }

    // Update ingredient record
    const result = await db.update(ingredientsTable)
      .set(updateData)
      .where(eq(ingredientsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Ingredient not found');
    }

    return result[0];
  } catch (error) {
    console.error('Ingredient update failed:', error);
    throw error;
  }
};
