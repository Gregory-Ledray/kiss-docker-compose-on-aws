import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';


/**
 * Allows overriding all default code, or a subset of it. To customize, first get the default values for these properties (which are exported) and then make modifications from there.
 */
export interface IKissDockerComposeProps {
  /**
   * Your Docker Compose file, stringified. This is copied to the EC2 instance without modification
   * Required.
   */
  dockerComposeFileAsString: string;

  /**
   * ECR repositories containing images used for your Docker Compose application. This is primarily used for pre-pulling images before starting the application to make sure the current image is up to date. If you do not have ECR images you can leave this as an empty array - [] - or null. In these cases, no images are pulled from ECR.
   *
   * Default: ECRsForDockerComposeImages(this, [])
   */
  repositoriesForDockerComposeImages?: cdk.aws_ecr.IRepository[];

  /**
   * Setting this value overrides and ignores the repositoriesForDockerComposeImages, vpc, ec2InstanceRole, and instanceSecurityGroup parameters. This is the EC2 Instance used by this CDK.
   *
   * Default: EC2Instance(this, id, props.vpc, props.ec2InstanceRole, props.instanceSecurityGroup, props.repositoriesForDockerComposeImages, ec2.InstanceSize.MICRO, this.regionOfEC2Instances, this.regionOfECR, props.dockerComposeFileAsString)
   */
  ec2Instance?: cdk.aws_ec2.Instance;

  /**
   * Setting this overrides the template's VPC into which the ec2Instance is deployed.
   *
   * Default: VPC(this, id)
   */
  vpc?: cdk.aws_ec2.Vpc;

  /**
   * Setting this overrides the template's Role with which the ec2Instance is deployed.
   *
   * Default: Ec2InstanceRole(this, id)
   */
  ec2InstanceRole?: cdk.aws_iam.Role;

  /**
   * Setting this overrides the template's SecurityGroup with which the ec2Instance is deployed.
   *
   * Default: InstanceSecurityGroup(this, id, props.vpc)
   */
  instanceSecurityGroup?: cdk.aws_ec2.SecurityGroup;
}


export class KissDockerCompose extends Construct {
  /**
   * regionOfECR is the region from which the ECR image will be pulled.
   */
  readonly regionOfECR = cdk.Stack.of(this).region;
  /**
   * regionOfEC2Instances is the region in which the EC2 instance will be deployed.
   */
  readonly regionOfEC2Instances = cdk.Stack.of(this).region;

  /**
   * Create a new EC2 instance running your Docker Compose file.
   *
   * @param scope - scope in which this resource is defined
   * @param id    - scoped id of the resource is used to prefix names to prevent naming conflicts
   * @param props - resource properties, some of which are required
   */
  constructor(
    scope: Construct,
    id: string,
    props: IKissDockerComposeProps | undefined,
  ) {
    super(scope, id);

    if (props == null) {
      props = {
        dockerComposeFileAsString: '',
      };
    }

    // This is largely based on my blog post: https://dev.to/gregoryledray/apply-kiss-to-infrastructure-3j6d

    if (props.ec2Instance == null) {
      // Set up ECR for each of the images we intend to save so that I can pull from these images during deployments
      if (props.repositoriesForDockerComposeImages == null) {
        props.repositoriesForDockerComposeImages = ECRsForDockerComposeImages(this, []);
      }

      if (props.vpc == null) {
        props.vpc = VPC(this, id);
      }

      if (props.ec2InstanceRole == null) {
        props.ec2InstanceRole = Ec2InstanceRole(this, id);
      }

      if (props.instanceSecurityGroup == null) {
        props.instanceSecurityGroup = InstanceSecurityGroup(this, id, props.vpc);
      }
      props.ec2Instance = EC2Instance(
        this,
        id,
        props.vpc,
        props.ec2InstanceRole,
        props.instanceSecurityGroup,
        props.repositoriesForDockerComposeImages,
        ec2.InstanceSize.MICRO,
        this.regionOfEC2Instances,
        this.regionOfECR,
        props.dockerComposeFileAsString,
      );
    }

    new cdk.CfnOutput(this, `${id}-public-ip`, {
      value: props.ec2Instance.instancePublicIp,
      exportName: `${id}-public-ip`,
    });
  }
}


/**
 * This is Kiss-Docker-Compose's code to create its ECRs.
 *
 * Creates references to EXISTING ECR repositories. Repositories should already exist and have an image tagged with :latest
 *
 * @param scope scope in which this resource is defined
 * @param repositoryNames such as yourRepoName are used to pull the latest images: docker pull yourRepoName:latest
 * @returns references to the EXISTING ECR repositories
 */
export function ECRsForDockerComposeImages(scope: Construct, repositoryNames: string[]): cdk.aws_ecr.IRepository[] {
  let repositories = [];
  for (let i = 0; i < repositoryNames.length; i++) {
    repositories.push(ecr.Repository.fromRepositoryName(scope, `${repositoryNames[i]}ECR`, repositoryNames[i]));
  }
  return repositories;
}

