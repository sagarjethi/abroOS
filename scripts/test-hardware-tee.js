#!/usr/bin/env node

/**
 * Hardware TEE Test Script
 * 
 * This script tests the availability and functionality of hardware
 * TEE implementations on the current system.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Platform-specific checks
const platform = os.platform();
console.log(`\n🔍 Checking Hardware TEE support on ${platform}...\n`);

// Check for Intel SGX
function checkIntelSGX() {
  console.log('🛡️  Checking Intel SGX availability:');
  try {
    if (platform === 'win32') {
      console.log('  Running on Windows - please use Intel SGX Detection Tool');
      return false;
    } else if (platform === 'linux') {
      // Check for SGX support via CPUID
      console.log('  Checking CPU support for SGX via cpuid...');
      try {
        const cpuidOutput = execSync('cpuid | grep -i sgx', { encoding: 'utf-8' });
        if (cpuidOutput.includes('SGX')) {
          console.log('  ✅ CPU supports SGX');
          
          // Check for SGX driver
          try {
            const dmesgOutput = execSync('dmesg | grep -i sgx', { encoding: 'utf-8' });
            if (dmesgOutput.includes('sgx')) {
              console.log('  ✅ SGX driver detected');
              return true;
            }
          } catch (e) {
            console.log('  ❌ SGX driver not detected');
          }
        } else {
          console.log('  ❌ CPU does not support SGX');
        }
      } catch (e) {
        console.log('  ⚠️  Could not determine SGX support (cpuid may not be installed)');
      }
    } else if (platform === 'darwin') {
      console.log('  ❌ Intel SGX is not supported on macOS');
    }
  } catch (error) {
    console.error('  ❌ Error checking SGX:', error.message);
  }
  return false;
}

// Check for ARM TrustZone
function checkARMTrustZone() {
  console.log('🛡️  Checking ARM TrustZone availability:');
  try {
    // Check if running on ARM architecture
    const arch = os.arch();
    if (arch.includes('arm') || arch.includes('aarch64')) {
      console.log('  ✅ Running on ARM architecture');
      
      // On Linux, check for /dev/trustzone
      if (platform === 'linux') {
        try {
          if (fs.existsSync('/dev/trustzone')) {
            console.log('  ✅ TrustZone device node detected');
            return true;
          } else {
            console.log('  ⚠️  TrustZone device node not found, but may still be supported');
          }
        } catch (e) {
          console.log('  ⚠️  Could not check for TrustZone device node');
        }
      } else if (platform === 'android') {
        // Android devices generally support TrustZone
        console.log('  ✅ Android detected, TrustZone likely available');
        return true;
      }
      
      // For ARM systems, assume TrustZone is potentially available
      console.log('  ℹ️  ARM detected, TrustZone may be available but requires specific testing');
      return true;
    } else {
      console.log('  ❌ Not running on ARM architecture');
    }
  } catch (error) {
    console.error('  ❌ Error checking TrustZone:', error.message);
  }
  return false;
}

// Check for AMD SEV
function checkAMDSEV() {
  console.log('🛡️  Checking AMD SEV availability:');
  try {
    if (platform === 'linux') {
      // Check for AMD CPU
      const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'utf-8');
      if (cpuInfo.includes('AuthenticAMD')) {
        console.log('  ✅ AMD CPU detected');
        
        // Check for SEV support
        try {
          if (fs.existsSync('/dev/sev')) {
            console.log('  ✅ SEV device detected');
            return true;
          } else {
            console.log('  ❌ SEV device not found');
          }
        } catch (e) {
          console.log('  ⚠️  Could not check for SEV device');
        }
      } else {
        console.log('  ❌ Not running on AMD CPU');
      }
    } else {
      console.log('  ⚠️  SEV detection only supported on Linux');
    }
  } catch (error) {
    console.error('  ❌ Error checking SEV:', error.message);
  }
  return false;
}

// Check for WebAssembly SIMD support (useful for the TEE bridge)
function checkWasmSIMD() {
  console.log('🧩 Checking WebAssembly SIMD support:');
  try {
    // This would typically be done in the browser, but we're checking node support
    if (typeof WebAssembly === 'object' && 
        typeof WebAssembly.validate === 'function') {
      // SIMD test module (binary representation of SIMD instructions)
      const simdTest = new Uint8Array([
        0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,
        2,1,0,7,8,1,4,116,101,115,116,0,0,10,15,
        1,13,0,65,0,253,17,65,1,253,17,253,186,1,11
      ]);
      
      const supported = WebAssembly.validate(simdTest);
      if (supported) {
        console.log('  ✅ WebAssembly SIMD supported');
        return true;
      } else {
        console.log('  ❌ WebAssembly SIMD not supported');
      }
    } else {
      console.log('  ❌ WebAssembly not supported');
    }
  } catch (error) {
    console.error('  ❌ Error checking WebAssembly SIMD:', error.message);
  }
  return false;
}

// Create a simple test app directory structure if it doesn't exist
function createTestAppStructure() {
  const testDir = path.join(process.cwd(), 'native-modules');
  const sgxDir = path.join(testDir, 'sgx-bridge');
  const tzDir = path.join(testDir, 'trustzone-app');
  
  try {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
      console.log('📁 Created native-modules directory');
    }
    
    if (!fs.existsSync(sgxDir)) {
      fs.mkdirSync(sgxDir);
      console.log('📁 Created sgx-bridge directory');
      
      // Create a simple Makefile
      fs.writeFileSync(path.join(sgxDir, 'Makefile'), 
        '# SGX Bridge Makefile\n\n' +
        'all:\n\techo "Building SGX bridge (simulation)"\n\tmkdir -p dist\n\techo "console.log(\\"SGX Bridge initialized\\")" > dist/sgx-bridge.js\n\nclean:\n\trm -rf dist\n');
      
      console.log('📄 Created SGX bridge Makefile');
    }
    
    if (!fs.existsSync(tzDir)) {
      fs.mkdirSync(tzDir);
      console.log('📁 Created trustzone-app directory');
      
      // Create a simple Makefile
      fs.writeFileSync(path.join(tzDir, 'Makefile'),
        '# TrustZone App Makefile\n\n' +
        'all:\n\techo "Building TrustZone app (simulation)"\n\ninstall:\n\techo "Installing TrustZone app (simulation)"\n\nclean:\n\techo "Cleaning TrustZone app"\n');
      
      console.log('📄 Created TrustZone app Makefile');
    }
  } catch (error) {
    console.error('❌ Error creating test directories:', error.message);
  }
}

// Run all checks
const sgxAvailable = checkIntelSGX();
console.log(''); // Empty line for readability
const trustZoneAvailable = checkARMTrustZone();
console.log(''); // Empty line for readability
const sevAvailable = checkAMDSEV();
console.log(''); // Empty line for readability
const wasmSIMDAvailable = checkWasmSIMD();

// Create the test structure
console.log('\n📦 Setting up test environment:');
createTestAppStructure();

// Summary
console.log('\n📊 Hardware TEE Summary:');
console.log(`  Intel SGX:     ${sgxAvailable ? '✅ Available' : '❌ Not available'}`);
console.log(`  ARM TrustZone: ${trustZoneAvailable ? '✅ Available' : '❌ Not available'}`);
console.log(`  AMD SEV:       ${sevAvailable ? '✅ Available' : '❌ Not available'}`);
console.log(`  WebAssembly SIMD: ${wasmSIMDAvailable ? '✅ Supported' : '❌ Not supported'}`);

if (!sgxAvailable && !trustZoneAvailable && !sevAvailable) {
  console.log('\n⚠️  No hardware TEE detected. The application will run in simulation mode.');
  console.log('   This is suitable for development but not for production use with sensitive data.');
} else {
  console.log('\n✅ Hardware TEE detected! The application can use hardware security features.');
  console.log('   Follow the instructions in lib/tee/HARDWARE_TEE_TESTING.md to get started.');
}

console.log('\n🏁 Test completed.\n'); 