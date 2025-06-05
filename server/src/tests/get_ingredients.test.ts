
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientsTable, ingredientTypesTable } from '../db/schema';
import { getIngredients } from '../handlers/get_ingredients';

describe('getIngredients', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no ingredients exist', async () => {
    const result = await getIngredients();
    expect(result).toEqual([]);
  });

  it('should return all ingredients', async () => {
    // Create prerequisite ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({
        name: 'Test Type'
      })
      .returning()
      .execute();

    const ingredientTypeId = ingredientTypeResult[0].id;

    // Create test ingredients
    await db.insert(ingredientsTable)
      .values([
        {
          name: 'Tomato',
          ingredient_type_id: ingredientTypeId
        },
        {
          name: 'Cheese',
          ingredient_type_id: ingredientTypeId
        },
        {
          name: 'Pepperoni',
          ingredient_type_id: ingredientTypeId
        }
      ])
      .execute();

    const result = await getIngredients();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Tomato');
    expect(result[0].ingredient_type_id).toEqual(ingredientTypeId);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    
    expect(result[1].name).toEqual('Cheese');
    expect(result[2].name).toEqual('Pepperoni');
  });

  it('should return ingredients with correct data types', async () => {
    // Create prerequisite ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({
        name: 'Test Type'
      })
      .returning()
      .execute();

    const ingredientTypeId = ingredientTypeResult[0].id;

    // Create test ingredient
    await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientTypeId
      })
      .execute();

    const result = await getIngredients();

    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toBe('number');
    expect(typeof result[0].name).toBe('string');
    expect(typeof result[0].ingredient_type_id).toBe('number');
    expect(result[0].created_at).toBeInstanceOf(Date);
  });
});
