import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { ChatInterface } from "@/components/chat/ChatInterface";

const prisma = new PrismaClient();

export default async function DiscussionPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // Fetch the latest 100 messages
  const messages = await prisma.message.findMany({
    take: 100,
    orderBy: { createdAt: 'asc' },
    include: { author: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Discussion</h1>
          <p className="text-muted-foreground mt-2">Common chat for all project members, managers, and clients.</p>
        </div>
      </div>

      <ChatInterface messages={messages} currentUserId={session.user.id} />
    </div>
  );
}
