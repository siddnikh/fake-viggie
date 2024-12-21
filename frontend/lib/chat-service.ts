import { Student } from "./api-service";

export interface ChatResponse {
  text: string;
  action?: {
    type: "fillForm";
    fields: Partial<Student>;
  };
}

export class ChatService {
  private async sendToBackend(message: string): Promise<ChatResponse> {
    const response = await fetch("http://localhost:8080/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to get chat response");
    }

    return response.json();
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    return this.sendToBackend(message);
  }
}

export const chatService = new ChatService();
