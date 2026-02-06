import { supabase } from '@/lib/supabase'

export default async function Home() {
  const { data: majors } = await supabase.from('university_majors').select('name')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <h1 className="text-5xl font-bold text-gray-800 mb-10">University Majors</h1>
      <div className="w-full max-w-4xl px-4">
        <div className="overflow-hidden border rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Major Name
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {majors?.map((major) => (
                <tr key={major.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {major.name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
