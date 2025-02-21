#!/bin/bash

# Stop script on errors
set -e

sudo terraform destroy -auto-approve
sudo rm -rf .terraform .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup

# Confirm deletion
echo "All resources deleted successfully."
