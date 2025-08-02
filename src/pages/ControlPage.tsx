import { useState, useEffect } from "react";
import { CheckCircle, Settings } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster, toast } from "sonner";

const houses = [
  { id: "maison-1", name: "Mv1" },
  { id: "maison-2", name: "Mv2" },
  { id: "maison-3", name: "Mv3" },
  { id: "maison-4", name: "Mv4" },
  { id: "maison-5", name: "Mv5" },
  { id: "maison-6", name: "Mv6" },
  { id: "maison-7", name: "Mv7" },
  { id: "maison-8", name: "Mv8" },
  { id: "maison-9", name: "Mv9" },
  { id: "maison-10", name: "Mv10" },
  { id: "maison-bg", name: "Bg" },
  { id: "maison-high", name: "High" },
];

// Mock data
const mockData = {
  categories: [
    {
      id: 1,
      name: "Entrée",
      steps: [
        {
          id: 1,
          description:
            "Nettoyage de la porte extérieure de la maison (poussière + araignées)",
          "produits a utilise": "",
          type: "nettoyage",
        },
      ],
    },
    {
      id: 2,
      name: "Salle de Bain",
      steps: [
        {
          id: 2,
          description: "Nettoyage de (lavabo + toilette + douche)",
          "produits a utilise": "détartrant, OMO, Javel",
          type: "nettoyage",
        },
        {
          id: 3,
          description: "Nettoyage du miroir",
          "produits a utilise": "Ajax",
          type: "nettoyage",
        },
        {
          id: 4,
          description: "Nettoyage interne de toilette",
          "produits a utilise": "Choc",
          type: "nettoyage",
        },
        {
          id: 5,
          description: "Nettoyage de tout le faïence des murs",
          "produits a utilise": "OMO, Javel, détartrant",
          type: "nettoyage",
        },
        {
          id: 6,
          description:
            "Vérification de la validité de : chasse, douche, toilette, lampe, eau chaude",
          "produits a utilise": "",
          type: "vérification",
        },
        {
          id: 7,
          description:
            "Vérification de la présence de : seau, bassine, frottoir, balai, serpillière",
          "produits a utilise": "",
          type: "vérification",
        },
      ],
    },
    {
      id: 3,
      name: "Couloir",
      steps: [
        {
          id: 8,
          description: "Vérification de la validité de la lampe",
          "produits a utilise": "",
          type: "vérification",
        },
        {
          id: 9,
          description:
            "Nettoyage des toiles d'araignées (plafond et coins des murs)",
          "produits a utilise": "",
          type: "nettoyage",
        },
        {
          id: 10,
          description: "Nettoyage de la faïence des murs",
          "produits a utilise": "OMO, Javel",
          type: "nettoyage",
        },
      ],
    },
    {
      id: 4,
      name: "Cuisine",
      steps: [
        {
          id: 11,
          description:
            "Nettoyage du réfrigérateur (enlever tous les supports internes)",
          "produits a utilise": "OMO, Javel, dégraissant, détartrant, zestes",
          type: "nettoyage",
        },
        {
          id: 12,
          description: "Nettoyage du gaz + nettoyage du four",
          "produits a utilise": "OMO, dégraissant, Javel",
          type: "nettoyage",
        },
        {
          id: 13,
          description: "Nettoyage du plan de travail en marbre",
          "produits a utilise": "OMO, dégraissant, Javel, détartrant",
          type: "nettoyage",
        },
        {
          id: 14,
          description: "Nettoyage de la fenêtre (vitre + bois) + porte cuisine",
          "produits a utilise": "OMO, Javel, Ajax",
          type: "nettoyage",
        },
        {
          id: 15,
          description:
            "Nettoyage du placard + étagères de la cuisine (de l'intérieur + extérieur)",
          "produits a utilise": "",
          type: "nettoyage",
        },
        {
          id: 16,
          description:
            "Nettoyage de la faïence (autour du gaz, des taches d'huiles)",
          "produits a utilise": "dégraissant, OMO, Javel",
          type: "nettoyage",
        },
      ],
    },
    {
      id: 5,
      name: "Chambres",
      steps: [
        {
          id: 17,
          description: "Enlèvement des toiles d'araignées",
          "produits a utilise": "",
          type: "nettoyage",
        },
        {
          id: 18,
          description:
            "Changement des draps + oreillers ou secouer s'ils sont propres",
          "produits a utilise": "",
          type: "entretien",
        },
        {
          id: 19,
          description: "Enlever la poussière des étagères du placard",
          "produits a utilise": "",
          type: "nettoyage",
        },
      ],
    },
    {
      id: 6,
      name: "Extérieur",
      steps: [
        {
          id: 20,
          description: "Nettoyage des balcons + véranda",
          "produits a utilise": "",
          type: "nettoyage",
        },
        {
          id: 21,
          description: "Nettoyage de la table + chaises plastiques",
          "produits a utilise": "OMO, Javel",
          type: "nettoyage",
        },
        {
          id: 22,
          description: "Nettoyage du parterre de toute la maison",
          "produits a utilise": "eau, Javel",
          type: "nettoyage",
        },
      ],
    },
  ],
};

