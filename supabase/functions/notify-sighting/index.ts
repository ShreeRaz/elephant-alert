import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  try {
    const { description, latitude, longitude } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: tokens, error } = await supabase
      .from("push_tokens")
      .select("token")

    if (error) throw error

    const messages = tokens.map((t: { token: string }) => ({
      to: t.token,
      title: "🐘 Elephant Alert!",
      body: description || "An elephant has been spotted nearby!",
      data: { latitude, longitude },
    }))

    const chunks = []
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100))
    }

    for (const chunk of chunks) {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      })
    }

    return new Response(
      JSON.stringify({ success: true, sent: messages.length }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})