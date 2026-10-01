"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/app/actions";
import { Send } from "lucide-react";

export function ChatInterface({ messages, currentUserId }: { messages: any[], currentUserId: string }) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(formData: FormData) {
    setIsSending(true);
    await sendMessage(formData);
    // Form will reset because it's uncontrolled, but just to be safe we could reset it if we had a ref
    const form = document.getElementById("chat-form") as HTMLFormElement;
    if (form) form.reset();
    setIsSending(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-slate-50 border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-slate-300" />
            </div>
            No messages yet. Start the discussion!
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.authorId === currentUserId;
            return (
              <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                    <span className="text-xs font-semibold text-indigo-700 uppercase">
                      {msg.author.name?.[0] || '?'}
                    </span>
                  </div>
                </div>
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-xs font-medium text-slate-700">{isMe ? "You" : msg.author.name}</span>
                    <span className="text-[10px] text-slate-400" suppressHydrationWarning>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <form id="chat-form" action={handleSubmit} className="flex gap-2">
          <Textarea 
            name="content" 
            placeholder="Type your message..." 
            className="min-h-[40px] h-[40px] max-h-[120px] resize-y py-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form) form.requestSubmit();
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isSending}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
