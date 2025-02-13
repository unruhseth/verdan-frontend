import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Collapse,
  IconButton,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const AddTaskForm = ({ onAdd }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim()
    });

    // Reset form
    setTitle('');
    setDescription('');
    setIsExpanded(false);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      {!isExpanded ? (
        <Button
          startIcon={<AddIcon />}
          onClick={() => setIsExpanded(true)}
          variant="contained"
          color="primary"
          fullWidth
        >
          Add New Task
        </Button>
      ) : (
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">New Task</Typography>
            <IconButton onClick={() => setIsExpanded(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            autoFocus
            fullWidth
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              onClick={() => setIsExpanded(false)}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!title.trim()}
            >
              Add Task
            </Button>
          </Box>
        </form>
      )}
    </Paper>
  );
};

export default AddTaskForm; 