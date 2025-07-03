from dotenv import dotenv_values
from flask import Flask, request, jsonify
from flask_cors import CORS
import pdfplumber
import psycopg2
import io
import re
import json
import requests

# Load environment variables
config = dotenv_values(".env")
DATABASE_URL = config["DATABASE_URL"]
GROK_API_URL = config["GROK_API_URL"]
GROK_API_KEY = config["GROK_API_KEY"]

# Flask setup
app = Flask(__name__)
CORS(app)

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

COMMON_SKILLS = [
    # Programming Languages
    "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust", "typescript",
    "scala", "perl", "r", "matlab", "bash", "powershell", "vba", "objective-c", "dart", "assembly", "fortran",

    # Web Development
    "html", "css","html5","css3", "react", "angular", "vue", "node.js", "express", "django", "flask", "bootstrap", "jquery",
    "sass", "less", "webpack", "gatsby", "next.js", "nuxt.js", "tailwind", "graphql", "rest api", "soap",

    # Database
    "sql", "mysql", "mongodb", "postgresql", "oracle", "nosql", "redis", "elasticsearch", "firebase",
    "dynamodb", "cassandra", "mariadb", "sqlite", "neo4j", "couchdb", "ms sql server",

    # DevOps & Cloud
    "docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "git", "ci/cd", "terraform", "ansible",
    "linux", "unix", "github", "bitbucket", "gitlab", "circleci", "travis ci", "heroku", "nginx", "apache",

    # AI/ML
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn", "nlp", "computer vision",
    "data science", "pandas", "numpy", "keras", "opencv", "data mining", "neural networks", "ai",

    # Mobile Development
    "android", "ios", "react native", "flutter", "xamarin", "ionic", "swift ui", "kotlin multiplatform",

    # Tools & Software
    "microsoft office", "excel", "powerpoint", "word", "outlook", "jira", "confluence", "trello",
    "slack", "photoshop", "illustrator", "figma", "sketch", "adobe xd", "tableau", "power bi",

    # Soft Skills
    "leadership", "communication", "teamwork", "problem solving", "critical thinking", "time management",
    "project management", "agile", "scrum", "kanban", "lean", "six sigma", "customer service"
]
# 📌 Extract skills from PDF
@app.route('/extract_skills', methods=['POST'])
def extract_skills():
    if 'pdf_file' not in request.files:
        return jsonify({"error": "PDF file is required", "success": False}), 400

    pdf_file = request.files['pdf_file']
    pdf_name = pdf_file.filename

    if not pdf_name.lower().endswith('.pdf'):
        return jsonify({"error": "Invalid file type. Only PDF allowed.", "success": False}), 400

    try:
        # Read PDF bytes
        pdf_bytes = pdf_file.read()

        # Extract text with pdfplumber
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        text_lower = text.lower()

        # Match common skills in text
        matched_skills = [
            skill for skill in COMMON_SKILLS
            if re.search(rf'\b{re.escape(skill.lower())}\b', text_lower)
        ]

        # Convert matched skills to JSON
        skills_json = {
            "matched_common_skills": matched_skills
        }

        # Store into Neon database
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO extracted_skills (pdf_name, skills_list)
            VALUES (%s, %s)
            ON CONFLICT (pdf_name)
            DO UPDATE SET skills_list = EXCLUDED.skills_list;
        """, (pdf_name, json.dumps(skills_json)))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "pdf_name": pdf_name,
            "extracted_skills": skills_json
        })

    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return jsonify({"error": f"Failed to process PDF: {str(e)}", "success": False}), 500
    
#mock
@app.route('/mock_grok', methods=['POST'])
def mock_grok():
    data = request.get_json()
    skills = data.get('skills', {}).get('matched_common_skills', [])
    position = data.get('position')

    # Simulate matching: pick skills arbitrarily for demo
    matched_skills = [skill for skill in skills if skill in [
        "python", "django", "sql", "aws", "react", "docker"
    ]]

    return jsonify({
        "matched_skills": matched_skills,
        "position": position,
        "note": "This is a mock Grok response."
    })

# 📌 Analyze skills via Grok API for a given job position
@app.route('/analyze_skills', methods=['POST'])
def analyze_skills():
    data = request.get_json()
    pdf_name = data.get('pdf_name')
    position = data.get('position')

    if not pdf_name or not position:
        return jsonify({"error": "PDF name and job position required", "success": False}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT skills_list FROM extracted_skills WHERE pdf_name = %s", (pdf_name,))
        result = cur.fetchone()

        if not result:
            return jsonify({"error": "No extracted skills found for this PDF", "success": False}), 404

        skills_list = result[0]

        # Send skills to Grok API
        headers = {
            'Authorization': f'Bearer {GROK_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            "skills": skills_list,
            "position": position
        }
        grok_response = requests.post(GROK_API_URL, headers=headers, json=payload)

        if grok_response.status_code != 200:
            return jsonify({"error": "Failed to connect to Grok API", "success": False}), 502

        grok_data = grok_response.json()

        # Calculate matching percentage (based on matched count)
        matched_skills = grok_data.get("matched_skills", [])
        total_skills = len(skills_list)
        match_percentage = (len(matched_skills) / total_skills) * 100 if total_skills else 0

        # Decide recommendation
        if match_percentage >= 70:
            recommendation = "Highly Recommended"
        elif match_percentage >= 40:
            recommendation = "Recommended"
        else:
            recommendation = "Not Recommended"

        # Save analysis result
        cur.execute(
            "INSERT INTO analyzed_skills (pdf_name, position, matching_percentage, grok_result, recommendation) VALUES (%s, %s, %s, %s, %s)",
            (pdf_name, position, match_percentage, json.dumps(grok_data), recommendation)
        )
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "pdf_name": pdf_name,
            "position": position,
            "matching_percentage": match_percentage,
            "grok_analysis": grok_data,
            "recommendation": recommendation
        })

    except Exception as e:
        print(f"Error analyzing skills: {str(e)}")
        return jsonify({"error": f"Failed to analyze skills: {str(e)}", "success": False}), 500

if __name__ == '__main__':
    print("Starting server on port 5000...")
    app.run(host='0.0.0.0', port=5000)
