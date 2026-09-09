import type { ReactNode } from "react";
import type { UserProfile as UserProfileType } from "../types";
import { FollowButton } from "./follow-button";
import { ProfileBlockMenu } from "./profile-block-menu";
import { StartChatButton } from "@/features/chat/components/start-chat-button";
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
    {
      key: "articles",
      label: "Articles",
      to: `/profile/${profile.id}/articles`,
    },
    {
      key: "followers",
      label: "Followers",
      to: `/profile/${profile.id}/followers`,
    },
    {
      key: "following",
      label: "Following",
      to: `/profile/${profile.id}/following`,
    },
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
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
            <StartChatButton userId={profile.id} />
            <FollowButton
              userId={profile.id}
              isFollowing={profile.isFollowing}
              allowUnfollow
            />
            <ProfileBlockMenu
              userId={profile.id}
              displayName={profile.displayName || profile.username}
              isBlocked={profile.isBlocked}
            />
          </div>
        }
      />
      <ProfileShell.TabNav />
      <ProfileShell.TabContent>{children}</ProfileShell.TabContent>
    </ProfileShell>
  );
};
