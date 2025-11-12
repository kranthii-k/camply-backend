import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Briefcase, Building, Users, Clock, ChevronRight, Star, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PlacementData {
  id: string;
  company: string;
  logo: string;
  role: string;
  package: string;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "Interview" | "Online Test" | "Group Discussion";
  author: string;
  college: string;
  timeAgo: string;
  upvotes: number;
  comments: number;
  tags: string[];
  preview: string;
}

const placementPosts: PlacementData[] = [
  {
    id: "1",
    company: "Google",
    logo: "🔍",
    role: "Software Engineer Intern",
    package: "₹2.4 LPA",
    location: "Bangalore",
    difficulty: "Hard",
    type: "Interview",
    author: "@coder_alex",
    college: "IIT Delhi",
    timeAgo: "2h",
    upvotes: 156,
    comments: 23,
    tags: ["DSA", "System Design", "Behavioral"],
    preview: "3 rounds - Online test, Technical interviews covering trees, graphs, and system design for a URL shortener..."
  },
  {
    id: "2",
    company: "Microsoft",
    logo: "🏢",
    role: "Product Manager Intern",
    package: "₹1.8 LPA",
    location: "Hyderabad",
    difficulty: "Medium",
    type: "Group Discussion",
    author: "@product_sarah",
    college: "BITS Pilani",
    timeAgo: "4h",
    upvotes: 89,
    comments: 15,
    tags: ["Product Strategy", "Analytics", "Communication"],
    preview: "Case study on improving Microsoft Teams user engagement. Focus on data-driven decisions and user research..."
  },
  {
    id: "3",
    company: "Amazon",
    logo: "📦",
    role: "SDE I",
    package: "₹28 LPA",
    location: "Chennai",
    difficulty: "Hard",
    type: "Online Test",
    author: "@algo_master",
    college: "IIT Madras",
    timeAgo: "6h",
    upvotes: 234,
    comments: 45,
    tags: ["Algorithms", "OOP", "AWS"],
    preview: "4-hour coding challenge with dynamic programming, graph algorithms, and AWS service integration questions..."
  },
  {
    id: "4",
    company: "Flipkart",
    logo: "🛍️",
    role: "UI/UX Designer",
    package: "₹12 LPA",
    location: "Bangalore",
    difficulty: "Medium",
    type: "Interview",
    author: "@design_guru",
    college: "NID Ahmedabad",
    timeAgo: "8h",
    upvotes: 67,
    comments: 12,
    tags: ["Figma", "User Research", "Prototyping"],
    preview: "Portfolio review, design challenge to improve Flipkart's checkout flow, and discussion on design thinking..."
  },
  {
    id: "5",
    company: "Zomato",
    logo: "🍽️",
    role: "Data Analyst",
    package: "₹8 LPA",
    location: "Delhi",
    difficulty: "Easy",
    type: "Online Test",
    author: "@data_wizard",
    college: "Delhi University",
    timeAgo: "12h",
    upvotes: 45,
    comments: 8,
    tags: ["SQL", "Python", "Tableau"],
    preview: "SQL queries for restaurant data analysis, Python scripting for data cleaning, and dashboard creation..."
  },
  {
    id: "6",
    company: "Paytm",
    logo: "💳",
    role: "Frontend Developer",
    package: "₹15 LPA",
    location: "Noida",
    difficulty: "Medium",
    type: "Interview",
    author: "@react_dev",
    college: "IIIT Hyderabad",
    timeAgo: "1d",
    upvotes: 78,
    comments: 18,
    tags: ["React", "JavaScript", "CSS"],
    preview: "Live coding session building a payment component, optimizing React performance, and CSS animations..."
  }
];

export function Placements() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");
  const [upvotedPosts, setUpvotedPosts] = useState<Set<string>>(new Set());

  const filteredPosts = placementPosts.filter(post => {
    if (filter === "all") return true;
    if (filter === "interview") return post.type === "Interview";
    if (filter === "test") return post.type === "Online Test";
    if (filter === "gd") return post.type === "Group Discussion";
    return true;
  });

  const handleUpvote = (postId: string) => {
    const newUpvoted = new Set(upvotedPosts);
    if (upvotedPosts.has(postId)) {
      newUpvoted.delete(postId);
      toast({
        title: "Upvote Removed",
        description: "Your upvote has been removed.",
      });
    } else {
      newUpvoted.add(postId);
      toast({
        title: "Upvoted! 👍",
        description: "Thanks for supporting the community!",
      });
    }
    setUpvotedPosts(newUpvoted);
  };

  const handleComment = (company: string) => {
    toast({
      title: "Opening Comments",
      description: `Viewing discussion for ${company} placement...`,
    });
  };

  const handleShare = (company: string) => {
    toast({
      title: "Shared! 📤",
      description: `${company} placement experience shared successfully.`,
    });
  };

  const handleViewDetails = (company: string) => {
    toast({
      title: "Opening Details",
      description: `Loading detailed ${company} placement information...`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Interview": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Online Test": return "bg-purple-100 text-purple-800 border-purple-200";
      case "Group Discussion": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none">
        <h1 className="text-xl font-bold text-foreground md:hidden">Placements</h1>
      </div>

      <div className="px-4 space-y-6 pb-20 md:pb-4">
        {/* Filters */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Placement Experiences</h2>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All" },
              { id: "interview", label: "Interviews" },
              { id: "test", label: "Online Tests" },
              { id: "gd", label: "Group Discussions" }
            ].map((filterOption) => (
              <Button
                key={filterOption.id}
                variant={filter === filterOption.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.id)}
                className="whitespace-nowrap"
              >
                {filterOption.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Building className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">150+</p>
            <p className="text-xs text-muted-foreground">Companies</p>
          </Card>
          <Card className="p-4 text-center">
            <Users className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">2.5k</p>
            <p className="text-xs text-muted-foreground">Experiences</p>
          </Card>
          <Card className="p-4 text-center">
            <Star className="h-6 w-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">4.8</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </Card>
        </div>

        {/* Placement Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="p-4 hover:shadow-medium transition-shadow cursor-pointer">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{post.logo}</div>
                    <div>
                      <h3 className="font-semibold text-foreground">{post.company}</h3>
                      <p className="text-sm text-muted-foreground">{post.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">{post.package}</p>
                    <p className="text-xs text-muted-foreground">{post.location}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={`text-xs border ${getDifficultyColor(post.difficulty)}`}>
                    {post.difficulty}
                  </Badge>
                  <Badge className={`text-xs border ${getTypeColor(post.type)}`}>
                    {post.type}
                  </Badge>
                  {post.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.preview}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 bg-gradient-primary" />
                  <span className="text-sm text-muted-foreground">
                    {post.author} • {post.college} • {post.timeAgo}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpvote(post.id)}
                      className={`h-auto p-1 ${upvotedPosts.has(post.id) ? 'text-accent' : 'text-muted-foreground'}`}
                    >
                      <Star className={`h-4 w-4 mr-1 ${upvotedPosts.has(post.id) ? 'fill-current' : ''}`} />
                      <span className="text-xs">{post.upvotes + (upvotedPosts.has(post.id) ? 1 : 0)}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleComment(post.company)}
                      className="h-auto p-1 text-muted-foreground"
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">{post.comments}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(post.company)}
                      className="h-auto p-1 text-muted-foreground"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(post.company)}
                    className="h-auto p-1 text-accent"
                  >
                    <span className="text-xs mr-1">View Details</span>
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}