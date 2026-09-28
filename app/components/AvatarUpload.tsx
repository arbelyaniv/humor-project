import { uploadAvatar } from "@/app/actions/profile";

interface Props {
  avatarUrl?: string | null;
}

export default function AvatarUpload({ avatarUrl }: Props) {
  return (
    <div className="flex flex-col gap-3 max-w-sm mb-8">
      {avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt="Profile photo"
          className="w-24 h-24 rounded-full object-cover"
        />
      )}
      <form
        action={uploadAvatar}
        className="flex flex-col gap-2"
      >
        <label className="text-sm font-medium">Profile photo</label>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          required
          className="text-sm"
        />
        <button
          type="submit"
          className="w-fit rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
