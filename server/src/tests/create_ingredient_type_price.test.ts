
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientTypePricesTable, ingredientTypesTable, sizesTable } from '../db/schema';
import { type CreateIngredientTypePriceInput } from '../schema';
import { createIngredientTypePrice } from '../handlers/create_ingredient_type_price';
import { eq } from 'drizzle-orm';

describe('createIngredientTypePrice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an ingredient type price', async () => {
    // Create prerequisite ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Ingredient Type' })
      .returning()
      .execute();
    const ingredientTypeId = ingredientTypeResult[0].id;

    // Create prerequisite size
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();
    const sizeId = sizeResult[0].id;

    const testInput: CreateIngredientTypePriceInput = {
      ingredient_type_id: ingredientTypeId,
      size_id: sizeId,
      price: 2.50
    };

    const result = await createIngredientTypePrice(testInput);

    // Basic field validation
    expect(result.ingredient_type_id).toEqual(ingredientTypeId);
    expect(result.size_id).toEqual(sizeId);
    expect(result.price).toEqual(2.50);
    expect(typeof result.price).toBe('number');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save ingredient type price to database', async () => {
    // Create prerequisite ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Ingredient Type' })
      .returning()
      .execute();
    const ingredientTypeId = ingredientTypeResult[0].id;

    // Create prerequisite size
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Large' })
      .returning()
      .execute();
    const sizeId = sizeResult[0].id;

    const testInput: CreateIngredientTypePriceInput = {
      ingredient_type_id: ingredientTypeId,
      size_id: sizeId,
      price: 3.75
    };

    const result = await createIngredientTypePrice(testInput);

    // Query using proper drizzle syntax
    const ingredientTypePrices = await db.select()
      .from(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.id, result.id))
      .execute();

    expect(ingredientTypePrices).toHaveLength(1);
    expect(ingredientTypePrices[0].ingredient_type_id).toEqual(ingredientTypeId);
    expect(ingredientTypePrices[0].size_id).toEqual(sizeId);
    expect(parseFloat(ingredientTypePrices[0].price)).toEqual(3.75);
    expect(ingredientTypePrices[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when ingredient type does not exist', async () => {
    // Create prerequisite size
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Small' })
      .returning()
      .execute();
    const sizeId = sizeResult[0].id;

    const testInput: CreateIngredientTypePriceInput = {
      ingredient_type_id: 999, // Non-existent ingredient type
      size_id: sizeId,
      price: 1.25
    };

    await expect(createIngredientTypePrice(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should throw error when size does not exist', async () => {
    // Create prerequisite ingredient type
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Ingredient Type' })
      .returning()
      .execute();
    const ingredientTypeId = ingredientTypeResult[0].id;

    const testInput: CreateIngredientTypePriceInput = {
      ingredient_type_id: ingredientTypeId,
      size_id: 999, // Non-existent size
      price: 1.25
    };

    await expect(createIngredientTypePrice(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
