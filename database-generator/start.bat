@echo off
title Database Generator - Last Epoch Game Data Builder

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found
    echo Make sure you're running this from the database-generator directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Launch the database generator
echo Starting Database Generator...
node index.js

REM Keep console open if there was an error
if errorlevel 1 (
    echo.
    echo ❌ Application exited with error
    pause
)