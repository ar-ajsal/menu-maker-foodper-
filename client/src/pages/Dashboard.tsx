import { useAuth } from "@/hooks/use-auth";
import { useMyCafes } from "@/hooks/use-cafes";
import { CreateCafeDialog } from "@/components/CreateCafeDialog";
import { MenuManagement } from "@/components/MenuManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { LogOut, QrCode, ExternalLink, Settings, LayoutGrid } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data: cafes, isLoading } = useMyCafes();
  const [selectedCafeId, setSelectedCafeId] = useState<string>("");
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-32 bg-muted rounded"></div>
          <div className="h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Handle redirect if not logged in
  if (!user && !isLoading) {
    setLocation("/auth");
    return null;
  }

  // Set default selected cafe
  if (cafes?.length && !selectedCafeId) {
    setSelectedCafeId(cafes[0].id.toString());
  }

  const currentCafe = cafes?.find(c => c.id.toString() === selectedCafeId);
  const menuUrl = currentCafe ? `${window.location.origin}/menu/${currentCafe.slug}` : "";

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary" />
            <h1 className="font-serif text-xl font-bold">QR Menu Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, {user.username}
            </span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {(!cafes || cafes.length === 0) ? (
          <div className="max-w-md mx-auto mt-20 text-center">
            <div className="mb-6 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Cafes Found</h2>
            <p className="text-muted-foreground mb-8">
              Create your first cafe to start managing your menu and QR codes.
            </p>
            <CreateCafeDialog />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cafe Selector & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Select value={selectedCafeId} onValueChange={setSelectedCafeId}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select Cafe" />
                  </SelectTrigger>
                  <SelectContent>
                    {cafes.map((cafe) => (
                      <SelectItem key={cafe.id} value={cafe.id.toString()}>
                        {cafe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateCafeDialog />
              </div>
              
              {currentCafe && (
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href={`/menu/${currentCafe.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Menu
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {currentCafe && (
              <Tabs defaultValue="menu" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="menu">Menu & Categories</TabsTrigger>
                  <TabsTrigger value="qr">QR Code</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="menu" className="animate-fade-in-up">
                  <MenuManagement cafeId={currentCafe.id} />
                </TabsContent>

                <TabsContent value="qr" className="animate-fade-in-up">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your QR Code</CardTitle>
                      <CardDescription>
                        Customers can scan this code to view your digital menu immediately.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6 py-8">
                      <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <QRCodeSVG value={menuUrl} size={256} />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="font-mono text-sm text-muted-foreground bg-muted p-2 rounded">
                          {menuUrl}
                        </p>
                        <Button onClick={() => window.print()}>
                          <QrCode className="w-4 h-4 mr-2" />
                          Print QR Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="animate-fade-in-up">
                  <Card>
                    <CardHeader>
                      <CardTitle>Cafe Settings</CardTitle>
                      <CardDescription>Update your cafe information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-w-md">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Cafe Name</label>
                          <div className="p-3 rounded-md bg-muted text-muted-foreground">
                            {currentCafe.name}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Slug (URL)</label>
                          <div className="p-3 rounded-md bg-muted text-muted-foreground">
                            {currentCafe.slug}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Address</label>
                          <div className="p-3 rounded-md bg-muted text-muted-foreground">
                            {currentCafe.address || "No address set"}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground pt-4">
                          Full settings edit functionality coming in next update.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
