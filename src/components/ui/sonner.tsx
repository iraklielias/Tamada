import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import { AlertTriangle, X, Info } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      duration={4000}
      gap={8}
      icons={{
        success: <WineGlassIcon size={18} className="text-wine-deep" />,
        error: <AlertTriangle className="h-[18px] w-[18px] text-destructive" />,
        info: <Info className="h-[18px] w-[18px] text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border-l-[3px] group-[.toaster]:shadow-elevated group-[.toaster]:px-4 group-[.toaster]:py-3.5 group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:font-georgian",
          title:
            "group-[.toast]:font-semibold group-[.toast]:text-[13px] group-[.toast]:tracking-tight",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-[12px] group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground group-[.toast]:transition-colors",
          success:
            "group-[.toaster]:border-l-wine-deep group-[.toaster]:bg-wine-light/30 dark:group-[.toaster]:bg-wine-deep/10",
          error:
            "group-[.toaster]:border-l-destructive group-[.toaster]:bg-destructive/5",
          info:
            "group-[.toaster]:border-l-primary",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
