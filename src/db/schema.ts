import {
  boolean,
  char,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['student', 'teacher', 'admin']);

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 322 }).notNull().unique(),
  phone: char('phone', { length: 15 }).notNull(),
  password: varchar('password', { length: 256 }).notNull(),
  salt: text('salt').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  publicId: text('public_id').notNull(),
  startTime: time('start_time').notNull(),
  zoomJoinUrl: text('zoom_join_url').notNull(),
  zoomStartUrl: text('zoom_start_url').notNull(),
  role: userRoleEnum('role').default('student').notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationToken: text('verification_token').unique(),
  refreshToken: text('refresh_token').unique(),
  resetPasswordToken: text('reset_password_token').unique(),
  resetPasswordExpires: timestamp('reset_password_expires', {
    withTimezone: true,
  }),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
