import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertServiceSchema, insertStylistSchema, insertBookingSchema, insertStylistServiceSchema } from "@shared/schema";
import { z } from "zod";
import { Router } from "express";
import { WebSocketServer, WebSocket } from "ws";

const JWT_SECRET = process.env.JWT_SECRET || "afrogents-secret-key";

// Define interface to extend Request with user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Auth middleware
const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      req.user = user as any;
      next();
    });
  } else {
    res.status(401).json({ message: 'Authentication token required' });
  }
};

// Admin middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Create separate routers for admin and client APIs
function setupAuthRoutes() {
  const authRouter = Router();
  
  // Registration endpoint
  authRouter.post('/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
  
  // Login endpoint
  authRouter.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });
  
  // Profile endpoint
  authRouter.get('/profile', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  return authRouter;
}

function setupClientRoutes() {
  const clientRouter = Router();
  
  // Public routes - no authentication needed
  // Get all services
  clientRouter.get('/services', async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices();
      res.json({ services });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching services' });
    }
  });
  
  // Get single service
  clientRouter.get('/services/:id', async (req: Request, res: Response) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.json({ service });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching service' });
    }
  });
  
  // Get all stylists
  clientRouter.get('/stylists', async (req: Request, res: Response) => {
    try {
      const stylists = await storage.getStylists();
      res.json({ stylists });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stylists' });
    }
  });
  
  // Get single stylist with services
  clientRouter.get('/stylists/:id', async (req: Request, res: Response) => {
    try {
      const stylist = await storage.getStylist(parseInt(req.params.id));
      if (!stylist) {
        return res.status(404).json({ message: 'Stylist not found' });
      }
      
      // Get associated services
      const stylistServices = await storage.getStylistServices(stylist.id);
      const serviceIds = stylistServices.map(ss => ss.serviceId);
      const services = await Promise.all(
        serviceIds.map(id => storage.getService(id))
      );
      
      res.json({ 
        stylist,
        services: services.filter(Boolean) 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching stylist' });
    }
  });
  
  // Protected client routes - authentication required
  // Create booking
  clientRouter.post('/bookings', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        clientId: req.user.id // Ensure booking is tied to the authenticated client
      });
      
      // Verify stylist and service exist
      const stylist = await storage.getStylist(bookingData.stylistId);
      if (!stylist) {
        return res.status(404).json({ message: 'Stylist not found' });
      }
      
      const service = await storage.getService(bookingData.serviceId);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      const booking = await storage.createBooking(bookingData);
      
      res.status(201).json({
        message: 'Booking created successfully',
        booking
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating booking' });
    }
  });
  
  // Get client's bookings
  clientRouter.get('/bookings', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookingsByClient(req.user.id);
      
      // Populate stylist and service info
      const populatedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const stylist = await storage.getStylist(booking.stylistId);
          const service = await storage.getService(booking.serviceId);
          return {
            ...booking,
            stylist,
            service
          };
        })
      );
      
      res.json({ bookings: populatedBookings });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  });
  
  // Get single booking
  clientRouter.get('/bookings/:id', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const booking = await storage.getBooking(parseInt(req.params.id));
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Check if the booking belongs to the authenticated client
      if (booking.clientId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this booking' });
      }
      
      // Populate stylist and service info
      const stylist = await storage.getStylist(booking.stylistId);
      const service = await storage.getService(booking.serviceId);
      
      res.json({ 
        booking: {
          ...booking,
          stylist,
          service
        } 
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching booking' });
    }
  });
  
  // Update client's booking
  clientRouter.put('/bookings/:id', authenticateJWT, async (req: Request, res: Response) => {
    try {
      const booking = await storage.getBooking(parseInt(req.params.id));
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Check if the booking belongs to the authenticated client
      if (booking.clientId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
      
      // Only allow updating certain fields (not status changes)
      const allowedUpdates = insertBookingSchema.partial().pick({
        date: true,
        timeStart: true,
        timeEnd: true,
        notes: true,
        serviceId: true,
        stylistId: true,
      });
      
      const updateData = allowedUpdates.parse(req.body);
      const updatedBooking = await storage.updateBooking(parseInt(req.params.id), updateData);
      
      res.json({ 
        message: 'Booking updated successfully',
        booking: updatedBooking
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating booking' });
    }
  });
  
  return clientRouter;
}

function setupAdminRoutes() {
  const adminRouter = Router();
  
  // All admin routes require JWT authentication and admin role
  adminRouter.use(authenticateJWT, isAdmin);
  
  // Services management
  adminRouter.post('/services', async (req: Request, res: Response) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json({ message: 'Service created successfully', service });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating service' });
    }
  });
  
  adminRouter.put('/services/:id', async (req: Request, res: Response) => {
    try {
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(parseInt(req.params.id), serviceData);
      
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.json({ message: 'Service updated successfully', service });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating service' });
    }
  });
  
  adminRouter.delete('/services/:id', async (req: Request, res: Response) => {
    try {
      const result = await storage.deleteService(parseInt(req.params.id));
      
      if (!result) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting service' });
    }
  });
  
  // Stylists management
  adminRouter.post('/stylists', async (req: Request, res: Response) => {
    try {
      const stylistData = insertStylistSchema.parse(req.body);
      const stylist = await storage.createStylist(stylistData);
      
      // Handle services if provided
      if (req.body.services && Array.isArray(req.body.services)) {
        for (const serviceId of req.body.services) {
          await storage.addServiceToStylist({
            stylistId: stylist.id,
            serviceId: parseInt(serviceId)
          });
        }
      }
      
      res.status(201).json({ message: 'Stylist created successfully', stylist });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error creating stylist' });
    }
  });
  
  adminRouter.put('/stylists/:id', async (req: Request, res: Response) => {
    try {
      const stylistData = insertStylistSchema.partial().parse(req.body);
      const stylist = await storage.updateStylist(parseInt(req.params.id), stylistData);
      
      if (!stylist) {
        return res.status(404).json({ message: 'Stylist not found' });
      }
      
      // Handle services update if provided
      if (req.body.services && Array.isArray(req.body.services)) {
        const stylistId = stylist.id;
        
        // Get current services
        const currentStylistServices = await storage.getStylistServices(stylistId);
        const currentServiceIds = new Set(currentStylistServices.map(ss => ss.serviceId));
        
        // New service ids
        const newServiceIds = new Set(req.body.services.map((id: any) => parseInt(id)));
        
        // Remove services that are no longer associated
        for (const serviceId of currentServiceIds) {
          if (!newServiceIds.has(serviceId)) {
            await storage.removeServiceFromStylist(stylistId, serviceId);
          }
        }
        
        // Add new services
        for (const serviceId of newServiceIds) {
          if (!currentServiceIds.has(serviceId)) {
            await storage.addServiceToStylist({
              stylistId,
              serviceId
            });
          }
        }
      }
      
      res.json({ message: 'Stylist updated successfully', stylist });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating stylist' });
    }
  });
  
  adminRouter.delete('/stylists/:id', async (req: Request, res: Response) => {
    try {
      const result = await storage.deleteStylist(parseInt(req.params.id));
      
      if (!result) {
        return res.status(404).json({ message: 'Stylist not found' });
      }
      
      res.json({ message: 'Stylist deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting stylist' });
    }
  });
  
  // Bookings management
  adminRouter.get('/bookings', async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings();
      
      // Populate stylist and service info
      const populatedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const stylist = await storage.getStylist(booking.stylistId);
          const service = await storage.getService(booking.serviceId);
          const client = booking.clientId ? await storage.getUser(booking.clientId) : null;
          
          return {
            ...booking,
            stylist,
            service,
            client: client ? {
              id: client.id,
              name: client.name,
              email: client.email,
              phoneNumber: client.phoneNumber
            } : null
          };
        })
      );
      
      res.json({ bookings: populatedBookings });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bookings' });
    }
  });
  
  adminRouter.get('/bookings/status/:status', async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookingsByStatus(req.params.status);
      
      // Populate stylist and service info
      const populatedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const stylist = await storage.getStylist(booking.stylistId);
          const service = await storage.getService(booking.serviceId);
          const client = booking.clientId ? await storage.getUser(booking.clientId) : null;
          
          return {
            ...booking,
            stylist,
            service,
            client: client ? {
              id: client.id,
              name: client.name,
              email: client.email,
              phoneNumber: client.phoneNumber
            } : null
          };
        })
      );
      
      res.json({ bookings: populatedBookings });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching bookings by status' });
    }
  });
  
  adminRouter.put('/bookings/:id/status', async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      
      // Validate status
      if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      
      const booking = await storage.updateBooking(parseInt(req.params.id), { status });
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      res.json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
      res.status(500).json({ message: 'Error updating booking status' });
    }
  });
  
  adminRouter.get('/dashboard/overview', async (req: Request, res: Response) => {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get month's date range
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // Get today's bookings
      const todayBookings = await storage.getBookingsByDate(today, tomorrow);
      
      // Get active clients (unique clients with bookings in the past 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentBookings = await storage.getBookingsByDate(thirtyDaysAgo, tomorrow);
      const uniqueClientIds = new Set(recentBookings.map(booking => booking.clientId).filter(Boolean));
      
      // Get monthly revenue (completed bookings for current month)
      const monthlyBookings = await storage.getBookingsByDate(firstDayOfMonth, lastDayOfMonth);
      const completedBookings = monthlyBookings.filter(booking => booking.status === 'completed');
      const monthlyRevenue = await Promise.all(completedBookings.map(async booking => {
        const service = await storage.getService(booking.serviceId);
        return service ? parseFloat(service.price) : 0;
      }));
      
      const dashboardData = {
        todayBookingsCount: todayBookings.length,
        activeClientsCount: uniqueClientIds.size,
        monthlyRevenue: monthlyRevenue.reduce((sum, price) => sum + price, 0).toFixed(2),
        completedServicesCount: completedBookings.length
      };
      
      res.json({ data: dashboardData });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Error fetching dashboard data' });
    }
  });

  return adminRouter;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up routers
  const authRouter = setupAuthRoutes();
  const clientRouter = setupClientRoutes();
  const adminRouter = setupAdminRoutes();
  
  // Register routers with the app
  app.use('/api/auth', authRouter);
  app.use('/api/client', clientRouter);
  app.use('/api/admin', adminRouter);
  
  // Maintain backward compatibility with previous API routes
  app.use('/api/services', clientRouter);
  app.use('/api/stylists', clientRouter);
  app.use('/api/bookings', clientRouter);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const connectedClients = new Map<number, Set<WebSocket>>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    let userId: number | null = null;
    
    // Handle messages to identify user
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // If this is an auth message, store the user ID
        if (data.type === 'auth' && data.token) {
          try {
            const decoded = jwt.verify(data.token, JWT_SECRET) as any;
            userId = decoded.id;
            
            // Add to connected clients
            if (!connectedClients.has(userId)) {
              connectedClients.set(userId, new Set());
            }
            
            connectedClients.get(userId)!.add(ws);
            
            // Send confirmation
            ws.send(JSON.stringify({
              type: 'auth_success',
              message: 'Authentication successful'
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'auth_error',
              message: 'Invalid authentication token'
            }));
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      if (userId && connectedClients.has(userId)) {
        const userConnections = connectedClients.get(userId)!;
        userConnections.delete(ws);
        
        if (userConnections.size === 0) {
          connectedClients.delete(userId);
        }
      }
    });
  });
  
  // Utility function to send notifications to clients
  const notifyClient = (userId: number, notification: any) => {
    const connections = connectedClients.get(userId);
    if (connections) {
      const message = JSON.stringify({
        type: 'notification',
        data: notification
      });
      
      connections.forEach(connection => {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(message);
        }
      });
    }
  };
  
  // Simple WebSocket hook for booking status updates
  adminRouter.route('/bookings/:id/status').put((req, res, next) => {
    const originalEnd = res.end;
    
    res.end = function(chunk?: any, encoding?: BufferEncoding) {
      if (res.statusCode === 200) {
        // Get the updated booking to send notification
        const bookingId = parseInt(req.params.id);
        storage.getBooking(bookingId).then(booking => {
          if (booking && booking.clientId) {
            notifyClient(booking.clientId, {
              type: 'booking_status_update',
              bookingId: booking.id,
              status: booking.status,
              message: `Your booking status has been updated to: ${booking.status}`
            });
          }
        }).catch(err => {
          console.error('Error sending WebSocket notification:', err);
        });
      }
      
      // Call the original end method with the same arguments
      return originalEnd.apply(this, arguments as any);
    };
    
    next();
  });
  
  return httpServer;
}
