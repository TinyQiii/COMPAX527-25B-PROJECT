#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Starting Automated Deployment Script ---"

# --- SECTION 1: SYSTEM UPDATES AND PREREQUISITES ---

echo "--- Updating system packages ---"
sudo yum update -y

echo "--- Installing EPEL repository via RPM ---"
if grep -q "release 7" /etc/redhat-release; then
    sudo wget -nc https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
    sudo rpm -ihv epel-release-latest-7.noarch.rpm
elif grep -q "release 8" /etc/redhat-release; then
    sudo wget -nc https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
    sudo rpm -ihv epel-release-latest-8.noarch.rpm
else
    echo "Warning: Could not determine RHEL/CentOS version. Attempting to install generic EPEL RPM."
    sudo wget -nc https://dl.fedoraproject.org/pub/epel/epel-release-latest-9.noarch.rpm || true
    sudo rpm -ihv epel-release-latest-9.noarch.rpm || true
fi

# Clean yum cache to ensure the new repository is recognized
sudo yum clean all
sudo yum -y makecache

echo "--- Installing core system tools (httpd, python3-pip) ---"
sudo yum install -y httpd python3-pip

echo "--- Manually installing snapd via RPM ---"
# This is a workaround for the 'snapd not found' error
# Note: The URL might need to be updated to match the latest version for your OS
sudo wget -nc http://mirror.centos.org/centos/8/PowerTools/x86_64/os/Packages/snapd-2.48-1.el8.x86_64.rpm
sudo rpm -ihv snapd-2.48-1.el8.x86_64.rpm

# Start and enable the snapd service
echo "--- Starting and enabling the snapd service ---"
sudo systemctl enable --now snapd.socket

# --- SECTION 2: PYTHON DEPENDENCIES ---

echo "--- Installing Python dependencies from requirements.txt ---"
sudo pip3 install -r requirements.txt

# --- SECTION 3: NODE.JS DEPENDENCIES ---

echo "--- Installing Node.js dependencies from package.json ---"
npm install

# --- SECTION 4: APPLICATION START ---

echo "--- Starting Node.js application with PM2 ---"
pm2 start covid19

echo "--- Deployment completed successfully ---"
