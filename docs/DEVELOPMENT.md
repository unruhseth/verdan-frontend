# Verdan Admin Panel Development Guide

## Quick Start Guide

### Prerequisites
- Node.js and npm installed
- Python and Flask backend running
- Access to both frontend and backend repositories

### Quick Start Commands
```bash
# 1. Create new app scaffolding
npm run create-app

# 2. Create backend API scaffolding
npm run create-app-backend

# 3. Start development servers
npm start         # Frontend server
flask run         # Backend server (in another terminal)
```

## Detailed App Development Guide

### Step 1: Frontend App Creation
```bash
npm run create-app
```
You'll be prompted for:
- App ID (e.g., "inventory_manager")
- Display name (e.g., "Inventory Manager")
- Description
- Settings/dashboard requirements

This creates:
```
src/
├── pages/apps/your-app-name/
│   ├── YourAppApp.js
│   ├── YourAppSettings.js (optional)
│   └── YourAppDashboard.js (optional)
├── components/apps/your-app-name/
└── styles/your-app.css
```

### Step 2: Flask Backend Creation
```bash
npm run create-app-backend
```
You'll be prompted for:
- App ID (must match frontend app ID)
- Database requirements
- Webhook support needs

This creates:
```
backend/
└── apps/your-app-name/
    ├── routes.py
    ├── service.py
    ├── models.py (if using database)
    ├── webhooks.py (if using webhooks)
    └── tests/
```

### Step 3: Flask API Integration

#### Required Endpoints
Every app must implement these standard endpoints:

```python
# 1. Install App
POST /your-app-name/install
Request: 
{
    "account_id": int
}
Response:
{
    "message": "App installed successfully"
}

# 2. Uninstall App
POST /your-app-name/uninstall
Request:
{
    "account_id": int
}
Response:
{
    "message": "App uninstalled successfully"
}

# 3. Get App Status
GET /your-app-name/status
Query Parameters:
    account_id: int
Response:
{
    "status": "active",
    "installed_at": "timestamp",
    "settings": {}
}
```

#### Flask Blueprint Structure
```python
# backend/apps/your-app-name/routes.py
from flask import Blueprint, request, jsonify
from backend.auth import require_auth, require_account_access

bp = Blueprint('your_app_name', __name__)

@bp.route('/your-app-name/install', methods=['POST'])
@require_auth
@require_account_access
def install():
    account_id = request.json.get('account_id')
    # Your installation logic here
    return jsonify({"message": "App installed successfully"})

# Additional routes...
```

#### Database Integration (Optional)
If you selected database support:
```python
# backend/apps/your-app-name/models.py
from backend.db import db

class YourApp(db.Model):
    __tablename__ = 'your_app_name'
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'))
    # Your fields here
```

#### Webhook Support (Optional)
If you selected webhook support:
```python
# backend/apps/your-app-name/webhooks.py
from backend.webhooks import WebhookHandler

class YourAppWebhookHandler(WebhookHandler):
    def handle_webhook(self, payload, account_id):
        # Your webhook handling logic here
        pass
```

### Step 4: Testing

#### Frontend Tests
```bash
# Run frontend tests
npm test
```
Tests location: `src/__tests__/apps/your-app-name/`

#### Backend Tests
```bash
# Run backend tests
pytest backend/apps/your-app-name/tests/
```
Tests location: `backend/apps/your-app-name/tests/`

### Automatic Integration Features

The generators automatically:
1. Register your app in the admin panel
2. Set up API routes
3. Create database tables (if needed)
4. Configure webhook handlers (if needed)
5. Generate test files

### Common Integration Issues

1. **Flask Blueprint Registration**
   - Ensure your blueprint is registered in `backend/__init__.py`
   - Check route prefixes match frontend expectations 