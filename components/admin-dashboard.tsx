"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Flag, Trash, X, Search, Filter, MoreVertical, Users, Clock, AlertTriangle, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Interview = {
  _id: string;
  company: string;
  role: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  status: string;
  content?: string;
  flags?: {
    reason: string;
    reportedBy: string;
    date: string;
  }[];
};

type Stats = {
  totalInterviews: number;
  activeUsers: number;
  pendingReviews: number;
  flaggedContent: number;
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalInterviews: 0,
    activeUsers: 0,
    pendingReviews: 0,
    flaggedContent: 0,
  });
  const [flaggedInterviews, setFlaggedInterviews] = useState<Interview[]>([]);
  const [pendingInterviews, setPendingInterviews] = useState<Interview[]>([]);
  const [allInterviews, setAllInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [adminKeyDialog, setAdminKeyDialog] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
      }

      const [statsRes, flaggedRes, pendingRes, allRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/flagged-interviews`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/pending-interviews`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/interviews/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data);
      setFlaggedInterviews(flaggedRes.data);
      setPendingInterviews(pendingRes.data);
      setAllInterviews(allRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (interviewId: string, type: "flagged" | "pending") => {
    try {
      if (!user?.token) return;
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/approve-interview/${interviewId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Update local state
      if (type === "flagged") {
        setFlaggedInterviews((prev) => prev.filter((i) => i._id !== interviewId));
      } else {
        setPendingInterviews((prev) => prev.filter((i) => i._id !== interviewId));
      }

      toast.success("Interview approved successfully");
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error("Error approving interview:", error);
      toast.error("Failed to approve interview");
    }
  };

  const handleReject = async (interviewId: string, type: "flagged" | "pending") => {
    try {
      if (!user?.token) return;

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/reject-interview/${interviewId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Update local state
      if (type === "flagged") {
        setFlaggedInterviews((prev) => prev.filter((i) => i._id !== interviewId));
      } else {
        setPendingInterviews((prev) => prev.filter((i) => i._id !== interviewId));
      }

      toast.success("Interview rejected successfully");
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error("Error rejecting interview:", error);
      toast.error("Failed to reject interview");
    }
  };

  const handleDelete = async (interviewId: string) => {
    try {
      if (!user?.token) return;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/delete-interview/${interviewId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setFlaggedInterviews((prev) => prev.filter((i) => i._id !== interviewId));
      toast.success("Interview deleted successfully");
      fetchDashboardData(); // Refresh stats
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast.error("Failed to delete interview");
    }
  };

  const handleViewDetails = async (interview: Interview) => {
    try {
      if (!user?.token) return;

      // Fetch full interview details if not already loaded
      if (!interview.content) {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/interview/${interview._id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setSelectedInterview(data);
      } else {
        setSelectedInterview(interview);
      }
      setShowDetailsDialog(true);
    } catch (error) {
      console.error("Error fetching interview details:", error);
      toast.error("Failed to load interview details");
    }
  };

  const generateAdminKey = async () => {
    try {
      setGeneratingKey(true);
      if (!user?.token) return;

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/generate-admin-key`,
        { email: newAdminEmail },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setGeneratedKey(data.adminKey);
      toast.success("Admin key generated successfully");
    } catch (error) {
      console.error("Error generating admin key:", error);
      toast.error("Failed to generate admin key");
    } finally {
      setGeneratingKey(false);
    }
  };

  const filteredFlagged = flaggedInterviews.filter(
    (interview) =>
      (interview.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || interview.status === filterStatus)
  );

  const filteredPending = pendingInterviews.filter(
    (interview) =>
      (interview.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || interview.status === filterStatus)
  );

  const filteredAll = allInterviews.filter(
    (interview) =>
      (interview.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.role.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === "all" || interview.status === filterStatus)
  );

  return (
    <div className="space-y-6 p-6 pb-16">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and moderate content on the platform</p>
        </div>
        <Button onClick={() => setAdminKeyDialog(true)}>Generate Admin Key</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalInterviews}</div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
            )}
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pendingReviews > 0 && "Requires attention"}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.flaggedContent}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats.flaggedContent > 0 && "Requires moderation"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by company or role..."
            className="pl-10 pr-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
              Pending Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("flagged")}>
              Flagged Only
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="flagged">
        <TabsList className="mb-4">
          <TabsTrigger value="flagged" className="relative group data-[state=active]:bg-destructive/10">
            Flagged Content
            {stats.flaggedContent > 0 && (
              <Badge variant="destructive" className="ml-2 group-data-[state=active]:bg-destructive">
                {stats.flaggedContent}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative group data-[state=active]:bg-primary/10">
            Pending Reviews
            {stats.pendingReviews > 0 && (
              <Badge variant="secondary" className="ml-2 group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground">
                {stats.pendingReviews}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="relative group data-[state=active]:bg-secondary/10">
            All Interviews
            <Badge variant="secondary" className="ml-2 group-data-[state=active]:bg-secondary group-data-[state=active]:text-secondary-foreground">
              {stats.totalInterviews}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-destructive" />
                Flagged Interviews
              </CardTitle>
              <CardDescription>
                Review and moderate interviews that have been flagged by users for inappropriate content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredFlagged.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Flag className="h-8 w-8 mb-2 opacity-50" />
                            <p>No flagged interviews found</p>
                            <p className="text-sm">All content is in good standing</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFlagged.map((interview) => (
                        <TableRow key={interview._id} className="group">
                          <TableCell className="font-medium">
                            {interview.company}
                          </TableCell>
                          <TableCell>{interview.role}</TableCell>
                          <TableCell>{interview.authorName}</TableCell>
                          <TableCell>
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {interview.flags?.length || 0} flags
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(interview._id, "flagged")}
                                title="Approve and remove flags"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(interview._id)}
                                title="Delete interview"
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(interview)}
                                title="View details"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Pending Reviews
              </CardTitle>
              <CardDescription>
                Review and approve new interview submissions before they are published
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredPending.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <Clock className="h-8 w-8 mb-2 opacity-50" />
                            <p>No pending interviews found</p>
                            <p className="text-sm">All submissions have been reviewed</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPending.map((interview) => (
                        <TableRow key={interview._id} className="group">
                          <TableCell className="font-medium">
                            {interview.company}
                          </TableCell>
                          <TableCell>{interview.role}</TableCell>
                          <TableCell>{interview.authorName}</TableCell>
                          <TableCell>
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(interview._id, "pending")}
                                title="Approve interview"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReject(interview._id, "pending")}
                                title="Reject interview"
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(interview)}
                                title="View details"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Interviews Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                All Interviews
              </CardTitle>
              <CardDescription>
                View and manage all interviews on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredAll.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <FileText className="h-8 w-8 mb-2 opacity-50" />
                            <p>No interviews found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAll.map((interview) => (
                        <TableRow key={interview._id} className="group">
                          <TableCell className="font-medium">
                            {interview.company}
                          </TableCell>
                          <TableCell>{interview.role}</TableCell>
                          <TableCell>{interview.authorName}</TableCell>
                          <TableCell>
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                interview.status === "pending" && "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
                                interview.status === "flagged" && "bg-destructive/10 text-destructive border-destructive/20",
                                interview.status === "approved" && "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800"
                              )}
                            >
                              {interview.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewDetails(interview)}
                                title="View details"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Interview Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Interview Details</DialogTitle>
            <DialogDescription>
              Full interview information and moderation history
            </DialogDescription>
          </DialogHeader>

          {selectedInterview ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Company</h4>
                  <p className="text-base">{selectedInterview.company}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Role</h4>
                  <p className="text-base">{selectedInterview.role}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Author</h4>
                  <p className="text-base">{selectedInterview.authorName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Date</h4>
                  <p className="text-base">{new Date(selectedInterview.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedInterview.content && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Content</h4>
                  <div className="border rounded-md p-4 bg-muted/30 text-sm whitespace-pre-line">
                    {selectedInterview.content}
                  </div>
                </div>
              )}

              {selectedInterview.flags && selectedInterview.flags.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Flag History</h4>
                  <div className="space-y-2">
                    {selectedInterview.flags.map((flag, index) => (
                      <div key={index} className="text-sm border rounded-md p-3 bg-destructive/5">
                        <p><span className="font-medium">Reason:</span> {flag.reason}</p>
                        <p><span className="font-medium">Reported by:</span> {flag.reportedBy}</p>
                        <p><span className="font-medium">Date:</span> {new Date(flag.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedInterview._id);
                    setShowDetailsDialog(false);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Interview
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    handleApprove(selectedInterview._id, selectedInterview.flags?.length ? "flagged" : "pending");
                    setShowDetailsDialog(false);
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Interview
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Key Generation Dialog */}
      <Dialog open={adminKeyDialog} onOpenChange={setAdminKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Admin Key</DialogTitle>
            <DialogDescription>
              Create an admin access key for a new administrator
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium">
                New Admin Email
              </label>
              <Input
                id="admin-email"
                type="email"
                placeholder="example@email.com"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This email will be granted administrator privileges
              </p>
            </div>

            {generatedKey && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Key</label>
                <div className="flex">
                  <Input
                    value={generatedKey}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedKey);
                      toast.success("Admin key copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Save this key securely! It will only be shown once.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setAdminKeyDialog(false);
                setNewAdminEmail("");
                setGeneratedKey("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={generateAdminKey}
              disabled={!newAdminEmail || generatingKey}
            >
              {generatingKey ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                "Generate Key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
