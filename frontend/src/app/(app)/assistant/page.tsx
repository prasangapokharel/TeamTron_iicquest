"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Bot, User, Loader2, Trash2, Copy, Check, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { assistantApi, documentApi } from "@/lib/api";
import { formatApiError, isServerError } from "@/lib/errors";

const STORAGE_KEY = "vivadx-assistant-messages";
const MAX_LEN = 1000;

const SUGGESTED = [
  "How many documents were verified today?",
  "What is my current balance?",
  "Show me my recent failed verifications.",
  "Which criteria do I use most?",
  "What is my verification success rate?",
  "List my last 5 blockchain-signed documents.",
  "How much have I spent on verifications?",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  vectorless?: boolean;
  failed?: boolean;
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" className="chat-copy-btn" onClick={copy} aria-label="Copy answer">
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function AssistantChat() {
  const searchParams = useSearchParams();
  const enrollId = searchParams.get("enroll");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextNote, setContextNote] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");

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
          `Context loaded for ${r.criteria?.name ?? "document"} (${enrollId.slice(0, 8)}…)`,
        );
        setInput(`Explain the verification result for enroll ${enrollId.slice(0, 8)}`);
      }).catch(() => {
        documentApi.get(enrollId).then((d) => {
          setContextNote(`Document ${enrollId.slice(0, 8)}… — status: ${d.status}`);
        }).catch(() => {});
      });
    }
  }, [enrollId]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const ask = async (text: string, retry = false) => {
    const q = text.trim();
    if (!q || loading) return;
    if (!retry) {
      setInput("");
      setMessages((m) => [...m, { role: "user", content: q }]);
    }
    setLastQuestion(q);
    setLoading(true);
    try {
      const res = await assistantApi.chat(q);
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
        { role: "assistant", content: formatApiError(e), failed: isServerError(e) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const send = () => ask(input);

  const charCount = input.length;
  const charWarn = charCount >= 900;

  return (
    <div className="dash-content dash-content--saas">
      <PageHeader
        title="Assistant"
        description="POST /assistant/chat — answers from your live verification data"
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
                  {SUGGESTED.map((q) => (
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
                  {m.role === "assistant" && (
                    <div className="chat-bubble-actions">
                      <CopyButton text={m.content} />
                      {m.failed && (
                        <button
                          type="button"
                          className="chat-copy-btn"
                          onClick={() => ask(lastQuestion, true)}
                          aria-label="Retry"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>
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
            className="chat-input-wrap"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <div className="chat-input-row">
              <input
                className="input-dark flex-1"
                placeholder="Ask about your documents…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={MAX_LEN}
              />
              <button
                type="submit"
                className="dash-btn dash-btn--primary"
                disabled={loading || !input.trim()}
              >
                <Send size={14} />
              </button>
            </div>
            <p className={`chat-char-count${charWarn ? " chat-char-count--warn" : ""}`}>
              {charCount}/{MAX_LEN}
            </p>
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
