"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050816] text-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B6B] to-[#FF8A00]">
          !
        </div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">
          Neural Anomaly Detected
        </h1>
        <p className="text-text-muted">
          The learning engine encountered an unexpected fault. Our systems have been
          notified and will investigate the disruption.
        </p>
        <button
          onClick={reset}
          className="inline-block font-semibold px-8 py-3 rounded-xl text-sm transition-all hover:scale-105 cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
            color: "#050816",
            boxShadow: "0 0 25px rgba(0, 245, 212, 0.2)",
          }}
        >
          Reinitialize Connection
        </button>
      </div>
    </div>
  );
}
