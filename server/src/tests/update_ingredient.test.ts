
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientsTable, ingredientTypesTable } from '../db/schema';
import { type UpdateIngredientInput, type CreateIngredientInput } from '../schema';
import { updateIngredient } from '../handlers/update_ingredient';
import { eq } from 'drizzle-orm';

describe('updateIngredient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update ingredient name', async () => {
    // Create ingredient type first
    const ingredientType = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    // Create ingredient
    const ingredient = await db.insert(ingredientsTable)
      .values({
        name: 'Original Ingredient',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    const updateInput: UpdateIngredientInput = {
      id: ingredient[0].id,
      name: 'Updated Ingredient'
    };

    const result = await updateIngredient(updateInput);

    expect(result.id).toEqual(ingredient[0].id);
    expect(result.name).toEqual('Updated Ingredient');
    expect(result.ingredient_type_id).toEqual(ingredientType[0].id);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update ingredient type', async () => {
    // Create two ingredient types
    const ingredientType1 = await db.insert(ingredientTypesTable)
      .values({ name: 'Type 1' })
      .returning()
      .execute();

    const ingredientType2 = await db.insert(ingredientTypesTable)
      .values({ name: 'Type 2' })
      .returning()
      .execute();

    // Create ingredient with first type
    const ingredient = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientType1[0].id
      })
      .returning()
      .execute();

    const updateInput: UpdateIngredientInput = {
      id: ingredient[0].id,
      ingredient_type_id: ingredientType2[0].id
    };

    const result = await updateIngredient(updateInput);

    expect(result.id).toEqual(ingredient[0].id);
    expect(result.name).toEqual('Test Ingredient');
    expect(result.ingredient_type_id).toEqual(ingredientType2[0].id);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update both name and ingredient type', async () => {
    // Create two ingredient types
    const ingredientType1 = await db.insert(ingredientTypesTable)
      .values({ name: 'Type 1' })
      .returning()
      .execute();

    const ingredientType2 = await db.insert(ingredientTypesTable)
      .values({ name: 'Type 2' })
      .returning()
      .execute();

    // Create ingredient
    const ingredient = await db.insert(ingredientsTable)
      .values({
        name: 'Original Ingredient',
        ingredient_type_id: ingredientType1[0].id
      })
      .returning()
      .execute();

    const updateInput: UpdateIngredientInput = {
      id: ingredient[0].id,
      name: 'Updated Ingredient',
      ingredient_type_id: ingredientType2[0].id
    };

    const result = await updateIngredient(updateInput);

    expect(result.id).toEqual(ingredient[0].id);
    expect(result.name).toEqual('Updated Ingredient');
    expect(result.ingredient_type_id).toEqual(ingredientType2[0].id);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated ingredient to database', async () => {
    // Create ingredient type
    const ingredientType = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    // Create ingredient
    const ingredient = await db.insert(ingredientsTable)
      .values({
        name: 'Original Ingredient',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    const updateInput: UpdateIngredientInput = {
      id: ingredient[0].id,
      name: 'Updated Ingredient'
    };

    await updateIngredient(updateInput);

    // Verify changes in database
    const updatedIngredients = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, ingredient[0].id))
      .execute();

    expect(updatedIngredients).toHaveLength(1);
    expect(updatedIngredients[0].name).toEqual('Updated Ingredient');
    expect(updatedIngredients[0].ingredient_type_id).toEqual(ingredientType[0].id);
  });

  it('should throw error when ingredient not found', async () => {
    const updateInput: UpdateIngredientInput = {
      id: 999,
      name: 'Updated Ingredient'
    };

    expect(updateIngredient(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should handle partial updates correctly', async () => {
    // Create ingredient type
    const ingredientType = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    // Create ingredient
    const ingredient = await db.insert(ingredientsTable)
      .values({
        name: 'Original Ingredient',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    // Update with empty object (no changes)
    const updateInput: UpdateIngredientInput = {
      id: ingredient[0].id
    };

    const result = await updateIngredient(updateInput);

    // Should return unchanged ingredient
    expect(result.id).toEqual(ingredient[0].id);
    expect(result.name).toEqual('Original Ingredient');
    expect(result.ingredient_type_id).toEqual(ingredientType[0].id);
    expect(result.created_at).toBeInstanceOf(Date);
  });
});
