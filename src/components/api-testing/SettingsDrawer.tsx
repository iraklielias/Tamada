import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  userId: string;
  onUserIdChange: (id: string) => void;
  onClearHistory: () => void;
  onLoadHistory: () => void;
  language: "ka" | "en";
}

export function SettingsDrawer({
  open,
  onOpenChange,
  apiKey,
  onApiKeyChange,
  userId,
  onUserIdChange,
  onClearHistory,
  onLoadHistory,
  language,
}: SettingsDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>{language === "ka" ? "პარამეტრები" : "Settings"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label className="text-xs font-medium">API Key</Label>
            <Input
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="tam_..."
              type="password"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">User ID</Label>
            <Input
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              placeholder="test_user_001"
              className="text-xs"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={onLoadHistory}>
              {language === "ka" ? "ისტორიის ჩატვირთვა" : "Load History"}
            </Button>
            <Button size="sm" variant="destructive" className="text-xs gap-1" onClick={onClearHistory}>
              <Trash2 className="h-3 w-3" />
              {language === "ka" ? "წაშლა" : "Clear"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
