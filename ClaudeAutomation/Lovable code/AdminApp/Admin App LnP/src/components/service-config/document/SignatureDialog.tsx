import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eraser, Upload } from "lucide-react";

interface SignatureDialogProps {
  currentSignature?: string;
  onSave: (dataUrl: string) => void;
}

const SignatureDialog: React.FC<SignatureDialogProps> = ({ currentSignature, onSave }) => {
  const [tab, setTab] = useState("draw");
  const [typedText, setTypedText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (tab !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onDown = (e: MouseEvent) => {
      isDrawing.current = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };
    const onMove = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };
    const onUp = () => { isDrawing.current = false; };

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("mouseleave", onUp);
    return () => {
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mouseleave", onUp);
    };
  }, [tab]);

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  };

  const saveTyped = () => {
    if (!typedText.trim()) return;
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = "italic 28px 'Brush Script MT', 'Dancing Script', cursive";
    ctx.fillStyle = "#1a1a1a";
    ctx.textBaseline = "middle";
    ctx.fillText(typedText, 10, 40);
    onSave(canvas.toDataURL("image/png"));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onSave(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold">Configure Signature</Label>
      {currentSignature && currentSignature.startsWith("data:") && (
        <div className="border rounded-md p-2 bg-muted/30">
          <img src={currentSignature} alt="Signature" className="max-h-12 mx-auto object-contain" />
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full h-8">
          <TabsTrigger value="draw" className="text-xs flex-1">Draw</TabsTrigger>
          <TabsTrigger value="type" className="text-xs flex-1">Type</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs flex-1">Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="draw" className="space-y-2 mt-2">
          <canvas
            ref={canvasRef}
            width={240}
            height={70}
            className="border rounded-md cursor-crosshair w-full bg-white"
            style={{ touchAction: "none" }}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1 flex-1" onClick={clearCanvas}>
              <Eraser className="h-3 w-3" /> Clear
            </Button>
            <Button size="sm" className="text-xs flex-1" onClick={saveDrawing}>Apply</Button>
          </div>
        </TabsContent>
        <TabsContent value="type" className="space-y-2 mt-2">
          <Input
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            placeholder="Type your signature"
            className="h-8 text-xs"
            style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 18, fontStyle: "italic" }}
          />
          <div className="border rounded-md p-3 bg-white min-h-[50px] flex items-center justify-center">
            <span style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", fontSize: 24, fontStyle: "italic" }}>
              {typedText || "Preview"}
            </span>
          </div>
          <Button size="sm" className="text-xs w-full" onClick={saveTyped} disabled={!typedText.trim()}>
            Apply
          </Button>
        </TabsContent>
        <TabsContent value="upload" className="space-y-2 mt-2">
          <div
            className="border-2 border-dashed border-muted-foreground/30 rounded-md p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-xs text-muted-foreground">Click to upload signature image</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SignatureDialog;
