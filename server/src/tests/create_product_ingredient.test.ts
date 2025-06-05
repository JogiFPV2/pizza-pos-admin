
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { productIngredientsTable, productsTable, ingredientsTable, categoriesTable, ingredientTypesTable } from '../db/schema';
import { type CreateProductIngredientInput } from '../schema';
import { createProductIngredient } from '../handlers/create_product_ingredient';
import { eq } from 'drizzle-orm';

describe('createProductIngredient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a product ingredient', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        code: 'TEST001',
        name: 'Test Product',
        category_id: categoryResult[0].id,
        ingredients_enabled: true
      })
      .returning()
      .execute();

    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    const ingredientResult = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientTypeResult[0].id
      })
      .returning()
      .execute();

    const testInput: CreateProductIngredientInput = {
      product_id: productResult[0].id,
      ingredient_id: ingredientResult[0].id
    };

    const result = await createProductIngredient(testInput);

    // Basic field validation
    expect(result.product_id).toEqual(productResult[0].id);
    expect(result.ingredient_id).toEqual(ingredientResult[0].id);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save product ingredient to database', async () => {
    // Create prerequisite data
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        code: 'TEST001',
        name: 'Test Product',
        category_id: categoryResult[0].id,
        ingredients_enabled: true
      })
      .returning()
      .execute();

    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    const ingredientResult = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientTypeResult[0].id
      })
      .returning()
      .execute();

    const testInput: CreateProductIngredientInput = {
      product_id: productResult[0].id,
      ingredient_id: ingredientResult[0].id
    };

    const result = await createProductIngredient(testInput);

    // Query using proper drizzle syntax
    const productIngredients = await db.select()
      .from(productIngredientsTable)
      .where(eq(productIngredientsTable.id, result.id))
      .execute();

    expect(productIngredients).toHaveLength(1);
    expect(productIngredients[0].product_id).toEqual(productResult[0].id);
    expect(productIngredients[0].ingredient_id).toEqual(ingredientResult[0].id);
    expect(productIngredients[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when product does not exist', async () => {
    // Create ingredient type and ingredient
    const ingredientTypeResult = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
      .returning()
      .execute();

    const ingredientResult = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientTypeResult[0].id
      })
      .returning()
      .execute();

    const testInput: CreateProductIngredientInput = {
      product_id: 999, // Non-existent product
      ingredient_id: ingredientResult[0].id
    };

    await expect(createProductIngredient(testInput)).rejects.toThrow(/product with id 999 not found/i);
  });

  it('should throw error when ingredient does not exist', async () => {
    // Create category and product
    const categoryResult = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const productResult = await db.insert(productsTable)
      .values({
        code: 'TEST001',
        name: 'Test Product',
        category_id: categoryResult[0].id,
        ingredients_enabled: true
      })
      .returning()
      .execute();

    const testInput: CreateProductIngredientInput = {
      product_id: productResult[0].id,
      ingredient_id: 999 // Non-existent ingredient
    };

    await expect(createProductIngredient(testInput)).rejects.toThrow(/ingredient with id 999 not found/i);
  });
});
