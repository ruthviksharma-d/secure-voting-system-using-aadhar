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

secure-voting/
├─ frontend/
│  ├─ index.html
│  └─ app.js
├─ backend/
│  ├─ app.py # Python server
│  ├─ requirements.txt
│  └─ voters.json
└─ README.md

---

## voters.json (example)
```json
[
  {
    "name": "John Doe",
    "aadhar": "123456789012",
    "fingerprintFile": "john_doe_fp.png",
    "fingerprintHash": "sha256-abc123...", // optional, more secure
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

---

## Installation & Run (Flask example)

**1. Clone the repository:**

```bash
git clone [https://github.com/yourusername/secure-voting.git](https://github.com/yourusername/secure-voting.git)
cd secure-voting/backend
