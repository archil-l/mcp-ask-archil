import type { App } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/globals.css";

import { C, ANIMATION_CSS } from "./shared/colors";
import newNavigationGif from "./resources/new-navigation.gif";
import summaryReportWebp from "./resources/summary-report.webp";
import formsImg from "./resources/forms.png";
import calendarsImg from "./resources/calendars.png";

const AMAZON_ROBOTICS_IMG =
  "https://assets.aboutamazon.com/dims4/default/c90ddd3/2147483647/strip/true/crop/1600x900+0+0/resize/1320x743!/quality/90/?url=https%3A%2F%2Famazon-blogs-brightspot.s3.amazonaws.com%2Ff8%2F1b%2F29a9dcae4fe489b02d520132c0b6%2Fabout-amazon-inline-inline008-amazon-deliveringthefuture-robotics-amazon-mqy1-091124-ls-225-copy-6458x3632.jpg";

type WorkFeature = {
  title: string;
  releaseNotesUrl: string;
  image: string;
  imageAlt: string;
  bullets: string[];
};

const QUICKBASE_FEATURES: WorkFeature[] = [
  {
    title: "Quickbase's Navigation",
    releaseNotesUrl:
      "https://helpv2.quickbase.com/hc/en-us/articles/30212936236948-Quickbase-September-2024-Release-Notes#h_01J7BD3PQ33X5HVGPX3SEJSCM8",
    image: newNavigationGif,
    imageAlt: "New Navigation",
    bullets: [
      "Implemented accessibility features (semantic HTML, roles, keyboard navigation and screen-reader performance), ensured WCAG 2.1 compliance for a new navigation UI and its components, enhancing user experience and performance",
      "Built components and implemented interactions for the new Reports Panel",
    ],
  },
  {
    title: "Quickbase's Summary Report",
    releaseNotesUrl:
      "https://helpv2.quickbase.com/hc/en-us/articles/23804944584468-Quickbase-February-2024-Release-Notes#h_01HPT7ASHWVSMB064ADPVMTR80",
    image: summaryReportWebp,
    imageAlt: "New Summary Report",
    bullets: [
      "Led a team of four software engineering co-ops (Master's students from Northeastern University) for six months (Jan–Jun '24) to complete summary report",
      "Mentored and assisted co-ops throughout their learning experience",
      "Worked on spikes and built prototypes for new features, breaking down larger problems into smaller, manageable pieces",
      "Performed accessibility testing and implemented semantic HTML, roles, keyboard navigation and improved screen-reader performance",
    ],
  },
  {
    title: "Quickbase's Forms Experience",
    releaseNotesUrl:
      "https://helpv2.quickbase.com/hc/en-us/articles/16259648646292-Quickbase-June-2023-release-notes#h_01GAH1YHWP30JQ63J1ZCZ74YCN",
    image: formsImg,
    imageAlt: "New Forms Experience",
    bullets: [
      "Built and improved 10+ field components for the new forms — numbers, decimals, strings, dates, users, and file attachments",
      "Developed reusable components across several internal libraries",
      "Improved backend APIs (using C++ & Java) to support new field components",
      "Performed accessibility testing and improved screen-reader performance",
    ],
  },
  {
    title: "Quickbase's Calendar Dashboard Widget",
    releaseNotesUrl:
      "https://helpv2.quickbase.com/hc/en-us/articles/4418012983828-Quickbase-January-2022-Release-Notes",
    image: calendarsImg,
    imageAlt: "New Dashboard Widget",
    bullets: [
      "Built the calendar component and improved behavior under different use-cases (timezones, updates)",
      "Improved backend APIs (using C++ and Java) to support the new component",
      "Implemented unit and integration tests using Jest and TestNG (with Java) for all new capabilities",
    ],
  },
];

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: C.primary, textDecoration: "none" }}
      className="hover:underline"
    >
      {children}
    </a>
  );
}

