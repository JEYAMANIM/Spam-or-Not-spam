// API Service for Email Spam & Threat Detection

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function getApiBaseUrl() {
  return localStorage.getItem('spam_detector_api_url') || DEFAULT_API_URL;
}

export function setApiBaseUrl(url) {
  if (!url) {
    localStorage.removeItem('spam_detector_api_url');
  } else {
    localStorage.setItem('spam_detector_api_url', url.trim().replace(/\/+$/, ''));
  }
}

// Fallback intelligent client-side heuristic engine for standalone/offline Cloudflare preview
const CLIENT_SPAM_TRIGGERS = [
  "urgent", "action required", "verify account", "claim your prize", "winner", 
  "won", "lottery", "100% free", "click here", "wire transfer", "risk free",
  "credit card", "bank account", "limited time", "pre-approved", "guaranteed",
  "cash bonus", "investment", "bitcoin", "crypto", "inheritance", "congratulations",
  "exclusive deal", "special promotion", "unclaimed", "password reset", "expire soon",
  "act now", "make money", "million dollars", "viagra", "pharmacy", "cheap loan",
  "refund notice", "tax refund", "suspicious activity", "security alert"
];

export function clientSideAnalyze(subject = '', text = '') {
  const fullText = `Subject: ${subject} ${text}`.trim();
  const lowerText = fullText.toLowerCase();

  const foundTriggers = CLIENT_SPAM_TRIGGERS.filter(t => lowerText.includes(t));
  
  const totalChars = fullText.length;
  const totalWords = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
  const uppercaseChars = (fullText.match(/[A-Z]/g) || []).length;
  const capsRatio = totalChars > 0 ? parseFloat(((uppercaseChars / totalChars) * 100).toFixed(1)) : 0;
  
  const exclamationCount = (fullText.match(/!/g) || []).length;
  const questionCount = (fullText.match(/\?/g) || []).length;
  const currencyCount = (fullText.match(/[\$€£₹¥]/g) || []).length;
  const urlCount = (fullText.match(/https?:\/\/[^\s]+|www\.[^\s]+/g) || []).length;
  const emailCount = (fullText.match(/[\w\.-]+@[\w\.-]+/g) || []).length;

  const urgencyTerms = ["urgent", "immediately", "deadline", "act now", "24 hours", "suspended", "expire"];
  const urgencyScore = Math.min(100, (urgencyTerms.filter(t => lowerText.includes(t)).length * 25) + (capsRatio > 20 ? 20 : 0));

  const financialTerms = ["money", "dollar", "$", "wire", "bank", "transfer", "loan", "investment", "crypto", "bitcoin", "card", "prize", "cash"];
  const financialScore = Math.min(100, (financialTerms.filter(t => lowerText.includes(t)).length * 20) + (currencyCount > 1 ? 25 : 0));

  // Compute probability heuristic
  let spamScore = 2.0;
  spamScore += foundTriggers.length * 22.0;
  spamScore += (urgencyScore * 0.3);
  spamScore += (financialScore * 0.3);
  if (capsRatio > 20) spamScore += 18.0;
  if (exclamationCount >= 3) spamScore += 12.0;
  if (urlCount >= 2) spamScore += 15.0;

  // Dampen if normal conversational
  if (foundTriggers.length === 0 && urgencyScore === 0 && financialScore === 0 && capsRatio < 15) {
    spamScore = Math.min(spamScore, 4.0);
  }

  const spamProb = parseFloat(Math.min(99.9, Math.max(0.1, spamScore)).toFixed(2));
  const hamProb = parseFloat((100.0 - spamProb).toFixed(2));
  const isSpam = spamProb >= 50.0;

  let verdict = "HAM";
  let riskLevel = "LOW";
  if (spamProb >= 75.0) {
    verdict = "SPAM";
    riskLevel = "HIGH";
  } else if (spamProb >= 40.0) {
    verdict = "SUSPICIOUS";
    riskLevel = "MEDIUM";
  }

  const reasons = [];
  if (foundTriggers.length > 0) {
    reasons.push(`Contains ${foundTriggers.length} suspicious trigger keyword(s): ${foundTriggers.slice(0, 3).join(', ')}`);
  }
  if (capsRatio > 20) {
    reasons.push(`Excessive capitalization (${capsRatio}%) indicating aggressive emphasis`);
  }
  if (exclamationCount >= 3) {
    reasons.push(`High exclamation mark frequency (${exclamationCount}) simulating urgency`);
  }
  if (urlCount >= 2) {
    reasons.push(`Multiple external links (${urlCount}) found`);
  }
  if (financialScore >= 35) {
    reasons.push("Strong financial or monetary solicitation indicators present");
  }
  if (reasons.length === 0) {
    reasons.push("Clean natural email syntax with zero recognized spam patterns");
  }

  return {
    is_spam: isSpam,
    spam_probability: spamProb,
    ham_probability: hamProb,
    confidence: Math.max(spamProb, hamProb),
    verdict,
    risk_level: riskLevel,
    highlighted_keywords: foundTriggers,
    metrics: {
      total_chars: totalChars,
      total_words: totalWords,
      caps_ratio_percent: capsRatio,
      exclamation_count: exclamationCount,
      question_count: questionCount,
      currency_count: currencyCount,
      url_count: urlCount,
      email_count: emailCount,
      urgency_score: urgencyScore,
      financial_score: financialScore,
    },
    reasons,
    subject,
    text_preview: text.slice(0, 150) + (text.length > 150 ? '...' : ''),
    is_client_fallback: true
  };
}

