"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Building2, GraduationCap, Search, Loader2, X } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import axios from "axios"

type SearchResult = {
  companies: Array<{
    name: string
    count: number
    recentRoles: string[]
  }>
  roles: Array<{
    title: string
    count: number
    companies: string[]
  }>
}

interface SearchBoxProps {
  className?: string;
}

export function SearchBox({ className }: SearchBoxProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult>({
    companies: [],
    roles: []
  })
  const [loading, setLoading] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      fetchResults()
    }
  }

  const fetchResults = async () => {
    if (!query || query.length < 2) {
      setResults({ companies: [], roles: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    setHasSearched(true)
    setShowResults(true)

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/interviews/search`,
        {
          params: {
            query: query,
            limit: 10
          }
        }
      )
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults({ companies: [], roles: [] })
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (value: string, type: 'company' | 'role') => {
    setShowResults(false)
    router.push(`/interviews?${type}=${encodeURIComponent(value)}`)
  }

  const clearSearch = () => {
    setQuery("")
    setResults({ companies: [], roles: [] })
    setShowResults(false)
    setHasSearched(false)
  }

  return (
    <div className={cn("relative w-full max-w-lg", className)}>
      <div className="relative group">
        {loading ? (
          <Loader2 className="absolute left-3 top-3 h-4 w-4 text-primary animate-spin" />
        ) : (
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          className="w-full h-12 bg-background pl-10 pr-12 rounded-xl border-2 border-input text-base focus-visible:ring-1 focus-visible:ring-primary"
          placeholder="Search companies or roles"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => hasSearched && setShowResults(true)}
          aria-label="Search input"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-14 z-50 w-full rounded-lg border bg-popover shadow-lg overflow-hidden">
          <Command>
            <CommandList className="max-h-[400px] overflow-y-auto">
              <CommandEmpty>
                {!hasSearched ? (
                  <div className="p-4 text-sm text-muted-foreground flex items-center">
                    <Search className="h-4 w-4 mr-2" />
                    <span>Type your search and press Enter</span>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center py-6" role="status">
                    <div
                      className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"
                      aria-label="Loading results"
                    />
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground flex items-center">
                    <Search className="h-4 w-4 mr-2" />
                    <span>No results found. Try a different search term.</span>
                  </div>
                )}
              </CommandEmpty>

              {results.companies.length > 0 && (
                <CommandGroup heading="Companies" className="px-2 py-1">
                  {results.companies.map((company) => (
                    <CommandItem
                      key={company.name}
                      onSelect={() => handleSelect(company.name, 'company')}
                      className="px-3 py-2 cursor-pointer rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {highlightMatch(company.name, query)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {company.count} interviews • Recent roles: {company.recentRoles.join(', ')}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.roles.length > 0 && (
                <CommandGroup heading="Roles" className="px-2 py-1">
                  {results.roles.map((role) => (
                    <CommandItem
                      key={role.title}
                      onSelect={() => handleSelect(role.title, 'role')}
                      className="px-3 py-2 cursor-pointer rounded-md hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {highlightMatch(role.title, query)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {role.count} interviews • Top companies: {role.companies.slice(0, 3).join(', ')}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}

function highlightMatch(text: string, query: string) {
  if (!query || query.length < 2) return text

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return text

  return (
    <>
      {text.substring(0, index)}
      <span className="bg-yellow-100 text-yellow-900 rounded px-0.5">
        {text.substring(index, index + query.length)}
      </span>
      {text.substring(index + query.length)}
    </>
  )
}
