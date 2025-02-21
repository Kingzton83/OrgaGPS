resource "aws_iam_role" "ec2_role" {
  name = "orgagps-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_policy" "secrets_manager_policy" {
  name = "orgagps-secrets-access-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "secretsmanager:*"
        ],
        Resource = ["arn:aws:secretsmanager:eu-central-1:442426882318:secret:${var.github_secret_name}",
                "arn:aws:secretsmanager:eu-central-1:442426882318:secret:*" # optional für Debugging
                ]

      }
    ]
  })
}

resource "aws_iam_policy" "ec2_instance_connect_policy" {
  name = "orgagps-ec2-instance-connect-policy"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = "ec2-instance-connect:SendSSHPublicKey",
        Resource = "arn:aws:ec2:eu-central-1:442426882318:instance/*"  # Ersetze <ACCOUNT_ID> durch deine AWS-Kontonummer
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_secrets_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.secrets_manager_policy.arn
}

resource "aws_iam_role_policy_attachment" "attach_ec2_instance_connect_policy" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_instance_connect_policy.arn
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "orgagps-ec2-instance-profile-new"
  role = aws_iam_role.ec2_role.name
}
