# App Development Guide

## Overview
This guide provides step-by-step instructions for adding new apps to the Verdan Frontend platform. The platform is designed to be modular, allowing for easy integration of new applications.

## Quick Start
There are two ways to add a new app to the platform:

### 1. Create a New App
```bash
npm run create-app
```

### 2. Import an Existing App
```bash
npm run import-app /path/to/your/app/directory
```

## Required App Structure
When importing an existing app, ensure it follows this structure:
```
your-app-directory/
├── package.json                 # Dependencies and scripts
├── README.md                    # App documentation
├── pages/
│   └── YourAppPage.js          # Main app component
├── components/
│   └── YourFormComponent.js    # Form components
├── utils/
│   └── api.js                  # API utilities
└── styles/
    └── your-app.css           # App-specific styles
```

## Required Dependencies
Ensure these are in your package.json:
```json
{
  "dependencies": {
    "@ant-design/icons": "^5.6.1",
    "@tanstack/react-query": "^5.66.0",
    "antd": "^5.24.0",
    "axios": "^1.7.9",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.1.5"
  }
}
```

## Import Process
When importing an app:

1. Prepare your app directory following the structure above
2. Run the import command:
   ```bash
   npm run import-app /path/to/your/app/directory
   ```
3. Follow the prompts to provide:
   - App ID (e.g., "inventory_manager")
   - Display name (e.g., "Inventory Manager")
   - Description

The import script will:
- Copy pages to `src/pages/apps/your-app-name/`
- Copy components to `src/components/apps/your-app-name/`
- Copy styles to `src/styles/your-app.css`
- Merge API utilities into `src/utils/api.js`
- Register the app in `DynamicAppLoader.js`
- Check and notify about any missing dependencies

## Post-Import Steps
After importing an app:

1. Install any new dependencies that were detected
2. Review the imported components and files
3. Test the app functionality
4. Update any necessary environment variables
5. Update the app's documentation if needed

## Component Requirements

### Main App Component (YourAppPage.js)
```javascript
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { Table, Button, Modal, message } from 'antd';
import YourFormComponent from '../../../components/apps/your-app-name/YourFormComponent';
import { yourAppApi } from '../../../utils/api';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

// Wrap the main component with QueryClientProvider
const YourAppWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <YourAppPage />
  </QueryClientProvider>
);

const YourAppPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  // Fetch data using React Query
  const { data = [], isLoading } = useQuery({
    queryKey: ['your-app-data'],
    queryFn: async () => {
      const response = await yourAppApi.getData();
      return response.data;
    },
  });

  // Example mutation for deleting items
  const deleteMutation = useMutation({
    mutationFn: (id) => yourAppApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['your-app-data']);
      message.success('Item deleted successfully');
    },
  });

  // Your component logic here...

  return (
    <div className="your-app-container">
      {/* Your component JSX */}
    </div>
  );
};

export default YourAppWrapper;
```

### API Integration (utils/api.js)
```javascript
import axios from 'axios';

// Your app's API endpoints
export const yourAppApi = {
    getData: async () => {
        const accountId = localStorage.getItem('accountId');
        return api.get(`/your-app/data?account_id=${accountId}`);
    },
    // ... other endpoints
};
```

## Testing
After importing your app:

1. Run frontend tests:
```bash
npm test
```

2. Check app installation:
- Navigate to the admin panel
- Verify the app appears in the app list
- Test app installation on an account
- Verify all features work as expected

## Troubleshooting

### Common Issues

1. **Missing Dependencies**
   - Check the console output for any missing dependencies
   - Install them using the provided npm command

2. **Import Path Issues**
   - Verify all import paths are relative to the new location
   - Update any hardcoded paths

3. **API Integration**
   - Ensure API endpoints match the backend configuration
   - Check authentication token handling
   - Verify account_id is being passed correctly

4. **Component Registration**
   - Verify the app is properly registered in DynamicAppLoader.js
   - Check for any console errors related to component loading

### Getting Help
If you encounter issues:
1. Check the error messages in the console
2. Review the app's documentation
3. Verify all dependencies are installed
4. Check the import paths in your components
5. Contact the platform team for support

## Best Practices

1. **Code Organization**
   - Keep components modular and reusable
   - Follow the established file structure
   - Use consistent naming conventions

2. **State Management**
   - Use React Query for API state
   - Keep component state minimal
   - Implement proper error handling

3. **Styling**
   - Use the provided CSS modules
   - Follow the platform's design system
   - Make components responsive

4. **Performance**
   - Implement proper loading states
   - Use pagination for large datasets
   - Optimize API calls

5. **Security**
   - Always include account_id in requests
   - Implement proper validation
   - Follow authentication best practices

