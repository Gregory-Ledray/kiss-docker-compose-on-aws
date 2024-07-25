import { App, Stack } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { dockerComposeFileAsString } from './docker-compose-file-as-string';
import { KissDockerCompose } from '../src/index';

const mockApp = new App();
const stack = new Stack(mockApp);

const repo1 = new cdk.aws_ecr.Repository(stack, 'repo1', {});
const repo2 = new cdk.aws_ecr.Repository(stack, 'repo2', {});

new KissDockerCompose(stack, 'testing-stack', {
  dockerComposeFileAsString,
  repositoriesForDockerComposeImages: [repo1, repo2],
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
