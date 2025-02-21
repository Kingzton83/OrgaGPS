#!/bin/bash

# Stop script on errors
set -e

# Initialize Terraform
terraform init

# Create a Terraform plan
echo "Creating Terraform plan..."
terraform plan

# Apply the Terraform configuration
echo "Applying Terraform configuration..."
terraform apply -auto-approve

echo "Deployment completed."
