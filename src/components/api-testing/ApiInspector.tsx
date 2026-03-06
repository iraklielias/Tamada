import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Trash2, ChevronDown, Copy } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { JsonViewer } from "./JsonViewer";
import type { ApiInspectorEntry } from "@/types/external-api";

interface ApiInspectorProps {
  entries: ApiInspectorEntry[];
  onClear: () => void;
}

export function ApiInspector({ entries, onClear }: ApiInspectorProps) {
  return (
    <Card className="h-full">
      <CardHeader className="py-3 px-4 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">API Inspector</CardTitle>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onClear}>
          <Trash2 className="h-3 w-3 mr-1" /> Clear
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <ScrollArea className="h-[550px]">
          <div className="space-y-1 px-3 pb-3">
            {entries.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No requests yet. Send a message to see logs.
              </p>
            )}
            {entries.map((entry) => (
              <InspectorEntry key={entry.id} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function InspectorEntry({ entry }: { entry: ApiInspectorEntry }) {
  const [open, setOpen] = useState(false);
  const statusColor =
    entry.status >= 200 && entry.status < 300
      ? "bg-green-500/10 text-green-600"
      : entry.status >= 400
      ? "bg-red-500/10 text-red-600"
      : "bg-yellow-500/10 text-yellow-600";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 text-xs">
          <Badge className={`${statusColor} font-mono text-[10px]`}>{entry.status}</Badge>
          <span className="font-medium text-foreground">{entry.action}</span>
          <span className="text-muted-foreground ml-auto">{entry.duration}ms</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-4 pr-2 pb-2 space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">Request</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 text-[10px]"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(entry.request, null, 2));
                  sonnerToast.success("Copied!");
                }}
              >
                <Copy className="h-2.5 w-2.5" />
              </Button>
            </div>
            <JsonViewer data={entry.request} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase">Response</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 text-[10px]"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(entry.response, null, 2));
                  sonnerToast.success("Copied!");
                }}
              >
                <Copy className="h-2.5 w-2.5" />
              </Button>
            </div>
            <JsonViewer data={entry.response} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
