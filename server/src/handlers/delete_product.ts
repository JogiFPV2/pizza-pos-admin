
import { db } from '../db';
import { productsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await db.delete(productsTable)
      .where(eq(productsTable.id, id))
      .execute();
  } catch (error) {
    console.error('Product deletion failed:', error);
    throw error;
  }
};
