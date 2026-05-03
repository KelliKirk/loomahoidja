#!/usr/bin/env node
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

const seeders = [
  'seed-demo-users.js',
  'seed-demo-sitter-profiles.js',
  'seed-demo-sitter-animal-types.js',
  'demo-animals.js',
  'seed-demo-messages.js',
];

async function runSeeder(seedFile) {
  return new Promise((resolve, reject) => {
    const seedPath = path.join(__dirname, seedFile);
    const process = spawn('node', [seedPath]);

    let output = '';
    let errorOutput = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    process.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`${seedFile} exited with code ${code}: ${errorOutput}`));
      }
    });
  });
}

async function runAllSeeders() {
  console.log('🌾 Starting database seeding...\n');

  try {
    for (const seedFile of seeders) {
      console.log(`\n📍 Running: ${seedFile}`);
      console.log('─'.repeat(50));
      await runSeeder(seedFile);
    }

    console.log('\n' + '═'.repeat(50));
    console.log('✅ All seeders completed successfully!');
    console.log('═'.repeat(50));
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

runAllSeeders();
