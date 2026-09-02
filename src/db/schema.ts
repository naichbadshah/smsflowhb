import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("client"),
    balance: numeric("balance", { precision: 14, scale: 4 }).notNull().default("0"),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("users_username_idx").on(table.username)]
);

export const countries = pgTable(
  "countries",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 10 }).notNull().unique(),
    smsbowerCountryId: integer("smsbower_country_id"),
    providerIds: text("provider_ids").default(""),
    markupPercent: numeric("markup_percent", { precision: 8, scale: 2 }).notNull().default("0"),
    sellingPkrPrice: numeric("selling_pkr_price", { precision: 14, scale: 4 }),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [index("countries_code_idx").on(table.code)]
);

export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 30 }).notNull(),
    amount: numeric("amount", { precision: 14, scale: 4 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    method: varchar("method", { length: 50 }).default(""),
    reference: varchar("reference", { length: 255 }).default(""),
    notes: text("notes").default(""),
    createdById: integer("created_by_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("transactions_user_id_idx").on(table.userId),
    index("transactions_status_idx").on(table.status),
  ]
);

export const activations = pgTable(
  "activations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    countryId: integer("country_id").references(() => countries.id, { onDelete: "set null" }),
    smsbowerActivationId: varchar("smsbower_activation_id", { length: 64 }).notNull(),
    service: varchar("service", { length: 30 }).notNull().default("fb"),
    phoneNumber: varchar("phone_number", { length: 40 }),
    cost: numeric("cost", { precision: 14, scale: 4 }).notNull().default("0"),
    salePrice: numeric("sale_price", { precision: 14, scale: 4 }).notNull().default("0"),
    status: varchar("status", { length: 30 }).notNull().default("pending"),
    smsCode: varchar("sms_code", { length: 20 }),
    smsText: text("sms_text"),
    providerIds: text("provider_ids").default(""),
    retryCount: integer("retry_count").notNull().default(0),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("activations_user_id_idx").on(table.userId),
    index("activations_smsbower_activation_id_idx").on(table.smsbowerActivationId),
    index("activations_status_idx").on(table.status),
  ]
);

export const settings = pgTable(
  "settings",
  {
    key: varchar("key", { length: 100 }).primaryKey(),
    value: text("value").notNull().default(""),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  }
);

export const userCountryRates = pgTable(
  "user_country_rates",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    countryId: integer("country_id")
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    pkrPrice: numeric("pkr_price", { precision: 14, scale: 4 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("user_country_rates_user_id_idx").on(table.userId),
    index("user_country_rates_country_id_idx").on(table.countryId),
  ]
);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    accountName: varchar("account_name", { length: 120 }).notNull(),
    accountNumber: varchar("account_number", { length: 120 }).notNull(),
    notes: text("notes").default(""),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("payment_methods_user_id_idx").on(table.userId),
  ]
);

export const depositAccounts = pgTable(
  "deposit_accounts",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 50 }).notNull(),
    accountName: varchar("account_name", { length: 120 }).notNull(),
    accountNumber: varchar("account_number", { length: 120 }).notNull(),
    instructions: text("instructions").default(""),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("deposit_accounts_active_idx").on(table.active),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  activations: many(activations),
  rates: many(userCountryRates),
  paymentMethods: many(paymentMethods),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  activations: many(activations),
  rates: many(userCountryRates),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  createdBy: one(users, { fields: [transactions.createdById], references: [users.id] }),
}));

export const activationsRelations = relations(activations, ({ one }) => ({
  user: one(users, { fields: [activations.userId], references: [users.id] }),
  country: one(countries, { fields: [activations.countryId], references: [countries.id] }),
}));

export const userCountryRatesRelations = relations(userCountryRates, ({ one }) => ({
  user: one(users, { fields: [userCountryRates.userId], references: [users.id] }),
  country: one(countries, { fields: [userCountryRates.countryId], references: [countries.id] }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, { fields: [paymentMethods.userId], references: [users.id] }),
}));
