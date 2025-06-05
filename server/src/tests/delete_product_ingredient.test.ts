
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  categoriesTable, 
  ingredientTypesTable, 
  ingredientsTable, 
  productsTable, 
  productIngredientsTable 
} from '../db/schema';
import { type DeleteProductIngredientInput } from '../schema';
import { deleteProductIngredient } from '../handlers/delete_product_ingredient';
import { eq, and } from 'drizzle-orm';

describe('deleteProductIngredient', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a product ingredient relationship', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const ingredientType = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
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

    const ingredient = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    // Create product ingredient relationship
    await db.insert(productIngredientsTable)
      .values({
        product_id: product[0].id,
        ingredient_id: ingredient[0].id
      })
      .execute();

    const input: DeleteProductIngredientInput = {
      product_id: product[0].id,
      ingredient_id: ingredient[0].id
    };

    // Delete the relationship
    await deleteProductIngredient(input);

    // Verify the relationship was deleted
    const relationships = await db.select()
      .from(productIngredientsTable)
      .where(
        and(
          eq(productIngredientsTable.product_id, product[0].id),
          eq(productIngredientsTable.ingredient_id, ingredient[0].id)
        )
      )
      .execute();

    expect(relationships).toHaveLength(0);
  });

  it('should not affect other product ingredient relationships', async () => {
    // Create prerequisite data
    const category = await db.insert(categoriesTable)
      .values({ name: 'Test Category' })
      .returning()
      .execute();

    const ingredientType = await db.insert(ingredientTypesTable)
      .values({ name: 'Test Type' })
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

    const ingredient1 = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient 1',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    const ingredient2 = await db.insert(ingredientsTable)
      .values({
        name: 'Test Ingredient 2',
        ingredient_type_id: ingredientType[0].id
      })
      .returning()
      .execute();

    // Create two product ingredient relationships
    await db.insert(productIngredientsTable)
      .values([
        {
          product_id: product[0].id,
          ingredient_id: ingredient1[0].id
        },
        {
          product_id: product[0].id,
          ingredient_id: ingredient2[0].id
        }
      ])
      .execute();

    const input: DeleteProductIngredientInput = {
      product_id: product[0].id,
      ingredient_id: ingredient1[0].id
    };

    // Delete one relationship
    await deleteProductIngredient(input);

    // Verify only the targeted relationship was deleted
    const allRelationships = await db.select()
      .from(productIngredientsTable)
      .where(eq(productIngredientsTable.product_id, product[0].id))
      .execute();

    expect(allRelationships).toHaveLength(1);
    expect(allRelationships[0].ingredient_id).toEqual(ingredient2[0].id);
  });

  it('should handle non-existent product ingredient relationship gracefully', async () => {
    const input: DeleteProductIngredientInput = {
      product_id: 999,
      ingredient_id: 888
    };

    // Should not throw an error even if the relationship doesn't exist
    let errorThrown = false;
    try {
      await deleteProductIngredient(input);
    } catch (error) {
      errorThrown = true;
    }

    expect(errorThrown).toBe(false);
  });
});
