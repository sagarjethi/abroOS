const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define paths
const rustCratePath = path.resolve(__dirname);
const outputPath = path.resolve(__dirname, 'pkg');

// Ensure wasm-pack is installed
try {
  execSync('which wasm-pack', { stdio: 'ignore' });
  console.log('✓ wasm-pack is installed');
} catch (error) {
  console.error('Error: wasm-pack is not installed.');
  console.log('Please install it by running: cargo install wasm-pack');
  process.exit(1);
}

// Build the Rust WASM module
console.log(`Building Rust WASM module in ${rustCratePath}...`);
try {
  execSync(`cd ${rustCratePath} && wasm-pack build --target web`, { stdio: 'inherit' });
  console.log('✓ Successfully built WASM module');
} catch (error) {
  console.error('Error building WASM module:', error.message);
  process.exit(1);
}

// Create types directory if it doesn't exist
const typesDir = path.resolve(process.cwd(), 'types');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Copy the TypeScript definitions from the pkg folder
const pkgDir = path.resolve(rustCratePath, 'pkg');
const typesFile = path.resolve(typesDir, 'zk_prover.d.ts');

try {
  if (fs.existsSync(path.resolve(pkgDir, 'zk_prover.d.ts'))) {
    fs.copyFileSync(
      path.resolve(pkgDir, 'zk_prover.d.ts'),
      typesFile
    );
    console.log('✓ Successfully copied TypeScript definitions');
  } else {
    console.warn('Warning: TypeScript definitions not found in pkg directory');
  }
} catch (error) {
  console.error('Error copying TypeScript definitions:', error.message);
}

console.log('Build completed successfully!'); 