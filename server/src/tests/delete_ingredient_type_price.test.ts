
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ingredientTypePricesTable, ingredientTypesTable, sizesTable } from '../db/schema';
import { deleteIngredientTypePrice } from '../handlers/delete_ingredient_type_price';
import { eq } from 'drizzle-orm';

describe('deleteIngredientTypePrice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an ingredient type price', async () => {
    // Create prerequisite data
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();

    // Create ingredient type price
    const priceResult = await db.insert(ingredientTypePricesTable)
      .values({
        ingredient_type_id: ingredientTypeResult[0].id,
        size_id: sizeResult[0].id,
        price: '5.99'
      })
      .returning()
      .execute();

    const priceId = priceResult[0].id;

    // Delete the ingredient type price
    await deleteIngredientTypePrice(priceId);

    // Verify deletion
    const prices = await db.select()
      .from(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.id, priceId))
      .execute();

    expect(prices).toHaveLength(0);
  });

  it('should handle deletion of non-existent ingredient type price', async () => {
    const nonExistentId = 999999;

    // Should not throw error when deleting non-existent record
    await expect(deleteIngredientTypePrice(nonExistentId)).resolves.toBeUndefined();
  });

  it('should not affect other ingredient type prices', async () => {
    // Create prerequisite data
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Large' })
      .returning()
      .execute();

    // Create multiple ingredient type prices
    const price1Result = await db.insert(ingredientTypePricesTable)
      .values({
        ingredient_type_id: ingredientTypeResult[0].id,
        size_id: sizeResult[0].id,
        price: '7.99'
      })
      .returning()
      .execute();

    const price2Result = await db.insert(ingredientTypePricesTable)
      .values({
        ingredient_type_id: ingredientTypeResult[0].id,
        size_id: sizeResult[0].id,
        price: '9.99'
      })
      .returning()
      .execute();

    // Delete first price
    await deleteIngredientTypePrice(price1Result[0].id);

    // Verify first price is deleted
    const deletedPrices = await db.select()
      .from(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.id, price1Result[0].id))
      .execute();

    expect(deletedPrices).toHaveLength(0);

    // Verify second price still exists
    const remainingPrices = await db.select()
      .from(ingredientTypePricesTable)
      .where(eq(ingredientTypePricesTable.id, price2Result[0].id))
      .execute();

    expect(remainingPrices).toHaveLength(1);
    expect(parseFloat(remainingPrices[0].price)).toEqual(9.99);
  });
});
