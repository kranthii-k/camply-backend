import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrustBadge } from "@/components/TrustBadge";
import { Search as SearchIcon, Filter, TrendingUp, Users, Briefcase, Code } from "lucide-react";
import { useState } from "react";

const trendingTopics = [
  { tag: "React", posts: 1234, icon: Code },
  { tag: "System Design", posts: 856, icon: TrendingUp },
  { tag: "FAANG Jobs", posts: 672, icon: Briefcase },
  { tag: "Hackathons", posts: 445, icon: Users },
  { tag: "AI/ML", posts: 987, icon: Code },
  { tag: "Web Development", posts: 756, icon: TrendingUp },
  { tag: "Startup Ideas", posts: 543, icon: Briefcase },
  { tag: "Study Groups", posts: 321, icon: Users }
];

const suggestedUsers = [
  { username: "@tech_guru_99", trustLevel: "platinum" as const, speciality: "System Architecture" },
  { username: "@ml_researcher", trustLevel: "gold" as const, speciality: "Machine Learning" },
  { username: "@startup_founder", trustLevel: "gold" as const, speciality: "Entrepreneurship" },
  { username: "@security_expert", trustLevel: "silver" as const, speciality: "Cybersecurity" },
  { username: "@data_scientist", trustLevel: "gold" as const, speciality: "Data Analytics" },
  { username: "@mobile_dev_pro", trustLevel: "silver" as const, speciality: "Mobile Development" },
  { username: "@blockchain_guru", trustLevel: "platinum" as const, speciality: "Web3 Development" },
  { username: "@product_manager", trustLevel: "gold" as const, speciality: "Product Strategy" },
  { username: "@design_master", trustLevel: "silver" as const, speciality: "UI/UX Design" },
  { username: "@devops_ninja", trustLevel: "bronze" as const, speciality: "Cloud Infrastructure" }
];

export function Search() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none">
        <h1 className="text-xl font-bold text-foreground mb-4 md:hidden">Explore</h1>
        
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts, users, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12"
          />
          <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="px-4 space-y-6 pb-20 md:pb-4">
        {/* Trending Topics */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Trending Topics</h2>
          <div className="grid grid-cols-2 gap-4">
            {trendingTopics.map((topic) => (
              <Card key={topic.tag} className="p-4 hover:shadow-medium transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3">
                  <topic.icon className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">#{topic.tag}</h3>
                    <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Programming
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Career Advice
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Interview Prep
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Open Source
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Startups
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Research
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Web Development
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Data Science
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Mobile Apps
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              DevOps
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Design
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              Freelancing
            </Badge>
          </div>
        </div>

        {/* Suggested Users */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Suggested Experts</h2>
          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <Card key={user.username} className="p-4 hover:shadow-medium transition-all duration-300 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.username.charAt(1).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{user.username}</span>
                        <TrustBadge level={user.trustLevel} />
                      </div>
                      <p className="text-sm text-muted-foreground">{user.speciality}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}