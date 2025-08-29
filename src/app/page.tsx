"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [toggle, setToggle] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentImage, setCurrentImage] = useState("/ed.jpeg"); // initial image

  useEffect(() => {
  let eventSource: EventSource | null = null;

  const fetchCurrent = async () => {
    try {
      const res = await fetch("/api/toggle/current", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch current toggle");
      const data = await res.json();
      setToggle(data.value);
      setCurrentImage(data.value ? "/noami.jpeg" : "/ed.jpeg");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  fetchCurrent();

  // Setup SSE with auto-reconnect
  const initEventSource = () => {
    eventSource = new EventSource("/api/toggle/stream");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setToggle(data.value);
        setCurrentImage(data.value ? "/noami.jpeg" : "/ed.jpeg");
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("SSE connection lost, retrying in 3s...");
      eventSource?.close();
      setTimeout(initEventSource, 3000);
    };
  };

  initEventSource();

  // Refetch when window regains focus
  const handleFocus = () => fetchCurrent();
  window.addEventListener("focus", handleFocus);

  return () => {
    eventSource?.close();
    window.removeEventListener("focus", handleFocus);
  };
}, []);

  const updateToggle = async (newValue: boolean) => {
    try {
      setUpdating(true);

      // start rotation
      setRotation((prev) => prev + 180);

      // swap image halfway (after 350ms if total duration is 700ms)
      setTimeout(() => {
        setCurrentImage(newValue ? "/noami.jpeg" : "/ed.jpeg");
        setToggle(newValue);
      }, 350); // half of duration

      const res = await fetch("/api/toggle/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: newValue }),
      });
      if (!res.ok) throw new Error("Failed to update toggle");
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading puff status...</p>;
  }

  return (
    <main
      className={`flex flex-col items-center justify-center min-h-screen gap-6`}
    >
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">
          Your turn {toggle ? "Noami" : "Ed"}! 🫵
        </h1>
      </div>

      <div
        className="transition-transform duration-1000 ease-in-out"
        style={{
          transform: `rotateY(${rotation}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        <Image
          src={currentImage}
          alt="img"
          width={300}
          height={300}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => updateToggle(!toggle?.valueOf())}
          disabled={updating}
          className={`px-4 py-2 text-white font-bold rounded-lg disabled:opacity-50 ${
            toggle
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-pink-500 hover:bg-pink-700"
          }`}
        >
          Poke {toggle ? "Ed" : "Noami"} 👉
        </button>
      </div>
    </main>
  );
}
