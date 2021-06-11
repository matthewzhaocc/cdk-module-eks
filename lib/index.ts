import * as cdk from '@aws-cdk/core';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
export interface CdkModuleEksProps {
  CdkVersion?: string,
  ClusterName?: string,
  NodeGroupName?: string,
  InstanceTypes?: ec2.InstanceType[],
}

export class CdkModuleEks extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: CdkModuleEksProps = {}) {
    super(scope, id);

    let clusterVersion: eks.KubernetesVersion = eks.KubernetesVersion.V1_20;
    switch (props.CdkVersion) {
      case "1.18":
        clusterVersion = eks.KubernetesVersion.V1_18;
        break;
      case "1.19":
        clusterVersion = eks.KubernetesVersion.V1_19;
        break;
      case "1.20":
        clusterVersion = eks.KubernetesVersion.V1_20;
        break;  
    }
    let clusterName = "cluster-1";
    if (props.ClusterName) {
      clusterName = props.ClusterName
    }
    let nodePoolName = "default-nodepool"
    if (props.NodeGroupName) {
      nodePoolName = props.NodeGroupName
    }
    const cluster = new eks.Cluster(this, id, {
      version: clusterVersion,
      clusterName,
    })
    let instanceTypes = [ec2.InstanceType.of(ec2.InstanceClass.M5A, ec2.InstanceSize.LARGE)]
    if (props.InstanceTypes) {
      instanceTypes = props.InstanceTypes
    }
    cluster.addNodegroupCapacity(nodePoolName, {
      amiType: eks.NodegroupAmiType.AL2_X86_64,
      instanceTypes,
      diskSize: 100,
      minSize: 3
    })
  }
}
