#!/usr/bin/env node

/**
 * Vercel Build Script
 * 
 * This script prepares the abroOS project for deployment on Vercel.
 * It ensures that:
 * 1. The ZK Prover WASM files are properly built and copied
 * 2. The environment variables are properly configured
 * 3. The next.js build process can handle client-side only features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Vercel build process for abroOS...');

// Check if we need to build the ZK Prover
const shouldBuildZkProver = process.env.BUILD_ZK_PROVER === 'true';

// Ensure build directories exist
const publicDir = path.join(__dirname, '../public');
const wasmDir = path.join(publicDir, 'wasm');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('Created public directory');
}

if (!fs.existsSync(wasmDir)) {
  fs.mkdirSync(wasmDir, { recursive: true });
  console.log('Created wasm directory');
}

// Copy ZK Prover WASM files to public/wasm directory
try {
  const zkProverPkgDir = path.join(__dirname, '../zk-prover/pkg');
  if (fs.existsSync(zkProverPkgDir)) {
    const wasmFiles = fs.readdirSync(zkProverPkgDir).filter(file => file.endsWith('.wasm'));
    
    for (const wasmFile of wasmFiles) {
      const sourcePath = path.join(zkProverPkgDir, wasmFile);
      const destPath = path.join(wasmDir, wasmFile);
      
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${wasmFile} to public/wasm directory`);
    }
  } else {
    console.log('ZK Prover package directory not found, skipping WASM file copy');
  }
} catch (error) {
  console.warn('Warning: Failed to copy WASM files to public directory:', error.message);
}

// Create a .env.local file with necessary variables
const envFilePath = path.join(__dirname, '../.env.local');
const envContent = `
# Environment variables for Vercel deployment
NEXT_PUBLIC_IS_DEMO_MODE=true
NEXT_PUBLIC_APP_VERSION=${process.env.npm_package_version || '0.0.1'}
`;

fs.writeFileSync(envFilePath, envContent);
console.log('Created .env.local file for Vercel deployment');

// Run the Next.js build command
try {
  console.log('🏗️ Building Next.js application...');
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed successfully');
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}

console.log('✅ Vercel build process completed successfully!'); 