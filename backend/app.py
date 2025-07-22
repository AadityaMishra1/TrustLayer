#!/usr/bin/env python3
"""
AI Trust Layer - Using llama-cpp-python
Clean version for Mac M3
"""

import os
import sys
import multiprocessing
from pathlib import Path
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
from llama_cpp import Llama
from flask import Response
import time

# Model configuration - Using same model as your teammates
MODEL_PATH = "./models/Meta-Llama-3-8B-Instruct.Q6_K.gguf"
MODEL_URL = "https://huggingface.co/bartowski/Meta-Llama-3-8B-Instruct-GGUF/resolve/main/Meta-Llama-3-8B-Instruct-Q6_K.gguf"

def download_model_if_needed():
    """Download model if not present"""
    model_file = Path(MODEL_PATH)
    
    if model_file.is_file():
        file_size = model_file.stat().st_size
        if file_size > 1000000:  # Check if file is bigger than 1MB (not an error page)
            print(f"✅ Model already exists: {MODEL_PATH} ({file_size // (1024*1024)}MB)")
            return True
        else:
            print(f"⚠️ Model file seems corrupted (only {file_size} bytes), re-downloading...")
            model_file.unlink()  # Delete corrupted file
    
    print(f"📥 Downloading Meta-Llama-3-8B model (~6GB)...")
    print(f"URL: {MODEL_URL}")
    print("This may take 10-15 minutes depending on your internet speed...")
    
    try:
        import urllib.request
        
        # Create models directory
        os.makedirs("./models", exist_ok=True)
        
        # Download with progress
        def show_progress(block_num, block_size, total_size):
            downloaded = block_num * block_size
            if total_size > 0:
                percent = min(100, (downloaded * 100) // total_size)
                mb_downloaded = downloaded // (1024*1024)
                mb_total = total_size // (1024*1024)
                print(f"\rDownloading... {percent}% ({mb_downloaded}MB / {mb_total}MB)", end="")
            else:
                mb_downloaded = downloaded // (1024*1024)
                print(f"\rDownloading... {mb_downloaded}MB", end="")
        
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH, show_progress)
        print(f"\n✅ Model downloaded successfully!")
        
        # Verify download
        final_size = Path(MODEL_PATH).stat().st_size
        if final_size < 1000000:  # Less than 1MB indicates download failure
            print(f"❌ Download failed - file too small ({final_size} bytes)")
            return False
            
        return True
        
    except Exception as e:
        print(f"\n❌ Download failed: {e}")
        print("You can manually download from:")
        print(f"https://huggingface.co/bartowski/Meta-Llama-3-8B-Instruct-GGUF/tree/main")
        return False

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Download and load model
print("🔍 Checking for model...")
model_downloaded = download_model_if_needed()
model_file = Path(MODEL_PATH)

if not model_downloaded or not model_file.is_file():
    print(f"❌ Model not available at {MODEL_PATH}")
    llm = None
else:
    print(f"📦 Loading model from: {model_file}")
    try:
        llm = Llama(
            model_path=str(model_file),
            n_ctx=8192,  # Same context as your teammate's setup
            n_threads=multiprocessing.cpu_count(),
            n_batch=512,  # Same batch size as your teammate's setup
            use_mlock=True,
            use_mmap=True,
            verbose=False
        )
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        print("Common fixes:")
        print("1. Make sure you have enough RAM (8GB+ recommended)")
        print("2. Try installing latest llama-cpp-python: pip install --upgrade llama-cpp-python")
        print("3. Check if model file is corrupted")
        llm = None

