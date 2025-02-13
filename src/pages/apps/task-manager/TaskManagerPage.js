import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import AdminSidebar from '../../../components/AdminSidebar';
import AccountSidebar from '../../../components/AccountSidebar';
import { usePermissions } from '../../../hooks/usePermissions';
import TaskList from '../../../components/apps/task-manager/TaskList';
import AddTaskForm from '../../../components/apps/task-manager/AddTaskForm';
import TaskFilters from '../../../components/apps/task-manager/TaskFilters';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

// Wrap the main component with QueryClientProvider
const TaskManagerPageWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <TaskManagerPage />
  </QueryClientProvider>
);

const TaskManagerPage = () => {
    const { accountId } = useParams();
    const { isAdmin } = usePermissions();
    const Sidebar = isAdmin() ? AdminSidebar : AccountSidebar;
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({
        status: 'all',
        sortBy: 'created_at'
    });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Fetch tasks
    const {
        data: tasks = [],
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ['tasks', accountId, filters],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch(`http://localhost:5000/tasks/list?account_id=${accountId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    window.location.reload();
                }
                throw new Error('Failed to fetch tasks');
            }

            const data = await response.json();
            return data.tasks;
        }
    });

    // Add task mutation
    const addTaskMutation = useMutation({
        mutationFn: async (newTask) => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/tasks/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...newTask, account_id: Number(accountId) })
            });

            if (!response.ok) throw new Error('Failed to add task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', accountId] });
            setNotification({
                open: true,
                message: 'Task added successfully',
                severity: 'success'
            });
        },
        onError: (error) => {
            setNotification({
                open: true,
                message: error.message,
                severity: 'error'
            });
        }
    });

    // Update task status mutation
    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, status }) => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/tasks/update', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    account_id: Number(accountId),
                    task_id: taskId,
                    status
                })
            });

            if (!response.ok) throw new Error('Failed to update task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', accountId] });
            setNotification({
                open: true,
                message: 'Task updated successfully',
                severity: 'success'
            });
        },
        onError: (error) => {
            setNotification({
                open: true,
                message: error.message,
                severity: 'error'
            });
        }
    });

    // Delete task mutation
    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId) => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/tasks/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    account_id: Number(accountId),
                    task_id: taskId
                })
            });

            if (!response.ok) throw new Error('Failed to delete task');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', accountId] });
            setNotification({
                open: true,
                message: 'Task deleted successfully',
                severity: 'success'
            });
        },
        onError: (error) => {
            setNotification({
                open: true,
                message: error.message,
                severity: 'error'
            });
        }
    });

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    return (
        <div className="admin-container">
            <Sidebar />
            <main className="content">
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Task Manager
                        </Typography>

                        <AddTaskForm onAdd={(taskData) => addTaskMutation.mutate(taskData)} />

                        <TaskFilters
                            filters={filters}
                            onFilterChange={setFilters}
                        />

                        {isLoading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                                <CircularProgress />
                            </Box>
                        ) : isError ? (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                                <Typography color="error">Error: {error.message}</Typography>
                            </Box>
                        ) : (
                            <TaskList
                                tasks={tasks}
                                onStatusChange={(taskId, status) => updateTaskMutation.mutate({ taskId, status })}
                                onDelete={(taskId) => {
                                    if (window.confirm('Are you sure you want to delete this task?')) {
                                        deleteTaskMutation.mutate(taskId);
                                    }
                                }}
                                filters={filters}
                            />
                        )}

                        <Snackbar
                            open={notification.open}
                            autoHideDuration={6000}
                            onClose={handleCloseNotification}
                        >
                            <Alert
                                onClose={handleCloseNotification}
                                severity={notification.severity}
                                sx={{ width: '100%' }}
                            >
                                {notification.message}
                            </Alert>
                        </Snackbar>
                    </Paper>
                </Container>
            </main>
        </div>
    );
};

export default TaskManagerPageWrapper; 