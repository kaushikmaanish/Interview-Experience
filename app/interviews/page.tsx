import { Interviews } from "@/components/interviews"
import { InterviewFilters } from "@/components/interview-filters"

export default function InterviewsPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Interview Experiences</h1>
          <p className="text-muted-foreground">
            Browse and filter through interview experiences shared by the community
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[250px_1fr] min-h-screen">
          <InterviewFilters />
          <Interviews />
        </div>
      </div>
    </div>
  )
}