/**
 * This is Kiss-Docker-Compose's code to create its Security Group.
 *
 * Creates a NEW security group which allows traffic on port 80.
 *
 * @param scope scope in which this resource is defined
 * @param id is used as a prefix when creating the `id`
 * @param vpc in which this security group will live
 * @returns created security group
 */
export function InstanceSecurityGroup(scope: Construct, id: string, vpc: cdk.aws_ec2.Vpc): cdk.aws_ec2.SecurityGroup {
  let instanceSecurityGroup = new ec2.SecurityGroup(scope, `${id}-ec2-security-group`, {
    vpc: vpc,
    allowAllIpv6Outbound: true,
    allowAllOutbound: true,
    disableInlineRules: true,
  });
  instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow port 80 access from anywhere');
  instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv6(), ec2.Port.tcp(80), 'Allow port 80 access from anywhere');
  instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH access from anywhere');

  return instanceSecurityGroup;
}

/**
 * This is Kiss-Docker-Compose's code to create its VPC.
 *
 * Creates a NEW public VPC
 *
 * @param scope scope in which this resource is defined
 * @param id is used as a prefix when creating the `id`
 * @returns created VPC
 */
export function VPC(scope: Construct, id: string): cdk.aws_ec2.Vpc {
  return new ec2.Vpc(scope, `${id}-vpc`, {
    createInternetGateway: true,
    enableDnsHostnames: true,
    enableDnsSupport: true,
    ipProtocol: ec2.IpProtocol.DUAL_STACK,
    subnetConfiguration: [
      {
        name: id,
        subnetType: ec2.SubnetType.PUBLIC,
        ipv6AssignAddressOnCreation: true,
        mapPublicIpOnLaunch: true,
        cidrMask: 24,
      },
    ],
    vpcName: id,
  });
}

/**
 * This is Kiss-Docker-Compose's code to create its Role.
 *
 * Ec2InstanceRole creates a NEW Role which is able to perform the work to run Docker Compose and write logs to CloudWatch.
 * Notes on specific policies used are in the body of this function.
 *
 * @param scope scope in which this resource is defined
 * @param id is used as a prefix when creating the `id`
 * @returns created Role
 */
export function Ec2InstanceRole(scope: Construct, id: string): cdk.aws_iam.Role {
  return new iam.Role(scope, `${id}-ec2-role`, {
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
}

/**
 * This is Kiss-Docker-Compose's code to create its EC2 Instance.
 *
 * Default: EC2Instance(
 *      this,
 *      id,
 *      props.vpc,
 *      props.ec2InstanceRole,
 *      props.instanceSecurityGroup,
 *      props.repositoriesForDockerComposeImages,
 *      ec2.InstanceSize.MICRO,
 *      this.regionOfEC2Instances,
 *      this.regionOfECR,
 *      props.dockerComposeFileAsString
 *    );
 *
 * @param scope scope in which this resource is defined
 * @param id is used as a prefix when creating the `id`
 * @param vpc A VPC similar to VPC(this, id)
 * @param ec2InstanceRole an EC2 Instance Role similar to Ec2InstanceRole(this, id)
 * @param instanceSecurityGroup a Security Group similar to InstanceSecurityGroup(this, id, props.vpc)
 * @param repositoriesForDockerComposeImages a list of repositories used in the Docker Compose file or []
 * @param instanceSize an EC2 instance size compatible with the T3 instance class.
 * Other instance classes and machine images are not supported at this time because the scripts are not ARM compatibile.
 * Also I do not know how to validate that an instance size, instance class, machineImage combination is x86.
 * @param regionOfEC2Instances EC2 instance region. Usually cdk.Stack.of(this).region
 * @param regionOfECR ECR region. Usually cdk.Stack.of(this).region
 * @param dockerComposeFileAsString always the same as props.dockerComposeFileAsString
 * @returns A NEW EC2 instance which will run Docker Compose when launched and when restarted.
 */
export function EC2Instance(
  scope: Construct,
  id: string,
  vpc: cdk.aws_ec2.IVpc,
  ec2InstanceRole: cdk.aws_iam.Role,
  instanceSecurityGroup: cdk.aws_ec2.ISecurityGroup,
  repositoriesForDockerComposeImages: cdk.aws_ecr.IRepository[],
  instanceSize: cdk.aws_ec2.InstanceSize,
  regionOfEC2Instances: string,
  regionOfECR: string,
  dockerComposeFileAsString: string,
): cdk.aws_ec2.Instance {
  if (
    scope == null ||
    id == null ||
    vpc == null ||
    ec2InstanceRole == null ||
    instanceSecurityGroup == null ||
    repositoriesForDockerComposeImages == null ||
    instanceSize == null ||
    regionOfEC2Instances == null ||
    regionOfECR == null ||
    dockerComposeFileAsString == null
  ) {
    throw new Error('an input was null or undefined');
  }

  const repoURIs = [];
  for (let i = 0; i < repositoriesForDockerComposeImages?.length; i++) {
    repoURIs.push(repositoriesForDockerComposeImages[i].repositoryUriForDigest());
  }

  return new ec2.Instance(scope, `${id}`, {
    // This first section contains relatively common properties for an EC2 instance
    vpc: vpc,
    role: ec2InstanceRole,
    securityGroup: instanceSecurityGroup,

    // This is an x86 instance type and machine image
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, instanceSize),
    machineImage: ec2.MachineImage.latestAmazonLinux2023(),

    // This is an ARM64 instance type and machine image
    // ARM64 is not compatible with the scripts I have written and may not be compatible with the demo images I'm using
    // instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
    //   machineImage: ec2.MachineImage.fromSsmParameter(
    //     '/aws/service/ecs/optimized-ami/amazon-linux-2/arm64/recommended/image_id'
    //     // '/aws/service/ecs/optimized-ami/amazon-linux-2/recommended' // did not work - does not exist
    // ),

    instanceName: `${id}`,
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
              'awslogs-region': regionOfEC2Instances,
              'awslogs-group': 'intelligentrxcom',
              'awslogs-create-group': true,
            },
          }),
          ec2.InitFile.fromString('/home/ec2-user/docker-compose.yml', dockerComposeFileAsString),
          ec2.InitFile.fromString('/etc/install.sh', installAndStartupScript()),
          ec2.InitFile.fromString('/etc/systemd/system/docker-compose-app.service', dockerComposeAppService()),
          ec2.InitFile.fromString('/home/ec2-user/docker-compose-setup.sh', dockerComposeSetup(cdk.Stack.of(scope).account, regionOfECR, repoURIs)),
          ec2.InitCommand.shellCommand('chmod +x /etc/install.sh'),
          ec2.InitCommand.shellCommand('/etc/install.sh'),

          // The very first time we start the machine, we need to start the unit because it won't start automatically without rebooting
          ec2.InitCommand.shellCommand('sudo systemctl start docker-compose-app.service'),
        ]),
      },
    }),
    userData: ec2.UserData.custom(cfnSignal(`${id}-ec2`, cdk.Stack.of(scope).stackName, cdk.Stack.of(scope).region)),

    initOptions: {
      // Set a very long timeout in case some steps take an excessive amount of time
      timeout: cdk.Duration.minutes(4),
    },
  });
}

