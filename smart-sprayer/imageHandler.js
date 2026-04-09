const express = require('express');
const app = express();
const upload = require('./uploadHandler');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^"(.*)"$/, '$1');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 9000);
const HOST = process.env.HOST || process.env.BACKEND_HOST || '0.0.0.0';
const ML_API_URL = process.env.ML_API_URL || 'https://dua41p2tz8.execute-api.eu-north-1.amazonaws.com/predict';
const FRONTEND_BUILD_DIR = path.join(__dirname, 'frontend', 'build');
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/+$/, '');

  if (corsOrigins.includes(normalizedOrigin)) {
    return true;
  }

  if (/^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(normalizedOrigin)) {
    return true;
  }

  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin)) {
    return true;
  }

  return false;
}

app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const pesticideDatabase = [
  {
    id: 1,
    name: 'Copper Fungicide',
    disease: 'Late Blight, Potato Blight',
    active_ingredient: 'Copper hydroxide',
    description: 'Broad-spectrum fungicide effective against many plant diseases.',
    application_rate: 2.5,
    safety_instructions: 'Wear protective clothing. Do not apply when raining.',
  },
  {
    id: 2,
    name: 'Chlorothalonil',
    disease: 'Late Blight, Early Blight',
    active_ingredient: 'Chlorothalonil',
    description: 'Fungicide for control of fungal diseases.',
    application_rate: 1.5,
    safety_instructions: 'Avoid contact with skin and eyes. Use in a well-ventilated area.',
  },
  {
    id: 3,
    name: 'Mancozeb',
    disease: 'Potato Blight',
    active_ingredient: 'Mancozeb',
    description: 'Protective fungicide commonly used against blight and leaf spot diseases.',
    application_rate: 2.0,
    safety_instructions: 'Use gloves, mask, and avoid spraying near water sources.',
  },
  {
    id: 4,
    name: 'Brown Rot Guard',
    disease: 'Brown Rot',
    active_ingredient: 'Captan',
    description: 'Fungicide used for brown rot control in fruit crops.',
    application_rate: 1.8,
    safety_instructions: 'Avoid inhalation and wash hands after handling.',
  },
];

const diseaseDatabase = [
  {
    id: 1,
    name: 'Late Blight',
    plant_name: 'Tomato',
    description: 'Fungal disease causing dark lesions on leaves and fruits.',
    symptoms: 'Dark, water-soaked lesions on leaves, white fungal growth on undersides.',
    pesticideIds: [1, 2],
  },
  {
    id: 2,
    name: 'Early Blight',
    plant_name: 'Tomato',
    description: 'Fungal disease affecting tomato and potato plants.',
    symptoms: 'Dark spots with concentric rings on leaves.',
    pesticideIds: [2],
  },
  {
    id: 3,
    name: 'Potato Blight',
    plant_name: 'Potato',
    description: 'Blight disease that affects potato leaves and tubers.',
    symptoms: 'Dark lesions on leaves, rotting tubers.',
    pesticideIds: [1, 3],
  },
  {
    id: 4,
    name: 'Brown Rot',
    plant_name: 'Stone Fruit',
    description: 'Fungal fruit disease that causes brown lesions, rot, and rapid fruit decay.',
    symptoms: 'Brown circular spots on fruit, soft rot, and fuzzy fungal growth in humid conditions.',
    pesticideIds: [4],
  },
];

function getSeverity(confidence) {
  if (confidence >= 0.9) return 'Severe';
  if (confidence >= 0.75) return 'Moderate';
  return 'Mild';
}

function normalizePredictionName(payload) {
  if (!payload) return null;

  if (typeof payload === 'string') return payload;

  const directName = payload.disease_name
    || payload.disease
    || payload.label
    || payload.class
    || payload.predicted_class
    || payload.prediction;

  if (directName) return String(directName);

  if (Array.isArray(payload.predictions) && payload.predictions.length > 0) {
    const topPrediction = payload.predictions[0];
    return normalizePredictionName(topPrediction);
  }

  if (Array.isArray(payload) && payload.length > 0) {
    return normalizePredictionName(payload[0]);
  }

  return null;
}

function normalizeConfidence(payload) {
  if (!payload) return 0;

  if (typeof payload.confidence === 'number') return payload.confidence;
  if (typeof payload.score === 'number') return payload.score;
  if (typeof payload.probability === 'number') return payload.probability;

  if (Array.isArray(payload.predictions) && payload.predictions.length > 0) {
    return normalizeConfidence(payload.predictions[0]);
  }

  if (Array.isArray(payload) && payload.length > 0) {
    return normalizeConfidence(payload[0]);
  }

  return 0.8;
}

