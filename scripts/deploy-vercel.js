#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Vercel deployment...');

// Check if we're in a production environment
const isProd = process.argv.includes('--prod');

try {
  // Build the ZK prover first
  console.log('📦 Building ZK prover...');
  execSync('yarn build:zk-prover', { stdio: 'inherit' });
  
  // Prepare deployment command
  let deployCmd = 'vercel';
  
  // Add production flag if needed
  if (isProd) {
    console.log('🔴 Deploying to PRODUCTION');
    deployCmd += ' --prod';
  } else {
    console.log('🟢 Deploying to PREVIEW environment');
  }
  
  // Check for environment variables
  const envVars = [
    'OPENAI_API_KEY',
  ];
  
  // Add environment variables to deployment command
  for (const envVar of envVars) {
    const value = process.env[envVar] || '';
    if (value) {
      console.log(`✅ Found ${envVar} in environment`);
      deployCmd += ` -e ${envVar}="${value}"`;
    } else {
      console.log(`⚠️ Warning: ${envVar} not found in environment, creating a placeholder`);
      // For testing only - don't include real keys
      if (envVar === 'OPENAI_API_KEY') {
        deployCmd += ` -e ${envVar}="sk-placeholder-for-build-process"`;
      }
    }
  }
  
  // Add debug flags for more verbose output
  deployCmd += ' --debug';
  
  // Use --yes instead of deprecated --confirm
  deployCmd += ' --yes';
  
  console.log(`🚀 Executing deployment command: ${deployCmd}`);
  
  // Execute the deployment
  console.log('🚀 Executing deployment command...');
  execSync(deployCmd, { stdio: 'inherit' });
  
  console.log('✅ Deployment complete!');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 