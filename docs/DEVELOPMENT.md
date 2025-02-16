# Verdan Admin Panel Development Guide

## Initial Project Setup

### Project Structure
First, create your project directory and set up the basic structure:
```bash
mkdir your-project-name
cd your-project-name

# Create frontend and backend directories
mkdir frontend backend
```

Your project structure should look like:
```
your-project-name/
├── frontend/     # React application
└── backend/      # Flask application
```

### Prerequisites
- Node.js and npm installed
- Python and Flask installed
- Git (optional, but recommended)

### Frontend Setup
```bash
cd frontend

# Initialize new React project
npx create-react-app .

# Install required dependencies
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
```

### Backend Setup
```bash
cd ../backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required packages
pip install flask flask-sqlalchemy flask-cors python-dotenv
```

## Quick Start Guide

### Creating a New App

From the frontend directory:
```bash
# 1. Create new app scaffolding
npm run create-app

# 2. Create backend API scaffolding (from backend directory)
cd ../backend
npm run create-app-backend

# 3. Start development servers
# Terminal 1 (frontend):
cd frontend
npm start

# Terminal 2 (backend):
cd backend
flask run
```

## Detailed App Development Guide

### Step 1: Frontend App Creation
From the frontend directory:
```bash
cd frontend
npm run create-app
```
You'll be prompted for:
- App ID (e.g., "inventory_manager")
- Display name (e.g., "Inventory Manager")
- Description
- Settings/dashboard requirements

This creates:
```
frontend/src/
├── pages/apps/your-app-name/
│   ├── YourAppApp.js
│   ├── YourAppSettings.js (optional)
│   └── YourAppDashboard.js (optional)
├── components/apps/your-app-name/
└── styles/your-app.css
```

Note: All frontend files will be created inside the frontend directory automatically.

### Step 2: Flask Backend Creation
From the backend directory:
```bash
cd ../backend
python scripts/create-app-backend.py
```
You'll be prompted for:
- App ID (must match frontend app ID)
- Database requirements
- Webhook support needs

This creates:
```
backend/
└── apps/your-app-name/
    ├── __init__.py
    ├── routes.py
    ├── service.py
    ├── models.py (if using database)
    ├── webhooks.py (if using webhooks)
    └── tests/
        └── __init__.py
```

Note: All backend files will be created inside the backend directory automatically.

Your complete project structure after creating an app will look like:
```
your-project-name/
├── frontend/
│   ├── src/
│   │   ├── pages/apps/your-app-name/
│   │   ├── components/apps/your-app-name/
│   │   └── styles/your-app.css
│   └── package.json
└── backend/
    └── apps/your-app-name/
        ├── __init__.py
        ├── routes.py
        ├── service.py
        └── ...
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

### Importing Existing Apps

To import an existing app into the admin panel, from the frontend directory:
```bash
cd frontend
node scripts/import-app.js <source-directory>
```

You'll be prompted for:
- App ID (e.g., "inventory_manager")
- Display name (e.g., "Inventory Manager")
- Description

The source directory should have this structure:
```
source-directory/
├── pages/          # React components for pages
├── components/     # Reusable React components
├── styles/         # CSS files
└── utils/         # API utilities (optional)
```

The import script will:
1. Copy app files to the correct locations in the frontend directory:
   - Pages to `frontend/src/pages/apps/your-app-name/`
   - Components to `frontend/src/components/apps/your-app-name/`
   - Styles to `frontend/src/styles/your-app.css`
   - API utilities will be appended to `frontend/src/utils/api.js`
2. Register the app in DynamicAppLoader
3. Check and notify about any new dependencies that need to be installed

After importing:
1. Install any new dependencies if prompted
2. Review the imported components
3. Check the app registration in DynamicAppLoader.js
4. Update any necessary environment variables
5. Create corresponding backend structure in the backend directory (if needed)

### Common Integration Issues

1. **Flask Blueprint Registration**
   - Ensure your blueprint is registered in `backend/__init__.py`
   - Check route prefixes match frontend expectations