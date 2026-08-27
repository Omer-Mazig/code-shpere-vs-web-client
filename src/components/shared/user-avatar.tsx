import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type AvatarUser = {
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
};

type UserAvatarProps = {
  user?: AvatarUser | null;
  size?: "default" | "sm" | "lg";
  className?: string;
};

export const getUserDisplayName = (user?: AvatarUser | null) =>
  user?.displayName?.trim() || user?.username?.trim() || "User";

export const getUserInitials = (user?: AvatarUser | null) => {
  const source = user?.displayName?.trim() || user?.username?.trim();
  return source ? source.charAt(0).toUpperCase() : "?";
};

export const UserAvatar = ({
  user,
  size = "default",
  className,
}: UserAvatarProps) => {
  return (
    <Avatar
      aria-hidden="true"
      size={size}
      className={cn(className)}
    >
      <AvatarImage
        src={user?.avatarUrl ?? undefined}
        alt=""
      />
      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
    </Avatar>
  );
};
