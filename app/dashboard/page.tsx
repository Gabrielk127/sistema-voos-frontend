"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Plane, Users, Ticket } from "lucide-react";
import {
  listFlights,
  listBookings,
  listPassengers,
  listTickets,
} from "@/lib/api-client";
import { usePermissions } from "@/hooks/use-permissions";

interface DashboardStats {
  totalFlights: number;
  totalPassengers: number;
  totalBookings: number;
}

interface ChartData {
  month: string;
  flights: number;
  passengers: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFlights: 0,
    totalPassengers: 0,
    totalBookings: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    console.log("[DASHBOARD] Carregando dashboard");

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Carregar voos (sempre público)
        const flights = await listFlights();
        const totalFlights = flights.length;
        console.log("[DASHBOARD] Voos carregados:", totalFlights);

        // Carregar passageiros (se tem permissão)
        let totalPassengers = 0;
        if (permissions.canViewPassengers()) {
          try {
            const passengers = await listPassengers();
            totalPassengers = passengers.length;
            console.log("[DASHBOARD] Passageiros carregados:", totalPassengers);
          } catch (error) {
            console.error("[DASHBOARD] Erro ao carregar passageiros:", error);
          }
        }

        // Carregar bookings (se tem permissão)
        let totalBookings = 0;
        if (permissions.canViewBookings()) {
          try {
            const bookings = await listBookings();
            totalBookings = bookings.length;
            console.log("[DASHBOARD] Reservas carregadas:", totalBookings);
          } catch (error) {
            console.error("[DASHBOARD] Erro ao carregar reservas:", error);
          }
        }

        setStats({
          totalFlights,
          totalPassengers,
          totalBookings,
        });

        // Gerar dados de gráfico baseado em voos
        const monthlyData = generateMonthlyData(flights);
        setChartData(monthlyData);
      } catch (error) {
        console.error(
          "[DASHBOARD] Erro ao carregar dados da dashboard:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const generateMonthlyData = (flights: any[]): ChartData[] => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // Agrupar voos por mês
    const flightsByMonth: Record<string, number> = {};
    const passengersByMonth: Record<string, number> = {};

    months.forEach((month) => {
      flightsByMonth[month] = 0;
      passengersByMonth[month] = 0;
    });

    flights.forEach((flight) => {
      if (flight.departureDate) {
        const date = new Date(flight.departureDate);
        const monthIndex = date.getMonth();
        const month = months[monthIndex];
        flightsByMonth[month] = (flightsByMonth[month] || 0) + 1;
        // Assumindo média de 150 passageiros por voo
        passengersByMonth[month] = (passengersByMonth[month] || 0) + 150;
      }
    });

    // Retornar apenas os últimos 6 meses com dados
    return months.slice(-6).map((month) => ({
      month,
      flights: flightsByMonth[month] || 0,
      passengers: passengersByMonth[month] || 0,
    }));
  };

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
        <div className="flex justify-center items-center gap-2 min-h-96">
          <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
          <div
            className="w-4 h-4 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-4 h-4 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Plane,
              label: "Voos Ativos",
              value: stats.totalFlights.toLocaleString("pt-BR"),
              color: "primary",
            },
            {
              icon: Users,
              label: "Passageiros",
              value: stats.totalPassengers.toLocaleString("pt-BR"),
              color: "secondary",
            },
            {
              icon: Ticket,
              label: "Reservas",
              value: stats.totalBookings.toLocaleString("pt-BR"),
              color: "accent",
            },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon className="w-10 h-10 text-primary/40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Voos por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="flights" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passageiros por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="passengers"
                    stroke="var(--color-secondary)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
