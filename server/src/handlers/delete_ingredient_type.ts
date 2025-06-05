
import { db } from '../db';
import { ingredientTypesTable, ingredientsTable, ingredientTypePricesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteIngredientType = async (id: number): Promise<void> => {
  try {
    // Delete related ingredient type prices first
    await db.delete(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.ingredient_type_id, id))
      .execute();

    // Delete related ingredients
    await db.delete(ingredientsTable)
      .where(eq(ingredientsTable.ingredient_type_id, id))
      .execute();

    // Finally delete the ingredient type
    await db.delete(ingredientTypesTable)
      .where(eq(ingredientTypesTable.id, id))
      .execute();
  } catch (error) {
    console.error('Ingredient type deletion failed:', error);
    throw error;
  }
};
