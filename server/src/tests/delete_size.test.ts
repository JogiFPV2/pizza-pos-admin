
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { sizesTable } from '../db/schema';
import { deleteSize } from '../handlers/delete_size';
import { eq } from 'drizzle-orm';

describe('deleteSize', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a size', async () => {
    // Create a test size
    const createResult = await db.insert(sizesTable)
      .values({
        name: 'Test Size'
      })
      .returning()
      .execute();

    const sizeId = createResult[0].id;

    // Delete the size
    await deleteSize(sizeId);

    // Verify the size is deleted
    const sizes = await db.select()
      .from(sizesTable)
      .where(eq(sizesTable.id, sizeId))
      .execute();

    expect(sizes).toHaveLength(0);
  });

  it('should handle deletion of non-existent size', async () => {
    // Try to delete a non-existent size - should not throw
    await deleteSize(999);

    // Verify no sizes exist
    const sizes = await db.select()
      .from(sizesTable)
      .execute();

    expect(sizes).toHaveLength(0);
  });

  it('should delete only the specified size', async () => {
    // Create multiple test sizes
    const createResults = await db.insert(sizesTable)
      .values([
        { name: 'Size 1' },
        { name: 'Size 2' },
        { name: 'Size 3' }
      ])
      .returning()
      .execute();

    const sizeToDelete = createResults[1].id;

    // Delete the middle size
    await deleteSize(sizeToDelete);

    // Verify only the specified size is deleted
    const remainingSizes = await db.select()
      .from(sizesTable)
      .execute();

    expect(remainingSizes).toHaveLength(2);
    expect(remainingSizes.map(s => s.name)).toEqual(['Size 1', 'Size 3']);
  });
});
