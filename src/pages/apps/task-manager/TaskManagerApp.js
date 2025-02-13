import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import TaskList from '../../../components/apps/task-manager/TaskList';
import AddTaskForm from '../../../components/apps/task-manager/AddTaskForm';
import TaskFilters from '../../../components/apps/task-manager/TaskFilters';
import { Snackbar, Alert, CircularProgress, Box, Container, Paper, Typography } from '@mui/material';
import AdminSidebar from '../../../components/AdminSidebar';
import AccountSidebar from '../../../components/AccountSidebar';
import { usePermissions } from '../../../hooks/usePermissions';
import TaskForm from '../../../components/apps/task-manager/TaskForm';
import '../../../styles/task-manager.css';

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
const TaskManagerAppWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <TaskManagerApp />
  </QueryClientProvider>
);

const TaskManagerApp = () => {
  const { accountId } = useParams();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: 'ALL',
    sortBy: 'created_at'
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { isAdmin } = usePermissions();
  const Sidebar = isAdmin() ? AdminSidebar : AccountSidebar;

  useEffect(() => {
    fetchTasks();
  }, [accountId]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      const response = await fetch(`http://localhost:5000/tasks/list?account_id=${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();
      setTasks(data.tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message || 'Failed to load tasks.');
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      const response = await fetch('http://localhost:5000/tasks/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: parseInt(accountId),
          title: taskData.title,
          description: taskData.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create task');
      }

      setShowAddForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.message || 'Failed to create task.');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      console.log('Updating task:', { taskId, newStatus, accountId });

      const response = await fetch(`http://localhost:5000/tasks/update`, {
        method: 'POST',  // Changed from PATCH to POST since backend might not support PATCH
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: parseInt(accountId),
          task_id: taskId,
          status: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Task update failed:', {
          status: response.status,
          error: errorData
        });
        throw new Error(errorData.message || 'Failed to update task');
      }

      const data = await response.json();
      console.log('Task updated successfully:', data);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');

      const response = await fetch('http://localhost:5000/tasks/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: parseInt(accountId),
          task_id: taskId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete task');
      }

      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error.message || 'Failed to delete task.');
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Get filtered and sorted tasks
  const getFilteredTasks = () => {
    return tasks
      .filter(task => {
        if (filters.status === 'ALL') return true;
        return task.status === filters.status;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'created_at') {
          return new Date(b.created_at) - new Date(a.created_at);
        } else if (filters.sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <h2>Task Manager</h2>
        <button 
          className="btn primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {showAddForm && (
        <div className="task-form-container">
          <TaskForm 
            onSubmit={handleCreateTask}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <div className="task-filters">
        <TaskFilters
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
      
      <div className="task-list-container">
        <TaskList
          tasks={getFilteredTasks()}
          onUpdateStatus={(taskId, status) => handleUpdateTaskStatus(taskId, status)}
          onDelete={(taskId) => handleDeleteTask(taskId)}
        />
      </div>

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
    </div>
  );
};

export default TaskManagerAppWrapper; 