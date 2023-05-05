# GitHub Workflows

This repository contains three GitHub workflows:

1. [azure-function-app.yml](../.github/workflows/azure-function-app.yml)
2. [azure-static-web-apps.yml](../.github/workflows/azure-static-web-apps.yml)
3. [terraform-apply.yml](../.github/workflows/terraform-apply.yml)

The terraform workflow is discussed in [this doc](./1-infrastructure-deployment.md).

## Azure Function App workflow

This workflow is manually triggered.

It does have some environment variables defined on lines 6-8. You will need to change `AZURE_FUNCTIONAPP_NAME` and possibly others depending on if you make updates to this sample.

This workflow contains 1 job named build-and-deploy.

The build-and-deploy job runs on any GitHub host running ubuntu-latest.

It runs 4 steps:

1. Checks out the source code
2. Sets up python
3. pip installs dependencies found in requirements.txt
4. Runs the [azure functions action](https://github.com/Azure/functions-action) to deploy the function

## Azure static web apps workflow

This workflow is manually triggered.

It does have some environment variables defined on lines 11-12.

This work requires two repository secrets:

1. You will need to [add a secret to your repository](https://docs.github.com/en/rest/actions/secrets?apiVersion=2022-11-28) named PRODUCTION_API_SERVER_URL

   This should be set to your function app's base URL.

2. After you've done your infrastructure pipeline, go to the Azure portal and find your static website. In the overview tab, select "Management deployment token" and copy the value.

   ![management-token](/docs/media/deployment-token.png)

   Go to Github and create a secret called "AZURE_STATIC_WEB_APPS_API_TOKEN" and paste in the deployment token as the secret's value.

This workflow contains 1 job named build-and-deploy.

The build-and-deploy job runs on any GitHub host running ubuntu-latest.

It runs 2 steps:

1. Checks out the source code
2. Deploys static web app
