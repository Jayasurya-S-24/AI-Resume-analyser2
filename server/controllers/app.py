from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
import io
import re

app = Flask(__name__)
CORS(app, origins="http://localhost:5173")

# Commonly recognized technical skills
COMMON_SKILLS = [
    # Languages
    "python", "java", "javascript", "c++", "c#", "ruby", "php", "swift", "kotlin", "go", "rust", "typescript",
    "r", "matlab", "bash", "powershell", "vba", "objective-c", "dart",

    # Web & Frameworks
    "html", "css", "react", "angular", "vue", "node.js", "express", "django", "flask", "bootstrap",
    "tailwind", "graphql", "rest api", "next.js", "jquery",

    # Databases
    "sql", "mysql", "mongodb", "postgresql", "firebase", "oracle", "redis", "sqlite", "cassandra",

    # Cloud & DevOps
    "docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "git", "ci/cd", "terraform", "linux",

    # Data & AI
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "nlp", "machine learning",
    "deep learning", "data science", "power bi", "tableau",

    # Mobile
    "flutter", "react native", "android", "ios", "xamarin",

    # Tools
    "vscode", "visual studio code", "cursor", "github",

    # PM/Design
    "jira", "figma", "scrum", "agile"
]

@app.route('/extract_skills', methods=['POST'])
def extract_skills_from_pdf():
    if 'pdf_file' not in request.files:
        return jsonify({"success": False, "error": "No PDF file uploaded."}), 400

    pdf_file = request.files['pdf_file']

    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({"success": False, "error": "Only PDF files are allowed."}), 400

    try:
        reader = PdfReader(io.BytesIO(pdf_file.read()))
        text = " ".join(page.extract_text() or "" for page in reader.pages)

        if not text.strip():
            return jsonify({"success": False, "error": "No text content found in the PDF."}), 400

        text_lower = text.lower()

        # Match only known, valid skills from resume text
        found_skills = set()
        for skill in COMMON_SKILLS:
            if re.search(rf'\b{re.escape(skill)}\b', text_lower):
                found_skills.add(skill)

        return jsonify({
            "success": True,
            "extracted_skills": sorted(found_skills),
            "text_length": len(text)
        })

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to extract skills: {str(e)}"}), 500

if __name__ == '__main__':
    print("Starting Flask server on port 5000...")
    app.run(host='0.0.0.0', port=5000)
