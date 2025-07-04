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
GEMINI_API_KEY = config["GEMINI_API_KEY"]

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

# Flask setup
app = Flask(__name__)
CORS(app)

# Database connection function
def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

# Common skills list
COMMON_SKILLS = [
    # Programming Languages
    "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust", "typescript",
    "scala", "perl", "r", "matlab", "bash", "powershell", "vba", "objective-c", "dart", "assembly", "fortran",
    # Web Development
    "html", "css", "html5", "css3", "react", "angular", "vue", "node.js", "express", "django", "flask",
    "bootstrap", "jquery", "sass", "less", "webpack", "gatsby", "next.js", "nuxt.js", "tailwind", "graphql",
    "rest api", "soap",
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
        pdf_bytes = pdf_file.read()
        text = ""
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        text_lower = text.lower()

        matched_skills = [
            skill for skill in COMMON_SKILLS
            if re.search(rf'\b{re.escape(skill.lower())}\b', text_lower)
        ]

        skills_json = {
            "matched_common_skills": matched_skills
        }

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

# 📌 Analyze skills via Gemini API for a given job position
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

        prompt_text = (
            f"Given the following extracted skills from a candidate's resume: {skills_list}, "
            f"and the job position being applied for is: '{position}', "
            "please do the following:\n"
            "- Calculate the matching percentage based on relevance.\n"
            "- Identify the job position suitability (like 'Highly Suitable', 'Moderately Suitable', 'Low Suitable').\n"
            "- Provide a brief analysis paragraph.\n"
            "- Provide a final recommendation as 'High', 'Moderate', or 'Low'.\n\n"
            "Return the response as JSON in the following format:\n"
            "{\n"
            "  'matching_percentage': <number>,\n"
            "  'position_suitability': '<string>',\n"
            "  'gemini_analysis': '<string>',\n"
            "  'recommendation': '<High/Moderate/Low>'\n"
            "}"
        )

        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt_text}]
                }
            ]
        }

        headers = {'Content-Type': 'application/json'}

        response = requests.post(GEMINI_API_URL, headers=headers, json=payload)

        if response.status_code != 200:
            return jsonify({"error": "Failed to connect to Gemini API", "success": False}), 502

        gemini_result_raw = response.json()

        gemini_text = gemini_result_raw['candidates'][0]['content']['parts'][0]['text']

        try:
            gemini_data = json.loads(gemini_text)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON response format from Gemini", "success": False}), 500

        match_percentage = gemini_data.get("matching_percentage", 0)
        recommendation = gemini_data.get("recommendation", "Moderate")

        cur.execute("""
            INSERT INTO analyzed_skills (pdf_name, position, matching_percentage, gemini_result, recommendation)
            VALUES (%s, %s, %s, %s, %s)
        """, (pdf_name, position, match_percentage, json.dumps(gemini_data), recommendation))

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            "success": True,
            "pdf_name": pdf_name,
            "position": position,
            "matching_percentage": match_percentage,
            "gemini_analysis": gemini_data,
            "recommendation": recommendation
        })

    except Exception as e:
        print(f"Error analyzing skills: {str(e)}")
        return jsonify({"error": f"Failed to analyze skills: {str(e)}", "success": False}), 500

if __name__ == '__main__':
    print("Starting server on port 5000...")
    app.run(host='0.0.0.0', port=5000)
