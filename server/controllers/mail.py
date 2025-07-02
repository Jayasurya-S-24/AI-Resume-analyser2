from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from flask_cors import CORS

app = Flask(__name__)

# Allow only your frontend origin
CORS(app, origins=["http://localhost:5173"])

# Mail configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'techpro03dharun@gmail.com'
app.config['MAIL_PASSWORD'] = 'qbxgegjaaviwhtgs'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)

@app.route('/send-mail', methods=['POST'])
def send_mail():
    data = request.json
    try:
        msg = Message(
            subject="Job Opportunity at TechNova Solutions",
            sender='iam.dharunkumarsh@gmail.com',
            recipients=[data['email']],
            body=f"""Hello {data['name']},

You're a great match for the position of {data['role']}.

Skills: {', '.join(data['skills'])}

Regards,
TechNova HR"""
        )
        mail.send(msg)
        return jsonify({'success': True}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
