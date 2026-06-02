import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050816] text-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-[#00F5D4] to-[#38BDF8]">
          404
        </div>
        <h1 className="text-2xl font-display font-semibold text-text-primary">
          Neural Link Broken
        </h1>
        <p className="text-text-muted">
          This synapse doesn&apos;t exist in our knowledge graph. The page may have been
          relocated or erased from the neural network.
        </p>
        <Link
          href="/"
          className="inline-block font-semibold px-8 py-3 rounded-xl text-sm transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #00F5D4, #38BDF8)",
            color: "#050816",
            boxShadow: "0 0 25px rgba(0, 245, 212, 0.2)",
          }}
        >
          Return to Hub
        </Link>
      </div>
    </div>
  );
}
