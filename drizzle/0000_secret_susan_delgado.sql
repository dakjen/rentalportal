CREATE TYPE "public"."question_type" AS ENUM('text', 'textarea', 'radio', 'checkbox', 'document_upload', 'secure_document_upload');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'investor', 'owner', 'property_management');--> statement-breakpoint
CREATE TABLE "application_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"shareable_link" text NOT NULL,
	"project_id" integer NOT NULL,
	CONSTRAINT "application_forms_shareable_link_unique" UNIQUE("shareable_link")
);
--> statement-breakpoint
CREATE TABLE "application_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_users" (
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"units" integer,
	"property_manager_name" text,
	"owner_name" text
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"type" "question_type" NOT NULL,
	"options" jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'investor' NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "application_forms" ADD CONSTRAINT "application_forms_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_questions" ADD CONSTRAINT "application_questions_form_id_application_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."application_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_questions" ADD CONSTRAINT "application_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_form_id_application_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."application_forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;