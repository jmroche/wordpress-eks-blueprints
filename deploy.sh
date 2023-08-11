#!/bin/bash
# Create a bash script to deploy CDK EKSStack, if succesful then deploy CDK RDSStack.

BASE_DIR="$( cd "$( dirname "$0" )" && pwd )"

echo $BASE_DIR

if [ -d "$BASE_DIR/cdk.out" ]; then
    echo "$BASE_DIR/cdk.out exists, deleting..."
    rm -rf $BASE_DIR/cdk.out
    echo "$BASE_DIR/cdk.out deleted."
fi

if [ -f "$BASE_DIR/cdk.context.json" ]; then
    echo "$BASE_DIR/cdk.context.json exists, deleting..."
    rm -f $BASE_DIR/cdk.context.json
    echo "$BASE_DIR/cdk.context.json deleted."
fi


echo "###########################################################"
echo "#  Synth the EKS Stack Deployment"
echo "###########################################################"
echo 

cdk synth EksStack > $BASE_DIR/logs/eks_stack_synth.log
cdk synth EksStack/eks-cluster-blueprint > $BASE_DIR/logs/eks_cluster_blueprint_synth.log

if [ "$?" -ne "0" ]
then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "!! Unable to synthesize EKS stack !!"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  exit 1
fi

echo "###########################################################"
echo "#  Deploy the EKSStack"
echo "###########################################################"
echo 

cdk deploy EksStack --require-approval never --debug > $BASE_DIR/logs/eks_stack_deploy.log

if [ "$?" -ne "0" ]
then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "!! Unable to deploy EKS stack !!"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  exit 1
fi



echo "###########################################################"
echo "#  Synth the RDS Stack Deployment"
echo "###########################################################"
echo 

cdk synth RDSStack > $BASE_DIR/logs/rds_stack_synth.log

if [ "$?" -ne "0" ]
then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "!! Unable to synthesize RDS stack !!"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  exit 1
fi

echo "###########################################################"
echo "#  Deploy the RDSStack"
echo "###########################################################"
echo 

cdk deploy RDSStack --require-approval never --debug > $BASE_DIR/logs/eks_stack_deploy.log

if [ "$?" -ne "0" ]
then
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "!! Unable to deploy RDS stack !!"
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  exit 1
fi


echo "Satcks deployed succesfully!!"
exit 0




