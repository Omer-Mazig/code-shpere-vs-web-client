import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bell, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth.context";
import { usersQueryOptionsFactory } from "@/features/users/users-query-options-factory";
import { useUpdateProfile } from "@/features/users/hooks/use-update-profile";

export const ProfileSettingsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const updateProfile = useUpdateProfile();

  if (!id) {
    return <Navigate to="/feed" replace />;
  }

  const isOwnProfile = isAuthenticated && user?.id === id;
  if (!isOwnProfile) {
    return <Navigate to={`/profile/${id}/posts`} replace />;
  }

  const { data: profile, isLoading } = useQuery(usersQueryOptionsFactory.myProfile());

  const [displayName, setDisplayName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [notifyMentions, setNotifyMentions] = React.useState(true);
  const [notifyFollowers, setNotifyFollowers] = React.useState(true);
  const [notifyComments, setNotifyComments] = React.useState(true);

  React.useEffect(() => {
    if (!profile) return;

    setDisplayName(profile.displayName ?? "");
    setBio(profile.bio ?? "");
    setLocation(profile.location ?? "");
    setWebsite(profile.website ?? "");
    setGithub(profile.github ?? "");
    setAvatarUrl(profile.avatarUrl ?? "");
  }, [profile]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-muted-foreground">Unable to load settings.</p>
      </div>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await updateProfile.mutateAsync({
      displayName: displayName || undefined,
      bio: bio || undefined,
      location: location || undefined,
      website: website || undefined,
      github: github || undefined,
      avatarUrl: avatarUrl || undefined,
    });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6">
      <div className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage profile and account preferences.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium">General info</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email ?? ""}
                readOnly
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Your email is private and is not shown on your public profile.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                placeholder="Tell the community about yourself..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub username</Label>
                <Input
                  id="github"
                  value={github}
                  onChange={(event) => setGithub(event.target.value)}
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium">Notification management</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Preference toggles are temporarily local-only. Backend persistence
              will be wired in a future step.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Mentions</p>
                  <p className="text-xs text-muted-foreground">
                    Notify when someone mentions you in posts or comments.
                  </p>
                </div>
                <Switch
                  checked={notifyMentions}
                  onCheckedChange={setNotifyMentions}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">New followers</p>
                  <p className="text-xs text-muted-foreground">
                    Notify when a new user follows you.
                  </p>
                </div>
                <Switch
                  checked={notifyFollowers}
                  onCheckedChange={setNotifyFollowers}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Replies and comments</p>
                  <p className="text-xs text-muted-foreground">
                    Notify when someone replies to your content.
                  </p>
                </div>
                <Switch
                  checked={notifyComments}
                  onCheckedChange={setNotifyComments}
                />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
