import { Navigate, useParams } from "react-router-dom";
import { ArticleList, ArticleListSkeleton } from "@/features/articles/components/article-list";
import { ProfileConnectionsList } from "@/features/users/components/profile-connections-list";
import { ProfilePosts } from "@/features/users/components/profile-posts";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { InlineErrorFallback } from "@/components/errors/inline-error-fallback";
import { ProfileLayoutRouteGate } from "./profile-layout-route-gate";

export const ProfileArticlesTabPage = () => {
  return (
    <ProfileLayoutRouteGate activeTab="articles">
      {({ profileId }) => (
        <QueryBoundary
          fallback={<ArticleListSkeleton />}
          ErrorFallback={InlineErrorFallback}
          resetKeys={[profileId]}
        >
          <ArticleList
            queryDto={{ authorId: profileId, isPublished: true }}
          />
        </QueryBoundary>
      )}
    </ProfileLayoutRouteGate>
  );
};

export const ProfilePostsTabPage = () => {
  return (
    <ProfileLayoutRouteGate activeTab="posts">
      {({ profileId }) => <ProfilePosts userId={profileId} />}
    </ProfileLayoutRouteGate>
  );
};

export const ProfileFollowersTabPage = () => {
  return (
    <ProfileLayoutRouteGate activeTab="followers">
      {({ profileId }) => (
        <ProfileConnectionsList
          mode="followers"
          profileId={profileId}
        />
      )}
    </ProfileLayoutRouteGate>
  );
};

export const ProfileFollowingTabPage = () => {
  return (
    <ProfileLayoutRouteGate activeTab="following">
      {({ profileId }) => (
        <ProfileConnectionsList
          mode="following"
          profileId={profileId}
        />
      )}
    </ProfileLayoutRouteGate>
  );
};

export const ProfileIndexRedirectPage = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) {
    return (
      <Navigate
        to="/feed"
        replace
      />
    );
  }
  return (
    <Navigate
      to={`/profile/${id}/posts`}
      replace
    />
  );
};
