"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Calendar, User, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define types
interface FormField {
  id: string;
  name: string;
  label: string;
}

interface Form {
  id: number;
  title: string;
  fields_data?: FormField[];
}

interface Submission {
  id: number;
  formId: number;
  submittedAt: string;
  data: Record<string, string | number | boolean>;
}

// Mock submission data
const mockSubmissions: Submission[] = [
  {
    id: 1,
    formId: 1,
    submittedAt: "2024-01-20T10:30:00Z",
    data: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      subject: "Website Inquiry",
      message:
        "I'm interested in your services and would like to know more about pricing.",
    },
  },
  {
    id: 2,
    formId: 1,
    submittedAt: "2024-01-19T14:15:00Z",
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+0987654321",
      subject: "Support Request",
      message: "I'm having trouble with my account login. Can you help?",
    },
  },
  {
    id: 3,
    formId: 1,
    submittedAt: "2024-01-18T09:45:00Z",
    data: {
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "",
      subject: "Partnership Opportunity",
      message:
        "We'd like to discuss a potential partnership with your company.",
    },
  },
  {
    id: 4,
    formId: 2,
    submittedAt: "2024-01-17T16:20:00Z",
    data: {
      name: "Sarah Wilson",
      email: "sarah@example.com",
      event: "Workshop",
      dietary: "Vegetarian",
    },
  },
  {
    id: 5,
    formId: 2,
    submittedAt: "2024-01-16T11:30:00Z",
    data: {
      name: "David Brown",
      email: "david@example.com",
      event: "Conference",
      dietary: "None",
    },
  },
];

interface FormSubmissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: Form | null;
}

export default function FormSubmissionsModal({
  open,
  onOpenChange,
  form,
}: FormSubmissionsModalProps) {
  if (!form) return null;
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (form) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [form]);

  if (!form) return null;

  const formSubmissions = mockSubmissions.filter(
    (sub) => sub.formId === form.id
  );

  const filteredSubmissions = formSubmissions.filter((submission) => {
    const matchesSearch = Object.values(submission.data).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!matchesSearch) return false;

    if (dateFilter === "all") return true;

    const submissionDate = new Date(submission.submittedAt);
    const now = new Date();

    switch (dateFilter) {
      case "today":
        return submissionDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return submissionDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return submissionDate >= monthAgo;
      default:
        return true;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportSubmissions = () => {
    if (formSubmissions.length === 0) return;

    const csvContent = [
      // Header
      ["Submission ID", "Date", ...Object.keys(formSubmissions[0].data)].join(
        ","
      ),
      // Data rows
      ...filteredSubmissions.map((sub) =>
        [
          sub.id,
          formatDate(sub.submittedAt),
          ...Object.values(sub.data).map((val) => `"${val}"`),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, "_")}_submissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Form Submissions - {form.title}
          </DialogTitle>
          <DialogDescription>
            View and manage all submissions for this form
          </DialogDescription>
        </DialogHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isLoading ? (
            [...Array(3)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Submissions</p>
                      <p className="text-2xl font-bold">
                        {formSubmissions.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">This Week</p>
                      <p className="text-2xl font-bold">
                        {
                          formSubmissions.filter((sub) => {
                            const weekAgo = new Date(
                              Date.now() - 7 * 24 * 60 * 60 * 1000
                            );
                            return new Date(sub.submittedAt) >= weekAgo;
                          }).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold">12.5%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportSubmissions} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Submissions Table */}
        {isLoading ? (
          <Card>
            <div className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 py-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions found
              </h3>
              <p className="text-gray-600 text-center">
                {formSubmissions.length === 0
                  ? "This form hasn't received any submissions yet."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {form.fields_data?.slice(0, 3).map((field) => (
                    <TableHead key={field.id}>{field.label}</TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      {formatDate(submission.submittedAt)}
                    </TableCell>
                    {form.fields_data?.slice(0, 3).map((field) => (
                      <TableCell key={field.id}>
                        {submission.data[field.name]?.toString() || "-"}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Submission Detail Modal */}
        {selectedSubmission && (
          <Dialog
            open={!!selectedSubmission}
            onOpenChange={() => setSelectedSubmission(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submission Details</DialogTitle>
                <DialogDescription>
                  Submitted on {formatDate(selectedSubmission.submittedAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4">
                    <div className="font-medium capitalize">
                      {key.replace("_", " ")}:
                    </div>
                    <div className="col-span-2">{String(value) || "-"}</div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
