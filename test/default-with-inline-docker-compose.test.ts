import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { KissDockerCompose } from '../src/index';

const mockApp = new App();

//
// The default KissDockerCompose creates a sample application with a frontend, backend, and database
// The default settings assume:
// 1. App Name == id, where `id` is the second parameter passed to `new KissDockerCompose`
// 2. this.lowercaseAppName = appName.toLowerCase();
// 3. There are 3 containers in the Docker Compose file:
// `${this.lowercaseAppName}-frontend`, `${this.lowercaseAppName}-backend`, `${this.lowercaseAppName}-db`
// 4. ...
// 5. ...
// 6. The stack region, ECR region, and EC2 region are all the same
//


// POSTGRES_DB and POSTGRES_USER are parameters to Docker Compose
// They had to be escaped to work in the javascript string template, so I used string concatenation to make it
// as clear as possible as to what is going on here
const dockerComposeFileAsString = `
services:
  frontend:
    image: nginx # used as an example / for testing
    restart: always
    # build: 
    #   context: ../src/client
    ports:
    - 5000:80
    volumes:
    - ./vuejs:/project
    - /project/node_modules

  backend:
    image: nginx # used as an example / for testing
    restart: always
    # build:
    #   context: ../src/server
    ports:
    - 5001:80
    depends_on:
      db:
        condition: service_started

  db:
    image: postgres
    restart: always
    # set shared memory limit when using docker-compose
    shm_size: 128mb
    healthcheck:
      `+'test: [ "CMD-SHELL", "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}" ]'+`
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
const stack = new Stack(mockApp);
new KissDockerCompose(stack, 'testing-stack', dockerComposeFileAsString);
const noConfigurationTemplate = Template.fromStack(stack);

test('VPC should exist', () => {
  noConfigurationTemplate.hasResource('AWS::EC2::VPC', {});
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