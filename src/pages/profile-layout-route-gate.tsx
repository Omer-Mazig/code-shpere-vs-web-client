import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { useAuth } from "@/features/auth/auth.context";
import { MyProfile } from "@/features/users/components/my-profile";
import { UserProfile } from "@/features/users/components/user-profile";
import { LockedProfile } from "@/features/users/components/locked-profile";
import type { UserProfile as UserProfileType } from "@/features/users/types";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryBoundary } from "@/components/errors/query-boundary";
import { PageErrorFallback } from "@/components/errors/page-error-fallback";
import type { ProfileActiveTab } from "@/features/users/components/profile-shell";

type ProfileLayoutRouteGateProps = {
  activeTab: ProfileActiveTab;
  children: (params: {
    profileId: string;
    profile: UserProfileType;
    isOwnProfile: boolean;
  }) => ReactNode;
};

const LockedProfileRoute = ({ profileId }: { profileId: string }) => {
  const { data: preview } = useSuspenseQuery(
    usersQueryOptionsFactory.preview(profileId),
  );
  return <LockedProfile preview={preview} />;
};

const AuthenticatedProfileLayout = ({
  profileId,
  isOwnProfile,
  activeTab,
  children,
}: {
  profileId: string;
  isOwnProfile: boolean;
  activeTab: ProfileActiveTab;
  children: ProfileLayoutRouteGateProps["children"];
}) => {
  const { data: profile } = useSuspenseQuery(
    isOwnProfile
      ? usersQueryOptionsFactory.myProfile()
      : usersQueryOptionsFactory.profile(profileId),
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col gap-6">
        {isOwnProfile ? (
          <MyProfile
            profile={profile}
            activeTab={activeTab}
          >
            {children({
              profileId,
              profile,
              isOwnProfile,
            })}
          </MyProfile>
        ) : (
          <UserProfile
            profile={profile}
            activeTab={activeTab}
          >
            {children({
              profileId,
              profile,
              isOwnProfile,
            })}
          </UserProfile>
        )}
      </div>
    </div>
  );
};

export const ProfileLayoutRouteGate = ({
  activeTab,
  children,
}: ProfileLayoutRouteGateProps) => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const profileId = id ?? "";
  const isOwnProfile = Boolean(isAuthenticated && user?.id === profileId);

  if (!profileId) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6">
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryBoundary
        fallback={
          <div className="container mx-auto max-w-lg px-4 py-16">
            <Skeleton className="mx-auto h-72 w-full max-w-lg rounded-2xl" />
          </div>
        }
        ErrorFallback={PageErrorFallback}
        resetKeys={[profileId]}
      >
        <LockedProfileRoute profileId={profileId} />
      </QueryBoundary>
    );
  }

  return (
    <QueryBoundary
      fallback={
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      }
      ErrorFallback={PageErrorFallback}
      resetKeys={[profileId, isOwnProfile]}
    >
      <AuthenticatedProfileLayout
        profileId={profileId}
        isOwnProfile={isOwnProfile}
        activeTab={activeTab}
      >
        {children}
      </AuthenticatedProfileLayout>
    </QueryBoundary>
  );
};
