const API_BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
        /\/+$/,
        ""
      )
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

// ============ AUTH UTILITIES ============
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

export function setAuthTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("authToken", tokens.token);
  localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.setItem("isAuthenticated", "true");
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("user");
}

// ============ GENERIC API CALL ============
async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { isPublic?: boolean } = {}
): Promise<T> {
  const { isPublic = false, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Add auth token if not public
  if (!isPublic) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log(`[AUTH] Token added (${token.substring(0, 20)}...)`);
    } else {
      console.warn(
        `[AUTH] No token found for authenticated endpoint: ${endpoint}`
      );
    }
  }

  console.log(`[API] ${fetchOptions.method || "GET"} ${url}`, {
    isPublic,
    headers: {
      "Content-Type": headers["Content-Type"],
      Authorization: headers["Authorization"] ? "Bearer ..." : "none",
    },
  });

  try {
    console.log(`[FETCH] Iniciando requisição para: ${url}`);
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
    console.log(`[FETCH] Resposta recebida com status: ${response.status}`);

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

      // Better error handling
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

// ============ AUTH ENDPOINTS ============
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

// ============ AIRPORT ENDPOINTS ============
export interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createAirport(
  data: Omit<Airport, "id" | "createdAt" | "updatedAt">
): Promise<Airport> {
  return apiCall("/airports", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
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
  data: Partial<Omit<Airport, "id" | "createdAt" | "updatedAt">>
): Promise<Airport> {
  return apiCall(`/airports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteAirport(id: number): Promise<void> {
  return apiCall(`/airports/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ AIRCRAFT TYPE ENDPOINTS ============
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
  data: Omit<AircraftType, "id" | "createdAt" | "updatedAt">
): Promise<AircraftType> {
  return apiCall("/aircraft-types", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function getAircraftType(id: number): Promise<AircraftType> {
  return apiCall(`/aircraft-types/${id}`, { isPublic: true });
}

export async function updateAircraftType(
  id: number,
  data: Partial<Omit<AircraftType, "id" | "createdAt" | "updatedAt">>
): Promise<AircraftType> {
  return apiCall(`/aircraft-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteAircraftType(id: number): Promise<void> {
  return apiCall(`/aircraft-types/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ AIRCRAFT ENDPOINTS ============
export interface Aircraft {
  id: number;
  aircraftType: AircraftType;
  registration: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAircraftRequest {
  registration: string;
  aircraftTypeId: number;
}

export async function createAircraft(
  data: CreateAircraftRequest
): Promise<Aircraft> {
  return apiCall("/aircraft", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function listAircraft(): Promise<Aircraft[]> {
  return apiCall("/aircraft", { isPublic: false });
}

export async function getAircraft(id: number): Promise<Aircraft> {
  return apiCall(`/aircraft/${id}`, { isPublic: false });
}

export async function updateAircraft(
  id: number,
  data: Partial<CreateAircraftRequest>
): Promise<Aircraft> {
  return apiCall(`/aircraft/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteAircraft(id: number): Promise<void> {
  return apiCall(`/aircraft/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ FLIGHT TYPE ENDPOINTS ============
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
  data: Omit<FlightType, "id" | "createdAt" | "updatedAt">
): Promise<FlightType> {
  return apiCall("/flight-types", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function getFlightType(id: number): Promise<FlightType> {
  return apiCall(`/flight-types/${id}`, { isPublic: true });
}

export async function updateFlightType(
  id: number,
  data: Partial<Omit<FlightType, "id" | "createdAt" | "updatedAt">>
): Promise<FlightType> {
  return apiCall(`/flight-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteFlightType(id: number): Promise<void> {
  return apiCall(`/flight-types/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ CONNECTION ENDPOINTS ============
export interface Connection {
  id: number;
  originAirport: Airport;
  destinationAirport: Airport;
  distance?: number;
  estimatedTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function listConnections(): Promise<Connection[]> {
  return apiCall("/connections", { isPublic: true });
}

export async function createConnection(data: any): Promise<Connection> {
  return apiCall("/connections", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function getConnection(id: number): Promise<Connection> {
  return apiCall(`/connections/${id}`, { isPublic: true });
}

export async function updateConnection(
  id: number,
  data: Partial<any>
): Promise<Connection> {
  return apiCall(`/connections/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteConnection(id: number): Promise<void> {
  return apiCall(`/connections/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ FLIGHT ENDPOINTS ============
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
  createdAt?: string;
  updatedAt?: string;
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

export async function createFlight(data: CreateFlightRequest): Promise<Flight> {
  return apiCall("/flights", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
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
    isPublic: false,
  });
}

export async function deleteFlight(id: number): Promise<void> {
  return apiCall(`/flights/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ EMPLOYEE CATEGORY ENDPOINTS ============
export interface EmployeeCategory {
  id: number;
  type: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function listEmployeeCategories(): Promise<EmployeeCategory[]> {
  return apiCall("/employee-categories", { isPublic: false });
}

export async function createEmployeeCategory(
  data: Omit<EmployeeCategory, "id" | "createdAt" | "updatedAt">
): Promise<EmployeeCategory> {
  return apiCall("/employee-categories", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function getEmployeeCategory(
  id: number
): Promise<EmployeeCategory> {
  return apiCall(`/employee-categories/${id}`, { isPublic: false });
}

export async function updateEmployeeCategory(
  id: number,
  data: Partial<Omit<EmployeeCategory, "id" | "createdAt" | "updatedAt">>
): Promise<EmployeeCategory> {
  return apiCall(`/employee-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteEmployeeCategory(id: number): Promise<void> {
  return apiCall(`/employee-categories/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ EMPLOYEE ENDPOINTS ============
export interface Employee {
  id: number;
  employeeCategory: EmployeeCategory;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
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
    isPublic: false,
  });
}

export async function listEmployees(): Promise<Employee[]> {
  return apiCall("/employees", { isPublic: false });
}

export async function getEmployee(id: number): Promise<Employee> {
  return apiCall(`/employees/${id}`, { isPublic: false });
}

export async function updateEmployee(
  id: number,
  data: Partial<CreateEmployeeRequest>
): Promise<Employee> {
  return apiCall(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteEmployee(id: number): Promise<void> {
  return apiCall(`/employees/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ FLIGHT CREW ENDPOINTS ============
export interface FlightCrew {
  id: number;
  flight: Flight;
  employee: Employee;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFlightCrewRequest {
  flightId: number;
  employeeId: number;
  role: string;
}

export async function listFlightCrews(): Promise<FlightCrew[]> {
  return apiCall("/flight-crews", { isPublic: false });
}

export async function createFlightCrew(
  data: CreateFlightCrewRequest
): Promise<FlightCrew> {
  return apiCall("/flight-crews", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function getFlightCrew(id: number): Promise<FlightCrew> {
  return apiCall(`/flight-crews/${id}`, { isPublic: false });
}

export async function updateFlightCrew(
  id: number,
  data: Partial<CreateFlightCrewRequest>
): Promise<FlightCrew> {
  return apiCall(`/flight-crews/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteFlightCrew(id: number): Promise<void> {
  return apiCall(`/flight-crews/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ PASSENGER ENDPOINTS ============
export interface Passenger {
  id: number;
  email: string;
  username: string;
  cpf: string;
  createdAt?: string;
  updatedAt?: string;
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
    isPublic: false,
  });
}

export async function listPassengers(): Promise<Passenger[]> {
  return apiCall("/passengers", { isPublic: false });
}

export async function getPassenger(id: number): Promise<Passenger> {
  return apiCall(`/passengers/${id}`, { isPublic: false });
}

export async function updatePassenger(
  id: number,
  data: Partial<CreatePassengerRequest>
): Promise<Passenger> {
  return apiCall(`/passengers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deletePassenger(id: number): Promise<void> {
  return apiCall(`/passengers/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ BOOKING ENDPOINTS ============
export interface Booking {
  id: number;
  passenger: Passenger;
  flight: Flight;
  bookingNumber: string;
  purchaseDate: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  confirmationDate?: string;
  cancellationDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
    isPublic: false,
  });
}

export async function listBookings(): Promise<Booking[]> {
  return apiCall("/bookings", { isPublic: false });
}

export async function getBooking(id: number): Promise<Booking> {
  return apiCall(`/bookings/${id}`, { isPublic: false });
}

export async function updateBooking(
  id: number,
  data: Partial<CreateBookingRequest>
): Promise<Booking> {
  return apiCall(`/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteBooking(id: number): Promise<void> {
  return apiCall(`/bookings/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ TICKET ENDPOINTS ============
export interface Ticket {
  id: number;
  booking: Booking;
  passengerName: string;
  seatNumber: number;
  checkInCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTicketRequest {
  bookingId: number;
  passengerName: string;
  seatNumber: number;
  checkInCompleted?: boolean;
}

export async function createTicket(data: CreateTicketRequest): Promise<Ticket> {
  return apiCall("/tickets", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function listTickets(): Promise<Ticket[]> {
  return apiCall("/tickets", { isPublic: false });
}

export async function getTicket(id: number): Promise<Ticket> {
  return apiCall(`/tickets/${id}`, { isPublic: false });
}

export async function updateTicket(
  id: number,
  data: Partial<CreateTicketRequest>
): Promise<Ticket> {
  return apiCall(`/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteTicket(id: number): Promise<void> {
  return apiCall(`/tickets/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ BOLETO PAYMENT ENDPOINTS ============
export interface BoletoPayment {
  id: number;
  booking: Booking;
  boleto: string;
  status: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBoletoPaymentRequest {
  bookingId: number;
  amount: number;
}

export async function createBoletoPayment(
  data: CreateBoletoPaymentRequest
): Promise<BoletoPayment> {
  return apiCall("/boleto-payments", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function listBoletoPayments(): Promise<BoletoPayment[]> {
  return apiCall("/boleto-payments", { isPublic: false });
}

export async function getBoletoPayment(id: number): Promise<BoletoPayment> {
  return apiCall(`/boleto-payments/${id}`, { isPublic: false });
}

export async function updateBoletoPayment(
  id: number,
  data: Partial<CreateBoletoPaymentRequest>
): Promise<BoletoPayment> {
  return apiCall(`/boleto-payments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteBoletoPayment(id: number): Promise<void> {
  return apiCall(`/boleto-payments/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ CARD PAYMENT ENDPOINTS ============
export interface CardPayment {
  id: number;
  booking: Booking;
  cardNumber: string;
  cardholderName: string;
  status: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCardPaymentRequest {
  bookingId: number;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  amount: number;
}

export async function createCardPayment(
  data: CreateCardPaymentRequest
): Promise<CardPayment> {
  return apiCall("/card-payments", {
    method: "POST",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function listCardPayments(): Promise<CardPayment[]> {
  return apiCall("/card-payments", { isPublic: false });
}

export async function getCardPayment(id: number): Promise<CardPayment> {
  return apiCall(`/card-payments/${id}`, { isPublic: false });
}

export async function updateCardPayment(
  id: number,
  data: Partial<CreateCardPaymentRequest>
): Promise<CardPayment> {
  return apiCall(`/card-payments/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    isPublic: false,
  });
}

export async function deleteCardPayment(id: number): Promise<void> {
  return apiCall(`/card-payments/${id}`, {
    method: "DELETE",
    isPublic: false,
  });
}

// ============ DEBUG ENDPOINT ============
export async function testAuth(): Promise<any> {
  console.log("Testing authentication...");
  const token = getAuthToken();
  console.log(
    "Token in storage:",
    token ? `${token.substring(0, 20)}...` : "NOT FOUND"
  );

  try {
    const response = await fetch(`${API_BASE_URL}/passengers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

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
