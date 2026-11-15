from cryptography.fernet import Fernet
import secrets

print("Copie os valores abaixo para o arquivo .env (não os publique):\n")
print("ADMIN_API_KEY=" + secrets.token_urlsafe(32))
print("DEVICE_API_KEY=" + secrets.token_urlsafe(32))
print("LIVENESS_DEVICE_KEY=" + secrets.token_urlsafe(32))
print("SESSION_SECRET=" + secrets.token_urlsafe(48))
print("FERNET_KEY=" + Fernet.generate_key().decode("ascii"))
