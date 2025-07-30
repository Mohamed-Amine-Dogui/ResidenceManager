import { useNavigate } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg">
        <CardContent className="flex flex-col items-center justify-center text-center p-8 space-y-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900">
            <AlertCircle className="w-10 h-10 text-slate-600 dark:text-slate-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50">
              404
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-700 dark:text-slate-300">
              Page non trouvée
            </h2>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-sm">
            Cette page n'existe pas.
          </p>

          <Button
            onClick={handleGoHome}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 px-6 py-2 text-base font-medium"
          >
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
