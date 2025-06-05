
import { db } from '../db';
import { productPricesTable } from '../db/schema';
import { type UpdateProductPriceInput, type ProductPrice } from '../schema';
import { eq } from 'drizzle-orm';

export const updateProductPrice = async (input: UpdateProductPriceInput): Promise<ProductPrice> => {
  try {
    // Build update values object with only provided fields
    const updateValues: any = {};
    
    if (input.price !== undefined) {
      updateValues.price = input.price.toString(); // Convert number to string for numeric column
    }

    // If no fields to update, just return the existing record
    if (Object.keys(updateValues).length === 0) {
      const existingRecord = await db.select()
        .from(productPricesTable)
        .where(eq(productPricesTable.id, input.id))
        .execute();

      if (existingRecord.length === 0) {
        throw new Error(`Product price with id ${input.id} not found`);
      }

      // Convert numeric fields back to numbers before returning
      const productPrice = existingRecord[0];
      return {
        ...productPrice,
        price: parseFloat(productPrice.price) // Convert string back to number
      };
    }

    // Update product price record
    const result = await db.update(productPricesTable)
      .set(updateValues)
      .where(eq(productPricesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Product price with id ${input.id} not found`);
    }

    // Convert numeric fields back to numbers before returning
    const productPrice = result[0];
    return {
      ...productPrice,
      price: parseFloat(productPrice.price) // Convert string back to number
    };
  } catch (error) {
    console.error('Product price update failed:', error);
    throw error;
  }
};
