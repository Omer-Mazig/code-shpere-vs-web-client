import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { ProfileHeader } from "@/features/users/components/profile-header";
import { ProfilePosts } from "@/features/users/components/profile-posts";
import { ArticleList } from "@/features/articles/components/article-list";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TabType = "posts" | "articles";

export const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = React.useState<TabType>("posts");

  const { data: profile, isLoading } = useQuery(
    usersQueryOptionsFactory.profile(id!),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-6">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "posts", label: "Posts" },
    { key: "articles", label: "Articles" },
  ];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-col gap-6">
        <ProfileHeader profile={profile} />

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant="ghost"
              size="sm"
              className={cn(
                "rounded-none border-b-2 border-transparent",
                activeTab === tab.key && "border-primary text-foreground",
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "posts" && <ProfilePosts userId={id!} />}
        {activeTab === "articles" && (
          <ArticleList queryDto={{ authorId: id, isPublished: true }} />
        )}
      </div>
    </div>
  );
};
