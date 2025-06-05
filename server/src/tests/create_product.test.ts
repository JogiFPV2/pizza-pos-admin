
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateProductInput } from '../schema';
import { createProduct } from '../handlers/create_product';
import { eq } from 'drizzle-orm';

describe('createProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product with default ingredients_enabled', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    const testInput: CreateProductInput = {
      code: 'TEST001',
      name: 'Test Product',
      category_id: categoryId,
      ingredients_enabled: false // Include default value in test
    };

    const result = await createProduct(testInput);

    // Basic field validation
    expect(result.code).toEqual('TEST001');
    expect(result.name).toEqual('Test Product');
    expect(result.category_id).toEqual(categoryId);
    expect(result.ingredients_enabled).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a product with ingredients enabled', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    const testInput: CreateProductInput = {
      code: 'TEST002',
      name: 'Test Product with Ingredients',
      category_id: categoryId,
      ingredients_enabled: true
    };

    const result = await createProduct(testInput);

    expect(result.code).toEqual('TEST002');
    expect(result.name).toEqual('Test Product with Ingredients');
    expect(result.category_id).toEqual(categoryId);
    expect(result.ingredients_enabled).toEqual(true);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save product to database', async () => {
    // Create prerequisite category
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();
    const categoryId = categoryResult[0].id;

    const testInput: CreateProductInput = {
      code: 'TEST003',
      name: 'Database Test Product',
      category_id: categoryId,
      ingredients_enabled: false
    };

    const result = await createProduct(testInput);

    // Query using proper drizzle syntax
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, result.id))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].code).toEqual('TEST003');
    expect(products[0].name).toEqual('Database Test Product');
    expect(products[0].category_id).toEqual(categoryId);
    expect(products[0].ingredients_enabled).toEqual(false);
    expect(products[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when category does not exist', async () => {
    const testInput: CreateProductInput = {
      code: 'TEST004',
      name: 'Invalid Category Product',
      category_id: 99999, // Non-existent category ID
      ingredients_enabled: false
    };

    await expect(createProduct(testInput)).rejects.toThrow(/violates foreign key constraint/i);
  });
});
