import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { api, appManagementApi } from '../utils/api';

const mock = new MockAdapter(axios);

describe('CORS Configuration', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  test('Verify CORS headers on API requests', async () => {
    mock.onGet('/health').reply(200, { status: 'healthy' }, {
      'access-control-allow-origin': 'http://localhost:3000',
      'access-control-allow-credentials': 'true',
      'access-control-allow-methods': 'GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE',
      'access-control-allow-headers': 'Content-Type,Authorization,X-CSRF-TOKEN'
    });

    const response = await api.get('/health');
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  test('Verify CORS behavior on browser refresh', async () => {
    const token = 'test-token';
    localStorage.setItem('token', token);

    mock.onGet('/auth/refresh').reply(200, {
      access_token: 'new-token'
    });

    const response = await api.get('/auth/refresh');
    expect(response.status).toBe(200);
    expect(localStorage.getItem('token')).toBe('new-token');
  });
});

describe('Authentication Flow', () => {
  beforeEach(() => {
    mock.reset();
    localStorage.clear();
  });

  test('Login process maintains session across refreshes', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password'
    };

    mock.onPost('/auth/login').reply(200, {
      token: 'test-token',
      user: {
        id: 1,
        email: 'test@example.com'
      }
    });

    const response = await api.post('/auth/login', loginData);
    expect(response.status).toBe(200);
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  test('JWT token refresh mechanism', async () => {
    localStorage.setItem('token', 'expired-token');

    mock.onGet('/protected-route').reply(401);
    mock.onPost('/auth/refresh').reply(200, {
      access_token: 'new-token'
    });
    mock.onGet('/protected-route').reply(200, { data: 'protected' });

    try {
      await api.get('/protected-route');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }

    const refreshResponse = await api.post('/auth/refresh');
    expect(refreshResponse.status).toBe(200);
    expect(localStorage.getItem('token')).toBe('new-token');

    const protectedResponse = await api.get('/protected-route');
    expect(protectedResponse.status).toBe(200);
  });
}); 