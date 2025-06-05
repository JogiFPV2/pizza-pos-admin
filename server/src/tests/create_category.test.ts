
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { createCategory } from '../handlers/create_category';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateCategoryInput = {
  name: 'Test Category'
};

describe('createCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a category', async () => {
    const result = await createCategory(testInput);

    // Basic field validation
    expect(result.name).toEqual('Test Category');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save category to database', async () => {
    const result = await createCategory(testInput);

    // Query using proper drizzle syntax
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, result.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Test Category');
    expect(categories[0].id).toEqual(result.id);
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple categories with different names', async () => {
    const firstCategory = await createCategory({ name: 'Pizza' });
    const secondCategory = await createCategory({ name: 'Drinks' });

    expect(firstCategory.id).not.toEqual(secondCategory.id);
    expect(firstCategory.name).toEqual('Pizza');
    expect(secondCategory.name).toEqual('Drinks');

    // Verify both exist in database
    const allCategories = await db.select()
      .from(categoriesTable)
      .execute();

    expect(allCategories).toHaveLength(2);
    const categoryNames = allCategories.map(cat => cat.name).sort();
    expect(categoryNames).toEqual(['Drinks', 'Pizza']);
  });
});
