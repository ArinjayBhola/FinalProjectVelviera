import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { authDataContext } from "../../context/AuthContext";

/**
 * StylistChat — "Velvi", the in-page AI stylist.
 * Fully local-powered. No external API calls. Session memory keyed per tab.
 */

const getSessionId = () => {
  let sid = sessionStorage.getItem("velviera_stylist_sid");
  if (!sid) {
    sid = `vs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("velviera_stylist_sid", sid);
  }
  return sid;
};

const INITIAL_MESSAGE = {
  role: "bot",
  message: "Hey, I'm Velvi. Tell me the occasion, vibe, or budget - I'll find picks.",
  suggestions: ["Wedding under ₹3k", "Streetwear hoodie", "Office shirt", "Full look"],
};

const StylistChat = () => {
  const { serverUrl } = useContext(authDataContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState({});
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || "").trim();
      if (!trimmed || loading) return;

      setMessages((prev) => [...prev, { role: "user", message: trimmed }]);
      setInput("");
      setLoading(true);

      try {
        const { data } = await axios.post(`${serverUrl}/api/stylist/chat`, {
          message: trimmed,
          sessionId: getSessionId(),
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            message: data.message,
            products: data.products || [],
            suggestions: data.suggestions || [],
          },
        ]);
        setSlots(data.slots || {});
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            message: "Couldn't process that. Try again?",
            suggestions: ["Show popular picks", "Reset"],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, serverUrl],
  );

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setSlots({});
    sendMessage("reset").catch(() => {});
  };

  const pills = (() => {
    const arr = [];
    if (slots.category) arr.push(slots.category);
    if (slots.subCategory) arr.push(slots.subCategory.replace(/([A-Z])/g, " $1").trim());
    if (slots.occasions?.[0]) arr.push(slots.occasions[0]);
    if (slots.styles?.[0]) arr.push(slots.styles[0]);
    if (slots.colors?.[0]) arr.push(slots.colors[0]);
    if (slots.budget?.max) arr.push(`≤ ₹${slots.budget.max}`);
    if (slots.sizes?.[0]) arr.push(`${slots.sizes[0]}`);
    return arr;
  })();

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-5 right-5 z-[60] group w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${open ? "rotate-90" : ""}`}
        aria-label={open ? "Close Velvi" : "Open Velvi stylist"}>
        {open ? (
          <svg
            className="w-5 h-5"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <>
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z" />
            </svg>
            {unread && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-pink-500" />
            )}
            <span className="absolute right-full mr-3 px-2.5 py-1 rounded-md bg-[var(--text-base)] text-[var(--background-base)] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Ask Velvi
            </span>
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-[5.5rem] right-5 z-[60] w-[calc(100vw-2.5rem)] sm:w-[360px] h-[540px] max-h-[calc(100vh-7rem)] bg-[var(--background-base)] rounded-2xl shadow-2xl border border-[var(--border-base)] flex flex-col overflow-hidden animate-[slideUp_.22s_ease-out]"
          style={{ animationFillMode: "both" }}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-[13px]">Velvi</div>
                <div className="text-[10px] opacity-90 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  online · AI stylist
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="text-[10px] px-2 py-1 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium transition"
                title="Reset conversation">
                Reset
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 rounded-md hover:bg-white/15 transition flex items-center justify-center"
                aria-label="Close">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Slot pills */}
          {pills.length > 0 && (
            <div className="px-3 py-1.5 border-b border-[var(--border-base)] bg-[var(--background-subtle)] flex flex-wrap gap-1 items-center">
              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mr-0.5">context</span>
              {pills.map((p, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25 font-medium">
                  {p}
                </span>
              ))}
            </div>
          )}

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-[var(--background-subtle)] scroll-smooth">
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                m={m}
                onSuggest={sendMessage}
              />
            ))}
            {loading && <TypingBubble />}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="px-3 py-2.5 border-t border-[var(--border-base)] bg-[var(--background-base)]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-base)] bg-[var(--background-subtle)] focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-400/20 transition">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent text-[13px] text-[var(--text-base)] placeholder:text-[var(--text-muted)] focus:outline-none"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition"
                aria-label="Send">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 17a1 1 0 01-1-1V6.414L5.707 9.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 6.414V16a1 1 0 01-1 1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

const TypingBubble = () => (
  <div className="flex justify-start">
    <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-[var(--background-base)] border border-[var(--border-base)] flex items-center gap-1">
      <span
        className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  </div>
);

const MessageBubble = ({ m, onSuggest }) => {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3 py-1.5 rounded-2xl rounded-br-sm bg-gradient-to-br from-purple-600 to-pink-500 text-white text-[13px] leading-snug shadow-sm">
          {m.message}
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] space-y-1.5">
        <div className="px-3 py-1.5 rounded-2xl rounded-bl-sm bg-[var(--background-base)] border border-[var(--border-base)] text-[13px] text-[var(--text-base)] leading-snug">
          {m.message}
        </div>
        {m.products?.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5">
            {m.products.map((p) => (
              <Link
                key={p._id}
                to={`/productdetail/${p._id}`}
                className="block bg-[var(--background-base)] rounded-lg border border-[var(--border-base)] overflow-hidden hover:shadow-md hover:border-purple-400/50 hover:-translate-y-0.5 transition-all group">
                <div className="aspect-square bg-[var(--background-subtle)] overflow-hidden relative">
                  {p.image1 && (
                    <img
                      src={p.image1}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {p.matchScore >= 80 && (
                    <span className="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-purple-600/90 backdrop-blur text-white font-semibold shadow-sm">
                      {p.matchScore}%
                    </span>
                  )}
                </div>
                <div className="px-2 py-1.5">
                  <div className="text-[11px] font-medium text-[var(--text-base)] line-clamp-1">{p.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">₹{p.price}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
        {m.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {m.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggest(s)}
                className="text-[11px] px-2 py-1 rounded-full bg-[var(--background-base)] border border-purple-400/30 text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 active:scale-95 transition">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StylistChat;
