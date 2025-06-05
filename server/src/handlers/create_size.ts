
import { db } from '../db';
import { sizesTable } from '../db/schema';
import { type CreateSizeInput, type Size } from '../schema';

export const createSize = async (input: CreateSizeInput): Promise<Size> => {
  try {
    // Insert size record
    const result = await db.insert(sizesTable)
      .values({
        name: input.name
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Size creation failed:', error);
    throw error;
  }
};
