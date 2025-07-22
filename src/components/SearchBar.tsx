import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Command } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, type: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // Show command suggestions
    if (value.startsWith("/")) {
      const commands = ["user", "retail", "courier"];
      const filtered = commands.filter(cmd => 
        cmd.toLowerCase().includes(value.slice(1).toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.startsWith("/")) {
      const command = query.slice(1).toLowerCase();
      if (["user", "retail", "courier"].includes(command)) {
        onSearch("", command);
      }
    } else if (query.trim()) {
      // Default to user search if no command
      onSearch(query, "user");
    }
    
    setSuggestions([]);
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(`/${suggestion}`);
    setSuggestions([]);
    onSearch("", suggestion);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Command className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search users, retailers, couriers... (try /user, /retail, /courier)"
            className="pl-12 pr-24 h-14 text-lg border-2 focus:border-primary bg-white/95 backdrop-blur-sm"
          />
          <Button
            type="submit"
            className="absolute right-2 top-2 h-10 street-gradient text-black font-bold"
            disabled={!query.trim()}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {/* Command Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-10">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 capitalize"
            >
              <Command className="w-4 h-4 text-primary" />
              /{suggestion}
              <span className="text-sm text-muted-foreground ml-auto">
                Search {suggestion === "retail" ? "retailers" : `${suggestion}s`}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Command Guide */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded">/user</code>
          <span>Search Users</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded">/retail</code>
          <span>Search Retailers</span>
        </div>
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded">/courier</code>
          <span>Search Couriers</span>
        </div>
      </div>
    </div>
  );
}