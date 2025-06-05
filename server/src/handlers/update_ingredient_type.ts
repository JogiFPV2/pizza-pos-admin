
import { db } from '../db';
import { ingredientTypesTable } from '../db/schema';
import { type UpdateIngredientTypeInput, type IngredientType } from '../schema';
import { eq } from 'drizzle-orm';

export const updateIngredientType = async (input: UpdateIngredientTypeInput): Promise<IngredientType> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof ingredientTypesTable.$inferInsert> = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    // If no fields to update, just return the existing record
    if (Object.keys(updateData).length === 0) {
      const existing = await db.select()
        .from(ingredientTypesTable)
        .where(eq(ingredientTypesTable.id, input.id))
        .execute();

      if (existing.length === 0) {
        throw new Error(`Ingredient type with id ${input.id} not found`);
      }

      return existing[0];
    }

    // Perform the update
    const result = await db.update(ingredientTypesTable)
      .set(updateData)
      .where(eq(ingredientTypesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Ingredient type with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Ingredient type update failed:', error);
    throw error;
  }
};
