
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientsTable, ingredientTypesTable } from '../db/schema';
import { type CreateIngredientInput } from '../schema';
import { createIngredient } from '../handlers/create_ingredient';
import { eq } from 'drizzle-orm';

describe('createIngredient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an ingredient', async () => {
    // Create prerequisite ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({
        name: 'Test Ingredient Type'
      })
      .returning()
      .execute();

    const testInput: CreateIngredientInput = {
      name: 'Test Ingredient',
      ingredient_type_id: ingredientTypeResult[0].id
    };

    const result = await createIngredient(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Ingredient');
    expect(result.ingredient_type_id).toEqual(ingredientTypeResult[0].id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save ingredient to database', async () => {
    // Create prerequisite ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({
        name: 'Test Ingredient Type'
      })
      .returning()
      .execute();

    const testInput: CreateIngredientInput = {
      name: 'Test Ingredient',
      ingredient_type_id: ingredientTypeResult[0].id
    };

    const result = await createIngredient(testInput);

    // Query using proper drizzle syntax
    const ingredients = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, result.id))
      .execute();

    expect(ingredients).toHaveLength(1);
    expect(ingredients[0].name).toEqual('Test Ingredient');
    expect(ingredients[0].ingredient_type_id).toEqual(ingredientTypeResult[0].id);
    expect(ingredients[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when ingredient_type_id does not exist', async () => {
    const testInput: CreateIngredientInput = {
      name: 'Test Ingredient',
      ingredient_type_id: 999 // Non-existent ingredient_type_id
    };

    await expect(createIngredient(testInput)).rejects.toThrow(/foreign key constraint/i);
  });
});
