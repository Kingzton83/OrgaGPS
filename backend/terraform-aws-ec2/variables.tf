variable "instance_type" {
  description = "Type of instance to launch"
  type        = string
  default     = "t2.micro"
}

variable "ami_id" {
  description = "Amazon Machine Image (AMI) ID for the instance"
  type        = string
  default     = "ami-0084a47cc718c111a"  # Change to a valid AMI ID
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for the subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "github_secret_name" {
  description = "AWS Secrets Manager secret name for GitHub SSH key"
  type        = string
  default     = "orgagps-app-secrets"
}

