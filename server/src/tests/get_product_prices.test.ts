
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, sizesTable, productsTable, productPricesTable } from '../db/schema';
import { getProductPrices } from '../handlers/get_product_prices';

describe('getProductPrices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no product prices exist', async () => {
    const result = await getProductPrices();
    expect(result).toEqual([]);
  });

  it('should return all product prices', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const sizeResult = await db.insert(sizesTable)
      .values([
        { name: 'Small' },
        { name: 'Large' }
      ])
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

    // Create product prices
    const productPricesData = [
      {
        product_id: productResult[0].id,
        size_id: sizeResult[0].id,
        price: '9.99'
      },
      {
        product_id: productResult[0].id,
        size_id: sizeResult[1].id,
        price: '14.99'
      }
    ];

    await db.insert(productPricesTable)
      .values(productPricesData)
      .execute();

    const result = await getProductPrices();

    expect(result).toHaveLength(2);
    
    // Verify first product price
    expect(result[0].product_id).toEqual(productResult[0].id);
    expect(result[0].size_id).toEqual(sizeResult[0].id);
    expect(result[0].price).toEqual(9.99);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify second product price
    expect(result[1].product_id).toEqual(productResult[0].id);
    expect(result[1].size_id).toEqual(sizeResult[1].id);
    expect(result[1].price).toEqual(14.99);
    expect(typeof result[1].price).toBe('number');
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should handle multiple products with different prices', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();

    const productResults = await db.insert(productsTable)
      .values([
        {
          code: 'PROD001',
          name: 'Product One',
          category_id: categoryResult[0].id,
          ingredients_enabled: false
        },
        {
          code: 'PROD002',
          name: 'Product Two',
          category_id: categoryResult[0].id,
          ingredients_enabled: true
        }
      ])
      .returning()
      .execute();

    // Create product prices for different products
    await db.insert(productPricesTable)
      .values([
        {
          product_id: productResults[0].id,
          size_id: sizeResult[0].id,
          price: '12.50'
        },
        {
          product_id: productResults[1].id,
          size_id: sizeResult[0].id,
          price: '18.75'
        }
      ])
      .execute();

    const result = await getProductPrices();

    expect(result).toHaveLength(2);
    
    // Find prices by product_id to handle potential ordering differences
    const price1 = result.find(p => p.product_id === productResults[0].id);
    const price2 = result.find(p => p.product_id === productResults[1].id);

    expect(price1).toBeDefined();
    expect(price1!.price).toEqual(12.50);
    expect(typeof price1!.price).toBe('number');

    expect(price2).toBeDefined();
    expect(price2!.price).toEqual(18.75);
    expect(typeof price2!.price).toBe('number');
  });
});
