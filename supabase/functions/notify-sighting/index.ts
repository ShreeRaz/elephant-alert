import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── Get FCM Access Token ──────────────────────────────────────────────────────
async function getFCMAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  // JWT requires base64url encoding (not standard base64)
  function base64url(str: string): string {
    return btoa(str)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")
  }

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const payload = base64url(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }))

  const signingInput = `${header}.${payload}`

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(signingInput)
  )

  // Also base64url encode the signature
  const signatureBase64url = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")

  const jwt = `${signingInput}.${signatureBase64url}`

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenRes.json()
  console.log("Token response:", JSON.stringify(tokenData))
  
  return tokenData.access_token
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "")
  const binary = atob(b64)
  const buffer = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i)
  return buffer
}

// ─── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const { description, latitude, longitude } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get Firebase service account
    const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!)
    const projectId = serviceAccount.project_id

    // Get FCM access token
    const accessToken = await getFCMAccessToken(serviceAccount)

    // Fetch all push tokens
    const { data: tokens, error } = await supabase
      .from("push_tokens")
      .select("token")

    if (error) throw error
    if (!tokens?.length) return new Response(
      JSON.stringify({ success: true, sent: 0 }),
      { headers: { "Content-Type": "application/json" } }
    )

    // Send notifications
    // Send notifications
const results = await Promise.allSettled(
  tokens.map(async (t: { token: string }) => {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: t.token,
          notification: {
            title: "🐘 Elephant Alert!",
            body: description || "An elephant has been spotted nearby!",
          },
          data: {
            latitude: String(latitude),
            longitude: String(longitude),
          },
          android: {
            priority: "high",
            notification: {
              sound: "default",
              channel_id: "elephant_alerts",
            },
          },
        },
      }),
    })
    const data = await res.json()
    console.log("FCM response:", JSON.stringify(data))
    return data
  })
)

    const sent = results.filter(r => r.status === "fulfilled").length

    return new Response(
      JSON.stringify({ success: true, sent }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})