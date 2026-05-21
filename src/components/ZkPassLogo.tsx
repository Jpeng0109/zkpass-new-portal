import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizes = {
  sm: { img: "w-7 h-7", text: "text-base" },
  md: { img: "w-9 h-9", text: "text-xl" },
  lg: { img: "w-12 h-12", text: "text-2xl" },
};

export function ZkPassLogo({ size = "md", showText = true, className }: Props) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/zkpass-logo.png"
        alt="zkPass"
        className={cn(s.img, "rounded-md object-contain shrink-0")}
      />
      {showText && (
        <span className={cn(s.text, "text-neon font-bold tracking-wide")}>zkPass Portal</span>
      )}
    </div>
  );
}
