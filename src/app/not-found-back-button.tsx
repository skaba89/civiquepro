"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.history.back()}
      className="font-semibold"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Page précédente
    </Button>
  );
}
