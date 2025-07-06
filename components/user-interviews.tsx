"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Edit, MoreHorizontal, Trash } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function UserInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteInterviewId, setDeleteInterviewId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError("No token found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/interviews/user-interviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterviews(response.data);
    } catch (err) {
      setError('Failed to fetch interviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (interviewId: string) => {
    router.push(`/edit-interview/${interviewId}`);
  };

  const handleDeleteRequest = (interviewId: string) => {
    setDeleteInterviewId(interviewId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteInterviewId) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error("Authentication required. Please log in again.");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${deleteInterviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setInterviews(interviews.filter((interview: any) => interview._id !== deleteInterviewId));
      toast.success("Interview experience deleted successfully");
    } catch (err) {
      toast.error("Failed to delete interview. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteInterviewId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteInterviewId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Interviews</h2>
        <Button asChild className="transition-transform duration-200 ease-in-out hover:scale-105">
          <Link href="/submit">Share New Experience</Link>
        </Button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <span className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></span>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Interview Cards */}
      {!loading && !error && (
        <div className="grid gap-6">
          {interviews.length > 0 ? (
            interviews.map((interview: {
              _id: string;
              company: string;
              role: string;
              level: string;
              status: string;
              createdAt: string;
              views?: number;
              likes?: number;
              comments?: number;
            }) => (
              <Card key={interview._id} className="transition-all duration-300 ease-in-out hover:shadow-lg">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">{interview.company}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      {interview.role} • {interview.level}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {interview.status === "draft" && (
                      <Badge variant="outline">Draft</Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="transition-transform duration-200 ease-in-out hover:scale-105">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(interview._id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRequest(interview._id)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Posted on {new Date(interview.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {interview.status === "published" ? (
                      <>
                        {interview.views || 0} views • {interview.likes || 0} likes • {interview.comments || 0} comments
                      </>
                    ) : interview.status === "draft" ? (
                      "On Draft"
                    ) : (
                      "Under Approval"
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild className="transition-transform duration-200 ease-in-out hover:scale-105">
                    <Link href={`/interviews/${interview._id}`}>
                      {"View"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-muted-foreground text-lg font-medium">
                No interviews found.
              </p>
              <p className="text-gray-500 text-sm text-center max-w-md mt-1">
                Start by sharing your interview experience and help others on their journey!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteInterviewId !== null} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent className="transition-all duration-300 ease-in-out">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this interview?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your interview experience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
