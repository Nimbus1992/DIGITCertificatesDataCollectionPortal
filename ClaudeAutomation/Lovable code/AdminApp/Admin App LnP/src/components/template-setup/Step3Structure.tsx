import React from "react";
import { ArrowRight, Upload, FileSpreadsheet, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { parseCategoriesCsv, parseSubcategoriesCsv } from "@/lib/csvParse";

interface Props {
  hasCategories: boolean | null;
  setHasCategories: (v: boolean) => void;
  categoriesFile: File | null;
  setCategoriesFile: (f: File | null) => void;

  hasSubcategories: boolean | null;
  setHasSubcategories: (v: boolean) => void;
  subcategoriesFile: File | null;
  setSubcategoriesFile: (f: File | null) => void;

  setCategoriesList: (list: string[]) => void;
  setSubcategoriesList: (list: { name: string; parent: string }[]) => void;

  onContinue: () => void;
}

const CATEGORIES_SAMPLE_CSV =
  "Category Name\nRetail\nManufacturing\nHospitality\n";

const SUBCATEGORIES_SAMPLE_CSV =
  "Subcategory Name,Parent Category\nRestaurant,Hospitality\nBakery,Retail\nGarment Factory,Manufacturing\n";

const downloadSample = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const YesNo: React.FC<{
  value: boolean | null;
  onChange: (v: boolean) => void;
}> = ({ value, onChange }) => (
  <div className="inline-flex rounded-md border border-input p-0.5 bg-background">
    {[
      { v: true, label: "Yes" },
      { v: false, label: "No" },
    ].map((o) => (
      <button
        key={o.label}
        type="button"
        onClick={() => onChange(o.v)}
        className={cn(
          "px-4 py-1.5 text-sm rounded-sm transition-colors",
          value === o.v
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Dropzone: React.FC<{
  file: File | null;
  onChange: (f: File | null) => void;
  id: string;
  sampleFilename: string;
  sampleCsv: string;
}> = ({ file, onChange, id, sampleFilename, sampleCsv }) => (
  <div className="mt-4 animate-accordion-down overflow-hidden">
    {file ? (
      <div className="flex items-center gap-3 p-3 rounded-md border border-accent/30 bg-accent/5">
        <FileSpreadsheet className="h-5 w-5 text-accent shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onChange(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    ) : (
      <label
        htmlFor={id}
        className="flex flex-col items-center justify-center gap-2 p-6 rounded-md border-2 border-dashed border-input hover:border-accent/50 hover:bg-muted/30 cursor-pointer transition-colors"
      >
        <Upload className="h-5 w-5 text-muted-foreground" />
        <div className="text-sm text-foreground">
          <span className="font-medium text-accent">Click to upload</span> or drag a file
        </div>
        <div className="text-xs text-muted-foreground">CSV or Excel (.csv, .xlsx)</div>
        <input
          id={id}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    )}
    {!file && (
      <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Skip for now and add it later from the configurator.
        </p>
        <button
          type="button"
          onClick={() => downloadSample(sampleFilename, sampleCsv)}
          className="inline-flex items-center gap-1 text-xs text-accent underline-offset-2 hover:underline"
        >
          <Download className="h-3.5 w-3.5" />
          Download sample file
        </button>
      </div>
    )}
  </div>
);

const Step3Structure: React.FC<Props> = ({
  hasCategories,
  setHasCategories,
  categoriesFile,
  setCategoriesFile,
  hasSubcategories,
  setHasSubcategories,
  subcategoriesFile,
  setSubcategoriesFile,
  setCategoriesList,
  setSubcategoriesList,
  onContinue,
}) => {
  const handleCategoriesChange = (v: boolean) => {
    setHasCategories(v);
    if (!v) {
      setHasSubcategories(false);
      setSubcategoriesFile(null);
      setCategoriesList([]);
      setSubcategoriesList([]);
    }
  };

  const handleCategoriesFile = async (f: File | null) => {
    setCategoriesFile(f);
    if (!f) {
      setCategoriesList([]);
      return;
    }
    try {
      const list = await parseCategoriesCsv(f);
      setCategoriesList(list);
    } catch {
      setCategoriesList([]);
    }
  };

  const handleSubcategoriesFile = async (f: File | null) => {
    setSubcategoriesFile(f);
    if (!f) {
      setSubcategoriesList([]);
      return;
    }
    try {
      const list = await parseSubcategoriesCsv(f);
      setSubcategoriesList(list);
    } catch {
      setSubcategoriesList([]);
    }
  };

  const canContinue =
    hasCategories !== null &&
    (hasCategories === false || hasSubcategories !== null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Let's structure your licenses
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          A few quick questions help us pre-configure your application correctly.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="text-base font-medium text-foreground">
                Do you have license categories?
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                For example: Retail, Manufacturing, Hospitality.
              </div>
            </div>
            <YesNo value={hasCategories} onChange={handleCategoriesChange} />
          </div>
          {hasCategories === true && (
            <Dropzone
              id="cat-upload"
              file={categoriesFile}
              onChange={handleCategoriesFile}
              sampleFilename="license-categories-sample.csv"
              sampleCsv={CATEGORIES_SAMPLE_CSV}
            />
          )}
        </Card>

        {hasCategories === true && (
          <div className="animate-accordion-down overflow-hidden">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="text-base font-medium text-foreground">
                    Do you have license subcategories?
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    For example: Restaurant under Hospitality, Bakery under Retail.
                  </div>
                </div>
                <YesNo value={hasSubcategories} onChange={setHasSubcategories} />
              </div>
              {hasSubcategories === true && (
                <Dropzone
                  id="sub-upload"
                  file={subcategoriesFile}
                  onChange={handleSubcategoriesFile}
                  sampleFilename="license-subcategories-sample.csv"
                  sampleCsv={SUBCATEGORIES_SAMPLE_CSV}
                />
              )}
            </Card>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          size="lg"
          className="gap-1.5"
          disabled={!canContinue}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Step3Structure;