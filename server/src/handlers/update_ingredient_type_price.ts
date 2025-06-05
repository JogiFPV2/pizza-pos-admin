
import { db } from '../db';
import { ingredientTypePricesTable } from '../db/schema';
import { type UpdateIngredientTypePriceInput, type IngredientTypePrice } from '../schema';
import { eq } from 'drizzle-orm';

export const updateIngredientTypePrice = async (input: UpdateIngredientTypePriceInput): Promise<IngredientTypePrice> => {
  try {
    // If no fields to update, just return the existing record
    if (input.price === undefined) {
      const existing = await db.select()
        .from(ingredientTypePricesTable)
        .where(eq(ingredientTypePricesTable.id, input.id))
        .execute();

      if (existing.length === 0) {
        throw new Error('Ingredient type price not found');
      }

      return {
        ...existing[0],
        price: parseFloat(existing[0].price)
      };
    }

    // Update ingredient type price record
    const result = await db.update(ingredientTypePricesTable)
      .set({
        price: input.price.toString()
      })
      .where(eq(ingredientTypePricesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Ingredient type price not found');
    }

    // Convert numeric fields back to numbers before returning
    const ingredientTypePrice = result[0];
    return {
      ...ingredientTypePrice,
      price: parseFloat(ingredientTypePrice.price)
    };
  } catch (error) {
    console.error('Ingredient type price update failed:', error);
    throw error;
  }
};
