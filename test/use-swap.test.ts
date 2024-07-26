import { App, Stack } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { dockerComposeFileAsString } from './docker-compose-file-as-string';
import * as KissDockerCompose from '../src/index';

const mockApp = new App();
const stack = new Stack(mockApp);

// Supplying EC2Instance as an argument overrides / ignores other properties
// So we only need to provide this one thing to get the service to deploy with everything we want
const vpc = KissDockerCompose.VPC(stack, 'testing-stack-vpc');
const role = KissDockerCompose.Ec2InstanceRole(stack, 'testing-stack-role');
const instanceSecurityGroup = KissDockerCompose.InstanceSecurityGroup(stack, 'testing-stack-sg', vpc);
const ec2Instance = KissDockerCompose.EC2Instance(stack, 'testing-stack-ec2-instance', vpc, role, instanceSecurityGroup, [], cdk.aws_ec2.InstanceSize.SMALL, 'us-east-2', 'us-east-2', dockerComposeFileAsString, 10);

new KissDockerCompose.KissDockerCompose(stack, 'testing-stack', {
  dockerComposeFileAsString,
  ec2Instance,
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
