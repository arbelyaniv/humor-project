import { updateProfile } from "@/app/actions/profile";

interface Props {
  firstName?: string | null;
  lastName?: string | null;
}

export default function ProfileForm({ firstName, lastName }: Props) {
  return (
    <form
      action={updateProfile}
      className="card mb-10 flex flex-col gap-4 p-5 sm:p-6"
    >
      <h2 className="font-semibold">Complete your profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className="field-label">
            First name
          </label>
          <input
            id="first_name"
            name="first_name"
            placeholder="First name"
            defaultValue={firstName ?? ""}
            required
            className="input"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="field-label">
            Last name
          </label>
          <input
            id="last_name"
            name="last_name"
            placeholder="Last name"
            defaultValue={lastName ?? ""}
            required
            className="input"
          />
        </div>
      </div>
      <button type="submit" className="btn btn-primary w-fit">
        Save
      </button>
    </form>
  );
}
