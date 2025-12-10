import {
  pgTable,
  serial,
  text,
  jsonb,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const applicationForms = pgTable("application_forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shareableLink: text("shareable_link").unique().notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'text', 'textarea', 'radio', 'checkbox'
  options: jsonb("options"), // For radio and checkbox
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
