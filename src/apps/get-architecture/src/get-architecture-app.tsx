import type { App } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";

import { C, ANIMATION_CSS } from "./shared/colors";
import { OverviewSection } from "./components/overview-section";
import { DataFlowSection } from "./components/data-flow-section";
import { GuestAuthSection } from "./components/guest-auth-section";
import { McpAppsSection } from "./components/mcp-apps-section";
import { TechStack } from "./components/tech-stack";

function ArchitectureViewerInner({ app }: { app: App }) {
  useHostStyles(app, app.getHostContext());

  return (
    <main className="w-full overflow-y-auto p-4 space-y-6" style={{ background: C.bg }}>
      <style>{ANIMATION_CSS}</style>
      <div className="fade-in space-y-3">
        <h1 className="text-lg font-bold" style={{ color: C.fg }}>How ask.archil.io Is Built</h1>
        <p className="text-sm leading-relaxed" style={{ color: C.fgMuted }}>
          ask.archil.io is Archil's personal website — a chat interface where visitors can ask
          anything about his work, experience, or background. Instead of a static page, every
          response comes from a real{" "}
          <span style={{ color: C.accent, fontWeight: 600 }}>Claude Haiku 4.5</span> instance that
          streams answers in real time and uses tools to do things dynamically: display his resume,
          toggle the page theme, or render interactive diagrams like this one.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: C.fgMuted }}>
          Under the hood, two serverless{" "}
          <span style={{ color: C.orange, fontWeight: 600 }}>AWS Lambda</span> functions power the
          site — one for SSR and APIs, one dedicated to LLM streaming. A separate{" "}
          <span style={{ color: C.green, fontWeight: 600 }}>MCP server</span> (also a Lambda) gives
          Claude its extended capabilities via the Model Context Protocol. Guests get a short-lived{" "}
          <span style={{ color: C.primary, fontWeight: 600 }}>JWT</span> automatically on page load
          so the stream endpoint stays protected without any login.
        </p>
        <div className="flex gap-3 pt-1">
          {[
            { href: "https://github.com/archil-l/ask-archil-io", label: "ask-archil-io" },
            { href: "https://github.com/archil-l/mcp-ask-archil", label: "mcp-ask-archil" },
          ].map(({ href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-opacity hover:opacity-70"
              style={{ borderColor: C.border, color: C.fg, background: C.bgMuted, textDecoration: "none" }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {label}
            </a>
          ))}
        </div>
      </div>

      <OverviewSection />
      <DataFlowSection />
      <GuestAuthSection />
      <McpAppsSection />
      <TechStack />
    </main>
  );
}

function ArchitectureApp() {
  const [isReady, setIsReady] = useState(false);

  const { app, error: connectionError } = useApp({
    appInfo: { name: "Architecture Viewer", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => ({});
      app.ontoolinput = async () => { setIsReady(false); };
      app.ontoolresult = async () => { setIsReady(true); };
      app.ontoolcancelled = () => { setIsReady(true); };
      app.onerror = () => { setIsReady(true); };
    },
  });

  useEffect(() => {
    if (app) setIsReady(true);
  }, [app]);

  if (connectionError) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-destructive text-sm">
          <strong>Connection Error:</strong> {connectionError.message}
        </p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-sm" style={{ color: C.fgMuted }}>Connecting…</p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-sm" style={{ color: C.fgMuted }}>Loading…</p>
      </div>
    );
  }

  return <ArchitectureViewerInner app={app} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ArchitectureApp />
  </StrictMode>,
);
