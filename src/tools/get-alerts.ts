import * as z from "zod/v4";
import {
  makeNWSRequest,
  formatAlert,
  NWS_API_BASE,
  type AlertsResponse,
} from "../utils/helpers.js";
import { defineTool } from "../types/types.js";

export const getAlertsTool = defineTool(
  "get-alerts",
  {
    title: "Get Weather Alerts",
    description: "Get weather alerts for a state",
    inputSchema: z.object({
      state: z
        .string()
        .length(2)
        .describe("Two-letter state code (e.g. CA, NY)"),
    }),
  },
  async ({ state }) => {
    const stateCode = state.toUpperCase();
    const alertsUrl = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    const alertsData = await makeNWSRequest<AlertsResponse>(alertsUrl);

    if (!alertsData) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Failed to retrieve alerts data",
          },
        ],
      };
    }

    const features = alertsData.features || [];

    if (features.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No active alerts for ${stateCode}`,
          },
        ],
      };
    }

    const formattedAlerts = features.map(formatAlert);

    return {
      content: [
        {
          type: "text" as const,
          text: `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`,
        },
      ],
    };
  },
);