function FeatureCard({ feature }: { feature: WorkFeature }) {
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: C.border, background: C.bgMuted }}
    >
      <div className="overflow-hidden" style={{ maxHeight: 260 }}>
        <img
          src={feature.image}
          alt={feature.imageAlt}
          className="w-full object-cover object-top"
          style={{ display: "block" }}
        />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-semibold" style={{ color: C.fg }}>
            {feature.title}
          </h3>
          <ExternalLink href={feature.releaseNotesUrl}>
            <span
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{ borderColor: C.border, color: C.fgMuted, background: C.bg }}
            >
              Release Notes ↗
            </span>
          </ExternalLink>
        </div>
        <ul className="space-y-1.5">
          {feature.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: C.fgMuted }}>
              <span style={{ color: C.primary, flexShrink: 0 }}>•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WorkExperienceInner({ app }: { app: App }) {
  useHostStyles(app, app.getHostContext());

  return (
    <main
      className="w-full overflow-y-auto p-4 space-y-6"
      style={{ background: C.bg }}
    >
      <style>{ANIMATION_CSS}</style>

      {/* Amazon Robotics */}
      <section className="fade-in space-y-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold" style={{ color: C.fg }}>
            Work 👨🏻‍💻
          </h1>
        </div>

        <div
          className="rounded-xl overflow-hidden border"
          style={{ borderColor: C.border }}
        >
          <img
            src={AMAZON_ROBOTICS_IMG}
            alt="Sortation at Amazon Robotics"
            className="w-full object-cover"
            style={{ maxHeight: 220, display: "block" }}
          />
        </div>

        <p className="text-sm leading-relaxed" style={{ color: C.fgMuted }}>
          I'm <strong style={{ color: C.fg }}>Frontend Engineer II</strong> on the 📦 Sortation Insights team at{" "}
          <ExternalLink href="https://www.aboutamazon.com/news/operations/amazon-robotics-robots-fulfillment-center">
            Amazon Robotics
          </ExternalLink>
          . My work spans two main areas — dashboard tooling and agentic infrastructure for robotic fleet management.
        </p>

        <div className="space-y-2">
          <div
            className="rounded-lg p-3 space-y-1.5 border"
            style={{ borderColor: C.border, background: C.bgMuted }}
          >
            <p className="text-xs font-medium" style={{ color: C.fg }}>
              Agentic Systems
            </p>
            <p className="text-xs leading-relaxed" style={{ color: C.fgMuted }}>
              Building proactive management systems using agents, MCP servers, knowledge bases, and memory.
              Alarm events trigger multistep workflows across fully automated and human-in-the-loop scenarios.
              Shipped and iterated across AWS Bedrock, AgentCore, and Strands. Also built a full-stack agentic
              web app with multi-party conversational UX using React Router v7 (Remix) and React 19.
            </p>
          </div>
          <div
            className="rounded-lg p-3 space-y-1.5 border"
            style={{ borderColor: C.border, background: C.bgMuted }}
          >
            <p className="text-xs font-medium" style={{ color: C.fg }}>
              Dashboard Tooling
            </p>
            <p className="text-xs leading-relaxed" style={{ color: C.fgMuted }}>
              Rearchitected a web solution from 15+ seconds load time down to 2s. Introduced feature flags,
              integration and e2e tests to move from bi-weekly releases to full CI/CD. Set up real-time
              CloudWatch dashboards to track load times and errors across all endpoints.
            </p>
          </div>
        </div>
      </section>

      <hr style={{ borderColor: C.border }} />

      {/* Quickbase */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold" style={{ color: C.fg }}>
            Previously at{" "}
            <ExternalLink href="https://www.quickbase.com">Quickbase</ExternalLink>
          </h2>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: C.fgMuted }}>
            Joined as a Software Engineering Co-op and advanced to Software Engineer II. Spent most of my time
            on a UI infrastructure team — building new features, reusable components, and contributing to
            Quickbase's design system library. Also did significant work on web accessibility testing and
            improvements, both within my own projects and in collaboration with other teams.
          </p>
        </div>

        <div className="space-y-4">
          {QUICKBASE_FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>
    </main>
  );
}

function WorkExperienceApp() {
  const [isReady, setIsReady] = useState(false);

  const { app, error: connectionError } = useApp({
    appInfo: { name: "Work Experience", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => ({});
      app.ontoolinput = async () => {
        setIsReady(false);
      };
      app.ontoolresult = async () => {
        setIsReady(true);
      };
      app.ontoolcancelled = () => {
        setIsReady(true);
      };
      app.onerror = () => {
        setIsReady(true);
      };
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
        <p className="text-sm" style={{ color: C.fgMuted }}>
          Connecting…
        </p>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex h-full items-center justify-center p-5">
        <p className="text-sm" style={{ color: C.fgMuted }}>
          Loading…
        </p>
      </div>
    );
  }

  return <WorkExperienceInner app={app} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WorkExperienceApp />
  </StrictMode>,
);
