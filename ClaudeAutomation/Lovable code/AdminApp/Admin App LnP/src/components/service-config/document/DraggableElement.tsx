import React, { useRef, useState, useCallback, useEffect } from "react";

interface DraggableElementProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered: boolean;
  children: React.ReactNode;
  onSelect: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, width: number, height: number, x: number, y: number) => void;
  onHover: (id: string | null) => void;
  canvasWidth: number;
  canvasHeight: number;
  allElements: { id: string; x: number; y: number; width: number; height: number }[];
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLE_SIZE = 8;
const SNAP_THRESHOLD = 5;

const HANDLE_POSITIONS: Record<ResizeHandle, { cursor: string; style: React.CSSProperties }> = {
  nw: { cursor: "nwse-resize", style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
  n: { cursor: "ns-resize", style: { top: -HANDLE_SIZE / 2, left: "50%", marginLeft: -HANDLE_SIZE / 2 } },
  ne: { cursor: "nesw-resize", style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
  e: { cursor: "ew-resize", style: { top: "50%", right: -HANDLE_SIZE / 2, marginTop: -HANDLE_SIZE / 2 } },
  se: { cursor: "nwse-resize", style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
  s: { cursor: "ns-resize", style: { bottom: -HANDLE_SIZE / 2, left: "50%", marginLeft: -HANDLE_SIZE / 2 } },
  sw: { cursor: "nesw-resize", style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
  w: { cursor: "ew-resize", style: { top: "50%", left: -HANDLE_SIZE / 2, marginTop: -HANDLE_SIZE / 2 } },
};

export interface AlignmentGuide {
  type: "vertical" | "horizontal";
  position: number;
}

const DraggableElement: React.FC<DraggableElementProps> = ({
  id, x, y, width, height, isSelected, isHovered, children,
  onSelect, onDoubleClick, onMove, onResize, onHover,
  canvasWidth, canvasHeight, allElements,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [guides, setGuides] = useState<AlignmentGuide[]>([]);
  const dragStart = useRef({ mx: 0, my: 0, ex: 0, ey: 0 });
  const resizeStart = useRef({ mx: 0, my: 0, w: 0, h: 0, x: 0, y: 0, handle: "" as ResizeHandle });

  const computeGuides = useCallback((cx: number, cy: number, cw: number, ch: number) => {
    const newGuides: AlignmentGuide[] = [];
    const centerX = cx + cw / 2;
    const centerY = cy + ch / 2;
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    if (Math.abs(centerX - canvasCenterX) < SNAP_THRESHOLD) {
      newGuides.push({ type: "vertical", position: canvasCenterX });
    }
    if (Math.abs(centerY - canvasCenterY) < SNAP_THRESHOLD) {
      newGuides.push({ type: "horizontal", position: canvasCenterY });
    }

    for (const el of allElements) {
      if (el.id === id) continue;
      const elCenterX = el.x + el.width / 2;
      const elCenterY = el.y + el.height / 2;
      if (Math.abs(centerX - elCenterX) < SNAP_THRESHOLD) {
        newGuides.push({ type: "vertical", position: elCenterX });
      }
      if (Math.abs(centerY - elCenterY) < SNAP_THRESHOLD) {
        newGuides.push({ type: "horizontal", position: elCenterY });
      }
      if (Math.abs(cx - el.x) < SNAP_THRESHOLD) {
        newGuides.push({ type: "vertical", position: el.x });
      }
      if (Math.abs(cx + cw - (el.x + el.width)) < SNAP_THRESHOLD) {
        newGuides.push({ type: "vertical", position: el.x + el.width });
      }
    }
    return newGuides;
  }, [id, canvasWidth, canvasHeight, allElements]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
    setIsDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ex: x, ey: y };
  }, [id, x, y, onSelect]);

  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStart.current = { mx: e.clientX, my: e.clientY, w: width, h: height, x, y, handle };
  }, [width, height, x, y]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      let nx = Math.max(0, Math.min(canvasWidth - width, dragStart.current.ex + dx));
      let ny = Math.max(0, Math.min(canvasHeight - height, dragStart.current.ey + dy));
      const g = computeGuides(nx, ny, width, height);
      setGuides(g);
      onMove(id, Math.round(nx), Math.round(ny));
    };
    const handleUp = () => {
      setIsDragging(false);
      setGuides([]);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [isDragging, id, width, height, canvasWidth, canvasHeight, onMove, computeGuides]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMove = (e: MouseEvent) => {
      const { mx, my, w, h, x: sx, y: sy, handle } = resizeStart.current;
      const dx = e.clientX - mx;
      const dy = e.clientY - my;
      let nw = w, nh = h, nx = sx, ny = sy;

      if (handle.includes("e")) nw = Math.max(20, w + dx);
      if (handle.includes("w")) { nw = Math.max(20, w - dx); nx = sx + (w - nw); }
      if (handle.includes("s")) nh = Math.max(16, h + dy);
      if (handle.includes("n")) { nh = Math.max(16, h - dy); ny = sy + (h - nh); }

      onResize(id, Math.round(nw), Math.round(nh), Math.round(nx), Math.round(ny));
    };
    const handleUp = () => { setIsResizing(false); setGuides([]); };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => { window.removeEventListener("mousemove", handleMove); window.removeEventListener("mouseup", handleUp); };
  }, [isResizing, id, onResize]);

  return (
    <>
      {/* Alignment guides */}
      {guides.map((g, i) => (
        <div
          key={i}
          className="absolute pointer-events-none z-50"
          style={
            g.type === "vertical"
              ? { left: g.position, top: 0, width: 1, height: canvasHeight, backgroundColor: "hsl(var(--primary) / 0.4)" }
              : { top: g.position, left: 0, height: 1, width: canvasWidth, backgroundColor: "hsl(var(--primary) / 0.4)" }
          }
        />
      ))}
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width,
          height,
          zIndex: isSelected ? 20 : isDragging ? 20 : 10,
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(id); }}
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
        className="group"
      >
        {/* Selection / hover border */}
        <div
          className="absolute inset-0 rounded pointer-events-none"
          style={{
            border: isSelected
              ? "2px solid hsl(var(--primary))"
              : isHovered
                ? "1px solid hsl(var(--primary) / 0.4)"
                : "1px solid transparent",
            transition: "border-color 0.15s",
          }}
        />
        {/* Content */}
        <div className="w-full h-full overflow-hidden">{children}</div>
        {/* Resize handles */}
        {isSelected && (
          <>
            {(Object.entries(HANDLE_POSITIONS) as [ResizeHandle, typeof HANDLE_POSITIONS["nw"]][]).map(([handle, { cursor, style }]) => (
              <div
                key={handle}
                className="absolute bg-primary border border-primary-foreground rounded-sm z-30"
                style={{
                  width: HANDLE_SIZE,
                  height: HANDLE_SIZE,
                  cursor,
                  ...style,
                }}
                onMouseDown={(e) => handleResizeStart(e, handle)}
              />
            ))}
          </>
        )}
        {/* Type badge */}
        {isSelected && (
          <div className="absolute -top-5 left-0 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-t font-medium uppercase tracking-wider">
            {id.startsWith("e") ? "" : ""}
          </div>
        )}
      </div>
    </>
  );
};

export default DraggableElement;
