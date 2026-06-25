"use client";

import { useMemo, useState } from "react";

import { ModelSelector } from "@/components/ar/ModelSelector";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { OBJECT_PRESETS } from "@/lib/objectPresets";
import type { ObjectPreset, ObjectPresetCategory } from "@/lib/types";

type ObjectLibraryPanelProps = {
  className?: string;
  hasSelectedObject: boolean;
  onAddPreset: (preset: ObjectPreset) => void;
  onReplaceSelected: (preset: ObjectPreset) => void;
  onSelectModel: (url: string) => void;
};

const categories: (ObjectPresetCategory | "all")[] = [
  "all",
  "abstract",
  "nature",
  "tech",
  "space",
  "custom"
];

export function ObjectLibraryPanel({
  className,
  hasSelectedObject,
  onAddPreset,
  onReplaceSelected,
  onSelectModel
}: ObjectLibraryPanelProps) {
  const [category, setCategory] = useState<ObjectPresetCategory | "all">("all");
  const filteredPresets = useMemo(
    () =>
      category === "all"
        ? OBJECT_PRESETS
        : OBJECT_PRESETS.filter((preset) => preset.category === category),
    [category]
  );

  return (
    <aside className={className}>
      <Card className="border-cyan-100/[0.12] bg-black/45 p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Object Library</h2>
          <select
            className="rounded-md border border-cyan-100/[0.14] bg-black/35 px-2 py-1 text-xs text-cyan-50"
            onChange={(event) => setCategory(event.target.value as ObjectPresetCategory | "all")}
            value={category}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {filteredPresets.map((preset) => (
            <div
              className="rounded-md border border-cyan-100/[0.1] bg-white/[0.045] p-2"
              key={preset.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-cyan-50">{preset.name}</p>
                  <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-neutral-400">
                    {preset.description}
                  </p>
                </div>
                <span className="rounded-md border border-cyan-100/[0.12] px-2 py-1 text-[0.65rem] text-cyan-100/70">
                  {preset.category}
                </span>
              </div>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => onAddPreset(preset)} size="sm">
                  Add
                </Button>
                <Button
                  disabled={!hasSelectedObject}
                  onClick={() => onReplaceSelected(preset)}
                  size="sm"
                  variant="secondary"
                >
                  Replace
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-cyan-100/[0.12] pt-3">
          <ModelSelector disabled={!hasSelectedObject} onSelectModel={onSelectModel} />
        </div>
      </Card>
    </aside>
  );
}
