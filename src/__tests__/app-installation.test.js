import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { appManagementApi } from '../utils/api';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mock = new MockAdapter(axios);

describe('App Installation', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
    localStorage.setItem('accountId', '1');
  });

  test('Install app through admin panel', async () => {
    const mockApp = {
      id: 'test-app',
      name: 'Test App',
      version: '1.0.0'
    };

    mock.onPost('/admin/accounts/1/apps/install').reply(200, {
      success: true,
      message: 'App installed successfully'
    });

    const result = await appManagementApi.installApp(1, mockApp.id);
    expect(result.success).toBe(true);
    expect(result.data.message).toBe('App installed successfully');
  });

  test('Handle installation errors', async () => {
    const mockApp = {
      id: 'test-app',
      name: 'Test App',
      version: '1.0.0'
    };

    mock.onPost('/admin/accounts/1/apps/install').reply(400, {
      success: false,
      error: 'Installation failed'
    });

    try {
      await appManagementApi.installApp(1, mockApp.id);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe('Installation failed');
    }
  });

  test('App uninstallation process', async () => {
    const mockApp = {
      id: 'test-app',
      name: 'Test App',
      version: '1.0.0'
    };

    mock.onPost('/admin/accounts/1/apps/uninstall').reply(200, {
      success: true,
      message: 'App uninstalled successfully'
    });

    const result = await appManagementApi.uninstallApp(1, mockApp.id);
    expect(result.success).toBe(true);
    expect(result.data.message).toBe('App uninstalled successfully');
  });

  test('Handle uninstallation errors', async () => {
    const mockApp = {
      id: 'test-app',
      name: 'Test App',
      version: '1.0.0'
    };

    mock.onPost('/admin/accounts/1/apps/uninstall').reply(400, {
      success: false,
      error: 'Uninstallation failed'
    });

    try {
      await appManagementApi.uninstallApp(1, mockApp.id);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe('Uninstallation failed');
    }
  });
}); 