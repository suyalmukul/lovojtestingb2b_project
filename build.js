const { execSync } = require('child_process');
const fs = require('fs');

// Step 1: Install dependencies
console.log('Installing dependencies...');
execSync('npm install');

// Step 2: Build the project
console.log('Building the project...');
execSync('npm run build');

// Step 3: Create a build folder
console.log('Creating build folder...');
fs.mkdirSync('build');

// Step 4: Move necessary files to the build folder
console.log('Moving files to build folder...');
const filesToMove = ['file1.js', 'file2.js']; // Add the filenames or paths of the files you want to move
filesToMove.forEach((file) => {
  fs.renameSync(file, `build/${file}`);
});

console.log('Build folder created successfully!');
