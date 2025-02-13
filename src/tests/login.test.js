import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import Login from '../components/Login';

// Mock fetch globally
global.fetch = jest.fn();

describe('Login Component', () => {
    beforeEach(() => {
        // Clear localStorage and reset fetch mock before each test
        localStorage.clear();
        fetch.mockClear();
    });

    // Test admin login
    test('successful admin login', async () => {
        // Mock successful admin response
        fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    token: 'admin-token',
                    role: 'admin',
                    message: 'Login successful'
                })
            })
        );

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );

        // Fill in login form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'admin@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        // Wait for the login process
        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('admin-token');
            expect(localStorage.getItem('role')).toBe('admin');
        });
    });

    // Test user login
    test('successful user login', async () => {
        // Mock successful user response
        fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    token: 'user-token',
                    role: 'user',
                    account_id: '123',
                    message: 'Login successful'
                })
            })
        );

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );

        // Fill in login form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'user@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        // Wait for the login process
        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('user-token');
            expect(localStorage.getItem('role')).toBe('user');
            expect(localStorage.getItem('accountId')).toBe('123');
        });
    });

    // Test failed login
    test('failed login', async () => {
        // Mock failed response
        fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({
                    message: 'Invalid credentials'
                })
            })
        );

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );

        // Fill in login form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'wrong@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'wrongpassword' }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
        });

        // Verify localStorage wasn't set
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('role')).toBeNull();
        expect(localStorage.getItem('accountId')).toBeNull();
    });

    // Test missing account_id for user role
    test('user login without account_id fails', async () => {
        // Mock response missing account_id
        fetch.mockImplementationOnce(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    token: 'user-token',
                    role: 'user',
                    message: 'Login successful'
                })
            })
        );

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Login />
                </AuthProvider>
            </BrowserRouter>
        );

        // Fill in login form
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'user@example.com' }
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: 'password123' }
        });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        // Wait for error message
        await waitFor(() => {
            expect(screen.getByText(/account id is required/i)).toBeInTheDocument();
        });

        // Verify localStorage was cleared
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('role')).toBeNull();
        expect(localStorage.getItem('accountId')).toBeNull();
    });
}); 