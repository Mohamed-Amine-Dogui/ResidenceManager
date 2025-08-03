import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  CalendarIcon,
  LogIn,
  LogOut,
  Wrench,
  Home,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChartTooltip } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Mock data for demonstration
  const keyMetrics = [
    {
      title: "Check-in",
      value: 8,
      icon: LogIn,
      description: "Arrivées aujourd'hui",
    },
    {
      title: "Check-out",
      value: 5,
      icon: LogOut,
      description: "Départs aujourd'hui",
    },
    {
      title: "Maintenances",
      value: 3,
      icon: Wrench,
      description: "À effectuer",
    },
    {
      title: "Maisons prêtes",
      value: 10,
      icon: Home,
      description: "Disponibles",
    },
    {
      title: "Paiements complétés",
      value: 12,
      icon: CheckCircle,
      description: "Ce mois-ci",
    },
    {
      title: "Paiements ouverts",
      value: 4,
      icon: Clock,
      description: "En attente",
    },
    {
      title: "Paiements d'avance",
      value: 7,
      icon: DollarSign,
      description: "Réservations",
    },
  ];

  // Pie chart data for house occupancy
const occupancyData = [
  { name: "Occupées", value: 9, fill: "#1d4ed8" }, // blue-700
  { name: "Libres", value: 4, fill: "#7dd3fc" },   // sky-300
];



  // Area chart data for monthly revenue
  const revenueData = [
    { jour: "1", revenus: 2400 },
    { jour: "5", revenus: 1398 },
    { jour: "10", revenus: 9800 },
    { jour: "15", revenus: 3908 },
    { jour: "20", revenus: 4800 },
    { jour: "25", revenus: 3800 },
    { jour: "30", revenus: 4300 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              Tableau de bord
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Vue d'ensemble de votre résidence
            </p>
          </div>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full md:w-[240px] justify-start text-left font-normal border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
                  !selectedDate && "text-slate-500 dark:text-slate-400"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                {selectedDate ? (
                  <span className="text-slate-900 dark:text-slate-50">
                    {format(selectedDate, "PPP", { locale: fr })}
                  </span>
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-slate-200 dark:border-slate-800"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                autoFocus
                locale={fr}
                className="bg-white dark:bg-slate-950"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card
                key={index}
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    {metric.value}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart - House Occupancy */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Occupation des maisons
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Répartition pour le{" "}
                {format(selectedDate, "PPP", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 shadow-lg">
                              <p className="text-slate-900 dark:text-slate-50 font-medium">
                                {payload[0].name}: {payload[0].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-700"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Occupées (9)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-sky-300"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Libres (4)
                  </span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {Math.round((9 / 13) * 100)}%
                  </span>{" "}
                  d'occupation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Area Chart - Monthly Revenue */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Évolution des revenus
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Revenus du mois de{" "}
                {format(selectedDate, "MMMM yyyy", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorRevenus"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1d4ed8"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="jour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) => `${value}€`}
                    />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-lg">
                              <p className="text-slate-900 dark:text-slate-50 font-medium">
                                Jour {label}
                              </p>
                              <p className="text-slate-600 dark:text-slate-400">
                                Revenus: {payload[0].value}€
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenus"
                      stroke="#475569"
                      fillOpacity={1}
                      fill="url(#colorRevenus)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total du mois:{" "}
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {revenueData
                      .reduce((sum, item) => sum + item.revenus, 0)
                      .toLocaleString()}
                    €
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
