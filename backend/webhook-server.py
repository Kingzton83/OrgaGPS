from flask import Flask, request
import subprocess

app = Flask(__name__)

@app.route('/github-webhook', methods=['POST'])
def github_webhook():
    if request.method == 'POST':
        try:
            # Führe das Deployment-Skript aus
            subprocess.run(["/bin/bash", "/app/backend/webhook-script.sh"], check=True)
            return "Webhook executed successfully", 200
        except subprocess.CalledProcessError as e:
            return f"Webhook execution failed: {e}", 500
    return "Method not allowed", 405

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
