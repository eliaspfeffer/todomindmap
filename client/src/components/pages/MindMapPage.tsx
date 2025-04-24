import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import MindMap from "@/components/MindMap";
import MindMapHeader from "@/components/MindMapHeader";
import ShareDialog from "@/components/ShareDialog";
import { Share2Icon } from "lucide-react";

interface MindMapNode {
  id: string;
  content: string;
  parentId: string | null;
  position: { x: number; y: number };
  order: number;
}

interface MindMapData {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  nodes: MindMapNode[];
  permission?: string;
}

export default function MindMapPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [mindMap, setMindMap] = useState<MindMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchMindMap = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`/api/mindmap/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            toast({
              title: "Not Found",
              description:
                "The mind map you requested does not exist or you do not have access to it.",
              variant: "destructive",
            });
            navigate("/");
            return;
          }
          throw new Error("Failed to fetch mind map");
        }

        const data = await response.json();
        setMindMap(data);
        setIsOwner(data.ownerId === user?.id);
        setReadOnly(data.permission === "read");
      } catch (error) {
        console.error("Error fetching mind map:", error);
        toast({
          title: "Error",
          description: "Failed to load the mind map. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMindMap();
  }, [id, isAuthenticated, navigate, user?.id]);

  const handleChange = async (updatedMap: MindMapData) => {
    setMindMap(updatedMap);

    // Debounced save logic would go here in a real implementation
    // This is simplified for the example
    try {
      setIsSaving(true);
      const token = localStorage.getItem("auth_token");
      await fetch(`/api/mindmap/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedMap),
      });
    } catch (error) {
      console.error("Error saving mind map:", error);
      toast({
        title: "Save Error",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!mindMap) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Mind Map Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The mind map you requested could not be loaded.
        </p>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <MindMapHeader
        mindMap={mindMap}
        onChange={handleChange}
        isOwner={isOwner}
        readOnly={readOnly}
        isSaving={isSaving}
      >
        {(isOwner || mindMap.permission === "admin") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShare(true)}
            className="ml-2"
          >
            <Share2Icon className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </MindMapHeader>

      <div className="flex-1 overflow-hidden">
        {mindMap && (
          <MindMap
            mindMapId={mindMap.id}
            nodes={mindMap.nodes}
            readOnly={readOnly}
            onChange={handleChange}
          />
        )}
      </div>

      {showShare && (
        <ShareDialog
          mindMapId={mindMap.id}
          isPublic={mindMap.isPublic}
          onClose={() => setShowShare(false)}
          onUpdate={(isPublic) => {
            setMindMap({
              ...mindMap,
              isPublic,
            });
          }}
        />
      )}
    </div>
  );
}
