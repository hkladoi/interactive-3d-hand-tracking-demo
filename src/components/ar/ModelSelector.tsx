"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { MODEL_REGISTRY, isValidModelUrl } from "@/lib/modelRegistry";

type ModelSelectorProps = {
  disabled?: boolean;
  onSelectModel: (url: string) => void;
};

export function ModelSelector({ disabled = false, onSelectModel }: ModelSelectorProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApplyCustomUrl = () => {
    if (!isValidModelUrl(customUrl)) {
      setErrorMessage("Use a /models/*.glb or /models/*.gltf URL.");
      return;
    }

    setErrorMessage(null);
    onSelectModel(customUrl);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/45">
        Model selector
      </p>
      <div className="grid gap-2">
        {MODEL_REGISTRY.map((model) => (
          <Button
            disabled={disabled}
            key={model.id}
            onClick={() => onSelectModel(model.url)}
            size="sm"
            variant="secondary"
          >
            {model.name}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-md border border-cyan-100/[0.14] bg-black/35 px-3 py-2 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-teal-200/50"
          disabled={disabled}
          onChange={(event) => setCustomUrl(event.target.value)}
          placeholder="/models/tree.glb"
          value={customUrl}
        />
        <Button disabled={disabled} onClick={handleApplyCustomUrl} size="sm" variant="secondary">
          Apply
        </Button>
      </div>
      {errorMessage ? <p className="text-xs text-amber-100">{errorMessage}</p> : null}
    </div>
  );
}