interface Task {
  id: number;
  description: string;
  produits: string;
  completed: boolean;
}

interface Category {
  id: number;
  name: string;
  tasks: Task[];
  isReady: boolean;
}

export default function ControlPage() {
  const [selectedHouse, setSelectedHouse] = useState<string>("maison-1");
  const [categories, setCategories] = useState<Category[]>([]);

  // Initialize initializeCategories from mock data
  
  const initializeCategories = () => {
    return mockData.categories.map((category) => ({
      id: category.id,
      name: category.name,
      tasks: category.steps.map((step) => ({
        id: step.id,
        description: step.description,
        produits: step["produits a utilise"],
        completed: false,
      })),
      isReady: false,
    }));
  };

  useEffect(() => {
    const initialCategories = initializeCategories();
    setCategories(initialCategories);
  }, [selectedHouse]);

  
  // Calculate readiness percentage
  const readyCategories = categories.filter((cat) => cat.isReady).length;
  const readinessPercentage = Math.round(
    (readyCategories / categories.length) * 100
  );
  const isFullyReady = readinessPercentage === 100;

  // Pie chart data
  const pieData = [
    {
      name: "Prêt",
      value: readinessPercentage,
      fill: isFullyReady ? "#22c55e" : "#3b82f6",
    },
    {
      name: "En attente",
      value: 100 - readinessPercentage,
      fill: "#e2e8f0",
    },
  ];

  const handleTaskToggle = (categoryId: number, taskId: number) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id === categoryId) {
          const updatedTasks = category.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          const isReady = updatedTasks.every((task) => task.completed);
          return { ...category, tasks: updatedTasks, isReady };
        }
        return category;
      })
    );
  };

  const handleMarkCategoryReady = (categoryId: number) => {
    setCategories((prev) =>
      prev.map((category) => {
        if (category.id === categoryId) {
          const updatedTasks = category.tasks.map((task) => ({
            ...task,
            completed: true,
          }));
          toast.success("Catégorie marquée comme prête", {
            description: `${category.name} est maintenant prête`,
            duration: 2000,
          });
          return { ...category, tasks: updatedTasks, isReady: true };
        }
        return category;
      })
    );
  };

  // Show success toast when house is fully ready
  useEffect(() => {
    if (isFullyReady && readyCategories > 0) {
      toast.success("Maison prête !", {
        description: `${
          houses.find((h) => h.id === selectedHouse)?.name
        } est maintenant 100% prête`,
        duration: 1000,
      });
    }
  }, [isFullyReady, readyCategories, selectedHouse]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Contrôle
          </h1>
        </div>

        {/* House Selector */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Sélectionner une maison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedHouse} onValueChange={setSelectedHouse}>
              <SelectTrigger className="w-full md:w-[300px] border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Choisir une maison" />
              </SelectTrigger>
              <SelectContent>
                {houses.map((house) => (
                  <SelectItem key={house.id} value={house.id}>
                    {house.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Pie Chart - Centered */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="text-center">
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              État de préparation -{" "}
              {houses.find((h) => h.id === selectedHouse)?.name}
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              {readinessPercentage}% des catégories sont prêtes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[300px] w-full max-w-md">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                {readinessPercentage}%
              </div>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isFullyReady ? "bg-green-500" : "bg-blue-500"
                    }`}
                  ></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    Prêt ({readyCategories}/6)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <span className="text-slate-600 dark:text-slate-400">
                    En attente ({categories.length - readyCategories}/6)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 ${
                category.isReady
                  ? "ring-2 ring-green-500 dark:ring-green-400 bg-green-50 dark:bg-green-950/20"
                  : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {category.name}
                  </CardTitle>
                  {category.isReady && (
                    <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                  )}
                </div>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  {category.tasks.filter((t) => t.completed).length}/
                  {category.tasks.length} tâches terminées
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {category.tasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() =>
                        handleTaskToggle(category.id, task.id)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`text-sm cursor-pointer ${
                          task.completed
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {task.description}
                      </label>
                      {task.produits && (
                        <div className="mt-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {task.produits}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    onClick={() => handleMarkCategoryReady(category.id)}
                    disabled={category.isReady}
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50"
                  >
                    {category.isReady ? "Prêt ✓" : "Marquer comme prêt"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Toaster />
      </div>
    </div>
  );
}
