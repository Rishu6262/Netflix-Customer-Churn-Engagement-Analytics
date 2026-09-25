from fastapi import FastAPI
import pandas as pd
import joblib

from pydantic import BaseModel

model = joblib.load("best_churn_model.pkl")

app= FastAPI(
    title= "Netflix Customer Churn Prediction API",
    description= "API for prediction Netflex customer churn",
    version="1.0.0"
)

class customerData (BaseModel):
    age:int
    gender:str
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


@app.get("/")
def home():
    return{
        "message":"ON Working !"
    }

@app.post("/predict")
def predict_churn (customer:customerData):

    try:
        customerData =customer.model_dump()

        input_data = pd.DataFrame([customer.model_dump()])

        prediction = model.predict(input_data)[0]

        probability = model.predict_proba(input_data)[0][1]

        return {
        "prediction": int(prediction),
        "result": (
            "Customer is likely to churn"
            if prediction == 1
            else "Customer is unlikely to churn"
        ),
        "churn_probability": round(float(probability), 4)
        }  
    except Exception as e:

        print("ERROR:", repr(e))

        return {
            "error": str(e)
        }


