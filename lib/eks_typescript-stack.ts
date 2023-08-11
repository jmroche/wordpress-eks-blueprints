import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';



export interface BlueprintConstructProps {

  /**
   * EC2 VPC
   */
  vpc: Vpc;
}


export class EksStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    // AddOns for the cluster.
    const addOns: Array<blueprints.ClusterAddOn> = [
      new blueprints.addons.FluxCDAddOn,
      new blueprints.addons.MetricsServerAddOn,
      new blueprints.addons.ClusterAutoScalerAddOn,
      new blueprints.addons.ContainerInsightsAddOn,
      new blueprints.addons.AwsLoadBalancerControllerAddOn(),
      new blueprints.addons.VpcCniAddOn(),
      new blueprints.addons.CoreDnsAddOn(),
      new blueprints.addons.KubeProxyAddOn(),
      new blueprints.addons.XrayAddOn(),
      new blueprints.addons.EfsCsiDriverAddOn()
    ];

    const eksBlueprintStack = blueprints.EksBlueprint.builder()
      .account(props.env?.account)
      .region(props.env?.region)
      .resourceProvider(blueprints.GlobalResources.Vpc, new blueprints.VpcProvider())
      .resourceProvider("efs-file-system", new blueprints.CreateEfsFileSystemProvider({name: "efs-file-system"}))
      .addOns(...addOns)
      .build(this, 'eks-cluster-blueprint');


    const vpcId = eksBlueprintStack.getClusterInfo().cluster.vpc.vpcId;
    const eksVpc = eksBlueprintStack.getClusterInfo().cluster.vpc;

    
    new cdk.CfnOutput(this, 'vpcId', {exportName: "vpcId", value: vpcId});



    new ssm.StringParameter(this, 'vpcIdSSM', {
      parameterName: '/vpcStack/vpcId',
      stringValue: eksVpc.vpcId,
    });


  }
}
