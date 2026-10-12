import { uploadAvatar } from "@/app/actions/profile";

interface Props {
  avatarUrl?: string | null;
}

export default function AvatarUpload({ avatarUrl }: Props) {
  return (
    <section className="card mb-6 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="Profile photo"
          className="h-24 w-24 shrink-0 rounded-full border border-line object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-dashed border-line bg-background text-3xl"
        >
          🙂
        </div>
      )}
      <form action={uploadAvatar} className="flex min-w-0 flex-1 flex-col gap-3">
        <label htmlFor="avatar" className="font-semibold">
          Profile photo
        </label>
        <input
          id="avatar"
          type="file"
          name="avatar"
          accept="image/*"
          required
          className="w-full cursor-pointer rounded-xl text-sm text-muted file:mr-3 file:cursor-pointer file:rounded-full file:border file:border-solid file:border-line file:bg-surface file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <button type="submit" className="btn btn-primary w-fit">
          Upload
        </button>
      </form>
    </section>
  );
}
