// Smoke test: POST /api/chat and try to force create_document tool usage
const url = process.env.SMOKE_URL || "http://localhost:3000/api/chat";

async function main() {
  const payload = {
    messages: [
      {
        role: "user",
        content:
          "Use the create_document tool now. Title: MVP Smoke Test. Content: Hello from smoke test. Then reply with the created document id."
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
  }

  const text = await res.text();
  const hasIdWord = /\bid\b/i.test(text);
  const hasUuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(text);

  console.log("--- smoke response (first 400 chars) ---");
  console.log(text.slice(0, 400));
  console.log("----------------------------------------");

  if (!hasIdWord && !hasUuid) {
    throw new Error("Smoke test failed: response did not appear to contain an id/uuid.");
  }

  console.log("Smoke test OK: response contains id-like content.");
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
