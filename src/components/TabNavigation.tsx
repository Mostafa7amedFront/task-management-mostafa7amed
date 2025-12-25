import { Timer, ListTodo, Clock, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "countdown" | "todo" | "stopwatch" | "clock";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "countdown" as const, label: "Countdown", icon: Timer },
  { id: "todo" as const, label: "To-Do", icon: ListTodo },
  { id: "stopwatch" as const, label: "Stopwatch", icon: Gauge },
  { id: "clock" as const, label: "Clock", icon: Clock },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <nav className="glass-card p-1.5 inline-flex gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300",
              isActive
                ? "tab-active"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
