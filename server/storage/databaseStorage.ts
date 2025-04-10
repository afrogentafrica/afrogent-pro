import { 
  User, InsertUser, users,
  Service, InsertService, services,
  Stylist, InsertStylist, stylists,
  StylistService, InsertStylistService, stylistServices,
  Booking, InsertBooking, bookings
} from "@shared/schema";
import { db } from "../db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import bcrypt from 'bcryptjs';
import { IStorage } from "../storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Hash the password if provided
    let userData = { ...user };
    if (userData.password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(userData.password, salt);
      userData.password = hashedPassword;
    }

    const [newUser] = await db.insert(users).values(userData).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    // Hash the password if provided
    let updatedData = { ...userData };
    if (updatedData.password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(updatedData.password, salt);
      updatedData.password = hashedPassword;
    }

    const [updatedUser] = await db
      .update(users)
      .set(updatedData)
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }

  // Service operations
  async getServices(): Promise<Service[]> {
    return db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db
      .update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    
    return updatedService || undefined;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Stylist operations
  async getStylists(): Promise<Stylist[]> {
    return db.select().from(stylists);
  }

  async getStylist(id: number): Promise<Stylist | undefined> {
    const [stylist] = await db.select().from(stylists).where(eq(stylists.id, id));
    return stylist || undefined;
  }

  async createStylist(stylist: InsertStylist): Promise<Stylist> {
    const [newStylist] = await db.insert(stylists).values(stylist).returning();
    return newStylist;
  }

  async updateStylist(id: number, stylistData: Partial<InsertStylist>): Promise<Stylist | undefined> {
    const [updatedStylist] = await db
      .update(stylists)
      .set(stylistData)
      .where(eq(stylists.id, id))
      .returning();
    
    return updatedStylist || undefined;
  }

  async deleteStylist(id: number): Promise<boolean> {
    const result = await db.delete(stylists).where(eq(stylists.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Stylist-Service operations
  async getStylistServices(stylistId: number): Promise<StylistService[]> {
    return db
      .select()
      .from(stylistServices)
      .where(eq(stylistServices.stylistId, stylistId));
  }

  async addServiceToStylist(stylistService: InsertStylistService): Promise<StylistService> {
    const [newStylistService] = await db
      .insert(stylistServices)
      .values(stylistService)
      .returning();
    
    return newStylistService;
  }

  async removeServiceFromStylist(stylistId: number, serviceId: number): Promise<boolean> {
    const result = await db
      .delete(stylistServices)
      .where(
        and(
          eq(stylistServices.stylistId, stylistId),
          eq(stylistServices.serviceId, serviceId)
        )
      );
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Booking operations
  async getBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.date));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, bookingData: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    
    return updatedBooking || undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.status, status as any))
      .orderBy(asc(bookings.date));
  }

  async getBookingsByDate(startDate: Date, endDate: Date): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.date, startDate),
          lte(bookings.date, endDate)
        )
      )
      .orderBy(asc(bookings.date));
  }

  async getBookingsByStylist(stylistId: number): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.stylistId, stylistId))
      .orderBy(asc(bookings.date));
  }

  async getBookingsByClient(clientId: number): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.clientId, clientId))
      .orderBy(asc(bookings.date));
  }
}

// Export an instance of the database storage class
export const databaseStorage = new DatabaseStorage();