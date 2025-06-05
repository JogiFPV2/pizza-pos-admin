
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sizesTable, ingredientTypesTable, ingredientTypePricesTable } from '../db/schema';
import { getIngredientTypePrices } from '../handlers/get_ingredient_type_prices';

describe('getIngredientTypePrices', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no ingredient type prices exist', async () => {
    const result = await getIngredientTypePrices();
    expect(result).toEqual([]);
  });

  it('should return all ingredient type prices', async () => {
    // Create prerequisite data: sizes and ingredient types
    const [size1, size2] = await db.insert(sizesTable)
      .values([
        { name: 'Small' },
        { name: 'Large' }
      ])
      .returning()
      .execute();

    const [ingredientType1, ingredientType2] = await db.insert(ingredientTypesTable)
      .values([
        { name: 'Cheese' },
        { name: 'Meat' }
      ])
      .returning()
      .execute();

    // Create ingredient type prices
    await db.insert(ingredientTypePricesTable)
      .values([
        {
          ingredient_type_id: ingredientType1.id,
          size_id: size1.id,
          price: '2.50'
        },
        {
          ingredient_type_id: ingredientType1.id,
          size_id: size2.id,
          price: '4.00'
        },
        {
          ingredient_type_id: ingredientType2.id,
          size_id: size1.id,
          price: '3.50'
        }
      ])
      .execute();

    const result = await getIngredientTypePrices();

    expect(result).toHaveLength(3);

    // Verify all records are returned
    const prices = result.map(r => r.price).sort();
    expect(prices).toEqual([2.50, 3.50, 4.00]);

    // Verify data structure and types
    result.forEach(price => {
      expect(price.id).toBeDefined();
      expect(typeof price.ingredient_type_id).toBe('number');
      expect(typeof price.size_id).toBe('number');
      expect(typeof price.price).toBe('number');
      expect(price.created_at).toBeInstanceOf(Date);
    });

    // Verify specific relationships
    const smallCheesePrice = result.find(p => 
      p.ingredient_type_id === ingredientType1.id && p.size_id === size1.id
    );
    expect(smallCheesePrice?.price).toBe(2.50);

    const largeMeatPrice = result.find(p => 
      p.ingredient_type_id === ingredientType2.id && p.size_id === size1.id
    );
    expect(largeMeatPrice?.price).toBe(3.50);
  });

  it('should handle multiple prices for same ingredient type', async () => {
    // Create prerequisite data
    const [size] = await db.insert(sizesTable)
      .values([{ name: 'Medium' }])
      .returning()
      .execute();

    const [ingredientType] = await db.insert(ingredientTypesTable)
      .values([{ name: 'Vegetables' }])
      .returning()
      .execute();

    // Create multiple prices for same ingredient type
    await db.insert(ingredientTypePricesTable)
      .values([
        {
          ingredient_type_id: ingredientType.id,
          size_id: size.id,
          price: '1.25'
        },
        {
          ingredient_type_id: ingredientType.id,
          size_id: size.id,
          price: '1.75'
        }
      ])
      .execute();

    const result = await getIngredientTypePrices();

    expect(result).toHaveLength(2);
    expect(result.every(p => p.ingredient_type_id === ingredientType.id)).toBe(true);
    expect(result.every(p => p.size_id === size.id)).toBe(true);
    
    const prices = result.map(r => r.price).sort();
    expect(prices).toEqual([1.25, 1.75]);
  });
});