function getRecommendedPesticides(disease) {
  const normalizedDiseaseName = disease.name.toLowerCase();

  return pesticideDatabase.filter((pesticide) => {
    const taggedDiseases = String(pesticide.disease || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    return disease.pesticideIds.includes(pesticide.id) || taggedDiseases.includes(normalizedDiseaseName);
  });
}

function buildDetectionResponse(predictionPayload) {
  const predictedName = normalizePredictionName(predictionPayload);
  const confidence = normalizeConfidence(predictionPayload);
  const normalizedPredictedName = String(predictedName || '').trim().toLowerCase();

  const disease = diseaseDatabase.find(
    (item) => item.name.toLowerCase() === normalizedPredictedName
      || normalizedPredictedName.includes(item.name.toLowerCase())
      || item.name.toLowerCase().includes(normalizedPredictedName)
  );

  if (!disease) {
    return {
      disease_id: null,
      disease_name: predictedName || 'Unknown',
      confidence,
      plant_name: null,
      description: 'Disease details are not available in the local database yet.',
      symptoms: 'Check the uploaded leaf manually before spraying.',
      severity: getSeverity(confidence),
      recommended_pesticides: [],
      available_pesticides: pesticideDatabase,
      spray_suggestions: [
        'Retake the image with better lighting if the prediction looks wrong.',
        'Review all available pesticides before spraying.',
        'Confirm the disease manually when confidence is low.',
      ],
      raw_prediction: predictionPayload,
    };
  }

  const recommendedPesticides = getRecommendedPesticides(disease);

  return {
    disease_id: disease.id,
    disease_name: disease.name,
    confidence,
    plant_name: disease.plant_name,
    description: disease.description,
    symptoms: disease.symptoms,
    severity: getSeverity(confidence),
    recommended_pesticides: recommendedPesticides,
    available_pesticides: pesticideDatabase,
    spray_suggestions: recommendedPesticides.length > 0
      ? recommendedPesticides.map(
          (pesticide) => `Spray ${pesticide.name} at ${pesticide.application_rate} ml/L for ${disease.name}.`
        )
      : ['No direct pesticide mapping is stored for this disease.'],
    raw_prediction: predictionPayload,
  };
}

app.get('/api/pesticides', (req, res) => {
  res.json(pesticideDatabase);
});

app.get('/api/pesticides/:id', (req, res) => {
  const pesticide = pesticideDatabase.find((item) => item.id === Number(req.params.id));
  if (!pesticide) {
    return res.status(404).json({ detail: 'Pesticide not found' });
  }
  return res.json(pesticide);
});

app.post('/api/spray', (req, res) => {
  const pesticide = pesticideDatabase.find((item) => item.id === Number(req.body.pesticide_id));
  if (!pesticide) {
    return res.status(404).json({ detail: 'Pesticide not found' });
  }

  const disease = diseaseDatabase.find((item) => item.id === Number(req.body.disease_id));
  const message = disease
    ? `Spray command prepared for ${pesticide.name} against ${disease.name}.`
    : `Spray command prepared for ${pesticide.name}.`;

  return res.json({
    success: true,
    pesticide_name: pesticide.name,
    disease_name: disease ? disease.name : null,
    message,
  });
});

app.post('/api/disease', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: 'Image upload is required' });
  }

  try {
    const base64 = fs.readFileSync(req.file.path).toString('base64');
    const response = await axios.post(
      ML_API_URL,
      { inputs: base64 },
      { timeout: 30000 }
    );

    return res.json(buildDetectionResponse(response.data));
  } catch (error) {
    const upstreamDetail = error.response?.data
      ? JSON.stringify(error.response.data)
      : null;
    const message = upstreamDetail || error.message || 'Failed to process image';

    console.error('Disease detection failed:', {
      mlApiUrl: ML_API_URL,
      status: error.response?.status || null,
      message,
    });

    return res.status(500).json({
      detail: message,
    });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

if (fs.existsSync(FRONTEND_BUILD_DIR)) {
  app.use(express.static(FRONTEND_BUILD_DIR));

  app.get(/^(?!\/api\/).*/, (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ detail: 'API route not found' });
    }

    return res.sendFile(path.join(FRONTEND_BUILD_DIR, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json('Smart Sprayer API is running');
  });
}

app.listen(PORT, HOST, () => {
  console.log(`server is listening on ${HOST}:${PORT}`);
});
