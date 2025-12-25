import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export function DigitalClock() {
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
    <div className="glass-card-glow p-6 md:p-8 animate-fade-up">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Clock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Digital Clock</h2>
          <p className="text-sm text-muted-foreground">Current local time</p>
        </div>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center gap-2 p-8 rounded-2xl bg-secondary/30 border border-border/50 mb-6">
          <div className="flex items-baseline gap-1">
            <span className="timer-digit">{formatted.hours}</span>
            <span className="text-4xl md:text-6xl font-mono text-primary animate-pulse">:</span>
            <span className="timer-digit">{formatted.minutes}</span>
            <span className="text-4xl md:text-6xl font-mono text-primary animate-pulse">:</span>
            <span className="timer-digit">{formatted.seconds}</span>
          </div>
          <span className="text-xl md:text-2xl font-mono text-primary ml-3 self-start mt-2">
            {formatted.ampm}
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-lg font-medium">{formatDate()}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8">
        {[
          { label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replace(/_/g, " ") || "Local" },
          { label: "UTC Offset", value: `UTC${time.getTimezoneOffset() > 0 ? "-" : "+"}${Math.abs(time.getTimezoneOffset() / 60)}` },
          { label: "Week", value: `Week ${Math.ceil((time.getDate() + new Date(time.getFullYear(), time.getMonth(), 1).getDay()) / 7)}` },
        ].map((item, index) => (
          <div
            key={item.label}
            className="text-center p-4 rounded-xl bg-secondary/20 border border-border/30 animate-scale-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-lg font-semibold text-foreground">{item.value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
