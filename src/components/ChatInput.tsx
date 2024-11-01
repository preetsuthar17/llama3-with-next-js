import { useState } from "react";
import { Input } from "@/components/hexta-ui/Input";
import { Button } from "./hexta-ui/Button";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  isLoading,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSend(input);
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex space-x-2 fixed w-[80%] left-1/2 top-[90%] -translate-x-1/2"
    >
      <Input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          disabled ? "Ollama is not running..." : "Type your message..."
        }
        disabled={isLoading || disabled}
        className="flex-1 py-4 px-4 text-white placeholder-gray-500"
      />

      <Button disabled={isLoading || disabled} type="submit" variant="primary">
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </form>
  );
}
