"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { assistantApi, documentApi } from "@/lib/api";

const STORAGE_KEY = "vivadx-assistant-messages";

interface Message {
  role: "user" | "assistant";
  content: string;
  vectorless?: boolean;
}

function loadMessages(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}

function AssistantChat() {
  const searchParams = useSearchParams();
  const enrollId = searchParams.get("enroll");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextNote, setContextNote] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMessages(loadMessages());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages, hydrated]);

  useEffect(() => {
    if (enrollId) {
      documentApi.result(enrollId).then((r) => {
        setContextNote(
          `Context loaded for ${r.criteria?.name ?? "document"} (${enrollId.slice(0, 8)}…)`
        );
        setInput(`Explain the verification result for enroll ${enrollId.slice(0, 8)}`);
      }).catch(() => {});
    }
  }, [enrollId]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await assistantApi.chat(text);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          vectorless: res.context_summary.vectorless,
        },
      ]);
    } catch (e: unknown) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: e instanceof Error ? e.message : "Error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Assistant"
        description="Ask about your verifications. Answers come straight from your live data."
        actions={
          messages.length > 0 ? (
            <button type="button" className="dash-btn dash-btn--ghost" onClick={clearChat}>
              <Trash2 size={14} />
              Clear chat
            </button>
          ) : null
        }
      />

      {contextNote && (
        <div className="settings-alerts">
          <p className="success-banner">{contextNote}</p>
        </div>
      )}

      <section className="dash-board assistant-board" aria-label="AI Assistant">
        <div className="chat-panel">
          <div className="chat-messages">
            {!hydrated && (
              <div className="dash-loading-inline"><div className="dash-spinner" /></div>
            )}
            {hydrated && messages.length === 0 && (
              <div className="chat-empty">
                <Bot size={28} className="text-[var(--primary)]" />
                <p>Ask about verifications, risk scores, or blockchain proofs.</p>
                <div className="chat-suggestions">
                  {[
                    "How many documents failed?",
                    "What was my last verification score?",
                    "How many blockchain signatures do I have?",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="chat-suggestion"
                      onClick={() => setInput(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble chat-bubble-${m.role}`}>
                {m.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
                <div>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.vectorless && (
                    <span className="chat-meta">Live data from your account</span>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-bubble-assistant">
                <Loader2 size={16} className="animate-spin" />
                <span>Thinking…</span>
              </div>
            )}
          </div>

          <form
            className="chat-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              className="input-dark flex-1"
              placeholder="Ask about your documents…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
            />
            <button type="submit" className="dash-btn dash-btn--primary" disabled={loading}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="dash-content dash-content--saas">
          <div className="dash-loading"><div className="dash-spinner" /></div>
        </div>
      }
    >
      <AssistantChat />
    </Suspense>
  );
}
