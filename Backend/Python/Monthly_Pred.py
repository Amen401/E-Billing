# Monthly_pred.py
import os
import json
import argparse
import pandas as pd
import numpy as np
from prophet import Prophet
from pymongo import MongoClient
from sklearn.metrics import mean_absolute_error
from bson import ObjectId

# ------------------------------
# FETCH FROM MONGO
# ------------------------------
def fetch_from_mongo(mongo_uri, db_name, collection_name, customer_id):
    client = MongoClient(mongo_uri)
    db = client[db_name]
    coll = db[collection_name]

    print("Connecting to:", mongo_uri)
    print("Connected! Using database:", db_name)
    print("Using collection:", collection_name)

    # Convert customer_id to ObjectId
    try:
        customer_id = ObjectId(customer_id)
    except:
        print("Invalid ObjectId format")
        return []

    docs = list(
        coll.find(
            {"customerId": customer_id},
            {"killowatRead": 1, "monthlyUsage": 1, "dateOfSubmission": 1, "_id": 0}
        ).sort("dateOfSubmission", 1)
    )

    print("Documents fetched:", len(docs))
    client.close()
    return docs

# ------------------------------
# PREPARE DATAFRAME + 6 MONTH FILTER
# ------------------------------
def prepare_df(docs):
    if not docs:
        raise ValueError("No documents found for this customer.")

    df = pd.DataFrame(docs)
    df = df.rename(columns={"dateOfSubmission": "ds"})
    
    # Convert to datetime and align to month-end
    df['ds'] = pd.to_datetime(df['ds'], format="%m/%d/%Y, %H:%M")
    df['ds'] = df['ds'] + pd.offsets.MonthEnd(0)  # month-end alignment

    # Normalize monthlyUsage
    df = df[pd.notna(df['monthlyUsage'])]
    df['y'] = df['monthlyUsage'].astype(float)

    # Ensure killowatRead exists
    if 'killowatRead' not in df.columns:
        df['killowatRead'] = np.nan

    df = df.sort_values('ds').reset_index(drop=True)

    # ----- FILTER LAST 6 MONTHS -----
    six_months_ago = df['ds'].max() - pd.DateOffset(months=6)
    df_last6 = df[df['ds'] >= six_months_ago].copy()

    if len(df_last6) >= 3:  # use last 6 months if enough data
        df = df_last6

    return df[['ds', 'y', 'killowatRead']]

# ------------------------------
# TRAIN MODEL
# ------------------------------
def train_prophet(df):
    m = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
    m.fit(df[['ds', 'y']])
    return m

# ------------------------------
# BACKTEST (SINGLE MONTH)
# ------------------------------
def backtest_mae(df):
    if len(df) < 4:
        return None

    train = df[:-1]
    test = df[-1:]

    m = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=False)
    m.fit(train[['ds', 'y']])

    fut = m.make_future_dataframe(periods=1, freq='ME')
    pred = m.predict(fut)

    # pick closest date
    test_date = test['ds'].values[0]
    nearest_idx = (pred['ds'] - test_date).abs().idxmin()
    pred_y = pred.loc[nearest_idx, 'yhat']

    mae = float(mean_absolute_error(test['y'].values, [pred_y]))
    return mae

# ------------------------------
# PREDICT NEXT MONTH
# ------------------------------
def predict_next_month(m, df):
    future = m.make_future_dataframe(periods=1, freq='ME')
    forecast = m.predict(future)

    last_hist = df['ds'].max()
    next_row = forecast[forecast['ds'] > last_hist].iloc[0]

    return {
        "date": next_row['ds'].strftime("%Y-%m-%d"),
        "monthlyUsage": float(next_row['yhat']),
        "lower": float(next_row['yhat_lower']),
        "upper": float(next_row['yhat_upper']),
    }

# ------------------------------
# PREDICT NEXT KILLOWAT READ
# ------------------------------
def compute_pred_killowat(df, predicted_usage):
    known = df.loc[pd.notna(df['killowatRead'])]
    if known.empty:
        return None

    last_read = float(known.iloc[-1]['killowatRead'])
    return last_read + predicted_usage

# ------------------------------
# MAIN RUN METHOD
# ------------------------------
def run(mongo_uri, db, coll, customer_id, out_path):
    docs = fetch_from_mongo(mongo_uri, db, coll, customer_id)

    df = prepare_df(docs)

    mae = backtest_mae(df)

    model = train_prophet(df)

    pred = predict_next_month(model, df)

    pred_killowat = compute_pred_killowat(df, pred['monthlyUsage'])

    summary = {
        "customerId": customer_id,
        "history_used": len(df),
        "last_6_month_filter_applied": True,
        "last_history_date": df['ds'].max().strftime("%Y-%m-%d"),
        "mae_last_month": mae,
        "prediction": {
            "next_month_date": pred['date'],
            "predicted_monthlyUsage": pred['monthlyUsage'],
            "usage_range": {
                "lower": pred['lower'],
                "upper": pred['upper'],
            },
            "predicted_killowatRead": pred_killowat
        }
    }

    with open(out_path, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"Prediction saved to {out_path}")
    return summary

# ------------------------------
# ENTRY POINT
# ------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mongo", required=True)
    parser.add_argument("--db", required=True)
    parser.add_argument("--coll", default="meterreadings")
    parser.add_argument("--customer", required=True)
    parser.add_argument("--out", default="forecast.json")
    args = parser.parse_args()

    run(args.mongo, args.db, args.coll, args.customer, args.out)
