// src/components/Navbar.tsx
import { useState } from "react";
import {
CircleGauge,
Calendar,
CreditCard,
Wrench,
UserCheck,
ClipboardList,
Moon,
Sun,
Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
Tooltip,
TooltipContent,
TooltipProvider,
TooltipTrigger,
} from "@/components/ui/tooltip";

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Navbar() {
const [isDarkMode, setIsDarkMode] = useState(true);
const navigate = useNavigate();
const location = useLocation();

const toggleDarkMode = () => {
  setIsDarkMode(!isDarkMode);
  document.documentElement.classList.toggle("dark");
};

useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, []);

const navItems = [
  {
    id: "dashboard",
    icon: CircleGauge,
    tooltip: "Dashboard",
    path: "/dashboard",
  },
  {
    id: "finance",
    icon: CreditCard,
    tooltip: "Finance",
    path: "/finance",
  },
  {
    id: "reservation",
    icon: Calendar,
    tooltip: "Réservation",
    path: "/reservation",
  },
  {
    id: "control",
    icon: Eye,
    tooltip: "Control",
    path: "/control",
  },

  {
    id: "maintenance",
    icon: Wrench,
    tooltip: "Maintenance",
    path: "/maintenance",
  },
  {
    id: "checkinout",
    icon: UserCheck,
    tooltip: "Arrivée/Départ",
    path: "/checkinout",
  },
  {
    id: "checklist",
    icon: ClipboardList,
    tooltip: "Checkliste",
    path: "/checklist",
  },
];

return (
  <div className={isDarkMode ? "dark" : ""}>
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/60">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Navigation Items */}
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          <TooltipProvider>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`h-9 w-9 shrink-0 ${
                        isActive
                          ? "bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                      }`}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{item.tooltip}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center space-x-2 ml-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                    className="data-[state=checked]:bg-slate-900 data-[state=unchecked]:bg-slate-200 dark:data-[state=checked]:bg-slate-50 dark:data-[state=unchecked]:bg-slate-800"
                  />
                  <Moon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDarkMode ? "Mode clair" : "Mode sombre"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </nav>
  </div>
);
}
