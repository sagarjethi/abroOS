const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure we're in the project root
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

// Build the ZK prover
console.log('Building ZK prover...');
try {
  // Build the Rust code
  execSync('cd zk-prover && wasm-pack build --target web', { stdio: 'inherit' });
  
  // Copy the built files to the pkg directory
  const pkgDir = path.join(projectRoot, 'zk-prover', 'pkg');
  if (!fs.existsSync(pkgDir)) {
    fs.mkdirSync(pkgDir, { recursive: true });
  }

  // Create package.json for the pkg directory
  const pkgJson = {
    name: 'zk-prover',
    version: '0.1.0',
    description: 'Zero-knowledge proof generator for human typing patterns',
    main: 'zk_prover.js',
    types: 'zk_prover.d.ts',
    files: [
      'zk_prover_bg.wasm',
      'zk_prover.js',
      'zk_prover.d.ts'
    ],
    scripts: {
      prepare: 'wasm-pack build --target web'
    },
    keywords: ['wasm', 'zero-knowledge', 'proofs'],
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'https://github.com/yourusername/abro-os'
    }
  };

  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify(pkgJson, null, 2)
  );

  console.log('ZK prover built successfully!');
} catch (error) {
  console.error('Error building ZK prover:', error);
  process.exit(1);
} 