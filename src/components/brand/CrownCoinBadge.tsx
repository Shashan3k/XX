import { cn } from "@/lib/utils";
import { PanasunaLogo } from "./PanasunaLogo";

const FACE =
  "absolute inset-0 grid place-items-center rounded-full bg-[radial-gradient(circle_at_34%_28%,#f6dc8a,var(--color-gold)_46%,var(--color-gold-deep)_100%)] shadow-[inset_0_0_0_1.5px_rgb(138_106_18/0.9)] [backface-visibility:hidden]";

/**
 * The crown sovereign as a CSS 3D badge: two struck faces and a milled edge, turning slowly on its
 * axis. No WebGL, so it can sit on every plan card. Reduced motion stops it face-on.
 */
export function CrownCoinBadge({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative inline-block shrink-0 [perspective:420px]", className)}>
      <span className="absolute inset-0 [transform-style:preserve-3d] [animation:pn-coin-spin_10s_linear_infinite]">
        {/* Edge: stacked discs give the coin its thickness as it turns. */}
        {[-1.5, -0.5, 0.5, 1.5].map((z) => (
          <span key={z} className="absolute inset-0 rounded-full bg-gold-deep" style={{ transform: `translateZ(${z}px)` }} />
        ))}
        <span className={FACE} style={{ transform: "translateZ(2px)" }}>
          <PanasunaLogo variant="seal" className="size-[88%] text-obsidian/75" />
        </span>
        <span className={FACE} style={{ transform: "rotateY(180deg) translateZ(2px)" }}>
          <PanasunaLogo variant="seal" className="size-[88%] text-obsidian/75" />
        </span>
      </span>
    </span>
  );
}
