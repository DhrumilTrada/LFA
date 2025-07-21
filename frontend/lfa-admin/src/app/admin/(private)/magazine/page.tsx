'use client';

import type React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
} from 'lucide-react';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

// Mock data for magazines - simplified to match schema
const mockMagazines = [
    {
        id: 1,
        title: 'Creative Expressions',
        edition: 'Volume 5, Issue 2',
        year: 2024,
        file_url: '/placeholder.pdf',
        cover_image_url: '/placeholder.svg?height=400&width=300',
        size_mb: 12.4,
        status: 'Published',
        upload_date: '2024-03-15',
    },
    {
        id: 2,
        title: 'Artistic Horizons',
        edition: 'Volume 5, Issue 1',
        year: 2024,
        file_url: '/placeholder.pdf',
        cover_image_url: '/placeholder.svg?height=400&width=300',
        size_mb: 10.8,
        status: 'Published',
        upload_date: '2024-01-20',
    },
    {
        id: 3,
        title: 'Literary Landscapes',
        edition: 'Volume 4, Issue 4',
        year: 2023,
        file_url: '/placeholder.pdf',
        cover_image_url: '/placeholder.svg?height=400&width=300',
        size_mb: 11.2,
        status: 'Published',
        upload_date: '2023-12-10',
    },
    {
        id: 4,
        title: 'Tech Innovations',
        edition: 'Volume 3, Issue 6',
        year: 2025,
        file_url: '/placeholder.pdf',
        cover_image_url: '/placeholder.svg?height=400&width=300',
        size_mb: 15.6,
        status: 'Draft',
        upload_date: '2023-11-05',
    },
    {
        id: 5,
        title: 'Nature Chronicles',
        edition: 'Volume 2, Issue 3',
        year: 2023,
        file_url: '/placeholder.pdf',
        cover_image_url: '/placeholder.svg?height=400&width=300',
        size_mb: 18.9,
        status: 'Published',
        upload_date: '2023-09-18',
    },
];

const categories = ['All', 'Art & Design', 'Literature', 'Technology', 'Nature', 'Science', 'Business', 'Lifestyle'];

const statusOptions = ['All', 'Published', 'Draft', 'Archived'];

interface MagazineData {
    id: number;
    title: string;
    edition: string;
    year: number;
    file_url: string;
    cover_image_url: string;
    size_mb: number;
    status: string;
    upload_date: string;
}

const uploadSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    edition: z.string().min(1, 'Edition is required').max(50, 'Edition must be less than 50 characters'),
    year: z.number().min(1900, 'Year must be valid').max(2100, 'Year must be valid'),
    cover: z.any().refine((file) => file instanceof File, 'Cover image is required'),
    pdf: z.any().refine((file) => file instanceof File, 'PDF file is required'),
});

const editSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    edition: z.string().min(1, 'Edition is required').max(50, 'Edition must be less than 50 characters'),
    year: z.number().min(1900, 'Year must be valid').max(2100, 'Year must be valid'),
    cover: z.any().optional(),
    pdf: z.any().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;
type EditFormData = z.infer<typeof editSchema>;

