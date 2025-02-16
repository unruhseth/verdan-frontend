import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';
import Login from '../components/Login';
import { authApi } from '../utils/api';

describe('Login Component', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    // New test to check cookie setting
    describe('Cookie Setting Test', () => {
        const NUM_ITERATIONS = 5; // Number of times to run the test

        for (let i = 0; i < NUM_ITERATIONS; i++) {
            test(`Login and verify cookies - Iteration ${i + 1}`, async () => {
                render(
                    <BrowserRouter>
                        <AuthProvider>
                            <Login />
                        </AuthProvider>
                    </BrowserRouter>
                );

                // Fill in login form
                fireEvent.change(screen.getByLabelText(/email/i), {
                    target: { value: 'seth@verdan.io' }
                });
                fireEvent.change(screen.getByLabelText(/password/i), {
                    target: { value: 'verdan' }
                });

                // Submit form
                fireEvent.click(screen.getByRole('button', { name: /log in/i }));

                // Wait for login
                await waitFor(() => {
                    expect(localStorage.getItem('token')).not.toBeNull();
                });

                // Verify cookies
                const cookies = document.cookie;
                expect(cookies).toContain('access_token_cookie');
                expect(cookies).toContain('refresh_token_cookie');
                console.log(`Iteration ${i + 1}: Cookies - ${cookies}`);
            }, 10000); // Increase timeout if needed
        }
    });
});