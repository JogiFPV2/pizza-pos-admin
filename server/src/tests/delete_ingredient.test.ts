
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientsTable, ingredientTypesTable } from '../db/schema';
import { deleteIngredient } from '../handlers/delete_ingredient';
import { eq } from 'drizzle-orm';

describe('deleteIngredient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an ingredient', async () => {
    // Create prerequisite ingredient type
    const [ingredientType] = await db.insert(ingredientTypesTable)
      .values({
        name: 'Test Type'
      })
      .returning()
      .execute();

    // Create test ingredient
    const [ingredient] = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientType.id
      })
      .returning()
      .execute();

    // Delete the ingredient
    await deleteIngredient(ingredient.id);

    // Verify ingredient no longer exists
    const ingredients = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, ingredient.id))
      .execute();

    expect(ingredients).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent ingredient', async () => {
    // Should complete successfully without throwing
    await deleteIngredient(999);
    
    // If we reach this point, no error was thrown
    expect(true).toBe(true);
  });

  it('should delete correct ingredient when multiple exist', async () => {
    // Create prerequisite ingredient type
    const [ingredientType] = await db.insert(ingredientTypesTable)
      .values({
        name: 'Test Type'
      })
      .returning()
      .execute();

    // Create multiple test ingredients
    const [ingredient1] = await db.insert(ingredientsTable)
      .values({
        name: 'Ingredient 1',
        ingredient_type_id: ingredientType.id
      })
      .returning()
      .execute();

    const [ingredient2] = await db.insert(ingredientsTable)
      .values({
        name: 'Ingredient 2',
        ingredient_type_id: ingredientType.id
      })
      .returning()
      .execute();

    // Delete only the first ingredient
    await deleteIngredient(ingredient1.id);

    // Verify first ingredient is deleted
    const deletedIngredient = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, ingredient1.id))
      .execute();

    expect(deletedIngredient).toHaveLength(0);

    // Verify second ingredient still exists
    const remainingIngredient = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, ingredient2.id))
      .execute();

    expect(remainingIngredient).toHaveLength(1);
    expect(remainingIngredient[0].name).toEqual('Ingredient 2');
  });
});
