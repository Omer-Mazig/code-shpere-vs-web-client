import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, Github, Globe, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { UserProfile } from "../types";

export type ProfileTab = {
  key: ProfileActiveTab;
  label: string;
  to: string;
};

export type ProfileActiveTab =
  | "posts"
  | "articles"
  | "followers"
  | "following"
  | "settings";

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
      <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
        {children}
      </div>
    </ProfileContext.Provider>
  );
};

type CoverProps = {
  imageUrl?: string | null;
};

const Cover = ({ imageUrl }: CoverProps) => {
  const { profile } = useProfile();
  const resolvedImage = imageUrl ?? null;
  const altLabel = profile.displayName ?? profile.username;

  return (
    <div className="relative h-40 w-full overflow-hidden border-b bg-muted md:h-52">
      {resolvedImage ? (
        <img
          src={resolvedImage}
          alt={`${altLabel} cover`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-linear-to-r from-slate-900 via-slate-700 to-slate-900" />
      )}
    </div>
  );
};

type HeaderProps = {
  actions?: React.ReactNode;
};

const Header = ({ actions }: HeaderProps) => {
  const { profile } = useProfile();
  const initials = (
    profile.displayName?.[0] ??
    profile.username[0] ??
    "?"
  ).toUpperCase();

  return (
    <div className="px-5 pb-5 pt-2">
      <div className="-mt-8 flex flex-col gap-4 md:-mt-10">
        <div className="flex flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar
              initials={initials}
              imageUrl={profile.avatarUrl}
            />
            <div>
              <h1 className="text-2xl font-semibold">
                {profile.displayName ?? profile.username}
              </h1>
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            </div>
          </div>
          {actions && <div className="z-10 md:pt-2 self-center">{actions}</div>}
        </div>
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
      </div>
    </div>
  );
};

type AvatarProps = {
  initials: string;
  imageUrl?: string | null;
};

const Avatar = ({ initials, imageUrl }: AvatarProps) => {
  const { profile } = useProfile();
  const altLabel = profile.displayName ?? profile.username;

  return (
    <div className="z-10 h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-card bg-primary text-primary-foreground md:h-28 md:w-28">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${altLabel} avatar`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-2xl font-bold">
          {initials}
        </div>
      )}
    </div>
  );
};

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
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                activeTab === tab.key && "bg-muted text-foreground",
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
  return <div className="px-5 py-5">{children}</div>;
};

export const ProfileShell = Object.assign(Root, {
  useProfile,
  Cover,
  Header,
  Avatar,
  TabNav,
  TabContent,
});
