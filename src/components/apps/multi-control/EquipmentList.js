import React from 'react';
import PropTypes from 'prop-types';

const EquipmentList = ({ equipment, onEdit, onDelete }) => {
    if (equipment.length === 0) {
        return (
            <div className="no-data-container">
                <p className="no-data-message">No equipment found.</p>
            </div>
        );
    }

    return (
        <div className="equipment-list">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Serial Number</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Last Connected</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {equipment.map((controller) => (
                        <tr key={controller.id}>
                            <td>{controller.name || 'N/A'}</td>
                            <td>{controller.serial_number || 'N/A'}</td>
                            <td>{controller.type || 'N/A'}</td>
                            <td>
                                <span className={`status-badge ${controller.status?.toLowerCase() || 'unknown'}`}>
                                    {controller.status || 'Unknown'}
                                </span>
                            </td>
                            <td>
                                {controller.last_connected_at 
                                    ? new Date(controller.last_connected_at).toLocaleString()
                                    : 'Never'
                                }
                            </td>
                            <td className="actions-cell">
                                <button
                                    className="btn edit"
                                    onClick={() => onEdit(controller)}
                                    title="Edit Equipment"
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn delete"
                                    onClick={() => onDelete(controller.id)}
                                    title="Delete Equipment"
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

EquipmentList.propTypes = {
    equipment: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string,
            serial_number: PropTypes.string,
            type: PropTypes.string,
            status: PropTypes.string,
            last_connected_at: PropTypes.string
        })
    ).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default EquipmentList; 