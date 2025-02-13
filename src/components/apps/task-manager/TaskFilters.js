import React from 'react';
import PropTypes from 'prop-types';

const TaskFilters = ({ filters, onFilterChange }) => {
    return (
        <div className="filters">
            <div className="filter-group">
                <label>Status:</label>
                <select
                    value={filters.status}
                    onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                >
                    <option value="ALL">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Sort by:</label>
                <select
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
                >
                    <option value="created_at">Creation Date</option>
                    <option value="status">Status</option>
                </select>
            </div>
        </div>
    );
};

TaskFilters.propTypes = {
    filters: PropTypes.shape({
        status: PropTypes.string.isRequired,
        sortBy: PropTypes.string.isRequired
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired
};

export default TaskFilters; 