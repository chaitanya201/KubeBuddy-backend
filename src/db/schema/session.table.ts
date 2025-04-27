import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { userTable } from "./user.table";

export const sessionTable = pgTable("user_session", {
  id: serial("id").primaryKey(),
  publicId: text().notNull().unique(),
  session: text().notNull().unique(),
  refreshToken: text().notNull().unique(),
  userId: text("user_id").notNull(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessionRelations = relations(sessionTable, ({ one }) => {
  return {
    sessionUser: one(userTable, {
      fields: [sessionTable.userId],
      references: [userTable.publicId],
    }),
  };
});

export default sessionTable;
