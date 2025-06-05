
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientTypesTable } from '../db/schema';
import { type CreateIngredientTypeInput } from '../schema';
import { createIngredientType } from '../handlers/create_ingredient_type';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateIngredientTypeInput = {
  name: 'Test Ingredient Type'
};

describe('createIngredientType', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an ingredient type', async () => {
    const result = await createIngredientType(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Ingredient Type');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save ingredient type to database', async () => {
    const result = await createIngredientType(testInput);

    // Query using proper drizzle syntax
    const ingredientTypes = await db.select()
      .from(ingredientTypesTable)
      .where(eq(ingredientTypesTable.id, result.id))
      .execute();

    expect(ingredientTypes).toHaveLength(1);
    expect(ingredientTypes[0].name).toEqual('Test Ingredient Type');
    expect(ingredientTypes[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple ingredient types with different names', async () => {
    const input1: CreateIngredientTypeInput = { name: 'Vegetables' };
    const input2: CreateIngredientTypeInput = { name: 'Meat' };

    const result1 = await createIngredientType(input1);
    const result2 = await createIngredientType(input2);

    expect(result1.name).toEqual('Vegetables');
    expect(result2.name).toEqual('Meat');
    expect(result1.id).not.toEqual(result2.id);

    // Verify both records exist in database
    const ingredientTypes = await db.select()
      .from(ingredientTypesTable)
      .execute();

    expect(ingredientTypes).toHaveLength(2);
  });
});
