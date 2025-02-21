#!/bin/bash
set -e

# Deployment-Pfad
WORK_TREE="/var/www/backend"
GIT_DIR="/var/git/backend.git"

# Checkout und Backend-Setup
git --work-tree=$WORK_TREE --git-dir=$GIT_DIR checkout -f
cd $WORK_TREE
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

# Backend-Service neu starten
systemctl restart backend.service
echo "Backend deployed successfully!"
