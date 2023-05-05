variable "env" {
  type    = string
  default = "development"
}

variable "resource_group_name" {
  type    = string
  default = "podabstract-demo-rg"
}

variable "region" {
  type    = string
  default = "West US"
}

variable "storage_account_name" {
  type    = string
  default = "podabstractdemo"
}

variable "function_app_name" {
  type    = string
  default = "podabstract"
}

