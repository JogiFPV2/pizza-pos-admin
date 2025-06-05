
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sizesTable } from '../db/schema';
import { type CreateSizeInput } from '../schema';
import { createSize } from '../handlers/create_size';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateSizeInput = {
  name: 'Large'
};

describe('createSize', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a size', async () => {
    const result = await createSize(testInput);

    // Basic field validation
    expect(result.name).toEqual('Large');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save size to database', async () => {
    const result = await createSize(testInput);

    // Query using proper drizzle syntax
    const sizes = await db.select()
      .from(sizesTable)
      .where(eq(sizesTable.id, result.id))
      .execute();

    expect(sizes).toHaveLength(1);
    expect(sizes[0].name).toEqual('Large');
    expect(sizes[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple sizes with different names', async () => {
    const firstSize = await createSize({ name: 'Small' });
    const secondSize = await createSize({ name: 'Medium' });

    expect(firstSize.id).not.toEqual(secondSize.id);
    expect(firstSize.name).toEqual('Small');
    expect(secondSize.name).toEqual('Medium');

    // Verify both exist in database
    const allSizes = await db.select()
      .from(sizesTable)
      .execute();

    expect(allSizes).toHaveLength(2);
    expect(allSizes.map(s => s.name)).toContain('Small');
    expect(allSizes.map(s => s.name)).toContain('Medium');
  });
});
