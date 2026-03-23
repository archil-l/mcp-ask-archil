import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Runtime, Architecture } from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path";
import { fileURLToPath } from "url";
import type { EnvironmentConfig } from "../config/environments.js";

interface MCPServerStackProps extends cdk.StackProps {
  envConfig: EnvironmentConfig;
  resumeBucket: s3.IBucket;
}

export class MCPServerStack extends cdk.Stack {
  public readonly functionUrl: lambda.FunctionUrl;

  constructor(scope: Construct, id: string, props: MCPServerStackProps) {
    super(scope, id, props);

    const { envConfig, resumeBucket } = props;

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // Lambda function for MCP server
    const mcpServerFunction = new lambda.Function(this, "mcp-server-function", {
      functionName: `mcp-archil-io-${envConfig.stage}-mcp-server-function`,
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../../dist/mcp-lambda"),
      ),
      handler: "index.handler",
      runtime: Runtime.NODEJS_24_X,
      memorySize: 1024,
      timeout: cdk.Duration.minutes(5), // Longer timeout for streaming responses
      architecture: Architecture.X86_64,
      environment: {
        NODE_ENV: "production",
        RESUME_BUCKET_NAME: resumeBucket.bucketName,
        RESUME_PDF_KEY: "archil-l-resume.pdf",
      },
      logRetention: envConfig.logRetentionDays,
    });

    // Grant Lambda read access to the resume bucket
    resumeBucket.grantRead(mcpServerFunction);

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

    // Create client access role for cross-account/cross-service invocation
    const clientAccessRole = new iam.Role(
      this,
      "mcp-server-client-access-role",
      {
        roleName: `mcp-server-client-access-role-${envConfig.stage}`,
        assumedBy: new iam.AccountPrincipal(envConfig.accountId),
        description:
          "Role for services to invoke the MCP server Lambda function",
      },
    );

    // Grant the client access role permission to invoke the MCP server function
    mcpServerFunction.grantInvoke(clientAccessRole);

    // Outputs
    new cdk.CfnOutput(this, "mcp-server-function-url", {
      description: "Lambda Function URL for MCP server",
      value: this.functionUrl.url,
    });

    new cdk.CfnOutput(this, "mcp-server-function-arn", {
      description: "MCP Server Lambda Function ARN",
      value: mcpServerFunction.functionArn,
    });

    new cdk.CfnOutput(this, "client-access-role-arn", {
      description:
        "Client Access Role ARN for invoking the MCP server function",
      value: clientAccessRole.roleArn,
      exportName: `mcp-server-client-access-role-arn-${envConfig.stage}`,
    });
  }
}