export async function checkBackendHealth() {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

export async function analyzeEmail(subject, text) {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: subject || '', text: text || '' }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`API returned HTTP ${res.status}`);
    const data = await res.json();
    return { ...data, is_client_fallback: false };
  } catch (err) {
    console.warn(`[Backend Offline - using Local Heuristic Engine]: ${err.message}`);
    return clientSideAnalyze(subject, text);
  }
}

export async function analyzeBatchEmails(emailList) {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${baseUrl}/predict/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: emailList }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ...data, is_client_fallback: false };
  } catch (err) {
    console.warn(`[Batch Fallback]: ${err.message}`);
    const results = emailList.map(item => clientSideAnalyze(item.subject, item.text));
    const total = results.length;
    const spamCount = results.filter(r => r.is_spam).length;
    return {
      total_analyzed: total,
      spam_count: spamCount,
      ham_count: total - spamCount,
      spam_rate_percent: total > 0 ? parseFloat(((spamCount / total) * 100).toFixed(1)) : 0,
      results,
      is_client_fallback: true
    };
  }
}

export async function fetchExamples() {
  const baseUrl = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${baseUrl}/examples`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Fallback static presets
  }
  return [
    {
      id: "sample-phishing-1",
      title: "🚨 Urgent Bank Phishing",
      type: "spam",
      subject: "URGENT: Your Bank Account Access Has Been Suspended",
      text: "Dear Valued Customer, We noticed unauthorized login attempts on your online banking account. To prevent total suspension, you must verify your identity immediately within 24 hours. Click here: http://secure-bank-login-verify.com to submit your credentials and credit card info. Failure to do so will result in permanent account termination!"
    },
    {
      id: "sample-lottery-2",
      title: "🎉 Lottery Cash Prize",
      type: "spam",
      subject: "CONGRATULATIONS! You Won $1,500,000 in International Sweepstakes",
      text: "Dear winner, your email address was selected in our grand lottery promo. You have been awarded $1,500,000 USD cash prize! To claim your money, reply with your full name, bank wire details, and transfer fee to our claims agent today. 100% guaranteed risk free!"
    },
    {
      id: "sample-crypto-3",
      title: "📈 Crypto Investment Scam",
      type: "spam",
      subject: "Make 500% profit with Bitcoin algorithm in 3 days",
      text: "Exclusive deal! Our automated crypto bot guarantees $5,000 daily profits. Deposit $250 now and start trading Bitcoin with 0 risk. Click here to claim your cash bonus right now!"
    },
    {
      id: "sample-meeting-4",
      title: "📅 Sprint Meeting Sync",
      type: "ham",
      subject: "Rescheduled: Product Roadmap & Sprint Review",
      text: "Hi team, let's move tomorrow's sprint review to 3:00 PM EST to accommodate everyone's schedule. Please review the updated Figma slides and pull request checklist prior to the meeting. Thanks, Alex."
    },
    {
      id: "sample-invoice-5",
      title: "🧾 Cloudflare Subscription Receipt",
      type: "ham",
      subject: "Your Cloudflare Invoice #INV-2026-91823 is Ready",
      text: "Hi Jeyamani, thank you for your payment. Your invoice for the period of Aug 12 - Sep 12 is attached. Your card ending in 4021 was charged $20.00. You can download your official tax receipt from your account billing dashboard."
    },
    {
      id: "sample-job-6",
      title: "💼 Tech Interview Invitation",
      type: "ham",
      subject: "Follow-up regarding Frontend Engineer position",
      text: "Hello, thank you for taking the time to speak with our engineering team yesterday. We were very impressed with your React and Python experience. We would love to invite you to the final round technical conversation this Thursday at 11 AM. Let us know if that works for you."
    }
  ];
}
