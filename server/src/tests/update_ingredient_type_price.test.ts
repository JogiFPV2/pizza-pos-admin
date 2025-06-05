
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sizesTable, ingredientTypesTable, ingredientTypePricesTable } from '../db/schema';
import { type UpdateIngredientTypePriceInput } from '../schema';
import { updateIngredientTypePrice } from '../handlers/update_ingredient_type_price';
import { eq } from 'drizzle-orm';

describe('updateIngredientTypePrice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update an ingredient type price', async () => {
    // Create prerequisite data
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();

    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Cheese' })
      .returning()
      .execute();

    const ingredientTypePriceResult = await db.insert(ingredientTypePricesTable)
      .values({
        ingredient_type_id: ingredientTypeResult[0].id,
        size_id: sizeResult[0].id,
        price: '2.50'
      })
      .returning()
      .execute();

    const testInput: UpdateIngredientTypePriceInput = {
      id: ingredientTypePriceResult[0].id,
      price: 3.00
    };

    const result = await updateIngredientTypePrice(testInput);

    // Basic field validation
    expect(result.id).toEqual(ingredientTypePriceResult[0].id);
    expect(result.ingredient_type_id).toEqual(ingredientTypeResult[0].id);
    expect(result.size_id).toEqual(sizeResult[0].id);
    expect(result.price).toEqual(3.00);
    expect(typeof result.price).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated ingredient type price to database', async () => {
    // Create prerequisite data
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Large' })
      .returning()
      .execute();

    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Meat' })
      .returning()
      .execute();

    const ingredientTypePriceResult = await db.insert(ingredientTypePricesTable)
      .values({
        ingredient_type_id: ingredientTypeResult[0].id,
        size_id: sizeResult[0].id,
        price: '4.50'
      })
      .returning()
      .execute();

    const testInput: UpdateIngredientTypePriceInput = {
      id: ingredientTypePriceResult[0].id,
      price: 5.25
    };

    const result = await updateIngredientTypePrice(testInput);

    // Query database to verify update
    const ingredientTypePrices = await db.select()
      .from(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.id, result.id))
      .execute();

    expect(ingredientTypePrices).toHaveLength(1);
    expect(ingredientTypePrices[0].id).toEqual(result.id);
    expect(parseFloat(ingredientTypePrices[0].price)).toEqual(5.25);
    expect(ingredientTypePrices[0].ingredient_type_id).toEqual(ingredientTypeResult[0].id);
    expect(ingredientTypePrices[0].size_id).toEqual(sizeResult[0].id);
  });

  it('should handle partial updates with no changes', async () => {
    // Create prerequisite data
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Small' })
      .returning()
      .execute();

    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Vegetable' })
      .returning()
      .execute();

    const ingredientTypePriceResult = await db.insert(ingredientTypePricesTable)
      .values({
        ingredient_type_id: ingredientTypeResult[0].id,
        size_id: sizeResult[0].id,
        price: '1.75'
      })
      .returning()
      .execute();

    const testInput: UpdateIngredientTypePriceInput = {
      id: ingredientTypePriceResult[0].id
      // No price field - should return existing record
    };

    const result = await updateIngredientTypePrice(testInput);

    // Should return the original price unchanged
    expect(result.id).toEqual(ingredientTypePriceResult[0].id);
    expect(result.price).toEqual(1.75);
    expect(typeof result.price).toBe('number');
    expect(result.ingredient_type_id).toEqual(ingredientTypeResult[0].id);
    expect(result.size_id).toEqual(sizeResult[0].id);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when ingredient type price not found', async () => {
    const testInput: UpdateIngredientTypePriceInput = {
      id: 999,
      price: 10.00
    };

    expect(updateIngredientTypePrice(testInput))
      .rejects.toThrow(/ingredient type price not found/i);
  });
});
