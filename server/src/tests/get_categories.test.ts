
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable } from '../db/schema';
import { getCategories } from '../handlers/get_categories';

describe('getCategories', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no categories exist', async () => {
    const result = await getCategories();
    expect(result).toEqual([]);
  });

  it('should return all categories', async () => {
    // Create test categories
    await db.insert(categoriesTable)
      .values([
        { name: 'Beverages' },
        { name: 'Food' },
        { name: 'Desserts' }
      ])
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Beverages');
    expect(result[1].name).toEqual('Food');
    expect(result[2].name).toEqual('Desserts');
    
    // Verify all categories have required fields
    result.forEach(category => {
      expect(category.id).toBeDefined();
      expect(typeof category.id).toBe('number');
      expect(category.name).toBeDefined();
      expect(typeof category.name).toBe('string');
      expect(category.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return categories in insertion order', async () => {
    // Insert categories in specific order
    await db.insert(categoriesTable)
      .values({ name: 'First Category' })
      .execute();
    
    await db.insert(categoriesTable)
      .values({ name: 'Second Category' })
      .execute();

    const result = await getCategories();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Category');
    expect(result[1].name).toEqual('Second Category');
    expect(result[0].id).toBeLessThan(result[1].id);
  });
});
