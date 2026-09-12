import os
import re
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from joblib import load

app = FastAPI(
    title="AI Email Spam Detection API",
    description="Advanced API for detecting email spam, phishing triggers, and risk indicators with ML.",
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")
MODEL_PATH = os.path.join(BASE_DIR, "emails_spam_detection_model.pkl")

# Common spam trigger keywords & phrases for deep-dive analysis
SPAM_TRIGGERS = [
    "urgent", "action required", "verify account", "claim your prize", "winner", 
    "won", "lottery", "100% free", "click here", "wire transfer", "risk free",
    "credit card", "bank account", "limited time", "pre-approved", "guaranteed",
    "cash bonus", "investment", "bitcoin", "crypto", "inheritance", "congratulations",
    "exclusive deal", "special promotion", "unclaimed", "password reset", "expire soon",
    "act now", "make money", "million dollars", "viagra", "pharmacy", "cheap loan",
    "refund notice", "tax refund", "suspicious activity", "security alert"
]

try:
    vectorizer = load(VECTORIZER_PATH)
    model = load(MODEL_PATH)
    print("[INFO] Vectorizer and Spam Detector Model loaded successfully.")
except Exception as e:
    print(f"[WARNING] Model load warning: {e}")
    vectorizer = None
    model = None

class EmailRequest(BaseModel):
    text: str
    subject: Optional[str] = ""

class BatchEmailRequest(BaseModel):
    emails: List[EmailRequest]

def extract_features_and_triggers(full_text: str):
    lower_text = full_text.lower()
    
    # Extract matching spam trigger phrases
    found_triggers = []
    for trigger in SPAM_TRIGGERS:
        if trigger in lower_text:
            found_triggers.append(trigger)
    
    # Email stats
    total_chars = len(full_text)
    total_words = len(full_text.split())
    uppercase_chars = sum(1 for c in full_text if c.isupper())
    caps_ratio = round((uppercase_chars / total_chars * 100) if total_chars > 0 else 0, 1)
    
    exclamation_count = full_text.count("!")
    question_count = full_text.count("?")
    currency_count = sum(full_text.count(sym) for sym in ["$", "€", "£", "₹", "¥"])
    
    # URLs and Emails
    urls = re.findall(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+|www\.[-\w.]+', full_text)
    emails = re.findall(r'[\w\.-]+@[\w\.-]+', full_text)
    
    # Calculate Urgency & Financial risk heuristics
    urgency_terms = ["urgent", "immediately", "deadline", "act now", "24 hours", "suspended", "expire"]
    urgency_score = min(100, sum(20 for t in urgency_terms if t in lower_text) + (15 if caps_ratio > 20 else 0))
    
    financial_terms = ["money", "dollar", "$", "wire", "bank", "transfer", "loan", "investment", "crypto", "bitcoin", "card"]
    financial_score = min(100, sum(15 for t in financial_terms if t in lower_text) + (20 if currency_count > 1 else 0))

    return {
        "triggers": list(set(found_triggers)),
        "metrics": {
            "total_chars": total_chars,
            "total_words": total_words,
            "caps_ratio_percent": caps_ratio,
            "exclamation_count": exclamation_count,
            "question_count": question_count,
            "currency_count": currency_count,
            "url_count": len(urls),
            "email_count": len(emails),
            "urgency_score": urgency_score,
            "financial_score": financial_score,
        }
    }

def analyze_single_email(subject: str, text: str):
    full_text = f"Subject: {subject} {text}".strip() if subject else text.strip()
    if not full_text:
        return {
            "is_spam": False,
            "spam_probability": 0.0,
            "ham_probability": 100.0,
            "confidence": 100.0,
            "verdict": "HAM",
            "risk_level": "LOW",
            "highlighted_keywords": [],
            "analysis": extract_features_and_triggers(""),
            "summary": "Empty content"
        }
    
    analysis_data = extract_features_and_triggers(full_text)
    
    if model and vectorizer:
        vec = vectorizer.transform([full_text])
        prediction = int(model.predict(vec)[0])
        probas = model.predict_proba(vec)[0]
        ham_prob = round(float(probas[0]) * 100, 2)
        spam_prob = round(float(probas[1]) * 100, 2)
    else:
        # Fallback intelligent rule-based heuristic
        base_spam = 5.0
        base_spam += len(analysis_data["triggers"]) * 18.0
        base_spam += (analysis_data["metrics"]["urgency_score"] * 0.25)
        base_spam += (analysis_data["metrics"]["financial_score"] * 0.25)
        if analysis_data["metrics"]["caps_ratio_percent"] > 25:
            base_spam += 15.0
        if analysis_data["metrics"]["url_count"] > 2:
            base_spam += 10.0
        spam_prob = round(min(99.9, max(0.1, base_spam)), 2)
        ham_prob = round(100.0 - spam_prob, 2)
        prediction = 1 if spam_prob >= 50.0 else 0

    is_spam = prediction == 1
    
    if spam_prob >= 75.0:
        verdict = "SPAM"
        risk_level = "HIGH"
    elif spam_prob >= 40.0:
        verdict = "SUSPICIOUS"
        risk_level = "MEDIUM"
    else:
        verdict = "HAM"
        risk_level = "LOW"

    # Explainability factors
    reasons = []
    if analysis_data["triggers"]:
        reasons.append(f"Contains {len(analysis_data['triggers'])} suspicious trigger phrase(s): {', '.join(analysis_data['triggers'][:3])}")
    if analysis_data["metrics"]["caps_ratio_percent"] > 20:
        reasons.append(f"Excessive capitalization detected ({analysis_data['metrics']['caps_ratio_percent']}%)")
    if analysis_data["metrics"]["exclamation_count"] >= 3:
        reasons.append("High exclamation mark usage suggesting artificial urgency")
    if analysis_data["metrics"]["url_count"] >= 2:
        reasons.append("Multiple external links detected in message body")
    if analysis_data["metrics"]["financial_score"] >= 40:
        reasons.append("Strong financial, banking, or crypto solicitations detected")
    if not reasons:
        reasons.append("Clean message structure with normal conversational patterns")

    return {
        "is_spam": is_spam,
        "spam_probability": spam_prob,
        "ham_probability": ham_prob,
        "confidence": max(spam_prob, ham_prob),
        "verdict": verdict,
        "risk_level": risk_level,
        "highlighted_keywords": analysis_data["triggers"],
        "metrics": analysis_data["metrics"],
        "reasons": reasons,
        "subject": subject,
        "text_preview": text[:150] + ("..." if len(text) > 150 else "")
    }

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Spam Detection API",
        "model_loaded": model is not None and vectorizer is not None,
        "version": "2.0.0"
    }

@app.post("/predict")
@app.post("/api/predict")
def predict_email(payload: EmailRequest):
    try:
        return analyze_single_email(payload.subject or "", payload.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch")
@app.post("/api/predict/batch")
def predict_batch(payload: BatchEmailRequest):
    try:
        results = [analyze_single_email(item.subject or "", item.text) for item in payload.emails]
        total = len(results)
        spam_count = sum(1 for r in results if r["is_spam"])
        return {
            "total_analyzed": total,
            "spam_count": spam_count,
            "ham_count": total - spam_count,
            "spam_rate_percent": round((spam_count / total * 100) if total > 0 else 0, 1),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/examples")
@app.get("/api/examples")
def get_example_emails():
    return [
        {
            "id": "sample-phishing-1",
            "title": "🚨 Urgent Security Alert",
            "type": "spam",
            "subject": "URGENT: Your Bank Account Access Has Been Suspended",
            "text": "Dear Valued Customer, We noticed unauthorized login attempts on your online banking account. To prevent total suspension, you must verify your identity immediately within 24 hours. Click here: http://secure-bank-login-verify.com to submit your credentials and credit card info. Failure to do so will result in permanent account termination!"
        },
        {
            "id": "sample-lottery-2",
            "title": "🎉 Millions Lottery Winner",
            "type": "spam",
            "subject": "CONGRATULATIONS! You Won $1,500,000 in International Sweepstakes",
            "text": "Dear winner, your email address was selected in our grand lottery promo. You have been awarded $1,500,000 USD cash prize! To claim your money, reply with your full name, bank wire details, and transfer fee to our claims agent today. 100% guaranteed risk free!"
        },
        {
            "id": "sample-crypto-3",
            "title": "📈 Bitcoin Investment Scheme",
            "type": "spam",
            "subject": "Make 500% profit with Bitcoin algorithm in 3 days",
            "text": "Exclusive deal! Our automated crypto bot guarantees $5,000 daily profits. Deposit $250 now and start trading Bitcoin with 0 risk. Click here to claim your cash bonus right now!"
        },
        {
            "id": "sample-meeting-4",
            "title": "📅 Project Sync & Standup",
            "type": "ham",
            "subject": "Rescheduled: Product Roadmap & Sprint Review",
            "text": "Hi team, let's move tomorrow's sprint review to 3:00 PM EST to accommodate everyone's schedule. Please review the updated Figma slides and pull request checklist prior to the meeting. Thanks, Alex."
        },
        {
            "id": "sample-invoice-5",
            "title": "🧾 Cloudflare Subscription Receipt",
            "type": "ham",
            "subject": "Your Cloudflare Invoice #INV-2026-91823 is Ready",
            "text": "Hi Jeyamani, thank you for your payment. Your invoice for the period of Aug 12 - Sep 12 is attached. Your card ending in 4021 was charged $20.00. You can download your official tax receipt from your account billing dashboard."
        },
        {
            "id": "sample-job-6",
            "title": "💼 Software Engineer Interview Followup",
            "type": "ham",
            "subject": "Follow-up regarding Frontend Engineer position",
            "text": "Hello, thank you for taking the time to speak with our engineering team yesterday. We were very impressed with your React and Python experience. We would love to invite you to the final round technical conversation this Thursday at 11 AM. Let us know if that works for you."
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)