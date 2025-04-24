import {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  useCallback,
  useMemo,
} from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { generateId } from "@/lib/utils";
import MindMapNode from "@/components/MindMapNode";
import { socket } from "@/lib/socket";

interface NodeData {
  id: string;
  content: string;
  parentId: string | null;
  position: { x: number; y: number };
  order: number;
}

interface MindMapProps {
  mindMapId: string;
  nodes: NodeData[];
  readOnly: boolean;
  onChange: (data: any) => void;
  isDemo?: boolean;
}

export default function MindMap({
  mindMapId,
  nodes: initialNodes,
  readOnly,
  onChange,
  isDemo = false,
}: MindMapProps) {
  const [nodes, setNodes] = useState<NodeData[]>(initialNodes);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [lines, setLines] = useState<
    { from: string; to: string; path: string }[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [viewportPosition, setViewportPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPoint, setStartDragPoint] = useState({ x: 0, y: 0 });
  const nodesRef = useRef<Record<string, HTMLDivElement>>({});

  // Register node ref
  const registerNodeRef = useCallback(
    (id: string, element: HTMLDivElement | null) => {
      if (element) {
        nodesRef.current[id] = element;
      } else {
        delete nodesRef.current[id];
      }
    },
    []
  );

  // Calculate connections between nodes
  useEffect(() => {
    const newLines: { from: string; to: string; path: string }[] = [];

    nodes.forEach((node) => {
      if (node.parentId) {
        const fromNode = nodesRef.current[node.parentId];
        const toNode = nodesRef.current[node.id];

        if (fromNode && toNode) {
          const fromRect = fromNode.getBoundingClientRect();
          const toRect = toNode.getBoundingClientRect();

          const containerRect =
            containerRef.current?.getBoundingClientRect() || {
              left: 0,
              top: 0,
            };

          const fromX = fromRect.left + fromRect.width / 2 - containerRect.left;
          const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
          const toX = toRect.left + toRect.width / 2 - containerRect.left;
          const toY = toRect.top + toRect.height / 2 - containerRect.top;

          newLines.push({
            from: node.parentId,
            to: node.id,
            path: `M${fromX},${fromY} C${fromX + (toX - fromX) / 2},${fromY} ${
              fromX + (toX - fromX) / 2
            },${toY} ${toX},${toY}`,
          });
        }
      }
    });

    setLines(newLines);
  }, [nodes, zoom, viewportPosition]);

  // Handle node content change
  const handleNodeContentChange = useCallback(
    (id: string, content: string) => {
      const newNodes = nodes.map((node) =>
        node.id === id ? { ...node, content } : node
      );
      setNodes(newNodes);
      onChange({ ...mindMapId, nodes: newNodes });

      if (!isDemo) {
        socket.emit("node:update", {
          mindMapId,
          nodeId: id,
          content,
        });
      }
    },
    [nodes, onChange, mindMapId, isDemo]
  );

  // Handle node deletion
  const handleDeleteNode = useCallback(
    (id: string) => {
      // Get all child nodes recursively
      const getChildNodeIds = (nodeId: string): string[] => {
        const childNodes = nodes.filter((n) => n.parentId === nodeId);
        return [
          nodeId,
          ...childNodes.flatMap((child) => getChildNodeIds(child.id)),
        ];
      };

      const nodeIdsToDelete = getChildNodeIds(id);
      const newNodes = nodes.filter(
        (node) => !nodeIdsToDelete.includes(node.id)
      );

      setNodes(newNodes);
      if (activeNodeId === id) {
        const parentNode = nodes.find((n) => n.id === id)?.parentId;
        setActiveNodeId(parentNode);
      }

      onChange({ ...mindMapId, nodes: newNodes });

      if (!isDemo) {
        socket.emit("node:delete", {
          mindMapId,
          nodeId: id,
        });
      }
    },
    [nodes, activeNodeId, onChange, mindMapId, isDemo]
  );

  // Handle adding new child node
  const handleAddChildNode = useCallback(
    (parentId: string) => {
      const parentNode = nodes.find((n) => n.id === parentId);
      if (!parentNode) return;

      const childrenCount = nodes.filter((n) => n.parentId === parentId).length;

      const newNodeId = generateId();
      const parentRect = nodesRef.current[parentId]?.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (!parentRect || !containerRect) return;

      // Position the new node below its parent
      const position = {
        x: parentNode.position.x,
        y: parentNode.position.y + 100 + childrenCount * 60,
      };

      const newNode: NodeData = {
        id: newNodeId,
        content: "",
        parentId,
        position,
        order: childrenCount,
      };

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setActiveNodeId(newNodeId);
      onChange({ ...mindMapId, nodes: newNodes });

      if (!isDemo) {
        socket.emit("node:create", {
          mindMapId,
          node: newNode,
        });
      }
    },
    [nodes, onChange, mindMapId, isDemo]
  );

  // Handle adding sibling node
  const handleAddSiblingNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const parentId = node.parentId;
      const siblings = nodes.filter((n) => n.parentId === parentId);
      const nodeIndex = siblings.findIndex((n) => n.id === nodeId);

      const newNodeId = generateId();
      const nodeRect = nodesRef.current[nodeId]?.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      if (!nodeRect || !containerRect) return;

      // Position the new node next to the current node
      const position = {
        x: node.position.x,
        y: node.position.y + 60,
      };

      // Update orders of existing siblings
      const updatedNodes = nodes.map((n) => {
        if (n.parentId === parentId && n.order > node.order) {
          return { ...n, order: n.order + 1 };
        }
        return n;
      });

      const newNode: NodeData = {
        id: newNodeId,
        content: "",
        parentId,
        position,
        order: node.order + 1,
      };

      const newNodes = [...updatedNodes, newNode];
      setNodes(newNodes);
      setActiveNodeId(newNodeId);
      onChange({ ...mindMapId, nodes: newNodes });

      if (!isDemo) {
        socket.emit("node:create", {
          mindMapId,
          node: newNode,
        });
      }
    },
    [nodes, onChange, mindMapId, isDemo]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (readOnly || !activeNodeId) return;

      const activeNode = nodes.find((n) => n.id === activeNodeId);
      if (!activeNode) return;

      // Prevent default behavior for these keys
      if (
        e.key === "Tab" ||
        e.key === "Enter" ||
        e.key === "Delete" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
      }

      switch (e.key) {
        case "Tab":
          e.preventDefault();
          handleAddChildNode(activeNodeId);
          break;
        case "Enter":
          e.preventDefault();
          handleAddSiblingNode(activeNodeId);
          break;
        case "Delete":
          e.preventDefault();
          handleDeleteNode(activeNodeId);
          break;
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
          // Handle navigation between nodes
          const siblings = nodes.filter(
            (n) => n.parentId === activeNode.parentId
          );
          const nodeIndex = siblings.findIndex((n) => n.id === activeNodeId);

          if (e.key === "ArrowUp" && nodeIndex > 0) {
            setActiveNodeId(siblings[nodeIndex - 1].id);
          } else if (e.key === "ArrowDown" && nodeIndex < siblings.length - 1) {
            setActiveNodeId(siblings[nodeIndex + 1].id);
          } else if (e.key === "ArrowLeft" && activeNode.parentId) {
            setActiveNodeId(activeNode.parentId);
          } else if (e.key === "ArrowRight") {
            const children = nodes.filter((n) => n.parentId === activeNodeId);
            if (children.length > 0) {
              setActiveNodeId(children[0].id);
            }
          }
          break;
      }
    },
    [
      activeNodeId,
      nodes,
      readOnly,
      handleAddChildNode,
      handleAddSiblingNode,
      handleDeleteNode,
    ]
  );

  // Handle real-time collaboration events
  useEffect(() => {
    if (isDemo) return;

    const handleNodeUpdate = (data: any) => {
      if (data.mindMapId !== mindMapId) return;

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === data.nodeId ? { ...node, content: data.content } : node
        )
      );
    };

    const handleNodeCreate = (data: any) => {
      if (data.mindMapId !== mindMapId) return;

      setNodes((prevNodes) => [...prevNodes, data.node]);
    };

    const handleNodeDelete = (data: any) => {
      if (data.mindMapId !== mindMapId) return;

      // Get all child nodes recursively
      const getChildNodeIds = (nodeId: string): string[] => {
        const childNodes = nodes.filter((n) => n.parentId === nodeId);
        return [
          nodeId,
          ...childNodes.flatMap((child) => getChildNodeIds(child.id)),
        ];
      };

      const nodeIdsToDelete = getChildNodeIds(data.nodeId);

      setNodes((prevNodes) =>
        prevNodes.filter((node) => !nodeIdsToDelete.includes(node.id))
      );
    };

    socket.on("node:update", handleNodeUpdate);
    socket.on("node:create", handleNodeCreate);
    socket.on("node:delete", handleNodeDelete);

    return () => {
      socket.off("node:update", handleNodeUpdate);
      socket.off("node:create", handleNodeCreate);
      socket.off("node:delete", handleNodeDelete);
    };
  }, [mindMapId, isDemo, nodes]);

  // Handle pan and zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag when clicking the background, not a node
    if ((e.target as HTMLElement).closest(".node")) return;

    setIsDragging(true);
    setStartDragPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - startDragPoint.x;
    const dy = e.clientY - startDragPoint.y;

    setViewportPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setStartDragPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.max(0.5, Math.min(2, zoom + delta));

    // Zoom toward cursor position
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (containerRect) {
      const mouseX = e.clientX - containerRect.left;
      const mouseY = e.clientY - containerRect.top;

      // Calculate new viewport position to zoom toward cursor
      const newViewportX =
        viewportPosition.x -
        (mouseX - containerRect.width / 2) * (delta / zoom);
      const newViewportY =
        viewportPosition.y -
        (mouseY - containerRect.height / 2) * (delta / zoom);

      setViewportPosition({ x: newViewportX, y: newViewportY });
    }

    setZoom(newZoom);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        ref={containerRef}
        className="mind-map-container relative overflow-hidden cursor-grab"
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        tabIndex={0}
      >
        <div
          className="mind-map-content absolute"
          style={{
            transform: `translate(${viewportPosition.x}px, ${viewportPosition.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
            width: "100%",
            height: "100%",
          }}
        >
          {/* SVG lines between nodes */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {lines.map((line, index) => (
              <path
                key={`${line.from}-${line.to}`}
                d={line.path}
                stroke="rgba(100, 100, 100, 0.3)"
                strokeWidth="2"
                fill="none"
                className={
                  activeNodeId === line.to || activeNodeId === line.from
                    ? "node-line active"
                    : "node-line"
                }
              />
            ))}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <MindMapNode
              key={node.id}
              node={node}
              isActive={node.id === activeNodeId}
              onContentChange={handleNodeContentChange}
              onAddChild={handleAddChildNode}
              onAddSibling={handleAddSiblingNode}
              onDelete={handleDeleteNode}
              onActivate={setActiveNodeId}
              registerRef={registerNodeRef}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
