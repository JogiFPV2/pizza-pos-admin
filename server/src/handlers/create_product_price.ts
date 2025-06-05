
import { db } from '../db';
import { productPricesTable } from '../db/schema';
import { type CreateProductPriceInput, type ProductPrice } from '../schema';

export const createProductPrice = async (input: CreateProductPriceInput): Promise<ProductPrice> => {
  try {
    // Insert product price record
    const result = await db.insert(productPricesTable)
      .values({
        product_id: input.product_id,
        size_id: input.size_id,
        price: input.price.toString() // Convert number to string for numeric column
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const productPrice = result[0];
    return {
      ...productPrice,
      price: parseFloat(productPrice.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Product price creation failed:', error);
    throw error;
  }
};
