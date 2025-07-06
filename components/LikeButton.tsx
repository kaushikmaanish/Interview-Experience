"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; //  Redirect if not logged in
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  entityId: string;
  entityType: "interview" | "comment" | "post";
  initialLikes: number;
  userLiked: boolean;
}


export default function LikeButton({ entityId, entityType, initialLikes, userLiked }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(userLiked);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async () => {
    if (!user) {
      router.push("/login"); //  Redirect to login if not authenticated
      return;
    }

    try {
      const token = await user.getIdToken(); //  Get Firebase token from logged-in user
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${entityType}s/${entityId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to update like");

      const data = await response.json();
      setLikes(data.likes);
      setLiked(!liked);
    } catch (error) {
      console.error("Like Error:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full transition-colors ${liked ? "text-blue-500" : "text-gray-500"}`}
        onClick={handleLike}
      >
        <ThumbsUp className="h-5 w-5" />
      </Button>
      <span className="font-medium">{likes}</span>
    </div>
  );
}
