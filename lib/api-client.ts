const API_BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "")
    : "http://localhost:8080";

export interface User {
  id: string;
  email: string;
  username: string;
  role: "ADMIN" | "MODERATOR" | "USER";
}

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Utility to get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

// Utility to set auth tokens
export function setAuthTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("authToken", tokens.token);
  localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.setItem("isAuthenticated", "true");
}

// Utility to clear auth
export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { isPublic?: boolean } = {}
): Promise<T> {
  const { isPublic = false, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Add auth token if not public
  if (!isPublic) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`[AUTH] Token added (${token.substring(0, 20)}...)`);
    } else {
      console.warn(`[AUTH] No token found for authenticated endpoint: ${endpoint}`);
    }
  }

  console.log(`[API] ${fetchOptions.method || "GET"} ${url}`, {
    isPublic,
    headers: {
      "Content-Type": headers["Content-Type"],
      "Authorization": headers["Authorization"] ? "Bearer ..." : "none",
    },
  });

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
      // If token expired, try refresh
      if (response.status === 401 && !isPublic) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const newTokens = await authRefresh(refreshToken);
            setAuthTokens(newTokens);
            // Retry the original request
            return apiCall<T>(endpoint, { ...options, isPublic });
          } catch (refreshError) {
            clearAuth();
            throw new Error("Session expired");
          }
        }
      }

      // Melhor tratamento de erros
      const errorMessage =
        data?.message ||
        data?.error ||
        data?.errors?.[0]?.message ||
        data?.validationErrors?.[0] ||
        `API Error: ${response.status}`;

      console.error(`[${response.status}] ${endpoint}:`, data);
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// AUTH ENDPOINTS
export async function authRegister(
  email: string,
  password: string,
  username: string,
  cpf: string
): Promise<AuthResponse> {
  const body = { email, password, username, cpf };
  console.log("[REGISTER] Enviando:", body);

  return apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    isPublic: true,
  });
}

export async function authLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  return apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    isPublic: true,
  });
}

export async function authRefresh(refreshToken: string): Promise<AuthTokens> {
  return apiCall("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    isPublic: true,
  });
}

export async function authLogout(): Promise<{ message: string }> {
  return apiCall("/auth/logout", {
    method: "POST",
  });
}

export async function authHealth(): Promise<{ message: string }> {
  return apiCall("/auth/health", { isPublic: true });
}

// DEBUG endpoint to test authentication
export async function testAuth(): Promise<any> {
  console.log("Testing authentication...");
  const token = getAuthToken();
  console.log("Token in storage:", token ? `${token.substring(0, 20)}...` : "NOT FOUND");
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/passengers`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    
    const data = await response.json();
    console.log("Auth Test Result:", {
      status: response.status,
      statusText: response.statusText,
      data,
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      data,
    };
  } catch (error) {
    console.error("Auth test failed:", error);
    throw error;
  }
}

// AIRCRAFT ENDPOINTS
export interface Aircraft {
  id: number;
  aircraftType: AircraftType;
  registration: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAircraftRequest {
  aircraftTypeId: number;
  registration: string;
}

export async function createAircraft(
  data: CreateAircraftRequest
): Promise<Aircraft> {
  return apiCall("/aircraft", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listAircraft(): Promise<Aircraft[]> {
  return apiCall("/aircraft");
}

export async function getAircraft(id: number): Promise<Aircraft> {
  return apiCall(`/aircraft/${id}`);
}

export async function updateAircraft(
  id: number,
  data: Partial<CreateAircraftRequest>
): Promise<Aircraft> {
  return apiCall(`/aircraft/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAircraft(id: number): Promise<void> {
  return apiCall(`/aircraft/${id}`, {
    method: "DELETE",
  });
}

// AIRPORT ENDPOINTS
export interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
  description?: string;
}

