import type { ReactNode } from "react";
import type { UserProfile as UserProfileType } from "../types";
import { FollowButton } from "./follow-button";
import {
  ProfileShell,
  type ProfileActiveTab,
  type ProfileTab,
} from "./profile-shell";

type UserProfileProps = {
  profile: UserProfileType;
  activeTab: ProfileActiveTab;
  children: ReactNode;
};

export const UserProfile = ({
  profile,
  activeTab,
  children,
}: UserProfileProps) => {
  const tabs: ProfileTab[] = [
    { key: "posts", label: "Posts", to: `/profile/${profile.id}/posts` },
    { key: "articles", label: "Articles", to: `/profile/${profile.id}/articles` },
    { key: "followers", label: "Followers", to: `/profile/${profile.id}/followers` },
    { key: "following", label: "Following", to: `/profile/${profile.id}/following` },
  ];

  return (
    <ProfileShell
      profile={profile}
      activeTab={activeTab}
      tabs={tabs}
    >
      <ProfileShell.Cover />
      <ProfileShell.Header
        actions={
          <FollowButton
            userId={profile.id}
            isFollowing={profile.isFollowing}
          />
        }
      />
      <ProfileShell.TabNav />
      <ProfileShell.TabContent>{children}</ProfileShell.TabContent>
    </ProfileShell>
  );
};
