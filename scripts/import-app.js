#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');

// Paths relative to project root
const PAGES_DIR = 'src/pages/apps';
const COMPONENTS_DIR = 'src/components/apps';
const STYLES_DIR = 'src/styles';
const UTILS_DIR = 'src/utils';

async function importApp() {
    try {
        // Get source directory from command line argument
        const sourceDir = process.argv[2];
        if (!sourceDir) {
            console.error(chalk.red('Please provide the source directory path'));
            process.exit(1);
        }

        // Validate source directory exists
        if (!fs.existsSync(sourceDir)) {
            console.error(chalk.red(`Directory not found: ${sourceDir}`));
            process.exit(1);
        }

        // Get app details
        const { name, displayName, description } = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Enter the app ID (e.g., inventory_manager):',
                validate: input => /^[a-z0-9_]+$/.test(input) || 'App ID must contain only lowercase letters, numbers, and underscores'
            },
            {
                type: 'input',
                name: 'displayName',
                message: 'Enter the display name:',
                validate: input => input.length > 0 || 'Display name is required'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Enter app description:',
                validate: input => input.length > 0 || 'Description is required'
            }
        ]);

        // Create necessary directories
        const appPagesDir = path.join(PAGES_DIR, name);
        const appComponentsDir = path.join(COMPONENTS_DIR, name);
        
        console.log(chalk.blue('Creating directories...'));
        fs.ensureDirSync(appPagesDir);
        fs.ensureDirSync(appComponentsDir);

        // Copy files from source
        console.log(chalk.blue('Copying files...'));
        
        // Copy pages
        if (fs.existsSync(path.join(sourceDir, 'pages'))) {
            fs.copySync(path.join(sourceDir, 'pages'), appPagesDir);
        }

        // Copy components
        if (fs.existsSync(path.join(sourceDir, 'components'))) {
            fs.copySync(path.join(sourceDir, 'components'), appComponentsDir);
        }

        // Copy styles
        if (fs.existsSync(path.join(sourceDir, 'styles'))) {
            fs.copySync(
                path.join(sourceDir, 'styles'),
                path.join(STYLES_DIR, `${name}.css`)
            );
        }

        // Copy API utilities if they exist
        if (fs.existsSync(path.join(sourceDir, 'utils', 'api.js'))) {
            const apiContent = fs.readFileSync(path.join(sourceDir, 'utils', 'api.js'), 'utf8');
            fs.appendFileSync(
                path.join(UTILS_DIR, 'api.js'),
                `\n\n// ${displayName} API\n${apiContent}`
            );
        }

        // Register app in DynamicAppLoader
        console.log(chalk.blue('Registering app in DynamicAppLoader...'));
        const loaderPath = 'src/components/DynamicAppLoader.js';
        let loaderContent = fs.readFileSync(loaderPath, 'utf8');

        // Add import statement
        const importStatement = `const ${name}App = lazy(() => import('../pages/apps/${name}/${name.charAt(0).toUpperCase() + name.slice(1)}Page'));\n`;
        loaderContent = loaderContent.replace(
            /import {/,
            `${importStatement}\nimport {`
        );

        // Add app config
        const appConfig = `
    ${name}: {
        id: '${name}',
        displayName: '${displayName}',
        description: '${description}',
        main: ${name}App,
        routes: {}
    },`;
        loaderContent = loaderContent.replace(
            /const appConfigs = {/,
            `const appConfigs = {${appConfig}`
        );

        fs.writeFileSync(loaderPath, loaderContent);

        // Update package.json if needed
        console.log(chalk.blue('Checking dependencies...'));
        const sourcePackage = require(path.join(sourceDir, 'package.json'));
        const targetPackage = require(path.join(process.cwd(), 'package.json'));

        const newDependencies = {};
        Object.entries(sourcePackage.dependencies || {}).forEach(([key, value]) => {
            if (!targetPackage.dependencies[key]) {
                newDependencies[key] = value;
            }
        });

        if (Object.keys(newDependencies).length > 0) {
            console.log(chalk.yellow('New dependencies found. Please run:'));
            console.log(chalk.yellow(`npm install ${Object.entries(newDependencies).map(([key, value]) => `${key}@${value}`).join(' ')}`));
        }

        console.log(chalk.green('\nApp imported successfully!'));
        console.log(chalk.blue('\nNext steps:'));
        console.log('1. Install any new dependencies listed above');
        console.log('2. Review and test the imported components');
        console.log('3. Check the app registration in DynamicAppLoader.js');
        console.log('4. Update any necessary environment variables');

    } catch (error) {
        console.error(chalk.red('Error importing app:'), error);
        process.exit(1);
    }
}

importApp(); 