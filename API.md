# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### KissDockerCompose <a name="KissDockerCompose" id="kiss-docker-compose.KissDockerCompose"></a>

#### Initializers <a name="Initializers" id="kiss-docker-compose.KissDockerCompose.Initializer"></a>

```typescript
import { KissDockerCompose } from 'kiss-docker-compose'

new KissDockerCompose(scope: Construct, id: string, props?: IKissDockerComposeProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#kiss-docker-compose.KissDockerCompose.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | - scope in which this resource is defined. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.Initializer.parameter.id">id</a></code> | <code>string</code> | - scoped id of the resource is used to prefix names to prevent naming conflicts. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.Initializer.parameter.props">props</a></code> | <code><a href="#kiss-docker-compose.IKissDockerComposeProps">IKissDockerComposeProps</a></code> | - resource properties, some of which are required. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="kiss-docker-compose.KissDockerCompose.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

scope in which this resource is defined.

---

##### `id`<sup>Required</sup> <a name="id" id="kiss-docker-compose.KissDockerCompose.Initializer.parameter.id"></a>

- *Type:* string

scoped id of the resource is used to prefix names to prevent naming conflicts.

---

##### `props`<sup>Optional</sup> <a name="props" id="kiss-docker-compose.KissDockerCompose.Initializer.parameter.props"></a>

- *Type:* <a href="#kiss-docker-compose.IKissDockerComposeProps">IKissDockerComposeProps</a>

resource properties, some of which are required.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#kiss-docker-compose.KissDockerCompose.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.cfnSignal">cfnSignal</a></code> | cfnSignal tells the CloudFormation stack we have finished initializing. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.dockerComposeAppService">dockerComposeAppService</a></code> | dockerComposeAppService is a systemd service which prepares, starts, and stops `docker-compose up`. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.dockerComposeSetup">dockerComposeSetup</a></code> | dockerComposeSetup is run by the systemd service in ExecStartPre. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.installAndStartupScript">installAndStartupScript</a></code> | installAndStartupScript first updates the system and installs and configures Docker and Docker Compose. |

---

##### `toString` <a name="toString" id="kiss-docker-compose.KissDockerCompose.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `cfnSignal` <a name="cfnSignal" id="kiss-docker-compose.KissDockerCompose.cfnSignal"></a>

```typescript
public cfnSignal(resource: string, awsStackName: string, awsRegion: string): string
```

cfnSignal tells the CloudFormation stack we have finished initializing.

See:
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-signal.html

###### `resource`<sup>Required</sup> <a name="resource" id="kiss-docker-compose.KissDockerCompose.cfnSignal.parameter.resource"></a>

- *Type:* string

The logical ID of the resource that contains the creations policy you want to signal.

---

###### `awsStackName`<sup>Required</sup> <a name="awsStackName" id="kiss-docker-compose.KissDockerCompose.cfnSignal.parameter.awsStackName"></a>

- *Type:* string

The stack name or stack ID that contains the resource you want to signal.

---

###### `awsRegion`<sup>Required</sup> <a name="awsRegion" id="kiss-docker-compose.KissDockerCompose.cfnSignal.parameter.awsRegion"></a>

- *Type:* string

The CloudFormation regional endpoint to use.

---

##### `dockerComposeAppService` <a name="dockerComposeAppService" id="kiss-docker-compose.KissDockerCompose.dockerComposeAppService"></a>

```typescript
public dockerComposeAppService(): string
```

dockerComposeAppService is a systemd service which prepares, starts, and stops `docker-compose up`.

A systemd service is used so that we can easily schedule it to start when the VM starts or reboots.

##### `dockerComposeSetup` <a name="dockerComposeSetup" id="kiss-docker-compose.KissDockerCompose.dockerComposeSetup"></a>

```typescript
public dockerComposeSetup(awsAccountNumber: string, ecrRegion: string, repos: string[]): string
```

dockerComposeSetup is run by the systemd service in ExecStartPre.

It logs into ECR and then pulls in the latest versions of the Docker images.

###### `awsAccountNumber`<sup>Required</sup> <a name="awsAccountNumber" id="kiss-docker-compose.KissDockerCompose.dockerComposeSetup.parameter.awsAccountNumber"></a>

- *Type:* string

is the account number where the images are stored.

---

###### `ecrRegion`<sup>Required</sup> <a name="ecrRegion" id="kiss-docker-compose.KissDockerCompose.dockerComposeSetup.parameter.ecrRegion"></a>

- *Type:* string

is the region where the images are stored.

---

###### `repos`<sup>Required</sup> <a name="repos" id="kiss-docker-compose.KissDockerCompose.dockerComposeSetup.parameter.repos"></a>

- *Type:* string[]

is the repository where the images are stored.

Pulled images are always `${repos[i]}:latest`

---

##### `installAndStartupScript` <a name="installAndStartupScript" id="kiss-docker-compose.KissDockerCompose.installAndStartupScript"></a>

```typescript
public installAndStartupScript(): string
```

installAndStartupScript first updates the system and installs and configures Docker and Docker Compose.

Then it configures and enables the systemd services.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#kiss-docker-compose.KissDockerCompose.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="kiss-docker-compose.KissDockerCompose.isConstruct"></a>

```typescript
import { KissDockerCompose } from 'kiss-docker-compose'

KissDockerCompose.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="kiss-docker-compose.KissDockerCompose.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#kiss-docker-compose.KissDockerCompose.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.property.regionOfEC2Instances">regionOfEC2Instances</a></code> | <code>string</code> | regionOfEC2Instances is the region in which the EC2 instance will be deployed. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.property.regionOfECR">regionOfECR</a></code> | <code>string</code> | regionOfECR is the region from which the ECR image will be pulled. |

