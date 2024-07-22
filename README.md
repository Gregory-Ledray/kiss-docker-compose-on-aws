# KISS Docker Compose on AWS
Cheap. Simple. Fast.

Move your Docker Compose application from your local machine to the cloud in 3 minutes with KISS-Docker-Compose.

* Cheap: All code runs on one small EC2.
* Simple: It runs the same way on your machine as it runs in the cloud.
* Fast: Works by default.

## Usage


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