import React from 'react';
import PropTypes from 'prop-types';

const AlertsPanel = ({ alerts, onAcknowledge }) => {
    if (alerts.length === 0) {
        return (
            <div className="no-data-container">
                <p className="no-data-message">No active alerts.</p>
            </div>
        );
    }

    const getSeverityClass = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'severity-critical';
            case 'high':
                return 'severity-high';
            case 'medium':
                return 'severity-medium';
            case 'low':
                return 'severity-low';
            default:
                return 'severity-unknown';
        }
    };

    return (
        <div className="alerts-panel">
            <div className="alerts-list">
                {alerts.map((alert) => (
                    <div key={alert.id} className={`alert-item ${getSeverityClass(alert.severity)}`}>
                        <div className="alert-header">
                            <span className="alert-timestamp">
                                {new Date(alert.created_at).toLocaleString()}
                            </span>
                            <span className={`alert-severity ${getSeverityClass(alert.severity)}`}>
                                {alert.severity || 'Unknown'}
                            </span>
                        </div>
                        <div className="alert-content">
                            <h4 className="alert-title">{alert.title}</h4>
                            <p className="alert-message">{alert.message}</p>
                            <div className="alert-details">
                                <span className="alert-source">
                                    Source: {alert.source || 'Unknown'}
                                </span>
                                {alert.field_name && (
                                    <span className="alert-field">
                                        Field: {alert.field_name}
                                    </span>
                                )}
                                {alert.equipment_name && (
                                    <span className="alert-equipment">
                                        Equipment: {alert.equipment_name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="alert-actions">
                            {!alert.acknowledged && (
                                <button
                                    className="btn acknowledge"
                                    onClick={() => onAcknowledge(alert.id)}
                                >
                                    Acknowledge
                                </button>
                            )}
                            {alert.acknowledged && (
                                <span className="acknowledged-badge">
                                    Acknowledged by {alert.acknowledged_by} at {new Date(alert.acknowledged_at).toLocaleString()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

AlertsPanel.propTypes = {
    alerts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            message: PropTypes.string.isRequired,
            severity: PropTypes.string,
            source: PropTypes.string,
            field_name: PropTypes.string,
            equipment_name: PropTypes.string,
            created_at: PropTypes.string.isRequired,
            acknowledged: PropTypes.bool,
            acknowledged_by: PropTypes.string,
            acknowledged_at: PropTypes.string
        })
    ).isRequired,
    onAcknowledge: PropTypes.func.isRequired
};

export default AlertsPanel; 