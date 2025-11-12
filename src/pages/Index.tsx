import { Navigation } from "@/components/Navigation";
import { Feed } from "@/components/Feed";
import { Search } from "@/components/Search";
import { Explore } from "@/components/Explore";
import { Match } from "@/components/Match";
import { Placements } from "@/components/Placements";
import { Profile } from "@/components/Profile";
import { CreatePost } from "@/components/CreatePost";
import { useState } from "react";

const mockPosts = [
  {
    id: "1",
    username: "@dev_student_2024",
    trustLevel: "silver" as const,
    timeAgo: "2h ago",
    content: "Can anyone help me understand how to implement OAuth 2.0 in a React app? I'm getting confused with the flow and token management. Any good resources or step-by-step guides?",
    upvotes: 23,
    downvotes: 2,
    comments: 8,
    category: "query" as const
  },
  {
    id: "2", 
    username: "@system_architect_pro",
    trustLevel: "platinum" as const,
    timeAgo: "4h ago",
    content: "Here's a complete guide to microservices architecture that helped me land my FAANG internship. Key points: API Gateway, Service Discovery, Circuit Breakers, and proper monitoring. DM for detailed breakdown!",
    upvotes: 156,
    downvotes: 4,
    comments: 34,
    category: "solution" as const
  },
  {
    id: "3",
    username: "@startup_hunter",
    trustLevel: "gold" as const,
    timeAgo: "6h ago", 
    content: "Looking for a referral at Meta or Google for SWE New Grad 2025. Have solid projects including a distributed chat app and ML recommendation system. GPA: 3.8/4.0. Can share resume!",
    upvotes: 45,
    downvotes: 1,
    comments: 12,
    category: "job" as const
  },
  {
    id: "4",
    username: "@ml_enthusiast",
    trustLevel: "gold" as const,
    timeAgo: "8h ago",
    content: "Just finished implementing a neural network from scratch in Python! The math behind backpropagation finally clicked. Happy to share my notes and code walkthrough with anyone interested in ML fundamentals.",
    upvotes: 89,
    downvotes: 3,
    comments: 18,
    category: "solution" as const
  },
  {
    id: "5",
    username: "@hackathon_queen",
    trustLevel: "silver" as const,
    timeAgo: "12h ago",
    content: "Team won 1st place at Stanford TreeHacks! Our project was an AI-powered study planner that adapts to your learning style. Looking to turn this into a startup - need a business co-founder!",
    upvotes: 234,
    downvotes: 8,
    comments: 67,
    category: "discussion" as const
  },
  {
    id: "6",
    username: "@frontend_wizard",
    trustLevel: "gold" as const,
    timeAgo: "14h ago",
    content: "Created a React component library with 50+ components and TypeScript support. Includes dark mode, animations, and accessibility features. Open source and ready for production use! 🚀",
    upvotes: 178,
    downvotes: 2,
    comments: 45,
    category: "solution" as const
  },
  {
    id: "7",
    username: "@crypto_student",
    trustLevel: "bronze" as const,
    timeAgo: "16h ago",
    content: "Has anyone worked with blockchain development? I'm trying to understand smart contracts and Web3 integration. Looking for study buddies or mentorship opportunities.",
    upvotes: 34,
    downvotes: 5,
    comments: 28,
    category: "query" as const
  },
  {
    id: "8",
    username: "@data_scientist_pro",
    trustLevel: "platinum" as const,
    timeAgo: "18h ago",
    content: "Sharing my journey from CS student to Data Scientist at Netflix. Key skills: Python, SQL, Machine Learning, Statistics. Happy to review resumes and provide career guidance!",
    upvotes: 298,
    downvotes: 6,
    comments: 89,
    category: "discussion" as const
  },
  {
    id: "9",
    username: "@mobile_dev_ninja",
    trustLevel: "silver" as const,
    timeAgo: "20h ago",
    content: "Built a cross-platform mobile app using React Native for my final year project. Features include real-time chat, push notifications, and offline sync. Tech stack: RN, Firebase, Redux.",
    upvotes: 67,
    downvotes: 1,
    comments: 23,
    category: "solution" as const
  },
  {
    id: "10",
    username: "@intern_seeker_2025",
    trustLevel: "bronze" as const,
    timeAgo: "1d ago",
    content: "Amazon SDE Intern interview next week! Any tips for the coding rounds? I've been practicing on LeetCode but feeling nervous about the behavioral questions. What should I expect?",
    upvotes: 156,
    downvotes: 3,
    comments: 78,
    category: "job" as const
  },
  {
    id: "11",
    username: "@ai_researcher",
    trustLevel: "platinum" as const,
    timeAgo: "1d ago",
    content: "Published my first research paper on computer vision! 'Efficient Object Detection using Transformer Architecture' - accepted at CVPR 2024. DM if you want to discuss the methodology or collaborate!",
    upvotes: 445,
    downvotes: 12,
    comments: 134,
    category: "discussion" as const
  },
  {
    id: "12",
    username: "@cloud_architect",
    trustLevel: "gold" as const,
    timeAgo: "1d ago",
    content: "Deployed my first serverless application on AWS! Used Lambda, API Gateway, DynamoDB, and S3. Cost optimization was tricky but managed to keep it under $5/month. Architecture diagram in comments!",
    upvotes: 123,
    downvotes: 4,
    comments: 56,
    category: "solution" as const
  }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState(mockPosts);

  const handleTabChange = (tab: string) => {
    if (tab === "post") {
      setShowCreatePost(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "feed":
        return <Feed posts={posts} />;
      case "search":
        return <Search />;
      case "daily":
        return <Explore />;
      case "match":
        return <Match />;
      case "placements":
        return <Placements />;
      case "profile":
        return <Profile />;
      default:
        return <Feed posts={posts} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main Content */}
      <main className="md:ml-64">
        <div className="max-w-2xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost onClose={() => setShowCreatePost(false)} onPostCreated={handlePostCreated} />
      )}
    </div>
  );
};

export default Index;
