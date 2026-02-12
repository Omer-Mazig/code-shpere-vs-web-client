import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "../types";
import {
  ProfileShell,
  type ProfileActiveTab,
  type ProfileTab,
} from "./profile-shell";

type MyProfileProps = {
  profile: UserProfile;
  activeTab: ProfileActiveTab;
  children: ReactNode;
};

export const MyProfile = ({
  profile,
  activeTab,
  children,
}: MyProfileProps) => {
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
          <Link to={`/profile/${profile.id}/settings`}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        }
      />
      <ProfileShell.TabNav />
      <ProfileShell.TabContent>{children}</ProfileShell.TabContent>
    </ProfileShell>
  );
};
