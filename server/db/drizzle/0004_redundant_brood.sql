CREATE TYPE "public"."action" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('task');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"resourceType" "resource_type" NOT NULL,
	"resourceId" integer NOT NULL,
	"action" "action" NOT NULL,
	"data" json NOT NULL
);
--> statement-breakpoint
CREATE INDEX "resource_type_index" ON "audit_logs" USING btree ("resourceType");--> statement-breakpoint
CREATE INDEX "resource_id_index" ON "audit_logs" USING btree ("resourceId");--> statement-breakpoint
CREATE INDEX "action_index" ON "audit_logs" USING btree ("action");