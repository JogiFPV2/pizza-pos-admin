
import { db } from '../db';
import { productPricesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteProductPrice = async (id: number): Promise<void> => {
  try {
    await db.delete(productPricesTable)
      .where(eq(productPricesTable.id, id))
      .execute();
  } catch (error) {
    console.error('Product price deletion failed:', error);
    throw error;
  }
};
