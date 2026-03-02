import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Wine } from "lucide-react";
import EmptyState from "@/components/EmptyState";

const LibraryPage = () => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["toast-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("toast_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const occasionLabel: Record<string, string> = {
    wedding: "ქორწილი", birthday: "დაბადების დღე", supra: "სუფრა",
    memorial: "პანაშვიდი", holiday: "დღესასწაული", business: "საქმიანი",
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-heading-1 text-foreground">ბიბლიოთეკა</h1>
        <p className="text-body-sm text-muted-foreground mt-1">
          სუფრის თარგები და სადღეგრძელოების თანმიმდევრობები
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-5 h-32" /></Card>
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((tpl) => {
            const seq = Array.isArray(tpl.toast_sequence) ? tpl.toast_sequence : [];
            return (
              <Card key={tpl.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-foreground">{tpl.name_ka}</h3>
                      {tpl.name_en && (
                        <p className="text-xs text-muted-foreground">{tpl.name_en}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">
                          {occasionLabel[tpl.occasion_type] || tpl.occasion_type}
                        </Badge>
                        {tpl.formality_level && (
                          <Badge variant="secondary" className="text-[10px]">
                            {tpl.formality_level}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Wine className="h-3 w-3" />
                          {seq.length} სადღეგრძელო
                        </span>
                        {tpl.estimated_duration_minutes && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tpl.estimated_duration_minutes} წთ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title="თარგები მალე დაემატება"
          description="სუფრის მზა თარგები სხვადასხვა ტიპის წვეულებისთვის"
        />
      )}
    </div>
  );
};

export default LibraryPage;
