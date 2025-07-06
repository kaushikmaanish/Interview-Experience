"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Check,
  ChevronsUpDown,
  X,
  Building2,
  Briefcase,
  User,
  Tag,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Data - would typically come from API or constants file
const companies = [
  { label: "Google", value: "google", icon: Building2 },
  { label: "Amazon", value: "amazon", icon: Building2 },
  { label: "Microsoft", value: "microsoft", icon: Building2 },
  { label: "Apple", value: "apple", icon: Building2 },
  { label: "Meta", value: "meta", icon: Building2 },
  { label: "Netflix", value: "netflix", icon: Building2 },
  { label: "Tesla", value: "tesla", icon: Building2 },
  { label: "SpaceX", value: "spacex", icon: Building2 },
  { label: "Uber", value: "uber", icon: Building2 },
  { label: "Lyft", value: "lyft", icon: Building2 },
  { label: "Airbnb", value: "airbnb", icon: Building2 },
  { label: "Twitter", value: "twitter", icon: Building2 },
  { label: "LinkedIn", value: "linkedin", icon: Building2 },
  { label: "Salesforce", value: "salesforce", icon: Building2 },
  { label: "Oracle", value: "oracle", icon: Building2 },
  { label: "IBM", value: "ibm", icon: Building2 },
  { label: "Intel", value: "intel", icon: Building2 },
  { label: "NVIDIA", value: "nvidia", icon: Building2 },
  { label: "AMD", value: "amd", icon: Building2 },
  { label: "Adobe", value: "adobe", icon: Building2 },
  { label: "Spotify", value: "spotify", icon: Building2 },
  { label: "Pinterest", value: "pinterest", icon: Building2 },
  { label: "Snapchat", value: "snapchat", icon: Building2 },
  { label: "PayPal", value: "paypal", icon: Building2 },
  { label: "Stripe", value: "stripe", icon: Building2 },
  { label: "Coinbase", value: "coinbase", icon: Building2 },
  { label: "Robinhood", value: "robinhood", icon: Building2 },
  { label: "Goldman Sachs", value: "goldman-sachs", icon: Building2 },
  { label: "JPMorgan Chase", value: "jpmorgan-chase", icon: Building2 },
  { label: "McKinsey & Company", value: "mckinsey", icon: Building2 }
]

const roles = [
  { label: "Software Engineer", value: "swe", icon: Briefcase },
  { label: "Frontend Engineer", value: "frontend", icon: Briefcase },
  { label: "Backend Engineer", value: "backend", icon: Briefcase },
  { label: "Full Stack Engineer", value: "fullstack", icon: Briefcase },
  { label: "Data Scientist", value: "ds", icon: Briefcase },
  { label: "Machine Learning Engineer", value: "ml-engineer", icon: Briefcase },
  { label: "Data Engineer", value: "data-engineer", icon: Briefcase },
  { label: "DevOps Engineer", value: "devops", icon: Briefcase },
  { label: "Site Reliability Engineer", value: "sre", icon: Briefcase },
  { label: "Cloud Engineer", value: "cloud-engineer", icon: Briefcase },
  { label: "Security Engineer", value: "security-engineer", icon: Briefcase },
  { label: "QA Engineer", value: "qa-engineer", icon: Briefcase },
  { label: "Embedded Systems Engineer", value: "embedded-engineer", icon: Briefcase },
  { label: "Game Developer", value: "game-dev", icon: Briefcase },
  { label: "Mobile Developer", value: "mobile-dev", icon: Briefcase },
  { label: "iOS Developer", value: "ios-dev", icon: Briefcase },
  { label: "Android Developer", value: "android-dev", icon: Briefcase },
  { label: "Product Manager", value: "pm", icon: Briefcase },
  { label: "Technical Program Manager", value: "tpm", icon: Briefcase },
  { label: "UX Designer", value: "ux", icon: Briefcase },
  { label: "UI Designer", value: "ui", icon: Briefcase },
  { label: "Product Designer", value: "product-designer", icon: Briefcase },
  { label: "Data Analyst", value: "data-analyst", icon: Briefcase },
  { label: "Business Analyst", value: "business-analyst", icon: Briefcase },
  { label: "Solutions Architect", value: "solutions-architect", icon: Briefcase },
  { label: "Technical Writer", value: "technical-writer", icon: Briefcase },
  { label: "Engineering Manager", value: "eng-manager", icon: Briefcase },
  { label: "CTO", value: "cto", icon: Briefcase }
]

