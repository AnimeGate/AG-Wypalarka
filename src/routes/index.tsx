import { createFileRoute } from "@tanstack/react-router";
import { SubtitleBurner } from "@/components/burner";

export const Route = createFileRoute("/")({
  component: SubtitleBurner,
});
