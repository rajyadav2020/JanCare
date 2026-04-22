# Script to run all JanCare services

Write-Host "Starting ML Service (Port 8000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd f:\project\JanCare\ml_service; .\venv\Scripts\activate; py -m uvicorn app:app --reload --port 8000"

Write-Host "Starting Backend Service (Port 5000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd f:\project\JanCare\backend; npm run dev"

Write-Host "Starting Frontend Service (Port 5173)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd f:\project\JanCare\frontend; npm run dev"

Write-Host "All services have been started in new windows!"
