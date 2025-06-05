
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type UpdateCategoryInput, type CreateCategoryInput } from '../schema';
import { updateCategory } from '../handlers/update_category';
import { eq } from 'drizzle-orm';

// Helper to create test category
const createTestCategory = async (input: CreateCategoryInput) => {
  const result = await db.insert(categoriesTable)
    .values(input)
    .returning()
    .execute();
  return result[0];
};

describe('updateCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update category name', async () => {
    // Create test category
    const category = await createTestCategory({
      name: 'Original Name'
    });

    const updateInput: UpdateCategoryInput = {
      id: category.id,
      name: 'Updated Name'
    };

    const result = await updateCategory(updateInput);

    expect(result.id).toEqual(category.id);
    expect(result.name).toEqual('Updated Name');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated category to database', async () => {
    // Create test category
    const category = await createTestCategory({
      name: 'Original Name'
    });

    const updateInput: UpdateCategoryInput = {
      id: category.id,
      name: 'Updated Name'
    };

    await updateCategory(updateInput);

    // Verify in database
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, category.id))
      .execute();

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toEqual('Updated Name');
    expect(categories[0].created_at).toBeInstanceOf(Date);
  });

  it('should return existing category when no fields to update', async () => {
    // Create test category
    const category = await createTestCategory({
      name: 'Test Category'
    });

    const updateInput: UpdateCategoryInput = {
      id: category.id
    };

    const result = await updateCategory(updateInput);

    expect(result.id).toEqual(category.id);
    expect(result.name).toEqual('Test Category');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error when category not found', async () => {
    const updateInput: UpdateCategoryInput = {
      id: 999,
      name: 'Updated Name'
    };

    expect(updateCategory(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should throw error when category not found with no updates', async () => {
    const updateInput: UpdateCategoryInput = {
      id: 999
    };

    expect(updateCategory(updateInput)).rejects.toThrow(/not found/i);
  });
});
