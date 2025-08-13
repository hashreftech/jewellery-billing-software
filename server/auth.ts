import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { Employee as DatabaseEmployee } from "@shared/schema";
import connectPg from "connect-pg-simple";

declare global {
  namespace Express {
    interface User extends DatabaseEmployee {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  // Check if the stored password is in the correct hashed format (contains a dot)
  if (!stored.includes(".")) {
    // Legacy plain text password - compare directly
    // This should only happen for old employees created before password hashing was implemented
    console.warn("Found unhashed password in database. This should be updated for security.");
    return supplied === stored;
  }
  
  const [hashed, salt] = stored.split(".");
  
  try {
    const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return hashed === buf.toString("hex");
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "jewelry-shop-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      tableName: "sessions", // Correct table name
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const employee = await storage.getEmployeeByEmpCode(username);
        if (!employee) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        const isValidPassword = await comparePasswords(password, employee.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, employee);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const employee = await storage.getEmployee(id);
      if (employee) {
        done(null, employee);
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  // Register route - creates new employee with login capability
  app.post("/api/register", async (req, res, next) => {
    try {
      const { empCode, name, phone, email, role, password } = req.body;
      
      const existingEmployee = await storage.getEmployeeByEmpCode(empCode);
      if (existingEmployee) {
        return res.status(400).json({ message: "Employee code already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const employee = await storage.createEmployee({
        empCode,
        name,
        phone,
        email: email || null,
        role,
        password: hashedPassword,
        photo: null,
        status: "Active",
      });

      req.login(employee, (err) => {
        if (err) return next(err);
        const employeeData = employee as DatabaseEmployee;
        res.status(201).json({ 
          id: employeeData.id, 
          empCode: employeeData.empCode, 
          name: employeeData.name,
          role: employeeData.role 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register employee" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, employee: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!employee) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      req.login(employee, (err) => {
        if (err) {
          return next(err);
        }
        const employeeData = employee as DatabaseEmployee;
        res.json({ 
          id: employeeData.id, 
          empCode: employeeData.empCode, 
          name: employeeData.name,
          role: employeeData.role 
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const employee = req.user as DatabaseEmployee;
    res.json({ 
      id: employee.id, 
      empCode: employee.empCode, 
      name: employee.name,
      role: employee.role,
      email: employee.email,
      phone: employee.phone,
      status: employee.status
    });
  });
}

export async function hashPasswordForSeed(password: string): Promise<string> {
  return await hashPassword(password);
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}