"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { getToken, saveToken, type UserPublic } from "@/lib/auth";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading } = useSession(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setBio(user.bio ?? "");
      setAvatarUrl(user.avatar_url ?? "");
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError("");
    setSaving(true);
    try {
      const out = await apiFetch<{ user: UserPublic }>(
        `/api/v1/users/${user.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            bio: bio.trim() || null,
            avatar_url: avatarUrl.trim() || null,
          }),
        },
      );
      const token = getToken();
      if (token) {
        saveToken(token, out.user);
      }
      toast.success("Profile saved");
      router.replace("/profile");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <p className="text-sm text-muted-foreground">Loading editor…</p>
    );
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit profile</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="flex flex-col items-center gap-3 border-b border-border pb-6 sm:flex-row">
          <UserAvatar
            name={name || user.name}
            avatarUrl={avatarUrl || null}
            size="lg"
          />
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            Paste an image URL (HTTPS). Your avatar appears in the navbar and on
            this profile.
          </p>
        </div>

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="edit-avatar">Profile photo URL</Label>
          <Input
            id="edit-avatar"
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={avatarUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvatarUrl(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-bio">Bio</Label>
          <Textarea
            id="edit-bio"
            value={bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
            rows={5}
            placeholder="Tell buyers or sellers about your experience…"
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </main>
  );
}
