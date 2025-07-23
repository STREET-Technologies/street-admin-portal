import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Clock, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotesSectionProps {
  entityId: string;
  entityName: string;
  entityType?: string;
}

interface Note {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  priority?: "low" | "medium" | "high";
}

export function NotesSection({ entityId, entityName, entityType }: NotesSectionProps) {
  // Entity-specific notes storage key
  const notesStorageKey = `notes_${entityType || 'entity'}_${entityId}`;
  
  // Load entity-specific notes from localStorage or use defaults
  const getEntityNotes = () => {
    const stored = localStorage.getItem(notesStorageKey);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default example notes for all entities
    return [
      {
        id: "1",
        content: "Customer contacted support regarding delayed delivery. Issue resolved with compensation offered.",
        author: "Sarah Johnson",
        authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        timestamp: "2024-01-20T14:30:00Z",
        priority: "medium"
      },
      {
        id: "2", 
        content: "VIP customer - provide priority support and expedited shipping on all orders.",
        author: "Mike Chen",
        authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        timestamp: "2024-01-15T09:15:00Z",
        priority: "high"
      },
      {
        id: "3",
        content: "Regular customer, no issues reported. Prefers contactless delivery.",
        author: "Emma Davis",
        timestamp: "2024-01-10T16:45:00Z",
        priority: "low"
      }
    ];
  };

  const [notes, setNotes] = useState<Note[]>(getEntityNotes());
  
  const [newNote, setNewNote] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        author: "Current User", // In real app, get from auth context
        timestamp: new Date().toISOString(),
        priority: selectedPriority
      };
      
      const updatedNotes = [note, ...notes];
      setNotes(updatedNotes);
      
      // Save to localStorage for persistence
      localStorage.setItem(notesStorageKey, JSON.stringify(updatedNotes));
      
      setNewNote("");
      setSelectedPriority("medium");
      setIsAddingNote(false);
      
      toast({
        title: "Note Added",
        description: `${selectedPriority.toUpperCase()} priority note has been saved.`,
      });
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-3 h-3" />;
      case "medium":
        return <AlertCircle className="w-3 h-3" />;
      case "low":
        return <Info className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary" />
            <CardTitle className="street-title text-xl">Employee Notes</CardTitle>
            <span className="text-sm text-muted-foreground">({notes.length} notes)</span>
          </div>
          <Button
            onClick={() => setIsAddingNote(true)}
            className="street-gradient text-black font-medium"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add New Note */}
        {isAddingNote && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <Textarea
              placeholder={`Add a note about ${entityName}...`}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="mb-3 min-h-[100px] border-border focus:ring-primary"
            />
            <div className="flex items-center justify-between">
              {/* Priority Selector - Left Side */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Priority:</span>
                <div className="flex gap-1">
                  {(['high', 'medium', 'low'] as const).map((priority) => (
                    <Button
                      key={priority}
                      onClick={() => setSelectedPriority(priority)}
                      variant={selectedPriority === priority ? "default" : "outline"}
                      size="sm"
                      className={`h-7 px-2 text-xs ${
                        selectedPriority === priority
                          ? priority === 'high'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : priority === 'medium'
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {getPriorityIcon(priority)}
                      <span className="ml-1 capitalize">{priority}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons - Right Side */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote("");
                    setSelectedPriority("medium");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddNote}
                  className="street-gradient text-black font-medium"
                  size="sm"
                  disabled={!newNote.trim()}
                >
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {notes.map((note) => {
            const { date, time } = formatDate(note.timestamp);
            return (
              <div
                key={note.id}
                className={`border-l-4 rounded-r-lg p-4 ${getPriorityColor(note.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={note.authorAvatar} alt={note.author} />
                    <AvatarFallback className="text-xs">
                      {note.author.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{note.author}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {date} at {time}
                      </div>
                      {note.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs border-0 ${
                            note.priority === "high" 
                              ? "text-red-700" 
                              : note.priority === "medium"
                              ? "text-yellow-700"
                              : "text-green-700"
                          }`}
                        >
                          {getPriorityIcon(note.priority)}
                          <span className="ml-1">{note.priority.toUpperCase()}</span>
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No notes yet. Add the first note about {entityName}.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}