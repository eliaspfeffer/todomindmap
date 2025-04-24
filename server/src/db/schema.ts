import { sql } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  int,
  text,
  timestamp,
  primaryKey,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// Users table
export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

// MindMaps table
export const mindMaps = mysqlTable("mind_maps", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  ownerId: varchar("owner_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

// Nodes table - stores the nodes in each mind map
export const nodes = mysqlTable("nodes", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  mindMapId: varchar("mind_map_id", { length: 36 })
    .notNull()
    .references(() => mindMaps.id, { onDelete: "cascade" }),
  parentId: varchar("parent_id", { length: 36 }),
  content: text("content").notNull(),
  position: json("position").$type<{ x: number; y: number }>(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow()
    .notNull(),
});

// MindMapPermissions table - for access control
export const mindMapPermissions = mysqlTable(
  "mind_map_permissions",
  {
    id: varchar("id", { length: 36 }).primaryKey().notNull(),
    mindMapId: varchar("mind_map_id", { length: 36 })
      .notNull()
      .references(() => mindMaps.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permission: varchar("permission", { length: 20 }).notNull(), // 'read', 'write', 'admin'
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .onUpdateNow()
      .notNull(),
  },
  (table) => {
    return {
      unq: primaryKey({ columns: [table.mindMapId, table.userId] }),
    };
  }
);

// Activity log for tracking edits
export const activityLog = mysqlTable("activity_log", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  mindMapId: varchar("mind_map_id", { length: 36 })
    .notNull()
    .references(() => mindMaps.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 50 }).notNull(), // 'create', 'update', 'delete'
  details: json("details").$type<Record<string, any>>(),
  timestamp: timestamp("timestamp")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
