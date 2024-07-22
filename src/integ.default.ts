import * as cdk from 'aws-cdk-lib';
import { KissDockerCompose } from './index';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack');

new KissDockerCompose(stack, 'Kiss-Docker-Compose');