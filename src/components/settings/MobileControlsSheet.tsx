"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type MobileControlsSheetProps = {
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
};

export function MobileControlsSheet({ children, isOpen, onToggle }: MobileControlsSheetProps) {
  const Icon = isOpen ? ChevronDown : ChevronUp;

  return (
    <div className="fixed inset-x-3 bottom-20 z-40 sm:hidden">
      <Button className="mb-2 w-full" onClick={onToggle} variant="secondary">
        <Icon aria-hidden="true" className="h-4 w-4" />
        Controls
      </Button>
      {isOpen ? <Card className="max-h-[45dvh] overflow-y-auto p-3">{children}</Card> : null}
    </div>
  );
}
