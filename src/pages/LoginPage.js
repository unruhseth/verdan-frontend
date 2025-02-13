import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import "../styles/styles.css";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const { login, error, isLoading, clearRememberedLogin } = useAuth();
    const [showClearRemembered, setShowClearRemembered] = useState(false);

    useEffect(() => {
        // Check if there's a remembered login
        const hasRememberedLogin = localStorage.getItem('auth') !== null;
        setShowClearRemembered(hasRememberedLogin);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login({ email, password, rememberMe });
    };

    const handleClearRemembered = () => {
        if (window.confirm('Are you sure you want to clear your remembered login?')) {
            clearRememberedLogin();
            setShowClearRemembered(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>
                        Welcome Back
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {showClearRemembered && (
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <Alert
                                severity="info"
                                action={
                                    <IconButton
                                        aria-label="clear"
                                        color="inherit"
                                        size="small"
                                        onClick={handleClearRemembered}
                                    >
                                        <DeleteIcon fontSize="inherit" />
                                    </IconButton>
                                }
                            >
                                You have a saved login
                            </Alert>
                        </Box>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    value="remember"
                                    color="primary"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={isLoading}
                                />
                            }
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;

