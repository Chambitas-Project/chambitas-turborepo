FROM python:3.11-slim

WORKDIR /app

# Actualizar pip
RUN pip install --no-cache-dir --upgrade pip

COPY apps/ml-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/ml-engine/ .

EXPOSE 8000
CMD ["python", "main.py"]
