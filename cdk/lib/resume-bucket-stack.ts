import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import type { EnvironmentConfig } from "../config/environments.js";

interface ResumeBucketStackProps extends cdk.StackProps {
  envConfig: EnvironmentConfig;
}

export class ResumeBucketStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: ResumeBucketStackProps) {
    super(scope, id, props);

    const { envConfig } = props;

    // S3 bucket for storing resume PDF
    this.bucket = new s3.Bucket(this, "resume-bucket", {
      bucketName: `mcp-archil-io-resume-${envConfig.stage}`,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep bucket on stack deletion
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Private bucket
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true, // Enable versioning for resume updates
    });

    // Outputs
    new cdk.CfnOutput(this, "resume-bucket-name", {
      description: "Resume S3 Bucket Name",
      value: this.bucket.bucketName,
      exportName: `resume-bucket-name-${envConfig.stage}`,
    });

    new cdk.CfnOutput(this, "resume-bucket-arn", {
      description: "Resume S3 Bucket ARN",
      value: this.bucket.bucketArn,
      exportName: `resume-bucket-arn-${envConfig.stage}`,
    });
  }
}
