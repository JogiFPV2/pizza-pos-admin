
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { getProducts } from '../handlers/get_products';

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no products exist', async () => {
    const result = await getProducts();
    expect(result).toEqual([]);
  });

  it('should return all products', async () => {
    // Create a category first (foreign key requirement)
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category'
      })
      .returning()
      .execute();

    const categoryId = categoryResult[0].id;

    // Create test products
    await db.insert(productsTable)
      .values([
        {
          code: 'PROD001',
          name: 'Test Product 1',
          category_id: categoryId,
          ingredients_enabled: true
        },
        {
          code: 'PROD002',
          name: 'Test Product 2',
          category_id: categoryId,
          ingredients_enabled: false
        }
      ])
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(2);
    
    // Verify first product
    expect(result[0].code).toEqual('PROD001');
    expect(result[0].name).toEqual('Test Product 1');
    expect(result[0].category_id).toEqual(categoryId);
    expect(result[0].ingredients_enabled).toEqual(true);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);

    // Verify second product
    expect(result[1].code).toEqual('PROD002');
    expect(result[1].name).toEqual('Test Product 2');
    expect(result[1].category_id).toEqual(categoryId);
    expect(result[1].ingredients_enabled).toEqual(false);
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should return products with correct data types', async () => {
    // Create a category first
    const categoryResult = await db.insert(categoriesTable)
      .values({
        name: 'Test Category'
      })
      .returning()
      .execute();

    // Create a test product
    await db.insert(productsTable)
      .values({
        code: 'PROD001',
        name: 'Test Product',
        category_id: categoryResult[0].id,
        ingredients_enabled: true
      })
      .execute();

    const result = await getProducts();

    expect(result).toHaveLength(1);
    const product = result[0];

    // Verify data types
    expect(typeof product.id).toBe('number');
    expect(typeof product.code).toBe('string');
    expect(typeof product.name).toBe('string');
    expect(typeof product.category_id).toBe('number');
    expect(typeof product.ingredients_enabled).toBe('boolean');
    expect(product.created_at).toBeInstanceOf(Date);
  });
});
