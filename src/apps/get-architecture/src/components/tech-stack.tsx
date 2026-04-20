import { C, ANIMATION_CSS } from "../shared/colors";

import claudeSvg from "../resources/claude-logo.svg";
import mcpSvg from "../resources/mcp.svg";
import reactSvg from "../resources/react-svgrepo-com.svg";
import remixSvg from "../resources/remix-glowing.svg";
import lambdaSvg from "../resources/aws-lambda-svgrepo-com.svg";
import cdkPng from "../resources/cdk-logo6-1260x476.png";
import tsSvg from "../resources/Typescript_logo_2020.svg";

import cloudfrontSvg from "../resources/architecture-service-icons/Arch_Networking-Content-Delivery/64/Arch_Amazon-CloudFront_64.svg";
import s3Svg from "../resources/architecture-service-icons/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg";

const IMG_SIZE = 16;
const img = (src: string) => (
  <img src={src} alt="" width={IMG_SIZE} height={IMG_SIZE} style={{ display: "block", objectFit: "contain" }} />
);


type TechItem = { label: string; icon: React.ReactNode };

const TECH: TechItem[] = [
  { label: "React 19",       icon: img(reactSvg) },
  { label: "React Router 7", icon: <img src={remixSvg} alt="" height={IMG_SIZE} style={{ display: "block", objectFit: "contain", width: "auto", maxWidth: 52 }} /> },
  { label: "Anthropic SDK",  icon: img(claudeSvg) },
  { label: "MCP SDK",        icon: img(mcpSvg) },
  { label: "AWS Lambda",     icon: img(lambdaSvg) },
  { label: "CloudFront",     icon: img(cloudfrontSvg) },
  { label: "S3",             icon: img(s3Svg) },
  { label: "TypeScript",     icon: img(tsSvg) },
];

export function TechStack() {
  return (
    <section>
      <style>{ANIMATION_CSS}</style>
      <h2 className="text-base font-semibold mb-3" style={{ color: C.fg }}>
        Tech Stack
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {TECH.map(({ label, icon }, i) => (
          <span
            key={label}
            className="fade-in inline-flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-full border"
            style={{
              borderColor: C.border,
              color: C.fg,
              background: C.bgCanvas,
              animationDelay: `${i * 60}ms`,
            }}
          >
            {icon}
            {label}
          </span>
        ))}
        <span className="fade-in inline-flex items-center gap-1.5 text-sm ml-4 mt-2" style={{ color: C.fgMuted, animationDelay: `${TECH.length * 60}ms` }}>
          <img src={cdkPng} alt="AWS CDK" height={28} style={{ display: "block", objectFit: "contain", width: "auto", maxWidth: 200 }} />
        </span>
      </div>
    </section>
  );
}
