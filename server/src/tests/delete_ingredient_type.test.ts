
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientTypesTable, ingredientsTable, ingredientTypePricesTable, sizesTable } from '../db/schema';
import { deleteIngredientType } from '../handlers/delete_ingredient_type';
import { eq } from 'drizzle-orm';

describe('deleteIngredientType', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete ingredient type', async () => {
    // Create test ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();
    const ingredientTypeId = ingredientTypeResult[0].id;

    // Delete the ingredient type
    await deleteIngredientType(ingredientTypeId);

    // Verify ingredient type is deleted
    const ingredientTypes = await db.select()
      .from(ingredientTypesTable)
      .where(eq(ingredientTypesTable.id, ingredientTypeId))
      .execute();

    expect(ingredientTypes).toHaveLength(0);
  });

  it('should delete related ingredients', async () => {
    // Create test ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();
    const ingredientTypeId = ingredientTypeResult[0].id;

    // Create related ingredient
    await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientTypeId
      })
      .execute();

    // Delete the ingredient type
    await deleteIngredientType(ingredientTypeId);

    // Verify related ingredient is deleted
    const ingredients = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredient_type_id, ingredientTypeId))
      .execute();

    expect(ingredients).toHaveLength(0);
  });

  it('should delete related ingredient type prices', async () => {
    // Create prerequisite size
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();
    const sizeId = sizeResult[0].id;

    // Create test ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();
    const ingredientTypeId = ingredientTypeResult[0].id;

    // Create related ingredient type price
    await db.insert(ingredientTypePricesTable)
      .values({
        ingredient_type_id: ingredientTypeId,
        size_id: sizeId,
        price: '2.50'
      })
      .execute();

    // Delete the ingredient type
    await deleteIngredientType(ingredientTypeId);

    // Verify related ingredient type price is deleted
    const prices = await db.select()
      .from(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.ingredient_type_id, ingredientTypeId))
      .execute();

    expect(prices).toHaveLength(0);
  });

  it('should handle deleting non-existent ingredient type', async () => {
    // Attempt to delete non-existent ingredient type (should not throw)
    await deleteIngredientType(999);

    // Should complete without error
    expect(true).toBe(true);
  });

  it('should delete ingredient type with multiple related records', async () => {
    // Create prerequisite size
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Large' })
      .returning()
      .execute();
    const sizeId = sizeResult[0].id;

    // Create test ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Complex Type' })
      .returning()
      .execute();
    const ingredientTypeId = ingredientTypeResult[0].id;

    // Create multiple related ingredients
    await db.insert(ingredientsTable)
      .values([
        { name: 'Ingredient 1', ingredient_type_id: ingredientTypeId },
        { name: 'Ingredient 2', ingredient_type_id: ingredientTypeId }
      ])
      .execute();

    // Create multiple related prices
    await db.insert(ingredientTypePricesTable)
      .values([
        { ingredient_type_id: ingredientTypeId, size_id: sizeId, price: '1.50' },
        { ingredient_type_id: ingredientTypeId, size_id: sizeId, price: '2.00' }
      ])
      .execute();

    // Delete the ingredient type
    await deleteIngredientType(ingredientTypeId);

    // Verify ingredient type is deleted
    const ingredientTypes = await db.select()
      .from(ingredientTypesTable)
      .where(eq(ingredientTypesTable.id, ingredientTypeId))
      .execute();

    expect(ingredientTypes).toHaveLength(0);

    // Verify all related ingredients are deleted
    const ingredients = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.ingredient_type_id, ingredientTypeId))
      .execute();

    expect(ingredients).toHaveLength(0);

    // Verify all related prices are deleted
    const prices = await db.select()
      .from(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.ingredient_type_id, ingredientTypeId))
      .execute();

    expect(prices).toHaveLength(0);
  });
});
