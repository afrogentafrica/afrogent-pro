import { db } from "../server/db";
import { 
  users, 
  services, 
  stylists, 
  stylistServices, 
  bookings 
} from "../shared/schema";
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

/**
 * Seed the database with initial data
 */
async function seedDatabase() {
  console.log("Seeding database...");

  try {
    // Check if admin user exists
    const adminExists = await db.select().from(users).where(eq(users.email, 'admin@afrogents.com'));
    
    if (!adminExists.length) {
      // Insert admin user
      console.log("Creating admin user...");
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync("password123", salt);

      await db.insert(users).values({
        name: "Admin",
        email: "admin@afrogents.com",
        password: hashedPassword,
        role: "admin",
        phoneNumber: "+1234567890"
      });
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }

    // Check if services exist
    const servicesExist = await db.select().from(services);
    
    if (!servicesExist.length) {
      console.log("Creating services...");
      await db.insert(services).values([
        {
          name: "Haircut & Trim",
          description: "Professional haircut and trimming service",
          price: "200",
          duration: 45,
          category: "Hair",
          image: "",
          isActive: true
        },
        {
          name: "Shaving Service",
          description: "Professional shaving service",
          price: "150",
          duration: 30,
          category: "Beard",
          image: "",
          isActive: true
        },
        {
          name: "Hair Styling",
          description: "Creative hair styling service",
          price: "250",
          duration: 60,
          category: "Hair",
          image: "",
          isActive: true
        },
        {
          name: "Beard & Mustache Service",
          description: "Beard and mustache trimming and styling",
          price: "180",
          duration: 40,
          category: "Beard",
          image: "",
          isActive: true
        },
        {
          name: "Grooming Package",
          description: "Complete grooming package including haircut, beard trim, and facial",
          price: "350",
          duration: 90,
          category: "Event",
          image: "",
          isActive: true
        }
      ]);
      console.log("Services created");
    } else {
      console.log("Services already exist");
    }

    // Check if stylists exist
    const stylistsExist = await db.select().from(stylists);
    
    if (!stylistsExist.length) {
      console.log("Creating stylists...");
      await db.insert(stylists).values([
        {
          name: "Claude Njeam",
          title: "Master Barber",
          bio: "Claude is a master barber with over 10 years of experience",
          image: "",
          email: "claude@afrogents.com",
          phoneNumber: "+1234567890",
          rating: "4.8",
          isActive: true
        },
        {
          name: "James Peterson",
          title: "Afro Specialist",
          bio: "James specializes in all types of afro hairstyles",
          image: "",
          email: "james@afrogents.com",
          phoneNumber: "+0987654321",
          rating: "4.7",
          isActive: true
        }
      ]);
      console.log("Stylists created");
    } else {
      console.log("Stylists already exist");
    }

    // Get services and stylists for associations
    const allServices = await db.select().from(services);
    const allStylists = await db.select().from(stylists);

    if (allServices.length > 0 && allStylists.length > 0) {
      // Check if stylist services exist
      const stylistServicesExist = await db.select().from(stylistServices);
      
      if (!stylistServicesExist.length) {
        console.log("Creating stylist-service associations...");
        
        const claude = allStylists.find(s => s.name === "Claude Njeam");
        const james = allStylists.find(s => s.name === "James Peterson");
        
        const haircutService = allServices.find(s => s.name === "Haircut & Trim");
        const shavingService = allServices.find(s => s.name === "Shaving Service");
        const hairStylingService = allServices.find(s => s.name === "Hair Styling");
        const beardService = allServices.find(s => s.name === "Beard & Mustache Service");
        const groomingService = allServices.find(s => s.name === "Grooming Package");

        if (claude && james && haircutService && shavingService && hairStylingService && beardService && groomingService) {
          await db.insert(stylistServices).values([
            { stylistId: claude.id, serviceId: haircutService.id },
            { stylistId: claude.id, serviceId: shavingService.id },
            { stylistId: claude.id, serviceId: beardService.id },
            { stylistId: james.id, serviceId: haircutService.id },
            { stylistId: james.id, serviceId: hairStylingService.id },
            { stylistId: james.id, serviceId: groomingService.id }
          ]);
          console.log("Stylist-service associations created");
        }
      } else {
        console.log("Stylist-service associations already exist");
      }

      // Check if bookings exist
      const bookingsExist = await db.select().from(bookings);
      
      if (!bookingsExist.length) {
        console.log("Creating bookings...");
        
        const claude = allStylists.find(s => s.name === "Claude Njeam");
        const james = allStylists.find(s => s.name === "James Peterson");
        
        const haircutService = allServices.find(s => s.name === "Haircut & Trim");
        const hairStylingService = allServices.find(s => s.name === "Hair Styling");
        const groomingService = allServices.find(s => s.name === "Grooming Package");

        if (claude && james && haircutService && hairStylingService && groomingService) {
          await db.insert(bookings).values([
            {
              clientName: "Michael Johnson",
              clientContact: "+971 50 123 4567",
              clientLocation: "Dubai, UAE",
              clientId: null,
              stylistId: claude.id,
              serviceId: haircutService.id,
              date: new Date("2025-04-08"),
              timeStart: "10:00 AM",
              timeEnd: "10:45 AM",
              status: "confirmed",
              paymentMethod: "cash",
              paymentStatus: "pending",
              notes: ""
            },
            {
              clientName: "David Williams",
              clientContact: "+971 50 765 4321",
              clientLocation: "Dubai, UAE",
              clientId: null,
              stylistId: james.id,
              serviceId: hairStylingService.id,
              date: new Date("2025-04-08"),
              timeStart: "1:30 PM",
              timeEnd: "2:30 PM",
              status: "pending",
              paymentMethod: "cash",
              paymentStatus: "pending",
              notes: ""
            },
            {
              clientName: "Robert Brown",
              clientContact: "+971 55 987 6543",
              clientLocation: "Dubai, UAE",
              clientId: null,
              stylistId: claude.id,
              serviceId: groomingService.id,
              date: new Date("2025-04-09"),
              timeStart: "11:15 AM",
              timeEnd: "12:45 PM",
              status: "confirmed",
              paymentMethod: "cash",
              paymentStatus: "pending",
              notes: ""
            },
            {
              clientName: "James Davis",
              clientContact: "+971 56 222 3333",
              clientLocation: "Dubai, UAE",
              clientId: null,
              stylistId: james.id,
              serviceId: groomingService.id,
              date: new Date("2025-04-10"),
              timeStart: "4:00 PM",
              timeEnd: "5:30 PM",
              status: "pending",
              paymentMethod: "cash",
              paymentStatus: "pending",
              notes: ""
            },
            {
              clientName: "Thomas Miller",
              clientContact: "+971 54 111 2222",
              clientLocation: "Dubai, UAE",
              clientId: null,
              stylistId: claude.id,
              serviceId: haircutService.id,
              date: new Date("2025-04-12"),
              timeStart: "2:45 PM",
              timeEnd: "3:30 PM",
              status: "confirmed",
              paymentMethod: "cash",
              paymentStatus: "pending",
              notes: ""
            }
          ]);
          console.log("Bookings created");
        }
      } else {
        console.log("Bookings already exist");
      }
    }

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();