"use client";
import type React from "react";
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
import {
  Upload,
  Search,
  RotateCcw,
  Plus,
  CalendarIcon,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  X,
  Download,
  FileText,
  BookOpen,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";

// Mock data for editorials
const mockEditorials = [
  {
    id: 1,
    title: "The Future of Digital Art",
    category: "Analysis",
    file_url: "/magazine/Attitude is Everything by Jeff Keller.pdf",
    cover_image_url:
      "/magazine/favicon.png?height=300&width=200&text=Digital+Art+Editorial",
    size_mb: 2.4,
    status: "Published",
    date: "2024-03-15",
  },
  {
    id: 2,
    title: "Interview with Renowned Poet",
    category: "Interview",
    file_url: "/placeholder.pdf",
    cover_image_url:
      "/placeholder.svg?height=400&width=300&text=Poetry+Interview",
    size_mb: 1.8,
    status: "Published",
    date: "2024-03-10",
  },
  {
    id: 3,
    title: "Campus Literature Scene",
    category: "Opinion",
    file_url: "/placeholder.pdf",
    cover_image_url:
      "/placeholder.svg?height=400&width=300&text=Campus+Literature",
    size_mb: 2.1,
    status: "Draft",
    date: "2024-03-05",
  },
  {
    id: 4,
    title: "Modern Poetry Trends",
    category: "Analysis",
    file_url: "/placeholder.pdf",
    cover_image_url: "/placeholder.svg?height=400&width=300&text=Poetry+Trends",
    size_mb: 3.2,
    status: "Published",
    date: "2024-02-28",
  },
  {
    id: 5,
    title: "Student Voice: Creative Writing",
    category: "Opinion",
    file_url: "/placeholder.pdf",
    cover_image_url:
      "/placeholder.svg?height=400&width=300&text=Creative+Writing",
    size_mb: 1.5,
    status: "Published",
    date: "2024-02-20",
  },
  {
    id: 6,
    title: "Literary Festival Review",
    category: "Review",
    file_url: "/placeholder.pdf",
    cover_image_url:
      "/placeholder.svg?height=400&width=300&text=Festival+Review",
    size_mb: 2.8,
    status: "Draft",
    date: "2024-02-15",
  },
];

const categories = [
  "All",
  "Analysis",
  "Interview",
  "Opinion",
  "Review",
  "News",
  "Feature",
  "Commentary",
];

const statusOptions = ["All", "Published", "Draft"];

interface EditorialData {
  id: number;
  title: string;
  category: string;
  file_url: string;
  cover_image_url: string;
  size_mb: number;
  status: string;
  date: string;
}

const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["Published", "Draft"]),
  cover: z
    .any()
    .refine((file) => file instanceof File, "Cover image is required"),
  pdf: z.any().refine((file) => file instanceof File, "PDF file is required"),
});

const editSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["Published", "Draft"]),
  cover: z.any().optional(),
  pdf: z.any().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;
type EditFormData = z.infer<typeof editSchema>;

