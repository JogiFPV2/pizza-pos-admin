
import { db } from '../db';
import { productsTable } from '../db/schema';
import { type Product } from '../schema';

export const getProducts = async (): Promise<Product[]> => {
  try {
    const results = await db.select()
      .from(productsTable)
      .execute();

    return results.map(product => ({
      ...product,
      // No numeric conversions needed - all fields are already correct types
    }));
  } catch (error) {
    console.error('Get products failed:', error);
    throw error;
  }
};
