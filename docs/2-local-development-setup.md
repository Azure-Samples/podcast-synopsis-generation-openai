# Local Development Setup

This guide helps you to run the application locally.

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Repository Structure](#2-repository-structure)
3. [Running project locally](#3-running-project-locally)
   1. [1. Create a python environment.](#1-create-a-python-environment.)
   2. [2. Run Function App.](#2-run-function-app)
   3. [3. Starting Website](#3-starting-website)
4. [Next steps](#next-steps)

## 1. Prerequisites

1. [VS Code](https://code.visualstudio.com/Download)
2. [Python 3.8.+](https://www.python.org/downloads/)
3. [Python Extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python)
4. [npm](https://nodejs.org/en/download)
5. [Azure Functions core tools 4.0.+](https://github.com/Azure/azure-functions-core-tools)
6. [Azure subscription](https://portal.azure.com)

## 2. Repository Structure

The `src/` directory contains:

- `terraform/` - project that contains infrastucture-as-code (IaC). See this [guide](./1-infrastructure-deployment.md) for more details.
- `functions/` - [Azure Functions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview) app that contains 3 functions to help with uploading, transcribing, and generation.
- `website` - [React](https://react.dev/) web application

## 3. Running project locally

### 1. Create a python environment.

Using VS Code, open the command palette (_Ctrl+Shift+P_).

1. Type `Python`
2. Select `Python: Create Environment` See [Create Environment](https://code.visualstudio.com/docs/python/environments#_creating-environments) for more details.

If presented with a choice between creating a venv or a conda environment, select venv.

The VS Code wizard will ask if you want to install requirements from _requirements.txt_. Select `yes`.

### 2. Run Function App

Update `src/functions/local.settings.json` file. Values can be found in Azure Portal.

Sample file:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "AzureWebJobsStorage": "DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net",
    "STORAGE_ACCOUNT_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net",
    "AUDIO_FILE_UPLOAD_CONTAINER": "raw-files",
    "TRANSCRIPTION_FILE_UPLOAD_CONTAINER": "transcription",
    "OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER": "open-ai-results",
    "SPEECH_KEY": "yourspeechkey",
    "SPEECH_REGION": "yourspeechregion",
    "OPENAI_KEY": "youropenaikey",
    "OPENAI_ENDPOINT": "https://youropenairegion.api.cognitive.microsoft.com/",
    "FILE_SHARE_MOUNT_PATH": "../terraform/data/functions-file-share"
  }
}
```

Change directories to src/functions:

```bash
cd src/functions
```

Open a terminal window and type

```bash
func start --python --port 5000
```

### 3. Starting Website

Change directories to `src/website`

Set `API_SERVER_URL` in the [config file](../src/website/src/core/config.js) is configured to the correct port. This is the port the WebApiHttpTrigger is running on.

Install all the package dependencies by running:

```bash
npm install
```

Start the application by executing:

```bash
npm run start
```

## Next steps

Use GitHub actions to deploy to Azure [GitHub Workflows](./3-github-workflows.md)
