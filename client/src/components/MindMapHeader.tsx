import { useState, ChangeEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { debounce } from "@/lib/utils";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";

interface MindMapHeaderProps {
  mindMap: {
    id: string;
    name: string;
    description: string | null;
  };
  onChange: (data: any) => void;
  isOwner: boolean;
  readOnly: boolean;
  isSaving: boolean;
  children?: ReactNode;
}

export default function MindMapHeader({
  mindMap,
  onChange,
  isOwner,
  readOnly,
  isSaving,
  children,
}: MindMapHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(mindMap.name);
  const navigate = useNavigate();

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    debouncedUpdateName(e.target.value);
  };

  const debouncedUpdateName = debounce((newName: string) => {
    onChange({ ...mindMap, name: newName });
  }, 500);

  const toggleEdit = () => {
    if (readOnly) return;
    if (editing) {
      onChange({ ...mindMap, name });
    }
    setEditing(!editing);
  };

  return (
    <div className="flex items-center p-3 border-b bg-background">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="mr-2"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex-1 flex items-center min-w-0">
        {editing ? (
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={toggleEdit}
            onKeyDown={(e) => e.key === "Enter" && toggleEdit()}
            autoFocus
            className="bg-muted px-2 py-1 rounded w-full max-w-md text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <h1
            className="text-lg font-semibold truncate cursor-pointer"
            onClick={!readOnly ? toggleEdit : undefined}
            title={
              readOnly ? "You don't have permission to edit" : "Click to edit"
            }
          >
            {mindMap.name}
          </h1>
        )}

        {isSaving && (
          <div className="ml-2 text-sm text-muted-foreground flex items-center">
            <SaveIcon className="h-3 w-3 mr-1 animate-pulse" />
            Saving...
          </div>
        )}
      </div>

      <div className="flex items-center">{children}</div>
    </div>
  );
}
