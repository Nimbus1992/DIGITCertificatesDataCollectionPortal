import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Upload,
  Palette,
  FileText,
  Shield,
  X,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme, PRESET_THEMES, ThemeConfig } from "@/contexts/ThemeContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastText(hex: string): string {
  return getRelativeLuminance(hex) > 0.3 ? "#1E293B" : "#FFFFFF";
}

// Button radius: use the full value (including pill).
// Card/icon radius: cap at 0.75rem to prevent deforming containers.
function buttonRadius(r: string) { return r; }
function cardRadius(r: string) { return r === "9999px" ? "0.75rem" : r; }

const FONT_OPTIONS = [
  "Roboto", "Public Sans", "Inter", "DM Sans",
  "Lato", "Source Sans Pro", "Open Sans", "Nunito",
];

const RADIUS_OPTIONS = [
  { label: "None",   value: "0" },
  { label: "Small",  value: "0.25rem" },
  { label: "Medium", value: "0.5rem" },
  { label: "Large",  value: "0.75rem" },
  { label: "Pill",   value: "9999px" },
];

// ─── Custom theme dialog ──────────────────────────────────────────────────────

const defaultCustom: Omit<ThemeConfig, "id"> = {
  name: "",
  accentHex: "#136DEC",
  sidebarHex: "#1E3A5F",
  font: "Inter",
  borderRadius: "0.5rem",
  isCustom: true,
};

interface CustomThemeDialogProps {
  open: boolean;
  onClose: () => void;
  initial?: ThemeConfig;
}

