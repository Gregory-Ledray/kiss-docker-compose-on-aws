# Test Plan
The test plan should be run prior to a new release. It includes manual verification steps which either can't be automated, or are not currently automated.

## Prepare and Run Automated Tests

```
npx projen
npx projen build
cdk destroy --app='./lib/integ.default.js'
```

## Manual Tests
```
cdk deploy --app='./lib/integ.default.js'
```

### Verify you can create and restore from an AMI after image is destoryed
1. npx projen build
2. cdk deploy --app='./lib/integ.default.js'
3. cdk destroy --app='./lib/integ.default.js'
4. Verify that there is an available Volume: https://us-east-2.console.aws.amazon.com/ec2/home?region=us-east-2#Volumes:
5. Create a Snapshot from the Volume
6. Create an AMI from the Snapshot. Some parameters:
Image Name: test for restore
Architecture: x86_64
Root device name: /dev/xvda
Virtualization Type: Hardware-assisted virtualization
Boot mode: Use default
Block device mappings:
- Volume 1: 8 GiB. gp3. 3000. 125 MB/s. Uncheck "delete on termination."
Click "Create Image"
7. Use that AMI ID in integ.from-ami.js
8. Set the account ID in integ.from-ami.js
9. Deploy integ.from-ami.ts to test creating an instance using the AMI:

```
cdk deploy --app='./lib/integ.from-ami.js'
```

10. Verify the deployment succeeded by ensuring that the website is reachable on the public IP address

11. Run destroy:
```
cdk destroy --app='./lib/integ.from-ami.js'
```

12. Verify that all resources have been deleted

