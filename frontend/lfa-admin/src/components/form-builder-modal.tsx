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
  { value: "checkbox-group", label: "Checkbox Group" },
  { value: "radio-group", label: "Radio Group" },
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
    const commonProps = (
      <div className="space-y-2">
        <Label>
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
    );

    switch (field.type) {
      case "textarea":
        return (
          <>
            {commonProps}
            <Textarea
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              disabled
            />
          </>
        );
      case "dropdown":
        return (
          <>
            {commonProps}
            <Select disabled>
              <SelectTrigger>
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}...`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, i) => (
                  <SelectItem key={i} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        );
      case "checkbox-group":
        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${field.id}-${i}`}
                    name={field.name}
                    disabled
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`${field.id}-${i}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case "radio-group":
        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.id}-${i}`}
                    name={field.name}
                    disabled
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`${field.id}-${i}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case "date":
        return (
          <>
            {commonProps}
            <Input type="date" disabled />
          </>
        );
      case "file":
        return (
          <>
            {commonProps}
            <Input type="file" disabled />
          </>
        );
      default:
        return (
          <>
            {commonProps}
            <Input
              type={field.type}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              disabled
            />
          </>
        );
    }
  };

  if (!form) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                        <Skeleton className="h-4 w-4 bg-gray-300" />
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Skeleton className="h-9 bg-gray-300" />
                          <Skeleton className="h-9 bg-gray-300" />
                        </div>
                        <Skeleton className="h-8 w-8 bg-gray-300" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16 bg-gray-300" />
                          <Skeleton className="h-9 bg-gray-300" />
                        </div>
                        <div className="space-y-2 pt-6">
                          <Skeleton className="h-5 w-20 bg-gray-300" />
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
                {fields.map((field) => (
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
                          className="text-red-600 hover:text-red-700 cursor-pointer"
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
                              updateField(field.id, {
                                type: value,
                                options: [
                                  "dropdown",
                                  "checkbox-group",
                                  "radio-group",
                                ].includes(value)
                                  ? field.options || ["Option 1"]
                                  : undefined,
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="w-full">
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
                            className="cursor-pointer"
                          />
                          <Label>Required</Label>
                        </div>
                      </div>

                      {(field.type === "dropdown" ||
                        field.type === "checkbox-group" ||
                        field.type === "radio-group") && (
                        <div>
                          <Label>Options (one per line)</Label>
                          <Textarea
                            placeholder={`Option 1\nOption 2\nOption 3`}
                            value={field.options?.join("\n") || ""}
                            onChange={(e) => {
                              const options = e.target.value
                                .split("\n")
                                .map((opt) => opt.trim())
                                .filter((opt) => opt.length > 0);

                              updateField(field.id, {
                                options: options.length > 0 ? options : [""],
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const textarea = e.currentTarget;
                                const start = textarea.selectionStart;
                                const end = textarea.selectionEnd;
                                const value = textarea.value;

                                textarea.value =
                                  value.substring(0, start) +
                                  "\n" +
                                  value.substring(end);
                                textarea.selectionStart =
                                  textarea.selectionEnd = start + 1;

                                const event = new Event("input", {
                                  bubbles: true,
                                });
                                textarea.dispatchEvent(event);
                              }
                            }}
                            rows={4}
                            className="font-mono text-sm"
                          />
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500 mr-2">
                              Press Enter to add new option
                            </span>
                            <span className="text-xs text-gray-500">
                              {field.options?.length || 0} options added
                            </span>
                          </div>
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
                      className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
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
                <CardTitle>{form.title}</CardTitle>
                {form.description && (
                  <CardDescription>{form.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-gray-300" />
                        <Skeleton className="h-9 w-full bg-gray-300" />
                      </div>
                    ))}
                    <Skeleton className="h-10 w-full bg-gray-300" />
                  </div>
                ) : fields.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Add fields to see the preview
                  </p>
                ) : (
                  <>
                    {fields.map((field) => (
                      <div key={field.id} className="space-y-3">
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