/**
 * cfnSignal tells the CloudFormation stack we have finished initializing. See:
 * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-signal.html
 *
 * @param resource - The logical ID of the resource that contains the creations policy you want to signal.
 * @param awsStackName - The stack name or stack ID that contains the resource you want to signal.
 * @param awsRegion - The CloudFormation regional endpoint to use.
 */
function cfnSignal(resource: string, awsStackName: string, awsRegion: string) {
  return `#!/bin/bash -x
# Install the files and packages from the metadata
yum install -y aws-cfn-bootstrap
/opt/aws/bin/cfn-init -v --stack ${awsStackName} --resource ${resource} --region ${awsRegion}
# Signal the status from cfn-init
/opt/aws/bin/cfn-signal -e $? --stack ${awsStackName} --resource ${resource} --region ${awsRegion}
`;
}

/**
 * dockerComposeAppService is a systemd service which prepares, starts, and stops `docker-compose up`.
 * A systemd service is used so that we can easily schedule it to start when the VM starts or reboots.
 *
 * @returns String which is the service definition
 */
function dockerComposeAppService() {
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

/**
 * dockerComposeSetup is run by the systemd service in ExecStartPre.
 * It logs into ECR and then pulls in the latest versions of the Docker images.
 * @param awsAccountNumber is the account number where the images are stored
 * @param ecrRegion is the region where the images are stored
 * @param repos is the repository where the images are stored. Pulled images are always `${repos[i]}:latest`
 * @returns String which is a script to pull the images
 */
function dockerComposeSetup(awsAccountNumber: string, ecrRegion: string, repos: string[]) {
  const scriptStart = `#!/bin/sh
# /home/ec2-user/docker-compose-setup.sh
`;
  const login = `/usr/bin/aws ecr get-login-password --region ${ecrRegion} | /usr/bin/docker login --username AWS --password-stdin ${awsAccountNumber}.dkr.ecr.${ecrRegion}.amazonaws.com
`;
  let repoPulls = '';
  for (let i = 0; i < repos.length; i++) {
    repoPulls += (`/usr/bin/docker pull ${repos[i]}:latest
`);
  }
  const composeDown = `/usr/bin/docker-compose down
`;
  if (repos.length > 0) {
    return `${scriptStart}${login}${repoPulls}${composeDown}`;
  }

  // With 0 repos there is no reason to log in to ECR
  // If the caller has overridden the permissions used on the EC2 instance, it is possible that the call to login to ECR will fail
  // If it fails then the script terminates early - terminating before running compose down
  // To ensure consistency between ECR-using code and non-ECR code, we need to make sure compose down always runs
  // Therefore, let's return a simpler script which only calls `docker-compose down`.
  return `${scriptStart}${composeDown}`;
}

/**
 * installAndStartupScript first updates the system and installs and configures Docker and Docker Compose.
 * Then it configures and enables the systemd services.
 * @returns String of the script
 */
function installAndStartupScript() {
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
