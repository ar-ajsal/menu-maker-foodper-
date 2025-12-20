import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coffee, LayoutGrid } from "lucide-react";

// Using a simplified schema for the MVP auth (since we don't have direct registration endpoints in the provided routes, 
// we will assume standard auth flow - this is a UI implementation for the "blueprint" auth)

const authSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  // Redirect to dashboard on login success handled by side effect of useAuth or server redirect usually,
  // but for blueprint auth, we usually just link to the login endpoint or show a form that POSTs.
  // Since we are using Replit Auth (blueprint), we just redirect window.location.

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-primary/5 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 text-center space-y-6 max-w-lg">
          <div className="bg-background w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-xl rotate-3 mb-6">
            <Coffee className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight">Manage your menu with elegance.</h1>
          <p className="text-lg text-muted-foreground">
            Create digital QR menus for your cafe, manage orders, and delight your customers with a modern experience.
          </p>
        </div>
      </div>

      {/* Auth Side */}
      <div className="flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-serif">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your cafe dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button className="w-full h-12 text-base" onClick={handleLogin}>
               Login / Register
             </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
