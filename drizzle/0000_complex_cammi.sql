CREATE TABLE "activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"country_id" integer,
	"smsbower_activation_id" varchar(64) NOT NULL,
	"service" varchar(30) DEFAULT 'fb' NOT NULL,
	"phone_number" varchar(40),
	"cost" numeric(14, 4) DEFAULT '0' NOT NULL,
	"sale_price" numeric(14, 4) DEFAULT '0' NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"sms_code" varchar(20),
	"sms_text" text,
	"provider_ids" text DEFAULT '',
	"retry_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"code" varchar(10) NOT NULL,
	"smsbower_country_id" integer,
	"provider_ids" text DEFAULT '',
	"markup_percent" numeric(8, 2) DEFAULT '0' NOT NULL,
	"selling_pkr_price" numeric(14, 4),
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "deposit_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"account_name" varchar(120) NOT NULL,
	"account_number" varchar(120) NOT NULL,
	"instructions" text DEFAULT '',
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"account_name" varchar(120) NOT NULL,
	"account_number" varchar(120) NOT NULL,
	"notes" text DEFAULT '',
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(30) NOT NULL,
	"amount" numeric(14, 4) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"method" varchar(50) DEFAULT '',
	"reference" varchar(255) DEFAULT '',
	"notes" text DEFAULT '',
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_country_rates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"country_id" integer NOT NULL,
	"pkr_price" numeric(14, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'client' NOT NULL,
	"balance" numeric(14, 4) DEFAULT '0' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "activations" ADD CONSTRAINT "activations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activations" ADD CONSTRAINT "activations_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_country_rates" ADD CONSTRAINT "user_country_rates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_country_rates" ADD CONSTRAINT "user_country_rates_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activations_user_id_idx" ON "activations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activations_smsbower_activation_id_idx" ON "activations" USING btree ("smsbower_activation_id");--> statement-breakpoint
CREATE INDEX "activations_status_idx" ON "activations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "countries_code_idx" ON "countries" USING btree ("code");--> statement-breakpoint
CREATE INDEX "deposit_accounts_active_idx" ON "deposit_accounts" USING btree ("active");--> statement-breakpoint
CREATE INDEX "payment_methods_user_id_idx" ON "payment_methods" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_user_id_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_country_rates_user_id_idx" ON "user_country_rates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_country_rates_country_id_idx" ON "user_country_rates" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");