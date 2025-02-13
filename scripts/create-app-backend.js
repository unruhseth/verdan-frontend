#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const questions = [
    {
        name: 'appId',
        question: 'Enter app ID (must match frontend app ID): ',
        validate: (input) => /^[a-z0-9_]+$/.test(input)
    },
    {
        name: 'needsDatabase',
        question: 'Does your app need a database? (y/n): ',
        transform: (input) => input.toLowerCase() === 'y'
    },
    {
        name: 'hasWebhooks',
        question: 'Does your app need webhook support? (y/n): ',
        transform: (input) => input.toLowerCase() === 'y'
    }
];

const appData = {};

async function askQuestions() {
    for (const q of questions) {
        const answer = await new Promise((resolve) => {
            rl.question(q.question, (answer) => {
                if (q.validate && !q.validate(answer)) {
                    console.log('Invalid input. Please try again.');
                    resolve(null);
                } else {
                    resolve(q.transform ? q.transform(answer) : answer);
                }
            });
        });

        if (answer === null) {
            return false;
        }

        appData[q.name] = answer;
    }
    return true;
}

function createBackendFiles() {
    const baseDir = path.join(process.cwd(), 'backend');
    const appDir = path.join(baseDir, 'apps', appData.appId);
    
    // Create directories
    fs.mkdirSync(appDir, { recursive: true });

    // Create main route file
    createRouteFile(appDir);

    // Create service file
    createServiceFile(appDir);

    if (appData.needsDatabase) {
        createModelFile(appDir);
        createMigrationFile(appDir);
    }

    if (appData.hasWebhooks) {
        createWebhookHandler(appDir);
    }

    // Create tests directory and files
    createTestFiles(appDir);
}

function createRouteFile(appDir) {
    const content = `from flask import Blueprint, request, jsonify
from backend.auth import require_auth, require_account_access
from backend.apps.${appData.appId}.service import ${capitalize(appData.appId)}Service

bp = Blueprint('${appData.appId}', __name__)
service = ${capitalize(appData.appId)}Service()

@bp.route('/${appData.appId}/install', methods=['POST'])
@require_auth
@require_account_access
def install():
    """Install the app for an account"""
    account_id = request.json.get('account_id')
    
    try:
        service.install(account_id)
        return jsonify({'message': 'App installed successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/${appData.appId}/uninstall', methods=['POST'])
@require_auth
@require_account_access
def uninstall():
    """Uninstall the app from an account"""
    account_id = request.json.get('account_id')
    
    try:
        service.uninstall(account_id)
        return jsonify({'message': 'App uninstalled successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/${appData.appId}/status', methods=['GET'])
@require_auth
@require_account_access
def status():
    """Get app status for an account"""
    account_id = request.args.get('account_id')
    
    try:
        status = service.get_status(account_id)
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Add your custom routes here`;

    fs.writeFileSync(
        path.join(appDir, 'routes.py'),
        content
    );
}

function createServiceFile(appDir) {
    const content = `from backend.db import db
${appData.needsDatabase ? `from backend.apps.${appData.appId}.models import ${capitalize(appData.appId)}` : ''}

class ${capitalize(appData.appId)}Service:
    def install(self, account_id):
        """Install the app for an account"""
        # Add your installation logic here
        pass

    def uninstall(self, account_id):
        """Uninstall the app from an account"""
        # Add your uninstallation logic here
        pass

    def get_status(self, account_id):
        """Get app status for an account"""
        # Add your status check logic here
        return {
            'status': 'active',
            'installed_at': None,
            'settings': {}
        }

    # Add your custom service methods here`;

    fs.writeFileSync(
        path.join(appDir, 'service.py'),
        content
    );
}

function createModelFile(appDir) {
    const content = `from backend.db import db
from datetime import datetime

class ${capitalize(appData.appId)}(db.Model):
    """${capitalize(appData.appId)} model"""
    __tablename__ = '${appData.appId}'

    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Add your custom fields here

    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'account_id': self.account_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }`;

    fs.writeFileSync(
        path.join(appDir, 'models.py'),
        content
    );
}

