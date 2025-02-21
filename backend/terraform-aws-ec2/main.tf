data "aws_secretsmanager_secret" "app_secrets" {
  name = "orgagps-app-secrets"
}

data "aws_secretsmanager_secret_version" "app_secrets_version" {
  secret_id = data.aws_secretsmanager_secret.app_secrets.id
}

locals {
  app_secrets  = jsondecode(data.aws_secretsmanager_secret_version.app_secrets_version.secret_string)
  github_token = jsondecode(data.aws_secretsmanager_secret_version.github_access_token.secret_string).token
}

resource "tls_private_key" "github_ssh_key_backend" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "tls_private_key" "github_ssh_key_frontend" {
  algorithm = "RSA"
  rsa_bits  = 4096
}


resource "aws_db_instance" "db" {
  allocated_storage       = 20
  engine                  = "postgres"
  engine_version          = "16"
  instance_class          = "db.t3.micro"
  name                    = local.app_secrets.DB_NAME
  username                = local.app_secrets.DB_USER
  password                = local.app_secrets.DB_PASSWORD
  publicly_accessible     = false
  db_subnet_group_name    = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids  = [aws_security_group.db_sg.id]
  skip_final_snapshot     = true

  tags = {
    Name = "orgagps-db"
  }
}



resource "aws_instance" "orgagps" {
  depends_on = [aws_db_instance.db]

  ami               = var.ami_id
  instance_type     = var.instance_type
  subnet_id         = aws_subnet.main_subnet.id
  security_groups   = [aws_security_group.ec2_sg.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name
  key_name          = "orgagps-key-pair"

  user_data = <<-EOF
  #!/bin/bash
  # Logdatei initialisieren
  LOGFILE="/var/log/user-data.log"
  exec > >(tee -a $LOGFILE | logger -t user-data -s 2>/dev/console) 2>&1
  echo "Start of user data script" > $LOGFILE

  # Update packages and install necessary tools
  sudo apt-get update -y
  sudo apt-get install -y unzip curl jq git docker.io nginx
  sudo apt install -y postgresql-client-common postgresql-client

  sudo systemctl stop nginx || true
  sudo systemctl disable nginx || true

  # Prüfe und räume Port 80
  if lsof -i :80; then
    echo "Port 80 is in use. Stopping conflicting services..." >> $LOGFILE
    sudo fuser -k 80/tcp || true
  fi
  
  # AWS CLI installieren
  echo "Installing AWS CLI..." >> $LOGFILE
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip awscliv2.zip
  sudo ./aws/install
  rm -rf awscliv2.zip aws
  if ! command -v aws &> /dev/null; then
    echo "AWS CLI installation failed." >> $LOGFILE
    exit 1
  fi

  # Docker Compose installieren
  echo "Installing Docker Compose..." >> $LOGFILE
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
  if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose installation failed." >> $LOGFILE
    exit 1
  fi

  sudo mkdir -p /root/.ssh
  sudo chmod 700 /root/.ssh

  # Creation and save ssh keys frontend backend
  sudo ssh-keygen -t rsa -b 4096 -N "" -f /root/.ssh/id_rsa_backend
  sudo chmod 600 /root/.ssh/id_rsa_backend
  sudo ssh-keygen -t rsa -b 4096 -N "" -f /root/.ssh/id_rsa_frontend
  sudo chmod 600 /root/.ssh/id_rsa_frontend
  sudo ssh-keygen -y -f /root/.ssh/id_rsa_backend > /root/.ssh/id_rsa_backend.pub
  sudo ssh-keygen -y -f /root/.ssh/id_rsa_frontend > /root/.ssh/id_rsa_frontend.pub
  sudo ssh-keyscan github.com >> /root/.ssh/known_hosts
  sudo chmod 644 /root/.ssh/known_hosts

  export GITHUB_TOKEN=$(aws secretsmanager get-secret-value --secret-id github-access-token --query SecretString --output text | jq -r '.token')
  if [ -z "$GITHUB_TOKEN" ]; then
    echo "Failed to retrieve GitHub token from Secrets Manager." >> $LOGFILE
    exit 1
  fi

  # Delete all existing deploy keys
  delete_github_keys() {
    local repo=$1
    keys=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/orgaGPS-dev/$repo/keys)
    if [ -z "$keys" ] || [ "$keys" = "[]" ]; then
      echo "No deploy keys found for $repo."
      return
    fi
    echo "$keys" | jq -r '.[].id' | while read -r key_id; do
      curl -X DELETE -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/repos/orgaGPS-dev/$repo/keys/$key_id
      echo "Deleted key ID $key_id from $repo"
    done
  }

  delete_github_keys "backend" 
  delete_github_keys "frontend"

  # Upload new keys to GitHub
  upload_github_key() {
    local repo=$1
    local key_title=$2
    local key_path=$3
    curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
      -d "{\"title\": \"$key_title\", \"key\": \"$(cat $key_path)\"}" \
      https://api.github.com/repos/orgaGPS-dev/$repo/keys
  }

  upload_github_key "backend" "Backend Key" "/root/.ssh/id_rsa_backend.pub"
  upload_github_key "frontend" "Frontend Key" "/root/.ssh/id_rsa_frontend.pub"

  # Replace keys in AWS Secrets Manager
  aws secretsmanager update-secret --secret-id backend-ssh-key --secret-string "{\"backend-ssh-key\": \"$(cat /root/.ssh/id_rsa_backend | tr '\n' '\\n')\"}"
  aws secretsmanager update-secret --secret-id frontend-ssh-key --secret-string "{\"frontend-ssh-key\": \"$(cat /root/.ssh/id_rsa_frontend | tr '\n' '\\n')\"}"

  # Clone repositories using the new keys
  sudo GIT_SSH_COMMAND="ssh -i /root/.ssh/id_rsa_backend" git clone git@github.com:orgaGPS-dev/backend.git /app/backend
  sudo GIT_SSH_COMMAND="ssh -i /root/.ssh/id_rsa_frontend" git clone git@github.com:orgaGPS-dev/frontend.git /app/frontend
  
  sudo chmod +x /app/backend/entrypoint.sh
  sudo chmod +x /app/backend/scripts/wait-for-services.sh

  pip3 install flask

  # Webhook-Skript
  cat <<'EOL' > /app/backend/webhook-server.py
  from flask import Flask, request
  import subprocess
  app = Flask(__name__)
  @app.route('/github-webhook', methods=['POST'])
  def github_webhook():
      if request.method == 'POST':
          try:
              subprocess.run(["/bin/bash", "/app/backend/webhook-script.sh"], check=True)
              return "Webhook executed successfully", 200
          except subprocess.CalledProcessError as e:
              return f"Webhook execution failed: {e}", 500
      return "Method not allowed", 405
  if __name__ == "__main__":
      app.run(host="0.0.0.0", port=5000)
  EOL

  # Deployment-Skript
  cat <<'EOL' > /app/backend/webhook-script.sh
  #!/bin/bash
  REPO_DIR="/app/backend"
  cd $REPO_DIR || exit
  git fetch origin
  git reset --hard origin/main
  sudo systemctl restart gunicorn
  EOL
  chmod +x /app/backend/webhook-script.sh

  # Systemd Service
  cat <<'EOL' > /etc/systemd/system/webhook.service
  [Unit]
  Description=Flask Webhook Server
  After=network.target

  [Service]
  User=ubuntu
  WorkingDirectory=/app/backend
  ExecStart=/usr/bin/python3 /app/backend/webhook-server.py

  [Install]
  WantedBy=multi-user.target
  EOL
  systemctl daemon-reload
  systemctl enable webhook.service
  systemctl start webhook.service
  
  # Exportieren von CSRF_TRUSTED_ORIGINS
  export CSRF_TRUSTED_ORIGINS='["https://orgagps.com", "http://localhost:3000"]'

  # Exportieren von CORS_ALLOWED_ORIGINS
  export CORS_ALLOWED_ORIGINS='["https://orgagps.com", "http://localhost:3000"]'

  # Extrahiere spezifische Werte aus Secrets Manager direkt
  export DJANGO_SECRET_KEY=$(aws secretsmanager get-secret-value --secret-id orgagps-app-secrets --region eu-central-1 --query "SecretString" --output text | jq -r '.DJANGO_SECRET_KEY')
  if [ -z "$DJANGO_SECRET_KEY" ]; then
    echo "Failed to fetch DJANGO_SECRET_KEY from Secrets Manager." >> $LOGFILE
    exit 1
  fi

  export AWS_ACCESS_KEY_ID=$(aws secretsmanager get-secret-value --secret-id orgagps-app-secrets --region eu-central-1 --query "SecretString" --output text | jq -r '.AWS_ACCESS_KEY_ID')
  export AWS_SECRET_ACCESS_KEY=$(aws secretsmanager get-secret-value --secret-id orgagps-app-secrets --region eu-central-1 --query "SecretString" --output text | jq -r '.AWS_SECRET_ACCESS_KEY')
  export DB_NAME=$(aws secretsmanager get-secret-value --secret-id orgagps-app-secrets --region eu-central-1 --query "SecretString" --output text | jq -r '.DB_NAME')
  export DB_USER=$(aws secretsmanager get-secret-value --secret-id orgagps-app-secrets --region eu-central-1 --query "SecretString" --output text | jq -r '.DB_USER')
  export DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id orgagps-app-secrets --region eu-central-1 --query "SecretString" --output text | jq -r '.DB_PASSWORD')
  export DB_HOST=$(aws secretsmanager get-secret-value --secret-id orgagps-app-secrets --region eu-central-1 --query "SecretString" --output text | jq -r '.DB_HOST')
  export DB_PORT=$(aws secretsmanager get-secret-value --secret-id orgagps-app-secrets --region eu-central-1 --query "SecretString" --output text | jq -r '.DB_PORT')

  # Versuche, Secrets aus AWS Secrets Manager zu extrahieren
  echo "Fetching secrets from AWS Secrets Manager..." >> $LOGFILE
  
  # Gunicorn-Systemd-Service erstellen
  cat <<'EOL' > /etc/systemd/system/gunicorn.service
  [Unit]
  Description=gunicorn daemon for Django project
  After=network.target

  [Service]
  User=ubuntu
  Group=ubuntu
  WorkingDirectory=/app/backend
  ExecStart=/usr/bin/gunicorn --workers 3 --bind unix:/app/backend/gunicorn.sock orgagps.wsgi:application

  [Install]
  WantedBy=multi-user.target
  EOL
  
  # Gunicorn-Service aktivieren
  sudo cp /tmp/gunicorn.service /etc/systemd/system/gunicorn.service
  sudo systemctl daemon-reload
  sudo systemctl enable gunicorn
  sudo systemctl start gunicorn



  # Start Docker
  sudo systemctl enable docker
  sudo systemctl start docker

  sudo usermod -aG docker ubuntu

  # Docker Compose starten und Secrets als Umgebungsvariablen übergeben
  cd /app/backend
  sudo docker-compose up -d --build >> $LOGFILE 2>&1 || { echo "Docker Compose konnte nicht starten" >> $LOGFILE; exit 1; }

  # Warte, bis alle Docker-Container gestartet sind
  echo "Waiting for all Docker containers to start..." >> $LOGFILE
  for i in {1..10}; do
    if sudo docker-compose ps | grep "Up"; then
      echo "All containers are running." >> $LOGFILE
      break
    fi
    echo "Retrying to check container status... ($i)" >> $LOGFILE
    sleep 5
  done

  echo "Checking if the backend service is available..." >> $LOGFILE
  for i in {1..10}; do
    if curl -s http://127.0.0.1:8000/ > /dev/null; then
      echo "Backend service is up and running." >> $LOGFILE
      break
    fi
    echo "Backend service is not ready yet. Retrying... ($i)" >> $LOGFILE
    sleep 5
  done

  echo "Waiting for containers to be ready..." >> $LOGFILE
  sleep 10



  # Nginx-Konfiguration kopieren und aktivieren
  echo "Configuring Nginx with custom default.conf..." >> $LOGFILE
  sudo cp /app/backend/nginx/default.conf /etc/nginx/sites-available/default
  sudo ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
  sudo nginx -t || { echo "Nginx configuration test failed"; exit 1; }
  sudo systemctl restart nginx || { echo "Nginx failed to restart"; exit 1; }

  # Start Nginx
  sudo systemctl enable nginx
  sudo systemctl start nginx

  echo "User-data script finished." >> $LOGFILE



EOF

  tags = {
    Name = "orgagps"
  }
}



