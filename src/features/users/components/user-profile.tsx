import type { ReactNode } from "react";
import { Calendar, Github, Globe, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { UserProfile } from "../types";
import { FollowButton } from "./follow-button";
import { ProfileShell, type ProfileTab } from "./profile-shell";

type UserProfileProps = {
  profile: UserProfile;
  tabs: ProfileTab[];
  children: ReactNode;
};

export const UserProfile = ({ profile, tabs, children }: UserProfileProps) => {
  const initials = (
    profile.displayName?.[0] ??
    profile.username[0] ??
    "?"
  ).toUpperCase();

  return (
    <ProfileShell>
      <ProfileShell.Cover />
      <ProfileShell.Header
        avatar={
          <ProfileShell.Avatar
            initials={initials}
            imageUrl={profile.avatarUrl}
          />
        }
        identity={
          <div>
            <h1 className="text-2xl font-semibold">
              {profile.displayName ?? profile.username}
            </h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
        }
        actions={
          <FollowButton
            userId={profile.id}
            isFollowing={profile.isFollowing}
          />
        }
        metadata={
          <div className="flex flex-col gap-3">
            {profile.bio && (
              <p className="max-w-2xl text-sm leading-relaxed">{profile.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {profile.github && (
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                  {profile.github}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined{" "}
                {formatDistanceToNow(new Date(profile.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        }
        stats={
          <div className="flex items-center gap-6 text-sm">
            <span>
              <strong>{profile.followersCount}</strong>{" "}
              <span className="text-muted-foreground">followers</span>
            </span>
            <span>
              <strong>{profile.followingCount}</strong>{" "}
              <span className="text-muted-foreground">following</span>
            </span>
          </div>
        }
      />
      <ProfileShell.TabNav tabs={tabs} />
      <ProfileShell.TabContent>{children}</ProfileShell.TabContent>
    </ProfileShell>
  );
};
