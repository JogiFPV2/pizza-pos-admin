
import { db } from '../db';
import { sizesTable } from '../db/schema';
import { type UpdateSizeInput, type Size } from '../schema';
import { eq } from 'drizzle-orm';

export const updateSize = async (input: UpdateSizeInput): Promise<Size> => {
  try {
    // Build update object with only defined fields
    const updateData: Partial<typeof sizesTable.$inferInsert> = {};
    
    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    // If no fields to update, just return the existing record
    if (Object.keys(updateData).length === 0) {
      const existing = await db.select()
        .from(sizesTable)
        .where(eq(sizesTable.id, input.id))
        .execute();
      
      if (existing.length === 0) {
        throw new Error(`Size with id ${input.id} not found`);
      }
      
      return existing[0];
    }

    // Update the record
    const result = await db.update(sizesTable)
      .set(updateData)
      .where(eq(sizesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Size with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Size update failed:', error);
    throw error;
  }
};
