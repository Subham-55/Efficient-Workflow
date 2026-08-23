"use client";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-board-bg">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#d4a24c 1px, transparent 1px)", backgroundSize: "24px 24px" }}/>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-copper/10 border border-copper/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
              <span className="text-xs font-mono text-copper uppercase tracking-wider">AI-Powered Workflow Migration</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-ink tracking-tight leading-[1.1] mb-6">
              AdaptFlow finds broken workflows and <span className="text-copper">rewires</span> them into AI automations.
            </h1>
            <p className="text-lg text-silver max-w-2xl mx-auto mb-8 leading-relaxed">
              Not just recommendations — actual, runnable AI-agent replacements for your slow, manual operational workflows.
            </p>            <a
              href="/workspace/new"
              style={{
                display: "inline-block",
                padding: "20px 40px",
                backgroundColor: "#D4A24C",
                color: "#0F1A14",
                fontWeight: "bold",
                fontSize: "20px",
                borderRadius: "8px",
                textDecoration: "none",
                cursor: "pointer",
                border: "4px solid red",
              }}
            >
              Try a Live Workflow
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-border/30 bg-board-panel/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["CrewAI", "LangGraph", "Groq"].map((tech) => (
              <span key={tech} className="px-3 py-1.5 bg-board-panel-raised border border-border/50 rounded-pill text-xs font-mono text-silver">
                {tech}
              </span>
            ))}
          </div>
          <p className="text-xs text-silver mt-4">Powered by CrewAI agents, LangGraph orchestration, and Groq inference</p>
        </div>
      </section>
    </div>
  );
}
