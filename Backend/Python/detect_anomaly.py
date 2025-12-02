import pymongo
import pandas as pd
from sklearn.ensemble import IsolationForest
from datetime import datetime
import sys
import json
import warnings

warnings.filterwarnings("ignore")


# ---------------------------------------------------------
# 1. READ INPUT FROM NODE.JS
# ---------------------------------------------------------
try:
    input_data = json.loads(sys.stdin.read())
except:
    print(json.dumps({"error": "Invalid input from Node.js"}))
    sys.exit()

customer_id = input_data["customerId"]
current_kwh = input_data["killowatRead"]
current_usage = input_data["monthlyUsage"]
current_timestamp = datetime.now().timestamp()


# ---------------------------------------------------------
# 2. CONNECT TO MONGODB ATLAS
# ---------------------------------------------------------
try:
    client = pymongo.MongoClient(
        "mongodb+srv://paul:paul1@cluster0.342e9qa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )

    db = client["test"]
    collection = db["meterreadings"]

except Exception as e:
    print(json.dumps({"error": f"MongoDB connection failed: {str(e)}"}))
    sys.exit()


# ---------------------------------------------------------
# 3. GET LAST 6 READINGS
# ---------------------------------------------------------
try:
    previous = list(
        collection.find(
            {"customerId": customer_id},
            {"killowatRead": 1, "monthlyUsage": 1, "dateOfSubmission": 1}
        )
        .sort("createdAt", -1)
        .limit(6)
    )
except Exception as e:
    print(json.dumps({"error": f"Database query failed: {str(e)}"}))
    sys.exit()

# If no history → cannot detect anomaly
if not previous:
    print(json.dumps({"anomalyStatus": "Normal"}))
    sys.exit()


# ---------------------------------------------------------
# 4. PREPARE DATAFRAME
# ---------------------------------------------------------
df = pd.DataFrame(previous)

# Convert date string to timestamp safely
df["timestamp"] = pd.to_datetime(df["dateOfSubmission"], errors="coerce").astype("int64") / 1e9
df["timestamp"] = df["timestamp"].fillna(df["timestamp"].mean())


# ---------------------------------------------------------
# 5. TRAIN ISOLATION FOREST
# ---------------------------------------------------------
train_features = df[["killowatRead", "monthlyUsage", "timestamp"]]

model = IsolationForest(
    n_estimators=200,
    contamination=0.15,
    random_state=42
)

model.fit(train_features)


# ---------------------------------------------------------
# 6. PREDICT CURRENT READING
# ---------------------------------------------------------
test_point = [[current_kwh, current_usage, current_timestamp]]
prediction = model.predict(test_point)[0]  # 1 = normal, -1 = anomaly


# ---------------------------------------------------------
# 7. RETURN RESULT TO NODE.JS
# ---------------------------------------------------------
result = {
    "anomalyStatus": "Normal" if prediction == 1 else "Anomaly/Fraud"
}

print(json.dumps(result))
