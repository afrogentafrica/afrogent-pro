import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User Model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "client"] }).default("client").notNull(),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Service Model
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  duration: integer("duration").notNull(), // Duration in minutes
  category: text("category", { enum: ["Hair", "Beard", "Skincare", "Nails", "Event", "Other"] }).notNull(),
  image: text("image"), // URL to image
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true
});

// Stylist Model
export const stylists = pgTable("stylists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio"),
  image: text("image"), // URL to profile image
  email: text("email"),
  phoneNumber: text("phone_number"),
  rating: decimal("rating").default("5.0"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertStylistSchema = createInsertSchema(stylists).omit({
  id: true,
  createdAt: true
});

// Stylist-Service Many-to-Many Relationship
export const stylistServices = pgTable("stylist_services", {
  id: serial("id").primaryKey(),
  stylistId: integer("stylist_id").notNull().references(() => stylists.id),
  serviceId: integer("service_id").notNull().references(() => services.id)
});

export const insertStylistServiceSchema = createInsertSchema(stylistServices).omit({
  id: true
});

// Booking Model
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientContact: text("client_contact").notNull(),
  clientLocation: text("client_location").notNull(),
  clientId: integer("client_id").references(() => users.id),
  stylistId: integer("stylist_id").notNull().references(() => stylists.id),
  serviceId: integer("service_id").notNull().references(() => services.id),
  date: timestamp("date").notNull(),
  timeStart: text("time_start").notNull(),
  timeEnd: text("time_end").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "completed", "cancelled"] }).default("pending").notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "other"] }).default("cash").notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "completed"] }).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings)
}));

export const stylistsRelations = relations(stylists, ({ many }) => ({
  bookings: many(bookings),
  stylistServices: many(stylistServices)
}));

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
  stylistServices: many(stylistServices)
}));

export const stylistServicesRelations = relations(stylistServices, ({ one }) => ({
  stylist: one(stylists, {
    fields: [stylistServices.stylistId],
    references: [stylists.id]
  }),
  service: one(services, {
    fields: [stylistServices.serviceId],
    references: [services.id]
  })
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  client: one(users, {
    fields: [bookings.clientId],
    references: [users.id]
  }),
  stylist: one(stylists, {
    fields: [bookings.stylistId],
    references: [stylists.id]
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id]
  })
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Stylist = typeof stylists.$inferSelect;
export type InsertStylist = z.infer<typeof insertStylistSchema>;

export type StylistService = typeof stylistServices.$inferSelect;
export type InsertStylistService = z.infer<typeof insertStylistServiceSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
