"use client";

interface Props {
  type: "straight" | "branch";
  labels?: { yes: string; no: string };
}

export function FlowConnector({ type, labels }: Props) {
  if (type === "branch") {
    return (
      <div className="flex w-72 items-center justify-center py-1">
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-green-600">{labels?.yes || "Yes"}</span>
            <div className="h-4 w-px bg-green-400" />
          </div>
          <div className="h-px w-8 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-red-500">{labels?.no || "No"}</span>
            <div className="h-4 w-px bg-red-400" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-6 items-center justify-center">
      <div className="h-full w-px bg-border" />
    </div>
  );
}
