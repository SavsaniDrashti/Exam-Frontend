import { useState, useEffect, useRef } from "react";
import { getGeminiResponse } from "../api/hfApi"; // Your existing API helper
import { FaRobot, FaPaperPlane, FaTimes, FaMagic, FaGripLines } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AiChat({ onClose, onUseText }) {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm your Midnight Assistant. Need help drafting a question?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Drag states
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: 150 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const chatEndRef = useRef(null);

  // Theme Constants
  const colors = {
    card: "#1e293b",
    bg: "#0f172a",
    primary: "#818cf8",
    userBubble: "#334155",
    aiBubble: "rgba(129, 140, 248, 0.12)",
    border: "rgba(255, 255, 255, 0.08)",
    textMain: "#f8fafc",
    textMuted: "#94a3b8"
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userQuery = input;
    setMessages((prev) => [...prev, { sender: "user", text: userQuery }]);
    setInput("");
    setLoading(true);

    try {
      const data = await getGeminiResponse(userQuery);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data?.text || "I couldn't generate a response. Please try again.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "ai", text: "⚠️ Connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Drag handlers
  const onMouseDown = (e) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const onMouseUp = () => setDragging(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging]);

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 10000,
        width: "380px",
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
      }}
      className="rounded-4 overflow-hidden"
    >
      <style>{`
        .custom-chat-scroll::-webkit-scrollbar { width: 5px; }
        .custom-chat-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .ai-input::placeholder { color: ${colors.textMuted}; opacity: 0.5; }
      `}</style>

      {/* Header (Drag Area) */}
      <div
        onMouseDown={onMouseDown}
        className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-25"
        style={{ cursor: dragging ? "grabbing" : "grab", background: "rgba(0,0,0,0.2)" }}
      >
        <div className="d-flex align-items-center gap-2 text-white">
          <FaGripLines className="text-muted me-1" />
          <FaRobot className="text-primary" />
          <strong className="small text-uppercase tracking-wider">AI Question Assistant</strong>
        </div>
        <button className="btn btn-sm text-muted p-0" onClick={onClose}>
          <FaTimes size={18} />
        </button>
      </div>

      {/* Chat Body */}
      <div style={{ height: "450px", display: "flex", flexDirection: "column" }}>
        <div className="flex-grow-1 p-3 overflow-auto custom-chat-scroll" style={{ backgroundColor: "transparent" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 d-flex flex-column ${
                msg.sender === "user" ? "align-items-end" : "align-items-start"
              }`}
            >
              <div
                className="px-3 py-2 shadow-sm"
                style={{
                  maxWidth: "85%",
                  fontSize: "0.85rem",
                  lineHeight: "1.4",
                  borderRadius: msg.sender === "user" ? "15px 15px 2px 15px" : "15px 15px 15px 2px",
                  backgroundColor: msg.sender === "user" ? colors.userBubble : colors.aiBubble,
                  color: colors.textMain,
                  border: msg.sender === "ai" ? `1px solid ${colors.primary}33` : "none",
                }}
              >
                {msg.text}

                {/* "Use This" Button for AI Responses */}
                {msg.sender === "ai" && i !== 0 && (
                  <div className="mt-2 pt-2 border-top border-white border-opacity-10">
                    <button 
                      onClick={() => onUseText(msg.text)}
                      className="btn btn-sm p-0 text-primary fw-bold d-flex align-items-center gap-1"
                      style={{ fontSize: '0.7rem' }}
                    >
                      <FaMagic size={10} /> INSERT INTO EXAM
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-muted small italic ps-2 animate-pulse">
              AI is writing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border-top border-secondary border-opacity-25" style={{ background: "rgba(0,0,0,0.1)" }}>
          <div className="input-group">
            <input
              className="form-control ai-input border-0 shadow-none text-white"
              style={{ backgroundColor: colors.bg, fontSize: '0.85rem', borderRadius: '10px 0 0 10px' }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask for a question topic..."
            />
            <button 
              className="btn btn-primary px-3" 
              onClick={handleSend}
              disabled={loading}
              style={{ borderRadius: '0 10px 10px 0' }}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}