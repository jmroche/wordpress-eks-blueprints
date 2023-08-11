import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { EksStack } from '../lib/eks_typescript-stack';
import { RDSStack } from '../lib/rds_stack';
import { VPCStack } from '../lib/vpc_stack';




const account = '601749221392';
const region = 'us-east-2';


const app = new cdk.App();
const props = { env: { account, region } };


const eksStack = new EksStack(app, 'EksStack', props);

const rdsStack = new RDSStack(app, 'RDSStack', props);

rdsStack.node.addDependency(eksStack);

