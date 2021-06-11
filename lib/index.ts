import * as cdk from "@aws-cdk/core";
import * as eks from "@aws-cdk/aws-eks";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";
export interface CdkModuleEksProps {
  CdkVersion?: string;
  ClusterName?: string;
  NodeGroupName?: string;
  InstanceTypes?: ec2.InstanceType[];
}

interface HelmValues {
  [key: string]: unknown;
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
      clusterName = props.ClusterName;
    }
    let nodePoolName = "default-nodepool";
    if (props.NodeGroupName) {
      nodePoolName = props.NodeGroupName;
    }
    
    
    const cluster = new eks.Cluster(this, id, {
      version: clusterVersion,
      clusterName,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE }],
      defaultCapacity: 0
    });
    let instanceTypes = [
      ec2.InstanceType.of(ec2.InstanceClass.M5A, ec2.InstanceSize.LARGE),
    ];
    if (props.InstanceTypes) {
      instanceTypes = props.InstanceTypes;
    }
    cluster.addNodegroupCapacity(nodePoolName, {
      amiType: eks.NodegroupAmiType.AL2_X86_64,
      instanceTypes,
      diskSize: 100,
      minSize: 3,
    });
    const awsLbControllerServiceAccount = cluster.addServiceAccount(
      "aws-load-balancer-controller",
      {
        name: "aws-load-balancer-controller",
        namespace: "kube-system",
      }
    );

    const lbAcmPolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "acm:DescribeCertificate",
        "acm:ListCertificates",
        "acm:GetCertificate",
      ],
      resources: ["*"],
    });

    const lbEc2PolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:CreateSecurityGroup",
        "ec2:CreateTags",
        "ec2:DeleteTags",
        "ec2:DeleteSecurityGroup",
        "ec2:DescribeAccountAttributes",
        "ec2:DescribeAddresses",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeInternetGateways",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSubnets",
        "ec2:DescribeTags",
        "ec2:DescribeVpcs",
        "ec2:ModifyInstanceAttribute",
        "ec2:ModifyNetworkInterfaceAttribute",
        "ec2:RevokeSecurityGroupIngress",
      ],
      resources: ["*"],
    });

    const lbElbPolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "elasticloadbalancing:AddListenerCertificates",
        "elasticloadbalancing:AddTags",
        "elasticloadbalancing:CreateListener",
        "elasticloadbalancing:CreateLoadBalancer",
        "elasticloadbalancing:CreateRule",
        "elasticloadbalancing:CreateTargetGroup",
        "elasticloadbalancing:DeleteListener",
        "elasticloadbalancing:DeleteLoadBalancer",
        "elasticloadbalancing:DeleteRule",
        "elasticloadbalancing:DeleteTargetGroup",
        "elasticloadbalancing:DeregisterTargets",
        "elasticloadbalancing:DescribeListenerCertificates",
        "elasticloadbalancing:DescribeListeners",
        "elasticloadbalancing:DescribeLoadBalancers",
        "elasticloadbalancing:DescribeLoadBalancerAttributes",
        "elasticloadbalancing:DescribeRules",
        "elasticloadbalancing:DescribeSSLPolicies",
        "elasticloadbalancing:DescribeTags",
        "elasticloadbalancing:DescribeTargetGroups",
        "elasticloadbalancing:DescribeTargetGroupAttributes",
        "elasticloadbalancing:DescribeTargetHealth",
        "elasticloadbalancing:ModifyListener",
        "elasticloadbalancing:ModifyLoadBalancerAttributes",
        "elasticloadbalancing:ModifyRule",
        "elasticloadbalancing:ModifyTargetGroup",
        "elasticloadbalancing:ModifyTargetGroupAttributes",
        "elasticloadbalancing:RegisterTargets",
        "elasticloadbalancing:RemoveListenerCertificates",
        "elasticloadbalancing:RemoveTags",
        "elasticloadbalancing:SetIpAddressType",
        "elasticloadbalancing:SetSecurityGroups",
        "elasticloadbalancing:SetSubnets",
        "elasticloadbalancing:SetWebAcl",
      ],
      resources: ["*"],
    });

    const lbIamPolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "iam:CreateServiceLinkedRole",
        "iam:GetServerCertificate",
        "iam:ListServerCertificates",
      ],
      resources: ["*"],
    });

    const lbCognitoPolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["cognito-idp:DescribeUserPoolClient"],
      resources: ["*"],
    });

    const lbWafRegPolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "waf-regional:GetWebACLForResource",
        "waf-regional:GetWebACL",
        "waf-regional:AssociateWebACL",
        "waf-regional:DisassociateWebACL",
      ],
      resources: ["*"],
    });

    const lbTagPolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["tag:GetResources", "tag:TagResources"],
      resources: ["*"],
    });

    const lbWafPolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["waf:GetWebACL"],
      resources: ["*"],
    });

    const lbWafv2PolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "wafv2:GetWebACL",
        "wafv2:GetWebACLForResource",
        "wafv2:AssociateWebACL",
        "wafv2:DisassociateWebACL",
      ],
      resources: ["*"],
    });

    const lbShieldPolicyStatements = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "shield:DescribeProtection",
        "shield:GetSubscriptionState",
        "shield:DeleteProtection",
        "shield:CreateProtection",
        "shield:DescribeSubscription",
        "shield:ListProtections",
      ],
      resources: ["*"],
    });

    awsLbControllerServiceAccount.addToPrincipalPolicy(lbAcmPolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbEc2PolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbElbPolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbIamPolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbCognitoPolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbWafRegPolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbTagPolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbWafPolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbWafv2PolicyStatements);
    awsLbControllerServiceAccount.addToPrincipalPolicy(lbShieldPolicyStatements);

    // Deploy AWS LoadBalancer Controller from the Helm chart
    const stack = cdk.Stack.of(this);
    const lbHelmValues = {} as HelmValues;
    lbHelmValues.clusterName = cluster.clusterName;
    lbHelmValues.region = stack.region;
    lbHelmValues.vpcId = cluster.vpc.vpcId;
    lbHelmValues.serviceAccount = {
      create: false,
      name: "aws-load-balancer-controller",
    };
    cluster.addHelmChart("aws-load-balancer-controller", {
      chart: "aws-load-balancer-controller",
      repository: "https://aws.github.io/eks-charts",
      namespace: "kube-system",
      values: lbHelmValues,
    });
    
  }
}
