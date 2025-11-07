"use client";

import { useAuth } from "./use-auth";

export type Role = "ADMIN" | "MODERATOR" | "USER";
export type Permission = 
  | "view_dashboard"
  | "manage_flights"
  | "view_passengers"
  | "manage_passengers"
  | "manage_employees"
  | "view_employees"
  | "view_all_bookings"
  | "manage_bookings"
  | "view_all_tickets"
  | "manage_tickets";

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = (role: Role | Role[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    const permissions: Record<Role, Permission[]> = {
      ADMIN: [
        "view_dashboard",
        "manage_flights",
        "view_passengers",
        "manage_passengers",
        "manage_employees",
        "view_employees",
        "view_all_bookings",
        "manage_bookings",
        "view_all_tickets",
        "manage_tickets",
      ],
      MODERATOR: [
        "view_dashboard",
        "view_passengers",
        "view_employees",
        "view_all_bookings",
        "manage_bookings",
        "view_all_tickets",
        "manage_tickets",
      ],
      USER: [
        "view_dashboard",
        "manage_bookings",
        "manage_tickets",
      ],
    };

    return permissions[user.role]?.includes(permission) ?? false;
  };

  const canViewFlights = () => true; // GET /flights é público
  const canManageFlights = () => hasRole("ADMIN"); // POST/PUT/DELETE requer ADMIN
  
  const canViewPassengers = () => hasRole(["ADMIN", "MODERATOR"]); // GET /passengers requer ADMIN/MOD
  const canManagePassengers = () => hasRole("ADMIN"); // POST/PUT/DELETE requer ADMIN
  
  const canViewEmployees = () => hasRole(["ADMIN", "MODERATOR"]); // GET /employees requer ADMIN/MOD
  const canManageEmployees = () => hasRole(["ADMIN", "MODERATOR"]); // POST/PUT requer ADMIN/MOD
  
  const canViewAircraft = () => hasRole(["ADMIN", "MODERATOR"]); // GET /aircraft requer ADMIN/MOD
  const canManageAircraft = () => hasRole("ADMIN"); // POST/PUT/DELETE requer ADMIN
  
  // Tickets: GET requer ADMIN/MOD, POST/PUT/DELETE requer qualquer autenticado
  // MAS: para criar, precisa de bookings que só ADMIN/MOD conseguem listar
  const canViewTickets = () => hasRole(["ADMIN", "MODERATOR"]); // GET /tickets
  const canManageTickets = () => true; // POST/PUT/DELETE qualquer autenticado
  const canCreateTickets = () => hasRole(["ADMIN", "MODERATOR"]); // Precisa listar bookings
  
  // Bookings: GET requer ADMIN/MOD, POST/PUT/DELETE requer qualquer autenticado
  const canViewBookings = () => hasRole(["ADMIN", "MODERATOR"]); // GET /bookings
  const canManageBookings = () => true; // POST/PUT/DELETE qualquer autenticado
  const canCreateBookings = () => hasRole(["ADMIN", "MODERATOR"]); // Precisa listar passageiros e voos
  
  // Airports, AircraftTypes, etc: requer ADMIN
  const canManageAirports = () => hasRole("ADMIN");
  const canManageAircraftTypes = () => hasRole("ADMIN");
  const canManageEmployeeCategories = () => hasRole("ADMIN");
  const canManageFlightTypes = () => hasRole("ADMIN");
  const canManageFlightCrews = () => hasRole("ADMIN");

  return {
    user,
    hasRole,
    hasPermission,
    canViewFlights,
    canManageFlights,
    canViewPassengers,
    canManagePassengers,
    canViewEmployees,
    canManageEmployees,
    canViewAircraft,
    canManageAircraft,
    canViewTickets,
    canManageTickets,
    canCreateTickets,
    canViewBookings,
    canManageBookings,
    canCreateBookings,
    canManageAirports,
    canManageAircraftTypes,
    canManageEmployeeCategories,
    canManageFlightTypes,
    canManageFlightCrews,
  };
}
