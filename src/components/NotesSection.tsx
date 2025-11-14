import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Clock, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPriorityColor, getInitials, formatDate } from "@/utils/statusUtils";
import { NOTE_PRIORITIES } from "@/constants";
import { ApiService } from "@/services/api";
import type { Note, NotePriority } from "@/types";

interface NotesSectionProps {
  entityId: string;
  entityName: string;
  entityType?: string;
}

export function NotesSection({ entityId, entityName, entityType }: NotesSectionProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<NotePriority>("medium");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const { toast } = useToast();

  // Fetch notes from API
  useEffect(() => {
    if (entityId && entityType) {
      setIsLoadingNotes(true);
      ApiService.getNotes(entityType, entityId)
        .then(fetchedNotes => setNotes(fetchedNotes))
        .catch(err => console.error('Failed to load notes:', err))
        .finally(() => setIsLoadingNotes(false));
    }
  }, [entityId, entityType]);

  const handleAddNote = async () => {
    if (newNote.trim() && entityType) {
      try {
        const createdNote = await ApiService.createNote({
          entityType,
          entityId,
          content: newNote.trim(),
          priority: selectedPriority,
        });

        setNotes([createdNote, ...notes]);
        setNewNote("");
        setSelectedPriority("medium");
        setIsAddingNote(false);

        toast({
          title: "Note Added",
          description: `${selectedPriority.toUpperCase()} priority note has been saved.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create note. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const getAuthorName = (author: Note['author']): string => {
    if (!author) return 'Unknown User';
    const parts = [author.firstName, author.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : author.email || 'Unknown User';
  };

  const formatNoteDate = (timestamp: string) => {
    return formatDate(timestamp);
  };

  const getNotePriorityColor = (priority?: NotePriority) => {
    return getPriorityColor(priority || "low");
  };

  const getPriorityIcon = (priority: NotePriority) => {
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
            <CardTitle className="street-title text-xl">Internal Notes</CardTitle>
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
                  {NOTE_PRIORITIES.map((priority) => (
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
          {isLoadingNotes ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notes yet. Add the first note about {entityName}.</p>
            </div>
          ) : (
            notes.map((note) => {
              const authorName = getAuthorName(note.author);
              const { date, time } = formatNoteDate(note.createdAt);
              return (
                <div
                  key={note.id}
                  className={`border-l-4 rounded-r-lg p-4 ${getNotePriorityColor(note.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={note.author?.profileImage || undefined} alt={authorName} />
                      <AvatarFallback className="text-xs">
                        {getInitials(authorName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{authorName}</span>
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
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}