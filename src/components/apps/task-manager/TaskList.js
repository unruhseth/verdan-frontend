import React from 'react';
import PropTypes from 'prop-types';

const TaskList = ({ tasks, onUpdateStatus, onDelete }) => {
    if (tasks.length === 0) {
        return (
            <div className="no-data-container">
                <p className="no-data-message">No tasks found.</p>
            </div>
        );
    }

    return (
        <div className="task-list">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task.id}>
                            <td>{task.title}</td>
                            <td>{task.description}</td>
                            <td>
                                <select
                                    value={task.status}
                                    onChange={(e) => onUpdateStatus(task.id, e.target.value)}
                                    className={`status-select ${task.status.toLowerCase()}`}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </td>
                            <td>
                                {task.created_at 
                                    ? new Date(task.created_at).toLocaleString()
                                    : 'N/A'
                                }
                            </td>
                            <td>
                                <button
                                    className="btn delete"
                                    onClick={() => onDelete(task.id)}
                                    title="Delete Task"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

TaskList.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            status: PropTypes.string.isRequired,
            created_at: PropTypes.string
        })
    ).isRequired,
    onUpdateStatus: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default TaskList; 