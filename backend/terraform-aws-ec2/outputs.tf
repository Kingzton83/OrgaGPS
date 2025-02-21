output "instance_id" {
  value = aws_instance.orgagps.id
}

output "public_ip" {
  value = aws_instance.orgagps.public_ip
}

output "instance_profile" {
  value = aws_iam_instance_profile.ec2_instance_profile.arn
}

output "github_backend_ssh_public_key" {
  value = tls_private_key.github_ssh_key_backend.public_key_openssh
}

output "github_frontend_ssh_public_key" {
  value = tls_private_key.github_ssh_key_frontend.public_key_openssh
}

