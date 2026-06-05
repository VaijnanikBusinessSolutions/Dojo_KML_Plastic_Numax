from django.apps import AppConfig

class App1Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'app1'

    def ready(self):
        import app1.signals  # Safe to import here, signals will work
    def ready(self):
        print("🚀 App1 ready() called")
        import app1.signals
