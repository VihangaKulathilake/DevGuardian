import * as React from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-[#030306]/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative glow-card-flow p-[1.5px] w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 scale-100 cyber-card-clip z-10 animate-in zoom-in-95 duration-200",
          {
            "max-w-md": size === "sm",
            "max-w-lg": size === "md",
            "max-w-2xl": size === "lg",
            "max-w-4xl": size === "xl",
          }
        )}
      >
        <div className="bg-[#07070c] flex flex-col w-full h-full relative z-10">
          {/* Cyber dot grid overlay */}
          <div className="absolute inset-0 cyber-grid-dot opacity-25 pointer-events-none" />
          {/* Corner Notch */}
          <div className="tech-corner-accent scale-75 origin-top-left" />

          {/* Header */}
          <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between gap-4 relative z-10 bg-[#090912]/50">
            {title ? (
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-orbitron flex items-center gap-2">
                {title}
              </h3>
            ) : (
              <div />
            )}
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-cyber-cyan border border-transparent hover:border-cyber-cyan/35 hover:bg-secondary/40 p-1.5 transition-all duration-200 cyber-btn-clip cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 text-xs relative z-10 text-muted-foreground leading-relaxed bg-[#050508]/40">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

