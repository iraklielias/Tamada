import * as React from "react";
import {
  CalendarDays,
  UtensilsCrossed,
  Wine,
  BookOpen,
  Sparkles,
  Star,
  User,
  Crown,
  MoreHorizontal,
  Plus,
  Play,
  Pause,
  Square,
  Check,
  SkipForward,
  Copy,
  Heart,
  RefreshCw,
  Hand,
  Clock,
  Trash2,
  Pencil,
  Search,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Lock,
  Eye,
  EyeOff,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import HornIcon from "@/components/icons/HornIcon";
import WineGlassIcon from "@/components/icons/WineGlassIcon";
import QvevriIcon from "@/components/icons/QvevriIcon";
import GrapevineIcon from "@/components/icons/GrapevineIcon";

type IconTone = "default" | "muted" | "primary" | "success" | "danger" | "accent";
type IconVariant = "plain" | "chip";
type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

// Semantic icon names instead of raw glyph names
export type IconName =
  | "nav.dashboard"
  | "nav.feasts"
  | "nav.toasts"
  | "nav.library"
  | "nav.ai"
  | "nav.favorites"
  | "nav.profile"
  | "nav.upgrade"
  | "nav.apiTesting"
  | "nav.more"
  | "action.add"
  | "action.search"
  | "action.play"
  | "action.pause"
  | "action.stop"
  | "action.complete"
  | "action.skip"
  | "action.copy"
  | "action.regenerate"
  | "action.assign"
  | "action.delete"
  | "action.edit"
  | "action.favorite"
  | "action.share"
  | "action.next"
  | "action.back"
  | "action.visibility"
  | "action.visibilityOff"
  | "status.live"
  | "status.time"
  | "status.success"
  | "status.error"
  | "status.warning"
  | "status.info"
  | "decor.horn"
  | "decor.wineGlass"
  | "decor.qvevri"
  | "decor.grapevine";

type SystemIconProps = {
  name: IconName;
  size?: IconSize | number;
  tone?: IconTone;
  variant?: IconVariant;
  className?: string;
  "aria-label"?: string;
} & React.SVGProps<SVGSVGElement>;

const SIZE_MAP: Record<IconSize, number> = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
};

const ICON_COMPONENTS: Record<IconName, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  // Navigation
  "nav.dashboard": CalendarDays,
  "nav.feasts": UtensilsCrossed,
  "nav.toasts": Wine,
  "nav.library": BookOpen,
  "nav.ai": Sparkles,
  "nav.favorites": Star,
  "nav.profile": User,
  "nav.upgrade": Crown,
  "nav.apiTesting": Terminal,
  "nav.more": MoreHorizontal,

  // Actions
  "action.add": Plus,
  "action.search": Search,
  "action.play": Play,
  "action.pause": Pause,
  "action.stop": Square,
  "action.complete": Check,
  "action.skip": SkipForward,
  "action.copy": Copy,
  "action.regenerate": RefreshCw,
  "action.assign": Hand,
  "action.delete": Trash2,
  "action.edit": Pencil,
  "action.favorite": Heart,
  "action.share": ArrowRight,
  "action.next": ChevronRight,
  "action.back": ArrowLeft,
  "action.visibility": Eye,
  "action.visibilityOff": EyeOff,

  // Status / misc
  "status.live": Sparkles,
  "status.time": Clock,
  "status.success": CheckCircle2,
  "status.error": XCircle,
  "status.warning": AlertTriangle,
  "status.info": Info,

  // Cultural decorative icons
  "decor.horn": HornIcon,
  "decor.wineGlass": WineGlassIcon,
  "decor.qvevri": QvevriIcon,
  "decor.grapevine": GrapevineIcon,
};

const toneClassNames: Record<IconTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  danger: "text-destructive",
  accent: "text-accent-foreground",
};

const chipBgClassNames: Record<IconTone, string> = {
  default: "bg-surface-1 text-foreground",
  muted: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
  accent: "bg-accent text-accent-foreground",
};

export const SystemIcon: React.FC<SystemIconProps> = ({
  name,
  size = "md",
  tone = "default",
  variant = "plain",
  className,
  "aria-label": ariaLabel,
  ...rest
}) => {
  const Glyph = ICON_COMPONENTS[name];
  if (!Glyph) return null;

  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size];
  const baseToneClass = toneClassNames[tone] ?? toneClassNames.default;

  // Pass both size and width/height so Lucide and custom icons (HornIcon etc.) both get dimensions
  const icon = (
    <span
      className="inline-flex items-center justify-center shrink-0"
      style={{ width: pixelSize, height: pixelSize }}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? "img" : "presentation"}
      aria-label={ariaLabel}
    >
      <Glyph
        width={pixelSize}
        height={pixelSize}
        className={cn(baseToneClass, className)}
        {...rest}
      />
    </span>
  );

  if (variant === "chip") {
    const chipClasses = chipBgClassNames[tone] ?? chipBgClassNames.default;
    const chipSize = pixelSize + 10;
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          chipClasses
        )}
        style={{ width: chipSize, height: chipSize }}
        aria-label={ariaLabel}
      >
        {icon}
      </span>
    );
  }

  return icon;
};

export default SystemIcon;

