import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";
import { Filter, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Feed({ posts }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const { toast } = useToast();

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    toast({
      title: "Filter Applied",
      description: `Showing ${filter === "all" ? "all posts" : filter} posts`,
    });
  };

  const handleCreatePost = () => {
    toast({
      title: "Create Post",
      description: "Post creation feature opened!",
    });
  };

  const filteredPosts = activeFilter === "all" 
    ? posts 
    : posts.filter(post => {
        if (activeFilter === "queries") return post.category === "query";
        if (activeFilter === "solutions") return post.category === "solution";
        if (activeFilter === "jobs") return post.category === "job";
        if (activeFilter === "discussions") return post.category === "discussion";
        return true;
      });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur p-4 border-b md:border-none">
        <h1 className="text-xl font-bold text-foreground md:hidden">StudNet</h1>
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => toast({ title: "Filter", description: "Filter options opened!" })}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={handleCreatePost}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter Tabs - Desktop */}
      <div className="hidden md:flex items-center gap-2 px-4">
        <Button 
          variant={activeFilter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("all")}
        >
          All
        </Button>
        <Button 
          variant={activeFilter === "queries" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("queries")}
        >
          Queries
        </Button>
        <Button 
          variant={activeFilter === "solutions" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("solutions")}
        >
          Solutions
        </Button>
        <Button 
          variant={activeFilter === "jobs" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("jobs")}
        >
          Jobs
        </Button>
        <Button 
          variant={activeFilter === "discussions" ? "default" : "outline"} 
          size="sm"
          onClick={() => handleFilterClick("discussions")}
        >
          Discussions
        </Button>
      </div>

      {/* Posts */}
      <div className="space-y-4 px-4 pb-20 md:pb-4">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}