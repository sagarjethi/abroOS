#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Vercel build script...');

try {
  // Build the ZK prover first
  console.log('📦 Building ZK prover...');
  execSync('node scripts/build-zk-prover.js', { stdio: 'inherit' });
  
  // Now run Next.js build
  console.log('🏗️ Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build complete!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 