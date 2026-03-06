import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatSimulator } from "@/components/api-testing/ChatSimulator";
import { EndpointTester } from "@/components/api-testing/EndpointTester";
import { ApiKeyManager } from "@/components/api-testing/ApiKeyManager";
import { UsageAnalytics } from "@/components/api-testing/UsageAnalytics";
import { VoiceSettings } from "@/components/api-testing/VoiceSettings";
import { useTamadaExternalApi } from "@/hooks/useTamadaExternalApi";

export default function ApiTestingPage() {
  const { t } = useTranslation();
  const api = useTamadaExternalApi();

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
          {t("apiTesting.title")}
        </h1>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="chat">{t("apiTesting.tabs.chat")}</TabsTrigger>
          <TabsTrigger value="endpoints">{t("apiTesting.tabs.endpoints")}</TabsTrigger>
          <TabsTrigger value="keys">{t("apiTesting.tabs.keys")}</TabsTrigger>
          <TabsTrigger value="usage">{t("apiTesting.tabs.usage")}</TabsTrigger>
          <TabsTrigger value="voice">{t("apiTesting.tabs.voice")}</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <ChatSimulator api={api} />
        </TabsContent>
        <TabsContent value="endpoints">
          <EndpointTester api={api} />
        </TabsContent>
        <TabsContent value="keys">
          <ApiKeyManager />
        </TabsContent>
        <TabsContent value="usage">
          <UsageAnalytics api={api} />
        </TabsContent>
        <TabsContent value="voice">
          <VoiceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
