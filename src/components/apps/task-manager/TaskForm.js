import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TaskForm = ({ onSubmit, onCancel }) => {
    const [taskData, setTaskData] = useState({
        title: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(taskData);
        setTaskData({ title: '', description: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={taskData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter task title"
                />
            </div>

            <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={taskData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter task description"
                />
            </div>

            <div className="form-actions">
                <button type="button" className="btn secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="btn primary"
                    disabled={!taskData.title.trim()}
                >
                    Add Task
                </button>
            </div>
        </form>
    );
};

TaskForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default TaskForm; 