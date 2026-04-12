import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os

def generate_opd_data(num_records=50000):
    departments = ['Orthopedics', 'Pediatrics', 'Cardiology', 'Dermatology', 'Neurology', 'General Medicine']
    
    # Base date
    start_date = datetime.now() - timedelta(days=365)
    
    data = []
    
    for _ in range(num_records):
        dept = random.choice(departments)
        
        # Pick a random date within the last year
        rand_days = random.randint(0, 365)
        date = start_date + timedelta(days=rand_days)
        
        # Pick a random hour between 8 AM and 5 PM (17)
        hour = random.randint(8, 17)
        
        # Determine day of week
        day_of_week = date.weekday()
        
        # Simulate crowd behavior
        # Monday (0) and Tuesday (1) are generally crowded
        # Mornings (9-11) are crowded
        base_crowd = random.randint(10, 50)
        
        if day_of_week in [0, 1]:
            base_crowd += random.randint(20, 40)
        
        if 9 <= hour <= 11:
            base_crowd += random.randint(30, 50)
            
        if dept in ['General Medicine', 'Pediatrics']:
            base_crowd += random.randint(10, 30)
            
        is_holiday = 1 if day_of_week == 6 else 0
        if is_holiday:
            base_crowd = random.randint(5, 20)
            
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'day_of_week': day_of_week,
            'hour': hour,
            'department': dept,
            'is_holiday': is_holiday,
            'patient_count': base_crowd
        })
        
    df = pd.DataFrame(data)
    
    # Ensure directory exists
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/historical_opd.csv', index=False)
    print(f"Generated {num_records} rows of data at data/historical_opd.csv")

if __name__ == '__main__':
    generate_opd_data()
