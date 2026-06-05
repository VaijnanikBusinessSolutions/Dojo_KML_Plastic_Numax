import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Dojo2_0.settings')

app = Celery('Dojo2_0')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