export default function MagazineManagement() {
    const [searchTitle, setSearchTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [magazines, setMagazines] = useState<MagazineData[]>(mockMagazines);
    const [filteredMagazines, setFilteredMagazines] = useState<MagazineData[]>(mockMagazines);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [previewMagazine, setPreviewMagazine] = useState<MagazineData | null>(null);
    const [editingMagazine, setEditingMagazine] = useState<MagazineData | null>(null);
    const [deleteMagazineId, setDeleteMagazineId] = useState<number | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);

    // React Hook Form setup
    const uploadForm = useForm<UploadFormData>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: '',
            edition: '',
            year: new Date().getFullYear(),
            // category: "Art & Design",
            // status: "Draft",
            // author: "",
            // issn: "",
        },
    });

    const editForm = useForm<EditFormData>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            title: '',
            edition: '',
            year: new Date().getFullYear(),
            // category: "Art & Design",
            // status: "Draft",
            // author: "",
            // issn: "",
        },
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setMagazines(mockMagazines);
            setFilteredMagazines(mockMagazines);
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Calculate statistics
    const stats = {
        total: magazines.length,
        thisYear: magazines.filter((m) => m.year === new Date().getFullYear()),
        published: magazines.filter((m) => m.status === 'Published').length,
        totalSize: magazines
            .reduce((acc, m) => {
                const size = m.size_mb;
                return acc + size;
            }, 0)
            .toFixed(1),
    };

    // Handle search and filtering
    const handleSearch = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => {
            let filtered = magazines;

            if (searchTitle.trim()) {
                filtered = filtered.filter(
                    (mag) =>
                        mag.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
                        mag.title.toLowerCase().includes(searchTitle.toLowerCase())
                );
            }

            if (selectedCategory !== 'All') {
                filtered = filtered.filter((mag) => mag.title === selectedCategory);
            }

            if (selectedStatus !== 'All') {
                filtered = filtered.filter((mag) => mag.status === selectedStatus);
            }

            if (dateRange?.from && dateRange?.to) {
                filtered = filtered.filter((mag) => {
                    const magDate = new Date(mag.upload_date);
                    return magDate >= dateRange.from! && magDate <= dateRange.to!;
                });
            }

            setFilteredMagazines(filtered);
            setIsLoading(false);
        }, 800);
    }, [searchTitle, selectedCategory, selectedStatus, dateRange, magazines]);

    // Handle reset filters
    const handleReset = () => {
        setIsLoading(true);
        setTimeout(() => {
            setSearchTitle('');
            setSelectedCategory('All');
            setSelectedStatus('All');
            setDateRange(undefined);
            setFilteredMagazines(magazines);
            setIsLoading(false);
        }, 1500);
    };

    // Handle drag and drop
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, fileType: 'cover' | 'pdf', isEdit = false) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                const form = isEdit ? editForm : uploadForm;

                if (fileType === 'cover' && file.type.startsWith('image/')) {
                    form.setValue('cover', file);
                    if (isEdit) {
                        setEditCoverPreview(URL.createObjectURL(file));
                    }
                } else if (fileType === 'pdf' && file.type === 'application/pdf') {
                    form.setValue('pdf', file);
                }
            }
        },
        [editForm, uploadForm]
    );

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'cover' | 'pdf', isEdit = false) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const form = isEdit ? editForm : uploadForm;

            form.setValue(fileType, file);
            if (fileType === 'cover' && isEdit) {
                setEditCoverPreview(URL.createObjectURL(file));
            }
        }
    };

    // Handle upload save
    const handleUploadSave = (data: UploadFormData) => {
        const newMagazine: MagazineData = {
            id: Date.now(),
            title: data.title,
            edition: data.edition,
            year: data.year,
            file_url: URL.createObjectURL(data.pdf),
            cover_image_url: URL.createObjectURL(data.cover),
            size_mb: Number.parseFloat((Math.random() * 20 + 5).toFixed(1)),
            status: 'Draft',
            upload_date: new Date().toISOString().split('T')[0],
        };

        setMagazines((prev) => [newMagazine, ...prev]);
        setFilteredMagazines((prev) => [newMagazine, ...prev]);
        uploadForm.reset();
        setIsUploadOpen(false);
    };

    // Handle upload cancel
    const handleUploadCancel = () => {
        uploadForm.reset();
        setIsUploadOpen(false);
    };

    // Handle edit open
    const handleEditOpen = (magazine: MagazineData) => {
        setEditingMagazine(magazine);
        setEditCoverPreview(null);
        editForm.reset({
            title: magazine.title,
            edition: magazine.edition,
            year: magazine.year,
            // category: magazine.category,
            // status: magazine.status,
            // author: magazine.author,
            // issn: magazine.issn,
        });
        setIsEditOpen(true);
    };

    // Handle edit save
    const handleEditSave = (data: EditFormData) => {
        if (!editingMagazine) return;

        const updatedMagazine: MagazineData = {
            ...editingMagazine,
            title: data.title,
            edition: data.edition,
            year: data.year,
            // category: data.category,
            // status: data.status,
            // author: data.author,
            // issn: data.issn,
            cover_image_url: editCoverPreview || editingMagazine.cover_image_url,
            file_url: data.pdf ? URL.createObjectURL(data.pdf) : editingMagazine.file_url,
        };

        setMagazines((prev) => prev.map((mag) => (mag.id === editingMagazine.id ? updatedMagazine : mag)));
        setFilteredMagazines((prev) => prev.map((mag) => (mag.id === editingMagazine.id ? updatedMagazine : mag)));

        editForm.reset();
        setEditingMagazine(null);
        setEditCoverPreview(null);
        setIsEditOpen(false);
    };

    // Handle edit cancel
    const handleEditCancel = () => {
        editForm.reset();
        setEditingMagazine(null);
        setEditCoverPreview(null);
        setIsEditOpen(false);
    };

    // Handle delete
    const handleDelete = (id: number) => {
        setMagazines((prev) => prev.filter((mag) => mag.id !== id));
        setFilteredMagazines((prev) => prev.filter((mag) => mag.id !== id));
        setDeleteMagazineId(null);
    };

    // PDF viewer functions
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
    };

    const isFilterActive = useCallback(() => {
        return searchTitle.trim() !== '' || selectedCategory !== 'All' || selectedStatus !== 'All' || (dateRange?.from && dateRange?.to);
    }, [searchTitle, selectedCategory, selectedStatus, dateRange]);

    // Render file upload area
    const renderFileUploadArea = (fileType: 'cover' | 'pdf', isEdit = false, currentFile?: string) => {
        const accept = fileType === 'cover' ? 'image/*' : 'application/pdf';
        const label = fileType === 'cover' ? 'Cover Image' : 'PDF File';
        const icon = fileType === 'cover' ? Upload : FileText;
        const IconComponent = icon;

        return (
            <div className="space-y-3">
                <Label className="text-sm font-medium">{label}</Label>
                {isEdit && currentFile && fileType === 'cover' && (
                    <div className="relative aspect-[3/4] w-32 bg-gray-100 rounded-lg overflow-hidden group">
                        <img src={editCoverPreview || currentFile} alt="Current cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => setEditCoverPreview('/placeholder.svg?height=400&width=300')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                )}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, fileType, isEdit)}
                >
                    <IconComponent className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                        Drag and drop {fileType === 'cover' ? 'an image' : 'a PDF'} here, or click to select
                    </p>
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => handleFileChange(e, fileType, isEdit)}
                        className="hidden"
                        id={`${fileType}-upload-${isEdit ? 'edit' : 'new'}`}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md bg-transparent"
                        onClick={() => document.getElementById(`${fileType}-upload-${isEdit ? 'edit' : 'new'}`)?.click()}
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
            <form onSubmit={uploadForm.handleSubmit(handleUploadSave)} className="space-y-4">
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

                {/* Edition */}
                <FormField
                    control={uploadForm.control}
                    name="edition"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Edition *</FormLabel>
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
                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
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
                    name="cover"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cover Image *</FormLabel>
                            <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">Upload cover image</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'cover', false)}
                                        className="hidden"
                                        id="cover-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('cover-upload')?.click()}
                                    >
                                        Choose Image
                                    </Button>
                                    {field.value && <p className="text-xs text-green-600 mt-2">Selected: {field.value.name}</p>}
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
                            <FormLabel>PDF File *</FormLabel>
                            <FormControl>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600 mb-2">Upload PDF file</p>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => handleFileChange(e, 'pdf', false)}
                                        className="hidden"
                                        id="pdf-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => document.getElementById('pdf-upload')?.click()}
                                    >
                                        Choose PDF
                                    </Button>
                                    {field.value && <p className="text-xs text-green-600 mt-2">Selected: {field.value.name}</p>}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Upload Magazine
                    </Button>
                    <Button type="button" variant="outline" onClick={handleUploadCancel} className="flex-1 bg-transparent">
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );

    // Render edit form
    const renderEditForm = () => (
        <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSave)} className="space-y-6 mx-4">
                {/* Current Cover Preview */}
                {editingMagazine && (
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Current Cover</Label>
                        <div className="relative aspect-[3/4] w-32 bg-gray-100 rounded-lg overflow-hidden group">
                            <img
                                src={editCoverPreview || editingMagazine.cover_image_url}
                                alt={editingMagazine.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                onClick={() => setEditCoverPreview('/placeholder.svg?height=400&width=300')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* New Cover Upload */}
                <FormField
                    control={editForm.control}
                    name="cover"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div>{renderFileUploadArea('cover', true, editingMagazine?.cover_image_url)}</div>
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
                                <div>{renderFileUploadArea('pdf', true)}</div>
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
                                    placeholder="Enter magazine title"
                                    {...field}
                                    className="focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Description */}
                {/* <FormField
          control={editForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter magazine description"
                  rows={3}
                  {...field}
                  className="focus-visible:ring-2 focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

                {/* Edition and Year */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={editForm.control}
                        name="edition"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Edition</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g., Volume 1, Issue 1"
                                        {...field}
                                        className="focus-visible:ring-2 focus-visible:ring-primary"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={editForm.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl>
                                    <Input placeholder="2024" {...field} className="focus-visible:ring-2 focus-visible:ring-primary" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Category and Status */}
                {/* <div className="grid grid-cols-2 gap-4">
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
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions
                      .filter((status) => status !== "All")
                      .map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}

                {/* Author and ISSN */}
                {/* <div className="grid grid-cols-2 gap-4">
          <FormField
            control={editForm.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author/Publisher</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter author or publisher"
                    {...field}
                    className="focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={editForm.control}
            name="issn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ISSN</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter ISSN"
                    {...field}
                    className="focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div> */}

                {/* Action Buttons */}
                <div className="flex gap-3 pb-4">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer">
                        Update Magazine
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
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Magazine Management</h1>
                    <p className="text-muted-foreground">Upload and manage magazine publications</p>
                </div>
                {/* Upload Dialog */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                            <Plus className="h-4 w-4" />
                            Upload Magazine
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">Upload New Magazine</DialogTitle>
                            <p className="text-sm text-muted-foreground">Add a new magazine issue to the collection</p>
                        </DialogHeader>
                        <div className="mt-4">{renderUploadForm()}</div>
                    </DialogContent>
                </Dialog>
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
                        <CardTitle className="text-2xl font-bold">{stats.thisYear.length}</CardTitle>
                        <CardDescription>This Year</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold">{stats.published}</CardTitle>
                        <CardDescription>Published</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-2xl font-bold">{stats.totalSize} MB</CardTitle>
                        <CardDescription>Total Size</CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Search and Filter Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Label htmlFor="search-title" className="text-sm font-medium">
                            Search by Title or Author
                        </Label>
                        <Input
                            id="search-title"
                            placeholder="Enter magazine title or author..."
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Label className="text-sm font-medium">Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                    <div className="w-full sm:w-48">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="mt-1">
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
                        <Label className="text-sm font-medium">Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal bg-transparent">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                                            </>
                                        ) : (
                                            format(dateRange.from, 'LLL dd, y')
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
                    <Button onClick={handleSearch} className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
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
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="cursor-pointer"
                        >
                            Table
                        </Button>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
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
                        <SheetTitle className="text-xl font-semibold">Edit Magazine</SheetTitle>
                        <SheetDescription className="text-muted-foreground">
                            Update magazine details and optionally replace files.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="px-1">{renderEditForm()}</div>
                </SheetContent>
            </Sheet>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteMagazineId !== null} onOpenChange={() => setDeleteMagazineId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the magazine from your collection.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer hover:bg-gray-300">Cancel</AlertDialogCancel>
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
            <Dialog open={previewMagazine !== null} onOpenChange={() => setPreviewMagazine(null)}>
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
                                    {/* <p className="text-sm text-muted-foreground">{previewMagazine.description}</p> */}
                                    <div className="flex gap-4 text-xs text-muted-foreground">
                                        <span>{previewMagazine.edition}</span>
                                        <span>{previewMagazine.year}</span>
                                        {/* <span>{previewMagazine.author}</span> */}
                                    </div>
                                </div>
                                <Badge variant={previewMagazine.status === 'Published' ? 'default' : 'secondary'}>
                                    {previewMagazine.status}
                                </Badge>
                            </div>
                            <div className="border rounded-lg overflow-hidden bg-gray-50">
                                <div className="flex justify-between items-center p-4 border-b bg-white">
                                    <span className="text-sm font-medium">
                                        Page {pageNumber} of {numPages || '?'}
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
                                            onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
                                            disabled={pageNumber >= (numPages || 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-center p-4 max-h-[60vh] overflow-auto">
                                    <Document
                                        file={previewMagazine.file_url}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={
                                            <div className="flex items-center justify-center h-96">
                                                <div className="text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                                    <p className="text-sm text-muted-foreground">Loading PDF...</p>
                                                </div>
                                            </div>
                                        }
                                        error={
                                            <div className="flex items-center justify-center h-96">
                                                <div className="text-center">
                                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground">Unable to load PDF preview</p>
                                                    <p className="text-xs text-muted-foreground mt-1">PDF file may not be available</p>
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
                    <p className="text-sm text-muted-foreground">Manage your magazine collection</p>
                </div>

                {viewMode === 'table' ? (
                    // Table View
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Cover</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Edition</TableHead>
                                    <TableHead>Year</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Upload Date</TableHead>
                                    <TableHead className="w-32">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
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
                                        <TableRow key={magazine.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="aspect-[3/4] w-12 bg-gray-100 rounded overflow-hidden">
                                                    <img
                                                        src={magazine.cover_image_url || '/placeholder.svg'}
                                                        alt={magazine.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{magazine.title}</p>
                                            </TableCell>
                                            <TableCell className="text-sm">{magazine.edition}</TableCell>
                                            <TableCell className="text-sm">{magazine.year}</TableCell>
                                            <TableCell className="text-sm">{magazine.size_mb} MB</TableCell>
                                            <TableCell>
                                                <Badge variant={magazine.status === 'Published' ? 'default' : 'secondary'}>
                                                    {magazine.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {format(new Date(magazine.upload_date), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
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
                                                        <DropdownMenuItem className="cursor-pointer">
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
                                                            onClick={() => setDeleteMagazineId(magazine.id)}
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
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-12">
                                            <p className="text-muted-foreground">No magazines found matching your criteria.</p>
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
                                    key={magazine.id}
                                    className="overflow-hidden hover:shadow-2xl transition-all duration-200 border group"
                                >
                                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                        <img
                                            src={magazine.cover_image_url || '/placeholder.svg'}
                                            alt={magazine.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditOpen(magazine)} className="cursor-pointer">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => setDeleteMagazineId(magazine.id)}
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
                                        <CardTitle className="text-sm font-medium line-clamp-1">{magazine.title}</CardTitle>
                                        {/* <CardDescription className="text-xs line-clamp-2">{magazine.description}</CardDescription> */}
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>{magazine.edition}</span>
                                            <span>{magazine.year}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex justify-between items-center">
                                            <Badge variant={magazine.status === 'Published' ? 'default' : 'secondary'} className="text-xs">
                                                {magazine.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">{magazine.size_mb} MB</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground">No magazines found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