function CustomThemeDialog({ open, onClose, initial }: CustomThemeDialogProps) {
  const { saveCustomTheme } = useTheme();
  const [form, setForm] = useState<Omit<ThemeConfig, "id">>({
    ...defaultCustom,
    ...(initial ?? {}),
  });

  // Reset when dialog re-opens
  React.useEffect(() => {
    if (open) {
      setForm({ ...defaultCustom, ...(initial ?? {}) });
    }
  }, [open, initial]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Please enter a theme name"); return; }
    const theme: ThemeConfig = {
      id: initial?.id ?? `custom-${Date.now()}`,
      ...form,
      isCustom: true,
    };
    saveCustomTheme(theme);
    toast.success(`Theme "${theme.name}" saved — select it and click Apply`);
    onClose();
  };

  const cr = cardRadius(form.borderRadius);
  const br = buttonRadius(form.borderRadius);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Custom Theme" : "Create Custom Theme"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-5 py-2">
          {/* Left: controls */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Theme Name</Label>
              <Input
                placeholder="e.g. City Portal Dark"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Accent Colour <span className="text-muted-foreground text-[10px]">(buttons &amp; links)</span></Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accentHex}
                  onChange={(e) => set("accentHex", e.target.value)}
                  className="h-8 w-12 rounded border cursor-pointer shrink-0"
                />
                <Input
                  value={form.accentHex}
                  onChange={(e) => set("accentHex", e.target.value)}
                  className="font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Sidebar Colour</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.sidebarHex}
                  onChange={(e) => set("sidebarHex", e.target.value)}
                  className="h-8 w-12 rounded border cursor-pointer shrink-0"
                />
                <Input
                  value={form.sidebarHex}
                  onChange={(e) => set("sidebarHex", e.target.value)}
                  className="font-mono text-xs"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Font Family</Label>
              <Select value={form.font} onValueChange={(v) => set("font", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Border Radius</Label>
              <div className="flex gap-1.5 flex-wrap">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => set("borderRadius", r.value)}
                    className={`px-2.5 py-1 text-[11px] border transition-colors rounded-md ${
                      form.borderRadius === r.value
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-background border-border hover:border-accent"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: mini preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div
              className="rounded-xl overflow-hidden border text-xs"
              style={{ fontFamily: `'${form.font}', system-ui, sans-serif` }}
            >
              {/* Header */}
              <div
                className="flex items-center gap-2 px-3 py-2.5"
                style={{ backgroundColor: form.sidebarHex }}
              >
                <div
                  className="h-5 w-5 flex items-center justify-center text-[9px] font-bold"
                  style={{
                    borderRadius: cr,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: contrastText(form.sidebarHex),
                  }}
                >
                  {(form.name || "T")[0].toUpperCase()}
                </div>
                <span
                  className="font-semibold text-[11px] truncate"
                  style={{ color: contrastText(form.sidebarHex) }}
                >
                  {form.name || "My Theme"}
                </span>
              </div>
              {/* Body */}
              <div className="p-3 bg-gray-50 space-y-2.5">
                <div className="grid grid-cols-2 gap-1.5">
                  {["12 Apps", "3 Pending"].map((t) => (
                    <div
                      key={t}
                      className="bg-white p-2 shadow-sm"
                      style={{ borderRadius: cr }}
                    >
                      <p className="text-[9px] text-gray-400">Stat</p>
                      <p className="font-bold text-sm" style={{ color: form.accentHex }}>{t.split(" ")[0]}</p>
                      <p className="text-[9px] text-gray-400">{t.split(" ")[1]}</p>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full py-1.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: form.accentHex,
                    color: contrastText(form.accentHex),
                    borderRadius: br,
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Theme</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const BrandingTheme: React.FC = () => {
  const {
    activeThemeId,
    logoDataUrl,
    portalName,
    customThemes,
    applyTheme,
    setLogo,
    setPortalName,
    deleteCustomTheme,
  } = useTheme();

  // Two-step select → apply flow
  // `selectedId` tracks which card is highlighted; only becomes active after Apply click.
  const [selectedId, setSelectedId] = useState<string>(activeThemeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeConfig | undefined>();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Keep selection in sync if theme changes externally (e.g. after saving custom)
  React.useEffect(() => { setSelectedId(activeThemeId); }, [activeThemeId]);

  const allThemes: ThemeConfig[] = [...PRESET_THEMES, ...customThemes];
  const selectedTheme = allThemes.find((t) => t.id === selectedId) ?? PRESET_THEMES[0];
  const activeTheme  = allThemes.find((t) => t.id === activeThemeId) ?? PRESET_THEMES[0];
  const isDirty = selectedId !== activeThemeId;

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApply = () => {
    applyTheme(selectedTheme);
    toast.success(`Theme "${selectedTheme.name}" applied to the entire app`);
  };

  // ── Logo upload ────────────────────────────────────────────────────────────
  const readAndSetLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { setLogo(reader.result as string); toast.success("Logo updated"); };
    reader.readAsDataURL(file);
  };
  const handleLogoFile  = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) readAndSetLogo(f); };
  const removeLogo = () => { setLogo(""); toast.success("Logo removed"); };

  // ── Custom theme handlers ─────────────────────────────────────────────────
  const openNewDialog  = () => { setEditingTheme(undefined); setDialogOpen(true); };
  const openEditDialog = (t: ThemeConfig) => { setEditingTheme(t); setDialogOpen(true); };
  const handleDelete   = (id: string) => {
    deleteCustomTheme(id);
    if (selectedId === id)   setSelectedId(PRESET_THEMES[0].id);
    if (activeThemeId === id) applyTheme(PRESET_THEMES[0]);
    toast.success("Custom theme deleted");
  };

  // Shared preview card radius / button radius from selected (not yet applied) theme
  const prevCardR   = cardRadius(selectedTheme.borderRadius);
  const prevButtonR = buttonRadius(selectedTheme.borderRadius);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Branding &amp; Theme</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Customise the look and feel of your platform — select a theme and click Apply
            </p>
          </div>
          {/* Sticky Apply button — prominent, always visible */}
          <Button
            onClick={handleApply}
            disabled={!isDirty}
            className="gap-2 shrink-0"
            size="lg"
          >
            <Sparkles className="h-4 w-4" />
            {isDirty
              ? `Apply "${selectedTheme.name}"`
              : `"${activeTheme.name}" Applied`}
          </Button>
        </div>

        {/* ── 50 / 50 split ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-6 items-start">

          {/* ══ LEFT: Config ══════════════════════════════════════════════ */}
          <div className="space-y-6">

            {/* Logo */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold text-foreground">Logo</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Appears in the sidebar. Persisted across reloads.
                </p>
                {logoDataUrl ? (
                  <div className="flex items-center gap-3 p-3 border rounded-xl bg-muted/30">
                    <img src={logoDataUrl} alt="Logo" className="h-12 w-12 object-contain rounded-lg border bg-white p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Logo uploaded</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Visible in sidebar header</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => replaceInputRef.current?.click()}>
                        <Upload className="h-3.5 w-3.5 mr-1" /> Replace
                      </Button>
                      <Button variant="ghost" size="sm" onClick={removeLogo}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <input ref={replaceInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                  </div>
                ) : (
                  <label className="border-2 border-dashed rounded-xl p-6 text-center text-muted-foreground hover:border-accent/50 transition-colors cursor-pointer block">
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
                    <Upload className="h-5 w-5 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Click to upload logo</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">PNG, SVG, JPG, WebP — max 5 MB</p>
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Portal Name */}
            <Card>
              <CardContent className="p-5 space-y-3">
                <h2 className="font-semibold text-foreground">Portal Name</h2>
                <p className="text-xs text-muted-foreground">Shown in the sidebar next to the logo.</p>
                <Input
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  placeholder="e.g. City A Corporation"
                />
              </CardContent>
            </Card>

            {/* Unified Themes — presets + custom in one grid */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-semibold text-foreground">Themes</h2>
                  </div>
                  <Button size="sm" variant="outline" onClick={openNewDialog} className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> New Theme
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click a theme to preview it, then click <strong>Apply</strong> to make it live across the app.
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {allThemes.map((theme) => {
                    const isSelected = selectedId === theme.id;
                    const isActive   = activeThemeId === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedId(theme.id)}
                        className={`relative text-left p-3.5 rounded-xl border-2 transition-all hover:shadow-sm ${
                          isSelected
                            ? "border-accent ring-2 ring-accent/20 bg-accent/5"
                            : "border-border hover:border-muted-foreground/40"
                        }`}
                      >
                        {/* State badges */}
                        <div className="absolute top-2 right-2 flex gap-1">
                          {isActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                              Live
                            </span>
                          )}
                          {theme.isCustom && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                              Custom
                            </Badge>
                          )}
                        </div>

                        {/* Colour swatches */}
                        <div className="flex gap-1.5 mb-2.5">
                          <div
                            className="h-5 w-5 rounded-md shadow-sm border border-white/10"
                            style={{ backgroundColor: theme.sidebarHex }}
                            title="Sidebar colour"
                          />
                          <div
                            className="h-5 w-5 rounded-md shadow-sm border border-white/10"
                            style={{ backgroundColor: theme.accentHex }}
                            title="Accent colour"
                          />
                        </div>

                        <p className="text-xs font-semibold text-foreground pr-10">{theme.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{theme.font}</p>

                        {/* Edit / Delete for custom themes */}
                        {theme.isCustom && (
                          <div className="flex gap-1 mt-2">
                            <button
                              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                              onClick={(e) => { e.stopPropagation(); openEditDialog(theme); }}
                              title="Edit"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={(e) => { e.stopPropagation(); handleDelete(theme.id); }}
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}

                        {/* Selected checkmark */}
                        {isSelected && (
                          <div
                            className="absolute bottom-2 right-2 h-5 w-5 rounded-full flex items-center justify-center shadow-sm"
                            style={{ backgroundColor: theme.accentHex }}
                          >
                            <Check className="h-3 w-3" style={{ color: contrastText(theme.accentHex) }} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ══ RIGHT: Live Preview (≈50% width) ══════════════════════════ */}
          <div className="sticky top-8 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Preview</p>
              <span className="text-xs text-muted-foreground">
                {isDirty
                  ? <>Previewing <strong className="text-foreground">{selectedTheme.name}</strong> — not yet applied</>
                  : <><strong className="text-foreground">{activeTheme.name}</strong> is live</>
                }
              </span>
            </div>

            <Card className="overflow-hidden">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border-b">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                <div className="flex-1 mx-3 h-5 bg-background rounded text-[10px] text-muted-foreground flex items-center px-2">
                  portal.cityportal.gov
                </div>
              </div>

              <div
                className="text-sm"
                style={{ fontFamily: `'${selectedTheme.font}', system-ui, sans-serif` }}
              >
                {/* App shell: sidebar + main */}
                <div className="flex" style={{ minHeight: "480px" }}>

                  {/* Sidebar */}
                  <div
                    className="w-44 shrink-0 flex flex-col py-4 px-3 gap-1"
                    style={{ backgroundColor: selectedTheme.sidebarHex }}
                  >
                    {/* Logo row */}
                    <div className="flex items-center gap-2 mb-4 px-1">
                      {logoDataUrl ? (
                        <img src={logoDataUrl} alt="Logo" className="h-6 w-6 object-contain rounded" />
                      ) : (
                        <div
                          className="h-6 w-6 flex items-center justify-center text-[10px] font-bold"
                          style={{
                            borderRadius: prevCardR,
                            backgroundColor: "rgba(255,255,255,0.15)",
                            color: contrastText(selectedTheme.sidebarHex),
                          }}
                        >
                          {(portalName || "L")[0].toUpperCase()}
                        </div>
                      )}
                      <span
                        className="font-semibold text-[11px] truncate"
                        style={{ color: contrastText(selectedTheme.sidebarHex) }}
                      >
                        {portalName || "LnP Platform"}
                      </span>
                    </div>

                    {/* Nav items */}
                    {["Dashboard", "Services", "Applications", "Settings"].map((item, i) => (
                      <div
                        key={item}
                        className="px-2 py-1.5 text-[11px] flex items-center gap-2 transition-colors"
                        style={{
                          borderRadius: prevCardR,
                          backgroundColor: i === 0
                            ? selectedTheme.accentHex
                            : "transparent",
                          color: i === 0
                            ? contrastText(selectedTheme.accentHex)
                            : `${contrastText(selectedTheme.sidebarHex)}99`,
                        }}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            backgroundColor: i === 0
                              ? contrastText(selectedTheme.accentHex)
                              : `${contrastText(selectedTheme.sidebarHex)}60`,
                          }}
                        />
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Main content */}
                  <div className="flex-1 bg-gray-50 p-5 space-y-4 overflow-hidden">
                    <div>
                      <p className="font-bold text-gray-900">Dashboard</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Good morning, Alexander</p>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { label: "Applications", value: "48" },
                        { label: "Pending",       value: "12" },
                        { label: "Approved",      value: "31" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="bg-white p-3 shadow-sm"
                          style={{ borderRadius: prevCardR }}
                        >
                          <p className="text-[9px] text-gray-400">{s.label}</p>
                          <p
                            className="text-xl font-bold mt-0.5"
                            style={{ color: selectedTheme.accentHex }}
                          >
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 text-[11px] font-medium shadow-sm"
                        style={{
                          backgroundColor: selectedTheme.accentHex,
                          color: contrastText(selectedTheme.accentHex),
                          borderRadius: prevButtonR,
                        }}
                      >
                        New Application
                      </button>
                      <button
                        className="px-4 py-2 text-[11px] font-medium border"
                        style={{
                          borderColor: selectedTheme.accentHex,
                          color: selectedTheme.accentHex,
                          borderRadius: prevButtonR,
                          backgroundColor: "transparent",
                        }}
                      >
                        View Reports
                      </button>
                    </div>

                    {/* Document list */}
                    <div
                      className="bg-white p-3 shadow-sm space-y-2"
                      style={{ borderRadius: prevCardR }}
                    >
                      <p className="text-[10px] font-semibold text-gray-600 mb-2">Recent Documents</p>
                      {["Building Permit 2025", "Trade License Renewal", "Food Safety Certificate"].map((doc) => (
                        <div key={doc} className="flex items-center gap-2">
                          <FileText className="h-3 w-3 shrink-0" style={{ color: selectedTheme.accentHex }} />
                          <span className="text-[10px] text-gray-700 truncate">{doc}</span>
                          <span className="ml-auto text-[9px] text-gray-400 shrink-0">2d ago</span>
                        </div>
                      ))}
                    </div>

                    {/* Input row */}
                    <div
                      className="bg-white p-3 shadow-sm"
                      style={{ borderRadius: prevCardR }}
                    >
                      <p className="text-[10px] font-semibold text-gray-600 mb-2">Search Services</p>
                      <div
                        className="border border-gray-200 px-3 py-1.5 text-[10px] text-gray-400"
                        style={{ borderRadius: prevCardR }}
                      >
                        Search for a permit or licence…
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Theme info strip */}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-muted/30 text-xs">
              <div className="flex gap-1.5 items-center">
                <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: selectedTheme.sidebarHex }} />
                <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: selectedTheme.accentHex }} />
              </div>
              <span className="font-medium text-foreground">{selectedTheme.name}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{selectedTheme.font}</span>
              {isDirty && (
                <span className="ml-auto text-amber-600 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                  Unsaved
                </span>
              )}
              {!isDirty && (
                <span className="ml-auto text-green-600 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                  Applied
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomThemeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initial={editingTheme}
      />
    </div>
  );
};

export default BrandingTheme;
