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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { UsersIcon, Pencil, Trash2, PlusCircle, X, Mail, Phone, Calendar } from 'lucide-react';

const clientFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().min(6, { message: "Phone number is required." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
  role: z.string().default("client")
});

interface Client {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  createdAt: Date;
}

const ClientsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all users with role client
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const res = await fetch('/api/auth/users?role=client', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch clients');
      }
      return res.json();
    },
    retry: 1,
  });

  // Add client mutation
  const addClientMutation = useMutation({
    mutationFn: (data: z.infer<typeof clientFormSchema>) => {
      return apiRequest('POST', '/api/auth/register', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Client added successfully",
      });
      addForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: (data: { id: number; clientData: Partial<z.infer<typeof clientFormSchema>> }) => {
      return apiRequest('PUT', `/api/auth/users/${data.id}`, data.clientData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
      editForm.reset();
      setEditingClient(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest('DELETE', `/api/auth/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
      setEditingClient(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form for adding a new client
  const addForm = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "client"
    }
  });

  // Form for editing a client
  const editForm = useForm<z.infer<typeof clientFormSchema>>({
    resolver: zodResolver(clientFormSchema.omit({ password: true })),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      role: "client"
    }
  });

  // Handle opening the edit dialog and setting form values
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    editForm.reset({
      name: client.name,
      email: client.email,
      phoneNumber: client.phoneNumber || "",
      role: client.role
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteClient = (client: Client) => {
    setEditingClient(client);
    setIsDeleteDialogOpen(true);
  };

  // Submit handlers for the forms
  const onAddClient = (data: z.infer<typeof clientFormSchema>) => {
    addClientMutation.mutate(data);
  };

  const onUpdateClient = (data: z.infer<typeof clientFormSchema>) => {
    if (editingClient) {
      // Remove password if empty
      const clientData = { ...data };
      if (!clientData.password) {
        delete clientData.password;
      }
      
      updateClientMutation.mutate({ id: editingClient.id, clientData });
    }
  };

  const onDeleteClient = () => {
    if (editingClient) {
      deleteClientMutation.mutate(editingClient.id);
    }
  };

  const clients = clientsData?.users || [];

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
              <h1 className="text-2xl font-bold text-white">Clients</h1>
              <p className="text-gray-400">Manage your salon client accounts</p>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {isLoadingClients ? (
              // Loading skeletons
              Array(6).fill(0).map((_, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <Skeleton className="h-12 w-12 rounded-full bg-gray-700" />
                      <div className="ml-3">
                        <Skeleton className="h-5 w-32 bg-gray-700" />
                        <Skeleton className="h-4 w-24 bg-gray-700 mt-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 bg-gray-700 mr-2" />
                      <Skeleton className="h-4 w-40 bg-gray-700" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 bg-gray-700 mr-2" />
                      <Skeleton className="h-4 w-32 bg-gray-700" />
                    </div>
                    <div className="flex items-center">
                      <Skeleton className="h-4 w-4 bg-gray-700 mr-2" />
                      <Skeleton className="h-4 w-28 bg-gray-700" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-10 w-20 bg-gray-700" />
                    <Skeleton className="h-10 w-20 bg-gray-700" />
                  </CardFooter>
                </Card>
              ))
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <Card key={client.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-700">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${client.name.replace(/\s+/g, '+')}&background=3B82F6&color=fff`} 
                          alt={client.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div className="ml-3">
                        <CardTitle className="text-white">{client.name}</CardTitle>
                        <p className="text-sm text-gray-400">Client</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {client.email}
                    </div>
                    {client.phoneNumber && (
                      <div className="flex items-center text-sm text-gray-300">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {client.phoneNumber}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Joined: {formatDate(client.createdAt.toString())}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => handleEditClient(client)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteClient(client)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                <UsersIcon className="h-16 w-16 mb-4 opacity-30" />
                <h3 className="text-xl font-medium mb-2">No clients found</h3>
                <p className="text-center max-w-md">
                  There are no clients registered yet. Add your first client to get started.
                </p>
                <Button 
                  className="mt-6 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </div>
            )}
          </div>
          
          {/* Add Client Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details below to create a new client account.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(onAddClient)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            className="bg-gray-700 border-gray-600 text-white" 
                            placeholder="John Doe" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input 
                            className="bg-gray-700 border-gray-600 text-white" 
                            placeholder="client@example.com" 
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
                  
                  <FormField
                    control={addForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Password</FormLabel>
                        <FormControl>
                          <Input 
                            className="bg-gray-700 border-gray-600 text-white" 
                            placeholder="Minimum 6 characters" 
                            type="password" 
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
                      disabled={addClientMutation.isPending}
                    >
                      {addClientMutation.isPending ? "Adding..." : "Add Client"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Client Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-gray-800 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Edit Client</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Update client information for {editingClient?.name}.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onUpdateClient)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Full Name</FormLabel>
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
                      disabled={updateClientMutation.isPending}
                    >
                      {updateClientMutation.isPending ? "Updating..." : "Update Client"}
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
                  Are you sure you want to delete {editingClient?.name}'s account? This action cannot be undone.
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
                  onClick={onDeleteClient}
                  disabled={deleteClientMutation.isPending}
                >
                  {deleteClientMutation.isPending ? "Deleting..." : "Delete Client"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default requireAdmin(ClientsPage);