## Table of Contents
1. [App Structure](#app-structure)
2. [Required Components](#required-components)
3. [Step-by-Step Integration Guide](#step-by-step-integration-guide)
4. [API Integration](#api-integration)
5. [State Management](#state-management)
6. [Testing Checklist](#testing-checklist)

## App Structure
Each app in the platform follows a standardized structure:

```
src/
├── pages/
│   └── apps/
│       └── your-app-name/
│           ├── YourAppPage.js         # Main app component
│           ├── YourAppDashboard.js    # App dashboard (if needed)
│           └── YourAppSettings.js     # App settings (if needed)
├── components/
│   └── apps/
│       └── your-app-name/
│           ├── ComponentOne.js        # App-specific components
│           └── ComponentTwo.js
├── utils/
│   └── api.js                        # API utilities
└── styles/
    └── your-app.css                  # App-specific styles
```

## Required Components

### 1. Main App Component (YourAppPage.js)
```javascript
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { Table, Button, Modal, message } from 'antd';
import YourFormComponent from '../../../components/apps/your-app-name/YourFormComponent';
import { yourAppApi } from '../../../utils/api';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

// Wrap the main component with QueryClientProvider
const YourAppWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <YourAppPage />
  </QueryClientProvider>
);

const YourAppPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const queryClient = useQueryClient();

  // Fetch data using React Query
  const { data = [], isLoading } = useQuery({
    queryKey: ['your-app-data'],
    queryFn: async () => {
      const response = await yourAppApi.getData();
      return response.data;
    },
  });

  // Example mutation for deleting items
  const deleteMutation = useMutation({
    mutationFn: (id) => yourAppApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['your-app-data']);
      message.success('Item deleted successfully');
    },
  });

  // Your component logic here...

  return (
    <div className="your-app-container">
      {/* Your component JSX */}
    </div>
  );
};

export default YourAppWrapper;
```

### 2. Form Component Example
```javascript
import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { yourAppApi } from '../../../utils/api';

const YourFormComponent = ({ initialValues, onSuccess, mode }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values) => {
      const response = mode === 'create'
        ? await yourAppApi.createItem(values)
        : await yourAppApi.updateItem(initialValues?.id, values);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['your-app-data']);
      form.resetFields();
      message.success(`Item ${mode === 'create' ? 'created' : 'updated'} successfully`);
      onSuccess?.();
    },
    onError: (error) => {
      message.error(`Failed to ${mode === 'create' ? 'create' : 'update'} item: ${error.message}`);
    }
  });

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={mutation.mutate}
    >
      {/* Your form fields */}
    </Form>
  );
};

export default YourFormComponent;
```

### 3. API Integration (utils/api.js)
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Your app's API endpoints
export const yourAppApi = {
    getData: async () => {
        const accountId = localStorage.getItem('accountId');
        return api.get(`/your-app/data?account_id=${accountId}`);
    },

    createItem: async (itemData) => {
        const accountId = localStorage.getItem('accountId');
        return api.post('/your-app/items', { ...itemData, account_id: accountId });
    },

    updateItem: async (itemId, itemData) => {
        const accountId = localStorage.getItem('accountId');
        return api.put(`/your-app/items/${itemId}`, { ...itemData, account_id: accountId });
    },

    deleteItem: async (itemId) => {
        const accountId = localStorage.getItem('accountId');
        return api.delete(`/your-app/items/${itemId}`, {
            data: { account_id: accountId }
        });
    }
};

export default api;
```

## Step-by-Step Integration Guide

### 1. Register the App in DynamicAppLoader.js
```javascript
// In src/components/DynamicAppLoader.js

const YourAppWrapper = lazy(() => import('../pages/apps/your-app-name/YourAppPage'));

const appConfigs = {
    // ... existing apps ...
    your_app_id: {
        main: YourAppWrapper,
        routes: {
            // Add sub-routes if needed
            'settings': YourAppSettings
        }
    }
};
```

### 2. Add App Metadata in AppsPage.js
```javascript
// In src/pages/AppsPage.js

const availableApps = [
    // ... existing apps ...
    {
        id: 'your_app_id',
        name: 'Your App Name',
        description: 'Brief description of your app',
        icon_url: defaultAppIcon,
        monthly_price: 29.99,
        yearly_price: 299.99
    }
];
```

### 3. Update App ID Mappings in AccountAppsPage.js
```javascript
// In src/pages/AccountAppsPage.js

const APP_ID_MAP = {
    // ... existing mappings ...
    'your_app_id': 'your_app_id'
};

const APP_NAME_TO_ID = {
    // ... existing mappings ...
    'Your App Name': 'your_app_id'
};
```

### 4. Handle Installation/Uninstallation
Update the handleInstallApp and handleUninstallApp functions in AccountAppsPage.js if your app requires special installation handling:

```javascript
const handleInstallApp = async (appId) => {
    // ... existing code ...
    let endpoint;
    let body;
    if (appId === 'your_app_id') {
        endpoint = `/your-app/install`;
        body = { account_id: parseInt(accountId) };
    } else {
        endpoint = `/admin/accounts/${accountId}/apps/install`;
        body = { app_id: appId };
    }
    // ... rest of the function
};
```

## State Management
The platform uses React Query for server state management. Key points:

1. Wrap your main app component with QueryClientProvider
2. Use useQuery for data fetching
3. Use useMutation for data modifications
4. Implement proper loading and error states
5. Use queryClient.invalidateQueries for cache invalidation

## Testing Checklist

1. **Installation Flow**
   - [ ] App appears in available apps list
   - [ ] Install button works
   - [ ] Uninstall button works
   - [ ] Proper error handling

2. **Data Management**
   - [ ] CRUD operations work correctly
   - [ ] Loading states are handled
   - [ ] Error states are handled
   - [ ] Data is refreshed appropriately

3. **UI/UX**
   - [ ] Follows platform design guidelines (Ant Design)
   - [ ] Responsive design
   - [ ] Consistent styling with platform
   - [ ] Clear feedback for user actions

4. **Authentication**
   - [ ] API calls include authentication token
   - [ ] Account ID is properly passed
   - [ ] Permissions are respected

## Common Issues and Solutions

1. **QueryClient Errors**
   - Ensure main component is wrapped with QueryClientProvider
   - Check QueryClient configuration
   - Verify React Query hooks usage

2. **Installation Issues**
   - Verify API endpoints
   - Check account_id handling
   - Confirm proper error handling

3. **Navigation Problems**
   - Check route configuration in DynamicAppLoader
   - Verify app ID mappings
   - Ensure proper navigation handling

## Best Practices

1. **State Management**
   - Use React Query for server state
   - Implement proper loading states
   - Handle errors gracefully
   - Use optimistic updates when appropriate

2. **Component Structure**
   - Keep components focused and reusable
   - Implement proper prop validation
   - Use TypeScript for better type safety
   - Follow the container/presenter pattern

3. **API Integration**
   - Centralize API calls in api.js
   - Implement proper error handling
   - Use axios interceptors for common headers
   - Handle authentication consistently

4. **Styling**
   - Use Ant Design components
   - Follow platform styling conventions
   - Implement responsive design
   - Use CSS modules or styled-components

Remember to update this guide as new features or requirements are added to the platform. 

## Import Script Configuration
Add this to your app's root directory as `import-config.json`:

```json
{
  "appId": "your_app_id",
  "displayName": "Your App Name",
  "description": "Your app description",
  "version": "1.0.0",
  "dependencies": {
    "@ant-design/icons": "^5.6.1",
    "@tanstack/react-query": "^5.66.0",
    "antd": "^5.24.0",
    "axios": "^1.7.9"
  },
  "routes": {
    "main": "YourAppPage",
    "settings": "YourAppSettings"  // Optional
  },
  "installConfig": {
    "endpoint": "/your-app/install",
    "uninstallEndpoint": "/your-app/uninstall"
  }
}
```

## Example App Files

### package.json
```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@ant-design/icons": "^5.6.1",
    "@tanstack/react-query": "^5.66.0",
    "antd": "^5.24.0",
    "axios": "^1.7.9"
  }
}
```

### README.md
```markdown
# Your App Name

## Description
Brief description of your app's functionality.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation
This app is designed to be installed via the Verdan Admin Panel platform.

## API Requirements
- POST /your-app/install
- POST /your-app/uninstall
- GET /your-app/items
- POST /your-app/items
- PUT /your-app/items/:id
- DELETE /your-app/items/:id

## Configuration
Any specific configuration requirements.
```

## Import Process
The import script will:

1. Validate the file structure and dependencies
2. Copy files to the correct locations in the main project
3. Update necessary configuration files:
   - DynamicAppLoader.js
   - AccountAppsPage.js
   - API configurations
4. Install any missing dependencies
5. Register the app in the platform

## Post-Import Steps
After importing your app:

1. Restart the development server
2. Check the app appears in the available apps list
3. Test installation/uninstallation
4. Verify all CRUD operations work
5. Test authentication and permissions

## Troubleshooting Import Issues

### Common Import Problems
1. **Missing Dependencies**
   ```bash
   # Check for missing dependencies
   npm install
   # Or force update
   npm install --force
   ```

2. **File Path Issues**
   ```bash
   # Verify file structure
   tree your-app-name/
   # Fix any misplaced files
   ```

3. **Component Registration**
   - Check DynamicAppLoader.js for correct imports
   - Verify app ID mappings in AccountAppsPage.js
   - Confirm API endpoints in utils/api.js

### Import Script Flags
```bash
npm run import-app /path/to/app -- --force  # Force overwrite existing files
npm run import-app /path/to/app -- --dry-run  # Test import without making changes
npm run import-app /path/to/app -- --verbose  # Show detailed import process
``` 