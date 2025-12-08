"""Test token generation and validation"""
from app.auth import create_access_token, decode_access_token

# Create a token for user ID 1 (admin)
token = create_access_token(data={"sub": 1})
print(f"Generated token: {token}\n")

# Decode it
payload = decode_access_token(token)
print(f"Decoded payload: {payload}")
print(f"User ID from payload: {payload.get('sub')}")
print(f"Type of user ID: {type(payload.get('sub'))}")

