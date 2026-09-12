import csv
import os
import joblib
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report

def train_and_save():
    csv_path = "C:/Users/acer/Downloads/archive (1)/emails.csv"
    if not os.path.exists(csv_path):
        csv_path = os.path.join(os.path.dirname(__file__), "emails.csv")
    
    print(f"Loading data from {csv_path}...")
    texts = []
    labels = []
    with open(csv_path, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if len(row) >= 2:
                texts.append(row[0])
                try:
                    labels.append(int(row[1]))
                except ValueError:
                    continue

    print(f"Total valid samples: {len(texts)} (Ham: {labels.count(0)}, Spam: {labels.count(1)})")

    # Fit CountVectorizer with English stop words
    vectorizer = CountVectorizer(stop_words='english', max_features=25000)
    X = vectorizer.fit_transform(texts)

    # Train Multinomial Naive Bayes classifier
    model = MultinomialNB(alpha=1.0)
    model.fit(X, labels)

    predictions = model.predict(X)
    acc = accuracy_score(labels, predictions)
    print(f"Model Training Accuracy: {acc * 100:.2f}%")
    print(classification_report(labels, predictions, target_names=["Ham (Safe)", "Spam"]))

    # Save to Backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    vectorizer_path = os.path.join(backend_dir, "vectorizer.pkl")
    model_path = os.path.join(backend_dir, "emails_spam_detection_model.pkl")

    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(model, model_path)
    print(f"Saved vectorizer to: {vectorizer_path}")
    print(f"Saved model to: {model_path}")

if __name__ == "__main__":
    train_and_save()
