import * as z from "zod/v4";
import { defineTool } from "../types/types.js";

export const addNumbersTool = defineTool(
  "add-numbers",
  {
    title: "Add two numbers",
    description: "Sums two numbers and returns result",
    inputSchema: z.object({
      a: z.number().optional().default(0).describe("first number"),
      b: z.number().optional().default(0).describe("Second number to add"),
    }),
  },
  ({ a, b }) => {
    console.log("Calling add tool");

    const sum = Number(a) + Number(b);

    return {
      content: [
        {
          type: "text" as const,
          text: `Sum of ${a} and ${b} is ${sum}`,
        },
      ],
    };
  },
);
