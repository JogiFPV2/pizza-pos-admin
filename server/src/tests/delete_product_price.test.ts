
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, sizesTable, productsTable, productPricesTable } from '../db/schema';
import { deleteProductPrice } from '../handlers/delete_product_price';
import { eq } from 'drizzle-orm';

describe('deleteProductPrice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a product price', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        code: 'TEST001',
        name: 'Test Product',
        category_id: categoryResult[0].id,
        ingredients_enabled: false
      })
      .returning()
      .execute();

    const priceResult = await db.insert(productPricesTable)
      .values({
        product_id: productResult[0].id,
        size_id: sizeResult[0].id,
        price: '15.99'
      })
      .returning()
      .execute();

    // Delete the product price
    await deleteProductPrice(priceResult[0].id);

    // Verify product price was deleted
    const prices = await db.select()
      .from(productPricesTable)
      .where(eq(productPricesTable.id, priceResult[0].id))
      .execute();

    expect(prices).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent product price', async () => {
    const nonExistentId = 999999;

    // This should complete without throwing an error
    await expect(async () => {
      await deleteProductPrice(nonExistentId);
    }).not.toThrow();
  });

  it('should only delete the specified product price', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        code: 'TEST001',
        name: 'Test Product',
        category_id: categoryResult[0].id,
        ingredients_enabled: false
      })
      .returning()
      .execute();

    // Create two product prices
    const price1Result = await db.insert(productPricesTable)
      .values({
        product_id: productResult[0].id,
        size_id: sizeResult[0].id,
        price: '15.99'
      })
      .returning()
      .execute();

    const price2Result = await db.insert(productPricesTable)
      .values({
        product_id: productResult[0].id,
        size_id: sizeResult[0].id,
        price: '19.99'
      })
      .returning()
      .execute();

    // Delete only the first product price
    await deleteProductPrice(price1Result[0].id);

    // Verify first price was deleted
    const deletedPrice = await db.select()
      .from(productPricesTable)
      .where(eq(productPricesTable.id, price1Result[0].id))
      .execute();

    expect(deletedPrice).toHaveLength(0);

    // Verify second price still exists
    const remainingPrice = await db.select()
      .from(productPricesTable)
      .where(eq(productPricesTable.id, price2Result[0].id))
      .execute();

    expect(remainingPrice).toHaveLength(1);
    expect(parseFloat(remainingPrice[0].price)).toEqual(19.99);
  });
});
