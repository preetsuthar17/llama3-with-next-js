import type { NextApiRequest, NextApiResponse } from "next";

async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:11434/api/version", {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(400).json({
      error: "Method not allowed. Only POST requests are accepted.",
    });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Message is required",
    });
  }

  // Check if Ollama is running
  const isOllamaRunning = await checkOllamaConnection();
  if (!isOllamaRunning) {
    return res.status(503).json({
      error:
        "Ollama service is not running. Please start Ollama and try again.",
    });
  }

  // Enable streaming
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: message,
        stream: true,
        model: "llama3",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(
        `Ollama returned status ${response.status}: ${await response.text()}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body reader not available");
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          res.write("data: [DONE]\n\n");
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.trim() === "") continue;

          try {
            const parsed = JSON.parse(line);
            // Only send the response field, not the entire parsed object
            if (parsed.response) {
              res.write(
                `data: ${JSON.stringify({ response: parsed.response })}\n\n`
              );
            }
          } catch (e) {
            console.error("Error parsing chunk:", line, e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in chat handler:", errorMessage);
    res.write(
      `data: ${JSON.stringify({
        error: `Failed to fetch from Ollama: ${errorMessage}`,
      })}\n\n`
    );
  } finally {
    res.end();
  }
}
