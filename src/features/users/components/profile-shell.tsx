import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export type ProfileTab = {
  key: string;
  label: string;
  to: string;
};

type RootProps = {
  children: ReactNode;
};

const Root = ({ children }: RootProps) => {
  return <div className="flex flex-col overflow-hidden rounded-xl border bg-card">{children}</div>;
};

type CoverProps = {
  imageUrl?: string | null;
};

const Cover = ({ imageUrl }: CoverProps) => {
  return (
    <div className="relative h-40 w-full overflow-hidden border-b bg-muted md:h-52">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Profile cover"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-linear-to-r from-slate-900 via-slate-700 to-slate-900" />
      )}
    </div>
  );
};

type HeaderProps = {
  avatar: ReactNode;
  identity: ReactNode;
  actions?: ReactNode;
  metadata?: ReactNode;
  stats: ReactNode;
};

const Header = ({ avatar, identity, actions, metadata, stats }: HeaderProps) => {
  return (
    <div className="px-5 pb-5">
      <div className="-mt-12 flex flex-col gap-4 md:-mt-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-end gap-4">
            {avatar}
            <div className="pb-1">{identity}</div>
          </div>
          {actions && <div className="md:pt-2">{actions}</div>}
        </div>
        {metadata}
        {stats}
      </div>
    </div>
  );
};

type AvatarProps = {
  initials: string;
  imageUrl?: string | null;
};

const Avatar = ({ initials, imageUrl }: AvatarProps) => {
  return (
    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-card bg-primary text-primary-foreground md:h-28 md:w-28">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Profile avatar"
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

type TabNavProps = {
  tabs: ProfileTab[];
};

const TabNav = ({ tabs }: TabNavProps) => {
  return (
    <div className="border-t px-2">
      <nav className="flex flex-wrap gap-1 py-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                isActive && "bg-muted text-foreground",
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
  children: ReactNode;
};

const TabContent = ({ children }: TabContentProps) => {
  return <div className="px-5 py-5">{children}</div>;
};

export const ProfileShell = Object.assign(Root, {
  Cover,
  Header,
  Avatar,
  TabNav,
  TabContent,
});
