from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Standard Django-Einstellungen für Celery
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'orgagps.settings')

app = Celery('orgagps')

# Konfiguriere den Broker und das Ergebnis-Backend direkt aus den Django-Einstellungen
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automatisch Aufgaben aus tasks.py Dateien laden
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
