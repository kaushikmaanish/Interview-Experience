"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, Reply, Pencil, Trash, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import LikeButton from "@/components/LikeButton";


// Types
interface Author {
  id: string;
  name: string;
  avatar: string;
  initials: string;
}

interface Comment {
  _id: string;
  authorId: string;
  author: Author;
  content: string;
  createdAt: string;
  likes: number;
  isAuthor?: boolean;
  likedBy: string[];
  parentCommentId?: string | null;
}

export function InterviewComments({ interviewId }: { interviewId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const auth = getAuth();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Fetch comments on component mount
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/comments/${interviewId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch comments: ${response.status}`);
        }

        const data = await response.json();
        setComments(data);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [interviewId]);

  // Submit a new comment or reply
  const handleSubmitComment = async (e: React.FormEvent, parentCommentId: string | null = null) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to comment.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          interviewId,
          content: newComment,
          parentCommentId
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to post comment: ${response.status}`);
      }

      const comment = await response.json();

      // Add the new comment to the beginning of the list
      setComments(prev => [comment, ...prev]);
      setNewComment("");
      setReplyingTo(null);

      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
    } catch (err) {
      console.error("Error posting comment:", err);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit an existing comment
  const handleEditComment = async (commentId: string) => {
    if (!user) return;
    if (!editContent.trim()) return;

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) {
        throw new Error(`Failed to edit comment: ${response.status}`);
      }

      // Update the comment in the state
      setComments(prev =>
        prev.map(c => c._id === commentId ? { ...c, content: editContent } : c)
      );
      setEditingComment(null);
      setEditContent("");

      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    } catch (err) {
      console.error("Error editing comment:", err);
      toast({
        title: "Error",
        description: "Failed to edit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsLoading(true);
    try {
      const token = await user.getIdToken();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete comment: ${response.status}`);
      }

      // Remove the comment from the state
      setComments(prev => prev.filter(c => c._id !== commentId));

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get replies for a specific comment
  const getReplies = (commentId: string) => {
    return comments.filter(comment => comment.parentCommentId === commentId);
  };

  // Get top-level comments
  const topLevelComments = comments.filter(comment => !comment.parentCommentId);

  // Render a comment and its replies recursively
  const renderComment = (comment: Comment) => (
    <div key={comment._id} className="space-y-4">
      <div className="flex items-start space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author.avatar || "/placeholder.svg?height=40&width=40"} alt={comment.author.name} />
          <AvatarFallback>{comment.author.initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center">
            <span className="font-medium">{comment.author.name}</span>
            {comment.isAuthor && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Author</span>
            )}
            <span className="ml-2 text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
          </div>

          {editingComment === comment._id ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditComment(comment._id);
            }} className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading || !editContent.trim()}>
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <p>{comment.content}</p>
          )}

          <div className="flex items-center space-x-4 pt-1">
            {/* <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => handleLikeComment(comment._id)}
              disabled={isLoading || !user}
            >
              <ThumbsUp className="mr-1 h-4 w-4" />
              <span>{comment.likes || 0}</span>
            </Button> */}
            <LikeButton
              entityId={comment._id}
              entityType={"comment"}
              initialLikes={comment.likes || 0}
              userLiked={user ? (Array.isArray(comment.likedBy) ? comment.likedBy.includes(user.uid) : false) : true} //  Ensure `likedBy` is an array
            />


            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                setReplyingTo(replyingTo === comment._id ? null : comment._id);
                setEditingComment(null);
              }}
              disabled={isLoading || !user}
            >
              <Reply className="mr-1 h-4 w-4" />
              <span>Reply</span>
            </Button>

            {user && user.uid === comment.authorId && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => {
                    setEditingComment(editingComment === comment._id ? null : comment._id);
                    setEditContent(comment.content);
                    setReplyingTo(null);
                  }}
                  disabled={isLoading}
                >
                  <Pencil className="mr-1 h-4 w-4" />
                  <span>Edit</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                  onClick={() => handleDeleteComment(comment._id)}
                  disabled={isLoading}
                >
                  <Trash className="mr-1 h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </>
            )}
          </div>

          {replyingTo === comment._id && (
            <form
              onSubmit={(e) => handleSubmitComment(e, comment._id)}
              className="mt-4 space-y-2"
            >
              <Textarea
                placeholder="Write a reply..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={isLoading || !newComment.trim()}
                >
                  Reply
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Render replies */}
      {getReplies(comment._id).length > 0 && (
        <div className="ml-12 border-l-2 pl-4 border-muted space-y-4">
          {getReplies(comment._id).map(reply => renderComment(reply))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      {user ? (
        <form onSubmit={(e) => handleSubmitComment(e)} className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !newComment.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Posting...</span>
              </div>
            ) : (
              "Post Comment"
            )}
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-muted rounded-md">
          <p>Please log in to add a comment.</p>
        </div>
      )}

      <div className="space-y-8">
        {isLoading && comments.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : topLevelComments.length > 0 ? (
          topLevelComments.map(comment => renderComment(comment))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}
