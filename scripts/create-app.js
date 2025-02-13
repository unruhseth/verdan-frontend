#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const questions = [
    {
        name: 'appId',
        question: 'Enter app ID (lowercase, no spaces, e.g., "task_manager"): ',
        validate: (input) => /^[a-z0-9_]+$/.test(input)
    },
    {
        name: 'appName',
        question: 'Enter app display name (e.g., "Task Manager"): '
    },
    {
        name: 'description',
        question: 'Enter app description: '
    },
    {
        name: 'hasSettings',
        question: 'Does your app need a settings page? (y/n): ',
        transform: (input) => input.toLowerCase() === 'y'
    },
    {
        name: 'hasDashboard',
        question: 'Does your app need a dashboard? (y/n): ',
        transform: (input) => input.toLowerCase() === 'y'
    }
];

const appData = {};

async function askQuestions() {
    for (const q of questions) {
        const answer = await new Promise((resolve) => {
            rl.question(q.question, (answer) => {
                if (q.validate && !q.validate(answer)) {
                    console.log('Invalid input. Please try again.');
                    resolve(null);
                } else {
                    resolve(q.transform ? q.transform(answer) : answer);
                }
            });
        });

        if (answer === null) {
            return false;
        }

        appData[q.name] = answer;
    }
    return true;
}

function createDirectoryStructure() {
    const baseDir = path.join(process.cwd(), 'src');
    const appDir = path.join(baseDir, 'pages', 'apps', appData.appId);
    const componentsDir = path.join(baseDir, 'components', 'apps', appData.appId);
    
    // Create directories
    fs.mkdirSync(appDir, { recursive: true });
    fs.mkdirSync(componentsDir, { recursive: true });

    // Copy template files
    const templateDir = path.join(baseDir, 'templates', 'app-template');
    
    // Main app file
    let mainAppContent = fs.readFileSync(
        path.join(templateDir, 'AppTemplate.js'),
        'utf8'
    );
    
    mainAppContent = mainAppContent
        .replace(/AppTemplate/g, `${capitalize(appData.appId)}App`)
        .replace(/your_app/g, appData.appId)
        .replace(/Your App Name/g, appData.appName)
        .replace(/app-template/g, appData.appId);

    fs.writeFileSync(
        path.join(appDir, `${capitalize(appData.appId)}App.js`),
        mainAppContent
    );

    // CSS file
    fs.copyFileSync(
        path.join(templateDir, 'app-template.css'),
        path.join(baseDir, 'styles', `${appData.appId}.css`)
    );

    // Create additional files if needed
    if (appData.hasSettings) {
        createSettingsComponent(appDir);
    }

    if (appData.hasDashboard) {
        createDashboardComponent(appDir);
    }

    // Update app registry
    updateAppRegistry();
}

function createSettingsComponent(appDir) {
    const content = `import React from 'react';
import { useParams } from 'react-router-dom';

const ${capitalize(appData.appId)}Settings = () => {
    const { accountId } = useParams();

    return (
        <div className="${appData.appId}-settings">
            <h2>${appData.appName} Settings</h2>
            {/* Add your settings content here */}
        </div>
    );
};

export default ${capitalize(appData.appId)}Settings;`;

    fs.writeFileSync(
        path.join(appDir, `${capitalize(appData.appId)}Settings.js`),
        content
    );
}

function createDashboardComponent(appDir) {
    const content = `import React from 'react';
import { useParams } from 'react-router-dom';

const ${capitalize(appData.appId)}Dashboard = () => {
    const { accountId } = useParams();

    return (
        <div className="${appData.appId}-dashboard">
            <h2>${appData.appName} Dashboard</h2>
            {/* Add your dashboard content here */}
        </div>
    );
};

export default ${capitalize(appData.appId)}Dashboard;`;

    fs.writeFileSync(
        path.join(appDir, `${capitalize(appData.appId)}Dashboard.js`),
        content
    );
}

function updateAppRegistry() {
    // Update DynamicAppLoader.js
    const loaderPath = path.join(process.cwd(), 'src', 'components', 'DynamicAppLoader.js');
    let loaderContent = fs.readFileSync(loaderPath, 'utf8');

    // Add import
    const importStatement = `const ${capitalize(appData.appId)}App = lazy(() => import('../pages/apps/${appData.appId}/${capitalize(appData.appId)}App'));\n`;
    loaderContent = loaderContent.replace(
        /\/\/ Lazy load the apps/,
        `// Lazy load the apps\n${importStatement}`
    );

    // Add to appConfigs
    const configEntry = `    ${appData.appId}: {
        main: ${capitalize(appData.appId)}App,
        routes: {
            ${appData.hasSettings ? `'settings': ${capitalize(appData.appId)}Settings,` : ''}
            ${appData.hasDashboard ? `'dashboard': ${capitalize(appData.appId)}Dashboard,` : ''}
        }
    },`;
    
    loaderContent = loaderContent.replace(
        /const appConfigs = {/,
        `const appConfigs = {\n${configEntry}`
    );

    fs.writeFileSync(loaderPath, loaderContent);

    // Update AppsPage.js
    const appsPagePath = path.join(process.cwd(), 'src', 'pages', 'AppsPage.js');
    let appsPageContent = fs.readFileSync(appsPagePath, 'utf8');

    const appEntry = `    {
        id: '${appData.appId}',
        name: '${appData.appName}',
        description: '${appData.description}',
        icon_url: defaultAppIcon,
        monthly_price: 29.99,
        yearly_price: 299.99
    },`;

    appsPageContent = appsPageContent.replace(
        /const availableApps = \[/,
        `const availableApps = [\n${appEntry}`
    );

    fs.writeFileSync(appsPagePath, appsPageContent);
}

function capitalize(str) {
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

async function main() {
    console.log('🚀 Creating new Verdan Admin Panel app...\n');
    
    if (await askQuestions()) {
        try {
            createDirectoryStructure();
            console.log('\n✅ App created successfully!');
            console.log('\nNext steps:');
            console.log('1. Update the monthly_price and yearly_price in AppsPage.js');
            console.log('2. Implement your app-specific components');
            console.log('3. Add your app icon');
            console.log('4. Implement the backend endpoints');
            console.log('\nHappy coding! 🎉');
        } catch (error) {
            console.error('Error creating app:', error);
        }
    }
    
    rl.close();
}

main(); 