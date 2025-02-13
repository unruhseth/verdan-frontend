import React from 'react';
import PropTypes from 'prop-types';

const FieldList = ({ fields, onSelectField }) => {
    if (fields.length === 0) {
        return (
            <div className="no-data-container">
                <p className="no-data-message">No fields found.</p>
            </div>
        );
    }

    return (
        <div className="field-list">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Field ID</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {fields.map((field) => (
                        <tr 
                            key={field.id}
                            onClick={() => onSelectField(field.id)}
                            className="clickable-row"
                        >
                            <td>{field.id}</td>
                            <td>{field.name || 'N/A'}</td>
                            <td>{field.location || 'N/A'}</td>
                            <td>
                                <span className={`status-badge ${field.status?.toLowerCase() || 'unknown'}`}>
                                    {field.status || 'Unknown'}
                                </span>
                            </td>
                            <td>
                                {field.updated_at 
                                    ? new Date(field.updated_at).toLocaleString()
                                    : 'N/A'
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

FieldList.propTypes = {
    fields: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string,
            location: PropTypes.string,
            status: PropTypes.string,
            updated_at: PropTypes.string
        })
    ).isRequired,
    onSelectField: PropTypes.func.isRequired
};

export default FieldList; 