import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { useHealth } from "../context/HealthContext";
import { getContextualFollowUps } from "../utils/nimApi";

export default function AIChat() {
  const {
    chatMessages,
    sendChatMessage,
    documents,
    clearSession,
  } = useHealth();

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, typing]);

  async function handleSend(text) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setInput("");
    setTyping(true);
    setError("");

    try {
      await sendChatMessage(trimmed);
    } catch (err) {
      setError(err.message || "Failed to receive response from WellNest AI.");
    } finally {
      setTyping(false);
    }
  }

  // Dynamic quick prompts based on the patient's uploaded documents
  const dynamicPrompts = getContextualFollowUps(documents);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      {/* Chat Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo text-white">
            <Sparkles size={19} />
          </span>
          <div>
            <h1 className="font-display text-[19px] font-bold text-ink">WellNest AI</h1>
            <p className="flex items-center gap-1.5 text-[12.5px] text-meadow">
              <span className="h-1.5 w-1.5 rounded-full bg-meadow" />
              {documents.length > 0
                ? `Aware of ${documents.length} uploaded record${documents.length > 1 ? "s" : ""}`
                : "No documents uploaded yet"}
            </p>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex items-center gap-1 rounded-md bg-canvas px-2.5 py-1 text-[11.5px] font-medium text-slate border border-mist">
              <FileText size={13} /> Strictly answering from your records
            </span>
          </div>
        )}
      </div>

      {/* Notice Banner if No Documents */}
      {documents.length === 0 && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12.5px] text-amber-800">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>
            Tip: Upload a prescription, lab result, or discharge summary in the <strong>Documents</strong> tab so WellNest AI can answer questions directly from your health records in clear language.
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-mist bg-white p-4 shadow-panel scrollbar-thin sm:p-6">
        {chatMessages.map((m, i) => {
          const isAssistant = m.role === "assistant";
          const followUps =
            m.id === "msg-init" && documents.length > 0 && !m.followUps
              ? getContextualFollowUps(documents)
              : m.followUps;

          return (
            <div
              key={m.id ?? i}
              className={["flex", m.role === "user" ? "justify-end" : "justify-start"].join(" ")}
            >
              <div
                className={[
                  "max-w-[85%] rounded-xl px-4 py-3 text-[14px] leading-relaxed sm:max-w-[70%]",
                  m.role === "user"
                    ? "bg-indigo text-white shadow-sm"
                    : "border border-mist bg-canvas text-ink",
                ].join(" ")}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* Suggested follow-up questions */}
                {isAssistant && followUps && followUps.length > 0 && i === chatMessages.length - 1 && (
                  <div className="mt-3.5 border-t border-mist/80 pt-2.5">
                    <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wider text-slate-light">
                      Suggested follow-up questions
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {followUps.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(q)}
                          disabled={typing}
                          className="group flex items-center justify-between gap-2 rounded-lg border border-indigo/25 bg-white px-3 py-2 text-left text-[12.5px] font-medium text-indigo shadow-xs transition hover:border-indigo hover:bg-indigo-soft disabled:opacity-50"
                        >
                          <span>{q}</span>
                          <span className="text-slate-light group-hover:text-indigo">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl border border-mist bg-canvas px-4 py-3">
              <span className="text-[12.5px] text-slate">Checking your records</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-light"
                    style={{ animationDelay: `${d * 140}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-[12.5px] text-red-600">
          {error}
        </p>
      )}

      {/* Starter Quick Prompts - shown on fresh chat before first question */}
      {chatMessages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {dynamicPrompts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              disabled={typing}
              className="rounded-full border border-mist bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-slate transition-colors hover:border-indigo hover:text-indigo disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="mt-3 flex items-center gap-2 rounded-full border border-mist bg-white px-2 py-2 pl-4 shadow-panel"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            documents.length > 0
              ? "Ask a question about your uploaded records..."
              : "Upload documents to ask questions, or ask how WellNest works..."
          }
          className="flex-1 bg-transparent text-[14px] text-ink placeholder:text-slate-light focus:outline-none"
          disabled={typing}
        />
        <button
          type="submit"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo text-white transition-colors hover:bg-indigo-deep disabled:opacity-40"
          disabled={!input.trim() || typing}
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Footer Info */}
      <div className="mt-2 flex items-center justify-between px-2 text-[11.5px] text-slate-light">
        <span>
          Answers are strictly based on your uploaded records and explained in clear, simple language.
        </span>
        <button
          type="button"
          onClick={clearSession}
          className="flex items-center gap-1 hover:text-coral transition-colors"
          title="Reset current session records and chat"
        >
          <RefreshCw size={11} /> Reset session
        </button>
      </div>
    </div>
  );
}
