"use client";

import { Eye, EyeOff, Lock, RotateCcw, Unlock } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { ARObject } from "@/lib/types";

type ObjectToolbarProps = {
  className?: string;
  objects: readonly ARObject[];
  onLockObject: (objectId: string, locked: boolean) => void;
  onResetAll: () => void;
  onResetObject: (objectId: string) => void;
  onSelectObject: (objectId: string) => void;
  onToggleVisibility: (objectId: string) => void;
  selectedObjectId: string | null;
};

export function ObjectToolbar({
  className,
  objects,
  onLockObject,
  onResetAll,
  onResetObject,
  onSelectObject,
  onToggleVisibility,
  selectedObjectId
}: ObjectToolbarProps) {
  return (
    <aside
      className={cn(
        "fixed left-4 top-[18.25rem] z-30 w-[min(22rem,calc(100vw-2rem))] sm:left-6",
        className
      )}
    >
      <Card className="border-cyan-100/[0.12] bg-black/45 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Objects</h2>
          <Button onClick={onResetAll} size="sm" variant="secondary">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Reset all
          </Button>
        </div>
        <div className="space-y-2">
          {objects.map((object) => {
            const isSelected = object.id === selectedObjectId;

            return (
              <div
                className={cn(
                  "rounded-md border border-cyan-100/[0.1] bg-white/[0.045] p-2",
                  isSelected && "border-amber-200/45 bg-amber-200/[0.08]"
                )}
                key={object.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    className="min-w-0 flex-1 truncate text-left text-xs font-semibold text-cyan-50"
                    onClick={() => onSelectObject(object.id)}
                    type="button"
                  >
                    {object.name}
                  </button>
                  <span className="shrink-0 rounded-md border border-cyan-100/[0.12] px-2 py-1 text-[0.65rem] text-cyan-100/70">
                    {object.type}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Button onClick={() => onSelectObject(object.id)} size="sm" variant="secondary">
                    Select
                  </Button>
                  <Button
                    aria-label={object.visible ? `Hide ${object.name}` : `Show ${object.name}`}
                    onClick={() => onToggleVisibility(object.id)}
                    size="icon"
                    variant="secondary"
                  >
                    {object.visible ? (
                      <Eye aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <EyeOff aria-hidden="true" className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    aria-label={object.locked ? `Unlock ${object.name}` : `Lock ${object.name}`}
                    onClick={() => onLockObject(object.id, !object.locked)}
                    size="icon"
                    variant="secondary"
                  >
                    {object.locked ? (
                      <Lock aria-hidden="true" className="h-4 w-4 text-red-100" />
                    ) : (
                      <Unlock aria-hidden="true" className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    aria-label={`Reset ${object.name}`}
                    onClick={() => onResetObject(object.id)}
                    size="icon"
                    variant="secondary"
                  >
                    <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </aside>
  );
}
