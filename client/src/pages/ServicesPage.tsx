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
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { ScissorsIcon, Pencil, Trash2, Clock, PlusCircle, X } from 'lucide-react';

const serviceFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  price: z.string().refine(val => !isNaN(Number(val)), { message: "Price must be a number." }),
  duration: z.string().refine(val => !isNaN(Number(val)), { message: "Duration must be a number." }),
  category: z.string(),
  isActive: z.boolean().default(true)
});

interface Service {
  id: number;
  name: string;
  description?: string;
  price: string;
  duration: number;
  category: string;
  isActive: boolean;
}

const ServicesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch services
  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
    retry: 1,
  });

  // Add service mutation
  const addServiceMutation = useMutation({
    mutationFn: (data: z.infer<typeof serviceFormSchema>) => {
      return apiRequest('POST', '/api/services', {
        ...data,
        price: parseFloat(data.price),
        duration: parseInt(data.duration)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Service added successfully",
      });
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: (data: { id: number; serviceData: z.infer<typeof serviceFormSchema> }) => {
      return apiRequest('PUT', `/api/services/${data.id}`, {
        ...data.serviceData,
        price: parseFloat(data.serviceData.price),
        duration: parseInt(data.serviceData.duration)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      editForm.reset();
      setEditingService(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      setEditingService(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form for adding a new service
  const addForm = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "Hair",
      isActive: true
    }
  });

  // Form for editing a service
  const editForm = useForm<z.infer<typeof serviceFormSchema>>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "Hair",
      isActive: true
    }
  });

  // Handle opening the edit dialog and setting form values
  const handleEditService = (service: Service) => {
    setEditingService(service);
    editForm.reset({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      isActive: service.isActive
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteService = (service: Service) => {
    setEditingService(service);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers for the forms
  const onAddService = (data: z.infer<typeof serviceFormSchema>) => {
    addServiceMutation.mutate(data);
  };

  const onUpdateService = (data: z.infer<typeof serviceFormSchema>) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, serviceData: data });
    }
  };

  const onDeleteService = () => {
    if (editingService) {
      deleteServiceMutation.mutate(editingService.id);
    }
  };

  const services = servicesData?.services || [];

  // Function to get background color based on category
  const getCategoryColor = (category: string) => {
    const colors = {
      'Hair': 'bg-blue-500',
      'Beard': 'bg-green-500',
      'Skincare': 'bg-purple-500',
      'Nails': 'bg-pink-500',
      'Event': 'bg-yellow-500',
      'Other': 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

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
              <h1 className="text-2xl font-bold text-white">Services</h1>
              <p className="text-gray-400">Manage the services offered by your salon</p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isLoadingServices ? (
              // Loading skeletons
              Array(6).fill(0).map((_, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-5 w-32 bg-gray-700" />
                        <Skeleton className="h-4 w-24 bg-gray-700 mt-1" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full bg-gray-700" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full bg-gray-700 mt-2" />
                    <Skeleton className="h-4 w-2/3 bg-gray-700 mt-2" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-6 w-20 bg-gray-700" />
                      <Skeleton className="h-6 w-16 bg-gray-700" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-10 w-20 bg-gray-700" />
                    <Skeleton className="h-10 w-20 bg-gray-700" />
                  </CardFooter>
                </Card>
              ))
            ) : (
              services.map((service) => (
                <Card key={service.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{service.name}</CardTitle>
                        <p className="text-sm text-gray-400">{service.price} AED</p>
                      </div>
                      <span className={`${getCategoryColor(service.category)} text-white text-xs px-2 py-1 rounded-full`}>
                        {service.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-300 line-clamp-2 mt-2">
                      {service.description || "No description provided."}
                    </p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration} minutes
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${service.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {service.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => handleEditService(service)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteService(service)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
          
          {/* Add Service Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details below to add a new service to your salon offerings.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddService)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Service Name</FormLabel>
                        <FormControl>
                          <Input 
                            className="bg-gray-700 border-gray-600 text-white" 
                            placeholder="e.g. Haircut & Styling" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Price (AED)</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              placeholder="200" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addForm.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              className="bg-gray-700 border-gray-600 text-white" 
                              placeholder="45" 
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-700 border-gray-600 text-white">
                            <SelectItem value="Hair">Hair</SelectItem>
                            <SelectItem value="Beard">Beard</SelectItem>
                            <SelectItem value="Skincare">Skincare</SelectItem>
                            <SelectItem value="Nails">Nails</SelectItem>
                            <SelectItem value="Event">Event</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="bg-gray-700 border-gray-600 text-white min-h-[100px]" 
                            placeholder="Detailed description of the service..." 
                            {...field} 
                          />
                        </FormControl>
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
                      disabled={addServiceMutation.isPending}
                    >
                      {addServiceMutation.isPending ? "Adding..." : "Add Service"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Service Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update the details for {editingService?.name}.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onUpdateService)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Service Name</FormLabel>
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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Price (AED)</FormLabel>
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
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Duration (minutes)</FormLabel>
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-700 border-gray-600 text-white">
                            <SelectItem value="Hair">Hair</SelectItem>
                            <SelectItem value="Beard">Beard</SelectItem>
                            <SelectItem value="Skincare">Skincare</SelectItem>
                            <SelectItem value="Nails">Nails</SelectItem>
                            <SelectItem value="Event">Event</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Description</FormLabel>
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
                            Inactive services won't appear in the booking app
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
                      disabled={updateServiceMutation.isPending}
                    >
                      {updateServiceMutation.isPending ? "Updating..." : "Update Service"}
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
                  Are you sure you want to delete the service "{editingService?.name}"? This action cannot be undone.
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
                  onClick={onDeleteService}
                  disabled={deleteServiceMutation.isPending}
                >
                  {deleteServiceMutation.isPending ? "Deleting..." : "Delete Service"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default requireAdmin(ServicesPage);
