"use client";

import { useChat } from "ai/react";

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat"
  });

  return (
    <main style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>CLAWDBOT MVP</h1>

      <div style={{ border: "1px solid #ddd", padding: 12, minHeight: 300 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ margin: "8px 0" }}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Say something…"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: "8px 12px" }}>
          Send
        </button>
      </form>

      <p style={{ marginTop: 12, color: "#666" }}>
        Tip: ask “Use the create_document tool now. Title: X. Content: Y. Then confirm the id.”
      </p>
    </main>
  );
}
