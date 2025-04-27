import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import sessionTable from "./session.table";

export const userTable = pgTable(
  "user",
  {
    id: serial("id").primaryKey(),
    publicId: text("public_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    provider: text().notNull(),
    providerToken: text(),
    providerRefreshToken: text(),
    isVerified: boolean().default(false).notNull(),
    isActive: boolean().default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return [
      index("user_public_index").on(table.publicId),
      index("user_email_index").on(table.email),
    ];
  }
);

export const userRelations = relations(userTable, ({ many }) => {
  return { userSession: many(sessionTable) };
});