const levels = [
  { label: "Internship", value: "internship", icon: User },
  { label: "Fresher (0-1 years)", value: "fresher", icon: User },
  { label: "Junior (1-3 years)", value: "junior", icon: User },
  { label: "Mid-Level (3-5 years)", value: "mid-level", icon: User },
  { label: "Senior (5-8 years)", value: "senior", icon: User },
  { label: "Staff Engineer (8+ years)", value: "staff", icon: User },
  { label: "Principal Engineer", value: "principal", icon: User },
  { label: "Lead Engineer", value: "lead", icon: User },
  { label: "Director", value: "director", icon: User },
  { label: "VP of Engineering", value: "vp", icon: User }
]

const tags = [
  // Technical Skills
  { label: "DSA", value: "dsa", icon: Tag },
  { label: "System Design", value: "system-design", icon: Tag },
  { label: "OOP", value: "oop", icon: Tag },
  { label: "Functional Programming", value: "functional-programming", icon: Tag },
  { label: "Algorithms", value: "algorithms", icon: Tag },
  { label: "Data Structures", value: "data-structures", icon: Tag },
  { label: "SQL", value: "sql", icon: Tag },
  { label: "NoSQL", value: "nosql", icon: Tag },
  { label: "Database Design", value: "database-design", icon: Tag },
  { label: "API Design", value: "api-design", icon: Tag },
  { label: "Microservices", value: "microservices", icon: Tag },
  { label: "Distributed Systems", value: "distributed-systems", icon: Tag },
  { label: "Cloud Computing", value: "cloud-computing", icon: Tag },
  { label: "Containerization", value: "containerization", icon: Tag },
  { label: "Kubernetes", value: "kubernetes", icon: Tag },
  { label: "Docker", value: "docker", icon: Tag },
  { label: "CI/CD", value: "ci-cd", icon: Tag },
  { label: "DevOps", value: "devops", icon: Tag },
  { label: "Cybersecurity", value: "cybersecurity", icon: Tag },
  { label: "Cryptography", value: "cryptography", icon: Tag },

  // Programming Languages
  { label: "JavaScript", value: "javascript", icon: Tag },
  { label: "TypeScript", value: "typescript", icon: Tag },
  { label: "Python", value: "python", icon: Tag },
  { label: "Java", value: "java", icon: Tag },
  { label: "C++", value: "cpp", icon: Tag },
  { label: "C#", value: "csharp", icon: Tag },
  { label: "Go", value: "go", icon: Tag },
  { label: "Rust", value: "rust", icon: Tag },
  { label: "Swift", value: "swift", icon: Tag },
  { label: "Kotlin", value: "kotlin", icon: Tag },
  { label: "Ruby", value: "ruby", icon: Tag },
  { label: "PHP", value: "php", icon: Tag },
  { label: "R", value: "r", icon: Tag },
  { label: "Scala", value: "scala", icon: Tag },

  // Frameworks/Libraries
  { label: "React", value: "react", icon: Tag },
  { label: "Angular", value: "angular", icon: Tag },
  { label: "Vue", value: "vue", icon: Tag },
  { label: "Node.js", value: "nodejs", icon: Tag },
  { label: "Spring", value: "spring", icon: Tag },
  { label: "Django", value: "django", icon: Tag },
  { label: "Flask", value: "flask", icon: Tag },
  { label: "Laravel", value: "laravel", icon: Tag },
  { label: "Ruby on Rails", value: "rails", icon: Tag },
  { label: ".NET", value: "dotnet", icon: Tag },

  // Interview Types
  { label: "Behavioral", value: "behavioral", icon: Tag },
  { label: "Technical", value: "technical", icon: Tag },
  { label: "Case Study", value: "case-study", icon: Tag },
  { label: "Whiteboarding", value: "whiteboarding", icon: Tag },
  { label: "Pair Programming", value: "pair-programming", icon: Tag },
  { label: "Take-home Assignment", value: "take-home", icon: Tag },

  // Machine Learning/AI
  { label: "ML", value: "ml", icon: Tag },
  { label: "Deep Learning", value: "deep-learning", icon: Tag },
  { label: "NLP", value: "nlp", icon: Tag },
  { label: "Computer Vision", value: "computer-vision", icon: Tag },
  { label: "TensorFlow", value: "tensorflow", icon: Tag },
  { label: "PyTorch", value: "pytorch", icon: Tag },
  { label: "Scikit-learn", value: "scikit-learn", icon: Tag },

  // Other
  { label: "Agile", value: "agile", icon: Tag },
  { label: "Scrum", value: "scrum", icon: Tag },
  { label: "Kanban", value: "kanban", icon: Tag },
  { label: "TDD", value: "tdd", icon: Tag },
  { label: "Clean Code", value: "clean-code", icon: Tag },
  { label: "Design Patterns", value: "design-patterns", icon: Tag }
]

