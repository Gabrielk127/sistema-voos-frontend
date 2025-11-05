const API_BASE_URL =
  typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080" : "http://localhost:8080"

export interface AuthTokens {
  token: string
  refreshToken: string
}

export interface User {
  id: string
  email: string
  nome: string
  role: "ADMIN" | "MODERATOR" | "USER"
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Utility to get auth token from localStorage
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

// Utility to set auth tokens
export function setAuthTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return
  localStorage.setItem("authToken", tokens.token)
  localStorage.setItem("refreshToken", tokens.refreshToken)
  localStorage.setItem("isAuthenticated", "true")
}

// Utility to clear auth
export function clearAuth(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("authToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("isAuthenticated")
  localStorage.removeItem("user")
}

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit & { isPublic?: boolean } = {}): Promise<T> {
  const { isPublic = false, ...fetchOptions } = options
  const url = `${API_BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  }

  // Add auth token if not public
  if (!isPublic) {
    const token = getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (response.status === 204) {
      return {} as T
    }

    const data = await response.json()

    if (!response.ok) {
      // If token expired, try refresh
      if (response.status === 401 && !isPublic) {
        const refreshToken = localStorage.getItem("refreshToken")
        if (refreshToken) {
          try {
            const newTokens = await authRefresh(refreshToken)
            setAuthTokens(newTokens)
            // Retry the original request
            return apiCall<T>(endpoint, { ...options, isPublic })
          } catch (error) {
            clearAuth()
            throw new Error("Session expired")
          }
        }
      }
      throw new Error(data.error || `API Error: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

// AUTH ENDPOINTS
export async function authRegister(
  email: string,
  password: string,
  nome: string,
): Promise<{ user: User; tokens: AuthTokens }> {
  return apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, nome }),
    isPublic: true,
  })
}

export async function authLogin(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
  return apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    isPublic: true,
  })
}

export async function authRefresh(refreshToken: string): Promise<AuthTokens> {
  return apiCall("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    isPublic: true,
  })
}

export async function authLogout(): Promise<{ message: string }> {
  return apiCall("/auth/logout", {
    method: "POST",
  })
}

export async function authHealth(): Promise<{ message: string }> {
  return apiCall("/auth/health", { isPublic: true })
}

// AIRCRAFT ENDPOINTS
export interface Aircraft {
  id: number
  modelo: string
  fabricante: string
  capacidade: number
  anoFabricacao: number
}

export async function createAircraft(data: Omit<Aircraft, "id">): Promise<Aircraft> {
  return apiCall("/aircraft", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function listAircraft(): Promise<Aircraft[]> {
  return apiCall("/aircraft")
}

export async function getAircraft(id: number): Promise<Aircraft> {
  return apiCall(`/aircraft/${id}`)
}

export async function updateAircraft(id: number, data: Omit<Aircraft, "id">): Promise<Aircraft> {
  return apiCall(`/aircraft/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteAircraft(id: number): Promise<void> {
  return apiCall(`/aircraft/${id}`, {
    method: "DELETE",
  })
}

// AIRPORT ENDPOINTS
export interface Airport {
  id: number
  nome: string
  codigo: string
  cidade: string
  pais: string
}

export async function createAirport(data: Omit<Airport, "id">): Promise<Airport> {
  return apiCall("/airports", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function listAirports(): Promise<Airport[]> {
  return apiCall("/airports", { isPublic: true })
}

export async function getAirport(id: number): Promise<Airport> {
  return apiCall(`/airports/${id}`, { isPublic: true })
}

export async function updateAirport(id: number, data: Omit<Airport, "id">): Promise<Airport> {
  return apiCall(`/airports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteAirport(id: number): Promise<void> {
  return apiCall(`/airports/${id}`, {
    method: "DELETE",
  })
}

// FLIGHT ENDPOINTS
export interface Flight {
  id: number
  codigo: string
  aeronaveId: number
  aeroportoOrigemId: number
  aeroportoDestinoId: number
  dataPartida: string
  dataChegada: string
  preco: number
  assentosDisponiveis: number
}

export async function createFlight(data: Omit<Flight, "id">): Promise<Flight> {
  return apiCall("/flights", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function listFlights(): Promise<Flight[]> {
  return apiCall("/flights", { isPublic: true })
}

export async function getFlight(id: number): Promise<Flight> {
  return apiCall(`/flights/${id}`, { isPublic: true })
}

export async function updateFlight(id: number, data: Omit<Flight, "id">): Promise<Flight> {
  return apiCall(`/flights/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteFlight(id: number): Promise<void> {
  return apiCall(`/flights/${id}`, {
    method: "DELETE",
  })
}

// PASSENGER ENDPOINTS
export interface Passenger {
  id: number
  nome: string
  email: string
  cpf: string
  dataAtendimento: string
}

export async function createPassenger(data: Omit<Passenger, "id">): Promise<Passenger> {
  return apiCall("/passengers", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function listPassengers(): Promise<Passenger[]> {
  return apiCall("/passengers")
}

export async function getPassenger(id: number): Promise<Passenger> {
  return apiCall(`/passengers/${id}`)
}

export async function updatePassenger(id: number, data: Omit<Passenger, "id">): Promise<Passenger> {
  return apiCall(`/passengers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deletePassenger(id: number): Promise<void> {
  return apiCall(`/passengers/${id}`, {
    method: "DELETE",
  })
}

// EMPLOYEE ENDPOINTS
export interface Employee {
  id: number
  nome: string
  email: string
  cpf: string
  cargo: string
  dataAdmissao: string
}

export async function createEmployee(data: Omit<Employee, "id">): Promise<Employee> {
  return apiCall("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function listEmployees(): Promise<Employee[]> {
  return apiCall("/employees")
}

export async function getEmployee(id: number): Promise<Employee> {
  return apiCall(`/employees/${id}`)
}

export async function updateEmployee(id: number, data: Omit<Employee, "id">): Promise<Employee> {
  return apiCall(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteEmployee(id: number): Promise<void> {
  return apiCall(`/employees/${id}`, {
    method: "DELETE",
  })
}

// BOOKING ENDPOINTS
export interface Booking {
  id: number
  passageiroId: number
  vooId: number
  assento: string
  dataReserva: string
}

export async function createBooking(data: Omit<Booking, "id">): Promise<Booking> {
  return apiCall("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function listBookings(): Promise<Booking[]> {
  return apiCall("/bookings")
}

export async function getBooking(id: number): Promise<Booking> {
  return apiCall(`/bookings/${id}`)
}

export async function updateBooking(id: number, data: Omit<Booking, "id">): Promise<Booking> {
  return apiCall(`/bookings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteBooking(id: number): Promise<void> {
  return apiCall(`/bookings/${id}`, {
    method: "DELETE",
  })
}
