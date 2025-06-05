
import { db } from '../db';
import { productPricesTable } from '../db/schema';
import { type ProductPrice } from '../schema';

export const getProductPrices = async (): Promise<ProductPrice[]> => {
  try {
    const results = await db.select()
      .from(productPricesTable)
      .execute();

    // Convert numeric fields back to numbers
    return results.map(productPrice => ({
      ...productPrice,
      price: parseFloat(productPrice.price)
    }));
  } catch (error) {
    console.error('Failed to fetch product prices:', error);
    throw error;
  }
};
