import { awscdk } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Gregory Ledray',
  authorAddress: 'greg@gregoryledray.com',
  cdkVersion: '2.149.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.4.0',
  name: 'kiss-docker-compose',
  projenrcTs: true,
  repositoryUrl: 'https://github.com/Gregory-Ledray/kiss-docker-compose-on-aws',

  deps: [
    // '@aws-cdk/aws-apigatewayv2',
    // 'aws-cdk-lib/aws-apigatewayv2-integrations',
  ],
  description: 'Cheap. Simple. Fast. Move your  Docker Compose application from your local machine to the cloud in 3 minutes with KISS-Docker-Compose. Cheap: All code runs on one small EC2. Simple: It runs the same way on your machine as it runs in the cloud. Fast: works by default.',
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
  gitignore: ['cdk.out'],
  keywords: [
    'aws-cdk',
    'cdk',
    'Docker Compose',
    'Docker-Compose',
  ],

  packageManager: NodePackageManager.NPM,
});
project.synth();