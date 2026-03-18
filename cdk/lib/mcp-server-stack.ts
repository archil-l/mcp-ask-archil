import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Runtime, Architecture } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { EnvironmentConfig } from "../config/environments.js";

interface MCPServerStackProps extends cdk.StackProps {
  envConfig: EnvironmentConfig;
}

export class MCPServerStack extends cdk.Stack {
  public readonly functionUrl: lambda.FunctionUrl;

  constructor(scope: Construct, id: string, props: MCPServerStackProps) {
    super(scope, id, props);

    const { envConfig } = props;

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // Lambda function for MCP server
    const mcpServerFunction = new lambda.Function(this, "mcp-server-function", {
      functionName: `mcp-archil-io-${envConfig.stage}-mcp-server-function`,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../../dist/mcp-lambda"),
      ),
      handler: "handler",
      runtime: Runtime.NODEJS_24_X,
      memorySize: 1024,
      timeout: cdk.Duration.minutes(5), // Longer timeout for streaming responses
      architecture: Architecture.X86_64,
      environment: {
        NODE_ENV: "production",
      },
      logRetention: envConfig.logRetentionDays,
    });

    // Add Function URL with streaming enabled
    this.functionUrl = mcpServerFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM,
      invokeMode: lambda.InvokeMode.RESPONSE_STREAM,
      cors: {
        allowedOrigins: ["https://ask.archil.io", "http://localhost:5173"],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ["Content-Type", "Authorization"],
        allowCredentials: true,
      },
    });

    // Outputs
    new cdk.CfnOutput(this, "mcp-server-function-url", {
      description: "Lambda Function URL for MCP server",
      value: this.functionUrl.url,
    });

    new cdk.CfnOutput(this, "mcp-server-function-arn", {
      description: "MCP Server Lambda Function ARN",
      value: mcpServerFunction.functionArn,
    });
  }
}
