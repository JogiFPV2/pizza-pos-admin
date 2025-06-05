
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sizesTable } from '../db/schema';
import { getSizes } from '../handlers/get_sizes';

describe('getSizes', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no sizes exist', async () => {
    const result = await getSizes();
    expect(result).toEqual([]);
  });

  it('should return all sizes', async () => {
    // Create test sizes
    await db.insert(sizesTable)
      .values([
        { name: 'Small' },
        { name: 'Medium' },
        { name: 'Large' }
      ])
      .execute();

    const result = await getSizes();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Small');
    expect(result[1].name).toEqual('Medium');
    expect(result[2].name).toEqual('Large');
    
    // Verify all required fields are present
    result.forEach(size => {
      expect(size.id).toBeDefined();
      expect(typeof size.id).toBe('number');
      expect(size.name).toBeDefined();
      expect(typeof size.name).toBe('string');
      expect(size.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return sizes in creation order', async () => {
    // Create sizes with slight delay to ensure different timestamps
    await db.insert(sizesTable)
      .values({ name: 'First Size' })
      .execute();
    
    await db.insert(sizesTable)
      .values({ name: 'Second Size' })
      .execute();

    const result = await getSizes();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('First Size');
    expect(result[1].name).toEqual('Second Size');
    expect(result[0].created_at <= result[1].created_at).toBe(true);
  });
});
