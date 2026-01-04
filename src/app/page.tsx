
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChefHat, Smartphone, Zap } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif font-bold text-xl">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              QR
            </div>
            Menu
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 lg:py-32 overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground leading-[1.1]">
              The Modern Menu for <span className="text-indigo-600">Modern Cafes</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Ditch the PDF. Create a beautiful, mobile-first digital menu for your cafe in minutes.
              Increase orders with a stunning visual experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base rounded-full shadow-lg hover:shadow-xl transition-all bg-indigo-600 hover:bg-indigo-700">
                  Create Your Menu <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base rounded-full">
                View Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100 rounded-full blur-3xl -z-10 opacity-50" />
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border/50">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif mb-3">Mobile First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Designed specifically for smartphones. Fast, responsive, and easy to navigate for your customers.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border/50">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif mb-3">Easy Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Update prices, add items, and hide out-of-stock dishes instantly from your dashboard.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl shadow-sm border border-border/50">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-serif mb-3">Instant QR Codes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate and print QR codes for your tables immediately after setting up your menu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 QR Menu SaaS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
