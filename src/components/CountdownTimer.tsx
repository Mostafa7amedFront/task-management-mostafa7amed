import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [targetDate, setTargetDate] = useState<string>(() => {
    const saved = localStorage.getItem("countdown-target");
    return saved || "";
  });
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [hasFinished, setHasFinished] = useState(false);

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
    <div className="glass-card-glow p-6 md:p-8 animate-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Countdown Timer</h2>
          <p className="text-sm text-muted-foreground">Set a target date and watch it count down</p>
        </div>
      </div>

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

      <div className="grid grid-cols-4 gap-3 md:gap-6 mb-8">
        {[
          { value: timeLeft.days, label: "Days" },
          { value: timeLeft.hours, label: "Hours" },
          { value: timeLeft.minutes, label: "Minutes" },
          { value: timeLeft.seconds, label: "Seconds" },
        ].map((item, index) => (
          <div
            key={item.label}
            className="text-center p-4 md:p-6 rounded-xl bg-secondary/50 border border-border/50 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="timer-digit text-3xl md:text-5xl">{formatNumber(item.value)}</div>
            <div className="timer-label mt-2">{item.label}</div>
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
  );
}