export async function createAirport(
  data: Omit<Airport, "id">
): Promise<Airport> {
  return apiCall("/airports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listAirports(): Promise<Airport[]> {
  return apiCall("/airports", { isPublic: true });
}

export async function getAirport(id: number): Promise<Airport> {
  return apiCall(`/airports/${id}`, { isPublic: true });
}

export async function updateAirport(
  id: number,
  data: Omit<Airport, "id">
): Promise<Airport> {
  return apiCall(`/airports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAirport(id: number): Promise<void> {
  return apiCall(`/airports/${id}`, {
    method: "DELETE",
  });
}

// AIRCRAFT TYPE ENDPOINTS
export interface AircraftType {
  id: number;
  type: string;
  description?: string;
  passengerCapacity?: number;
  aircraftCategory?: any;
  maxSpeed?: number;
  rangeKm?: number;
  cargoCapacityKg?: number;
  maxAltitudeFt?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function listAircraftTypes(): Promise<AircraftType[]> {
  return apiCall("/aircraft-types", { isPublic: true });
}

export async function createAircraftType(
  data: Omit<AircraftType, "id">
): Promise<AircraftType> {
  return apiCall("/aircraft-types", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAircraftType(id: number): Promise<AircraftType> {
  return apiCall(`/aircraft-types/${id}`, { isPublic: true });
}

export async function updateAircraftType(
  id: number,
  data: Partial<AircraftType>
): Promise<AircraftType> {
  return apiCall(`/aircraft-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAircraftType(id: number): Promise<void> {
  return apiCall(`/aircraft-types/${id}`, {
    method: "DELETE",
  });
}

// FLIGHT TYPE ENDPOINTS
export interface FlightType {
  id: number;
  type: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function listFlightTypes(): Promise<FlightType[]> {
  return apiCall("/flight-types", { isPublic: true });
}

export async function createFlightType(
  data: Omit<FlightType, "id">
): Promise<FlightType> {
  return apiCall("/flight-types", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getFlightType(id: number): Promise<FlightType> {
  return apiCall(`/flight-types/${id}`, { isPublic: true });
}

export async function updateFlightType(
  id: number,
  data: Partial<FlightType>
): Promise<FlightType> {
  return apiCall(`/flight-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFlightType(id: number): Promise<void> {
  return apiCall(`/flight-types/${id}`, {
    method: "DELETE",
  });
}

// FLIGHT ENDPOINTS
export interface Flight {
  id: number;
  flightType: FlightType;
  aircraftType: AircraftType;
  originAirport: Airport;
  destinationAirport: Airport;
  departureDate: string;
  scheduledDepartureTime: string;
  arrivalDate: string;
  scheduledArrivalTime: string;
  scheduledDurationMin: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlightRequest {
  idFlightType: number;
  idAircraftType: number;
  idOriginAirport: number;
  idDestinationAirport: number;
  departureDate: string;
  scheduledDepartureTime: string;
  arrivalDate: string;
  scheduledArrivalTime: string;
  scheduledDurationMin: string;
  status?: string;
}

export async function createFlight(
  data: CreateFlightRequest
): Promise<Flight> {
  return apiCall("/flights", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listFlights(): Promise<Flight[]> {
  return apiCall("/flights", { isPublic: true });
}

export async function getFlight(id: number): Promise<Flight> {
  return apiCall(`/flights/${id}`, { isPublic: true });
}

export async function updateFlight(
  id: number,
  data: Partial<CreateFlightRequest>
): Promise<Flight> {
  return apiCall(`/flights/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFlight(id: number): Promise<void> {
  return apiCall(`/flights/${id}`, {
    method: "DELETE",
  });
}

// PASSENGER ENDPOINTS
export interface Passenger {
  id: number;
  email: string;
  username: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePassengerRequest {
  email: string;
  username: string;
  cpf: string;
  password?: string;
}

export async function createPassenger(
  data: CreatePassengerRequest
): Promise<Passenger> {
  return apiCall("/passengers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listPassengers(): Promise<Passenger[]> {
  return apiCall("/passengers");
}

export async function getPassenger(id: number): Promise<Passenger> {
  return apiCall(`/passengers/${id}`);
}

export async function updatePassenger(
  id: number,
  data: Partial<CreatePassengerRequest>
): Promise<Passenger> {
  return apiCall(`/passengers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePassenger(id: number): Promise<void> {
  return apiCall(`/passengers/${id}`, {
    method: "DELETE",
  });
}

// EMPLOYEE CATEGORY ENDPOINTS
// EMPLOYEE CATEGORY ENDPOINTS
export interface EmployeeCategory {
  id: number;
  type: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function listEmployeeCategories(): Promise<EmployeeCategory[]> {
  return apiCall("/employee-categories");
}

export async function createEmployeeCategory(
  data: Omit<EmployeeCategory, "id">
): Promise<EmployeeCategory> {
  return apiCall("/employee-categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getEmployeeCategory(id: number): Promise<EmployeeCategory> {
  return apiCall(`/employee-categories/${id}`);
}

export async function updateEmployeeCategory(
  id: number,
  data: Partial<EmployeeCategory>
): Promise<EmployeeCategory> {
  return apiCall(`/employee-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEmployeeCategory(id: number): Promise<void> {
  return apiCall(`/employee-categories/${id}`, {
    method: "DELETE",
  });
}

// EMPLOYEE ENDPOINTS
export interface Employee {
  id: number;
  employeeCategory: EmployeeCategory;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  employeeCategoryId: number;
  name: string;
  email: string;
}

export async function createEmployee(
  data: CreateEmployeeRequest
): Promise<Employee> {
  return apiCall("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listEmployees(): Promise<Employee[]> {
  return apiCall("/employees");
}

export async function getEmployee(id: number): Promise<Employee> {
  return apiCall(`/employees/${id}`);
}

export async function updateEmployee(
  id: number,
  data: Partial<CreateEmployeeRequest>
): Promise<Employee> {
  return apiCall(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEmployee(id: number): Promise<void> {
  return apiCall(`/employees/${id}`, {
    method: "DELETE",
  });
}

// TICKET ENDPOINTS
export interface Ticket {
  id: number;
  booking: any; // BookingResponse
  passengerName: string;
  seatNumber: number;
  checkInCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketRequest {
  bookingId: number;
  passengerName: string;
  seatNumber: number;
  checkInCompleted?: boolean;
}

export async function createTicket(
  data: CreateTicketRequest
): Promise<Ticket> {
  return apiCall("/tickets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listTickets(): Promise<Ticket[]> {
  return apiCall("/tickets");
}

export async function getTicket(id: number): Promise<Ticket> {
  return apiCall(`/tickets/${id}`);
}

export async function updateTicket(
  id: number,
  data: Partial<CreateTicketRequest>
): Promise<Ticket> {
  return apiCall(`/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteTicket(id: number): Promise<void> {
  return apiCall(`/tickets/${id}`, {
    method: "DELETE",
  });
}

// BOOKING ENDPOINTS
export interface Booking {
  id: number;
  passenger: Passenger;
  flight: Flight;
  bookingNumber: string;
  purchaseDate: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  confirmationDate: string;
  cancellationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  passengerId: number;
  flightId: number;
  bookingNumber?: string;
  purchaseDate: string;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  numberOfSeats?: number;
}

export async function createBooking(
  data: CreateBookingRequest
): Promise<Booking> {
  return apiCall("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listBookings(): Promise<Booking[]> {
  return apiCall("/bookings");
}

export async function getBooking(id: number): Promise<Booking> {
  return apiCall(`/bookings/${id}`);
}

export async function updateBooking(
  id: number,
  data: Partial<CreateBookingRequest>
): Promise<Booking> {
  return apiCall(`/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteBooking(id: number): Promise<void> {
  return apiCall(`/bookings/${id}`, {
    method: "DELETE",
  });
}

// FLIGHT CREW ENDPOINTS
export interface FlightCrew {
  id: number;
  flight: Flight;
  employee: Employee;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFlightCrewRequest {
  flightId: number;
  employeeId: number;
  role: string;
}

export async function listFlightCrews(): Promise<FlightCrew[]> {
  return apiCall("/flight-crews");
}

export async function createFlightCrew(
  data: CreateFlightCrewRequest
): Promise<FlightCrew> {
  return apiCall("/flight-crews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getFlightCrew(id: number): Promise<FlightCrew> {
  return apiCall(`/flight-crews/${id}`);
}

export async function updateFlightCrew(
  id: number,
  data: Partial<CreateFlightCrewRequest>
): Promise<FlightCrew> {
  return apiCall(`/flight-crews/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFlightCrew(id: number): Promise<void> {
  return apiCall(`/flight-crews/${id}`, {
    method: "DELETE",
  });
}
