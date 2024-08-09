# KISS Docker Compose on AWS

Cheap. Simple. Fast.

Move your [Docker Compose](https://docs.docker.com/compose/) application stack from your local machine to the cloud in 3 minutes with KISS-Docker-Compose.

- Cheap: All code runs on one EC2 instance, which means you can get [swap space](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-store-swap-volumes.html) ([unlike Fargate](https://github.com/aws/containers-roadmap/issues/2061)) and [all containers share resources](https://docs.docker.com/config/containers/resource_constraints/) which can reduce unusued resource capacity. Note: Swap isn't currently configured for this project.
- Simple: It runs the same way on your machine with Docker Compose as it runs in the cloud because both are running a Docker Compose file.
- Fast: Deploys quickly.

# Get Started

## Install

`npm i kiss-docker-compose`

## Inline Docker Compose File

```
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

const kissDockerCompose = new KissDockerCompose(stack, 'kiss-docker-compose', { dockerComposeFileAsString });

// Exporting the value so you can find it easily
new cdk.CfnOutput(stack, 'Kiss-Docker-Compose-public-ip', {
  value: kissDockerCompose.ec2Instance?.instancePublicDnsName ?? '',
  exportName: 'Kiss-Docker-Compose-public-ip',
});

```

## Load a Docker Compose File From Your File System

Get a sample Docker Compose File:

```
curl -O https://raw.githubusercontent.com/Gregory-Ledray/kiss-docker-compose-on-aws/main/test/docker-compose.yml
```

And use it:

```
import * as fs from 'fs';
import { KissDockerCompose } from 'kiss-docker-compose'

const dockerComposeFileAsString = fs.readFileSync('./docker-compose.yml', 'utf8');

const kissDockerCompose = new KissDockerCompose(stack, 'kiss-docker-compose', { dockerComposeFileAsString });

// Exporting the value so you can find it easily
new cdk.CfnOutput(stack, 'Kiss-Docker-Compose-public-ip', {
  value: kissDockerCompose.ec2Instance?.instancePublicDnsName ?? '',
  exportName: 'Kiss-Docker-Compose-public-ip',
});
```

## Delete or Destroy
General Procedure:

1. cdk destroy
1. Find the EBS Volume which was preserved after deletion and delete it.

### Detailed Procedure
1. Run this command:
```
npx cdk destroy
```

1. By default, the EC2 Instance preserves its root volume when deleted. You need to find this volume and delete it. It will be in the same region as the EC2 Instance.

## Accidental Delection / Disaster Recovery
When the EC2 Instance is deleted, the volumes are saved. This is to prevent the CDK from deleting the EC2 Instance whenever you make a change and you losing all of your data. To restore your data, follow this procedure, which is also documented in TestPlan.md:

1. Find your detatched volume. This will be in the same account and region the EC2 instance was in.
2. Create a Snapshot from the Volume. This will take a minute or two.
3. Create an AMI from the snapshot. Use the following settings:
Some parameters:
Image Name: test for restore
Architecture: x86_64
Root device name: /dev/xvda
Virtualization Type: Hardware-assisted virtualization
Boot mode: Use default
Block device mappings:
- Volume 1: 8 GiB. gp3. 3000. 125 MB/s. Uncheck "delete on termination."
Click "Create Image"
4. When calling Kiss-Docker-Compose, set the AMI parameter. Example: src/integ.from-ami.ts
5. Deploy. The new deployment will use the AMI which was created from your Root Volume.

Why does it work this way? Isn't this kind of roundabout? Yes, it is. I tried a variety of other approaches, but didn't get them to work. See: #3

# Contributing

## Update Projen

```
npx projen
```

## Test

```
npx projen test
```

## Build

```
npx projen build
```

## Test Deployment

You may need to set some parameters since modifying `src/integ.default.ts` is ill advised:

```
export AWS_REGION=us-east-2
```

Deploy:

```
cdk deploy --app='./lib/integ.default.js'
```
