# Smart Sprayer 3D

A modern, full-stack application for plant disease detection and pesticide recommendation with an interactive 3D web interface.

## ✨ Features

### Backend (FastAPI)
- 🤖 AI-powered plant disease detection from images
- 💊 Intelligent pesticide recommendations
- 🗄️ SQLite database for plants, diseases, and pesticides
- 🔌 RESTful API with CORS support
- 📊 Structured data management

### Frontend (React + Three.js)
- 🌐 Interactive 3D plant visualization
- 🌿 Real-time disease visualization with color coding
- 🌧️ Animated spray simulation with particle effects
- 📱 Fully responsive design (desktop, tablet, mobile)
- 🎨 Modern UI with smooth animations
- 🖱️ Intuitive controls (drag to rotate, scroll to zoom)

## 📋 Quick Start

### Option 1: Run Full Stack (Recommended)

**Windows:**
```bash
start_full_stack.bat
```

**macOS/Linux:**
```bash
bash start_full_stack.sh
```

This will automatically start both the backend and frontend.

### Option 2: Run Separately

**Backend:**
```bash
# Install dependencies
pip install -r requirements.txt

# Seed database
python seed.py

# Run backend
python start_app.py
```

**Frontend:**
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm start
```

The application will be available at:
- 🎨 Frontend: http://localhost:3000
- 🔌 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

## 🚀 Deploy Frontend On GitHub Pages

This repository now includes a workflow that deploys the React frontend automatically from `main`.

1. Push your latest changes to `main`.
2. In GitHub, open **Settings → Pages**.
3. Set **Source** to **GitHub Actions**.
4. Wait for the workflow **Deploy Frontend To GitHub Pages** to finish.
5. Your site will be available at `https://tarun-rkd.github.io/Smart-Sprayer-/`.

Notes:
- Only the `frontend/` app is deployed to Pages.
- The backend (FastAPI) is not hosted on GitHub Pages. Keep `REACT_APP_API_URL` pointed to a deployed API if you want live API features.

## 📁 Project Structure

```
smart-sprayer/
├── app/                          # Backend application
│   ├── api/                      # API routes
│   │   ├── disease_detection.py
│   │   └── pesticide_recommendation.py
│   ├── db/
│   │   └── database.py
│   ├── models/
│   │   └── __init__.py
│   ├── templates/
│   │   └── index.html           # Legacy template
│   └── utils/
│       └── image_processing.py
├── frontend/                     # React 3D frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/              # 3D visualization
│   │   │   │   ├── PlantScene.jsx
│   │   │   │   ├── PlantModel.js
│   │   │   │   └── SpraySimulation.js
│   │   │   └── ui/              # UI components
│   │   │       ├── ImageUpload.jsx
│   │   │       ├── ControlPanel.jsx
│   │   │       └── ResultsPanel.jsx
│   │   ├── services/
│   │   │   └── apiService.js    # API integration
│   │   ├── styles/              # CSS styling
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── README.md                # Frontend documentation
├── main.py                       # FastAPI entry point
├── start_app.py                  # Backend startup
├── start_full_stack.bat          # Full stack (Windows)
├── start_full_stack.sh           # Full stack (Unix)
├── seed.py                       # Database seeding
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

## 🎮 Using the Application

1. **Upload a Plant Image**
   - Click the upload area or drag-and-drop an image
   - The 3D plant model updates with disease visualization

2. **View Results**
   - Disease detection confidence and severity
   - Color-coded plant visualization (green = healthy, red = diseased)
   - Recommended pesticides with dosages

3. **Spray Simulation**
   - Click "Start Spraying" to see animated pesticide application
   - Watch particles fall realistically with physics simulation

4. **3D Controls**
   - **Drag**: Rotate the plant
   - **Scroll**: Zoom in/out
   - **Click**: Select spraying option

## 🔌 API Endpoints

### Disease Detection
```
POST /api/detect-disease
Content-Type: multipart/form-data

Body: { file: <image_file> }

Response: {
  "disease_id": 1,
  "disease_name": "Powdery Mildew",
  "confidence": 0.95
}
```

### Pesticides
```
GET /api/pesticides
GET /api/pesticides/{id}

Response: [{
  "id": 1,
  "name": "Sulfur Powder",
  "type": "Fungicide",
  "description": "...",
  "dosage": "5kg/acre",
  "application_rate": "2-3 times"
}]
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database management
- **Pillow** - Image processing
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **Three.js** - 3D graphics
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **CSS3** - Styling and animations

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚙️ Configuration

### API URL
Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### CORS Settings
The backend automatically allows cross-origin requests. If you need to restrict origins, modify:
```python
# In main.py
CORSMiddleware(
    allow_origins=["http://localhost:3000"],  # Specify allowed origins
    ...
)
```

## 🎓 Development

### Backend Development
- API routes in `app/api/`
- Models in `app/models/`
- Database in `app/db/database.py`

### Frontend Development
- Components in `src/components/`
- Styling in `src/styles/`
- API calls in `src/services/apiService.js`

### Adding New Features
1. Create API endpoint in backend
2. Add API call in `apiService.js`
3. Create React component
4. Style with CSS

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS - Kill process on port 8000
lsof -i :8000
kill -9 <PID>
```

### CORS Errors
Ensure backend CORS is enabled and frontend API URL is correct.

### 3D Scene Not Rendering
- Check browser console for Three.js errors
- Ensure GPU acceleration is enabled
- Try a different browser

### API Connection Issues
- Verify backend is running: `http://localhost:8000/docs`
- Check network tab in browser DevTools
- Ensure `.env` has correct API URL

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, open an issue on the repository.

## Project Structure

```
smart-sprayer/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── seed.py                 # Database seeding script
├── test_db.py             # Database test script
├── README.md              # This file
├── smart_sprayer.db       # SQLite database (created after seeding)
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── disease_detection.py    # Disease detection endpoint
│   │   └── pesticide_recommendation.py  # Pesticide API
│   ├── db/
│   │   └── database.py             # Database configuration
│   ├── models/
│   │   └── __init__.py             # SQLAlchemy models
│   ├── templates/
│   │   └── index.html              # Web interface template
│   └── utils/
│       └── image_processing.py     # Image processing utilities
├── static/                 # Static files (CSS, JS, images)
└── uploads/               # Uploaded images storage
```

## Sample Data

The application comes with sample data for:
- **Plants**: Tomato, Potato
- **Diseases**: Late Blight, Early Blight, Potato Blight
- **Pesticides**: Copper Fungicide, Chlorothalonil

## Development

The disease detection currently uses a placeholder implementation that returns random results. To implement real ML-based detection:

1. Train a machine learning model for plant disease classification
2. Update `app/utils/image_processing.py` to use the trained model
3. Add proper image preprocessing and feature extraction

## Testing

The application includes built-in tests. After starting the server, you can verify functionality:

```bash
# Test web interface
curl http://localhost:8000/

# Test API endpoints
curl http://localhost:8000/api/pesticides
curl http://localhost:8000/api/pesticides/1

# Test disease detection (requires image file)
curl -X POST -F "file=@plant_image.jpg" http://localhost:8000/api/detect-disease
```

## Troubleshooting

- **Import errors**: Ensure all dependencies are installed with `pip install -r requirements.txt`
- **Database issues**: Delete `smart_sprayer.db` and re-run `python seed.py`
- **Server not starting**: Check if port 8000 is available
- **Upload issues**: Ensure image files are in PNG, JPG, or JPEG format
