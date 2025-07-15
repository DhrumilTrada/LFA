"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
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
import { Upload, Search, RotateCcw, Plus, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import Image1 from "@/assests/image1.png";
import Image2 from "@/assests/image1.png";
import Image3 from "@/assests/image1.png";
import Image4 from "@/assests/image1.png";

// Mock data
const mockImages = [
  {
    id: 1,
    title: "Mountain Landscape",
    description:
      "Beautiful mountain view during sunset with golden hour lighting",
    category: "Nature",
    uploadDate: "2024-01-15",
    imageUrl: "Image1",
  },
  {
    id: 2,
    title: "City Architecture",
    description: "Modern building with glass facade in downtown area",
    category: "Architecture",
    uploadDate: "2024-01-14",
    imageUrl: "Image2",
  },
  {
    id: 3,
    title: "Portrait Photography",
    description: "Professional headshot with natural lighting",
    category: "Portrait",
    uploadDate: "2024-01-13",
    imageUrl: "Image3",
  },
  {
    id: 4,
    title: "Food Styling",
    description: "Gourmet dish presentation with artistic plating",
    category: "Food",
    uploadDate: "2024-01-12",
    imageUrl: "Image2",
  },
  {
    id: 5,
    title: "Abstract Art",
    description: "Colorful abstract composition with geometric shapes",
    category: "Art",
    uploadDate: "2024-01-11",
    imageUrl: "Image4",
  },
  {
    id: 6,
    title: "Wildlife Photography",
    description: "Rare bird species captured in natural habitat",
    category: "Nature",
    uploadDate: "2024-01-10",
    imageUrl: "Image1",
  },
];

const categories = [
  "All",
  "Nature",
  "Architecture",
  "Portrait",
  "Food",
  "Art",
  "Technology",
  "Travel",
];

interface ImageData {
  id: number;
  title: string;
  description: string;
  category: string;
  uploadDate: string;
  imageUrl: string;
}

export default function Page() {
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<ImageData[]>(mockImages);
  const [filteredImages, setFilteredImages] = useState<ImageData[]>(mockImages);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<ImageData | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setImages(mockImages);
      setFilteredImages(mockImages);
      setIsLoading(false);
    }, 1500); // Same duration as search/reset

    return () => clearTimeout(timer);
  }, []);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    category: "Nature",
    image: null as File | null,
  });

  // Handle search and filtering
  const handleSearch = useCallback(() => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = images;

      // Filter by title
      if (searchTitle.trim()) {
        filtered = filtered.filter((img) =>
          img.title.toLowerCase().includes(searchTitle.toLowerCase())
        );
      }

      // Filter by category
      if (selectedCategory !== "All") {
        filtered = filtered.filter((img) => img.category === selectedCategory);
      }

      // Filter by date range
      if (dateRange?.from && dateRange?.to) {
        filtered = filtered.filter((img) => {
          const imgDate = new Date(img.uploadDate);
          return imgDate >= dateRange.from! && imgDate <= dateRange.to!;
        });
      }

      setFilteredImages(filtered);
      setIsLoading(false);
    }, 1500);
  }, [searchTitle, selectedCategory, dateRange, images]);

  // Handle reset filters
  const handleReset = () => {
    setIsLoading(true);

    setTimeout(() => {
      setSearchTitle("");
      setSelectedCategory("All");
      setDateRange(undefined);
      setFilteredImages(images);
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setUploadForm((prev) => ({ ...prev, image: file }));
      }
    }
  }, []);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  // Handle upload save
  const handleUploadSave = () => {
    if (
      uploadForm.title &&
      uploadForm.description &&
      uploadForm.category &&
      uploadForm.image
    ) {
      const newImage: ImageData = {
        id: Date.now(),
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        uploadDate: new Date().toISOString().split("T")[0],
        imageUrl: "",
      };

      setImages((prev) => [newImage, ...prev]);
      setFilteredImages((prev) => [newImage, ...prev]);
      setUploadForm({
        title: "",
        description: "",
        category: "Nature",
        image: null,
      });
      setIsUploadOpen(false);
    }
  };

  // Handle upload cancel
  const handleUploadCancel = () => {
    setUploadForm({
      title: "",
      description: "",
      category: "Nature",
      image: null,
    });
    setIsUploadOpen(false);
  };

  const isFilterActive = useCallback(() => {
    return (
      searchTitle.trim() !== "" ||
      selectedCategory !== "All" ||
      (dateRange?.from && dateRange?.to)
    );
  }, [searchTitle, selectedCategory, dateRange]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
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
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
                  className="w-full mt-1 justify-start text-left font-normal bg-transparent "
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
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader className="text-left">
                <SheetTitle className="text-xl font-semibold">
                  Upload New Image
                </SheetTitle>
                <SheetDescription className="text-muted-foreground">
                  Add a new image to your collection with details.
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-5">
                {/* Image Upload Area */}
                <div className="space-y-3 mx-4">
                  <Label className="text-sm font-medium leading-none">
                    Image
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Drag and drop an image here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-md"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      Choose File
                    </Button>
                    {uploadForm.image && (
                      <p className="text-xs text-green-600 mt-3 font-medium">
                        Selected: {uploadForm.image.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-3 mx-4">
                  <Label
                    htmlFor="upload-title"
                    className="text-sm font-medium leading-none"
                  >
                    Title
                  </Label>
                  <Input
                    id="upload-title"
                    placeholder="Enter image title"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                {/* Description */}
                <div className="space-y-3 mx-4">
                  <Label
                    htmlFor="upload-description"
                    className="text-sm font-medium leading-none"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="upload-description"
                    placeholder="Enter image description"
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                {/* Category */}
                <div className="space-y-3 mx-4">
                  <Label className="text-sm font-medium leading-none">
                    Category
                  </Label>
                  <Select
                    value={uploadForm.category}
                    onValueChange={(value) =>
                      setUploadForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
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
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 mx-4">
                  <Button
                    onClick={handleUploadSave}
                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
                    disabled={
                      !uploadForm.title ||
                      !uploadForm.description ||
                      !uploadForm.image
                    }
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUploadCancel}
                    className="flex-1 h-10 border-muted-foreground/30 hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          // Skeleton Loading
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-0">
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
        ) : filteredImages.length > 0 ? (
          filteredImages.map((image) => (
            <Card
              key={image.id}
              className="overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer border-0"
            >
              <div
                className="aspect-video bg-gray-300 relative overflow-hidden"
                onClick={() => setPreviewImage(image)}
              >
                <img
                  src={image.imageUrl || ""}
                  alt={image.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
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
                  <Badge variant="" className="text-xs">
                    {image.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(image.uploadDate), "MMM dd, yyyy")}
                  </span>
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

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          {previewImage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  {previewImage.title}
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewImage(null)}
                  >
                    <X className="h-4 w-4 top-2 right-4" />
                  </Button> */}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={previewImage.imageUrl || "/placeholder.svg"}
                    alt={previewImage.title}
                    className="w-full h-full object-cover bg-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {previewImage.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="" className="text-xs">
                      {previewImage.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Uploaded:{" "}
                      {format(
                        new Date(previewImage.uploadDate),
                        "MMMM dd, yyyy"
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
