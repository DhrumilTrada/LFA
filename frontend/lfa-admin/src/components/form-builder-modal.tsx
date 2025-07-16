"use client";

import { CardDescription } from "@/components/ui/card";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GripVertical, Settings, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface Field {
  id: number;
  name: string;
  type: string;
  required: boolean;
  label: string;
  options?: string[];
}

interface FormBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSave: (form: any) => void;
}

const fieldTypes = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "date", label: "Date" },
  { value: "file", label: "File Upload" },
];

export default function FormBuilderModal({
  open,
  onOpenChange,
  form,
  onSave,
}: FormBuilderModalProps) {
  const [fields, setFields] = useState<Field[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [googleSheetsLink, setGoogleSheetsLink] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (form) {
      setIsLoading(true);
      // Simulate loading delay
      const timer = setTimeout(() => {
        setFields(form.fields_data || []);
        setIsPublished(form.isPublished || false);
        setGoogleSheetsLink(form.googleSheetsLink || "");
        setIsLoading(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [form]);

  const addField = () => {
    const newField: Field = {
      id: Date.now(),
      name: `field_${fields.length + 1}`,
      type: "text",
      required: false,
      label: `Field ${fields.length + 1}`,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: number, updates: Partial<Field>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const deleteField = (id: number) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleSave = () => {
    if (form) {
      const updatedForm = {
        ...form,
        fields_data: fields,
        fields: fields.length,
        isPublished,
        googleSheetsLink,
      };
      onSave(updatedForm);
    }
  };

  const renderFieldPreview = (field: Field) => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            disabled
          />
        );
      case "dropdown":
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue
                placeholder={`Select ${field.label.toLowerCase()}...`}
              />
            </SelectTrigger>
          </Select>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" disabled />
            <label>{field.label}</label>
          </div>
        );
      case "date":
        return <Input type="date" disabled />;
      case "file":
        return <Input type="file" disabled />;
      default:
        return (
          <Input
            type={field.type}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            disabled
          />
        );
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto ">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Form Builder - {form.title}</DialogTitle>
              <DialogDescription>{form.description}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="cursor-pointer"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
              <Badge variant={isPublished ? "default" : "secondary"}>
                {isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Form Fields</h3>
              <Button
                onClick={addField}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Skeleton className="h-9" />
                          <Skeleton className="h-9" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-9" />
                        </div>
                        <div className="space-y-2 pt-6">
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : fields.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600">No fields added yet</p>
                  <Button
                    onClick={addField}
                    variant="outline"
                    className="mt-2 bg-transparent cursor-pointer"
                  >
                    Add Your First Field
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <Card key={field.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Field Label"
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, { label: e.target.value })
                            }
                            className="focus-visible:ring-2 focus-visible:ring-primary"
                          />
                          <Input
                            className="focus-visible:ring-2 focus-visible:ring-primary"
                            placeholder="Field Name"
                            value={field.name}
                            onChange={(e) =>
                              updateField(field.id, { name: e.target.value })
                            }
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteField(field.id)}
                          className="text-red-600 hover:text-red-700  cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateField(field.id, { type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) =>
                              updateField(field.id, { required: checked })
                            }
                          />
                          <Label>Required</Label>
                        </div>
                      </div>

                      {(field.type === "dropdown" ||
                        field.type === "radio") && (
                        <div>
                          <Label>Options (one per line)</Label>
                          <Textarea
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            value={field.options?.join("\n") || ""}
                            onChange={(e) =>
                              updateField(field.id, {
                                options: e.target.value
                                  .split("\n")
                                  .filter((opt) => opt.trim()),
                              })
                            }
                            rows={3}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Form Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Publish Form</Label>
                      <p className="text-sm text-gray-600">
                        Make this form publicly accessible
                      </p>
                    </div>
                    <Switch
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>
                  <Separator />
                  <div>
                    <Label>Google Sheets Integration</Label>
                    <Input
                      placeholder="https://sheets.google.com/..."
                      value={googleSheetsLink}
                      onChange={(e) => setGoogleSheetsLink(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Connect to Google Sheets to automatically save submissions
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Form Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Form Preview
            </h3>
            <Card>
              <CardHeader>
                <CardTitle>{form?.title}</CardTitle>
                {form?.description && (
                  <CardDescription>{form.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : fields.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Add fields to see the preview
                  </p>
                ) : (
                  <>
                    {fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label>
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {renderFieldPreview(field)}
                      </div>
                    ))}
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled
                    >
                      Submit Form
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            {/* <Button variant="outline">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button> */}
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Save Form
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
