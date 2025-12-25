import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Flag, Gauge, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Lap {
  id: number;
  time: number;
  diff: number;
}

interface StopwatchProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function Stopwatch({ isFullscreen, onToggleFullscreen }: StopwatchProps) {
  const [time, setTime] = useState(() => {
    const saved = localStorage.getItem("stopwatch-time");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>(() => {
    const saved = localStorage.getItem("stopwatch-laps");
    return saved ? JSON.parse(saved) : [];
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem("stopwatch-time", time.toString());
  }, [time]);

  useEffect(() => {
    localStorage.setItem("stopwatch-laps", JSON.stringify(laps));
  }, [laps]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    localStorage.removeItem("stopwatch-time");
    localStorage.removeItem("stopwatch-laps");
  };

  const handleLap = () => {
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    const newLap: Lap = {
      id: Date.now(),
      time,
      diff: time - lastLapTime,
    };
    setLaps((prev) => [newLap, ...prev]);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return {
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      centiseconds: centiseconds.toString().padStart(2, "0"),
    };
  };

  const formatted = formatTime(time);

  return (
    <div className={cn(
      "glass-card overflow-hidden animate-fade-up",
      isFullscreen && "h-full flex flex-col"
    )}>
      {/* Gradient Header */}
      <div className="relative px-6 py-4 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/20 border border-accent/30 shadow-lg shadow-accent/10">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Stopwatch</h2>
              <p className="text-sm text-muted-foreground">Track your time with precision</p>
            </div>
          </div>
          {onToggleFullscreen && (
            <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="hover:bg-accent/10">
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </div>

      <div className={cn("p-6 md:p-8", isFullscreen && "flex-1 flex flex-col justify-center")}>
        <div className="text-center mb-8">
          <div className={cn(
            "inline-flex items-baseline gap-1 p-6 rounded-2xl bg-secondary/30 border border-border/50 shadow-lg",
            isFullscreen && "p-10"
          )}>
            <span className={cn("timer-digit", isFullscreen && "text-7xl md:text-9xl")}>{formatted.minutes}</span>
            <span className={cn("text-3xl md:text-5xl font-mono text-primary/50", isFullscreen && "text-5xl md:text-7xl")}>:</span>
            <span className={cn("timer-digit", isFullscreen && "text-7xl md:text-9xl")}>{formatted.seconds}</span>
            <span className={cn("text-3xl md:text-5xl font-mono text-primary/50", isFullscreen && "text-5xl md:text-7xl")}>.</span>
            <span className={cn("timer-digit text-3xl md:text-4xl opacity-70", isFullscreen && "text-5xl md:text-6xl")}>{formatted.centiseconds}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {!isRunning ? (
            <Button onClick={handleStart} variant="glow" size="lg">
              <Play className="w-5 h-5" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} variant="warning" size="lg">
              <Pause className="w-5 h-5" />
              Pause
            </Button>
          )}
          <Button onClick={handleLap} variant="secondary" size="lg" disabled={!isRunning && time === 0}>
            <Flag className="w-5 h-5" />
            Lap
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        </div>

        {laps.length > 0 && (
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Laps ({laps.length})
            </h3>
            <div className={cn(
              "space-y-2 max-h-[200px] overflow-y-auto pr-2",
              isFullscreen && "max-h-[300px]"
            )}>
              {laps.map((lap, index) => {
                const lapFormatted = formatTime(lap.time);
                const diffFormatted = formatTime(lap.diff);
                const lapNumber = laps.length - index;

                return (
                  <div
                    key={lap.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30 animate-slide-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <span className="text-sm font-medium text-muted-foreground">
                      Lap {lapNumber}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground font-mono">
                        +{diffFormatted.minutes}:{diffFormatted.seconds}.{diffFormatted.centiseconds}
                      </span>
                      <span className="font-mono text-foreground">
                        {lapFormatted.minutes}:{lapFormatted.seconds}.{lapFormatted.centiseconds}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
