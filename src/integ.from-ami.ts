// TODO replace the manual test described in TestPlan.md with an integration test with assertions:
// https://github.com/aws/aws-cdk/blob/main/INTEGRATION_TESTS.md#assertions

import * as cdk from 'aws-cdk-lib';
import { KissDockerCompose } from './index';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'KDC-Integ-From-Snapshot', {
});

const dockerComposeFileAsString = `
services:
  frontend:
    image: nginx # used as an example / for testing
    restart: always
    # build: 
    #   context: ../src/client
    ports:
    - 80:80
    volumes:
    - ./vuejs:/project
    - /project/node_modules

  backend:
    image: nginx # used as an example / for testing
    restart: always
    # build:
    #   context: ../src/server
    ports:
    - 443:80
    depends_on:
      db:
        condition: service_started

  db:
    image: postgres
    restart: always
    # set shared memory limit when using docker-compose
    shm_size: 128mb
    healthcheck:
      `+ 'test: [ "CMD-SHELL", "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}" ]' + `
      interval: 15s
      timeout: 30s
      retries: 5
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: "password"
    volumes:
      - db-data:/var/lib/postgres

volumes:
  db-data:
`;

const kissDockerCompose = new KissDockerCompose(stack, 'Kiss-Docker-Compose-Integ-From-AMI', {
  dockerComposeFileAsString: dockerComposeFileAsString,
  machineImage: cdk.aws_ec2.MachineImage.lookup({
    name: 'test for restore',
    owners: ['set me'],
    windows: false,
  }),
});

// Demonstrating how to get EC2 Instance's Public DNS
console.log(kissDockerCompose.ec2Instance?.instancePublicDnsName ?? '');

// Exporting the value so you can find it easily
new cdk.CfnOutput(stack, 'KDC-public-ip-from-ami', {
  value: kissDockerCompose.ec2Instance?.instancePublicDnsName ?? '',
  exportName: 'KDC-public-ip-from-ami',
});
