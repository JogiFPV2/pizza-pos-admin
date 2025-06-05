
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sizesTable, categoriesTable, productsTable, productPricesTable } from '../db/schema';
import { type UpdateProductPriceInput } from '../schema';
import { updateProductPrice } from '../handlers/update_product_price';
import { eq } from 'drizzle-orm';

describe('updateProductPrice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update product price', async () => {
    // Create prerequisite data
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();
    const size = sizeResult[0];

    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Beverages' })
      .returning()
      .execute();
    const category = categoryResult[0];

    const productResult = await db.insert(productsTable)
      .values({
        code: 'PROD001',
        name: 'Test Product',
        category_id: category.id,
        ingredients_enabled: false
      })
      .returning()
      .execute();
    const product = productResult[0];

    const productPriceResult = await db.insert(productPricesTable)
      .values({
        product_id: product.id,
        size_id: size.id,
        price: '15.50'
      })
      .returning()
      .execute();
    const productPrice = productPriceResult[0];

    const testInput: UpdateProductPriceInput = {
      id: productPrice.id,
      price: 18.75
    };

    const result = await updateProductPrice(testInput);

    // Basic field validation
    expect(result.id).toEqual(productPrice.id);
    expect(result.product_id).toEqual(product.id);
    expect(result.size_id).toEqual(size.id);
    expect(result.price).toEqual(18.75);
    expect(typeof result.price).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated price to database', async () => {
    // Create prerequisite data
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Large' })
      .returning()
      .execute();
    const size = sizeResult[0];

    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Food' })
      .returning()
      .execute();
    const category = categoryResult[0];

    const productResult = await db.insert(productsTable)
      .values({
        code: 'PROD002',
        name: 'Another Product',
        category_id: category.id,
        ingredients_enabled: true
      })
      .returning()
      .execute();
    const product = productResult[0];

    const productPriceResult = await db.insert(productPricesTable)
      .values({
        product_id: product.id,
        size_id: size.id,
        price: '22.00'
      })
      .returning()
      .execute();
    const productPrice = productPriceResult[0];

    const testInput: UpdateProductPriceInput = {
      id: productPrice.id,
      price: 25.99
    };

    await updateProductPrice(testInput);

    // Query database to verify update
    const updatedPrices = await db.select()
      .from(productPricesTable)
      .where(eq(productPricesTable.id, productPrice.id))
      .execute();

    expect(updatedPrices).toHaveLength(1);
    expect(parseFloat(updatedPrices[0].price)).toEqual(25.99);
    expect(updatedPrices[0].product_id).toEqual(product.id);
    expect(updatedPrices[0].size_id).toEqual(size.id);
  });

  it('should handle partial updates', async () => {
    // Create prerequisite data
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Small' })
      .returning()
      .execute();
    const size = sizeResult[0];

    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Snacks' })
      .returning()
      .execute();
    const category = categoryResult[0];

    const productResult = await db.insert(productsTable)
      .values({
        code: 'PROD003',
        name: 'Snack Product',
        category_id: category.id,
        ingredients_enabled: false
      })
      .returning()
      .execute();
    const product = productResult[0];

    const productPriceResult = await db.insert(productPricesTable)
      .values({
        product_id: product.id,
        size_id: size.id,
        price: '5.25'
      })
      .returning()
      .execute();
    const productPrice = productPriceResult[0];

    // Update with only ID (no price field)
    const testInput: UpdateProductPriceInput = {
      id: productPrice.id
    };

    const result = await updateProductPrice(testInput);

    // Should return existing data unchanged
    expect(result.price).toEqual(5.25);
    expect(result.product_id).toEqual(product.id);
    expect(result.size_id).toEqual(size.id);
    expect(typeof result.price).toBe('number');
  });

  it('should throw error for non-existent product price', async () => {
    const testInput: UpdateProductPriceInput = {
      id: 99999,
      price: 10.00
    };

    expect(updateProductPrice(testInput)).rejects.toThrow(/not found/i);
  });
});
