# StudyWave Deployment Guide

## 🚀 Fixing "Load Failed" Error

The "Load failed" error occurs when the frontend cannot connect to the backend API. This typically happens in production deployments.

### 🔧 Quick Fix for Development

If you're running locally:

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd studywave-attendance
   npm run dev
   ```

3. **Access the app at:** `http://localhost:8081`

### 🌐 Production Deployment Fix

For deployed versions (like Vercel), you need to configure the API URL:

#### Option 1: Environment Variables (Recommended)

1. **In your deployment platform (Vercel, Netlify, etc.):**
   - Add environment variable: `REACT_APP_API_URL`
   - Set value to your deployed backend URL: `https://your-backend.herokuapp.com/api`

2. **For local production testing:**
   ```bash
   # In studywave-attendance/.env
   REACT_APP_API_URL=https://your-backend-url.com/api
   ```

#### Option 2: Manual Configuration

Edit `src/services/api.js` and replace the production fallback:

```javascript
// Change this line:
return '/api';

// To your actual backend URL:
return 'https://your-backend-url.com/api';
```

### 🏗️ Backend Deployment

Your backend needs to be deployed separately. Options include:

1. **Heroku:**
   ```bash
   cd backend
   git init
   heroku create your-app-name
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

2. **Railway:**
   - Connect your GitHub repo
   - Deploy the `backend` folder
   - Note the deployed URL

3. **Render:**
   - Connect your GitHub repo
   - Set build command: `npm install`
   - Set start command: `npm start`

### 🔍 Debugging Steps

1. **Check browser console:**
   - Open Developer Tools (F12)
   - Look for API configuration logs
   - Check for network errors

2. **Verify API URL:**
   - The console should show: `🔧 API Configuration`
   - Ensure `baseURL` points to your backend

3. **Test backend directly:**
   - Visit: `https://your-backend-url.com/api/health`
   - Should return: `{"status": "OK", "message": "StudyWave API is running"}`

### 📱 Mobile/Production Checklist

- [ ] Backend deployed and accessible
- [ ] `REACT_APP_API_URL` environment variable set
- [ ] CORS configured for your frontend domain
- [ ] Database connection working
- [ ] SSL certificates configured (HTTPS)

### 🆘 Common Issues

**Issue:** "Cannot connect to backend server"
**Solution:** Check if backend is running and URL is correct

**Issue:** CORS errors
**Solution:** Add your frontend domain to backend CORS configuration

**Issue:** 404 errors on API routes
**Solution:** Verify backend routes are properly defined

**Issue:** Authentication not working
**Solution:** Check JWT secret and token storage

### 📞 Support

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Verify both frontend and backend are running
3. Ensure the API URL configuration is correct
4. Test the backend health endpoint directly

---

## 🎯 Current Status

✅ **Backend:** Running on `http://localhost:5000`
✅ **Frontend:** Configured for environment-aware API URLs
✅ **Error Handling:** Improved with helpful messages
⚠️ **Production:** Requires backend deployment and URL configuration
