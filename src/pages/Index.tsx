import { useState } from "react";
import { TabNavigation } from "@/components/TabNavigation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { TodoList } from "@/components/TodoList";
import { Stopwatch } from "@/components/Stopwatch";
import { DigitalClock } from "@/components/DigitalClock";
import { Sparkles } from "lucide-react";

type TabType = "countdown" | "todo" | "stopwatch" | "clock";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("countdown");

  const renderContent = () => {
    switch (activeTab) {
      case "countdown":
        return <CountdownTimer />;
      case "todo":
        return <TodoList />;
      case "stopwatch":
        return <Stopwatch />;
      case "clock":
        return <DigitalClock />;
      default:
        return <CountdownTimer />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-3xl mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Productivity Suite
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Time & Task Manager
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Stay organized and productive with our all-in-one toolkit for managing time and tasks.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Content */}
        <main key={activeTab}>{renderContent()}</main>

        {/* Footer */}
        <footer className="text-center mt-12 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: "200ms" }}>
          <p>Built with precision • Data stored locally</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
