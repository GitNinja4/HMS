import requests
import json

API_URL = "http://localhost:5000/api"

# Test credentials for each role - Using name@K123 format for passwords
test_users = [
    # Admin
    {"email": "admin@example.com", "name": "Admin", "password": "Admin@K123", "role": "admin"},
    
    # Doctors
    {"email": "dr_john@example.com", "name": "Dr. John Smith", "password": "DrJohnSmith@K123", "role": "doctor"},
    {"email": "dr_sarah@example.com", "name": "Dr. Sarah Johnson", "password": "DrSarahJohnson@K123", "role": "doctor"},
    {"email": "dr_mike@example.com", "name": "Dr. Mike Davis", "password": "DrMikeDavis@K123", "role": "doctor"},
    
    # Nurses
    {"email": "nurse_jane@example.com", "name": "Nurse Jane", "password": "NurseJane@K123", "role": "nurse"},
    {"email": "nurse_alice@example.com", "name": "Nurse Alice", "password": "NurseAlice@K123", "role": "nurse"},
    {"email": "nurse_bob@example.com", "name": "Nurse Bob", "password": "NurseBob@K123", "role": "nurse"},
    
    # Pharmacist
    {"email": "pharmacist@example.com", "name": "Pharmacist", "password": "Pharmacist@K123", "role": "pharmacist"},
    
    # Lab Tech
    {"email": "labtech@example.com", "name": "Lab Tech", "password": "LabTech@K123", "role": "lab_tech"},
    
    # Patients
    {"email": "patient_mark@example.com", "name": "Patient Mark", "password": "PatientMark@K123", "role": "patient"},
    {"email": "patient_emma@example.com", "name": "Patient Emma", "password": "PatientEmma@K123", "role": "patient"},
    {"email": "patient_john@example.com", "name": "Patient John", "password": "PatientJohn@K123", "role": "patient"},
    {"email": "patient_sarah@example.com", "name": "Patient Sarah", "password": "PatientSarah@K123", "role": "patient"},
    {"email": "patient_mike@example.com", "name": "Patient Mike", "password": "PatientMike@K123", "role": "patient"},
    {"email": "patient_lisa@example.com", "name": "Patient Lisa", "password": "PatientLisa@K123", "role": "patient"},
]

print("Creating test users...\n")
created_users = {}
created_tokens = {}

for user in test_users:
    response = requests.post(f"{API_URL}/auth/signup", json=user)
    if response.status_code == 201 or response.status_code == 200:
        data = response.json()
        created_tokens[user['role']] = data.get('access_token')
        created_users[user['email']] = {
            'id': data.get('user_id'),
            'role': user['role'],
            'name': user['name'],
            'token': data.get('access_token')
        }
        print(f"✅ {user['role'].upper():<12} | {user['name']:<25} | {user['email']:<30}")
    else:
        print(f"❌ {user['role'].upper():<12} | {user['name']:<25} | Error: {response.json()}")

print("\n" + "="*100)
print("TEST CREDENTIALS SUMMARY")
print("="*100)
for user in test_users:
    # Format password as shown
    pwd_parts = user['password'].split('@')
    print(f"Role: {user['role'].upper():<15} | Email: {user['email']:<30} | Password: {user['password']}")

# Assign patients to doctors and nurses
print("\n" + "="*100)
print("ASSIGNING PATIENTS TO DOCTORS & NURSES")
print("="*100)

doctors = [u for u in created_users.values() if u['role'] == 'doctor']
nurses = [u for u in created_users.values() if u['role'] == 'nurse']
patients = [u for u in created_users.values() if u['role'] == 'patient']

# Get admin token for assignments
admin_users = [u for u in created_users.values() if u['role'] == 'admin']
admin_token = admin_users[0]['token'] if admin_users else None
admin_headers = {"Authorization": f"Bearer {admin_token}"}

# Assign patients to doctors
doctor_idx = 0
for idx, patient in enumerate(patients):
    if doctor_idx >= len(doctors):
        doctor_idx = 0
    
    doctor = doctors[doctor_idx]
    response = requests.post(
        f"{API_URL}/users/{patient['id']}/assign-doctor",
        json={"doctor_id": doctor['id']},
        headers=admin_headers
    )
    if response.status_code == 200:
        print(f"✅ Assigned {patient['name']:<20} to {doctor['name']}")
    else:
        print(f"❌ Failed to assign {patient['name']} to {doctor['name']}: {response.json()}")
    
    doctor_idx += 1

# Assign patients to nurses
nurse_idx = 0
for patient in patients:
    if nurse_idx >= len(nurses):
        nurse_idx = 0
    
    nurse = nurses[nurse_idx]
    response = requests.post(
        f"{API_URL}/users/{patient['id']}/assign-nurse",
        json={"nurse_id": nurse['id']},
        headers=admin_headers
    )
    if response.status_code == 200:
        print(f"✅ Assigned {patient['name']:<20} to {nurse['name']}")
    else:
        print(f"❌ Failed to assign {patient['name']} to {nurse['name']}: {response.json()}")
    
    nurse_idx += 1

# Update patient statuses to "admitted"
print("\n" + "="*100)
print("SETTING PATIENT STATUSES TO ADMITTED")
print("="*100)

for patient in patients:
    response = requests.patch(
        f"{API_URL}/users/{patient['id']}/status",
        json={"status": "admitted"},
        headers=admin_headers
    )
    if response.status_code == 200:
        print(f"✅ {patient['name']:<25} status set to ADMITTED")
    else:
        print(f"❌ Failed to set {patient['name']} status: {response.json()}")

# Test API connectivity for each role
print("\n" + "="*100)
print("TESTING API CONNECTIVITY")
print("="*100)
for role, token in created_tokens.items():
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/users", headers=headers)
    status = "✅" if response.status_code in [200, 403] else "❌"
    detail = response.json().get('detail', 'Success') if response.status_code != 200 else 'Success'
    print(f"{status} {role.upper():<15} | Status: {response.status_code} | {str(detail)[:50]}")

print("\n" + "="*100)
print("DATABASE SETUP COMPLETE!")
print("="*100)
print("\nYou can now login with these credentials:")
print("  Admin:    admin@example.com / Admin@K123")
print("  Doctor:   dr_john@example.com / DrJohnSmith@K123")
print("  Nurse:    nurse_jane@example.com / NurseJane@K123")
print("  Pharmacist: pharmacist@example.com / Pharmacist@K123")
print("  Lab Tech: labtech@example.com / LabTech@K123")
print("  Patient:  patient_mark@example.com / PatientMark@K123")
print("\n")
