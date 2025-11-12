import { Button } from "@/components/ui/button";
import { Home, Search, Heart, PlusSquare, User, Trophy, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "feed", icon: Home, label: "Feed" },
  { id: "search", icon: Search, label: "Search" },
  { id: "post", icon: PlusSquare, label: "Post" },
  { id: "daily", icon: Trophy, label: "Daily" },
  { id: "match", icon: Heart, label: "Match" },
  { id: "placements", icon: Briefcase, label: "Placements" },
  { id: "profile", icon: User, label: "Profile" }
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3",
                activeTab === item.id && "text-primary"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon className={cn(
                "h-6 w-6",
                activeTab === item.id && "fill-current"
              )} />
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-background border-r border-border flex-col z-40">
        <div className="p-6">
          <div className="flex items-center justify-between gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Camply</h1>
            </div>
            <ModeToggle />
          </div>
          
          <div className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-12",
                  activeTab === item.id && "bg-primary/10 text-primary"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-base">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="mt-auto p-6">
          <Button variant="hero" className="w-full">
            Join Network
          </Button>
        </div>
      </nav>
    </>
  );
}