import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, Github, Globe, MapPin } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { UserProfile } from "../types";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";

export type ProfileTab = {
  key: ProfileActiveTab;
  label: string;
  to: string;
};

export type ProfileActiveTab =
  | "posts"
  | "articles"
  | "followers"
  | "following";

type ProfileContextValue = {
  profile: UserProfile;
  activeTab: ProfileActiveTab;
  tabs: ProfileTab[];
};

const ProfileContext = React.createContext<ProfileContextValue | undefined>(
  undefined,
);

const useProfile = () => {
  const context = React.useContext(ProfileContext);
  if (!context) {
    throw new Error(
      "Profile compound components must be used within ProfileShell.Root",
    );
  }
  return context;
};

type RootProps = {
  profile: UserProfile;
  activeTab: ProfileActiveTab;
  tabs: ProfileTab[];
  children: React.ReactNode;
};

const Root = ({ profile, activeTab, tabs, children }: RootProps) => {
  return (
    <ProfileContext.Provider value={{ profile, activeTab, tabs }}>
      <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
        {children}
      </div>
    </ProfileContext.Provider>
  );
};

type CoverProps = {
  imageUrl?: string | null;
};

const coverGradient = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `linear-gradient(135deg, oklch(0.38 0.14 ${hue}) 0%, oklch(0.28 0.1 ${(hue + 48) % 360}) 55%, oklch(0.42 0.12 ${(hue + 96) % 360}) 100%)`;
};

const Cover = ({ imageUrl }: CoverProps) => {
  const { profile } = useProfile();
  const resolvedImage = imageUrl ?? null;
  const altLabel = profile.displayName ?? profile.username;

  return (
    <div className="relative h-36 w-full overflow-hidden md:h-48">
      {resolvedImage ? (
        <img
          src={resolvedImage}
          alt={`${altLabel} cover`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="h-full w-full"
          style={{ backgroundImage: coverGradient(profile.username) }}
        />
      )}
    </div>
  );
};

type HeaderProps = {
  actions?: React.ReactNode;
};

const Header = ({ actions }: HeaderProps) => {
  const { profile } = useProfile();
  const displayName = profile.displayName ?? profile.username;
  const postsCount = profile.postsCount ?? 0;
  const articlesCount = profile.articlesCount ?? 0;

  return (
    <div className="px-5 pb-5">
      <div className="-mt-10 flex flex-col gap-4 md:-mt-12">
        <div className="flex items-end justify-between gap-4">
          <UserAvatar
            user={profile}
            className="size-24 border-4 border-card shadow-sm md:size-28"
          />
          {actions && <div className="z-10 pb-1">{actions}</div>}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {displayName}
            </h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                asChild
              >
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Website"
                >
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
            {profile.github && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground"
                asChild
              >
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`GitHub ${profile.github}`}
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <StatLink
            to={`/profile/${profile.id}/posts`}
            count={postsCount}
            label="posts"
          />
          <StatLink
            to={`/profile/${profile.id}/articles`}
            count={articlesCount}
            label="articles"
          />
          <StatLink
            to={`/profile/${profile.id}/followers`}
            count={profile.followersCount}
            label="followers"
          />
          <StatLink
            to={`/profile/${profile.id}/following`}
            count={profile.followingCount}
            label="following"
          />
        </div>
      </div>
    </div>
  );
};

type StatLinkProps = {
  to: string;
  count: number;
  label: string;
};

const StatLink = ({ to, count, label }: StatLinkProps) => (
  <NavLink
    to={to}
    className="hover:underline"
  >
    <strong className="text-foreground">{count}</strong>{" "}
    <span className="text-muted-foreground">{label}</span>
  </NavLink>
);

const TabNav = () => {
  const { tabs, activeTab } = useProfile();
  return (
    <div className="border-t px-2">
      <nav className="flex flex-wrap gap-1 py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            className={() =>
              cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                activeTab === tab.key && "bg-muted text-foreground font-medium",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

type TabContentProps = {
  children: React.ReactNode;
};

const TabContent = ({ children }: TabContentProps) => {
  return <div className="border-t bg-muted/20 px-5 py-5">{children}</div>;
};

export const ProfileShell = Object.assign(Root, {
  useProfile,
  Cover,
  Header,
  TabNav,
  TabContent,
});
