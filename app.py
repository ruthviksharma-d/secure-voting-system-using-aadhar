import os
import json
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__, static_folder='static')
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_for_voting_app")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configuration
VOTERS_DB_FILE = 'voters_database.json'
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wsq', 'jpg', 'jpeg', 'png'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_voters_database():
    """Load voters database from JSON file"""
    try:
        with open(VOTERS_DB_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.warning(f"{VOTERS_DB_FILE} not found. Creating empty database.")
        return []
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON in {VOTERS_DB_FILE}")
        return []

def save_voters_database(voters_data):
    """Save voters database to JSON file"""
    try:
        with open(VOTERS_DB_FILE, 'w') as f:
            json.dump(voters_data, f, indent=2)
        return True
    except Exception as e:
        logging.error(f"Error saving voters database: {e}")
        return False

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def find_voter_by_fingerprint(filename, voters_data):
    """Find voter by fingerprint filename"""
    for voter in voters_data:
        if voter.get('fingerprint_file') == filename:
            return voter
    return None

@app.route('/')
def index():
    """Serve the main voting page"""
    return send_from_directory('static', 'index.html')

@app.route('/identify_voter', methods=['POST'])
def identify_voter():
    """Identify voter by fingerprint upload"""
    try:
        # Check if file is in the request
        if 'fingerprint' not in request.files:
            return jsonify({
                'success': False, 
                'message': 'No fingerprint file provided. Please upload a fingerprint file (.wsq, .jpg, .jpeg, or .png) to identify yourself.'
            })
        
        file = request.files['fingerprint']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({
                'success': False, 
                'message': 'No file selected. Please choose a fingerprint file (.wsq, .jpg, .jpeg, or .png).'
            })
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                'success': False, 
                'message': 'Invalid file type. Please upload a fingerprint file (.wsq, .jpg, .jpeg, or .png only).'
            })
        
        # Load voters database
        voters_data = load_voters_database()
        
        if not voters_data:
            return jsonify({
                'success': False, 
                'message': 'Voter database is empty or corrupted. Please contact administrator.'
            })
        
        # Find voter by fingerprint filename
        voter = find_voter_by_fingerprint(file.filename, voters_data)
        
        if not voter:
            return jsonify({
                'success': False, 
                'message': 'Fingerprint not recognized. You are not registered to vote or the fingerprint file name does not match our records.'
            })
        
        # Check if voter has already voted
        if voter.get('voted', False):
            return jsonify({
                'success': False, 
                'message': f'You have already cast your vote on {voter.get("vote_timestamp", "unknown date")}. Multiple votes are not allowed.'
            })
        
        # Voter identified successfully
        return jsonify({
            'success': True, 
            'message': f'Identity verified successfully. You can now cast your vote.',
            'voter_id': voter.get('aadhar'),
            'voter_name': voter.get('name', 'Registered Voter')
        })
    
    except Exception as e:
        logging.error(f"Error in identify_voter: {e}")
        return jsonify({
            'success': False, 
            'message': 'An error occurred during voter identification. Please try again.'
        })

@app.route('/cast_vote', methods=['POST'])
def cast_vote():
    """Cast vote for identified voter"""
    try:
        # Get vote data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False, 
                'message': 'No vote data received. Please try again.'
            })
        
        voter_id = data.get('voter_id')
        candidate = data.get('candidate')
        
        # Validate required fields
        if not voter_id or not candidate:
            return jsonify({
                'success': False, 
                'message': 'Missing voter ID or candidate selection. Please identify yourself first and select a candidate.'
            })
        
        # Load voters database
        voters_data = load_voters_database()
        
        # Find voter by Aadhar number
        voter = None
        for v in voters_data:
            if v.get('aadhar') == voter_id:
                voter = v
                break
        
        if not voter:
            return jsonify({
                'success': False, 
                'message': 'Voter not found. Please identify yourself first.'
            })
        
        # Check if voter has already voted (double-check)
        if voter.get('voted', False):
            return jsonify({
                'success': False, 
                'message': 'You have already cast your vote. Multiple votes are not allowed.'
            })
        
        # Validate candidate selection
        valid_candidates = ['Candidate A', 'Candidate B', 'Candidate C', 'NOTA']
        if candidate not in valid_candidates:
            return jsonify({
                'success': False, 
                'message': 'Invalid candidate selection. Please select a valid option.'
            })
        
        # Cast the vote
        voter['voted'] = True
        voter['vote_candidate'] = candidate
        voter['vote_timestamp'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Save updated database
        if save_voters_database(voters_data):
            logging.info(f"Vote cast successfully by voter {voter_id} for {candidate}")
            return jsonify({
                'success': True, 
                'message': f'Your vote for {candidate} has been cast successfully! Thank you for participating in the election.'
            })
        else:
            return jsonify({
                'success': False, 
                'message': 'Error saving vote. Please contact administrator.'
            })
    
    except Exception as e:
        logging.error(f"Error in cast_vote: {e}")
        return jsonify({
            'success': False, 
            'message': 'An error occurred while casting your vote. Please try again.'
        })

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)

@app.route('/script.js')
def serve_script():
    """Serve script.js directly"""
    return send_from_directory('static', 'script.js', mimetype='application/javascript')

@app.route('/style.css')
def serve_style():
    """Serve style.css directly"""
    return send_from_directory('static', 'style.css', mimetype='text/css')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
