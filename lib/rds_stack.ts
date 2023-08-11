import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';



export class RDSStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

    //   const vpcId = cdk.Fn.importValue('vpcId');
      const vpcId = ssm.StringParameter.valueFromLookup(this, '/vpcStack/vpcId');
      const vpc = ec2.Vpc.fromLookup(this, 'vpc', {vpcId: vpcId});

      const rdsSG = new ec2.SecurityGroup(this, "db-aurora-mysql-sg", {
        vpc: vpc,
        allowAllOutbound: true,
        description: "Security group for RDS",
        securityGroupName: "db-aurora-mysql-sg"  
        });

        rdsSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3306), 'Allow MySQL from anywhere')

        const json_template = {"username": "admin"};

        const db_creds = new sm.Secret(this, 'db-creds', {
            description: 'Database credentials',
            secretName: 'db-creds',
            generateSecretString:{
                includeSpace: false,
                passwordLength: 12,
                generateStringKey: 'password',
                excludePunctuation: true,
                secretStringTemplate: JSON.stringify(json_template)
            }
        });



      const db_aurora_mysql = new rds.DatabaseCluster(this, 'db-aurora-mysql', {
        engine: rds.DatabaseClusterEngine.auroraMysql({ version: rds.AuroraMysqlEngineVersion.VER_2_11_3}),
        writer: rds.ClusterInstance.provisioned("writer", {
            publiclyAccessible: false,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.LARGE),
        }),
        readers: [
            rds.ClusterInstance.provisioned("reader1", {promotionTier: 1,
            publiclyAccessible: false,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.LARGE)
            })
        ],
        vpc: vpc,
        vpcSubnets: {
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
        },
        parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, "db-aurora-mysql-parameter-group", "default.aurora-mysql5.7"),
        securityGroups: [rdsSG],
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        credentials: rds.Credentials.fromSecret(db_creds)
      

    })

    // Aurora Hostname to SSM Parameter Store
    const aurora_hostname = db_aurora_mysql.clusterEndpoint.hostname;
    new ssm.StringParameter(this, 'aurora-hostname', {
        parameterName: '/rds/aurora/hostname',
        stringValue: aurora_hostname
    });
}

}