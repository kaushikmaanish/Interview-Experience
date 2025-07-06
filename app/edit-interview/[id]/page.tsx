"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getAuth } from "firebase/auth"
import { FormattedContent } from "@/components/formatted-content";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Form schema based on Interview model
const formSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Job role is required"),
  level: z.enum(["internship", "fresher", "experienced"], {
    required_error: "Please select a level",
  }),
  questions: z.array(
    z.object({
      question: z.string().min(1, "Question is required"),
      answer: z.string().min(1, "Answer is required"),
    })
  ).min(1, "At least one question is required"),
  experience: z.string().min(10, "Please share your interview experience"),
  tips: z.string().optional(),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  isAnonymous: z.boolean().default(false),
  status: z.enum(["draft", "published"], {
    required_error: "Please select a status",
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Popular tags for suggestions
const popularTags = [
  "frontend", "backend", "fullstack", "devops",
  "react", "node", "python", "java",
  "data-structures", "algorithms", "system-design",
  "remote", "onsite", "leetcode", "behavioral"
];

export default function EditInterview() {
  const params = useParams();
  const interviewId = params?.id as string;
  const router = useRouter();
  const auth = getAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      role: "",
      level: "fresher",
      questions: [{ question: "", answer: "" }],
      experience: "",
      tips: "",
      tags: [],
      isAnonymous: false,
      status: "draft",
    },
  });

  // Fetch interview data on mount
  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return;

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = response.data;
        setSelectedTags(data.tags || []);

        form.reset({
          company: data.company,
          role: data.role,
          level: data.level,
          questions: data.questions.length > 0 ? data.questions : [{ question: "", answer: "" }],
          experience: data.experience,
          tips: data.tips || "",
          tags: data.tags,
          isAnonymous: data.isAnonymous,
          status: data.status,
        });
      } catch (err: any) {
        console.error("Error fetching interview:", err);
        setError(
          err.response?.status === 404
            ? "Interview not found"
            : "Failed to load interview"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, auth, form]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!auth.currentUser) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/interviews/${interviewId}`,
        {
          ...data,
          authorId: auth.currentUser.uid,
          authorName: data.isAnonymous ? "Anonymous" : auth.currentUser.displayName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Interview updated successfully");
      router.push("/profile");
    } catch (err) {
      console.error("Error updating interview:", err);
      toast.error("Failed to update interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();

      if (tag && !selectedTags.includes(tag)) {
        const newTags = [...selectedTags, tag];
        setSelectedTags(newTags);
        form.setValue("tags", newTags);
      }

      setTagInput("");
    }
  };

  // Add/remove questions
  const handleAddQuestion = () => {
    const current = form.getValues("questions");
    form.setValue("questions", [...current, { question: "", answer: "" }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const current = form.getValues("questions");
    if (current.length > 1) {
      form.setValue("questions", current.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/profile")}>
              Back to My Interviews
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Interview Experience</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Google" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Role*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="fresher">Entry Level/Fresher</SelectItem>
                    <SelectItem value="experienced">Experienced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Experience*</FormLabel>
                <FormControl>
                  <div
                    contentEditable
                    className="min-h-[200px] max-h-[300px] p-3 border rounded-md focus:outline-none overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: field.value || '' }}
                    onBlur={(e) => field.onChange(e.target.innerHTML)} // Save formatted content
                    style={{ whiteSpace: "pre-wrap" }} // Ensures text wraps properly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Questions & Answers*</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {form.watch("questions")?.map((_, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveQuestion(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name={`questions.${index}.question`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Enter the question" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`questions.${index}.answer`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div
                          contentEditable
                          className="min-h-[100px] max-h-[200px] p-3 border rounded-md focus:outline-none overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: field.value || '' }}
                          onBlur={(e) => field.onChange(e.target.innerHTML)} // Save formatted content
                          style={{ whiteSpace: "pre-wrap" }} // Ensures text wraps properly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInput}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    type="button"
                    className="ml-2 hover:text-destructive"
                    onClick={() => {
                      setSelectedTags(tags => tags.filter(t => t !== tag));
                      form.setValue("tags", selectedTags.filter(t => t !== tag));
                    }}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    if (!selectedTags.includes(tag)) {
                      setSelectedTags(tags => [...tags, tag]);
                      form.setValue("tags", [...selectedTags, tag]);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <FormField
            control={form.control}
            name="tips"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tips & Advice (Optional)</FormLabel>
                <FormControl>
                  <div
                    contentEditable
                    className="min-h-[100px] max-h-[200px] p-3 border rounded-md focus:outline-none overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: field.value || '' }}
                    onBlur={(e) => field.onChange(e.target.innerHTML)} // Save formatted content
                    style={{ whiteSpace: "pre-wrap" }} // Ensures text wraps properly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <FormField
            control={form.control}
            name="isAnonymous"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Post Anonymously</FormLabel>
                  <FormDescription>
                    Hide your identity when sharing this interview
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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
                    <SelectItem value="draft">Save as Draft</SelectItem>
                    <SelectItem value="published">Publish</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Drafts are only visible to you
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4 pt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Any unsaved changes will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Editing</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => router.push("/profile")}
                  >
                    Discard Changes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
