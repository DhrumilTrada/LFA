"use client";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  RotateCcw,
  Plus,
  CalendarIcon,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Users,
  UserCheck,
  Shield,
  Crown,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@jlu.ac.in",
    password_hash: "hashed_password_1",
    role: "superadmin",
    status: true,
    created_at: "2023-01-15",
    last_active: "2024-03-15",
    avatar: "/placeholder.svg?height=40&width=40&text=AU",
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@jlu.ac.in",
    password_hash: "hashed_password_2",
    role: "editor",
    status: true,
    created_at: "2023-02-20",
    last_active: "2024-03-14",
    avatar: "/placeholder.svg?height=40&width=40&text=PS",
  },
  {
    id: 3,
    name: "Arjun Patel",
    email: "arjun@jlu.ac.in",
    password_hash: "hashed_password_3",
    role: "editor",
    status: true,
    created_at: "2023-03-10",
    last_active: "2024-03-13",
    avatar: "/placeholder.svg?height=40&width=40&text=AP",
  },
  {
    id: 4,
    name: "Maya Gupta",
    email: "maya@jlu.ac.in",
    password_hash: "hashed_password_4",
    role: "user",
    status: true,
    created_at: "2023-04-05",
    last_active: "2024-03-12",
    avatar: "/placeholder.svg?height=40&width=40&text=MG",
  },
  {
    id: 5,
    name: "Rahul Verma",
    email: "rahul@jlu.ac.in",
    password_hash: "hashed_password_5",
    role: "user",
    status: false,
    created_at: "2023-05-18",
    last_active: "2024-02-28",
    avatar: "/placeholder.svg?height=40&width=40&text=RV",
  },
];

const roles = ["All", "superadmin", "editor", "user"];
const statusOptions = ["All", "Active", "Inactive"];

interface UserData {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: boolean;
  created_at: string;
  last_active: string;
  avatar: string;
}

const addUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["superadmin", "editor", "user"]),
  status: z.boolean(),
});

const editUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["superadmin", "editor", "user"]),
  status: z.boolean(),
});

type AddUserFormData = z.infer<typeof addUserSchema>;
type EditUserFormData = z.infer<typeof editUserSchema>;

