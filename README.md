# Deploying a WordPress application to Amazon Elastic Kubernetes Service (EKS)

This project creates the infrastructure and deployment pipeline to run a WordPress application on AWS.

## The infrastrucutre consists of the folllowing:

* Amazon EKS: This is created using the [AWS EKS Blueprints for CDK](https://aws-quickstart.github.io/cdk-eks-blueprints/)
* Amazon Aurora MySQL Cluster to store WordPress data
* Amazon Elastic File System (EFS) service  to store WordPress installation and configuration files

Here's the high level architecture design:

![WordPress on EKS Architecture Diagram](/images/WordPress-on-EKS.png)
---

## This is a scalable and resilient design by following AWS good practices such as:

* AWS VPC with multiple Availability Zones (AZs)
* EKS Cluster with a minimum of two nodes placed across different AZs
* Amazon MySQL Aurora cluster with two nodes (writer/reader) deployed across multiple AZs
* Amazon EFS file system. A regional storage classes that store file system data and metadata redundantly across multiple geographically separated Availability Zones within an AWS Region
* [FluxCD](https://fluxcd.io/) to continuously monitor GitHub an and synchronizing the Kubernetes cluster using GitHub as it source of truth.

## To deploy the application:

1. Clone this repository
2. Make the deploy script executable: `chmod 750 deploy.sh`
3. Execute the script `./deploy.sh`
4. Once the deployment completes, create a directory in the root of the project called `secrets` and create two files inside:

* kustomization.yaml
* namespace.yaml

### Add the following to the `namespace.yaml`:
```
apiVersion: v1
kind: Namespace
metadata:
  name: wordpress
  labels:
    name: wordpress
```

### Add the following to the `kustomization.yaml`:
```
secretGenerator:
- name: mysql-pass
  namespace: wordpress
  options:
    disableNameSuffixHash: true
  literals:
  - dbpassword=
  - dbhost=
  - dbuser=
  - dbase=

resources:
  - namespace.yaml
```

5. Make sure to add the credetials for the created database found in `AWS Secrets`
6. Set your kubernetes context by updating [kubeconfig](https://docs.aws.amazon.com/eks/latest/userguide/create-kubeconfig.html)]. The exact command can be found on the CloudFormation Output tab.
7. Apply the secrets to the EKS Cluster by running `kubectl apply -k /secrets/`
8. Next step is to install, configure and bootstrap FluxCD following the instructions [here](https://fluxcd.io/flux/installation/). This is an example of how to bootstrap flux:
```
flux bootstrap github \
  --owner=$GITHUB_USER \
  --repository=$REPO_NAME \
  --branch=main \
  --path=/k8s/prod \
  --personal=true
```
### Enjoy your resilient, scalable WordPress installation that is continuously deployed to your Kubernetes cluster.



