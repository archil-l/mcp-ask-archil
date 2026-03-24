#!/usr/bin/env node
import "source-map-support/register.js";
import * as cdk from "aws-cdk-lib";
import { GitHubOidcStack } from "./lib/github-oidc-stack.js";
import { SubdomainStack } from "./lib/subdomain-stack.js";
import { MCPServerStack } from "./lib/mcp-server-stack.js";
import { ResumeBucketStack } from "./lib/mcp-ask-archil-bucket-stack.js";
import { getEnvironmentConfig, Stage } from "./config/environments.js";

const GITHUB_ORG = "archil-l";
const GITHUB_REPO = "mcp-ask-archil";

const app = new cdk.App();

// Get environment-specific configuration
const envConfig = getEnvironmentConfig(Stage.prod);

console.log(
  `Deploying to ${envConfig.stage} environment (Account: ${envConfig.accountId}, Region: ${envConfig.region})`,
);

// OIDC Stack - for GitHub Actions authentication
new GitHubOidcStack(
  app,
  `${envConfig.prefix}-archil-io-github-oidc-${envConfig.stage}`,
  {
    envConfig,
    githubOrg: GITHUB_ORG,
    githubRepo: GITHUB_REPO,
    env: {
      account: envConfig.accountId,
      region: envConfig.region,
    },
  },
);

// Subdomain Stack - creates hosted zone and ACM certificate for custom domain
// Optionally updates NS delegation in parent account via custom resource
const subdomainStack = new SubdomainStack(
  app,
  `${envConfig.prefix}-archil-io-subdomain-${envConfig.stage}`,
  {
    domainName: envConfig.domainName || "",
    parentHostedZoneId: envConfig.parentHostedZoneId,
    parentDelegationRoleArn: envConfig.parentDelegationRoleArn,
    env: {
      account: envConfig.accountId,
      region: envConfig.region,
    },
  },
);

// Resume Bucket Stack - S3 bucket for storing resume PDF
const resumeBucketStack = new ResumeBucketStack(
  app,
  `mcp-ask-archil-bucket-${envConfig.stage}`,
  {
    envConfig,
    env: {
      account: envConfig.accountId,
      region: envConfig.region,
    },
  },
);

// MCP Server Stack - Lambda with Function URL for MCP server
const mcpServerStack = new MCPServerStack(
  app,
  `${envConfig.prefix}-server-archil-io-${envConfig.stage}`,
  {
    envConfig,
    resumeBucket: resumeBucketStack.bucket,
    env: {
      account: envConfig.accountId,
      region: envConfig.region,
    },
  },
);
