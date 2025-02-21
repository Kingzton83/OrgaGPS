#!/bin/bash
set -e

# Deployment-Pfad
WORK_TREE="/var/www/frontend"
GIT_DIR="/var/git/frontend.git"

# Checkout und Build
git --work-tree=$WORK_TREE --git-dir=$GIT_DIR checkout -f
cd $WORK_TREE
npm install
npm run build
echo "Frontend deployed successfully!"
