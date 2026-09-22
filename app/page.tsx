import { createClient } from "@supabase/supabase-js";

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, text");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      {error ? (
        <p className="text-red-600">{error.message}</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {messages?.map((msg) => (
            <li key={msg.id}>{msg.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
