import * as fs from 'fs';
import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { KissDockerCompose } from '../src/index';

const dockerComposeFileAsString = fs.readFileSync('./test/docker-compose.yml', 'utf8');
const mockApp = new App();
const stack = new Stack(mockApp);
new KissDockerCompose(stack, 'testing-stack', { dockerComposeFileAsString });
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
