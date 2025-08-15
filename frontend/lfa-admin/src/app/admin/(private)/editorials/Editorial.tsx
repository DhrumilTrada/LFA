"use client";
import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../../components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Skeleton } from "../../../../components/ui/skeleton";
import { Calendar } from "../../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { Badge } from "../../../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { getEditorials, createEditorial, updateEditorial, deleteEditorial } from "../../../../features/editorial/editorialThunks";
import { Editorial } from "../../../../features/editorial/editorialSlice";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";

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

const statusOptions = [
  { label: "All", value: "All" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

const uploadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["draft", "published", "archived"]),
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be less than 5000 characters"),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  image: z
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
  status: z.enum(["draft", "published", "archived"]),
  excerpt: z
    .string()
    .max(500, "Excerpt must be less than 500 characters")
    .optional(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be less than 5000 characters"),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  image: z.any().optional(),
  pdf: z.any().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;
type EditFormData = z.infer<typeof editSchema>;

export default function EditorialManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { editorials, loading, error } = useSelector((state: RootState) => state.editorial);

  const [searchTitle, setSearchTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filteredEditorials, setFilteredEditorials] = useState<Editorial[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewEditorial, setPreviewEditorial] = useState<Editorial | null>(null);
  const [editingEditorial, setEditingEditorial] = useState<Editorial | null>(null);
  const [deleteEditorialId, setDeleteEditorialId] = useState<string | null>(null);
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
      status: "draft",
      excerpt: "",
      content: "",
      tags: [],
      featured: false,
    },
  });

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      category: "Analysis",
      status: "draft",
      excerpt: "",
      content: "",
      tags: [],
      featured: false,
    },
  });

  useEffect(() => {
    dispatch(getEditorials({}));
  }, [dispatch]);

  useEffect(() => {
    setFilteredEditorials(editorials);
  }, [editorials]);

  // Calculate statistics
  const stats = {
    total: editorials.length,
    published: editorials.filter((e) => e.status === "published").length,
    drafts: editorials.filter((e) => e.status === "draft").length,
    categories: new Set(editorials.map((e) => e.category)).size,
  };

  // Helper function to get status display name and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "published":
        return { label: "Published", color: "bg-green-100 text-green-800" };
      case "draft":
        return { label: "Draft", color: "bg-yellow-100 text-yellow-800" };
      case "archived":
        return { label: "Archived", color: "bg-gray-100 text-gray-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  // Handle search and filtering
  const handleSearch = useCallback(() => {
    let filtered = editorials;

    if (searchTitle.trim()) {
      filtered = filtered.filter((editorial) =>
        editorial.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
        editorial.category.toLowerCase().includes(searchTitle.toLowerCase()) ||
        editorial.content.toLowerCase().includes(searchTitle.toLowerCase())
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
        const editorialDate = new Date(editorial.createdAt || editorial.uploadedAt || '');
        return (
          editorialDate >= dateRange.from! && editorialDate <= dateRange.to!
        );
      });
    }

    setFilteredEditorials(filtered);
  }, [searchTitle, selectedCategory, selectedStatus, dateRange, editorials]);

  // Handle reset filters
  const handleReset = () => {
    setSearchTitle("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setDateRange(undefined);
    setFilteredEditorials(editorials);
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
    (e: React.DragEvent, fileType: "image" | "pdf", isEdit = false) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        const form = isEdit ? editForm : uploadForm;

        if (fileType === "image" && file.type.startsWith("image/")) {
          form.setValue("image", file);
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
    fileType: "image" | "pdf",
    isEdit = false
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const form = isEdit ? editForm : uploadForm;
      form.setValue(fileType, file);

      if (fileType === "image" && isEdit) {
        setEditCoverPreview(URL.createObjectURL(file));
      }
    }
  };

  // Handle upload save
  const handleUploadSave = async (data: UploadFormData) => {
    const editorialData = {
      title: data.title,
      category: data.category,
      status: data.status,
      excerpt: data.excerpt || "",
      content: data.content,
      tags: data.tags || [],
      featured: data.featured || false,
      image: data.image,
      pdf: data.pdf,
    };

    const result = await dispatch(createEditorial(editorialData));
    if (createEditorial.fulfilled.match(result)) {
      uploadForm.reset();
      setIsUploadOpen(false);
      // Refresh editorials after successful creation
      dispatch(getEditorials({}));
    }
  };

  // Handle upload cancel
  const handleUploadCancel = () => {
    uploadForm.reset();
    setIsUploadOpen(false);
  };

  // Handle edit open
  const handleEditOpen = (editorial: Editorial) => {
    setEditingEditorial(editorial);
    setEditCoverPreview(null);
    editForm.reset({
      title: editorial.title,
      category: editorial.category,
      status: editorial.status,
      excerpt: editorial.excerpt || "",
      content: editorial.content,
      tags: editorial.tags || [],
      featured: editorial.featured || false,
    });
    setIsEditOpen(true);
  };

  // Handle edit save
  const handleEditSave = async (data: EditFormData) => {
    if (!editingEditorial) return;

    const updateData: any = {
      title: data.title,
      category: data.category,
      status: data.status,
      excerpt: data.excerpt,
      content: data.content,
      tags: data.tags,
      featured: data.featured,
    };

    if (data.image) {
      updateData.image = data.image;
    }
    if (data.pdf) {
      updateData.pdf = data.pdf;
    }

    const result = await dispatch(updateEditorial({
      id: editingEditorial._id || editingEditorial.id || "",
      data: updateData
    }));

    if (updateEditorial.fulfilled.match(result)) {
      editForm.reset();
      setEditingEditorial(null);
      setEditCoverPreview(null);
      setIsEditOpen(false);
      // Refresh editorials after successful update
      dispatch(getEditorials({}));
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    editForm.reset();
    setEditingEditorial(null);
    setEditCoverPreview(null);
    setIsEditOpen(false);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    const result = await dispatch(deleteEditorial(id));
    if (deleteEditorial.fulfilled.match(result)) {
      setDeleteEditorialId(null);
      // Refresh editorials after successful deletion
      dispatch(getEditorials({}));
    }
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

  // Render file upload area with conditional hiding
  const renderFileUploadArea = (
    fileType: "image" | "pdf",
    isEdit = false,
    currentFile?: string
  ) => {
    // Determine the other file type
    const otherType = fileType === "image" ? "pdf" : "image";
    // Get the form instance
    const form = isEdit ? editForm : uploadForm;
    // If the other file is selected, hide this input
    if (form.getValues()[otherType] instanceof File) {
      return null;
    }

    const accept = fileType === "image" ? "image/*" : "application/pdf";
    const label = fileType === "image" ? "Cover Image" : "PDF File";
    const icon = fileType === "image" ? Upload : FileText;
    const IconComponent = icon;

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">{label}</Label>
        {isEdit && currentFile && fileType === "image" && (
          <div className="relative aspect-[3/4] w-32 bg-gray-100 rounded-lg overflow-hidden group">
            <img
              src={editCoverPreview || `${process.env.NEXT_PUBLIC_API_BASE_URL}${currentFile}`}
              alt="Current cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/file.svg?height=400&width=300";
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() =>
                setEditCoverPreview("/file.svg?height=400&width=300")
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
            Drag and drop {fileType === "image" ? "an image" : "a PDF"} here, or
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
        className="space-y-4"
      >
        {/* Title */}
        <FormField
          control={uploadForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Editorial Title *</FormLabel>
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
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Excerpt */}
        <FormField
          control={uploadForm.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description or excerpt (optional)"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={uploadForm.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the full editorial content"
                  {...field}
                  rows={6}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cover Image Upload */}
        <FormField
          control={uploadForm.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div>{renderFileUploadArea("image", false)}</div>
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
              <FormControl>
                <div>
                  {renderFileUploadArea("pdf", false)}
                  {field.value instanceof File && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">{field.value.name}</span>
                      {" "}- {(field.value.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Editorial"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadCancel}
            className="flex-1 bg-transparent"
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
        {editingEditorial?.image && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Cover</Label>
            <div className="relative aspect-[3/4] w-32 bg-gray-100 rounded-lg overflow-hidden group">
              <img
                src={editCoverPreview || `${process.env.NEXT_PUBLIC_API_BASE_URL}${editingEditorial.image}`}
                alt={editingEditorial.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/file.svg?height=400&width=300";
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() =>
                  setEditCoverPreview("/file.svg?height=400&width=300")
                }
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* New Cover Upload */}
        <FormField
          control={editForm.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div>
                  {renderFileUploadArea(
                    "image",
                    true,
                    editingEditorial?.image
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
                <div>
                  {renderFileUploadArea("pdf", true)}
                  {field.value instanceof File && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">{field.value.name}</span>
                      {" "}- {(field.value.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  )}
                </div>
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
              <FormLabel>Title *</FormLabel>
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
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Excerpt */}
        <FormField
          control={editForm.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description or excerpt (optional)"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={editForm.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the full editorial content"
                  {...field}
                  rows={6}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pb-4">
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Editorial"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleEditCancel}
            className="flex-1 bg-transparent"
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
            <SheetHeader className="text-left pb-6">
              <SheetTitle className="text-xl font-semibold">
                Upload New Editorial
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Add a new editorial to the collection
              </SheetDescription>
            </SheetHeader>
            <div className="px-6">{renderUploadForm()}</div>
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
              <SelectTrigger className="mt-1 ">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
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
              <SelectTrigger className="mt-1 ">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
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
                <TableHead className="w-2">Cover</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index} className="border-gray-300">
                    <TableCell>
                      <Skeleton className="h-16 w-12  animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32  animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24  animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20  animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20  animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16  animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20  animate-pulse" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8  animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredEditorials.length > 0 ? (
                filteredEditorials.map((editorial) => (
                  <TableRow
                    key={editorial._id || editorial.id}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    <TableCell>
                      <div className="aspect-[3/4] w-12  rounded overflow-hidden">
                        <img
                          src={editorial.image ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${editorial.image}` : "/file.svg"}
                          alt={editorial.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/file.svg?height=64&width=48";
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium ">{editorial.title}</p>
                      {editorial.excerpt && (
                        <p className="text-xs text-muted-foreground truncate">
                          {editorial.excerpt}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-600 hover:bg-blue-700">
                        {editorial.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editorial.createdAt ? format(new Date(editorial.createdAt), "MMM dd, yyyy") : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusInfo(editorial.status).color}
                      >
                        {getStatusInfo(editorial.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editorial.size ? `${(editorial.size / 1024 / 1024).toFixed(1)} MB` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 cursor-pointer text-gray-400 hover:bg-gray-200"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setPreviewEditorial(editorial)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              if (editorial.pdf) {
                                const link = document.createElement('a');
                                link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${editorial.pdf}`;
                                link.download = `${editorial.title}.pdf`;
                                link.click();
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditOpen(editorial)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteEditorialId(editorial._id || editorial.id || "")}
                            className="cursor-pointer"
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
            {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-gray-300">
                <Skeleton className="aspect-[3/4] w-full  animate-pulse" />
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-3/4  animate-pulse" />
                  <Skeleton className="h-3 w-full  animate-pulse" />
                  <Skeleton className="h-3 w-2/3  animate-pulse" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16  animate-pulse" />
                    <Skeleton className="h-3 w-20  animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredEditorials.length > 0 ? (
            filteredEditorials.map((editorial) => (
              <Card
                key={editorial._id || editorial.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-200 border-gray-300 group cursor-pointer "
                onClick={() => setPreviewEditorial(editorial)}
              >
                <div className="aspect-[3/4]  relative overflow-hidden">
                  <img
                    src={editorial.image ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${editorial.image}` : "/file.svg"}
                    alt={editorial.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.currentTarget.src = "/file.svg?height=400&width=300";
                    }}
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
                            if (editorial.pdf) {
                              const link = document.createElement('a');
                              link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${editorial.pdf}`;
                              link.download = `${editorial.title}.pdf`;
                              link.click();
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
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
                            setDeleteEditorialId(editorial._id || editorial.id || "");
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
                            if (editorial.pdf) {
                              const link = document.createElement('a');
                              link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${editorial.pdf}`;
                              link.download = `${editorial.title}.pdf`;
                              link.click();
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
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
                            setDeleteEditorialId(editorial._id || editorial.id || "");
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
                      className={`text-xs ${getStatusInfo(editorial.status).color}`}
                    >
                      {getStatusInfo(editorial.status).label}
                    </Badge>
                    <div className="text-right">
                      <div className="text-xs">
                        {editorial.size ? `${(editorial.size / 1024 / 1024).toFixed(1)} MB` : "N/A"}
                      </div>
                      <div className="text-xs">
                        {editorial.createdAt ? format(new Date(editorial.createdAt), "MMM dd, yyyy") : "N/A"}
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
                  {previewEditorial.excerpt && (
                    <p className="text-sm text-muted-foreground">{previewEditorial.excerpt}</p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{previewEditorial.category}</span>
                    <span>
                      {previewEditorial.createdAt ? format(new Date(previewEditorial.createdAt), "MMM dd, yyyy") : "N/A"}
                    </span>
                  </div>
                </div>
                <Badge
                  className={getStatusInfo(previewEditorial.status).color}
                >
                  {getStatusInfo(previewEditorial.status).label}
                </Badge>
              </div>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <div className="flex justify-between items-center p-4 border-b bg-white">
                  <span className="text-sm font-medium">
                    Page {pageNumber} of {numPages || "?"}
                  </span>
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
                    file={previewEditorial.pdf ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${previewEditorial.pdf}` : null}
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
