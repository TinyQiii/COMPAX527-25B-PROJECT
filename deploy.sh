#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- SECTION 1: SYSTEM & PACKAGE SETUP ---

echo "--- Updating system packages ---"
sudo yum update -y

echo "--- Installing core system tools ---"
sudo yum install -y httpd python3-pip snapd

# --- SECTION 2: PYTHON DEPENDENCIES ---

echo "--- Installing Python dependencies from requirements.txt ---"
# It's best practice to use a requirements.txt file for Python dependencies.
# Create a requirements.txt file in your project with the following content:
# pandas
# python-dateutil==2.9.0
# boto3
# Note: The version of python-dateutil should be managed here.

pip3 install -r requirements.txt

# --- SECTION 3: NODE.JS DEPENDENCIES ---

echo "--- Installing Node.js dependencies from package.json ---"
# The 'npm install' command reads package.json and installs all dependencies.
# The `npm install <package>` commands are not needed if they are in your package.json.
npm install

# --- SECTION 4: APPLICATION START ---

echo "--- Starting Node.js application with PM2 ---"
# This assumes your PM2 configuration file is set up correctly for the 'covid19' process.
# This also assumes you've already configured PM2 to run as a service.
pm2 start covid19

echo "--- Deployment completed successfully ---"
