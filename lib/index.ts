import * as cdk from '@aws-cdk/core';

export interface CdkModuleEksProps {
  // Define construct properties here
}

export class CdkModuleEks extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: CdkModuleEksProps = {}) {
    super(scope, id);

    // Define construct contents here
  }
}
