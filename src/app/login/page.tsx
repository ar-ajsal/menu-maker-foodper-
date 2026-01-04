
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Coffee, CheckCircle, Mail, Lock, Star, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const authSchema = z.object({
    username: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof authSchema>>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof authSchema>) => {
        setIsSubmitting(true);
        try {
            if (isLogin) {
                // NextAuth Login
                const res = await signIn("credentials", {
                    redirect: false,
                    username: data.username,
                    password: data.password,
                });

                if (res?.error) {
                    throw new Error("Invalid credentials");
                }

                toast({
                    title: "Logged in",
                    description: "Welcome back!",
                });

                router.push("/dashboard");
                router.refresh(); // Ensure session is updated
            } else {
                // Custom Register (creates user in DB)
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || "Registration failed");
                }

                // Auto login after register
                await signIn("credentials", {
                    redirect: false,
                    username: data.username,
                    password: data.password,
                });

                toast({
                    title: "Account created",
                    description: "Welcome to QR Menu!",
                });

                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: (error as Error).message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Visual Side */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 font-serif font-bold text-2xl">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Coffee className="w-6 h-6" />
                        </div>
                        Menu Maker
                    </div>
                </div>

                <div className="relative z-10 space-y-8 max-w-lg">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-serif font-bold tracking-tight leading-tight">
                            The digital menu platform for modern cafes.
                        </h1>
                        <p className="text-lg text-primary-foreground/80 font-light">
                            Join thousands of cafe owners who are saving printing costs and increasing average order value with dynamic QR menus.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-accent" />
                            <span>Instant Menu Updates</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-accent" />
                            <span>Smart Offers & Promos</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-accent" />
                            <span>Zero Commission Fees</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                        <div className="flex gap-1 mb-3 text-accent">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                        <p className="italic text-sm leading-relaxed mb-4">
                            "Menu Maker transformed how we handle our rush hours. Updating prices takes seconds, and customers love the photos."
                        </p>
                        <div className="flex items-center gap-3">
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150" alt="Avatar" className="w-10 h-10 rounded-full border-2 border-accent" />
                            <div>
                                <div className="font-semibold text-sm">Sarah Jenkins</div>
                                <div className="text-xs text-primary-foreground/60">Owner, The Daily Grind</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Side */}
            <div className="flex items-center justify-center p-6 bg-background">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-serif font-bold">
                            {isLogin ? "Welcome back" : "Start your free trial"}
                        </h2>
                        <p className="text-muted-foreground">
                            {isLogin
                                ? "Enter your details to access your dashboard."
                                : "No credit card required for trial."}
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    placeholder="name@company.com"
                                                    type="email"
                                                    disabled={isSubmitting}
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    placeholder="••••••••"
                                                    type="password"
                                                    disabled={isSubmitting}
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-11 text-base mt-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isLogin ? "Sign In" : "Get Started"}
                            </Button>
                        </form>
                    </Form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <div className="text-center text-sm">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-primary hover:underline underline-offset-4"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
