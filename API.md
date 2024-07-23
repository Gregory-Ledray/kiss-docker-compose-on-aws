# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### KissDockerCompose <a name="KissDockerCompose" id="kiss-docker-compose.KissDockerCompose"></a>

#### Initializers <a name="Initializers" id="kiss-docker-compose.KissDockerCompose.Initializer"></a>

```typescript
import { KissDockerCompose } from 'kiss-docker-compose'

new KissDockerCompose(scope: Construct, id: string, dockerComposeFileAsString: string, repositoriesForDockerComposeImages?: Repository[])
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#kiss-docker-compose.KissDockerCompose.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.Initializer.parameter.dockerComposeFileAsString">dockerComposeFileAsString</a></code> | <code>string</code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.Initializer.parameter.repositoriesForDockerComposeImages">repositoriesForDockerComposeImages</a></code> | <code>aws-cdk-lib.aws_ecr.Repository[]</code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="kiss-docker-compose.KissDockerCompose.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="kiss-docker-compose.KissDockerCompose.Initializer.parameter.id"></a>

- *Type:* string

---

##### `dockerComposeFileAsString`<sup>Required</sup> <a name="dockerComposeFileAsString" id="kiss-docker-compose.KissDockerCompose.Initializer.parameter.dockerComposeFileAsString"></a>

- *Type:* string

---

##### `repositoriesForDockerComposeImages`<sup>Optional</sup> <a name="repositoriesForDockerComposeImages" id="kiss-docker-compose.KissDockerCompose.Initializer.parameter.repositoriesForDockerComposeImages"></a>

- *Type:* aws-cdk-lib.aws_ecr.Repository[]

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#kiss-docker-compose.KissDockerCompose.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#kiss-docker-compose.KissDockerCompose.cfnSignal">cfnSignal</a></code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.createKeyPair">createKeyPair</a></code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.dockerComposeAppService">dockerComposeAppService</a></code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.dockerComposeSetup">dockerComposeSetup</a></code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.installAndStartupScript">installAndStartupScript</a></code> | *No description.* |

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

###### `resource`<sup>Required</sup> <a name="resource" id="kiss-docker-compose.KissDockerCompose.cfnSignal.parameter.resource"></a>

- *Type:* string

---

###### `awsStackName`<sup>Required</sup> <a name="awsStackName" id="kiss-docker-compose.KissDockerCompose.cfnSignal.parameter.awsStackName"></a>

- *Type:* string

---

###### `awsRegion`<sup>Required</sup> <a name="awsRegion" id="kiss-docker-compose.KissDockerCompose.cfnSignal.parameter.awsRegion"></a>

- *Type:* string

---

##### `createKeyPair` <a name="createKeyPair" id="kiss-docker-compose.KissDockerCompose.createKeyPair"></a>

```typescript
public createKeyPair(keyName: string): IKeyPair
```

###### `keyName`<sup>Required</sup> <a name="keyName" id="kiss-docker-compose.KissDockerCompose.createKeyPair.parameter.keyName"></a>

- *Type:* string

---

##### `dockerComposeAppService` <a name="dockerComposeAppService" id="kiss-docker-compose.KissDockerCompose.dockerComposeAppService"></a>

```typescript
public dockerComposeAppService(): string
```

##### `dockerComposeSetup` <a name="dockerComposeSetup" id="kiss-docker-compose.KissDockerCompose.dockerComposeSetup"></a>

```typescript
public dockerComposeSetup(awsAccountNumber: string, ecrRegion: string, repos: string[]): string
```

###### `awsAccountNumber`<sup>Required</sup> <a name="awsAccountNumber" id="kiss-docker-compose.KissDockerCompose.dockerComposeSetup.parameter.awsAccountNumber"></a>

- *Type:* string

---

###### `ecrRegion`<sup>Required</sup> <a name="ecrRegion" id="kiss-docker-compose.KissDockerCompose.dockerComposeSetup.parameter.ecrRegion"></a>

- *Type:* string

---

###### `repos`<sup>Required</sup> <a name="repos" id="kiss-docker-compose.KissDockerCompose.dockerComposeSetup.parameter.repos"></a>

- *Type:* string[]

---

##### `installAndStartupScript` <a name="installAndStartupScript" id="kiss-docker-compose.KissDockerCompose.installAndStartupScript"></a>

```typescript
public installAndStartupScript(): string
```

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
| <code><a href="#kiss-docker-compose.KissDockerCompose.property.regionOfEC2Instances">regionOfEC2Instances</a></code> | <code>string</code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.property.regionOfECR">regionOfECR</a></code> | <code>string</code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.property.appName">appName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#kiss-docker-compose.KissDockerCompose.property.lowercaseAppName">lowercaseAppName</a></code> | <code>string</code> | *No description.* |

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

---

##### `regionOfECR`<sup>Required</sup> <a name="regionOfECR" id="kiss-docker-compose.KissDockerCompose.property.regionOfECR"></a>

```typescript
public readonly regionOfECR: string;
```

- *Type:* string

---

##### `appName`<sup>Required</sup> <a name="appName" id="kiss-docker-compose.KissDockerCompose.property.appName"></a>

```typescript
public readonly appName: string;
```

- *Type:* string

---

##### `lowercaseAppName`<sup>Required</sup> <a name="lowercaseAppName" id="kiss-docker-compose.KissDockerCompose.property.lowercaseAppName"></a>

```typescript
public readonly lowercaseAppName: string;
```

- *Type:* string

---





