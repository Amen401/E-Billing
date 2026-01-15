import os
import json
import argparse
import pandas as pd
import numpy as np
import sys
from prophet import Prophet
from pymongo import MongoClient
from sklearn.metrics import mean_absolute_error
from bson import ObjectId

def fetch_from_mongo(mongo_uri, db_name, collection_name, customer_id):
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        db = client[db_name]
        coll = db[collection_name]
        
        c_id = ObjectId(customer_id) if isinstance(customer_id, str) else customer_id
        
        # Fetching necessary fields
        docs = list(coll.find(
            {"customerId": c_id},
            {"killowatRead": 1, "monthlyUsage": 1, "dateOfSubmission": 1, "_id": 0}
        ).sort("dateOfSubmission", 1))
        
        client.close()
        return docs
    except Exception as e:
        print(f"Database Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

def prepare_df(docs):
    if len(docs) < 2:
        raise ValueError("Insufficient data: Need at least 2 historical entries to forecast.")

    df = pd.DataFrame(docs)
    df = df.rename(columns={"dateOfSubmission": "ds"})
    
    # Robust date conversion
    df['ds'] = pd.to_datetime(df['ds'], errors='coerce')
    df = df.dropna(subset=['ds'])
    
    # Align to month-end to normalize irregular submission dates
    df['ds'] = df['ds'] + pd.offsets.MonthEnd(0)

    # Ensure y is numeric
    df['y'] = pd.to_numeric(df['monthlyUsage'], errors='coerce')
    df = df.dropna(subset=['y'])

    df = df.sort_values('ds').reset_index(drop=True)

    # Use last 12 months for seasonality if possible, otherwise last 6
    # Prophet handles longer history better, but we filter to ensure relevance
    return df[['ds', 'y', 'killowatRead']]

def run(mongo_uri, db, coll, customer_id, out_path):
    try:
        docs = fetch_from_mongo(mongo_uri, db, coll, customer_id)
        df = prepare_df(docs)

        # 1. Backtest MAE (if enough data)
        mae = None
        if len(df) > 3:
            train = df[:-1]
            m_bt = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
            m_bt.fit(train[['ds', 'y']])
            fut_bt = m_bt.make_future_dataframe(periods=1, freq='ME')
            forecast_bt = m_bt.predict(fut_bt)
            pred_val = forecast_bt.iloc[-1]['yhat']
            mae = float(mean_absolute_error([df.iloc[-1]['y']], [pred_val]))

        # 2. Final Forecast
        model = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
        model.fit(df[['ds', 'y']])
        
        future = model.make_future_dataframe(periods=1, freq='ME')
        forecast = model.predict(future)
        
        next_row = forecast.iloc[-1]
        
        # Calculate next killowat read based on last known value
        last_known_read = df['killowatRead'].dropna().iloc[-1] if not df['killowatRead'].dropna().empty else 0
        predicted_usage = float(next_row['yhat'])
        pred_killowat = float(last_known_read + predicted_usage)

        summary = {
            "customerId": str(customer_id),
            "status": "success",
            "history_count": len(df),
            "mae_accuracy": mae,
            "prediction": {
                "date": next_row['ds'].strftime("%Y-%m-%d"),
                "monthlyUsage": max(0, predicted_usage), # Avoid negative predictions
                "range": {
                    "lower": max(0, float(next_row['yhat_lower'])),
                    "upper": float(next_row['yhat_upper'])
                },
                "predicted_killowatRead": pred_killowat
            }
        }

        with open(out_path, "w") as f:
            json.dump(summary, f)

    except Exception as e:
        print(f"Logic Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mongo", required=True)
    parser.add_argument("--db", required=True)
    parser.add_argument("--coll", default="meterreadings")
    parser.add_argument("--customer", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    run(args.mongo, args.db, args.coll, args.customer, args.out)