import React from "react";

interface JsonViewerProps {
  data: unknown;
}

export function JsonViewer({ data }: JsonViewerProps) {
  return (
    <pre className="bg-muted rounded-md p-2 text-[10px] font-mono overflow-x-auto max-h-[200px] overflow-y-auto text-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
