import os
import json
import argparse
import pandas as pd
import numpy as np
import sys
from prophet import Prophet
from pymongo import MongoClient
from bson import ObjectId

def run(mongo_uri, db_name, coll_name, customer_id, out_path):
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        db = client[db_name]
        coll = db[coll_name]
        
        # 1. Fetch data
        query = {"customerId": ObjectId(customer_id)}
        docs = list(coll.find(query).sort("dateOfSubmission", 1))
        client.close()

        if len(docs) < 2:
            raise ValueError("Need at least 2 readings to generate a forecast.")

        # 2. Data Cleaning (The "Anti-Crash" layer)
        df = pd.DataFrame(docs)
        df = df.rename(columns={"dateOfSubmission": "ds", "monthlyUsage": "y"})
        
        # Convert to datetime and numeric
        df['ds'] = pd.to_datetime(df['ds'], errors='coerce')
        df['y'] = pd.to_numeric(df['y'], errors='coerce')
        
        # Drop rows with missing crucial data
        df = df.dropna(subset=['ds', 'y'])

        # IMPORTANT: Aggregate by month-end to remove duplicates on the same date
        df['ds'] = df['ds'] + pd.offsets.MonthEnd(0)
        df = df.groupby('ds').agg({'y': 'mean', 'killowatRead': 'max'}).reset_index()

        if len(df) < 2:
            raise ValueError("Insufficient unique monthly data.")

        # 3. Model
        m = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
        m.fit(df[['ds', 'y']])
        
        future = m.make_future_dataframe(periods=1, freq='ME')
        forecast = m.predict(future)
        
        res = forecast.iloc[-1]
        last_read = df['killowatRead'].iloc[-1] if 'killowatRead' in df.columns else 0

        # 4. Save
        output = {
            "customerId": str(customer_id),
            "last_history_date": df['ds'].max().strftime("%Y-%m-%d"),
            "prediction": {
                "next_month": res['ds'].strftime("%Y-%m-%d"),
                "predicted_usage": max(0, float(res['yhat'])),
                "predicted_killowat": float(last_read + res['yhat'])
            },
            "updatedAt": pd.Timestamp.now().isoformat()
        }

        with open(out_path, "w") as f:
            json.dump(output, f)

    except Exception as e:
        print(f"PYTHON_ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mongo")
    parser.add_argument("--db")
    parser.add_argument("--coll")
    parser.add_argument("--customer")
    parser.add_argument("--out")
    args = parser.parse_args()
    run(args.mongo, args.db, args.coll, args.customer, args.out)