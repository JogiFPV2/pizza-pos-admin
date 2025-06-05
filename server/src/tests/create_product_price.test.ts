
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productPricesTable, categoriesTable, productsTable, sizesTable } from '../db/schema';
import { type CreateProductPriceInput } from '../schema';
import { createProductPrice } from '../handlers/create_product_price';
import { eq } from 'drizzle-orm';

describe('createProductPrice', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let categoryId: number;
  let productId: number;
  let sizeId: number;

  beforeEach(async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();
    categoryId = categoryResult[0].id;

    // Create prerequisite product
    const productResult = await db.insert(productsTable)
      .values({
        code: 'TEST001',
        name: 'Test Product',
        category_id: categoryId,
        ingredients_enabled: false
      })
      .returning()
      .execute();
    productId = productResult[0].id;

    // Create prerequisite size
    const sizeResult = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();
    sizeId = sizeResult[0].id;
  });

  const testInput: CreateProductPriceInput = {
    product_id: 0, // Will be set in beforeEach
    size_id: 0, // Will be set in beforeEach
    price: 12.99
  };

  it('should create a product price', async () => {
    const input = { ...testInput, product_id: productId, size_id: sizeId };
    const result = await createProductPrice(input);

    // Basic field validation
    expect(result.product_id).toEqual(productId);
    expect(result.size_id).toEqual(sizeId);
    expect(result.price).toEqual(12.99);
    expect(typeof result.price).toBe('number');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save product price to database', async () => {
    const input = { ...testInput, product_id: productId, size_id: sizeId };
    const result = await createProductPrice(input);

    // Query using proper drizzle syntax
    const productPrices = await db.select()
      .from(productPricesTable)
      .where(eq(productPricesTable.id, result.id))
      .execute();

    expect(productPrices).toHaveLength(1);
    expect(productPrices[0].product_id).toEqual(productId);
    expect(productPrices[0].size_id).toEqual(sizeId);
    expect(parseFloat(productPrices[0].price)).toEqual(12.99);
    expect(productPrices[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different price values correctly', async () => {
    const testCases = [
      { price: 0.01, expected: 0.01 },
      { price: 99.99, expected: 99.99 },
      { price: 100, expected: 100 }
    ];

    for (const testCase of testCases) {
      const input = { 
        ...testInput, 
        product_id: productId, 
        size_id: sizeId, 
        price: testCase.price 
      };
      
      const result = await createProductPrice(input);
      
      expect(result.price).toEqual(testCase.expected);
      expect(typeof result.price).toBe('number');
    }
  });

  it('should throw error for non-existent product', async () => {
    const input = { ...testInput, product_id: 99999, size_id: sizeId };
    
    expect(createProductPrice(input)).rejects.toThrow(/violates foreign key constraint/i);
  });

  it('should throw error for non-existent size', async () => {
    const input = { ...testInput, product_id: productId, size_id: 99999 };
    
    expect(createProductPrice(input)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
