import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import sessionTable from "./session.table";
import userTable from "./user.table";

export type InsertSessionType = InferInsertModel<typeof sessionTable>;
export type SelectSessionType = InferInsertModel<typeof sessionTable>;

export type InsertUserType = InferInsertModel<typeof userTable>;
export type SelectUserType = InferSelectModel<typeof userTable>;
