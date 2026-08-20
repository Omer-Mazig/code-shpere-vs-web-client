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

export const getUserInitials = (user?: AvatarUser | null) => {
  const source = user?.displayName?.trim() || user?.username?.trim() || "?";
  return source.charAt(0).toUpperCase();
};

export const UserAvatar = ({
  user,
  size = "default",
  className,
}: UserAvatarProps) => {
  const label = user?.displayName || user?.username || "User";

  return (
    <Avatar
      size={size}
      className={cn(className)}
    >
      <AvatarImage
        src={user?.avatarUrl ?? undefined}
        alt={label}
      />
      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
    </Avatar>
  );
};
