import { useState } from "react";
import { TabNavigation } from "@/components/TabNavigation";
import { CountdownTimer } from "@/components/CountdownTimer";
import { TodoList } from "@/components/TodoList";
import { Stopwatch } from "@/components/Stopwatch";
import { DigitalClock } from "@/components/DigitalClock";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabType = "countdown" | "todo" | "stopwatch" | "clock";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>("countdown");
  const [fullscreenTab, setFullscreenTab] = useState<TabType | null>(null);

  const toggleFullscreen = (tab: TabType) => {
    setFullscreenTab(fullscreenTab === tab ? null : tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "countdown":
        return (
          <CountdownTimer
            isFullscreen={fullscreenTab === "countdown"}
            onToggleFullscreen={() => toggleFullscreen("countdown")}
          />
        );
      case "todo":
        return <TodoList />;
      case "stopwatch":
        return (
          <Stopwatch
            isFullscreen={fullscreenTab === "stopwatch"}
            onToggleFullscreen={() => toggleFullscreen("stopwatch")}
          />
        );
      case "clock":
        return (
          <DigitalClock
            isFullscreen={fullscreenTab === "clock"}
            onToggleFullscreen={() => toggleFullscreen("clock")}
          />
        );
      default:
        return <CountdownTimer />;
    }
  };

  // Fullscreen overlay
  if (fullscreenTab) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFullscreenTab(null)}
            className="bg-background/80 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="h-full p-4 md:p-8">
          {fullscreenTab === "countdown" && (
            <CountdownTimer isFullscreen onToggleFullscreen={() => setFullscreenTab(null)} />
          )}
          {fullscreenTab === "stopwatch" && (
            <Stopwatch isFullscreen onToggleFullscreen={() => setFullscreenTab(null)} />
          )}
          {fullscreenTab === "clock" && (
            <DigitalClock isFullscreen onToggleFullscreen={() => setFullscreenTab(null)} />
          )}
        </div>
      </div>
    );
  }

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