class TrustLayer:
    """Enhanced trust layer that sanitizes AND acts as AI assistant"""
    
    def __init__(self, llama_model):
        self.llm = llama_model
        self.current_mappings = {}  # fake_name → real_name
    
    # Keep the original method for backward compatibility
    def replace_all_sensitive_info(self, text: str) -> dict:
        """Original method - kept for existing functionality"""
        result = self.sanitize_and_store_mappings(text)
        if result.get('success'):
            return {
                "original": result['original'],
                "final_result": result['sanitized'],
                "passes": result['passes'],
                "success": True
            }
        return result
    
    def sanitize_and_store_mappings(self, text: str) -> dict:
        """Sanitize text and store mapping for demasking"""
        if not self.llm:
            return {"error": "Model not loaded"}
        
        # Reset mappings for new conversation
        self.current_mappings = {}
        
        current_text = text
        passes = []
        
        # Pass 1: Names (with mapping storage)
        current_text, pass1_result = self._replace_names_with_mapping(current_text)
        passes.append({"pass": 1, "type": "names", "result": pass1_result})
        
        # Pass 2: Companies  
        current_text, pass2_result = self._replace_companies_with_mapping(current_text)
        passes.append({"pass": 2, "type": "companies", "result": pass2_result})
        
        # Pass 3: Emails
        current_text, pass3_result = self._replace_emails_with_mapping(current_text)
        passes.append({"pass": 3, "type": "emails", "result": pass3_result})
        
        # Pass 4: Numbers
        current_text, pass4_result = self._replace_numbers(current_text)
        passes.append({"pass": 4, "type": "numbers", "result": pass4_result})
        
        return {
            "original": text,
            "sanitized": current_text,
            "passes": passes,
            "mappings": self.current_mappings.copy(),
            "success": True
        }
    
    def generate_ai_response(self, sanitized_text: str, task: str = "help") -> str:
        """Use the same Llama model as an AI assistant"""
        
        task_prompts = {
            "email": "You are a professional business assistant. Help draft a professional email based on this situation. Be helpful and businesslike.",
            "analyze": "You are a business analyst. Analyze this situation and provide insights and recommendations.",  
            "help": "You are a helpful business assistant. Provide practical advice and next steps for this situation.",
            "document": "You are a document specialist. Help create or improve documentation based on this context."
        }
        
        system_prompt = task_prompts.get(task, task_prompts["help"])
        
        messages = [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': f"Please help with this business situation: {sanitized_text}"}
        ]
        
        try:
            response = self.llm.create_chat_completion(
                messages=messages,
                max_tokens=400,
                temperature=0.7,
                stop=["<|im_end|>", "</s>", "<|user|>", "Human:", "User:"]
            )
            
            return response['choices'][0]['message']['content'].strip()
            
        except Exception as e:
            return f"Sorry, I couldn't generate a response. Error: {str(e)}"
    
    def demask_response(self, masked_response: str) -> dict:
        """Restore real names in the AI response"""
        demasked_response = masked_response
        changes_made = []
        
        # Replace fake names with real names
        for fake_name, real_name in self.current_mappings.items():
            if fake_name in demasked_response:
                demasked_response = demasked_response.replace(fake_name, real_name)
                changes_made.append(f"{fake_name} → {real_name}")
        
        return {
            "original_response": masked_response,
            "demasked_response": demasked_response,
            "changes_made": changes_made,
            "mappings_used": len(changes_made)
        }
    
    def _replace_names_with_mapping(self, text: str) -> tuple:
        """Replace names and store mapping for demasking"""
        
        # Use simple regex to find potential names (faster than LLM)
        import re
        
        # Find capitalized word patterns that could be names
        name_pattern = r'\b[A-Z][a-z]+ [A-Z][a-z]+\b'
        potential_names = re.findall(name_pattern, text)
        
        # Filter out common non-names
        common_non_names = {'New York', 'Los Angeles', 'San Francisco', 'United States', 'Goldman Sachs', 'Microsoft Corporation'}
        real_names = [name for name in potential_names if name not in common_non_names]
        
        # Generic replacement names
        fake_names = ["Sarah Chen", "Alex Johnson", "Emma Davis", "Ryan Wilson", "Lisa Miller", "Michael Brown"]
        
        current_text = text
        for i, real_name in enumerate(real_names[:len(fake_names)]):
            fake_name = fake_names[i]
            current_text = current_text.replace(real_name, fake_name)
            self.current_mappings[fake_name] = real_name
        
        print(f"🔄 Names replaced: {len(real_names)} found")
        return current_text, current_text
    
    def _replace_companies_with_mapping(self, text: str) -> tuple:
        """Replace companies and store mappings"""
        replacement_map = {
            "Goldman Sachs": "our financial services partner",
            "Microsoft": "the technology company", 
            "Google": "the tech giant",
            "Apple": "the technology company",
            "Meta": "the social media company",
            "Amazon": "the e-commerce company",
            "Kirkland & Ellis": "our law firm"
        }
        
        current_text = text
        for real_company, fake_company in replacement_map.items():
            if real_company in current_text:
                current_text = current_text.replace(real_company, fake_company)
                self.current_mappings[fake_company] = real_company
        
        print(f"🔄 Companies replaced")
        return current_text, current_text
    
    def _replace_emails_with_mapping(self, text: str) -> tuple:
        """Replace emails with generic ones"""
        import re
        
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        
        current_text = text
        generic_emails = ["contact@example.com", "info@example.com", "team@example.com"]
        
        for i, real_email in enumerate(emails):
            if i < len(generic_emails):
                fake_email = generic_emails[i]
                current_text = current_text.replace(real_email, fake_email)
                self.current_mappings[fake_email] = real_email
        
        print(f"🔄 Emails replaced: {len(emails)} found")
        return current_text, current_text
    
    def _replace_numbers(self, text: str) -> tuple:
        """Replace phone numbers"""
        import re
        
        phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
        current_text = re.sub(phone_pattern, '[PHONE REDACTED]', text)
        
        print(f"🔄 Phone numbers redacted")
        return current_text, current_text

