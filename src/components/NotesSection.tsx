import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, MessageSquare, Clock } from "lucide-react";

interface NotesSectionProps {
  entityId: string;
  entityName: string;
}

interface Note {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  priority?: "low" | "medium" | "high";
}

export function NotesSection({ entityId, entityName }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([
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
  ]);
  
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        author: "Current User", // In real app, get from auth context
        timestamp: new Date().toISOString(),
        priority: "medium"
      };
      
      setNotes([note, ...notes]);
      setNewNote("");
      setIsAddingNote(false);
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
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-300 bg-gray-50";
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
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNote("");
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
                      {note.priority && note.priority !== "low" && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          note.priority === "high" 
                            ? "bg-red-100 text-red-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {note.priority.toUpperCase()}
                        </span>
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