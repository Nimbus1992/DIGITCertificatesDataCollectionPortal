import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  serviceName: string;
  renewalEnabled: boolean;
  hasCategories: boolean;
  onComplete: () => void;
}

const Step4Initializing: React.FC<Props> = ({
  serviceName,
  renewalEnabled,
  hasCategories,
  onComplete,
}) => {
  const tasks = React.useMemo(
    () =>
      [
        { label: `Creating ${serviceName} application`, skip: false },
        { label: "Configuring modules", skip: false },
        { label: "Preparing workflows", skip: false },
        { label: "Setting up renewals", skip: !renewalEnabled },
        { label: "Preparing document templates", skip: false },
        { label: "Linking categories", skip: !hasCategories },
        { label: "Generating citizen and employee experiences", skip: false },
      ],
    [serviceName, renewalEnabled, hasCategories],
  );

  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (completed >= tasks.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCompleted((c) => c + 1), 480);
    return () => clearTimeout(t);
  }, [completed, tasks.length, onComplete]);

  const progress = Math.round((completed / tasks.length) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Setting up your workspace
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          We're preparing everything based on your template.
        </p>
      </div>

      <Progress value={progress} className="h-1.5" />

      <ul className="space-y-3">
        {tasks.map((task, i) => {
          const isDone = i < completed;
          const isActive = i === completed;
          const isPending = i > completed;
          return (
            <li
              key={task.label}
              className={cn(
                "flex items-center gap-3 p-3 rounded-md border transition-colors animate-fade-in",
                isDone && "border-accent/20 bg-accent/5",
                isActive && "border-accent/30 bg-accent/5",
                isPending && "border-border bg-background",
              )}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 text-accent animate-spin" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-muted" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  task.skip && "line-through text-muted-foreground",
                  !task.skip && isPending && "text-muted-foreground",
                  !task.skip && (isDone || isActive) && "text-foreground",
                )}
              >
                {task.label}
                {task.skip && (
                  <span className="ml-2 text-xs uppercase tracking-wide">(skipped)</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Step4Initializing;