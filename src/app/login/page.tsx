"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      userId,
      password,
      redirect: false,
    });
    
    if (res?.error) {
      setError("Invalid User ID or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Project Tracker Login</h1>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID (Name)</label>
            <input 
              type="text" 
              required
              className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. gaurav"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
        
        <div className="mt-6 border-t pt-4 text-xs text-gray-500">
          <p>Admin: admin / admin123</p>
          <p>Manager: om mehta / om123</p>
          <p>Developer: gaurav / gaurav123</p>
          <p>Developer: saloni jain / saloni123</p>
          <p>Client: client / client123</p>
        </div>
      </div>
    </div>
  );
}
