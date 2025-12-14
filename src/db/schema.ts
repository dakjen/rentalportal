import {
  pgTable,
  serial,
  text,
  jsonb,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  units: integer("units"),
  propertyManagerName: text("property_manager_name"),
  ownerName: text("owner_name"),
});

export const projectRelations = relations(projects, ({ many }) => ({
  applicationForms: many(applicationForms),
  projectUsers: many(projectUsers),
}));

export const projectUsers = pgTable("project_users", {
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
});

export const projectUserRelations = relations(projectUsers, ({ one }) => ({
  project: one(projects, {
    fields: [projectUsers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectUsers.userId],
    references: [users.id],
  }),
}));

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "investor",
  "owner",
  "property_management",
  "marketing",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  role: userRoleEnum("role").default("investor").notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  projectUsers: many(projectUsers),
}));

export const applicationForms = pgTable("application_forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shareableLink: text("shareable_link").unique().notNull(),
  projectId: integer("project_id")
    .references(() => projects.id)
    .notNull(),
});

export const applicationFormRelations = relations(
  applicationForms,
  ({ one, many }) => ({
    project: one(projects, {
      fields: [applicationForms.projectId],
      references: [projects.id],
    }),
    applications: many(applications),
  })
);

export const questionTypeEnum = pgEnum("question_type", [
  "text",
  "textarea",
  "radio",
  "checkbox",
  "document_upload",
  "secure_document_upload",
]);

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: questionTypeEnum("type").notNull(),
  options: jsonb("options").$type<string[]>(), // For radio and checkbox
});

export const applicationQuestions = pgTable("application_questions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id")
    .references(() => applicationForms.id)
    .notNull(),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  order: integer("order").notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  formId: integer("form_id")
    .references(() => applicationForms.id)
    .notNull(),
  answers: jsonb("answers").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const applicationRelations = relations(applications, ({ one }) => ({
  form: one(applicationForms, {
    fields: [applications.formId],
    references: [applicationForms.id],
  }),
}));
