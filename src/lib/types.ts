export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "evaluator";
  departmentId: string | null;
}

export function getSuggestion(avg: number | null): { label: string; color: string } {
  if (avg === null) return { label: "Not evaluated", color: "text-gray-400" };
  if (avg < 3) return { label: "Not fit for the role", color: "text-red-600" };
  if (avg < 4) return { label: "Needs improvement", color: "text-orange-500" };
  if (avg < 4.5) return { label: "Good fit", color: "text-blue-600" };
  return { label: "Best fit", color: "text-green-600" };
}

export function getSuggestionBg(avg: number | null): string {
  if (avg === null) return "bg-gray-100";
  if (avg < 3) return "bg-red-50";
  if (avg < 4) return "bg-orange-50";
  if (avg < 4.5) return "bg-blue-50";
  return "bg-green-50";
}
