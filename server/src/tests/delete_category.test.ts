
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type CreateCategoryInput } from '../schema';
import { deleteCategory } from '../handlers/delete_category';
import { eq } from 'drizzle-orm';

const testCategory: CreateCategoryInput = {
  name: 'Test Category'
};

describe('deleteCategory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a category', async () => {
    // Create category first
    const created = await db.insert(categoriesTable)
      .values(testCategory)
      .returning()
      .execute();

    const categoryId = created[0].id;

    // Delete the category
    await deleteCategory(categoryId);

    // Verify category is deleted
    const categories = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, categoryId))
      .execute();

    expect(categories).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent category', async () => {
    const nonExistentId = 999;

    // Should not throw an error
    await expect(deleteCategory(nonExistentId)).resolves.toBeUndefined();
  });

  it('should only delete the specified category', async () => {
    // Create multiple categories
    const category1 = await db.insert(categoriesTable)
      .values({ name: 'Category 1' })
      .returning()
      .execute();

    const category2 = await db.insert(categoriesTable)
      .values({ name: 'Category 2' })
      .returning()
      .execute();

    // Delete only the first category
    await deleteCategory(category1[0].id);

    // Verify first category is deleted
    const deletedCategory = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, category1[0].id))
      .execute();

    expect(deletedCategory).toHaveLength(0);

    // Verify second category still exists
    const remainingCategory = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, category2[0].id))
      .execute();

    expect(remainingCategory).toHaveLength(1);
    expect(remainingCategory[0].name).toEqual('Category 2');
  });
});
