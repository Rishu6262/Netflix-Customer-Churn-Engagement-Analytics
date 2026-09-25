from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib

from pydantic import BaseModel


# ============================================================
# Load trained ML model
# ============================================================

model = joblib.load("best_churn_model.pkl")


# ============================================================
# Create FastAPI application
# ============================================================

app = FastAPI(
    title="Netflix Customer Churn Prediction API",
    description="API for predicting Netflix customer churn",
    version="1.0.0"
)


# ============================================================
# CORS Configuration
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Pydantic Request Schema
# ============================================================

class CustomerData(BaseModel):
    age: int
    gender: str
    subscription_type: str
    watch_hours: float
    last_login_days: int
    region: str
    device: str
    monthly_fee: float
    payment_method: str
    number_of_profiles: int
    avg_watch_time_per_day: float
    favorite_genre: str


# ============================================================
# Home Route
# ============================================================

@app.get("/")
def home():
    return {
        "message": "Netflix Customer Churn API is working!"
    }


# ============================================================
# Prediction Route
# ============================================================

@app.post("/predict")
def predict_churn(customer: CustomerData):

    try:

        # Convert Pydantic object into dictionary
        customer_dict = customer.model_dump()

        # Convert dictionary into DataFrame
        input_data = pd.DataFrame([customer_dict])

        # Make prediction
        prediction = model.predict(input_data)[0]

        # Get probability of churn
        probability = model.predict_proba(input_data)[0][1]

        # Return prediction response
        return {
            "prediction": int(prediction),

            "result": (
                "Customer is likely to churn"
                if prediction == 1
                else "Customer is unlikely to churn"
            ),

            "churn_probability": round(
                float(probability),
                4
            )
        }

    except Exception as e:

        print("ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Prediction failed"
        )
