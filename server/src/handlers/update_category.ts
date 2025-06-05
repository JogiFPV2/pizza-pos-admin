
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { type UpdateCategoryInput, type Category } from '../schema';
import { eq } from 'drizzle-orm';

export const updateCategory = async (input: UpdateCategoryInput): Promise<Category> => {
  try {
    // Build update object with only provided fields
    const updateData: { name?: string } = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    // If no fields to update, fetch and return existing record
    if (Object.keys(updateData).length === 0) {
      const existing = await db.select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, input.id))
        .execute();
      
      if (existing.length === 0) {
        throw new Error(`Category with id ${input.id} not found`);
      }
      
      return existing[0];
    }

    // Update category record
    const result = await db.update(categoriesTable)
      .set(updateData)
      .where(eq(categoriesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Category with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Category update failed:', error);
    throw error;
  }
};