export default function UserManagement() {
  const [searchName, setSearchName] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>(mockUsers);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewUser, setViewUser] = useState<UserData | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // React Hook Form setup
  const addForm = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      status: true,
    },
  });

  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      status: true,
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === true).length,
    editors: users.filter((u) => u.role === "editor").length,
    superadmins: users.filter((u) => u.role === "superadmin").length,
  };

  // Handle search and filtering
  const handleSearch = useCallback(() => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = users;

      if (searchName.trim()) {
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(searchName.toLowerCase()) ||
            user.email.toLowerCase().includes(searchName.toLowerCase())
        );
      }

      if (selectedRole !== "All") {
        filtered = filtered.filter((user) => user.role === selectedRole);
      }

      if (selectedStatus !== "All") {
        const isActive = selectedStatus === "Active";
        filtered = filtered.filter((user) => user.status === isActive);
      }

      if (dateRange?.from && dateRange?.to) {
        filtered = filtered.filter((user) => {
          const userDate = new Date(user.created_at);
          return userDate >= dateRange.from! && userDate <= dateRange.to!;
        });
      }

      setFilteredUsers(filtered);
      setIsLoading(false);
    }, 800);
  }, [searchName, selectedRole, selectedStatus, dateRange, users]);

  // Handle reset filters
  const handleReset = () => {
    setIsLoading(true);

    setTimeout(() => {
      setSearchName("");
      setSelectedRole("All");
      setSelectedStatus("All");
      setDateRange(undefined);
      setFilteredUsers(users);
      setIsLoading(false);
    }, 1500);
  };

  // Handle add user save
  const handleAddSave = (data: AddUserFormData) => {
    const newUser: UserData = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      password_hash: `hashed_${data.password}`,
      role: data.role,
      status: data.status,
      created_at: new Date().toISOString().split("T")[0],
      last_active: new Date().toISOString().split("T")[0],
      avatar: `/placeholder.svg?height=40&width=40&text=${data.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()}`,
    };

    setUsers((prev) => [newUser, ...prev]);
    setFilteredUsers((prev) => [newUser, ...prev]);
    addForm.reset();
    setIsAddOpen(false);
  };

  // Handle add cancel
  const handleAddCancel = () => {
    addForm.reset();
    setIsAddOpen(false);
  };

  // Handle edit open
  const handleEditOpen = (user: UserData) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role as "superadmin" | "editor" | "user",
      status: user.status,
    });
    setIsEditOpen(true);
  };

  // Handle edit save
  const handleEditSave = (data: EditUserFormData) => {
    if (!editingUser) return;

    const updatedUser: UserData = {
      ...editingUser,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
    };

    setUsers((prev) =>
      prev.map((user) => (user.id === editingUser.id ? updatedUser : user))
    );
    setFilteredUsers((prev) =>
      prev.map((user) => (user.id === editingUser.id ? updatedUser : user))
    );

    editForm.reset();
    setEditingUser(null);
    setIsEditOpen(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    editForm.reset();
    setEditingUser(null);
    setIsEditOpen(false);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    setFilteredUsers((prev) => prev.filter((user) => user.id !== id));
    setDeleteUserId(null);
  };

  const isFilterActive = useCallback(() => {
    return (
      searchName.trim() !== "" ||
      selectedRole !== "All" ||
      selectedStatus !== "All" ||
      (dateRange?.from && dateRange?.to)
    );
  }, [searchName, selectedRole, selectedStatus, dateRange]);

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-red-600 hover:bg-red-700";
      case "editor":
        return "bg-blue-600 hover:bg-blue-700";
      case "user":
        return "bg-gray-600 hover:bg-gray-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Crown className="h-3 w-3" />;
      case "editor":
        return <Shield className="h-3 w-3" />;
      case "user":
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  // Render add form
  const renderAddForm = () => (
    <Form {...addForm}>
      <form
        onSubmit={addForm.handleSubmit(handleAddSave)}
        className="space-y-4 mx-4"
      >
        {/* Name */}
        <FormField
          control={addForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., John Doe"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={addForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="e.g., john@jlu.ac.in"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={addForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role */}
        <FormField
          control={addForm.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={addForm.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable or disable user account
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Add User
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCancel}
            className="flex-1 bg-transparent cursor-pointer"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );

  // Render edit form
  const renderEditForm = () => (
    <Form {...editForm}>
      <form
        onSubmit={editForm.handleSubmit(handleEditSave)}
        className="space-y-6 mx-4"
      >
        {/* Name */}
        <FormField
          control={editForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter full name"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={editForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role */}
        <FormField
          control={editForm.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={editForm.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable or disable user account
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pb-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Update User
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleEditCancel}
            className="flex-1 hover:bg-gray-300 cursor-pointer bg-transparent"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        {/* Add User Sheet Sidebar */}
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-x-hidden overflow-y-auto">
            <SheetHeader className="text-left pb-3">
              <SheetTitle className="text-xl font-semibold">
                Add New User
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Create a new user account
              </SheetDescription>
            </SheetHeader>
            <div className="px-1">{renderAddForm()}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {stats.total}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Total Users
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {stats.active}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Active Users
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {stats.editors}
            </CardTitle>
            <CardDescription className="text-gray-600">Editors</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">
              {stats.superadmins}
            </CardTitle>
            <CardDescription className="text-gray-600">
              Super Admins
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label
              htmlFor="search-name"
              className="text-sm font-medium text-gray-700"
            >
              Search Users
            </Label>
            <Input
              id="search-name"
              placeholder="Search by name or email..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="mt-1 bg-white border-gray-300 text-gray-900 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="w-full sm:w-48">
            <Label className="text-sm font-medium text-gray-700">Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="mt-1 bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role === "All"
                      ? "All Roles"
                      : role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-1 bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-64">
            <Label className="text-sm font-medium text-gray-700">
              Date Range
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-start text-left font-normal bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleSearch}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
          <Button
            variant="outline"
            disabled={!isFilterActive()}
            onClick={handleReset}
            className="flex-1 sm:flex-none bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <div className="flex gap-2 sm:ml-auto">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="cursor-pointer"
            >
              Table
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="cursor-pointer"
            >
              Grid
            </Button>
          </div>
        </div>
      </div>

      {/* All Users Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
        <p className="text-sm text-gray-600">
          Manage user accounts and permissions
        </p>
      </div>

      {/* User Content */}
      {viewMode === "table" ? (
        // Table View
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-100">
                <TableHead className="text-gray-700">User</TableHead>
                <TableHead className="text-gray-700">Email</TableHead>
                <TableHead className="text-gray-700">Role</TableHead>
                <TableHead className="text-gray-700">Join Date</TableHead>
                <TableHead className="text-gray-700">Last Active</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
                <TableHead className="w-32 text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-gray-200">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                        <Skeleton className="h-4 w-32 bg-gray-200 animate-pulse" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40 bg-gray-200 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 bg-gray-200 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-gray-200 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-gray-200 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 bg-gray-200 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 bg-gray-200 animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-gray-200 text-gray-700">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getRoleBadgeColor(user.role)} text-white`}
                      >
                        <div className="flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {format(new Date(user.last_active), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              user.status ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {user.status ? "Active" : "Inactive"}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setViewUser(user)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditOpen(user)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteUserId(user.id)}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-gray-200">
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-gray-500">
                      No users found matching your criteria.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden border-gray-200 bg-white"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 bg-gray-200 animate-pulse" />
                      <Skeleton className="h-3 w-32 bg-gray-200 animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16 bg-gray-200 animate-pulse" />
                    <Skeleton className="h-5 w-16 bg-gray-200 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 border-gray-200 bg-white group cursor-pointer"
                onClick={() => setViewUser(user)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-700">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium line-clamp-1 text-gray-900">
                        {user.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-600 line-clamp-1">
                        {user.email}
                      </CardDescription>
                    </div>
                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewUser(user);
                            }}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditOpen(user);
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteUserId(user.id);
                            }}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Badge
                      className={`${getRoleBadgeColor(
                        user.role
                      )} text-white text-xs`}
                    >
                      <div className="flex items-center gap-1">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </div>
                    </Badge>
                    <Badge
                      className={
                        user.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            user.status ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {user.status ? "Active" : "Inactive"}
                      </div>
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Joined {format(new Date(user.created_at), "MMM dd, yyyy")}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                No users found matching your criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-x-hidden overflow-y-auto">
          <SheetHeader className="text-left pb-3">
            <SheetTitle className="text-xl font-semibold">Edit User</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Update user details and permissions.
            </SheetDescription>
          </SheetHeader>
          <div className="px-1">{renderEditForm()}</div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteUserId !== null}
        onOpenChange={() => setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDelete(deleteUserId)}
              className="bg-red-500 hover:bg-red-700 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Details Dialog */}
      <Dialog open={viewUser !== null} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={viewUser.avatar || "/placeholder.svg"}
                    alt={viewUser.name}
                  />
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-lg">
                    {viewUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {viewUser.name}
                  </h3>
                  <p className="text-sm text-gray-600">{viewUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Role</Label>
                  <div className="mt-1">
                    <Badge
                      className={`${getRoleBadgeColor(
                        viewUser.role
                      )} text-white`}
                    >
                      <div className="flex items-center gap-1">
                        {getRoleIcon(viewUser.role)}
                        {viewUser.role}
                      </div>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge
                      className={
                        viewUser.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            viewUser.status ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {viewUser.status ? "Active" : "Inactive"}
                      </div>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Join Date</Label>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(viewUser.created_at), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Last Active</Label>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(viewUser.last_active), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
