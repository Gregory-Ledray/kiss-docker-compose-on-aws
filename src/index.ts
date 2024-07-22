import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class KissDockerCompose extends Construct {
  appName = 'kiss';
  lowercaseAppName = 'kiss';
  readonly regionOfECR = cdk.Stack.of(this).region;
  readonly regionOfEC2Instances = cdk.Stack.of(this).region;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.appName = id;
    this.lowercaseAppName = this.appName.toLowerCase();

    // This is largely based on my blog post: https://dev.to/gregoryledray/apply-kiss-to-infrastructure-3j6d

    // Set up ECR for each of the images we intend to save so that I can pull from these images during deployments
    const preventExcessiveImages = {
      description: 'Prevent excessive numbers of images',
      maxImageCount: 100,
      rulePriority: 10,
    };
    const frontendECR = new ecr.Repository(this, 'frontendECR', {
      repositoryName: `${this.lowercaseAppName}-frontend`,
      lifecycleRules: [preventExcessiveImages],
    });
    const backendECR = new ecr.Repository(this, 'backendECR', {
      repositoryName: `${this.lowercaseAppName}-backend`,
      lifecycleRules: [preventExcessiveImages],
    });
    const dbECR = new ecr.Repository(this, 'dbECR', {
      repositoryName: `${this.lowercaseAppName}-db`,
      lifecycleRules: [preventExcessiveImages],
    });
    const repos = [
      frontendECR.repositoryUriForDigest(),
      backendECR.repositoryUriForDigest(),
      dbECR.repositoryUriForDigest(),
    ];

    // Create a VM which will be used to host the docker compose application
    const vpc = new ec2.Vpc(this, 'vpc', {
      createInternetGateway: true,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      ipProtocol: ec2.IpProtocol.DUAL_STACK,
      subnetConfiguration: [
        {
          name: this.appName,
          subnetType: ec2.SubnetType.PUBLIC,
          ipv6AssignAddressOnCreation: true,
          mapPublicIpOnLaunch: true,
          cidrMask: 24,
        },
      ],
      vpcName: this.appName,
    });
    const instanceRole = new iam.Role(this, `${this.appName}-ec2-role`, {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        // This allows the Docker Compose module "Pre" to pull the docker container images from ECR, which is critical since the source code is not stored on the EC2 instance so Docker Compose can't build the image locally
        // Without this, the command `/home/ec2-user/docker-compose-setup.sh` returns the error:
        // An error occurred (AccessDeniedException) when calling the GetAuthorizationToken operation: User: arn:aws:sts::*:assumed-role/... is not authorized to perform: ecr:GetAuthorizationToken on resource: * because no identity-based policy allows the ecr:GetAuthorizationToken action
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2ContainerRegistryReadOnly'),

        // This allows the Docker Compose containers to write to CloudWatch Logs, which is necessary to make our container's operations observable outside of the VM, which makes them easier to access and easier to examine when the machine isn't reachable via SSH
        // Without this, journalctl will show an error like this one:
        // Error response from daemon: failed to create task for container: failed to initialize logging driver: failed to create Cloudwatch log stream
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccess'),
      ],
    });
    const instanceSecurityGroup = new ec2.SecurityGroup(this, `${this.appName}-ec2-security-group`, {
      vpc: vpc,
      allowAllIpv6Outbound: true,
      allowAllOutbound: true,
      disableInlineRules: true,
    });
    instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow port 80 access from anywhere');
    instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(80), 'Allow port 80 access from anywhere');
    instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access from anywhere');
    const instance = new ec2.Instance(this, `${this.appName}-ec2`, {
      // This first section contains relatively common properties for an EC2 instance
      vpc: vpc,
      role: instanceRole,
      securityGroup: instanceSecurityGroup,

      // This is an x86 instance type and machine image
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),

      // This is an ARM64 instance type and machine image
      // instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      //   machineImage: ec2.MachineImage.fromSsmParameter(
      //     '/aws/service/ecs/optimized-ami/amazon-linux-2/arm64/recommended/image_id'
      //     // '/aws/service/ecs/optimized-ami/amazon-linux-2/recommended' // did not work - does not exist
      // ),

      instanceName: `${this.appName}-ec2`,
      requireImdsv2: true,

      // This is NOT NECESSARY because EC2 Instance Connect can be used to connect to this instance
      // And that service creates and shares its own key pair with the instance which is managed by AWS
      // You need to have a key pair to connect at all
      // See: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_container_instance.html#linux-liw-key-pair
      // keyPair: keyPair,

      // This next section is for our specific docker compose needs
      //
      // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/deploying.applications.html#deployment-walkthrough-lamp-install
      init: ec2.CloudFormationInit.fromConfigSets({
        configSets: {
          // Runs configs['install'] aka configs.install
          default: ['install'],
        },
        configs: {
          install: new ec2.InitConfig([
            ec2.InitFile.fromObject('/etc/docker/daemon.json', {
              'log-driver': 'awslogs',
              'log-opts': {
                'awslogs-region': this.regionOfEC2Instances,
                'awslogs-group': 'intelligentrxcom',
                'awslogs-create-group': true,
              },
            }),
            ec2.InitFile.fromFileInline('/home/ec2-user/docker-compose.yml', '/Users/gregoryledray/Documents/gregoryledray.com/infra/docker-compose.yml'),
            ec2.InitFile.fromString('/etc/install.sh', this.installAndStartupScript()),
            ec2.InitFile.fromString('/etc/systemd/system/docker-compose-app.service', this.dockerComposeAppService()),
            ec2.InitFile.fromString('/home/ec2-user/docker-compose-setup.sh', this.dockerComposeSetup(cdk.Stack.of(this).account, this.regionOfECR, repos)),
            ec2.InitCommand.shellCommand('chmod +x /etc/install.sh'),
            ec2.InitCommand.shellCommand('/etc/install.sh'),

            // The very first time we start the machine, we need to start the unit because it won't start automatically without rebooting
            ec2.InitCommand.shellCommand('sudo systemctl start docker-compose-app.service'),
          ]),
        },
      }),
      userData: ec2.UserData.custom(this.cfnSignal(`${this.appName}-ec2`, cdk.Stack.of(this).stackName, cdk.Stack.of(this).region)),

      initOptions: {
        // Set a very long timeout in case some steps take an excessive amount of time
        timeout: cdk.Duration.minutes(4),
      },
    });

    new cdk.CfnOutput(this, 'instance-public-ip', {
      value: instance.instancePublicIp,
      exportName: 'instance-public-ip',
    });
  }

  createKeyPair(keyName: string): ec2.IKeyPair {
    const keyPairCreate = new ec2.CfnKeyPair(this, `${keyName}-KeyPairCreate`, {
      keyName: keyName,
    });
    const keyPair = ec2.KeyPair.fromKeyPairAttributes(this, `${keyName}-KeyPair`, {
      keyPairName: keyPairCreate.keyName,
      type: ec2.KeyPairType.RSA,
    });
    return keyPair;
  }

  // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-signal.html
  cfnSignal(resource: string, awsStackName: string, awsRegion: string) {
    return `#!/bin/bash -x
# Install the files and packages from the metadata
yum install -y aws-cfn-bootstrap
/opt/aws/bin/cfn-init -v --stack ${awsStackName} --resource ${resource} --region ${awsRegion}
# Signal the status from cfn-init
/opt/aws/bin/cfn-signal -e $? --stack ${awsStackName} --resource ${resource} --region ${awsRegion}
`;
  }

  dockerComposeAppService() {
    return `# /etc/systemd/system/docker-compose-app.service

[Unit]
Description=Docker Compose Application Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ec2-user
ExecStartPre=/home/ec2-user/docker-compose-setup.sh
ExecStart=/usr/bin/docker-compose up -d --no-build
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
`;
  }

  dockerComposeSetup(awsAccountNumber: string, ecrRegion: string, repos: string[]) {
    const login = `#!/bin/sh
# /home/ec2-user/docker-compose-setup.sh
/usr/bin/aws ecr get-login-password --region ${ecrRegion} | /usr/bin/docker login --username AWS --password-stdin ${awsAccountNumber}.dkr.ecr.${ecrRegion}.amazonaws.com
`;
    let repoPulls = '';
    for (let i = 0; i < repos.length; i++) {
      repoPulls += (`/usr/bin/docker pull ${repos[i]}:latest
`);
    }
    const composeDown = `/usr/bin/docker-compose down
`;
    return `${login}${repoPulls}${composeDown}`;
  }

  installAndStartupScript() {
    const installDocker = `
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo groupadd docker
sudo usermod -a -G docker ec2-user
newgrp docker
docker version
`;

    // No, this is not installed with Docker
    // No, you can't use the package manager and it's not 100% clear why
    const installDockerCompose = `
sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/bin/docker-compose
sudo chmod +x /usr/bin/docker-compose
`;

    const dockerOnStartup = `
chmod +x /home/ec2-user/docker-compose-setup.sh
sudo systemctl enable docker
sudo systemctl enable docker-compose-app
`;

    // /etc/install.sh
    return `${installDocker}${installDockerCompose}${dockerOnStartup}`;
  }
}