function createMigrationFile(appDir) {
    const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const content = `"""create_${appData.appId}_table

Revision ID: ${timestamp}
Create Date: ${new Date().toISOString()}
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table('${appData.appId}',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('account_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['account_id'], ['accounts.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('${appData.appId}')`;

    const migrationsDir = path.join(baseDir, 'migrations', 'versions');
    fs.mkdirSync(migrationsDir, { recursive: true });
    fs.writeFileSync(
        path.join(migrationsDir, `${timestamp}_create_${appData.appId}_table.py`),
        content
    );
}

function createWebhookHandler(appDir) {
    const content = `from backend.webhooks import WebhookHandler

class ${capitalize(appData.appId)}WebhookHandler(WebhookHandler):
    """Handle webhooks for ${appData.appId}"""

    def handle_webhook(self, payload, account_id):
        """Process incoming webhook"""
        event_type = payload.get('event')
        
        if event_type == 'example_event':
            return self.handle_example_event(payload, account_id)
        
        return {'error': 'Unknown event type'}

    def handle_example_event(self, payload, account_id):
        """Handle example event"""
        # Add your webhook handling logic here
        return {'status': 'processed'}`;

    fs.writeFileSync(
        path.join(appDir, 'webhooks.py'),
        content
    );
}

function createTestFiles(appDir) {
    const testsDir = path.join(appDir, 'tests');
    fs.mkdirSync(testsDir, { recursive: true });

    // Create test files
    const testFiles = [
        {
            name: 'test_routes.py',
            content: `import pytest
from backend.apps.${appData.appId}.routes import bp

def test_install(client, auth_headers):
    """Test app installation"""
    response = client.post('/${appData.appId}/install', 
        json={'account_id': 1},
        headers=auth_headers
    )
    assert response.status_code == 200

def test_uninstall(client, auth_headers):
    """Test app uninstallation"""
    response = client.post('/${appData.appId}/uninstall',
        json={'account_id': 1},
        headers=auth_headers
    )
    assert response.status_code == 200

def test_status(client, auth_headers):
    """Test app status"""
    response = client.get('/${appData.appId}/status?account_id=1',
        headers=auth_headers
    )
    assert response.status_code == 200`
        },
        {
            name: 'test_service.py',
            content: `import pytest
from backend.apps.${appData.appId}.service import ${capitalize(appData.appId)}Service

def test_service_install():
    """Test service installation"""
    service = ${capitalize(appData.appId)}Service()
    result = service.install(1)
    assert result is None

def test_service_uninstall():
    """Test service uninstallation"""
    service = ${capitalize(appData.appId)}Service()
    result = service.uninstall(1)
    assert result is None

def test_service_status():
    """Test service status"""
    service = ${capitalize(appData.appId)}Service()
    status = service.get_status(1)
    assert isinstance(status, dict)
    assert 'status' in status`
        }
    ];

    if (appData.needsDatabase) {
        testFiles.push({
            name: 'test_models.py',
            content: `import pytest
from backend.apps.${appData.appId}.models import ${capitalize(appData.appId)}

def test_model_creation():
    """Test model creation"""
    model = ${capitalize(appData.appId)}(account_id=1)
    assert model.account_id == 1

def test_model_to_dict():
    """Test model serialization"""
    model = ${capitalize(appData.appId)}(account_id=1)
    data = model.to_dict()
    assert isinstance(data, dict)
    assert 'account_id' in data`
        });
    }

    testFiles.forEach(file => {
        fs.writeFileSync(
            path.join(testsDir, file.name),
            file.content
        );
    });
}

function capitalize(str) {
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

async function main() {
    console.log('🚀 Creating backend for Verdan Admin Panel app...\n');
    
    if (await askQuestions()) {
        try {
            createBackendFiles();
            console.log('\n✅ Backend created successfully!');
            console.log('\nNext steps:');
            console.log('1. Implement your app-specific routes');
            console.log('2. Add your business logic to the service');
            if (appData.needsDatabase) {
                console.log('3. Customize the database model');
                console.log('4. Run database migrations');
            }
            if (appData.hasWebhooks) {
                console.log('5. Implement webhook handlers');
            }
            console.log('6. Add tests for your new functionality');
            console.log('\nHappy coding! 🎉');
        } catch (error) {
            console.error('Error creating backend:', error);
        }
    }
    
    rl.close();
}

main(); 