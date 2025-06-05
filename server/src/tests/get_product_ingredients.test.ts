
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable, ingredientTypesTable, ingredientsTable, productIngredientsTable } from '../db/schema';
import { getProductIngredients } from '../handlers/get_product_ingredients';

describe('getProductIngredients', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no product ingredients exist', async () => {
    const result = await getProductIngredients();

    expect(result).toEqual([]);
  });

  it('should return all product ingredients', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const product = await db.insert(productsTable)
      .values({
        code: 'P001',
        name: 'Test Product',
        category_id: category[0].id,
        ingredients_enabled: true
      })
      .returning()
      .execute();

    const ingredientType = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    const ingredient = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    const productIngredient = await db.insert(productIngredientsTable)
      .values({
        product_id: product[0].id,
        ingredient_id: ingredient[0].id
      })
      .returning()
      .execute();

    const result = await getProductIngredients();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(productIngredient[0].id);
    expect(result[0].product_id).toEqual(product[0].id);
    expect(result[0].ingredient_id).toEqual(ingredient[0].id);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return multiple product ingredients', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const product = await db.insert(productsTable)
      .values({
        code: 'P001',
        name: 'Test Product',
        category_id: category[0].id,
        ingredients_enabled: true
      })
      .returning()
      .execute();

    const ingredientType = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    const ingredient1 = await db.insert(ingredientsTable)
      .values({
        name: 'Ingredient 1',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    const ingredient2 = await db.insert(ingredientsTable)
      .values({
        name: 'Ingredient 2',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    await db.insert(productIngredientsTable)
      .values([
        { product_id: product[0].id, ingredient_id: ingredient1[0].id },
        { product_id: product[0].id, ingredient_id: ingredient2[0].id }
      ])
      .execute();

    const result = await getProductIngredients();

    expect(result).toHaveLength(2);
    expect(result[0].product_id).toEqual(product[0].id);
    expect(result[1].product_id).toEqual(product[0].id);
    
    const ingredientIds = result.map(pi => pi.ingredient_id).sort();
    expect(ingredientIds).toEqual([ingredient1[0].id, ingredient2[0].id].sort());
  });
});
