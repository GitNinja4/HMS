@echo off
cd /d c:\Users\adity\Desktop\New\HMS\backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000
pause