export default function EditorialManagement() {
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [editorials, setEditorials] = useState<EditorialData[]>(mockEditorials);
  const [filteredEditorials, setFilteredEditorials] =
    useState<EditorialData[]>(mockEditorials);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewEditorial, setPreviewEditorial] =
    useState<EditorialData | null>(null);
  const [editingEditorial, setEditingEditorial] =
    useState<EditorialData | null>(null);
  const [deleteEditorialId, setDeleteEditorialId] = useState<number | null>(
    null
  );
  const [dragActive, setDragActive] = useState(false);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // React Hook Form setup
  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      category: "Analysis",
      status: "Draft",
    },
  });

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      category: "Analysis",
      status: "Draft",
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setEditorials(mockEditorials);
      setFilteredEditorials(mockEditorials);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Calculate statistics
  const stats = {
    total: editorials.length,
    published: editorials.filter((e) => e.status === "Published").length,
    drafts: editorials.filter((e) => e.status === "Draft").length,
    categories: new Set(editorials.map((e) => e.category)).size,
  };

  // Handle search and filtering
  const handleSearch = useCallback(() => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = editorials;

      if (searchTitle.trim()) {
        filtered = filtered.filter((editorial) =>
          editorial.title.toLowerCase().includes(searchTitle.toLowerCase())
        );
      }

      if (selectedCategory !== "All") {
        filtered = filtered.filter(
          (editorial) => editorial.category === selectedCategory
        );
      }

      if (selectedStatus !== "All") {
        filtered = filtered.filter(
          (editorial) => editorial.status === selectedStatus
        );
      }

      if (dateRange?.from && dateRange?.to) {
        filtered = filtered.filter((editorial) => {
          const editorialDate = new Date(editorial.date);
          return (
            editorialDate >= dateRange.from! && editorialDate <= dateRange.to!
          );
        });
      }

      setFilteredEditorials(filtered);
      setIsLoading(false);
    }, 800);
  }, [searchTitle, selectedCategory, selectedStatus, dateRange, editorials]);

  // Handle reset filters
  const handleReset = () => {
    setIsLoading(true);

    setTimeout(() => {
      setSearchTitle("");
      setSelectedCategory("All");
      setSelectedStatus("All");
      setDateRange(undefined);
      setFilteredEditorials(editorials);
      setIsLoading(false);
    }, 1500);
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, fileType: "cover" | "pdf", isEdit = false) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const form = isEdit ? editForm : uploadForm;

        if (fileType === "cover" && file.type.startsWith("image/")) {
          form.setValue("cover", file);
          if (isEdit) {
            setEditCoverPreview(URL.createObjectURL(file));
          }
        } else if (fileType === "pdf" && file.type === "application/pdf") {
          form.setValue("pdf", file);
        }
      }
    },
    [editForm, uploadForm]
  );

  // Handle file input change
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "cover" | "pdf",
    isEdit = false
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const form = isEdit ? editForm : uploadForm;
      form.setValue(fileType, file);

      if (fileType === "cover" && isEdit) {
        setEditCoverPreview(URL.createObjectURL(file));
      }
    }
  };

  // Handle upload save
  const handleUploadSave = (data: UploadFormData) => {
    const newEditorial: EditorialData = {
      id: Date.now(),
      title: data.title,
      category: data.category,
      status: data.status,
      file_url: URL.createObjectURL(data.pdf),
      cover_image_url: URL.createObjectURL(data.cover),
      size_mb: Number.parseFloat((Math.random() * 5 + 1).toFixed(1)),
      date: new Date().toISOString().split("T")[0],
    };

    setEditorials((prev) => [newEditorial, ...prev]);
    setFilteredEditorials((prev) => [newEditorial, ...prev]);
    uploadForm.reset();
    setIsUploadOpen(false);
  };

  // Handle upload cancel
  const handleUploadCancel = () => {
    uploadForm.reset();
    setIsUploadOpen(false);
  };

  // Handle edit open
  const handleEditOpen = (editorial: EditorialData) => {
    setEditingEditorial(editorial);
    setEditCoverPreview(null);
    editForm.reset({
      title: editorial.title,
      category: editorial.category,
      status: editorial.status as "Published" | "Draft",
    });
    setIsEditOpen(true);
  };

  // Handle edit save
  const handleEditSave = (data: EditFormData) => {
    if (!editingEditorial) return;

    const updatedEditorial: EditorialData = {
      ...editingEditorial,
      title: data.title,
      category: data.category,
      status: data.status,
      cover_image_url: editCoverPreview || editingEditorial.cover_image_url,
      file_url: data.pdf
        ? URL.createObjectURL(data.pdf)
        : editingEditorial.file_url,
      size_mb: data.pdf
        ? Number.parseFloat((data.pdf.size / (1024 * 1024)).toFixed(1))
        : editingEditorial.size_mb,
    };

    setEditorials((prev) =>
      prev.map((editorial) =>
        editorial.id === editingEditorial.id ? updatedEditorial : editorial
      )
    );
    setFilteredEditorials((prev) =>
      prev.map((editorial) =>
        editorial.id === editingEditorial.id ? updatedEditorial : editorial
      )
    );

    editForm.reset();
    setEditingEditorial(null);
    setEditCoverPreview(null);
    setIsEditOpen(false);
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    editForm.reset();
    setEditingEditorial(null);
    setEditCoverPreview(null);
    setIsEditOpen(false);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    setEditorials((prev) => prev.filter((editorial) => editorial.id !== id));
    setFilteredEditorials((prev) =>
      prev.filter((editorial) => editorial.id !== id)
    );
    setDeleteEditorialId(null);
  };

  // PDF viewer functions
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const isFilterActive = useCallback(() => {
    return (
      searchTitle.trim() !== "" ||
      selectedCategory !== "All" ||
      selectedStatus !== "All" ||
      (dateRange?.from && dateRange?.to)
    );
  }, [searchTitle, selectedCategory, selectedStatus, dateRange]);

  // Render file upload area
  const renderFileUploadArea = (
    fileType: "cover" | "pdf",
    isEdit = false,
    currentFile?: string
  ) => {
    const accept = fileType === "cover" ? "image/*" : "application/pdf";
    const label = fileType === "cover" ? "Cover Image" : "PDF File";
    const icon = fileType === "cover" ? Upload : FileText;
    const IconComponent = icon;

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">{label}</Label>
        {isEdit && currentFile && fileType === "cover" && (
          <div className="relative aspect-[3/4] w-32 bg-gray-100 rounded-lg overflow-hidden group">
            <img
              src={editCoverPreview || currentFile}
              alt="Current cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() =>
                setEditCoverPreview("/placeholder.svg?height=400&width=300")
              }
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={(e) => handleDrop(e, fileType, isEdit)}
        >
          <IconComponent className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Drag and drop {fileType === "cover" ? "an image" : "a PDF"} here, or
            click to select
          </p>
          <input
            type="file"
            accept={accept}
            onChange={(e) => handleFileChange(e, fileType, isEdit)}
            className="hidden"
            id={`${fileType}-upload-${isEdit ? "edit" : "new"}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-md bg-transparent"
            onClick={() =>
              document
                .getElementById(`${fileType}-upload-${isEdit ? "edit" : "new"}`)
                ?.click()
            }
          >
            Choose File
          </Button>
        </div>
      </div>
    );
  };

  // Render upload form
  const renderUploadForm = () => (
    <Form {...uploadForm}>
      <form
        onSubmit={uploadForm.handleSubmit(handleUploadSave)}
        className="space-y-4 mx-4"
      >
        {/* Title */}
        <FormField
          control={uploadForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Editorial Title </FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., The Future of Digital Art"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={uploadForm.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="min-w-full w-auto">
                  {categories
                    .filter((cat) => cat !== "All")
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={uploadForm.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="w-full">
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cover Image Upload */}
        <FormField
          control={uploadForm.control}
          name="cover"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload cover image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "cover", false)}
                    className="hidden"
                    id="cover-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("cover-upload")?.click()
                    }
                  >
                    Choose Image
                  </Button>
                  {field.value && (
                    <p className="text-xs text-green-600 mt-2">
                      Selected: {field.value.name}
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PDF Upload */}
        <FormField
          control={uploadForm.control}
          name="pdf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PDF File </FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload PDF file</p>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => handleFileChange(e, "pdf", false)}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("pdf-upload")?.click()
                    }
                  >
                    Choose PDF
                  </Button>
                  {field.value && (
                    <p className="text-xs text-green-600 mt-2">
                      Selected: {field.value.name}
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 mb-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Upload Editorial
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadCancel}
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
        {/* Current Cover Preview */}
        {/* {editingEditorial && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Cover</Label>
            <div className="relative aspect-[3/4] w-32 bg-gray-100 rounded-lg overflow-hidden group">
              <img
                src={editCoverPreview || editingEditorial.cover_image_url}
                alt={editingEditorial.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() =>
                  setEditCoverPreview("/placeholder.svg?height=400&width=300")
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )} */}

        {/* New Cover Upload */}
        <FormField
          control={editForm.control}
          name="cover"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div>
                  {renderFileUploadArea(
                    "cover",
                    true,
                    editingEditorial?.cover_image_url
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New PDF Upload */}
        <FormField
          control={editForm.control}
          name="pdf"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div>{renderFileUploadArea("pdf", true)}</div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={editForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter editorial title"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={editForm.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    {categories
                      .filter((cat) => cat !== "All")
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full">
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
          >
            Update Editorial
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
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Editorial Management</h1>
          <p className="text-gray-400">Upload and manage editorial content</p>
        </div>
        {/* Upload Editorial Sheet Sidebar */}
        <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer">
              <Plus className="h-4 w-4" />
              Upload Editorial
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-x-hidden overflow-y-auto">
            <SheetHeader className="text-left pb-3">
              <SheetTitle className="text-xl font-semibold">
                Upload New Editorial
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Add a new editorial to the collection
              </SheetDescription>
            </SheetHeader>
            <div className="px-1">{renderUploadForm()}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
            <CardDescription className="text-gray-400">
              Total Editorials
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bo">
              {stats.published}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Published
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">{stats.drafts}</CardTitle>
            <CardDescription className="text-gray-400">Drafts</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {stats.categories}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Categories
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* All Editorials Section */}

      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search-title" className="text-sm font-medium">
              Search by Title
            </Label>
            <Input
              id="search-title"
              placeholder="Enter editorial title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="w-full sm:w-48">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-64">
            <Label className="text-sm font-medium">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full mt-1 justify-start text-left font-normal  hover:bg-gray-100"
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
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700  cursor-pointer"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>

          <Button
            variant="outline"
            disabled={!isFilterActive()}
            onClick={handleReset}
            className="flex-1 sm:flex-none bg-transparent cursor-pointer border-gray-500"
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

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Editorials</h2>
        <p className="text-sm text-muted-foreground">
          Manage your editorial collection
        </p>
      </div>

      {/* Editorial Content */}
      {viewMode === "table" ? (
        // Table View
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className=" hover:bg-gray-100">
                <TableHead className="w-2 text-gray-700">Cover</TableHead>
                <TableHead className="text-gray-700">Title</TableHead>
                <TableHead className="text-gray-700">Category</TableHead>
                <TableHead className="text-gray-700">Date</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
                <TableHead className="text-gray-700">Size</TableHead>
                <TableHead className="w-32 text-gray-700 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-gray-300">
                    <TableCell>
                      <Skeleton className="h-16 w-12 bg-gray-300 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 bg-gray-300 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 bg-gray-300 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-gray-300 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 bg-gray-300 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 bg-gray-300 animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 bg-gray-300 animate-pulse" />
                        <Skeleton className="h-8 w-8 bg-gray-300 animate-pulse" />
                        <Skeleton className="h-8 w-8  bg-gray-300 animate-pulse" />
                        <Skeleton className="h-8 w-8 bg-gray-300 animate-pulse" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredEditorials.length > 0 ? (
                filteredEditorials.map((editorial) => (
                  <TableRow
                    key={editorial.id}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <TableCell>
                      <div className="aspect-[3/4] w-12 rounded overflow-hidden">
                        <img
                          src={editorial.cover_image_url || "/placeholder.svg"}
                          alt={editorial.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{editorial.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-600 hover:bg-blue-700">
                        {editorial.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(editorial.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          editorial.status === "Published"
                            ? "bg-green-600 hover:bg-green-700"
                            : "hover:bg-gray-300"
                        }
                      >
                        {editorial.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{editorial.size_mb} MB</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                          onClick={() => setPreviewEditorial(editorial)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 cursor-pointer"
                          onClick={() => {
                            // Add download logic here
                            console.log("Download:", editorial.title);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50 cursor-pointer"
                          onClick={() => handleEditOpen(editorial)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={() => setDeleteEditorialId(editorial.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-gray-700">
                  <TableCell colSpan={8} className="text-center py-12">
                    <p className="text-gray-400">
                      No editorials found matching your criteria.
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
              <Card key={index} className="overflow-hidden border-gray-300">
                <Skeleton className="aspect-[3/4] w-full bg-gray-300  animate-pulse" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-3/4  bg-gray-300 animate-pulse" />
                  <Skeleton className="h-3 w-full bg-gray-300  animate-pulse" />
                  <Skeleton className="h-3 w-2/3 bg-gray-300 animate-pulse" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16 bg-gray-300 animate-pulse" />
                    <Skeleton className="h-3 w-20 bg-gray-300  animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredEditorials.length > 0 ? (
            filteredEditorials.map((editorial) => (
              <Card
                key={editorial.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-200 border-gray-300 group cursor-pointer "
                onClick={() => setPreviewEditorial(editorial)}
              >
                <div className="aspect-[3/4]  relative overflow-hidden">
                  <img
                    src={editorial.cover_image_url || "/placeholder.svg"}
                    alt={editorial.title}
                    className="w-auto h-auto object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                  {/* Desktop Actions - Show on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-white/90 hover:bg-white cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewEditorial(editorial);
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOpen(editorial);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteEditorialId(editorial.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Mobile Actions - Always visible */}
                  <div className="absolute top-2 right-2 sm:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-white/90 hover:bg-white cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewEditorial(editorial);
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditOpen(editorial);
                          }}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteEditorialId(editorial.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium line-clamp-1 ">
                    {editorial.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400">
                    {editorial.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Badge
                      className={`text-xs ${
                        editorial.status === "Published"
                          ? "bg-green-600 hover:bg-green-700"
                          : " hover:bg-gray-300"
                      }`}
                    >
                      {editorial.status}
                    </Badge>
                    <div className="text-right">
                      <div className="text-xs">{editorial.size_mb} MB</div>
                      <div className="text-xs">
                        {format(new Date(editorial.date), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">
                No editorials found matching your criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-x-hidden overflow-y-auto">
          <SheetHeader className="text-left pb-6">
            <SheetTitle className="text-xl font-semibold">
              Edit Editorial
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Update editorial details and optionally replace files.
            </SheetDescription>
          </SheetHeader>
          <div className="px-1">{renderEditForm()}</div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteEditorialId !== null}
        onOpenChange={() => setDeleteEditorialId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              editorial from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer hover:bg-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteEditorialId && handleDelete(deleteEditorialId)
              }
              className="bg-red-500 hover:bg-red-700 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog */}
      <Dialog
        open={previewEditorial !== null}
        onOpenChange={() => setPreviewEditorial(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {previewEditorial?.title}
            </DialogTitle>
          </DialogHeader>
          {previewEditorial && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{previewEditorial.category}</span>
                    <span>
                      {format(new Date(previewEditorial.date), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
                <Badge
                  className={
                    previewEditorial.status === "Published"
                      ? "bg-green-600 hover:bg-green-700"
                      : " hover:bg-gray-300"
                  }
                >
                  {previewEditorial.status}
                </Badge>
              </div>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div className="flex justify-between items-center p-4 border-b bg-white">
                  {/* <span className="text-sm font-medium">
                    Page {pageNumber} of {numPages || "?"}
                  </span> */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageNumber(Math.min(numPages || 1, pageNumber + 1))
                      }
                      disabled={pageNumber >= (numPages || 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <div className="flex justify-center p-4 max-h-[60vh] overflow-auto">
                  <Document
                    file={previewEditorial.file_url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">
                            Loading PDF...
                          </p>
                        </div>
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Unable to load PDF preview
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF file may not be available
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      width={Math.min(600, window.innerWidth - 100)}
                      loading={
                        <div className="flex items-center justify-center h-96">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      }
                    />
                  </Document>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
