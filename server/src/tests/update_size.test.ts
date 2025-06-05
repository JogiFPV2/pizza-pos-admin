
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sizesTable } from '../db/schema';
import { type UpdateSizeInput } from '../schema';
import { updateSize } from '../handlers/update_size';
import { eq } from 'drizzle-orm';

describe('updateSize', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a size name', async () => {
    // Create a size first
    const created = await db.insert(sizesTable)
      .values({ name: 'Small' })
      .returning()
      .execute();

    const sizeId = created[0].id;

    const updateInput: UpdateSizeInput = {
      id: sizeId,
      name: 'Extra Small'
    };

    const result = await updateSize(updateInput);

    expect(result.id).toEqual(sizeId);
    expect(result.name).toEqual('Extra Small');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save updated size to database', async () => {
    // Create a size first
    const created = await db.insert(sizesTable)
      .values({ name: 'Medium' })
      .returning()
      .execute();

    const sizeId = created[0].id;

    const updateInput: UpdateSizeInput = {
      id: sizeId,
      name: 'Large'
    };

    await updateSize(updateInput);

    // Verify in database
    const sizes = await db.select()
      .from(sizesTable)
      .where(eq(sizesTable.id, sizeId))
      .execute();

    expect(sizes).toHaveLength(1);
    expect(sizes[0].name).toEqual('Large');
  });

  it('should handle partial updates', async () => {
    // Create a size first
    const created = await db.insert(sizesTable)
      .values({ name: 'Original Name' })
      .returning()
      .execute();

    const sizeId = created[0].id;

    // Update with no fields (should return existing record)
    const updateInput: UpdateSizeInput = {
      id: sizeId
    };

    const result = await updateSize(updateInput);

    expect(result.id).toEqual(sizeId);
    expect(result.name).toEqual('Original Name');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should throw error for non-existent size', async () => {
    const updateInput: UpdateSizeInput = {
      id: 999,
      name: 'Updated Name'
    };

    expect(updateSize(updateInput)).rejects.toThrow(/not found/i);
  });

  it('should preserve created_at when updating', async () => {
    // Create a size first
    const created = await db.insert(sizesTable)
      .values({ name: 'Test Size' })
      .returning()
      .execute();

    const sizeId = created[0].id;
    const originalCreatedAt = created[0].created_at;

    const updateInput: UpdateSizeInput = {
      id: sizeId,
      name: 'Updated Size'
    };

    const result = await updateSize(updateInput);

    expect(result.created_at).toEqual(originalCreatedAt);
    expect(result.name).toEqual('Updated Size');
  });
});