---

##### `node`<sup>Required</sup> <a name="node" id="kiss-docker-compose.KissDockerCompose.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `regionOfEC2Instances`<sup>Required</sup> <a name="regionOfEC2Instances" id="kiss-docker-compose.KissDockerCompose.property.regionOfEC2Instances"></a>

```typescript
public readonly regionOfEC2Instances: string;
```

- *Type:* string

regionOfEC2Instances is the region in which the EC2 instance will be deployed.

---

##### `regionOfECR`<sup>Required</sup> <a name="regionOfECR" id="kiss-docker-compose.KissDockerCompose.property.regionOfECR"></a>

```typescript
public readonly regionOfECR: string;
```

- *Type:* string

regionOfECR is the region from which the ECR image will be pulled.

---




## Protocols <a name="Protocols" id="Protocols"></a>

### IKissDockerComposeProps <a name="IKissDockerComposeProps" id="kiss-docker-compose.IKissDockerComposeProps"></a>

- *Implemented By:* <a href="#kiss-docker-compose.IKissDockerComposeProps">IKissDockerComposeProps</a>

Allows overriding all default code, or a subset of it.

To customize, first get the default values for these properties (which are exported) and then make modifications from there.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#kiss-docker-compose.IKissDockerComposeProps.property.dockerComposeFileAsString">dockerComposeFileAsString</a></code> | <code>string</code> | Your Docker Compose file, stringified. |
| <code><a href="#kiss-docker-compose.IKissDockerComposeProps.property.ec2Instance">ec2Instance</a></code> | <code>aws-cdk-lib.aws_ec2.Instance</code> | Setting this value overrides and ignores the repositoriesForDockerComposeImages, vpc, ec2InstanceRole, and instanceSecurityGroup parameters. |
| <code><a href="#kiss-docker-compose.IKissDockerComposeProps.property.ec2InstanceRole">ec2InstanceRole</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | Setting this overrides the template's Role with which the ec2Instance is deployed. |
| <code><a href="#kiss-docker-compose.IKissDockerComposeProps.property.instanceSecurityGroup">instanceSecurityGroup</a></code> | <code>aws-cdk-lib.aws_ec2.SecurityGroup</code> | Setting this overrides the template's SecurityGroup with which the ec2Instance is deployed. |
| <code><a href="#kiss-docker-compose.IKissDockerComposeProps.property.repositoriesForDockerComposeImages">repositoriesForDockerComposeImages</a></code> | <code>aws-cdk-lib.aws_ecr.Repository[]</code> | ECR repositories containing images used for your Docker Compose application. |
| <code><a href="#kiss-docker-compose.IKissDockerComposeProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.Vpc</code> | Setting this overrides the template's VPC into which the ec2Instance is deployed. |

---

##### `dockerComposeFileAsString`<sup>Required</sup> <a name="dockerComposeFileAsString" id="kiss-docker-compose.IKissDockerComposeProps.property.dockerComposeFileAsString"></a>

```typescript
public readonly dockerComposeFileAsString: string;
```

- *Type:* string

Your Docker Compose file, stringified.

This is copied to the EC2 instance without modification

---

##### `ec2Instance`<sup>Optional</sup> <a name="ec2Instance" id="kiss-docker-compose.IKissDockerComposeProps.property.ec2Instance"></a>

```typescript
public readonly ec2Instance: Instance;
```

- *Type:* aws-cdk-lib.aws_ec2.Instance

Setting this value overrides and ignores the repositoriesForDockerComposeImages, vpc, ec2InstanceRole, and instanceSecurityGroup parameters.

This is the EC2 Instance used by this CDK.

---

##### `ec2InstanceRole`<sup>Optional</sup> <a name="ec2InstanceRole" id="kiss-docker-compose.IKissDockerComposeProps.property.ec2InstanceRole"></a>

```typescript
public readonly ec2InstanceRole: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

Setting this overrides the template's Role with which the ec2Instance is deployed.

---

##### `instanceSecurityGroup`<sup>Optional</sup> <a name="instanceSecurityGroup" id="kiss-docker-compose.IKissDockerComposeProps.property.instanceSecurityGroup"></a>

```typescript
public readonly instanceSecurityGroup: SecurityGroup;
```

- *Type:* aws-cdk-lib.aws_ec2.SecurityGroup

Setting this overrides the template's SecurityGroup with which the ec2Instance is deployed.

---

##### `repositoriesForDockerComposeImages`<sup>Optional</sup> <a name="repositoriesForDockerComposeImages" id="kiss-docker-compose.IKissDockerComposeProps.property.repositoriesForDockerComposeImages"></a>

```typescript
public readonly repositoriesForDockerComposeImages: Repository[];
```

- *Type:* aws-cdk-lib.aws_ecr.Repository[]

ECR repositories containing images used for your Docker Compose application.

This is primarily used for pre-pulling images before starting the application to make sure the current image is up to date. If you do not have ECR images you can leave this as an empty array - [] - if you set this to null then the default image repos will be created.
Default image repos are probably not what you want: `${lowercaseAppName}-frontend`, `${lowercaseAppName}-backend`, `${lowercaseAppName}-db`.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="kiss-docker-compose.IKissDockerComposeProps.property.vpc"></a>

```typescript
public readonly vpc: Vpc;
```

- *Type:* aws-cdk-lib.aws_ec2.Vpc

Setting this overrides the template's VPC into which the ec2Instance is deployed.

---

