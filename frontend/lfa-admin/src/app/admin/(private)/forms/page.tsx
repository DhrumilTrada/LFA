"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Users } from "lucide-react";
import CreateFormModal from "@/components/create-form-modal";
import FormBuilderModal from "@/components/form-builder-modal";
import FormSubmissionsModal from "@/components/form-submissions-modal";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data
const mockForms = [
  {
    id: 1,
    title: "Contact Form",
    description: "General contact form for website visitors",
    fields: 5,
    submissions: 23,
    isPublished: true,
    createdAt: "2024-01-15",
    fields_data: [
      { id: 1, name: "name", type: "text", required: true, label: "Full Name" },
      {
        id: 2,
        name: "email",
        type: "email",
        required: true,
        label: "Email Address",
      },
      {
        id: 3,
        name: "phone",
        type: "text",
        required: false,
        label: "Phone Number",
      },
      {
        id: 4,
        name: "subject",
        type: "text",
        required: true,
        label: "Subject",
      },
      {
        id: 5,
        name: "message",
        type: "textarea",
        required: true,
        label: "Message",
      },
    ],
  },
  {
    id: 2,
    title: "Event Registration",
    description: "Registration form for upcoming events",
    fields: 7,
    submissions: 45,
    isPublished: true,
    createdAt: "2024-01-10",
    fields_data: [
      { id: 1, name: "name", type: "text", required: true, label: "Full Name" },
      { id: 2, name: "email", type: "email", required: true, label: "Email" },
      {
        id: 3,
        name: "event",
        type: "dropdown",
        required: true,
        label: "Event Type",
        options: ["Workshop", "Seminar", "Conference"],
      },
      {
        id: 4,
        name: "dietary",
        type: "dropdown",
        required: false,
        label: "Dietary Requirements",
        options: ["None", "Vegetarian", "Vegan", "Gluten-free"],
      },
    ],
  },
  {
    id: 3,
    title: "Feedback Survey",
    description: "Customer feedback and satisfaction survey",
    fields: 4,
    submissions: 12,
    isPublished: false,
    createdAt: "2024-01-20",
    fields_data: [
      {
        id: 1,
        name: "rating",
        type: "dropdown",
        required: true,
        label: "Overall Rating",
        options: ["1", "2", "3", "4", "5"],
      },
      {
        id: 2,
        name: "feedback",
        type: "textarea",
        required: true,
        label: "Feedback",
      },
    ],
  },
];

export default function FormBuilder() {
  const [forms, setForms] = useState<Form[]>(mockForms);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  interface Form {
    id: number;
    title: string;
    description: string;
    fields: number;
    submissions: number;
    isPublished: boolean;
    createdAt: string;
    fields_data: Array<{
      id: number;
      name: string;
      type: string;
      required: boolean;
      label: string;
      options?: string[];
    }>;
  }

  // Update your handler functions with proper typing
  const handleCreateForm = (formData: {
    title: string;
    description: string;
  }) => {
    const newForm: Form = {
      id: Date.now(),
      ...formData,
      fields: 0,
      submissions: 0,
      isPublished: false,
      createdAt: new Date().toISOString().split("T")[0],
      fields_data: [],
    };
    setForms([...forms, newForm]);
    setEditingForm(newForm);
    setShowCreateModal(false);
    setShowBuilderModal(true);
  };

  const handleEditForm = (form: Form) => {
    setEditingForm(form);
    setShowBuilderModal(true);
  };

  const handleDeleteForm = (formId: number) => {
    setForms(forms.filter((form) => form.id !== formId));
  };

  const handleSaveForm = (updatedForm: Form) => {
    setForms(
      forms.map((form) => (form.id === updatedForm.id ? updatedForm : form))
    );
    setShowBuilderModal(false);
    setEditingForm(null);
  };

  // When opening modal:
  const handleViewSubmissions = (form: Form) => {
    setSelectedForm(form);
    setShowSubmissionsModal(true);
  };

  return (
    <div className="min-h-screen ">
      <div className="px-6 mb-4 md:mb-0 lg:mb-0">
        {/* Header */}
        <div className="mb-4">
          {/* <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Form Builder
          </h1> */}
          <p className="text-gray-600">
            Create, manage, and track your forms with ease
          </p>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 focus-visible:ring-2 focus-visible:ring-primary" />
            <Input
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>

        {/* Forms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4 bg-gray-300 animate-pulse" />
                      <Skeleton className="h-4 w-full bg-gray-300 animate-pulse" />
                    </div>
                    <Skeleton className="h-6 w-16 bg-gray-300 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <Skeleton className="h-4 w-16 bg-gray-300 animate-pulse" />
                    <Skeleton className="h-4 w-20 bg-gray-300 animate-pulse" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1 bg-gray-300 animate-pulse" />
                    <Skeleton className="h-8 flex-1 bg-gray-300 animate-pulse" />
                    <Skeleton className="h-8 w-8 bg-gray-300 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card
                key={form.id}
                className="hover:shadow-2xl transition-shadow border-l-4 border-l-blue-500"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900">
                        {form.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {form.description}
                      </CardDescription>
                    </div>
                    <Badge variant={form.isPublished ? "default" : "secondary"}>
                      {form.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{form.fields} fields</span>
                    <span>{form.submissions} submissions</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditForm(form)}
                      className="flex-1 cursor-pointer"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSubmissions(form)}
                      className="flex-1 cursor-pointer"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Submissions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteForm(form.id)}
                      className="text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredForms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No forms found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by creating your first form"}
            </p>
            {/* {!searchTerm && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            )} */}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateForm}
      />

      <FormBuilderModal
        open={showBuilderModal}
        onOpenChange={setShowBuilderModal}
        form={editingForm}
        onSave={handleSaveForm}
      />
      {/* 
      {selectedForm && (
        <FormSubmissionsModal
          open={showSubmissionsModal}
          onOpenChange={setShowSubmissionsModal}
          form={selectedForm}
        />
      )} */}
    </div>
  );
}
