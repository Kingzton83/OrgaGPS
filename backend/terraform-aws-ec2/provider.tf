provider "aws" {
  region = "eu-central-1"
}


terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "github" {
  token = jsondecode(data.aws_secretsmanager_secret_version.github_access_token.secret_string).token
  owner = "orgaGPS-dev"
}

resource "github_repository_deploy_key" "orgagps_backend_key" {
  repository = "backend"
  title      = "orgagps-backend-ec2-key"
  key        = tls_private_key.github_ssh_key_backend.public_key_openssh
  read_only  = false
}

resource "github_repository_deploy_key" "orgagps_frontend_key" {
  repository = "frontend"
  title      = "orgagps-frontend-ec2-key"
  key        = tls_private_key.github_ssh_key_frontend.public_key_openssh
  read_only  = false
}


