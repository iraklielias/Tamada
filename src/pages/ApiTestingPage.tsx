import React, { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { ChatSimulator } from "@/components/api-testing/ChatSimulator";
import { FullVoiceMode } from "@/components/api-testing/FullVoiceMode";
import { ApiInspector } from "@/components/api-testing/ApiInspector";
import { useTamadaExternalApi } from "@/hooks/useTamadaExternalApi";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";
import type { ExternalChatMessage } from "@/types/external-api";

export default function ApiTestingPage() {
  const api = useTamadaExternalApi();
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const chatRef = useRef<{ addVoiceMessages: (u: ExternalChatMessage | null, a: ExternalChatMessage) => void } | null>(null);

  const handleVoiceMessage = useCallback(
    (userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => {
      // Messages will be added when voice mode closes and chat remounts with history
    },
    []
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Developer inspector toggle */}
      <div className="fixed bottom-4 right-4 z-40">
        <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full shadow-lg bg-card"
              title="API Inspector"
            >
              <Code2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[450px] sm:w-[500px] p-0">
            <div className="h-full overflow-y-auto">
              <ApiInspector entries={api.inspectorLog} onClear={api.clearInspector} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main chat */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-2 md:p-4">
        <ChatSimulator
          api={api}
          onOpenVoiceMode={() => setVoiceModeOpen(true)}
        />
      </div>

      {/* Full voice mode overlay */}
      <AnimatePresence>
        {voiceModeOpen && (
          <FullVoiceMode
            api={api}
            userId="test_user_001"
            language="ka"
            onClose={() => setVoiceModeOpen(false)}
            onMessage={handleVoiceMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
