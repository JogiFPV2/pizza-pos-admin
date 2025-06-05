
import { db } from '../db';
import { sizesTable } from '../db/schema';
import { type Size } from '../schema';

export const getSizes = async (): Promise<Size[]> => {
  try {
    const results = await db.select()
      .from(sizesTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Get sizes failed:', error);
    throw error;
  }
};
