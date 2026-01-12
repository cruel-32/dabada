import { pgTable, text, timestamp, integer, bigint, boolean, index, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Better Auth required tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  expiresAt: timestamp('expiresAt'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Video download tables
export const videos = pgTable('videos', {
  id: text('id').primaryKey(),
  url: text('url').notNull().unique(), // Raw URL (no unique constraint)
  platform: text('platform').notNull(), // 'youtube' | 'instagram'
  filePath: text('filePath').notNull(),
  fileSize: bigint('fileSize', { mode: 'number' }).notNull().default(0),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  downloadDate: date('downloadDate').notNull().defaultNow(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
}, (table) => ({
}));

export const downloadLogs = pgTable('download_logs', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  videoId: text('videoId')
    .references(() => videos.id, { onDelete: 'set null' }),
  downloadedAt: timestamp('downloadedAt').notNull().defaultNow(),
}, (table) => ({
  userIdDownloadedAtIdx: index('download_logs_user_id_downloaded_at_idx').on(table.userId, table.downloadedAt),
}));

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  videos: many(videos),
  downloadLogs: many(downloadLogs),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const videosRelations = relations(videos, ({ one, many }) => ({
  user: one(user, {
    fields: [videos.userId],
    references: [user.id],
  }),
  downloadLogs: many(downloadLogs),
}));

export const downloadLogsRelations = relations(downloadLogs, ({ one }) => ({
  user: one(user, {
    fields: [downloadLogs.userId],
    references: [user.id],
  }),
  video: one(videos, {
    fields: [downloadLogs.videoId],
    references: [videos.id],
  }),
}));

