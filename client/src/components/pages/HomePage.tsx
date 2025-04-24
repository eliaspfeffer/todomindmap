import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import { PlusIcon } from "lucide-react";

interface MindMap {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  updatedAt: string;
}

export default function HomePage() {
  const [mindMaps, setMindMaps] = useState<MindMap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMindMaps = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem("auth_token");
        const response = await fetch("/api/mindmap", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch mind maps");
        }

        const data = await response.json();
        setMindMaps(data);
      } catch (error) {
        console.error("Error fetching mind maps:", error);
        toast({
          title: "Error",
          description: "Failed to load your mind maps. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMindMaps();
  }, [isAuthenticated]);

  const createNewMindMap = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/mindmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: "Untitled Mind Map",
          description: "",
          isPublic: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create mind map");
      }

      const data = await response.json();
      navigate(`/map/${data.id}`);
    } catch (error) {
      console.error("Error creating mind map:", error);
      toast({
        title: "Error",
        description: "Failed to create a new mind map. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Visualize Your Thoughts with MindMap
        </h1>
        <p className="text-xl mb-8 max-w-2xl text-muted-foreground">
          Create beautiful mind maps to organize your ideas, collaborate in
          real-time, and boost your productivity.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/register">Sign up for free</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/demo">Try the demo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Mind Maps</h1>
        <Button onClick={createNewMindMap}>
          <PlusIcon className="h-4 w-4 mr-2" /> New Mind Map
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 h-40 animate-pulse bg-muted"
            ></div>
          ))}
        </div>
      ) : mindMaps.length === 0 ? (
        <div className="border rounded-lg p-10 text-center">
          <h2 className="text-xl font-semibold mb-2">No mind maps yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first mind map to get started
          </p>
          <Button onClick={createNewMindMap}>
            <PlusIcon className="h-4 w-4 mr-2" /> Create Mind Map
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mindMaps.map((mindMap) => (
            <Link
              key={mindMap.id}
              to={`/map/${mindMap.id}`}
              className="border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <h2 className="text-lg font-semibold mb-2 truncate">
                {mindMap.name}
              </h2>
              {mindMap.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {mindMap.description}
                </p>
              )}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{mindMap.isPublic ? "Public" : "Private"}</span>
                <span>
                  Updated {new Date(mindMap.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
