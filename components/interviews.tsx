"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, ThumbsUp, Loader2, Building, UserCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Interview = {
  _id: string;
  company: string;
  role: string;
  level: string;
  tags?: string[];
  authorName: string;
  authorAvatar?: string;
  author?: { name: string; initials: string };
  createdAt: string;
  likes: number;
  comments: number;
  experience?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.02 },
};

export function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const queryParams = searchParams.toString();
        const response = await axios.get<Interview[]>(
          `${process.env.NEXT_PUBLIC_API_URL}/interviews?${queryParams}`
        );
        setInterviews(response.data);
      } catch (err) {
        setError("Failed to fetch interviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading interviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium">No interviews found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-4 flex-wrap items-center justify-center min-h-screen"
    >
      <AnimatePresence>
        {interviews.map((interview) => {
          const interviewId = interview._id ? encodeURIComponent(interview._id) : null;

          return interviewId ? (
            <motion.div
              key={interview._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="h-full"
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link href={`/interviews/${interviewId}`} className="group block h-full">
                <Card className="flex flex-col h-full border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/30 rounded-xl shadow-sm">
                  <CardHeader className="p-6 pb-4 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 shrink-0 text-primary" />
                          <CardTitle className="text-xl font-bold tracking-tight leading-tight truncate">
                            {interview.company}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <p className="text-sm font-medium text-muted-foreground truncate">
                            {interview.role}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-3 py-1 text-xs font-semibold rounded-full shrink-0",
                          interview.level === "Senior" && "bg-blue-50 text-blue-700 border-blue-200",
                          interview.level === "Mid" && "bg-green-50 text-green-700 border-green-200",
                          interview.level === "Junior" && "bg-purple-50 text-purple-700 border-purple-200",
                          interview.level === "Internship" && "bg-orange-50 text-orange-700 border-orange-200"
                        )}
                      >
                        {interview.level}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 py-3 flex-grow">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {interview.tags?.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2.5 py-1 bg-secondary/30 rounded-md">
                          {tag}
                        </Badge>
                      ))}
                      {interview.tags && interview.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs px-2.5 py-1 bg-secondary/30 rounded-md">
                          +{interview.tags.length - 3} more
                        </Badge>
                      )}
                      {!interview.tags?.length && <span className="text-xs text-muted-foreground">No tags</span>}
                    </div>
                    {interview.experience && (
                      <p className="text-sm text-muted-foreground line-clamp-3 hover:line-clamp-none transition-all">
                        {interview.experience}
                      </p>
                    )}
                  </CardContent>

                  <CardFooter className="px-6 py-4 mt-auto border-t bg-muted/10">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0 ring-2 ring-background">
                          {interview.authorName === "Anonymous" ? (
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              <img src="/hacker.png" alt="Anonymous" className="h-8 w-8 rounded-full" />
                            </AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage src={interview.authorAvatar} alt={interview.author?.name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {interview.author?.initials || interview.authorName?.charAt(0) || "?"}
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>

                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">{interview.authorName || "Unknown Author"}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3 shrink-0" />
                            <time dateTime={interview.createdAt} className="truncate">
                              {new Date(interview.createdAt).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-muted-foreground shrink-0">
                        <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-xs font-medium">{interview.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs font-medium">{interview.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ) : null;
        })}
      </AnimatePresence>
    </motion.div>
  );
}
