import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';


// pre-create a VPC
export class VPCStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
  
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
  
      this.vpc = new ec2.Vpc(this, 'eks-wordpress-vpc', {
        ipAddresses: ec2.IpAddresses.cidr('10.29.0.0/16'),
        maxAzs: 3,
        natGateways: 2,
        subnetConfiguration: [
            {
                name: 'Public',
                subnetType: ec2.SubnetType.PUBLIC,
                cidrMask: 24
            },
            {
                name: "Private",
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                cidrMask: 24,
            },
            {
                name: "Isolated",
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                cidrMask: 24,
            },
        ],
        enableDnsHostnames: true,
        enableDnsSupport: true,
      });

      new cdk.CfnOutput(this, 'VpcId', {value: this.vpc.vpcId});
    }
  }

