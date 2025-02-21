resource "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = data.aws_secretsmanager_secret.app_secrets.id

  secret_string = jsonencode({
    "DJANGO_SECRET_KEY" = jsondecode(data.aws_secretsmanager_secret_version.app_secrets_version.secret_string).DJANGO_SECRET_KEY
    "DB_URL"            = "postgres://${aws_db_instance.db.username}:${aws_db_instance.db.password}@${aws_db_instance.db.endpoint}:${aws_db_instance.db.port}/${aws_db_instance.db.name}"
    "DB_USER"           = aws_db_instance.db.username
    "DB_PASSWORD"       = aws_db_instance.db.password
    "DB_PORT"           = aws_db_instance.db.port
    "DB_NAME"           = aws_db_instance.db.name
    "DB_HOST"           = aws_db_instance.db.endpoint
  })
}

data "aws_secretsmanager_secret" "github_access_token" {
  name = "github-access-token"
}

data "aws_secretsmanager_secret_version" "github_access_token" {
  secret_id = data.aws_secretsmanager_secret.github_access_token.id
}
