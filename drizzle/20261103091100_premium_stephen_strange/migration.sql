CREATE TYPE "user_role" AS ENUM('student', 'teacher', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"full_name" varchar(255) NOT NULL,
	"email" varchar(322) NOT NULL UNIQUE,
	"phone" char(15) NOT NULL,
	"password" varchar(256) NOT NULL,
	"salt" text NOT NULL,
	"avatar_url" text NOT NULL,
	"public_id" text NOT NULL,
	"start_time" time NOT NULL,
	"zoom_join_url" text NOT NULL,
	"zoom_start_url" text NOT NULL,
	"role" "user_role" DEFAULT 'student'::"user_role" NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"verification_token" text UNIQUE,
	"refresh_token" text UNIQUE,
	"reset_password_token" text UNIQUE,
	"reset_password_expires" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
