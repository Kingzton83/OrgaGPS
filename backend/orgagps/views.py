from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import subprocess

@csrf_exempt
def github_webhook(request):
    if request.method == "POST":
        try:
            # Repositories aktualisieren
            backend_repo_dir = "/app/backend/"  # Pfad zum Backend-Repo
            frontend_repo_dir = "/app/frontend/"  # Pfad zum Frontend-Repo

            # Git-Pull für Backend
            backend_git_pull = subprocess.run(
                ["git", "-C", backend_repo_dir, "pull"],
                check=True,
                capture_output=True,
                text=True
            )

            # Git-Pull für Frontend
            frontend_git_pull = subprocess.run(
                ["git", "-C", frontend_repo_dir, "pull"],
                check=True,
                capture_output=True,
                text=True
            )

            # Docker-Compose-Befehle ausführen
            docker_down = subprocess.run(
                ["docker-compose", "-f", "/app/backend/docker-compose.yml", "down"],
                check=True,
                capture_output=True,
                text=True
            )

            docker_up = subprocess.run(
                ["docker-compose", "-f", "/app/backend/docker-compose.yml", "up", "-d", "--build"],
                check=True,
                capture_output=True,
                text=True
            )

            # Rückmeldung mit Logs
            return JsonResponse({
                "message": "Git pull and Docker restart executed successfully!",
                "backend_git_pull": backend_git_pull.stdout,
                "frontend_git_pull": frontend_git_pull.stdout,
                "docker_down": docker_down.stdout,
                "docker_up": docker_up.stdout
            }, status=200)

        except subprocess.CalledProcessError as e:
            # Fehler bei Subprocess-Befehlen
            return JsonResponse({
                "error": f"Command '{e.cmd}' returned non-zero exit status {e.returncode}.",
                "stdout": e.stdout,
                "stderr": e.stderr
            }, status=500)
        except Exception as e:
            # Allgemeine Fehler
            return JsonResponse({"error": str(e)}, status=500)

    # Rückmeldung für ungültige Methoden
    return JsonResponse({"error": "Invalid method"}, status=400)