export function InterviewFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State for filters
  const [company, setCompany] = React.useState("")
  const [role, setRole] = React.useState("")
  const [level, setLevel] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [activeFilters, setActiveFilters] = React.useState(0)

  // Initialize filters from URL params
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    setCompany(params.get("company") || "")
    setRole(params.get("role") || "")
    setLevel(params.get("level") || "")
    setSelectedTags(params.get("tags")?.split(",") || [])
  }, [searchParams])

  // Count active filters
  React.useEffect(() => {
    let count = 0
    if (company) count++
    if (role) count++
    if (level) count++
    if (selectedTags.length > 0) count++
    setActiveFilters(count)
  }, [company, role, level, selectedTags])

  const handleTagChange = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (company) params.set("company", company)
    if (role) params.set("role", role)
    if (level) params.set("level", level)
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","))

    // Reset pagination when filters change
    params.delete("page")

    router.push(`/interviews?${params.toString()}`, { scroll: false })
  }

  const resetFilters = () => {
    setCompany("")
    setRole("")
    setLevel("")
    setSelectedTags([])
    router.push("/interviews", { scroll: false })
  }

  const removeFilter = (type: string, value?: string) => {
    switch (type) {
      case "company":
        setCompany("")
        break
      case "role":
        setRole("")
        break
      case "level":
        setLevel("")
        break
      case "tag":
        if (value) {
          setSelectedTags(prev => prev.filter(tag => tag !== value))
        }
        break
    }
    applyFilters()
  }

  return (
    <div className="space-y-6 min-h-[300px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">Filters</h3>
          {activeFilters > 0 && (
            <Badge variant="secondary" className="px-2 py-0.5">
              {activeFilters}
            </Badge>
          )}
        </div>
        {activeFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-primary"
          >
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Active filters */}
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2">
          {company && (
            <Badge
              variant="outline"
              className="flex items-center gap-1"
            >
              <span className="font-medium">Company:</span>
              {companies.find(c => c.value === company)?.label}
              <button
                onClick={() => removeFilter("company")}
                className="ml-1 rounded-full p-0.5 hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {role && (
            <Badge
              variant="outline"
              className="flex items-center gap-1"
            >
              <span className="font-medium">Role:</span>
              {roles.find(r => r.value === role)?.label}
              <button
                onClick={() => removeFilter("role")}
                className="ml-1 rounded-full p-0.5 hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {level && (
            <Badge
              variant="outline"
              className="flex items-center gap-1"
            >
              <span className="font-medium">Level:</span>
              {levels.find(l => l.value === level)?.label}
              <button
                onClick={() => removeFilter("level")}
                className="ml-1 rounded-full p-0.5 hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedTags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="flex items-center gap-1"
            >
              <span className="font-medium">Tag:</span>
              {tags.find(t => t.value === tag)?.label}
              <button
                onClick={() => removeFilter("tag", tag)}
                className="ml-1 rounded-full p-0.5 hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Company Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Company
        </h4>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {company
                ? companies.find(c => c.value === company)?.label
                : "Select company..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search companies..." />
              <CommandList>
                <CommandEmpty>No company found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {companies.map(c => (
                      <CommandItem
                        key={c.value}
                        value={c.value}
                        onSelect={() => {
                          setCompany(c.value === company ? "" : c.value)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            company === c.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {c.label}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Role Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          Role
        </h4>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between"
            >
              {role
                ? roles.find(r => r.value === role)?.label
                : "Select role..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search roles..." />
              <CommandList>
                <CommandEmpty>No role found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[200px]">
                    {roles.map(r => (
                      <CommandItem
                        key={r.value}
                        value={r.value}
                        onSelect={() => {
                          setRole(r.value === role ? "" : r.value)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            role === r.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {r.label}
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Experience Level Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Experience Level
        </h4>
        <RadioGroup
          value={level}
          onValueChange={setLevel}
          className="grid grid-cols-2 gap-2"
        >
          {levels.map(l => (
            <div key={l.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={l.value}
                id={l.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={l.value}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                {l.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Tags Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          Tags
        </h4>
        <Accordion type="single" collapsible>
          <AccordionItem value="tags" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-2 text-sm">
                {selectedTags.length > 0 ? (
                  <span>{selectedTags.length} selected</span>
                ) : (
                  <span>Select tags</span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-2 gap-2">
                  {tags.map(tag => (
                    <div key={tag.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag.value}
                        checked={selectedTags.includes(tag.value)}
                        onCheckedChange={() => handleTagChange(tag.value)}
                        className="h-4 w-4 rounded"
                      />
                      <Label
                        htmlFor={tag.value}
                        className="text-sm font-normal leading-none"
                      >
                        {tag.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Button
        className="w-full"
        onClick={applyFilters}
        disabled={activeFilters === 0}
      >
        Apply Filters
      </Button>
    </div>
  )
}
