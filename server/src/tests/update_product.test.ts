
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type UpdateProductInput, type CreateCategoryInput } from '../schema';
import { updateProduct } from '../handlers/update_product';
import { eq } from 'drizzle-orm';

describe('updateProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testCategoryId: number;
  let testProductId: number;

  beforeEach(async () => {
    // Create test category
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();
    testCategoryId = categoryResult[0].id;

    // Create test product
    const productResult = await db.insert(productsTable)
      .values({
        code: 'TEST001',
        name: 'Test Product',
        category_id: testCategoryId,
        ingredients_enabled: false
      })
      .returning()
      .execute();
    testProductId = productResult[0].id;
  });

  it('should update product name', async () => {
    const input: UpdateProductInput = {
      id: testProductId,
      name: 'Updated Product Name'
    };

    const result = await updateProduct(input);

    expect(result.id).toEqual(testProductId);
    expect(result.name).toEqual('Updated Product Name');
    expect(result.code).toEqual('TEST001'); // Should remain unchanged
    expect(result.category_id).toEqual(testCategoryId);
    expect(result.ingredients_enabled).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update product code', async () => {
    const input: UpdateProductInput = {
      id: testProductId,
      code: 'UPDATED001'
    };

    const result = await updateProduct(input);

    expect(result.id).toEqual(testProductId);
    expect(result.code).toEqual('UPDATED001');
    expect(result.name).toEqual('Test Product'); // Should remain unchanged
    expect(result.category_id).toEqual(testCategoryId);
    expect(result.ingredients_enabled).toEqual(false);
  });

  it('should update ingredients_enabled flag', async () => {
    const input: UpdateProductInput = {
      id: testProductId,
      ingredients_enabled: true
    };

    const result = await updateProduct(input);

    expect(result.id).toEqual(testProductId);
    expect(result.ingredients_enabled).toEqual(true);
    expect(result.name).toEqual('Test Product'); // Should remain unchanged
    expect(result.code).toEqual('TEST001');
    expect(result.category_id).toEqual(testCategoryId);
  });

  it('should update category_id', async () => {
    // Create another category
    const newCategoryResult = await db.insert(categoriesTable)
      .values({ name: 'New Category' })
      .returning()
      .execute();
    const newCategoryId = newCategoryResult[0].id;

    const input: UpdateProductInput = {
      id: testProductId,
      category_id: newCategoryId
    };

    const result = await updateProduct(input);

    expect(result.id).toEqual(testProductId);
    expect(result.category_id).toEqual(newCategoryId);
    expect(result.name).toEqual('Test Product'); // Should remain unchanged
    expect(result.code).toEqual('TEST001');
    expect(result.ingredients_enabled).toEqual(false);
  });

  it('should update multiple fields at once', async () => {
    const input: UpdateProductInput = {
      id: testProductId,
      name: 'Multi Updated Product',
      code: 'MULTI001',
      ingredients_enabled: true
    };

    const result = await updateProduct(input);

    expect(result.id).toEqual(testProductId);
    expect(result.name).toEqual('Multi Updated Product');
    expect(result.code).toEqual('MULTI001');
    expect(result.ingredients_enabled).toEqual(true);
    expect(result.category_id).toEqual(testCategoryId); // Should remain unchanged
  });

  it('should save updated product to database', async () => {
    const input: UpdateProductInput = {
      id: testProductId,
      name: 'Database Test Product'
    };

    await updateProduct(input);

    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, testProductId))
      .execute();

    expect(products).toHaveLength(1);
    expect(products[0].name).toEqual('Database Test Product');
    expect(products[0].code).toEqual('TEST001');
    expect(products[0].category_id).toEqual(testCategoryId);
    expect(products[0].ingredients_enabled).toEqual(false);
  });

  it('should throw error when product does not exist', async () => {
    const input: UpdateProductInput = {
      id: 99999,
      name: 'Non-existent Product'
    };

    expect(updateProduct(input)).rejects.toThrow(/not found/i);
  });
});
