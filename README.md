# Secure Fingerprint-Authenticated Voting System

A simple, secure web-based voting system that authenticates voters using fingerprint file verification and prevents duplicate votes by tracking vote status. Designed as a project or prototype to demonstrate authentication, server-side verification, and single-vote enforcement.

---

## Features
- Fingerprint-based voter authentication (file-match or hashed-match).
- Single-vote enforcement—voters cannot vote more than once.
- Minimal JSON-based voter store for quick prototyping.
- Simple frontend flow: upload fingerprint → verify → cast vote.
- Server-side enforcement of all security-critical logic.

---

## Quick Demo
Upload your fingerprint, the server verifies it against stored voter records and—if valid and unused—allows you to cast a single vote.

---

## Project Structure
```plaintext
secure-voting/
├─ frontend/
│  ├─ index.html
│  └─ app.js
├─ backend/
│  ├─ app.py # Python server
│  ├─ requirements.txt
│  └─ voters.json
└─ README.md
```
---

## voters.json (example)
```json
[
  {
    "name": "John Doe",
    "aadhar": "123456789012",
    "fingerprintFile": "john_doe_fp.png",
    "fingerprintHash": "sha256-abc123...", 
    "voted": false
  },
  {
    "name": "Jane Doe",
    "aadhar": "987654321098",
    "fingerprintFile": "jane_doe_fp.png",
    "fingerprintHash": "sha256-def456...",
    "voted": true
  }
]
```
---

## Installation & Run (Flask example)

**1. Clone the repository**

**2. Create a virtual environment and install dependencies**

**3. Run the server**

---
## Security Recommendations

- Do not rely on filename alone—filenames can be changed by anyone. Instead, hash the uploaded fingerprint file and compare it to a stored fingerprint.
- Use a database (SQLite, PostgreSQL, or MongoDB) instead of a flat JSON file to avoid corruption and race conditions.
- Always perform checks server-side. Never trust client-side logic for authentication or vote-locking.
- Use HTTPS to protect fingerprint uploads and data in transit.
- Use secure sessions or signed tokens between the verification and voting steps to prevent replay attacks.
- Sanitize and validate inputs (aadhar, filenames, candidate choices).
---

## Limitations
- Prototype-level: This is useful for learning, but not production-ready.
- Fingerprint filename matching is insecure by itself.
- JSON file persistence is fragile under concurrent writes

---

## How to Test Locally
- Pre-populate voters.json with a test user.
- Use the frontend to upload the matching fingerprint file.
- Verify you can vote once.
- Try voting again to confirm the duplicate-vote block.

---

## Contributing
- Pull requests are welcome. Suggested improvements:
- Replace JSON with a proper database.
- Add fingerprint hashing or proper biometric validation.
- Add unit tests and end-to-end tests for the vote flow.
- Improve frontend UX and accessibility.
