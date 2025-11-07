"use client";

import { useAuthContext } from "@/components/auth-provider";

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
  const { user } = useAuthContext();

  const hasRole = (role: Role | Role[]): boolean => {
    if (!user) {
      return false;
    }

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
      USER: ["view_dashboard", "manage_bookings", "manage_tickets"],
    };

    return permissions[user.role]?.includes(permission) ?? false;
  };

  const canViewFlights = () => true; // GET /flights é público
  const canManageFlights = () => hasRole("ADMIN"); // POST/PUT/DELETE requer ADMIN
  const canCreateFlights = () => hasRole("ADMIN");
  const canEditFlights = () => hasRole("ADMIN");
  const canDeleteFlights = () => hasRole("ADMIN");

  const canViewPassengers = () => hasRole(["ADMIN", "MODERATOR"]); // GET /passengers requer ADMIN/MOD
  const canManagePassengers = () => hasRole("ADMIN"); // POST/DELETE requer ADMIN
  const canCreatePassengers = () => hasRole("ADMIN");
  const canEditPassengers = () => true; // PUT qualquer autenticado
  const canDeletePassengers = () => hasRole("ADMIN");

  const canViewEmployees = () => hasRole(["ADMIN", "MODERATOR"]); // GET /employees requer ADMIN/MOD
  const canManageEmployees = () => hasRole(["ADMIN", "MODERATOR"]); // POST/PUT requer ADMIN/MOD
  const canCreateEmployees = () => hasRole(["ADMIN", "MODERATOR"]);
  const canEditEmployees = () => hasRole(["ADMIN", "MODERATOR"]);
  const canDeleteEmployees = () => hasRole("ADMIN"); // DELETE apenas ADMIN

  const canViewAircraft = () => hasRole(["ADMIN", "MODERATOR"]); // GET /aircraft requer ADMIN/MOD
  const canManageAircraft = () => hasRole("ADMIN"); // POST/PUT/DELETE requer ADMIN
  const canCreateAircraft = () => hasRole("ADMIN");
  const canEditAircraft = () => hasRole("ADMIN");
  const canDeleteAircraft = () => hasRole("ADMIN");

  // Tickets: GET requer ADMIN/MOD, POST/PUT/DELETE qualquer autenticado
  const canViewTickets = () => hasRole(["ADMIN", "MODERATOR"]); // GET /tickets
  const canManageTickets = () => true; // POST/PUT/DELETE qualquer autenticado
  const canCreateTickets = () => hasRole(["ADMIN", "MODERATOR"]); // Precisa listar bookings
  const canEditTickets = () => true; // PUT qualquer autenticado
  const canDeleteTickets = () => true; // DELETE qualquer autenticado

  // Bookings: GET requer ADMIN/MOD, POST/PUT/DELETE qualquer autenticado
  const canViewBookings = () => hasRole(["ADMIN", "MODERATOR"]); // GET /bookings
  const canManageBookings = () => true; // POST/PUT/DELETE qualquer autenticado
  const canCreateBookings = () => hasRole(["ADMIN", "MODERATOR"]); // Precisa listar passageiros e voos
  const canEditBookings = () => true; // PUT qualquer autenticado
  const canDeleteBookings = () => true; // DELETE qualquer autenticado

  // Airports, AircraftTypes, FlightCrews, EmployeeCategories: GET ADMIN/MOD, POST/PUT/DELETE ADMIN
  const canViewAirports = () => true; // GET é público
  const canCreateAirports = () => hasRole("ADMIN");
  const canEditAirports = () => hasRole("ADMIN");
  const canDeleteAirports = () => hasRole("ADMIN");

  const canViewAircraftTypes = () => true; // GET é público
  const canCreateAircraftTypes = () => hasRole("ADMIN");
  const canEditAircraftTypes = () => hasRole("ADMIN");
  const canDeleteAircraftTypes = () => hasRole("ADMIN");

  const canViewFlightCrews = () => hasRole(["ADMIN", "MODERATOR"]); // GET requer ADMIN/MOD
  const canCreateFlightCrews = () => hasRole("ADMIN");
  const canEditFlightCrews = () => hasRole("ADMIN");
  const canDeleteFlightCrews = () => hasRole("ADMIN");

  const canViewEmployeeCategories = () => hasRole(["ADMIN", "MODERATOR"]); // GET requer ADMIN/MOD
  const canCreateEmployeeCategories = () => hasRole("ADMIN");
  const canEditEmployeeCategories = () => hasRole("ADMIN");
  const canDeleteEmployeeCategories = () => hasRole("ADMIN");

  // FlightTypes: GET é público, POST/PUT/DELETE ADMIN
  const canViewFlightTypes = () => true; // GET é público
  const canCreateFlightTypes = () => hasRole("ADMIN");
  const canEditFlightTypes = () => hasRole("ADMIN");
  const canDeleteFlightTypes = () => hasRole("ADMIN");

  // Legacy aliases para compatibilidade
  const canManageAirports = () => canCreateAirports();
  const canManageAircraftTypes = () => canCreateAircraftTypes();
  const canManageEmployeeCategories = () => canCreateEmployeeCategories();
  const canManageFlightTypes = () => hasRole("ADMIN");
  const canManageFlightCrews = () => canCreateFlightCrews();

  return {
    user,
    hasRole,
    hasPermission,
    canViewFlights,
    canManageFlights,
    canCreateFlights,
    canEditFlights,
    canDeleteFlights,
    canViewPassengers,
    canManagePassengers,
    canCreatePassengers,
    canEditPassengers,
    canDeletePassengers,
    canViewEmployees,
    canManageEmployees,
    canCreateEmployees,
    canEditEmployees,
    canDeleteEmployees,
    canViewAircraft,
    canManageAircraft,
    canCreateAircraft,
    canEditAircraft,
    canDeleteAircraft,
    canViewTickets,
    canManageTickets,
    canCreateTickets,
    canEditTickets,
    canDeleteTickets,
    canViewBookings,
    canManageBookings,
    canCreateBookings,
    canEditBookings,
    canDeleteBookings,
    canViewAirports,
    canCreateAirports,
    canEditAirports,
    canDeleteAirports,
    canViewAircraftTypes,
    canCreateAircraftTypes,
    canEditAircraftTypes,
    canDeleteAircraftTypes,
    canViewFlightCrews,
    canCreateFlightCrews,
    canEditFlightCrews,
    canDeleteFlightCrews,
    canViewEmployeeCategories,
    canCreateEmployeeCategories,
    canEditEmployeeCategories,
    canDeleteEmployeeCategories,
    canViewFlightTypes,
    canCreateFlightTypes,
    canEditFlightTypes,
    canDeleteFlightTypes,
    canManageAirports,
    canManageAircraftTypes,
    canManageEmployeeCategories,
    canManageFlightTypes,
    canManageFlightCrews,
  };
}
