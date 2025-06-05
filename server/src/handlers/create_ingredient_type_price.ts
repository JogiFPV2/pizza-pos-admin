
import { db } from '../db';
import { ingredientTypePricesTable } from '../db/schema';
import { type CreateIngredientTypePriceInput, type IngredientTypePrice } from '../schema';

export const createIngredientTypePrice = async (input: CreateIngredientTypePriceInput): Promise<IngredientTypePrice> => {
  try {
    // Insert ingredient type price record
    const result = await db.insert(ingredientTypePricesTable)
      .values({
        ingredient_type_id: input.ingredient_type_id,
        size_id: input.size_id,
        price: input.price.toString() // Convert number to string for numeric column
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const ingredientTypePrice = result[0];
    return {
      ...ingredientTypePrice,
      price: parseFloat(ingredientTypePrice.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Ingredient type price creation failed:', error);
    throw error;
  }
};
