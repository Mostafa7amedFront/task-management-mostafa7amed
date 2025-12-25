import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Calendar, Bell, Maximize2, Minimize2, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function CountdownTimer({ isFullscreen, onToggleFullscreen }: CountdownTimerProps) {
  const [targetDate, setTargetDate] = useState<string>(() => {
    const saved = localStorage.getItem("countdown-target");
    return saved || "";
  });
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasFinished, setHasFinished] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const calculateTimeLeft = useCallback((): TimeLeft => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const difference = new Date(targetDate).getTime() - Date.now();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }, [targetDate]);

  useEffect(() => {
    if (!isRunning || !targetDate) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0 &&
        !hasFinished
      ) {
        setIsRunning(false);
        setHasFinished(true);
        setShowCompletionDialog(true);
        toast.success("Countdown Complete!", {
          description: "Your countdown has finished!",
          icon: <Bell className="w-4 h-4" />,
          duration: 5000,
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, targetDate, calculateTimeLeft, hasFinished]);

  useEffect(() => {
    if (targetDate) {
      localStorage.setItem("countdown-target", targetDate);
      setTimeLeft(calculateTimeLeft());
      setHasFinished(false);
    }
  }, [targetDate, calculateTimeLeft]);

  const handleStart = () => {
    if (!targetDate) {
      toast.error("Please set a target date first");
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setTargetDate("");
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    setHasFinished(false);
    localStorage.removeItem("countdown-target");
  };

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <>
      <div className={cn(
        "glass-card overflow-hidden animate-fade-up",
        isFullscreen && "h-full flex flex-col"
      )}>
        {/* Gradient Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/30 shadow-lg shadow-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Countdown Timer</h2>
                <p className="text-sm text-muted-foreground">Set a target date and watch it count down</p>
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
          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Target Date & Time
            </label>
            <input
              type="datetime-local"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-input border border-border text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className={cn(
            "grid grid-cols-4 gap-3 md:gap-6 mb-8",
            isFullscreen && "gap-6 md:gap-10"
          )}>
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((item, index) => (
              <div
                key={item.label}
                className="text-center p-4 md:p-6 rounded-xl bg-secondary/50 border border-border/50 animate-scale-in shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "timer-digit text-3xl md:text-5xl",
                  isFullscreen && "text-5xl md:text-8xl"
                )}>
                  {formatNumber(item.value)}
                </div>
                <div className={cn(
                  "timer-label mt-2",
                  isFullscreen && "text-sm mt-3"
                )}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
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
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent className="glass-card border-border text-center">
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center animate-pulse-glow">
              <PartyPopper className="w-8 h-8 text-success" />
            </div>
            <DialogTitle className="text-2xl">Time's Up!</DialogTitle>
            <DialogDescription className="text-base">
              Your countdown has finished. Great job staying on track!
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowCompletionDialog(false)} className="mt-4">
            Awesome!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
