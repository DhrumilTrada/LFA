"use client";
import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  HardDrive,
  Users,
  Calendar as CalendarIcon2,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store";
import { getMagazines, createMagazine, updateMagazine, deleteMagazine } from "@/features/magazine/magazineThunks";
import { Magazine } from "@/features/magazine/magazineSlice";
import { toastSuccess, toastError, dismissAllToasts } from "@/services/toastService";
import { toast } from "sonner";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.mjs";

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
  issueNumber: z
    .string()
    .min(1, "Issue number is required")
    .max(50, "Issue number must be less than 50 characters"),
  editor: z
    .string()
    .min(1, "Editor is required")
    .max(100, "Editor must be less than 100 characters"),
  status: z.enum(["draft", "published", "archived"]),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  year: z
    .number()
    .min(1900, "Year must be valid")
    .max(2100, "Year must be valid"),
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
  issueNumber: z
    .string()
    .min(1, "Issue number is required")
    .max(50, "Issue number must be less than 50 characters"),
  editor: z
    .string()
    .min(1, "Editor is required")
    .max(100, "Editor must be less than 100 characters"),
  status: z.enum(["draft", "published", "archived"]),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  year: z
    .number()
    .min(1900, "Year must be valid")
    .max(2100, "Year must be valid"),
  image: z.any().optional(),
  pdf: z.any().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;
type EditFormData = z.infer<typeof editSchema>;

