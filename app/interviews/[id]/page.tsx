"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";  // Import motion from framer-motion
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Share2, Calendar } from "lucide-react";
import { InterviewComments } from "@/components/interview-comments";
import LikeButton from "@/components/LikeButton";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FormattedContent } from "@/components/formatted-content";
import ShareButton from "@/components/sharebutton"




export default function InterviewDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Fetch interview data
  useEffect(() => {
    if (!id) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/interviews/${id}`)
      .then((response) => {
        setInterview(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load interview details. Please try again.");
        setLoading(false);
      });
  }, [id]);



  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!interview) return <p className="text-center py-10">No interview found.</p>;


  const title = interview.company + " Interview Experience\n\n"
  const text = interview.experience.replace(/<[^>]*>/g, "").slice(0, 200);
  const url = window.location.href
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container py-10"
    >
      <motion.div
        className="grid gap-6 lg:grid-cols-[1fr_300px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="space-y-6">
          {/* Like, Comment, Share Buttons */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-4">
              <LikeButton
                entityId={interview._id}
                entityType={"interview"}
                initialLikes={interview.likes || 0}
                userLiked={user ? (Array.isArray(interview.likedBy) ? interview.likedBy.includes(user.uid) : false) : true}
              />
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <span className="font-medium">{interview.comments}</span>
              <ShareButton title={title} text={text} url={url} />
            </div>
            <Button variant="outline" asChild>
              <Link href="/interviews">Back to Interviews</Link>
            </Button>
          </motion.div>

          {/* Interview Title & Tags */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold">{interview.company} Interview Experience</h1>
            <div className="flex flex-wrap gap-2">
              {interview.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Author Section */}
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Avatar className="h-10 w-10">
              {interview.authorName === "Anonymous" ? (
                <AvatarFallback>
                  <img src="/hacker.png" className="h-10 w-10 rounded-full" />
                </AvatarFallback>
              ) : (
                <AvatarImage src={interview.authorAvatar} alt={interview.author?.name} />
              )}
            </Avatar>
            <div>
              <p className="font-medium">{interview.authorName || "Anonymous"}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                <span>{new Date(interview.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>


          <Separator />

          {/* Interview Content */}
          <motion.div
            className="prose prose-sm dark:prose-invert max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FormattedContent content={interview.experience} />
          </motion.div>

          {/* Interview Questions Section */}
          <motion.div className="space-y-4">
            <h2 className="text-2xl font-bold">Interview Questions</h2>

            {interview.questions.length > 0 ? (
              interview.questions.map((q: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-bold">Q: {q.question}</h3>
                      <div className="mt-2">
                        <FormattedContent content={q.answer} className="prose-sm" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">No interview questions available.</p>
            )}
          </motion.div>


          {/* Comments Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Separator />
            <InterviewComments interviewId={interview._id} />
          </motion.div>
        </div>

        {/* Sidebar */}
        {/* <motion.div className="space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-lg">Interview Details</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Company: {interview.company}</span>

                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div> */}
      </motion.div>
    </motion.div>
  );
}
