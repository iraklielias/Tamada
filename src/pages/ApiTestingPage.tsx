import React, { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { ChatSimulator } from "@/components/api-testing/ChatSimulator";
import { FullVoiceMode } from "@/components/api-testing/FullVoiceMode";
import { ApiInspector } from "@/components/api-testing/ApiInspector";
import { ApiKeyManager } from "@/components/api-testing/ApiKeyManager";
import { EndpointTester } from "@/components/api-testing/EndpointTester";
import { UsageAnalytics } from "@/components/api-testing/UsageAnalytics";
import { VoiceSettings } from "@/components/api-testing/VoiceSettings";
import { useTamadaExternalApi } from "@/hooks/useTamadaExternalApi";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Code2 } from "lucide-react";
import type { ExternalChatMessage } from "@/types/external-api";

export default function ApiTestingPage() {
  const api = useTamadaExternalApi();
  const [voiceModeOpen, setVoiceModeOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [language, setLanguage] = useState<"ka" | "en">("ka");

  // Ref to push voice messages into chat
  const addVoiceMessagesRef = useRef<(userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => void>(null);

  const handleVoiceMessage = useCallback(
    (userMsg: ExternalChatMessage | null, assistantMsg: ExternalChatMessage) => {
      addVoiceMessagesRef.current?.(userMsg, assistantMsg);
    },
    []
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Developer inspector toggle — above input bar on mobile */}
      <div className="fixed bottom-20 right-3 z-40 md:bottom-4 md:right-4">
        <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 md:h-10 md:w-10 rounded-full shadow-lg bg-card"
              title="Developer Tools"
            >
              <Code2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(90vw,540px)] p-0">
            <div className="h-full overflow-y-auto">
              <Tabs defaultValue="inspector" className="w-full">
                <div className="sticky top-0 z-10 bg-background border-b border-border px-4 pt-4 pb-0">
                  <TabsList className="w-full">
                    <TabsTrigger value="inspector" className="flex-1 text-xs">Inspector</TabsTrigger>
                    <TabsTrigger value="endpoints" className="flex-1 text-xs">Endpoints</TabsTrigger>
                    <TabsTrigger value="keys" className="flex-1 text-xs">API Keys</TabsTrigger>
                    <TabsTrigger value="usage" className="flex-1 text-xs">Usage</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="inspector" className="mt-0">
                  <ApiInspector entries={api.inspectorLog} onClear={api.clearInspector} />
                </TabsContent>
                <TabsContent value="endpoints" className="mt-0 p-4">
                  <EndpointTester api={api} />
                </TabsContent>
                <TabsContent value="keys" className="mt-0 p-4">
                  <ApiKeyManager />
                </TabsContent>
                <TabsContent value="usage" className="mt-0 p-4">
                  <UsageAnalytics api={api} />
                  <div className="mt-4">
                    <VoiceSettings />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main chat — full height on mobile */}
      <div className="flex-1 max-w-2xl mx-auto w-full p-0 md:p-4 min-h-0">
        <ChatSimulator
          api={api}
          onOpenVoiceMode={() => setVoiceModeOpen(true)}
          language={language}
          onLanguageChange={setLanguage}
          addVoiceMessagesRef={addVoiceMessagesRef}
        />
      </div>

      {/* Full voice mode overlay */}
      <AnimatePresence>
        {voiceModeOpen && (
          <FullVoiceMode
            api={api}
            userId="test_user_001"
            language={language}
            onClose={() => setVoiceModeOpen(false)}
            onMessage={handleVoiceMessage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