# Initialize trust layer
trust_layer = TrustLayer(llm) if llm else None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process_text():
    if not trust_layer:
        return jsonify({'error': 'Model not loaded or failed to load'}), 500
    
    try:
        data = request.json
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        print(f"📝 Processing text: {text[:100]}...")
        
        result = trust_layer.replace_all_sensitive_info(text)
        
        if result.get('success'):
            return jsonify({
                'processed_text': result['final_result'],
                'passes': result['passes'],
                'original': result['original']
            })
        else:
            return jsonify({'error': result.get('error', 'Processing failed')}), 500
            
    except Exception as e:
        print(f"❌ Processing error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy' if llm else 'model_not_loaded',
        'model_loaded': llm is not None,
        'model_path': MODEL_PATH
    })

@app.route('/complete_flow', methods=['POST'])
def complete_flow():
    """Handle the complete sanitize → AI → demask flow"""
    if not trust_layer:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        original_text = data.get('text', '').strip()
        task_type = data.get('task', 'help')  # email, analyze, help, document
        
        if not original_text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Step 1: Sanitize and store mappings
        print("🔒 Step 1: Sanitizing...")
        sanitize_result = trust_layer.sanitize_and_store_mappings(original_text)
        
        if not sanitize_result.get('success'):
            return jsonify({'error': 'Sanitization failed'}), 500
        
        # Step 2: Generate AI response using sanitized text
        print("🤖 Step 2: Generating AI response...")
        ai_response = trust_layer.generate_ai_response(sanitize_result['sanitized'], task_type)
        
        # Step 3: Demask the response
        print("🔄 Step 3: Demasking response...")
        demask_result = trust_layer.demask_response(ai_response)
        
        return jsonify({
            'original_text': original_text,
            'sanitized_text': sanitize_result['sanitized'],
            'ai_response_masked': ai_response,
            'ai_response_demasked': demask_result['demasked_response'],
            'mappings': sanitize_result['mappings'],
            'changes_made': demask_result['changes_made'],
            'success': True
        })
        
    except Exception as e:
        print(f"❌ Complete flow error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/demo_scenarios')
def demo_scenarios():
    """Provide sample scenarios for testing"""
    return jsonify({
        'scenarios': {
            'hr_situation': {
                'text': "Our HR director Jessica Williams needs to meet with CEO Amanda Rodriguez about the layoffs. Contact Jessica at j.williams@techstart.com or call 555-987-6543. We need to discuss severance packages of $45K each for 12 employees.",
                'task': 'email',
                'description': 'Draft professional communication'
            },
            'financial_deal': {
                'text': "CFO Michael Chen from Goldman Sachs is reviewing our $2.5M acquisition proposal. His assistant Sarah Lopez (s.lopez@gs.com, 212-555-7890) will coordinate the due diligence process.",
                'task': 'analyze', 
                'description': 'Analyze business situation'
            },
            'project_management': {
                'text': "Project manager David Kim needs to update stakeholder Maria Gonzalez about the Q4 deliverables. The budget is $125K and we have 8 team members assigned. Contact David at d.kim@company.com.",
                'task': 'document',
                'description': 'Create project documentation'
            }
        }
    })

# Add this new endpoint after your existing routes
@app.route('/complete_flow_stream', methods=['POST'])
def complete_flow_stream():
    """Handle the complete flow with real-time progress updates"""
    if not trust_layer:
        return jsonify({'error': 'Model not loaded'}), 500
    
    def generate():
        try:
            data = request.json
            original_text = data.get('text', '').strip()
            task_type = data.get('task', 'help')
            
            if not original_text:
                yield f"data: {json.dumps({'error': 'No text provided'})}\n\n"
                return
            
            # Step 1: Start sanitization
            yield f"data: {json.dumps({'step': 'sanitizing', 'status': 'active'})}\n\n"
            
            sanitize_result = trust_layer.sanitize_and_store_mappings(original_text)
            
            if not sanitize_result.get('success'):
                yield f"data: {json.dumps({'error': 'Sanitization failed'})}\n\n"
                return
            
            # Step 1: Complete
            yield f"data: {json.dumps({'step': 'sanitizing', 'status': 'completed'})}\n\n"
            
            # Step 2: Start AI processing
            yield f"data: {json.dumps({'step': 'ai_processing', 'status': 'active'})}\n\n"
            
            ai_response = trust_layer.generate_ai_response(sanitize_result['sanitized'], task_type)
            
            # Step 2: Complete
            yield f"data: {json.dumps({'step': 'ai_processing', 'status': 'completed'})}\n\n"
            
            # Step 3: Start demasking
            yield f"data: {json.dumps({'step': 'demasking', 'status': 'active'})}\n\n"
            
            demask_result = trust_layer.demask_response(ai_response)
            
            # Step 3: Complete
            yield f"data: {json.dumps({'step': 'demasking', 'status': 'completed'})}\n\n"
            
            # Send final result
            final_result = {
                'type': 'final',
                'original_text': original_text,
                'sanitized_text': sanitize_result['sanitized'],
                'ai_response_masked': ai_response,
                'ai_response_demasked': demask_result['demasked_response'],
                'mappings': sanitize_result['mappings'],
                'changes_made': demask_result['changes_made'],
                'success': True
            }
            
            yield f"data: {json.dumps(final_result)}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🛡️ AI Trust Layer Starting...")
    print("="*50)
    print(f"Python version: {sys.version}")
    print(f"Current directory: {os.getcwd()}")
    print(f"Model path: {MODEL_PATH}")
    print(f"Model exists: {Path(MODEL_PATH).exists()}")
    if Path(MODEL_PATH).exists():
        print(f"Model size: {Path(MODEL_PATH).stat().st_size // (1024*1024)}MB")
    print(f"Model loaded: {'✅ Yes' if llm else '❌ No'}")
    print("Server starting on http://localhost:5000")
    print("="*50)
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        import traceback
        traceback.print_exc()