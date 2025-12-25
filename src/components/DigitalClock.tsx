import { useState, useEffect } from "react";
import { Clock, Calendar, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DigitalClockProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function DigitalClock({ isFullscreen, onToggleFullscreen }: DigitalClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      ampm,
    };
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return time.toLocaleDateString("en-US", options);
  };

  const formatted = formatTime();

  return (
    <div className={cn(
      "glass-card overflow-hidden animate-fade-up",
      isFullscreen && "h-full flex flex-col"
    )}>
      {/* Gradient Header */}
      <div className="relative px-6 py-4 bg-gradient-to-r from-primary/20 via-accent/10 to-transparent border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30 shadow-lg shadow-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Digital Clock</h2>
              <p className="text-sm text-muted-foreground">Current local time</p>
            </div>
          </div>
          {onToggleFullscreen && (
            <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="hover:bg-primary/10">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>

      <div className={cn("p-6 md:p-8", isFullscreen && "flex-1 flex flex-col justify-center")}>
        <div className="text-center">
          <div className={cn(
            "inline-flex items-center gap-2 p-8 rounded-2xl bg-secondary/30 border border-border/50 mb-6 shadow-lg",
            isFullscreen && "p-12"
          )}>
            <div className="flex items-baseline gap-1">
              <span className={cn("timer-digit", isFullscreen && "text-7xl md:text-9xl")}>{formatted.hours}</span>
              <span className={cn("text-4xl md:text-6xl font-mono text-primary animate-pulse", isFullscreen && "text-6xl md:text-8xl")}>:</span>
              <span className={cn("timer-digit", isFullscreen && "text-7xl md:text-9xl")}>{formatted.minutes}</span>
              <span className={cn("text-4xl md:text-6xl font-mono text-primary animate-pulse", isFullscreen && "text-6xl md:text-8xl")}>:</span>
              <span className={cn("timer-digit", isFullscreen && "text-7xl md:text-9xl")}>{formatted.seconds}</span>
            </div>
            <span className={cn(
              "text-xl md:text-2xl font-mono text-primary ml-3 self-start mt-2",
              isFullscreen && "text-3xl md:text-4xl"
            )}>
              {formatted.ampm}
            </span>
          </div>

          <div className={cn(
            "flex items-center justify-center gap-2 text-muted-foreground",
            isFullscreen && "text-xl"
          )}>
            <Calendar className={cn("w-4 h-4", isFullscreen && "w-6 h-6")} />
            <span className={cn("text-lg font-medium", isFullscreen && "text-2xl")}>{formatDate()}</span>
          </div>
        </div>

        <div className={cn("grid grid-cols-3 gap-4 mt-8", isFullscreen && "mt-12 gap-6")}>
          {[
            { label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replace(/_/g, " ") || "Local" },
            { label: "UTC Offset", value: `UTC${time.getTimezoneOffset() > 0 ? "-" : "+"}${Math.abs(time.getTimezoneOffset() / 60)}` },
            { label: "Week", value: `Week ${Math.ceil((time.getDate() + new Date(time.getFullYear(), time.getMonth(), 1).getDay()) / 7)}` },
          ].map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "text-center p-4 rounded-xl bg-secondary/20 border border-border/30 animate-scale-in shadow-lg",
                isFullscreen && "p-6"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn("text-lg font-semibold text-foreground", isFullscreen && "text-2xl")}>{item.value}</div>
              <div className={cn("text-xs text-muted-foreground uppercase tracking-wide mt-1", isFullscreen && "text-sm mt-2")}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
