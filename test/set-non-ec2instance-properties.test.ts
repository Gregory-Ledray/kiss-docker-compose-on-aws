import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { dockerComposeFileAsString } from './docker-compose-file-as-string';
import * as KissDockerCompose from '../src/index';

const mockApp = new App();
const stack = new Stack(mockApp);

// Supplying EC2Instance as an argument overrides / ignores other properties
// So if we want these other properties to be used, we need to specify them without specifying the EC2 Instance
const vpc = KissDockerCompose.VPC(stack, 'testing-stack-vpc');
const ec2InstanceRole = KissDockerCompose.Ec2InstanceRole(stack, 'testing-stack-role');
const instanceSecurityGroup = KissDockerCompose.InstanceSecurityGroup(stack, 'testing-stack-sg', vpc);

new KissDockerCompose.KissDockerCompose(stack, 'testing-stack', {
  dockerComposeFileAsString,
  vpc,
  ec2InstanceRole,
  instanceSecurityGroup,
});
const minimalConfigurationTemplate = Template.fromStack(stack);

test('VPC should exist', () => {
  minimalConfigurationTemplate.hasResource('AWS::EC2::VPC', {});
});

test('Role should exist', () => {
  minimalConfigurationTemplate.hasResource('AWS::IAM::Role', {});
});

test('Security group should exist', () => {
  minimalConfigurationTemplate.hasResource('AWS::EC2::SecurityGroup', {});
});

test('EC2 Instance should exist', () => {
  minimalConfigurationTemplate.hasResource('AWS::EC2::Instance', {});
});
