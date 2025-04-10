import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { requireAdmin } from '@/lib/auth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Star, Pencil, Trash2, PlusCircle, Check, X } from 'lucide-react';

const stylistFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  title: z.string().min(2, { message: "Title is required." }),
  bio: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().min(6, { message: "Phone number is required." }),
  rating: z.string().optional(),
  services: z.array(z.string()).optional(),
  isActive: z.boolean().default(true)
});

interface Stylist {
  id: number;
  name: string;
  title: string;
  bio?: string;
  image?: string;
  email: string;
  phoneNumber?: string;
  rating: string;
  isActive: boolean;
}

interface Service {
  id: number;
  name: string;
  price: string;
}

const StylistsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingStylist, setEditingStylist] = useState<Stylist | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch stylists
  const { data: stylistsData, isLoading: isLoadingStylists } = useQuery({
    queryKey: ['/api/stylists'],
    retry: 1,
  });

  // Fetch services for dropdown
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    retry: 1,
  });

  // Add stylist mutation
  const addStylistMutation = useMutation({
    mutationFn: (data: z.infer<typeof stylistFormSchema>) => {
      return apiRequest('POST', '/api/stylists', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stylists'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Stylist added successfully",
      });
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add stylist. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update stylist mutation
  const updateStylistMutation = useMutation({
    mutationFn: (data: { id: number; stylistData: z.infer<typeof stylistFormSchema> }) => {
      return apiRequest('PUT', `/api/stylists/${data.id}`, data.stylistData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stylists'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Stylist updated successfully",
      });
      editForm.reset();
      setEditingStylist(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update stylist. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete stylist mutation
  const deleteStylistMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/stylists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stylists'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Stylist deleted successfully",
      });
      setEditingStylist(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete stylist. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form for adding a new stylist
  const addForm = useForm<z.infer<typeof stylistFormSchema>>({
    resolver: zodResolver(stylistFormSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      email: "",
      phoneNumber: "",
      rating: "5.0",
      services: [],
      isActive: true
    }
  });

  // Form for editing a stylist
  const editForm = useForm<z.infer<typeof stylistFormSchema>>({
    resolver: zodResolver(stylistFormSchema),
    defaultValues: {
      name: "",
      title: "",
      bio: "",
      email: "",
      phoneNumber: "",
      rating: "5.0",
      services: [],
      isActive: true
    }
  });

  // Handle opening the edit dialog and setting form values
  const handleEditStylist = (stylist: Stylist) => {
    setEditingStylist(stylist);
    editForm.reset({
      name: stylist.name,
      title: stylist.title,
      bio: stylist.bio || "",
      email: stylist.email,
      phoneNumber: stylist.phoneNumber || "",
      rating: stylist.rating,
      isActive: stylist.isActive
      // Services would need to be fetched from the stylist-services relationship
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteStylist = (stylist: Stylist) => {
    setEditingStylist(stylist);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers for the forms
  const onAddStylist = (data: z.infer<typeof stylistFormSchema>) => {
    addStylistMutation.mutate(data);
  };

  const onUpdateStylist = (data: z.infer<typeof stylistFormSchema>) => {
    if (editingStylist) {
      updateStylistMutation.mutate({ id: editingStylist.id, stylistData: data });
    }
  };

  const onDeleteStylist = () => {
    if (editingStylist) {
      deleteStylistMutation.mutate(editingStylist.id);
    }
  };

  const stylists = stylistsData?.stylists || [];
  const services = servicesData?.services || [];

  return (
    <div className="min-h-screen flex bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className={`md:hidden fixed inset-0 z-40 bg-gray-800 bg-opacity-90 transition-opacity ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="absolute top-0 right-0 pt-4 pr-4">
          <button
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <TopNav setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Stylists</h1>
              <p className="text-gray-400">Manage your salon stylists and barbers</p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Stylist
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isLoadingStylists ? (
              // Loading skeletons
              Array(3).fill(0).map((_, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
                        <div className="ml-3">
                          <Skeleton className="h-5 w-32 bg-gray-700" />
                          <Skeleton className="h-4 w-24 bg-gray-700 mt-1" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-16 bg-gray-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full bg-gray-700 mt-2" />
                    <Skeleton className="h-4 w-2/3 bg-gray-700 mt-2" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-10 w-20 bg-gray-700" />
                    <Skeleton className="h-10 w-20 bg-gray-700" />
                  </CardFooter>
                </Card>
              ))
            ) : (
              stylists.map((stylist) => (
                <Card key={stylist.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-700">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${stylist.name.replace(/\s+/g, '+')}&background=4E2A84&color=fff`} 
                            alt={stylist.name} 
                            className="h-full w-full object-cover" 
                          />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-white">{stylist.name}</h3>
                          <p className="text-sm text-gray-400">{stylist.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                        <span className="text-sm text-white">{stylist.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 line-clamp-2 mt-2">
                      {stylist.bio || "No bio provided for this stylist."}
                    </p>
                    <div className="flex items-center text-sm text-gray-400 mt-3">
                      <span className="inline-block w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                      {stylist.isActive ? "Active" : "Inactive"}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => handleEditStylist(stylist)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteStylist(stylist)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          
          {/* Add Stylist Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Add New Stylist</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details below to add a new stylist.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddStylist)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Name</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              placeholder="Full Name" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Title</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              placeholder="e.g. Master Barber" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              placeholder="email@example.com" 
                              type="email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              placeholder="+971 12 345 6789" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={addForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="bg-gray-700 border-gray-600 text-white min-h-[100px]" 
                            placeholder="Brief description of the stylist's experience and expertise..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Services</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={(value) => {
                              const values = field.value || [];
                              if (!values.includes(value)) {
                                field.onChange([...values, value]);
                              }
                            }}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select services offered" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600 text-white">
                              {services.map((service) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  {service.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value?.map((serviceId) => {
                            const service = services.find(s => s.id.toString() === serviceId);
                            return service ? (
                              <div key={serviceId} className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
                                {service.name}
                                <button 
                                  type="button"
                                  onClick={() => {
                                    field.onChange(field.value?.filter(id => id !== serviceId));
                                  }}
                                  className="ml-1 text-gray-400 hover:text-white"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsAddDialogOpen(false)}
                      className="text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={addStylistMutation.isPending}
                    >
                      {addStylistMutation.isPending ? "Adding..." : "Add Stylist"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Stylist Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Edit Stylist</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update the details for {editingStylist?.name}.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onUpdateStylist)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Name</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Title</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              type="email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="bg-gray-700 border-gray-600 text-white min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-gray-700 p-3">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-300">Active</FormLabel>
                          <FormDescription className="text-gray-400 text-xs">
                            Inactive stylists won't appear in the booking app
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsEditDialogOpen(false)}
                      className="text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updateStylistMutation.isPending}
                    >
                      {updateStylistMutation.isPending ? "Updating..." : "Update Stylist"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Are you sure you want to delete {editingStylist?.name}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="text-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={onDeleteStylist}
                  disabled={deleteStylistMutation.isPending}
                >
                  {deleteStylistMutation.isPending ? "Deleting..." : "Delete Stylist"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default requireAdmin(StylistsPage);
