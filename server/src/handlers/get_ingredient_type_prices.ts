
import { db } from '../db';
import { ingredientTypePricesTable } from '../db/schema';
import { type IngredientTypePrice } from '../schema';

export const getIngredientTypePrices = async (): Promise<IngredientTypePrice[]> => {
  try {
    const results = await db.select()
      .from(ingredientTypePricesTable)
      .execute();

    // Convert numeric price field back to number
    return results.map(result => ({
      ...result,
      price: parseFloat(result.price)
    }));
  } catch (error) {
    console.error('Get ingredient type prices failed:', error);
    throw error;
  }
};
