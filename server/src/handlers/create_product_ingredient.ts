
import { db } from '../db';
import { productIngredientsTable, productsTable, ingredientsTable } from '../db/schema';
import { type CreateProductIngredientInput, type ProductIngredient } from '../schema';
import { eq } from 'drizzle-orm';

export const createProductIngredient = async (input: CreateProductIngredientInput): Promise<ProductIngredient> => {
  try {
    // Verify that the product exists
    const product = await db.select()
      .from(productsTable)
      .where(eq(productsTable.id, input.product_id))
      .execute();

    if (product.length === 0) {
      throw new Error(`Product with id ${input.product_id} not found`);
    }

    // Verify that the ingredient exists
    const ingredient = await db.select()
      .from(ingredientsTable)
      .where(eq(ingredientsTable.id, input.ingredient_id))
      .execute();

    if (ingredient.length === 0) {
      throw new Error(`Ingredient with id ${input.ingredient_id} not found`);
    }

    // Insert product ingredient record
    const result = await db.insert(productIngredientsTable)
      .values({
        product_id: input.product_id,
        ingredient_id: input.ingredient_id
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Product ingredient creation failed:', error);
    throw error;
  }
};
