import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import joblib
import os

def train():
    if not os.path.exists('data/historical_opd.csv'):
        print("Data not found. Run generate_data.py first.")
        return
        
    df = pd.read_csv('data/historical_opd.csv')
    
    # Encode department
    le = LabelEncoder()
    df['department_encoded'] = le.fit_transform(df['department'])
    
    # Features and Target
    X = df[['day_of_week', 'hour', 'department_encoded', 'is_holiday']]
    y = df['patient_count']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model R^2 Score: {score:.2f}")
    
    # Ensure directory exists
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/crowd_model.pkl')
    joblib.dump(le, 'models/dept_encoder.pkl')
    print("Model and encoder saved to models/")

if __name__ == '__main__':
    train()
