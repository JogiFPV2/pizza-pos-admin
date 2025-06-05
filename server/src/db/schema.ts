
import { serial, text, pgTable, timestamp, numeric, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Sizes table
export const sizesTable = pgTable('sizes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Ingredient types table
export const ingredientTypesTable = pgTable('ingredient_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Ingredient type prices table (price per size for each ingredient type)
export const ingredientTypePricesTable = pgTable('ingredient_type_prices', {
  id: serial('id').primaryKey(),
  ingredient_type_id: integer('ingredient_type_id').notNull().references(() => ingredientTypesTable.id),
  size_id: integer('size_id').notNull().references(() => sizesTable.id),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Ingredients table
export const ingredientsTable = pgTable('ingredients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ingredient_type_id: integer('ingredient_type_id').notNull().references(() => ingredientTypesTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  category_id: integer('category_id').notNull().references(() => categoriesTable.id),
  ingredients_enabled: boolean('ingredients_enabled').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Product prices table (price per size for each product)
export const productPricesTable = pgTable('product_prices', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  size_id: integer('size_id').notNull().references(() => sizesTable.id),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Product ingredients table (many-to-many relationship)
export const productIngredientsTable = pgTable('product_ingredients', {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').notNull().references(() => productsTable.id),
  ingredient_id: integer('ingredient_id').notNull().references(() => ingredientsTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const sizesRelations = relations(sizesTable, ({ many }) => ({
  ingredientTypePrices: many(ingredientTypePricesTable),
  productPrices: many(productPricesTable),
}));

export const ingredientTypesRelations = relations(ingredientTypesTable, ({ many }) => ({
  ingredients: many(ingredientsTable),
  prices: many(ingredientTypePricesTable),
}));

export const ingredientTypePricesRelations = relations(ingredientTypePricesTable, ({ one }) => ({
  ingredientType: one(ingredientTypesTable, {
    fields: [ingredientTypePricesTable.ingredient_type_id],
    references: [ingredientTypesTable.id],
  }),
  size: one(sizesTable, {
    fields: [ingredientTypePricesTable.size_id],
    references: [sizesTable.id],
  }),
}));

export const ingredientsRelations = relations(ingredientsTable, ({ one, many }) => ({
  ingredientType: one(ingredientTypesTable, {
    fields: [ingredientsTable.ingredient_type_id],
    references: [ingredientTypesTable.id],
  }),
  productIngredients: many(productIngredientsTable),
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  products: many(productsTable),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.category_id],
    references: [categoriesTable.id],
  }),
  prices: many(productPricesTable),
  productIngredients: many(productIngredientsTable),
}));

export const productPricesRelations = relations(productPricesTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productPricesTable.product_id],
    references: [productsTable.id],
  }),
  size: one(sizesTable, {
    fields: [productPricesTable.size_id],
    references: [sizesTable.id],
  }),
}));

export const productIngredientsRelations = relations(productIngredientsTable, ({ one }) => ({
  product: one(productsTable, {
    fields: [productIngredientsTable.product_id],
    references: [productsTable.id],
  }),
  ingredient: one(ingredientsTable, {
    fields: [productIngredientsTable.ingredient_id],
    references: [ingredientsTable.id],
  }),
}));

// Export all tables for relation queries
export const tables = {
  sizes: sizesTable,
  ingredientTypes: ingredientTypesTable,
  ingredientTypePrices: ingredientTypePricesTable,
  ingredients: ingredientsTable,
  categories: categoriesTable,
  products: productsTable,
  productPrices: productPricesTable,
  productIngredients: productIngredientsTable,
};
