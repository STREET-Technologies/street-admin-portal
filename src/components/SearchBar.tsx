import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Store, Truck } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, type: string) => void;
  onTypeChange?: () => void;
}

export function SearchBar({ onSearch, onTypeChange }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("user");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (value.trim().length > 0) {
      const searchTerm = value.toLowerCase();
      let typeSuggestions: string[] = [];
      
      if (selectedType === "user") {
        // Syuzana suggestions
        if ("syuzana".includes(searchTerm)) {
          typeSuggestions.push("Syuzana O");
        }
        if ("syuzana@street.london".includes(searchTerm)) {
          typeSuggestions.push("syuzana@street.london");
        }
        if ("+447542016022".includes(searchTerm)) {
          typeSuggestions.push("+447542016022");
        }
        if ("usr001".includes(searchTerm)) {
          typeSuggestions.push("USR001");
        }
        if ("uid_syuzana_001_2024".includes(searchTerm)) {
          typeSuggestions.push("uid_syuzana_001_2024");
        }
        
        // Ali suggestions
        if ("ali".includes(searchTerm)) {
          typeSuggestions.push("Ali Al Nasiri");
        }
        if ("ali@street.london".includes(searchTerm)) {
          typeSuggestions.push("ali@street.london");
        }
        if ("+447770237011".includes(searchTerm)) {
          typeSuggestions.push("+447770237011");
        }
        if ("usr002".includes(searchTerm)) {
          typeSuggestions.push("USR002");
        }
        if ("uid_ali_002_2024".includes(searchTerm)) {
          typeSuggestions.push("uid_ali_002_2024");
        }
      } else if (selectedType === "retail") {
        if ("trilogy".includes(searchTerm)) {
          typeSuggestions.push("Trilogy London");
        }
        if ("info@trilogylondon.com".includes(searchTerm)) {
          typeSuggestions.push("info@trilogylondon.com");
        }
        if ("020 7937 7972".includes(searchTerm)) {
          typeSuggestions.push("020 7937 7972");
        }
        if ("ret001".includes(searchTerm)) {
          typeSuggestions.push("RET001");
        }
        if ("uid_trilogy_ret_001_2023".includes(searchTerm)) {
          typeSuggestions.push("uid_trilogy_ret_001_2023");
        }
      } else if (selectedType === "courier") {
        if ("ali".includes(searchTerm)) {
          typeSuggestions.push("Ali Al Nasiri");
        }
        if ("ali@street.london".includes(searchTerm)) {
          typeSuggestions.push("ali@street.london");
        }
        if ("+447770237011".includes(searchTerm)) {
          typeSuggestions.push("+447770237011");
        }
        if ("cou001".includes(searchTerm)) {
          typeSuggestions.push("COU001");
        }
        if ("uid_ali_cou_001_2024".includes(searchTerm)) {
          typeSuggestions.push("uid_ali_cou_001_2024");
        }
      }
      
      setSuggestions([...new Set(typeSuggestions)]);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      onSearch(query, selectedType);
    }
    
    setSuggestions([]);
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    onSearch(suggestion, selectedType);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Type Selection Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={selectedType === "user" ? "default" : "outline"}
          onClick={() => {
            setSelectedType("user");
            setQuery("");
            setSuggestions([]);
            onTypeChange?.();
          }}
          className="flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          User
        </Button>
        <Button
          type="button"
          variant={selectedType === "retail" ? "default" : "outline"}
          onClick={() => {
            setSelectedType("retail");
            setQuery("");
            setSuggestions([]);
            onTypeChange?.();
          }}
          className="flex items-center gap-2"
        >
          <Store className="w-4 h-4" />
          Retailer
        </Button>
        <Button
          type="button"
          variant={selectedType === "courier" ? "default" : "outline"}
          onClick={() => {
            setSelectedType("courier");
            setQuery("");
            setSuggestions([]);
            onTypeChange?.();
          }}
          className="flex items-center gap-2"
        >
          <Truck className="w-4 h-4" />
          Courier
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={`Search ${selectedType} by name, email, phone or ID`}
            className="pr-24 h-14 text-lg border-2 focus:border-primary bg-white/95 backdrop-blur-sm"
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

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => selectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3"
            >
              <User className="w-4 h-4 text-primary" />
              <span className="font-mono text-sm">{suggestion}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {suggestion.includes("@") ? "Email" : 
                 suggestion.includes("+") ? "Phone" : 
                 suggestion.includes("uid_") ? "UID" : 
                 suggestion.match(/^[A-Z]{3}\d{3}$/) ? "ID" : "Name"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}