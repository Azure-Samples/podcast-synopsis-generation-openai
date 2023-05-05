terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.48.0"
    }
  }

  # If you're using Azure Storage account for maintaining state file,
  # please set ARM_ACCESS_KEY
  # See for more details: https://developer.hashicorp.com/terraform/language/settings/backends/azurerm#access_key
  # backend "azurerm" {
  #   resource_group_name  = "YOUR_RESOURCE_GROUP_NAME"
  #   storage_account_name = "YOUR_STORAGE_ACCOUNT_NAME"
  #   container_name       = "NAME_OF_STORAGE_CONTAINER"
  #   key                  = "prod.terraform.tfstate"
  # }

  required_version = ">= 1.1.0"
}

provider "azurerm" {
  features {}
}

# == Random prefix =====================================================
resource "random_string" "unique_prefix" {
  upper   = false
  special = false
  length  = 5
}


# == Resource group ====================================================

resource "azurerm_resource_group" "podabstract" {
  name     = var.resource_group_name
  location = var.region

  tags = {
    env = var.env
  }
}


# == Storage account ====================================================

resource "azurerm_storage_account" "podabstract" {
  name                     = "${var.storage_account_name}${random_string.unique_prefix.result}sa"
  resource_group_name      = azurerm_resource_group.podabstract.name
  location                 = azurerm_resource_group.podabstract.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "POST", "PUT", "DELETE", "HEAD", "MERGE", "OPTIONS", "PATCH"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = "86400"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    env = var.env
  }
}

resource "azurerm_storage_container" "podabstract_raw_files" {
  name                  = "raw-files"
  storage_account_name  = azurerm_storage_account.podabstract.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "podabstract_transcription" {
  name                  = "transcription"
  storage_account_name  = azurerm_storage_account.podabstract.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "podabstract_openai" {
  name                  = "open-ai-results"
  storage_account_name  = azurerm_storage_account.podabstract.name
  container_access_type = "private"
}

resource "azurerm_storage_share" "podabstract" {
  name                 = "functions-fs"
  storage_account_name = azurerm_storage_account.podabstract.name
  quota                = 10
}

resource "azurerm_storage_share_file" "podabstract" {
  name             = "ffmpeg"
  storage_share_id = azurerm_storage_share.podabstract.id
  source           = "data/functions-file-share/ffmpeg"
}

# == Website =========================================================
resource "azurerm_static_site" "podabstract" {
  name                = "main-website"
  resource_group_name = azurerm_resource_group.podabstract.name
  location            = "centralus"
  sku_tier            = "Standard"
  sku_size            = "Standard"

  identity {
    type = "SystemAssigned"
  }

  tags = {
    env = var.env
  }
}


# == Function app ====================================================

resource "azurerm_service_plan" "podabstract" {
  name                = "func-app-asp"
  resource_group_name = azurerm_resource_group.podabstract.name
  location            = azurerm_resource_group.podabstract.location
  os_type             = "Linux"
  sku_name            = "P1v2"

  tags = {
    env = var.env
  }
}

resource "azurerm_linux_function_app" "podabstract" {
  name                       = "${var.function_app_name}-${random_string.unique_prefix.result}-func-app"
  resource_group_name        = azurerm_resource_group.podabstract.name
  location                   = azurerm_resource_group.podabstract.location
  storage_account_name       = azurerm_storage_account.podabstract.name
  storage_account_access_key = azurerm_storage_account.podabstract.primary_access_key
  service_plan_id            = azurerm_service_plan.podabstract.id
  builtin_logging_enabled    = true

  site_config {
    always_on = true

    cors {
      allowed_origins = ["*"]
    }

    application_stack {
      python_version = "3.9"
    }
  }

  storage_account {
    access_key   = azurerm_storage_account.podabstract.primary_access_key
    name         = azurerm_storage_account.podabstract.name
    account_name = azurerm_storage_account.podabstract.name
    share_name   = azurerm_storage_share.podabstract.name
    type         = "AzureFiles"
    mount_path   = "/mnt/share-files"
  }

  app_settings = {
    "STORAGE_ACCOUNT_CONNECTION_STRING"     = azurerm_storage_account.podabstract.primary_connection_string
    "AUDIO_FILE_UPLOAD_CONTAINER"           = azurerm_storage_container.podabstract_raw_files.name
    "TRANSCRIPTION_FILE_UPLOAD_CONTAINER"   = azurerm_storage_container.podabstract_transcription.name
    "OPENAI_INSIGHTS_FILE_UPLOAD_CONTAINER" = azurerm_storage_container.podabstract_openai.name
    "SPEECH_KEY"                            = azurerm_cognitive_account.podabstract_speech.primary_access_key
    "SPEECH_REGION"                         = azurerm_cognitive_account.podabstract_speech.location
    "OPENAI_KEY"                            = azurerm_cognitive_account.podabstract_oai.primary_access_key
    "OPENAI_ENDPOINT"                       = azurerm_cognitive_account.podabstract_oai.endpoint
    "FILE_SHARE_MOUNT_PATH"                 = "/mnt/share-files"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    env = var.env
  }
}


# == Cognitive Services ====================================================

resource "azurerm_cognitive_account" "podabstract_speech" {
  name                = "podabstract-${random_string.unique_prefix.result}-speech-service"
  location            = azurerm_resource_group.podabstract.location
  resource_group_name = azurerm_resource_group.podabstract.name
  kind                = "SpeechServices"
  sku_name            = "S0"

  identity {
    type = "SystemAssigned"
  }

  tags = {
    env = var.env
  }
}

resource "azurerm_cognitive_account" "podabstract_oai" {
  name                = "podabstract-${random_string.unique_prefix.result}-openai"
  location            = "South Central US"
  resource_group_name = azurerm_resource_group.podabstract.name
  kind                = "OpenAI"
  sku_name            = "S0"

  identity {
    type = "SystemAssigned"
  }

  tags = {
    env = var.env
  }
}