export default function MagazineManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { magazines, loading, creating, updating, deleting, error } = useSelector((state: RootState) => state.magazine);

  const [searchTitle, setSearchTitle] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filteredMagazines, setFilteredMagazines] = useState<Magazine[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [previewMagazine, setPreviewMagazine] = useState<Magazine | null>(null);
  const [editingMagazine, setEditingMagazine] = useState<Magazine | null>(null);
  const [deleteMagazineId, setDeleteMagazineId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  // React Hook Form setup
  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      issueNumber: "",
      editor: "",
      status: "draft",
      description: "",
      year: new Date().getFullYear(),
    },
  });

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      issueNumber: "",
      editor: "",
      status: "draft",
      description: "",
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    dispatch(getMagazines({}));
  }, [dispatch]);

  useEffect(() => {
    setFilteredMagazines(magazines);
  }, [magazines]);

  // Handle errors from Redux state
  useEffect(() => {
    if (error) {
      toastError.error("Operation failed", error);
    }
  }, [error]);

  // Calculate statistics
  const stats = {
    total: magazines.length,
    thisYear: magazines.filter((m) => m.year === new Date().getFullYear()).length,
    published: magazines.filter((m) => m.status === "published").length,
    totalSize: magazines
      .reduce((acc, m) => {
        const size = m.size || 0;
        return acc + size;
      }, 0)
      .toPrecision(2),
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
    let filtered = magazines;

    if (searchTitle.trim()) {
      filtered = filtered.filter(
        (mag) =>
          mag.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
          mag.issueNumber.toLowerCase().includes(searchTitle.toLowerCase()) ||
          mag.editor.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((mag) => mag.status === selectedStatus);
    }

    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter((mag) => {
        const magDate = new Date(mag.uploadedAt);
        return magDate >= dateRange.from! && magDate <= dateRange.to!;
      });
    }

    setFilteredMagazines(filtered);
  }, [searchTitle, selectedStatus, dateRange, magazines]);

  // Handle reset filters
  const handleReset = () => {
    setSearchTitle("");
    setSelectedStatus("All");
    setDateRange(undefined);
    setFilteredMagazines(magazines);
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
            setEditImagePreview(URL.createObjectURL(file));
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
        setEditImagePreview(URL.createObjectURL(file));
      }
    }
  };

  // Handle upload save
  const handleUploadSave = async (data: UploadFormData) => {
    try {
      const magazineData = {
        title: data.title,
        issueNumber: data.issueNumber,
        editor: data.editor,
        status: data.status,
        description: data.description || "",
        year: data.year,
        image: data.image,
        pdf: data.pdf,
        uploadedAt: new Date().toISOString(),
      };

      const result = await dispatch(createMagazine(magazineData));

      if (createMagazine.fulfilled.match(result)) {
        uploadForm.reset();
        setIsUploadOpen(false);
      }
    } catch (error) {
    // Error handling is done in the service layer
    }
  };

  // Handle upload cancel
  const handleUploadCancel = () => {
    uploadForm.reset();
    setIsUploadOpen(false);
  };

  // Handle edit open
  const handleEditOpen = (magazine: Magazine) => {
    setEditingMagazine(magazine);
    setEditImagePreview(null);
    editForm.reset({
      title: magazine.title,
      issueNumber: magazine.issueNumber,
      editor: magazine.editor,
      status: magazine.status,
      description: magazine.description || "",
      year: magazine.year,
    });
    setIsEditOpen(true);
  };

  // Handle edit save
  const handleEditSave = async (data: EditFormData) => {
    if (!editingMagazine) return;

    try {
      const updateData: any = {
        title: data.title,
        issueNumber: data.issueNumber,
        editor: data.editor,
        status: data.status,
        description: data.description,
        year: data.year,
      };

      if (data.image) {
        updateData.image = data.image;
      }
      if (data.pdf) {
        updateData.pdf = data.pdf;
      }

      const result = await dispatch(updateMagazine({
        id: editingMagazine._id || editingMagazine.id || "",
        data: updateData
      }));

      if (updateMagazine.fulfilled.match(result)) {
        editForm.reset();
        setEditingMagazine(null);
        setEditImagePreview(null);
        setIsEditOpen(false);
      }
    } catch (error) {
    // Error handling is done in the service layer
    }
  };

  // Handle edit cancel
  const handleEditCancel = () => {
    editForm.reset();
    setEditingMagazine(null);
    setEditImagePreview(null);
    setIsEditOpen(false);
  };

  // Handle delete current image in edit mode
  const handleDeleteCurrentImage = () => {
    setEditImagePreview("/file.svg?height=300&width=400");
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      const result = await dispatch(deleteMagazine(id));

      if (deleteMagazine.fulfilled.match(result)) {
        setDeleteMagazineId(null);
      }
    } catch (error) {
    // Error handling is done in the service layer
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
      selectedStatus !== "All" ||
      (dateRange?.from && dateRange?.to)
    );
  }, [searchTitle, selectedStatus, dateRange]);

  // Render file upload area
  const renderFileUploadArea = (
    fileType: "image" | "pdf",
    isEdit = false,
    currentFile?: string
  ) => {
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
              src={editImagePreview || `${process.env.NEXT_PUBLIC_API_BASE_URL}${currentFile}`}
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
              onClick={handleDeleteCurrentImage}
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
        className="space-y-6 mx-4"
      >
        {/* Title */}
        <FormField
          control={uploadForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Magazine Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Creative Expressions"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Issue Number */}
        <FormField
          control={uploadForm.control}
          name="issueNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Volume 5, Issue 2"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Editor */}
        <FormField
          control={uploadForm.control}
          name="editor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Editor *</FormLabel>
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

        {/* Description */}
        <FormField
          control={uploadForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter magazine description (optional)"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Year */}
        <FormField
          control={uploadForm.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 2024"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number.parseInt(e.target.value))
                  }
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
                      {" "}- {(field.value.size / 1024 / 1024).toPrecision(2)} MB
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
            disabled={creating}
          >
            {creating ? "Uploading..." : "Upload Magazine"}
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
        {editingMagazine?.image && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Cover</Label>
            <div className="relative aspect-[3/4] w-32 bg-gray-100 rounded-lg overflow-hidden group">
              <img
                src={editImagePreview || `${process.env.NEXT_PUBLIC_API_BASE_URL}${editingMagazine.image}`}
                alt={editingMagazine.title}
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
                onClick={handleDeleteCurrentImage}
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
                    editingMagazine?.image
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
                      {" "}- {(field.value.size / 1024 / 1024).toPrecision(2)} MB
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
                  placeholder="Enter magazine title"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Issue Number */}
        <FormField
          control={editForm.control}
          name="issueNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Number *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Volume 5, Issue 2"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Editor */}
        <FormField
          control={editForm.control}
          name="editor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Editor *</FormLabel>
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

        {/* Status */}
        <FormField
          control={editForm.control}
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

        {/* Description */}
        <FormField
          control={editForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter magazine description (optional)"
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Year */}
        <FormField
          control={editForm.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g., 2024"
                  {...field}
                  onChange={(e) =>
                    field.onChange(Number.parseInt(e.target.value))
                  }
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
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
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Magazine"}
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
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Magazine Management</h1>
          <p className="text-muted-foreground">
            Upload and manage magazine publications
          </p>
        </div>
        {/* Upload Sheet (Sidebar) */}
        <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <SheetTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              <Plus className="h-4 w-4" />
              Upload Magazine
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-x-hidden overflow-y-auto">
            <SheetHeader className="text-left pb-6">
              <SheetTitle className="text-xl font-semibold">
                Upload New Magazine
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Add a new magazine issue to the collection
              </SheetDescription>
            </SheetHeader>
            <div className="p-6">{renderUploadForm()}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">{stats.total}</CardTitle>
            <CardDescription>Total Magazines</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {stats.thisYear}
            </CardTitle>
            <CardDescription>This Year</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {stats.published}
            </CardTitle>
            <CardDescription>Published</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">
              {parseFloat((Number(stats.totalSize) / (1024 * 1024)).toPrecision(3))} MB
            </CardTitle>
            <CardDescription>Total Size</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search-title" className="text-sm font-medium">
              Search by Title
            </Label>
            <Input
              id="search-title"
              placeholder="Enter magazine title..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          <div className="w-full sm:w-48">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-1">
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
                  className="w-full mt-1 justify-start text-left font-normal bg-transparent"
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
            className="flex-1 sm:flex-none bg-transparent cursor-pointer"
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

      {/* Edit Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-x-hidden overflow-y-auto">
          <SheetHeader className="text-left pb-6">
            <SheetTitle className="text-xl font-semibold">
              Edit Magazine
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Update magazine details and optionally replace files.
            </SheetDescription>
          </SheetHeader>
          <div className="px-1">{renderEditForm()}</div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteMagazineId !== null}
        onOpenChange={() => setDeleteMagazineId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              magazine from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer hover:bg-gray-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMagazineId && handleDelete(deleteMagazineId)}
              className="bg-red-500 hover:bg-red-700 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Dialog */}
      <Dialog
        open={previewMagazine !== null}
        onOpenChange={() => setPreviewMagazine(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {previewMagazine?.title}
            </DialogTitle>
          </DialogHeader>
          {previewMagazine && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  {previewMagazine.description && (
                    <p className="text-sm text-muted-foreground">{previewMagazine.description}</p>
                  )}
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{previewMagazine.issueNumber}</span>
                    <span>{previewMagazine.year}</span>
                    <span>{previewMagazine.editor}</span>
                  </div>
                </div>
                <Badge
                  className={getStatusInfo(previewMagazine.status).color}
                >
                  {getStatusInfo(previewMagazine.status).label}
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
                    file={previewMagazine.pdf ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${previewMagazine.pdf}` : null}
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

      {/* Magazine Content */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Magazines</h2>
          <p className="text-sm text-muted-foreground">
            Manage your magazine collection
          </p>
        </div>

        {viewMode === "table" ? (
          // Table View
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Issue Number</TableHead>
                  <TableHead>Editor</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-16 w-12 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-8 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredMagazines.length > 0 ? (
                  filteredMagazines.map((magazine) => (
                    <TableRow key={magazine._id || magazine.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="aspect-[3/4] w-12 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={magazine.image ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${magazine.image}` : "/file.svg"}
                            alt={magazine.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/file.svg?height=64&width=48";
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{magazine.title}</p>
                        {magazine.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {magazine.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {magazine.issueNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {magazine.editor}
                      </TableCell>
                      <TableCell className="text-sm">{magazine.year}</TableCell>
                      <TableCell className="text-sm">
                        {magazine.size ? `${(magazine.size / 1024 / 1024).toPrecision(2)} MB` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusInfo(magazine.status).color}
                        >
                          {getStatusInfo(magazine.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {magazine.uploadedAt ? format(new Date(magazine.uploadedAt), "MMM dd, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setPreviewMagazine(magazine)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => {
                                if (magazine.pdf) {
                                  const link = document.createElement('a');
                                  link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${magazine.pdf}`;
                                  link.download = `${magazine.title}.pdf`;
                                  link.click();
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditOpen(magazine)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteMagazineId(magazine._id || magazine.id || "")}
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
                  <TableRow>
                        <TableCell colSpan={9} className="text-center py-12">
                      <p className="text-muted-foreground">
                        No magazines found matching your criteria.
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
                <Card key={index} className="overflow-hidden border-0 group">
                  <Skeleton className="aspect-[3/4] w-full bg-gray-300 dark:bg-gray-800 animate-pulse" />
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                    <Skeleton className="h-3 w-full bg-gray-300 dark:bg-gray-800 animate-pulse" />
                    <Skeleton className="h-3 w-2/3 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-16 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                      <Skeleton className="h-3 w-20 bg-gray-300 dark:bg-gray-800 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredMagazines.length > 0 ? (
              filteredMagazines.map((magazine) => (
                <Card
                  key={magazine._id || magazine.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-200 border group"
                >
                  <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                    <img
                      src={magazine.image ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${magazine.image}` : "/file.svg"}
                      alt={magazine.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.currentTarget.src = "/file.svg?height=400&width=300";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
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
                            onClick={() => setPreviewMagazine(magazine)}
                            className="cursor-pointer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              if (magazine.pdf) {
                                const link = document.createElement('a');
                                link.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}${magazine.pdf}`;
                                link.download = `${magazine.title}.pdf`;
                                link.click();
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditOpen(magazine)}
                            className="cursor-pointer"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteMagazineId(magazine._id || magazine.id || "")}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium line-clamp-1">
                      {magazine.title}
                    </CardTitle>
                    {magazine.description && (
                      <CardDescription className="text-xs line-clamp-2">
                        {magazine.description}
                      </CardDescription>
                    )}
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{magazine.issueNumber}</span>
                      <span>{magazine.year}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <Badge
                        className={getStatusInfo(magazine.status).color + " text-xs"}
                      >
                        {getStatusInfo(magazine.status).label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {magazine.size ? `${(magazine.size / 1024 / 1024).toPrecision(2)} MB` : "N/A"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No magazines found matching your criteria.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
