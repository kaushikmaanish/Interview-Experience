"use client"

import Link from "next/link";
import { ArrowRight, ChevronRight, Star, Briefcase, TrendingUp, User } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/searchBox";
import { TrendingInterviews } from "@/components/trending-interviews";
import { CompanyLogos } from "@/components/company-logos";
import { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Enhanced animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
    },
  },
};

const defaultAvatar = "/default-avatar.png";
interface UserPhoto {
  photoURL: string;
}

export default function Page() {

  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([]);

  useEffect(() => {
    axios.get<{ userPhotos: UserPhoto[] }>(`${process.env.NEXT_PUBLIC_API_URL}/users/photos`)
      .then(response => setUserPhotos(response.data.userPhotos))
      .catch(error => console.error("Error fetching user photos:", error));
  }, []);


  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section - Enhanced with background pattern and improved layout */}
      <section className="relative w-full py-24 md:py-36 lg:py-12 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="container relative px-4 md:px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col items-center space-y-8 text-center"
          >
            <motion.div variants={fadeInUp} className="space-y-5 max-w-4xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                <Star className="w-4 h-4 mr-2" />
                Join our growing community of interview sharers
              </div>
              <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none">
                Share Your <span className="bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary">Interview Experience</span>
              </h1>
              <p className="mx-auto max-w-[800px] text-xl text-muted-foreground md:text-2xl font-light">
                Help others prepare for their interviews by sharing your experience. Learn from real stories by professionals who've been through the process.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="w-full max-w-2xl flex justify-center items-center mx-auto"
            >
              <div className="w-full flex justify-center">
                <SearchBox />
              </div>
            </motion.div>


            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button asChild size="lg" className="px-8 py-6 text-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                <Link href="/submit" className="flex items-center">
                  Share Your Experience
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg hover:bg-muted/50 transition-all duration-300">
                <Link href="/interviews" className="flex items-center">
                  Browse Interviews
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-10 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {userPhotos.length > 0 ? (
                  userPhotos.map((user, i) => (
                    <Avatar key={i} className="w-8 h-8 border-2 border-background">
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  ))
                ) : (
                  [...Array(5)].map((_, i) => (
                    <Avatar key={i} className="w-8 h-8 border-2 border-background">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  ))
                )}
              </div>
              <span>Join <span className="font-medium text-foreground">100+</span> professionals who shared their stories</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trusted Companies Section - With improved visual design */}
      <section className="w-full py-20 md:py-28 bg-background relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"></div>
        <div className="container px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center justify-center space-y-10"
          >
            <motion.div variants={fadeInRight} className="space-y-4 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-2">
                <Briefcase className="w-4 h-4 mr-2" />
                Top Companies
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Trusted by Candidates from <span className="bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary">Leading Organizations</span>
              </h2>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
                Join thousands of candidates who have shared their valuable interview experiences from around the world.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="w-full">
              <CompanyLogos />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trending Interviews Section - With cards and visual improvements */}
      <section className="w-full py-20 md:py-28 bg-muted/30 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-transparent"></div>
        <div className="container px-4 md:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center justify-center space-y-10"
          >
            <motion.div variants={fadeInRight} className="space-y-4 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Popular Now
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Trending <span className="bg-clip-text text-transparent bg-gradient-to-b from-primary to-secondary">Interview Experiences</span>
              </h2>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground">
                Discover the most popular and recent interview experiences shared by our community.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="w-full">
              <TrendingInterviews />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button asChild variant="outline" size="lg" className="px-6 py-6 text-lg hover:bg-muted/70 transition-all duration-300">
                <Link href="/interviews" className="flex items-center">
                  View All Interview Experiences
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Call to action footer */}
        <div className="container px-4 md:px-6 mt-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-border p-1"
          >
            <div className="bg-background rounded-[calc(1.5rem-2px)] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left space-y-4 max-w-lg">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Ready to share your interview story?
                </h3>
                <p className="text-muted-foreground">
                  Your experience today could help someone get their dream job tomorrow.
                </p>
              </div>
              <Button
                size="lg"
                className="px-8 py-6 text-lg bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
              >
                <Link href="/submit" className="flex items-center">
                  Share Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

      </section>
    </div>
  );
}
