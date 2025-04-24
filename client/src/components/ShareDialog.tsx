import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckIcon, CopyIcon, PlusIcon, TrashIcon } from "lucide-react";

interface ShareDialogProps {
  mindMapId: string;
  isPublic: boolean;
  onClose: () => void;
  onUpdate: (isPublic: boolean) => void;
}

interface Collaborator {
  id: string;
  email: string;
  permission: "read" | "write" | "admin";
}

export default function ShareDialog({
  mindMapId,
  isPublic,
  onClose,
  onUpdate,
}: ShareDialogProps) {
  const [isPublicEnabled, setIsPublicEnabled] = useState(isPublic);
  const [publicLink, setPublicLink] = useState(
    isPublic ? `${window.location.origin}/shared/${mindMapId}` : ""
  );
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"read" | "write" | "admin">(
    "read"
  );
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePublicToggle = async () => {
    try {
      setLoading(true);
      const newState = !isPublicEnabled;
      setIsPublicEnabled(newState);

      // API call to update sharing settings
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/mindmap/${mindMapId}/share`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublic: newState }),
      });

      if (!response.ok) {
        throw new Error("Failed to update sharing settings");
      }

      onUpdate(newState);

      if (newState) {
        setPublicLink(`${window.location.origin}/shared/${mindMapId}`);
      } else {
        setPublicLink("");
      }

      toast({
        title: "Sharing updated",
        description: newState
          ? "Anyone with the link can now view this mind map."
          : "The mind map is now private.",
      });
    } catch (error) {
      console.error("Error updating sharing settings:", error);
      toast({
        title: "Error",
        description: "Failed to update sharing settings. Please try again.",
        variant: "destructive",
      });
      setIsPublicEnabled(!isPublicEnabled); // Revert UI state
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!publicLink) return;
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addCollaborator = async () => {
    if (!email || !permission) return;

    try {
      setLoading(true);
      // API call to add collaborator
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/mindmap/${mindMapId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, permission }),
      });

      if (!response.ok) {
        throw new Error("Failed to add collaborator");
      }

      const data = await response.json();
      setCollaborators([...collaborators, data]);
      setEmail("");

      toast({
        title: "Collaborator added",
        description: `${email} has been added with ${permission} permission.`,
      });
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast({
        title: "Error",
        description:
          "Failed to add collaborator. Please check the email and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      setLoading(true);
      // API call to remove collaborator
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/mindmap/${mindMapId}/collaborators/${collaboratorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove collaborator");
      }

      setCollaborators(collaborators.filter((c) => c.id !== collaboratorId));

      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed from this mind map.",
      });
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast({
        title: "Error",
        description: "Failed to remove collaborator. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Mind Map</DialogTitle>
          <DialogDescription>
            Control who can view or edit your mind map.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public sharing toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-toggle" className="font-medium">
                Public link
              </Label>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view this mind map
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublicEnabled}
              onCheckedChange={handlePublicToggle}
              disabled={loading}
            />
          </div>

          {/* Public link */}
          {isPublicEnabled && (
            <div className="flex items-center">
              <Input value={publicLink} readOnly className="pr-10" />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLink}
                className="ml-2"
                disabled={!publicLink}
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* Collaborator form */}
          <div>
            <h3 className="text-sm font-medium mb-3">Invite collaborators</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <select
                value={permission}
                onChange={(e) =>
                  setPermission(e.target.value as "read" | "write" | "admin")
                }
                className="bg-muted text-sm rounded-md border border-input px-3"
              >
                <option value="read">Can view</option>
                <option value="write">Can edit</option>
                <option value="admin">Can manage</option>
              </select>
              <Button onClick={addCollaborator} disabled={!email || loading}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Collaborators list */}
          {collaborators.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Collaborators</h3>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted"
                  >
                    <span className="text-sm truncate">
                      {collaborator.email}
                    </span>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-2">
                        {collaborator.permission === "read"
                          ? "Viewer"
                          : collaborator.permission === "write"
                          ? "Editor"
                          : "Admin"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCollaborator(collaborator.id)}
                        disabled={loading}
                      >
                        <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
