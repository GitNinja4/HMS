import os
import subprocess
import sys

# Change to backend directory
os.chdir(r'c:\Users\adity\Desktop\New\HMS\backend')

# Add backend to Python path
sys.path.insert(0, os.getcwd())

# Run uvicorn
subprocess.run([
    sys.executable, '-m', 'uvicorn',
    'app.main:app',
    '--reload',
    '--host', 'localhost',
    '--port', '5000'
])
