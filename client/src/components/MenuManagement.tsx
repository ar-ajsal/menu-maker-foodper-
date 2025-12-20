import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertCategorySchema, insertMenuItemSchema } from "@shared/routes";
import { useCategories, useItems, useCreateCategory, useCreateItem, useDeleteItem, useDeleteCategory } from "@/hooks/use-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";

interface MenuManagementProps {
  cafeId: number;
}

export function MenuManagement({ cafeId }: MenuManagementProps) {
  const { data: categories = [] } = useCategories(cafeId);
  const { data: items = [] } = useItems(cafeId);
  
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();

  const [activeTab, setActiveTab] = useState("categories");
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // Category Form
  const categoryForm = useForm({
    resolver: zodResolver(insertCategorySchema.pick({ name: true })),
    defaultValues: { name: "" }
  });

  const onAddCategory = (data: { name: string }) => {
    createCategory.mutate({ cafeId, name: data.name }, {
      onSuccess: () => categoryForm.reset()
    });
  };

  // Item Form
  const itemForm = useForm({
    resolver: zodResolver(insertMenuItemSchema.omit({ cafeId: true })),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: 0,
      isAvailable: true,
      sortOrder: 0
    }
  });

  const onAddItem = (data: any) => {
    createItem.mutate({ cafeId, ...data }, {
      onSuccess: () => {
        setIsAddItemOpen(false);
        itemForm.reset();
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif">Menu Management</h2>
          <p className="text-muted-foreground">Manage your categories and items</p>
        </div>
        
        <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
            </DialogHeader>
            <Form {...itemForm}>
              <form onSubmit={itemForm.handleSubmit(onAddItem)} className="space-y-4">
                <FormField
                  control={itemForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={itemForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(Number(val))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={itemForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={itemForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createItem.isPending}>
                  {createItem.isPending ? "Adding..." : "Add Item"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        {/* Categories Sidebar */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...categoryForm}>
              <form onSubmit={categoryForm.handleSubmit(onAddCategory)} className="flex gap-2">
                <Input placeholder="New Category" {...categoryForm.register("name")} />
                <Button type="submit" size="icon" disabled={createCategory.isPending}>
                  <Plus className="w-4 h-4" />
                </Button>
              </form>
            </Form>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                    activeTab === cat.id.toString() ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  }`}
                >
                  <span>{cat.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteCategory.mutate({ id: cat.id, cafeId })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No categories yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        <div className="space-y-6">
          {categories.map((cat) => {
            const catItems = items.filter(item => item.categoryId === cat.id);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-4">
                <h3 className="text-xl font-serif font-bold">{cat.name}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                  {catItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="flex h-full">
                        <div className="w-24 h-full bg-muted flex items-center justify-center shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => deleteItem.mutate({ id: item.id, cafeId })}
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {item.description || "No description"}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-primary">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground">
              <p>No items found.</p>
              <p className="text-sm">Create a category and add items to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
