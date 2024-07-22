import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { KissDockerCompose } from '../src/index';

const mockApp = new App();
const stack = new Stack(mockApp);
new KissDockerCompose(stack, 'testing-stack');
const template = Template.fromStack(stack);
console.log(template);

test('VPC should exist', () => {
  template.hasResource('AWS::EC2::VPC', {});
});

// test('Lambda functions should be configured with properties and execution roles', () => {
//   template.hasResourceProperties('AWS::Lambda::Function', {
//     Runtime: 'nodejs16.x',
//   });

//   template.hasResourceProperties('AWS::IAM::Role', {
//     AssumeRolePolicyDocument: {
//       Statement: [
//         {
//           Action: 'sts:AssumeRole',
//           Effect: 'Allow',
//           Principal: {
//             Service: 'lambda.amazonaws.com',
//           },
//         },
//       ],
//       Version: '2012-10-17',
//     },
//   });
// });

// test('HTTP API should be created', () => {
//   template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
//     ProtocolType: 'HTTP',
//   });
// });

// test('Lambda Integration should be created', () => {
//   template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
//     IntegrationType: 'AWS_PROXY',
//   });
// });