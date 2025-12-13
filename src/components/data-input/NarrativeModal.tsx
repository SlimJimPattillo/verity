import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface Narrative {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  source?: 'manual' | 'ai_generated' | 'imported';
}

interface NarrativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (narrative: Omit<Narrative, "id">) => void;
  narrative?: Narrative | null;
  mode: 'add' | 'edit';
}

export function NarrativeModal({ open, onOpenChange, onSave, narrative, mode }: NarrativeModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (narrative && mode === 'edit') {
      setTitle(narrative.title);
      setContent(narrative.content);
      setTags(narrative.tags || []);
    } else {
      handleReset();
    }
  }, [narrative, mode, open]);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const narrativeData: Omit<Narrative, "id"> = {
      title: title.trim(),
      content: content.trim(),
      tags: tags.length > 0 ? tags : undefined,
      source: 'manual',
    };

    onSave(narrativeData);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setTitle("");
    setContent("");
    setTags([]);
    setTagInput("");
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const Icon = mode === 'add' ? Plus : Pencil;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            {mode === 'add' ? 'Add Narrative' : 'Edit Narrative'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Create a reusable narrative snippet for your reports'
              : 'Update your narrative content'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., 2024 Impact Summary, Mission Statement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Content
            </Label>
            <Textarea
              id="content"
              placeholder="Write your narrative here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {content.length} characters
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags (optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              handleReset();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !content.trim()}
            className="flex-1"
          >
            {mode === 'add' ? 'Add Narrative' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
