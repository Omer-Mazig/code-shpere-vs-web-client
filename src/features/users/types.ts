export type UserProfile = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  github: string | null;
  location: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  createdAt: string;
};

export type UpdateProfileDto = {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  github?: string;
  location?: string;
};

export type FollowUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  followedAt: string;
};
