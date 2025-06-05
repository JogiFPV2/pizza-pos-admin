
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientTypesTable } from '../db/schema';
import { type UpdateIngredientTypeInput } from '../schema';
import { updateIngredientType } from '../handlers/update_ingredient_type';
import { eq } from 'drizzle-orm';

describe('updateIngredientType', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update ingredient type name', async () => {
    // Create initial ingredient type
    const created = await db.insert(ingredientTypesTable)
      .values({ name: 'Original Type' })
      .returning()
      .execute();

    const testInput: UpdateIngredientTypeInput = {
      id: created[0].id,
      name: 'Updated Type'
    };

    const result = await updateIngredientType(testInput);

    expect(result.id).toEqual(created[0].id);
    expect(result.name).toEqual('Updated Type');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated ingredient type to database', async () => {
    // Create initial ingredient type
    const created = await db.insert(ingredientTypesTable)
      .values({ name: 'Original Type' })
      .returning()
      .execute();

    const testInput: UpdateIngredientTypeInput = {
      id: created[0].id,
      name: 'Updated Type'
    };

    await updateIngredientType(testInput);

    // Verify database was updated
    const ingredientTypes = await db.select()
      .from(ingredientTypesTable)
      .where(eq(ingredientTypesTable.id, created[0].id))
      .execute();

    expect(ingredientTypes).toHaveLength(1);
    expect(ingredientTypes[0].name).toEqual('Updated Type');
    expect(ingredientTypes[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle partial updates', async () => {
    // Create initial ingredient type
    const created = await db.insert(ingredientTypesTable)
      .values({ name: 'Original Type' })
      .returning()
      .execute();

    const testInput: UpdateIngredientTypeInput = {
      id: created[0].id
      // No name provided - should return existing record unchanged
    };

    const result = await updateIngredientType(testInput);

    expect(result.id).toEqual(created[0].id);
    expect(result.name).toEqual('Original Type');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent ingredient type', async () => {
    const testInput: UpdateIngredientTypeInput = {
      id: 999,
      name: 'Updated Type'
    };

    expect(updateIngredientType(testInput)).rejects.toThrow(/ingredient type.*not found/i);
  });

  it('should throw error when trying to update non-existent record with no fields', async () => {
    const testInput: UpdateIngredientTypeInput = {
      id: 999
      // No fields to update
    };

    expect(updateIngredientType(testInput)).rejects.toThrow(/ingredient type.*not found/i);
  });
});
