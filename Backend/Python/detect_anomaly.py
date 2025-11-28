import pymongo
import pandas as pd
from sklearn.ensemble import IsolationForest
from datetime import datetime
import sys
import json


# ---------------------------------------------------------
# 1. READ INPUT FROM NODE.JS
# ---------------------------------------------------------
input_data = json.loads(sys.stdin.read())

customer_id = input_data["customerId"]
current_kwh = input_data["killowatRead"]
current_usage = input_data["monthlyUsage"]
current_timestamp = datetime.now().timestamp()


# ---------------------------------------------------------
# 2. CONNECT TO MONGODB ATLAS
# ---------------------------------------------------------
client = pymongo.MongoClient(
    "YOUR_MONGODB_ATLAS_URL"
)

db = client["your_database_name"]
collection = db["meterreadings"]


# ---------------------------------------------------------
# 3. GET LAST 6 READINGS (OR FEWER IF NOT EXIST)
# ---------------------------------------------------------
previous = list(
    collection.find(
        {"customerId": customer_id},
        {"killowatRead": 1, "monthlyUsage": 1, "dateOfSubmission": 1}
    )
    .sort("createdAt", -1)
    .limit(6)
)

if not previous:
    # No history → cannot detect → always normal
    print(json.dumps({"anomalyStatus": "Normal"}))
    sys.exit()

df = pd.DataFrame(previous)

# Convert date to timestamp
df["timestamp"] = pd.to_datetime(df["dateOfSubmission"]).astype(int) / 10**9

# ---------------------------------------------------------
# 4. TRAIN ISOLATION FOREST USING ONLY PREVIOUS READINGS
# ---------------------------------------------------------
train_features = df[["killowatRead", "monthlyUsage", "timestamp"]]

model = IsolationForest(
    n_estimators=200,
    contamination=0.15,   # adjust as needed
    random_state=42
)

model.fit(train_features)


# ---------------------------------------------------------
# 5. PREDICT AGAINST CURRENT READING
# ---------------------------------------------------------
test_point = [[current_kwh, current_usage, current_timestamp]]
prediction = model.predict(test_point)[0]   # 1 or -1


# ---------------------------------------------------------
# 6. RETURN RESULT TO NODE.JS
# ---------------------------------------------------------
result = {
    "anomalyStatus": "Normal" if prediction == 1 else "Anomaly/Fraud"
}

print(json.dumps(result))
