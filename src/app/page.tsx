"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [toggle, setToggle] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
  // Fetch current toggle on mount
  const fetchCurrent = async () => {
    try {
      const res = await fetch("/api/toggle/current", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch current toggle");
      const data = await res.json();
      setToggle(data.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchCurrent();

  // Subscribe to SSE
  const eventSource = new EventSource("/api/toggle/stream");
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      setToggle(data.value);
    } catch (err) {
      console.error("Failed to parse SSE event:", err);
    }
  };

  // Refresh toggle when tab becomes active
  const handleFocus = () => {
    fetchCurrent();
  };
  window.addEventListener("focus", handleFocus);

  return () => {
    eventSource.close();
    window.removeEventListener("focus", handleFocus);
  };
}, []);


  const updateToggle = async (newValue: boolean) => {
    try {
      setUpdating(true);
      const res = await fetch("/api/toggle/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });
      if (!res.ok) throw new Error("Failed to update toggle");
      // Optimistically update state (SSE will sync anyway)
      setToggle(newValue);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading toggle status...</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-lg">Switch the switch for everyone!</h1>
        <h2 className="text-base">Are you team green or red?</h2>
      </div>
      <h1 className="text-2xl font-bold">Toggle Status</h1>

      <p
        className={`px-4 py-2 rounded-lg text-white ${toggle ? "bg-green-500" : "bg-red-500"
          }`}
      >
        {toggle ? "Enabled" : "Disabled"}
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => updateToggle(true)}
          disabled={updating}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Enable
        </button>
        <button
          onClick={() => updateToggle(false)}
          disabled={updating}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          Disable
        </button>
      </div>
    </main>
  );
}
