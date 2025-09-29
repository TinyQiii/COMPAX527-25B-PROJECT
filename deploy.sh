#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Starting Automated Deployment Script ---"

# --- SECTION 1: SYSTEM UPDATES AND PREREQUISITES ---

echo "--- Updating system packages ---"
sudo yum update -y

echo "--- Installing EPEL repository via RPM ---"
# Check OS version to get the correct RPM link
if grep -q "release 7" /etc/redhat-release; then
    sudo wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
    sudo rpm -ihv epel-release-latest-7.noarch.rpm
elif grep -q "release 8" /etc/redhat-release; then
    sudo wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
    sudo rpm -ihv epel-release-latest-8.noarch.rpm
else
    echo "Warning: Could not determine RHEL/CentOS version. Attempting to install generic EPEL RPM."
    sudo wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm || true
    sudo rpm -ihv epel-release-latest-9.noarch.rpm || true
fi

# Clean yum cache to ensure the new repository is recognized
sudo yum clean all
sudo yum -y makecache

echo "--- Installing core system tools (httpd, python3-pip, snapd) ---"
sudo yum install -y httpd python3-pip snapd

# Start and enable the snapd service
echo "--- Starting and enabling the snapd service ---"
sudo systemctl enable --now snapd.socket

# --- SECTION 2: PYTHON DEPENDENCIES ---

echo "--- Installing Python dependencies from requirements.txt ---"
# This assumes you have a 'requirements.txt' file in your project directory
sudo pip3 install -r requirements.txt

# --- SECTION 3: NODE.JS DEPENDENCIES ---

echo "--- Installing Node.js dependencies from package.json ---"
# This assumes you have a 'package.json' file in your project directory
# and that Node.js and npm are already installed.
npm install

# --- SECTION 4: APPLICATION START ---

echo "--- Starting Node.js application with PM2 ---"
# This command starts your application using PM2.
# You must have PM2 configured to recognize the 'covid19' process.
pm2 start covid19

echo "--- Deployment completed successfully ---"
