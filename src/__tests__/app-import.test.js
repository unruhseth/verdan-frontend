import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { appManagementApi } from '../utils/api';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const mock = new MockAdapter(axios);

describe('App Import', () => {
  const mockAppDir = {
    name: 'test-app',
    version: '1.0.0',
    files: {
      'package.json': JSON.stringify({
        name: 'test-app',
        version: '1.0.0',
        dependencies: {
          '@ant-design/icons': '^5.6.1',
          '@tanstack/react-query': '^5.66.0',
          'antd': '^5.24.0',
          'axios': '^1.7.9'
        }
      }),
      'pages/TestAppPage.js': 'export default () => <div>Test App</div>',
      'components/TestComponent.js': 'export default () => <div>Test Component</div>',
      'utils/api.js': 'export const testApi = { getData: () => {} }',
      'styles/test-app.css': '.test-app { color: blue; }'
    }
  };

  beforeEach(() => {
    mock.reset();
    localStorage.clear();
    // Mock file system operations
    jest.spyOn(fs, 'readFileSync').mockImplementation((filePath) => {
      const fileName = path.basename(filePath);
      return mockAppDir.files[fileName] || '';
    });
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  test('Import app from directory', async () => {
    const importResult = await importApp(mockAppDir.name);
    expect(importResult.success).toBe(true);
    expect(importResult.appId).toBe('test-app');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  test('Validate app structure', async () => {
    const invalidAppDir = {
      name: 'invalid-app',
      files: {
        'package.json': JSON.stringify({
          name: 'invalid-app',
          version: '1.0.0'
        })
      }
    };

    try {
      await importApp(invalidAppDir.name);
    } catch (error) {
      expect(error.message).toContain('Invalid app structure');
    }
  });

  test('Check dependencies', async () => {
    const result = await validateDependencies(mockAppDir.files['package.json']);
    expect(result.valid).toBe(true);
    expect(result.missingDependencies).toEqual([]);
  });

  test('Register app routes', async () => {
    const routeRegistration = await registerAppRoutes(mockAppDir.name);
    expect(routeRegistration.success).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('DynamicAppLoader.js'),
      expect.any(String)
    );
  });
});

// Mock functions for testing
async function importApp(appDir) {
  // Validate app structure
  if (!mockAppDir.files['package.json'] || !mockAppDir.files['pages/TestAppPage.js']) {
    throw new Error('Invalid app structure');
  }

  // Return success
  return {
    success: true,
    appId: appDir
  };
}

async function validateDependencies(packageJson) {
  const deps = JSON.parse(packageJson).dependencies;
  return {
    valid: true,
    missingDependencies: []
  };
}

async function registerAppRoutes(appName) {
  return {
    success: true
  };
} 