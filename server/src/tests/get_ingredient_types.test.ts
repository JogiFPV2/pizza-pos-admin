
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientTypesTable } from '../db/schema';
import { getIngredientTypes } from '../handlers/get_ingredient_types';

describe('getIngredientTypes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no ingredient types exist', async () => {
    const result = await getIngredientTypes();
    expect(result).toEqual([]);
  });

  it('should return all ingredient types', async () => {
    // Create test ingredient types
    await db.insert(ingredientTypesTable)
      .values([
        { name: 'Cheese' },
        { name: 'Meat' },
        { name: 'Vegetable' }
      ])
      .execute();

    const result = await getIngredientTypes();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Cheese');
    expect(result[1].name).toEqual('Meat');
    expect(result[2].name).toEqual('Vegetable');
    
    // Verify all required fields are present
    result.forEach(ingredientType => {
      expect(ingredientType.id).toBeDefined();
      expect(typeof ingredientType.name).toBe('string');
      expect(ingredientType.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return ingredient types in creation order', async () => {
    // Create ingredient types with slight delay to ensure different timestamps
    await db.insert(ingredientTypesTable)
      .values({ name: 'First Type' })
      .execute();

    await db.insert(ingredientTypesTable)
      .values({ name: 'Second Type' })
      .execute();

    const result = await getIngredientTypes();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Type');
    expect(result[1].name).toEqual('Second Type');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });
});
