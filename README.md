# SpamGuard AI — Email Spam & Threat Detection

An advanced full-stack ML-powered email spam detection application.

- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: FastAPI + Scikit-Learn (Multinomial Naive Bayes)
- **Accuracy**: 99.55% on 5,728 training emails
- **Deployment**: Cloudflare Pages (Frontend) + Local/Remote Python API (Backend)

## Features

- Real-time spam probability gauge with animated SVG speedometer
- Interactive threat keyword highlighting
- Urgency, financial, and caps ratio risk breakdown
- Batch email scanner with CSV export
- Scan history with localStorage persistence
- Works fully offline with client-side ML heuristic fallback
- 6 pre-built sample presets (spam & ham)

## Quick Start

### Backend
```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
uvicorn main:app --reload
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

## Deployment

Frontend deployed to **Cloudflare Pages**:
```bash
cd Frontend
npm run build
npx wrangler pages deploy dist --project-name spamguard-ai
```
