import { redirect } from 'next/navigation';

import SignOutButton from '@/app/components/SignOutButton';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('university_majors')
    .select('*')
    .limit(50);

  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Protected</h1>
      <p>Signed in as {user.email}</p>
      <SignOutButton />

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">University Majors</h2>
        {error ? (
          <p>Could not load majors. Please try again.</p>
        ) : data && data.length > 0 ? (
          <div className="space-y-2">
            <p>{data.length} rows</p>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column} className="border px-3 py-2 text-left">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      {columns.map((column) => (
                        <td key={column} className="border px-3 py-2">
                          {String((row as Record<string, unknown>)[column] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p>No majors found.</p>
        )}
      </div>
    </div>
  );
}
