import type React from "react";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Threads from "@/components/reactbits/Backgrounds/Threads/Threads";
import BlurText from "@/components/reactbits/TextAnimations/BlurText/BlurText";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleAnimationComplete = () => {
    console.log("Animation completed!");
  };

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const handleGuestVisit = () => {
    console.log("Visiting as guest");
    navigate("/dashboard");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic
    console.log("Login attempt:", { email, password });
  };

  const handleGoogleLogin = () => {
    // Handle Google login
    console.log("Google login");
  };

  const handleFacebookLogin = () => {
    // Handle Facebook login
    console.log("Facebook login");
  };

  const handleForgotPassword = () => {
    // Handle forgot password
    console.log("Forgot password");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      {/* Threads Background */}
      <div className="absolute inset-0 z-0">
        <Threads amplitude={1.2} distance={0.9} enableMouseInteraction />
      </div>

      {/* Foreground content */}

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Hero */}
        <div className="text-center space-y-2">
          <div className="flex flex-col items-center justify-center mb-4 space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <img
                src={logo}
                alt="Logo"
                className="h-16 w-16 rounded-full shadow-md"
              />
              <div className="text-left">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  residenceManager
                </h1>
                <BlurText
                  text="Simple et précis, tout est bien saisi."
                  delay={150}
                  animateBy="words"
                  direction="top"
                  onAnimationComplete={handleAnimationComplete}
                  className="text-sm font-semibold text-slate-900 dark:text-slate-50 mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <Card className="border border-transparent bg-white dark:bg-slate-950 shadow-lg">
          <CardContent className="pt-6">
            {!showLoginForm ? (
              // Initial buttons

              <div className="flex justify-between gap-4">
                <Button
                  onClick={handleGuestVisit}
                  variant="outline"
                  className="flex-1 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 bg-transparent"
                >
                  Visiter en tant qu'invité
                </Button>
                <Button
                  onClick={() => setShowLoginForm(true)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Se connecter
                </Button>
              </div>
            ) : (
              // Login form
              <div className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-700 dark:text-slate-300"
                    >
                      Adresse e-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 dark:text-slate-300"
                    >
                      Mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-slate-200 dark:border-slate-800 focus:border-slate-400 dark:focus:border-slate-600 pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
                  >
                    Connexion
                  </Button>
                </form>

                {/* Social login section */}
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-slate-950 px-2 text-slate-500 dark:text-slate-400">
                        Ou se connecter avec
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 bg-transparent"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Connexion avec Google
                    </Button>
                    <Button
                      onClick={handleFacebookLogin}
                      variant="outline"
                      className="w-full border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 bg-transparent"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Connexion avec Facebook
                    </Button>
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="text-center">
                  <button
                    onClick={handleForgotPassword}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline underline-offset-4"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Back button */}
                <div className="text-center pt-4">
                  <Button
                    onClick={() => setShowLoginForm(false)}
                    variant="ghost"
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    ← Retour
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
