import { Link } from "react-router-dom";
import { MapPin, Globe, Github, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { UserProfile } from "../types";
import { FollowButton } from "./follow-button";
import { useAuth } from "@/features/auth/auth.context";
import { Button } from "@/components/ui/button";

type ProfileHeaderProps = {
  profile: UserProfile;
};

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
            {profile.displayName?.[0]?.toUpperCase() ??
              profile.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {profile.displayName ?? profile.username}
            </h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
        </div>

        {isOwnProfile ? (
          <Link to="/profile/edit">
            <Button variant="outline" size="sm">
              Edit Profile
            </Button>
          </Link>
        ) : (
          <FollowButton
            userId={profile.id}
            isFollowing={profile.isFollowing}
          />
        )}
      </div>

      {profile.bio && (
        <p className="mt-4 text-sm leading-relaxed">{profile.bio}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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

      <div className="mt-4 flex items-center gap-6 text-sm">
        <span>
          <strong>{profile.followersCount}</strong>{" "}
          <span className="text-muted-foreground">followers</span>
        </span>
        <span>
          <strong>{profile.followingCount}</strong>{" "}
          <span className="text-muted-foreground">following</span>
        </span>
      </div>
    </div>
  );
};
