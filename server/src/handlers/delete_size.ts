
import { db } from '../db';
import { sizesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteSize = async (id: number): Promise<void> => {
  try {
    await db.delete(sizesTable)
      .where(eq(sizesTable.id, id))
      .execute();
  } catch (error) {
    console.error('Size deletion failed:', error);
    throw error;
  }
};
