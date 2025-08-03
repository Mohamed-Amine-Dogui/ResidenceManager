import { ClipLoader, PulseLoader } from "react-spinners";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: number;
  color?: string;
  className?: string;
  message?: string;
  centerInParent?: boolean;
}

const override = {
  display: "block",
  margin: "0 auto",
};

export function Loading({ 
  size = 50, 
  color = "#4338ca", 
  className,
  message = "Chargement...",
  centerInParent = false
}: LoadingProps) {
  const containerClasses = cn(
    "flex flex-col items-center justify-center space-y-4 py-8",
    centerInParent && "min-h-[200px]",
    className
  );

  return (
    <div className={containerClasses}>
      <ClipLoader
        color={color}
        loading={true}
        cssOverride={override}
        size={size}
        speedMultiplier={0.8}
      />
      {message && (
        <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">
          {message}
        </span>
      )}
    </div>
  );
}

// Small inline loading spinner for buttons
export function LoadingInline({ 
  size = 20, 
  color = "#ffffff", 
  className = "mr-2" 
}: Omit<LoadingProps, 'message' | 'centerInParent'>) {
  return (
    <PulseLoader 
      size={size/4} 
      color={color} 
      className={className}
      speedMultiplier={1.2}
    />
  );
}

// Loading overlay for full page
export function LoadingOverlay({ 
  message = "Chargement...",
}: Pick<LoadingProps, 'message'>) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loading size={80} message={message} />
    </div>
  );
}