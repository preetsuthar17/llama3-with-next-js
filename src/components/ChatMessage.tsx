import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: Message;
  isTyping?: boolean;
}

export default function ChatMessage({
  message,
  isTyping = false,
}: ChatMessageProps) {
  return (
    <div
      className={`p-4 rounded-lg ${
        message.role === "user"
          ? "bg-zinc-900 ml-auto max-w-[80%]"
          : "bg-zinc-950 mr-auto max-w-[80%]"
      }`}
    >
      <div
        className={`${
          message.content.split("\n").length > 2
            ? "items-start"
            : "items-center"
        } flex`}
      >
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === "user" ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <span className="text-white text-sm">
              {message.role === "user" ? "U" : "A"}
            </span>
          </div>
        </div>
        <div className="ml-3">
          <p className="text-gray-200 whitespace-pre-wrap leading-normal">
            {message.role === "user" ? (
              message.content
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
            {isTyping && (
              <span className="inline-flex items-center">
                <span className="animate-bounce delay-0">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
