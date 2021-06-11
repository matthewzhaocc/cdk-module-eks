import * as cdk from '@aws-cdk/core';
import * as EksConstruct from '@matthewzhao/cdk-module-eks';
export class ExamplesStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new EksConstruct.CdkModuleEks(this, id, {
      ClusterName: 'test'
    })
    // The code that defines your stack goes here
  }
}
