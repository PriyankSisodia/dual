#!/bin/bash

# Replace YOUR_USERNAME with your actual GitHub username
GITHUB_USERNAME="YOUR_USERNAME"

echo "Setting up GitHub remote..."
git remote add origin https://github.com/${GITHUB_USERNAME}/dual.git 2>/dev/null || git remote set-url origin https://github.com/${GITHUB_USERNAME}/dual.git

echo "Pushing to GitHub..."
git push -u origin main

