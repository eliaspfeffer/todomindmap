import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { useDrag } from "react-dnd";
import { debounce } from "@/lib/utils";

interface NodeData {
  id: string;
  content: string;
  parentId: string | null;
  position: { x: number; y: number };
  order: number;
}

interface MindMapNodeProps {
  node: NodeData;
  isActive: boolean;
  onContentChange: (id: string, content: string) => void;
  onAddChild: (id: string) => void;
  onAddSibling: (id: string) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string | null) => void;
  registerRef: (id: string, element: HTMLDivElement | null) => void;
  readOnly: boolean;
}

export default function MindMapNode({
  node,
  isActive,
  onContentChange,
  onAddChild,
  onAddSibling,
  onDelete,
  onActivate,
  registerRef,
  readOnly,
}: MindMapNodeProps) {
  const [content, setContent] = useState(node.content);
  const [isEditing, setIsEditing] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Register the node ref
  useEffect(() => {
    registerRef(node.id, nodeRef.current);
    return () => {
      registerRef(node.id, null);
    };
  }, [node.id, registerRef]);

  // Focus input when editing
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Auto-focus when a node is newly created (empty content)
  useEffect(() => {
    if (isActive && !node.content && !readOnly && !isEditing) {
      setIsEditing(true);
    }
  }, [isActive, node.content, readOnly, isEditing]);

  // Handle drag and drop
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "NODE",
    item: { id: node.id, type: "NODE" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !readOnly,
  }));

  // Handle content change
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    debouncedContentChange(e.target.value);
  };

  const debouncedContentChange = debounce((newContent: string) => {
    onContentChange(node.id, newContent);
  }, 300);

  // Handle key down events
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      onAddChild(node.id);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onAddSibling(node.id);
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  // Handle click events
  const handleClick = () => {
    if (!isActive) {
      onActivate(node.id);
    }

    if (!readOnly && !isEditing) {
      setIsEditing(true);
    }
  };

  // Handle blur
  const handleBlur = () => {
    setIsEditing(false);

    // If content is empty after editing, delete the node
    if (!content.trim() && node.parentId) {
      onDelete(node.id);
    }
  };

  return (
    <div
      ref={(element) => {
        drag(element);
        if (nodeRef) {
          nodeRef.current = element;
        }
      }}
      className={`node absolute ${isActive ? "active" : ""} ${
        isDragging ? "opacity-50" : ""
      }`}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        minWidth: "120px",
        maxWidth: "250px",
        zIndex: isActive ? 10 : 1,
      }}
      onClick={handleClick}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          className="node-input w-full resize-none"
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Type something..."
          rows={Math.max(1, (content.match(/\n/g) || []).length + 1)}
          style={{ minHeight: "24px" }}
          disabled={readOnly}
        />
      ) : (
        <div className="whitespace-pre-wrap break-words">
          {content || (
            <span className="text-muted-foreground">(Click to edit)</span>
          )}
        </div>
      )}

      {/* Node tools displayed when active */}
      {isActive && !readOnly && !isEditing && (
        <div className="absolute flex gap-1 -top-6 left-1/2 transform -translate-x-1/2">
          <button
            className="p-1 bg-muted text-xs text-muted-foreground rounded hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(node.id);
            }}
            title="Add child (Tab)"
          >
            +
          </button>
          <button
            className="p-1 bg-muted text-xs text-muted-foreground rounded hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onAddSibling(node.id);
            }}
            title="Add sibling (Enter)"
          >
            →
          </button>
          {node.parentId && (
            <button
              className="p-1 bg-muted text-xs text-muted-foreground rounded hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              title="Delete (Delete)"
            >
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}
