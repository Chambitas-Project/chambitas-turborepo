FROM python:3.11-alpine

WORKDIR /app

RUN apk add --no-cache gcc musl-dev postgresql-dev python3-dev

COPY apps/ml-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/ml-engine/ .

EXPOSE 8000
CMD ["python", "main.py"]
