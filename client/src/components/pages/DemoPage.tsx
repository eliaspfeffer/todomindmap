import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MindMap from "@/components/MindMap";
import { toast } from "@/components/ui/use-toast";

// Sample data for the demo mind map
const DEMO_DATA = {
  id: "demo",
  name: "Mind Mapping Concepts",
  nodes: [
    {
      id: "1",
      content: "Mind Mapping",
      parentId: null,
      position: { x: 400, y: 100 },
      order: 0,
    },
    {
      id: "2",
      content: "Benefits",
      parentId: "1",
      position: { x: 200, y: 200 },
      order: 0,
    },
    {
      id: "3",
      content: "Visual Thinking",
      parentId: "2",
      position: { x: 150, y: 250 },
      order: 0,
    },
    {
      id: "4",
      content: "Memory Enhancement",
      parentId: "2",
      position: { x: 150, y: 300 },
      order: 1,
    },
    {
      id: "5",
      content: "Creativity Boost",
      parentId: "2",
      position: { x: 150, y: 350 },
      order: 2,
    },
    {
      id: "6",
      content: "Applications",
      parentId: "1",
      position: { x: 600, y: 200 },
      order: 1,
    },
    {
      id: "7",
      content: "Note Taking",
      parentId: "6",
      position: { x: 650, y: 250 },
      order: 0,
    },
    {
      id: "8",
      content: "Project Planning",
      parentId: "6",
      position: { x: 650, y: 300 },
      order: 1,
    },
    {
      id: "9",
      content: "Problem Solving",
      parentId: "6",
      position: { x: 650, y: 350 },
      order: 2,
    },
    {
      id: "10",
      content: "Techniques",
      parentId: "1",
      position: { x: 400, y: 300 },
      order: 2,
    },
    {
      id: "11",
      content: "Keyboard Shortcuts",
      parentId: "10",
      position: { x: 400, y: 350 },
      order: 0,
    },
    {
      id: "12",
      content: "Collaboration",
      parentId: "10",
      position: { x: 400, y: 400 },
      order: 1,
    },
  ],
};

export default function DemoPage() {
  const [demoData, setDemoData] = useState(DEMO_DATA);

  useEffect(() => {
    toast({
      title: "Welcome to the MindMap Demo",
      description: (
        <div className="text-sm">
          <p className="mb-2">
            This is a fully functional demo. Try these keyboard shortcuts:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Tab: Add child node</li>
            <li>Enter: Add sibling node</li>
            <li>Delete: Remove node</li>
            <li>Arrow keys: Navigate between nodes</li>
          </ul>
        </div>
      ),
      duration: 8000,
    });
  }, []);

  const handleChange = (newData: any) => {
    setDemoData(newData);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-xl font-bold">{demoData.name}</h1>
          <p className="text-sm text-muted-foreground">Demo Mode</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/">Exit Demo</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Sign Up</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MindMap
          mindMapId="demo"
          nodes={demoData.nodes}
          readOnly={false}
          onChange={handleChange}
          isDemo={true}
        />
      </div>
    </div>
  );
}
