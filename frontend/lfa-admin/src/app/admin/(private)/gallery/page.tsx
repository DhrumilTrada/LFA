  "use client";
import type React from "react";
  import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { fetchGalleries, createGallery, updateGallery, deleteGallery, fetchCategories } from "@/features/gallery/galleryThunks";
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
  import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

// ...existing code...

// Use Gallery interface from slice for type
import type { Gallery, Category } from "@/features/gallery/gallerySlice";

  const uploadSchema = z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description must be less than 500 characters"),
    category: z.string().min(1, "Category is required"),
    image: z.any().refine((file) => file instanceof File, "Image is required"),
  });

  const editSchema = z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(500, "Description must be less than 500 characters"),
    category: z.string().min(1, "Category is required"),
    image: z.any().optional(),
  });

  type UploadFormData = z.infer<typeof uploadSchema>;
  type EditFormData = z.infer<typeof editSchema>;

  export default function Page() {
    const dispatch = useDispatch<AppDispatch>();
    const { galleries, categories, loading, error } = useSelector((state: RootState) => {
      return state.gallery;
    });

    // Helper function to get category display name from value
    const getCategoryDisplayName = (categoryValue: string): string => {
      const category = categories.find(cat => cat.value === categoryValue);
      return category ? category.key : categoryValue;
    };

    // Create display categories with "All" at the beginning, using value for uniqueness
    const displayCategories = [
      { key: "All", value: "All" },
      ...categories.map(cat => ({ key: cat.key, value: cat.value }))
    ];

    const [searchTitle, setSearchTitle] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<Gallery | null>(null);
    const [editingImage, setEditingImage] = useState<Gallery | null>(null);
    const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
    const [filteredImages, setFilteredImages] = useState<Gallery[]>([]);

    // React Hook Form setup
    const uploadForm = useForm<UploadFormData>({
      resolver: zodResolver(uploadSchema),
      defaultValues: {
        title: "",
        description: "",
        category: categories[0]?.value || "nature",
      },
    });

    const editForm = useForm<EditFormData>({
      resolver: zodResolver(editSchema),
      defaultValues: {
        title: "",
        description: "",
        category: categories[0]?.value || "nature",
      },
    });

    useEffect(() => {
      dispatch(fetchGalleries());
      dispatch(fetchCategories());
    }, [dispatch]);

    // ✅ This will run after Redux state is updated
    useEffect(() => {
      console.log("galleries (updated):", galleries);
    }, [galleries]);

    useEffect(() => {
      setFilteredImages(galleries);
    }, [galleries]);

    // Update form default categories when categories are loaded
    useEffect(() => {
      if (categories.length > 0) {
        uploadForm.setValue('category', categories[0].value);
        editForm.setValue('category', categories[0].value);
      }
    }, [categories, uploadForm, editForm]);

    // Handle search and filtering
    const handleSearch = useCallback(() => {
      let filtered = galleries;
      if (searchTitle.trim()) {
        filtered = filtered.filter((img) =>
          img.title.toLowerCase().includes(searchTitle.toLowerCase())
        );
      }
      if (selectedCategory !== "All") {
        filtered = filtered.filter((img) => img.category === selectedCategory);
      }
      if (dateRange?.from && dateRange?.to) {
        const from = dateRange.from;
        const to = dateRange.to;
        filtered = filtered.filter((img) => {
          if (!img.createdAt) return false;
          const created = new Date(img.createdAt);
          if (isNaN(created.getTime())) return false;
          return from && to && created >= from && created <= to;
        });
      }
      setFilteredImages(filtered);
    }, [searchTitle, selectedCategory, dateRange, galleries]);

    // Handle reset filters
    const handleReset = () => {
      setSearchTitle("");
      setSelectedCategory("All");
      setDateRange(undefined);
      // Restore all images from API (galleries)
      setFilteredImages(galleries || []);
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
      (e: React.DragEvent, isEdit = false) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            if (isEdit) {
              editForm.setValue("image", file);
              setEditImagePreview(URL.createObjectURL(file));
            } else {
              uploadForm.setValue("image", file);
            }
          }
        }
      },
      [editForm, uploadForm]
    );

    // Handle file input change
    const handleFileChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      isEdit = false
    ) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (isEdit) {
          editForm.setValue("image", file);
          setEditImagePreview(URL.createObjectURL(file));
        } else {
          uploadForm.setValue("image", file);
        }
      }
    };

    // Handle upload save
    const handleUploadSave = async (data: UploadFormData) => {
      // Map form data to Gallery DTO
      const galleryData = {
        title: data.title,
        description: data.description,
        category: data.category,
        image: data.image,
        year: new Date().getFullYear(),
      };
      const result = await dispatch(createGallery(galleryData as any));
      if (createGallery.fulfilled.match(result)) {
        uploadForm.reset();
        setIsUploadOpen(false);
        // Refresh galleries after successful creation
        dispatch(fetchGalleries());
      }
    };

    // Handle upload cancel
    const handleUploadCancel = () => {
      uploadForm.reset();
      setIsUploadOpen(false);
    };

    // Handle edit open
    const handleEditOpen = (image: Gallery) => {
      setEditingImage(image);
      setEditImagePreview(null);
      editForm.reset({
        title: image.title,
        description: image.description,
        category: image.category,
      });
      setIsEditOpen(true);
    };

    // Handle edit save
    const handleEditSave = async (data: EditFormData) => {
      if (!editingImage) return;
      // Always send a valid id for update
      const id = editingImage._id || editingImage.id;
      const galleryData = {
        ...editingImage,
        id, // ensure id is present
        title: data.title,
        description: data.description,
        category: data.category,
        image: data.image,
      };
      const result = await dispatch(updateGallery(galleryData as any));
      if (updateGallery.fulfilled.match(result)) {
        editForm.reset();
        setEditingImage(null);
        setEditImagePreview(null);
        setIsEditOpen(false);
        // Refresh galleries after successful update
        dispatch(fetchGalleries());
      }
    };

    // Handle edit cancel
    const handleEditCancel = () => {
      editForm.reset();
      setEditingImage(null);
      setEditImagePreview(null);
      setIsEditOpen(false);
    };

    // Handle delete current image in edit mode
    const handleDeleteCurrentImage = () => {
      setEditImagePreview("/placeholder.svg?height=300&width=400");
    };

    // Handle delete
    const handleDelete = async (id: string) => {
      const result = await dispatch(deleteGallery(id));
      if (deleteGallery.fulfilled.match(result)) {
        setDeleteImageId(null);
        // Refresh galleries after successful deletion
        dispatch(fetchGalleries());
      }
    };

    const isFilterActive = useCallback(() => {
      return (
        searchTitle.trim() !== "" ||
        selectedCategory !== "All" ||
        (dateRange?.from && dateRange?.to)
      );
    }, [searchTitle, selectedCategory, dateRange]);

    // Render upload form
    const renderUploadForm = () => (
      <Form {...uploadForm}>
        <form
          onSubmit={uploadForm.handleSubmit(handleUploadSave)}
          className="space-y-6 mx-4"
        >
          {/* Image Upload Area */}
          <FormField
            control={uploadForm.control}
            name="image"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, false)}
                  >
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Drag and drop an image here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, false)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-md bg-transparent"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      Choose File
                    </Button>
                    {field.value && (
                      <p className="text-xs text-green-600 mt-3 font-medium">
                        Selected: {field.value.name}
                      </p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={uploadForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter image title"
                    {...field}
                    className="focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </FormControl>
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
                <FormLabel className="">Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter image description"
                    rows={3}
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
              <FormItem className="">
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.key}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadCancel}
              className="flex-1 hover:bg-gray-300 cursor-pointer"
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
          {/* Current Image Preview */}
          {editingImage && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Current Image</Label>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                <img
                  src={
                    editImagePreview ||
                    (editingImage.image ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3005"}${editingImage.image}` : "/placeholder.svg")
                  }
                  alt={editingImage.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={handleDeleteCurrentImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* New Image Upload */}
          <FormField
            control={editForm.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Image (Optional)</FormLabel>
                <FormControl>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, true)}
                  >
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Drag and drop an image here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                      className="hidden"
                      id="edit-file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-md bg-transparent"
                      onClick={() =>
                        document.getElementById("edit-file-upload")?.click()
                      }
                    >
                      Choose File
                    </Button>
                    {field.value && (
                      <p className="text-xs text-green-600 mt-3 font-medium">
                        Selected: {field.value.name}
                      </p>
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
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter image title"
                    {...field}
                    className=" focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </FormControl>
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
                    placeholder="Enter image description"
                    rows={3}
                    {...field}
                    className=" focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={editForm.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.key}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pb-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Update
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleEditCancel}
              className="flex-1 hover:bg-gray-300 cursor-pointer"
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
            <h1 className="text-3xl font-bold">Gallery Management</h1>
            <p className="text-muted-foreground">
              Upload and manage your image collection
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">{galleries.length}</CardTitle>
              <CardDescription>Total Images</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {galleries.filter((img: any) => img.year === new Date().getFullYear()).length}
              </CardTitle>
              <CardDescription>This Year</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {categories.length}
              </CardTitle>
              <CardDescription>Categories</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                {filteredImages.length}
              </CardTitle>
              <CardDescription>Filtered Results</CardDescription>
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
                placeholder="Enter image title..."
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
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {displayCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.key}
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
            <Sheet open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <SheetTrigger asChild>
                <Button className="flex items-center gap-2 sm:ml-auto bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Upload Image
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-x-hidden overflow-y-auto">
                <SheetHeader className="text-left pb-6">
                  <SheetTitle className="text-xl font-semibold">
                    Upload New Image
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground">
                    Add a new image to your collection with details.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-1">{renderUploadForm()}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Edit Sheet */}
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-x-hidden overflow-y-auto">
            <SheetHeader className="text-left pb-6">
              <SheetTitle className="text-xl font-semibold">
                Edit Image
              </SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Update image details and optionally replace the image.
              </SheetDescription>
            </SheetHeader>
            <div className="px-1">{renderEditForm()}</div>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteImageId !== null}
          onOpenChange={() => setDeleteImageId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                image from your collection.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer hover:bg-gray-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteImageId && handleDelete(deleteImageId)}
                className="bg-red-500 hover:bg-red-700 cursor-pointer"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Image Preview Dialog */}
        <Dialog
          open={previewImage !== null}
          onOpenChange={() => setPreviewImage(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{previewImage?.title}</DialogTitle>
            </DialogHeader>
            {previewImage && (
              <div className="space-y-4">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewImage.image ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3005"}${previewImage.image}` : "/placeholder.svg"}
                    alt={previewImage.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {previewImage.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge>{getCategoryDisplayName(previewImage.category)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {/* {format(new Date(previewImage.createdAt), "MMM dd, yyyy")} */}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Image Grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Images</h2>
            <p className="text-sm text-muted-foreground">
              Manage your image collection
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">Error: {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            // Skeleton Loading
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-0 group">
                <Skeleton className="aspect-video w-full bg-gray-300 dark:bg-gray-800 animate-pulse" />
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
          ) : filteredImages?.length > 0 ? (
            filteredImages.map((image) => (
              <Card
                key={image?._id || image?.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-200 border group"
              >
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  <img
                    src={image.image ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3005"}${image.image}` : "/placeholder.svg"}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

                  {/* Desktop Actions - Show on hover */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
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
                          onClick={() => setPreviewImage(image)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditOpen(image)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteImageId((image._id || image.id) ?? null)}
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
                          onClick={() => setPreviewImage(image)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditOpen(image)}
                          className="cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteImageId((image._id || image.id) ?? null)}
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
                  <CardTitle className="text-sm font-medium line-clamp-1">
                    {image.title}
                  </CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {image.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <Badge className="text-xs">{getCategoryDisplayName(image.category)}</Badge>
                    {/* <span className="text-xs text-muted-foreground">
                      {format(new Date(image.createdAt), "MMM dd, yyyy")}
                    </span> */}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                No images found matching your criteria.
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    );
  }
