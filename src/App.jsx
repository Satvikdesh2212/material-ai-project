import { useState, useEffect, useRef } from "react";

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! Ask me about materials science.", sender: "bot" }
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMessage = { text: userText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: userText })
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { text: data.reply, sender: "bot" }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to AI server.", sender: "bot" }
      ]);
    }

    setIsTyping(false);
  };

  return (
    <div className="h-screen bg-gray-950 text-white flex">

      <div className="w-64 bg-gray-900 border-r border-gray-800 p-4">
        <h2 className="text-xl font-semibold">Material AI</h2>
      </div>

      <div className="flex-1 flex flex-col">

        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-lg ${
                  msg.sender === "user"
                    ? "bg-blue-600"
                    : "bg-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="text-gray-400 italic">
              Material AI is thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-gray-800 rounded-lg px-4 py-2"
            placeholder="Ask about materials science..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;