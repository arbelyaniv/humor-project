import { updateProfile } from "@/app/actions/profile";

interface Props {
  firstName?: string | null;
  lastName?: string | null;
}

export default function ProfileForm({ firstName, lastName }: Props) {
  return (
    <form action={updateProfile} className="flex flex-col gap-3 max-w-sm mb-8">
      <h2 className="text-lg font-semibold">Complete your profile</h2>
      <input
        name="first_name"
        placeholder="First name"
        defaultValue={firstName ?? ""}
        required
        className="border rounded px-3 py-2"
      />
      <input
        name="last_name"
        placeholder="Last name"
        defaultValue={lastName ?? ""}
        required
        className="border rounded px-3 py-2"
      />
      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Save
      </button>
    </form>
  );
}
