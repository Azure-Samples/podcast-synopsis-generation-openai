# Infrastructure Deployment and Configuration

This guide helps with downloading the code base and deploying the infrastructure.

## Table of contents

1. [Pulling the Code](#pulling-the-code)
2. [Infrastructure Deployment](#infrastructure-deployment)
   1. [Prerequisites](#prerequisites)
   2. [Setup and Deploy resources](#setup-and-deploy-resources)
      1. [Pre-deployment step](#pre-deployment-step)
      2. [Deploy Resources](#deploy-resources)
3. [Next steps](#next-steps)

## Pulling the Code

Clone the following [Project GitHub Repo](https://github.com/Azure-Samples/Building-a-pipeline-for-processing-media-files-using-Azure-OpenAI-for-analysis) to your local machine:

```git
git clone https://github.com/Azure-Samples/Building-a-pipeline-for-processing-media-files-using-Azure-OpenAI-for-analysis
```

## Infrastructure Deployment

_Infrastructure-as-Code_ (IaC) is located under `src/terraform` folder and deployed using Terraform CLI. To learn more about Terraform see [Get Started - Azure](https://developer.hashicorp.com/terraform/tutorials/azure-get-started)

### Prerequisites

- Azure Subscription with Admin level access.
- Azure CLI installed locally. Required Azure CLI version 2.20.0 or later. See [Install Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) for more details.

### Setup and Deploy resources

It is required to login to Azure before deploying any resources. Open up cloned project with VS Code. Open a terminal window in VS Code and login to Azure:

#### Pre-deployment step

1. Type `az login` to login your Azure Cloud Account.
2. Set the right Azure Subscription if you have more then one subscription.

```bash
az account set --subscription <subscription-id>
```

#### Deploy Resources

Navigate to the `src/terraform` folder in the terminal window. Type following Terraform command to deploy initial resources to the Azure. This command will deploy resources to the _westus_. Change it to your deployment location if it is different by update `variables.tf`.

```bash
terraform plan
terraform apply
```

_Note: It will take some time to deploy all of the resources. Once the deployment is complete you can verify all the deployed resource by going to Azure Portal._

## Next steps

Go to the next step to setup local development environment. [Local Development Setup](./2-local-development-setup.md)
