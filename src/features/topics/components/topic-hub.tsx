import { Link, useLocation } from "react-router-dom";
import { PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { EmptyState } from "@/components/shared/empty-state";
import { ArticleList, ArticleListSkeleton } from "@/features/articles/components/article-list";
import { FeedSkeleton, PostFeed } from "@/features/posts/components/post-feed";
import { useAuth } from "@/features/auth/auth.context";
import { signInPathWithReturnUrl } from "@/features/auth/return-url";
import { TopicFollowButton } from "./topic-follow-button";
import type { TopicDetail } from "../types";

type TopicHubProps = {
  topic: TopicDetail;
};

export const TopicHub = ({ topic }: TopicHubProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const defaultTab = isAuthenticated ? "posts" : "articles";
  const returnUrl = `${location.pathname}${location.search}`;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">#{topic.name}</h1>
          <p className="mt-1 text-muted-foreground">{topic.description}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {topic.postCount} {topic.postCount === 1 ? "post" : "posts"}
            {" · "}
            {topic.articleCount}{" "}
            {topic.articleCount === 1 ? "article" : "articles"}
            {" · "}
            {topic.followerCount}{" "}
            {topic.followerCount === 1 ? "follower" : "followers"}
          </p>
        </div>
        <TopicFollowButton
          topicId={topic.id}
          isFollowed={topic.isFollowed}
        />
      </header>

      <Tabs
        defaultValue={defaultTab}
        className="gap-6"
      >
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {isAuthenticated ? (
            <QueryBoundary
              fallback={<FeedSkeleton />}
              ErrorFallback={InlineErrorFallback}
            >
              <PostFeed queryDto={{ topicId: topic.id }} />
            </QueryBoundary>
          ) : (
            <EmptyState
              icon={PenLine}
              title="Sign in to see posts"
              description={`Posts tagged #${topic.name} are for signed-in members.`}
            >
              <Button
                className="mt-4"
                asChild
              >
                <Link to={signInPathWithReturnUrl(returnUrl)}>Sign in</Link>
              </Button>
            </EmptyState>
          )}
        </TabsContent>
        <TabsContent value="articles">
          <QueryBoundary
            fallback={<ArticleListSkeleton />}
            ErrorFallback={InlineErrorFallback}
          >
            <ArticleList
              queryDto={{ topicId: topic.id, isPublished: true }}
              className="md:grid-cols-1 lg:grid-cols-1"
            />
          </QueryBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};
