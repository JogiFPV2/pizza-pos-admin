
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productsTable, categoriesTable } from '../db/schema';
import { type CreateProductInput, type CreateCategoryInput } from '../schema';
import { deleteProduct } from '../handlers/delete_product';
import { eq } from 'drizzle-orm';

describe('deleteProduct', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing product', async () => {
    // Create prerequisite category
    const categoryInput: CreateCategoryInput = {
      name: 'Test Category'
    };

    const categoryResult = await db.insert(categoriesTable)
      .values(categoryInput)
      .returning()
      .execute();

    const category = categoryResult[0];

    // Create test product
    const productInput: CreateProductInput = {
      code: 'TEST001',
      name: 'Test Product',
      category_id: category.id,
      ingredients_enabled: false
    };

    const productResult = await db.insert(productsTable)
      .values(productInput)
      .returning()
      .execute();

    const product = productResult[0];

    // Delete the product
    await deleteProduct(product.id);

    // Verify product is deleted
    const products = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product.id))
      .execute();

    expect(products).toHaveLength(0);
  });

  it('should handle deletion of non-existent product gracefully', async () => {
    const nonExistentId = 999999;

    // Should not throw error for non-existent product
    await expect(deleteProduct(nonExistentId)).resolves.toBeUndefined();
  });

  it('should not affect other products when deleting one', async () => {
    // Create prerequisite category
    const categoryInput: CreateCategoryInput = {
      name: 'Test Category'
    };

    const categoryResult = await db.insert(categoriesTable)
      .values(categoryInput)
      .returning()
      .execute();

    const category = categoryResult[0];

    // Create two test products
    const productInput1: CreateProductInput = {
      code: 'TEST001',
      name: 'Test Product 1',
      category_id: category.id,
      ingredients_enabled: false
    };

    const productInput2: CreateProductInput = {
      code: 'TEST002',
      name: 'Test Product 2',
      category_id: category.id,
      ingredients_enabled: true
    };

    const productResult1 = await db.insert(productsTable)
      .values(productInput1)
      .returning()
      .execute();

    const productResult2 = await db.insert(productsTable)
      .values(productInput2)
      .returning()
      .execute();

    const product1 = productResult1[0];
    const product2 = productResult2[0];

    // Delete first product
    await deleteProduct(product1.id);

    // Verify first product is deleted
    const deletedProducts = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product1.id))
      .execute();

    expect(deletedProducts).toHaveLength(0);

    // Verify second product still exists
    const remainingProducts = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, product2.id))
      .execute();

    expect(remainingProducts).toHaveLength(1);
    expect(remainingProducts[0].name).toEqual('Test Product 2');
    expect(remainingProducts[0].code).toEqual('TEST002');
  });
});
