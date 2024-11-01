import { useState, useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<
    "checking" | "running" | "not-running"
  >("checking");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const checkOllama = async () => {
      try {
        const response = await fetch("http://localhost:11434/api/version");
        if (response.ok) {
          setOllamaStatus("running");
        } else {
          setOllamaStatus("not-running");
        }
      } catch (error) {
        console.error("Failed to check Ollama status:", error);
        setOllamaStatus("not-running");
      }
    };

    checkOllama();
  }, []);

  const handleSendMessage = async (message: string) => {
    if (ollamaStatus !== "running") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Error: Ollama is not running. Please start Ollama and refresh the page.",
        },
      ]);
      return;
    }

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error("No response body available");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Add initial assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        let accumulatedResponse = ""; // Initialize once outside the loop

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.trim() === "" || line.includes("[DONE]")) continue;

            try {
              const parsed = JSON.parse(line.replace("data: ", ""));

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.response) {
                accumulatedResponse += parsed.response;

                // Update the last assistant message with accumulated response
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === "assistant") {
                    lastMessage.content = accumulatedResponse; // Update only with new content
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
              throw e;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${
            error instanceof Error ? error.message : "Failed to get response"
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen justify-center items-center flex flex-row bg-zinc-950 p-4">
      <div className="w-[80%] relative">
        <div className=" text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Ollama Chat</h1>

          {ollamaStatus === "checking" && (
            <div className="text-center mb-4">Checking Ollama status...</div>
          )}

          {ollamaStatus === "not-running" && (
            <div className="text-center text-red-600 mb-4">
              Warning: Ollama is not running. Please start Ollama with the
              llama3 model:
              <pre className="mt-2 bg-gray-100 p-2 rounded">
                ollama run llama3
              </pre>
            </div>
          )}

          <div className="space-y-4 mb-4 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            disabled={ollamaStatus !== "running"}
          />
        </div>
      </div>
    </div>
  );
}
