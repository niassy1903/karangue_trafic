import serial
import time
from picamera2 import Picamera2
import cv2
import pytesseract
import requests

# Initialisation de la caméra
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration({"format": 'RGB888', "size": (640, 480)}))
picam2.start()

# Chargement du classificateur Haar pour la détection des plaques d'immatriculation
plate_cascade = cv2.CascadeClassifier('/home/niassy/haarcascades/haarcascade_russian_plate_number.xml')

# Configuration de Tesseract OCR
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

# URL du serveur Node.js
node_server_url = "http://192.168.1.42:3001/receive-plate"

#node_server_url = "https://karangue-anpr-api.onrender.com/receive-plate"


# Connexion au port série de l'Arduino (ajuste le port selon ton installation)
arduino = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)
time.sleep(2)  # Attendre la stabilisation de la connexion série

def lire_vitesse_arduino():
    """Lit la vitesse envoyée par l'Arduino via le port série."""
    try:
        if arduino.in_waiting > 0:
            ligne = arduino.readline().decode('utf-8').strip()
            if "Vitesse" in ligne:
                return float(ligne.split(":")[1].split()[0])  # Extraction de la valeur numérique
    except Exception as e:
        print(f"Erreur de lecture série : {e}")
    return None

try:
    while True:
        # Capture de l'image depuis la caméra
        frame = picam2.capture_array()
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)

        # Détection des plaques d'immatriculation
        plates = plate_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=4)

        for (x, y, w, h) in plates:
            # Dessiner un rectangle autour de la plaque détectée
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)

            # Extraire et prétraiter l'image de la plaque
            plate_region = frame[y:y + h, x:x + w]
            _, plate_region_bin = cv2.threshold(plate_region, 150, 255, cv2.THRESH_BINARY)
            plate_region_bin = cv2.GaussianBlur(plate_region_bin, (5, 5), 0)

            # Reconnaissance OCR
            plate_text = pytesseract.image_to_string(plate_region_bin, config='--psm 6').strip()
            plate_text = ''.join(e for e in plate_text if e.isalnum())

            if plate_text:
                print(f"Plaque détectée : {plate_text}")

                # Lire la vitesse actuelle de l'Arduino
                vitesse = lire_vitesse_arduino()
                if vitesse is not None:
                    print(f"Vitesse détectée : {vitesse} m/s")

                    # Envoi des informations au serveur Node.js
                    data = {"plate": plate_text, "speed": vitesse}
                    try:
                        response = requests.post(node_server_url, json=data)
                        if response.status_code == 200:
                            print("Données envoyées avec succès au serveur.")
                        else:
                            print(f"Erreur lors de l'envoi des données : {response.status_code}")
                    except requests.exceptions.RequestException as e:
                        print(f"Erreur de connexion au serveur : {e}")

        # Affichage de l'image avec la détection
        cv2.imshow("Camera", frame)

        # Quitter si la touche 'q' est pressée
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
finally:
    picam2.stop()
    cv2.destroyAllWindows()
    arduino.close()
