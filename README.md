# TutorTech

## To run application:
- Install dependencies: `npm install`
- Ensure PostgreSQL connection for local use: `pg_ctl -D "C:\Program Files\PostgreSQL\17\data" start`
- Start Flask server: `python app.py`
- Start React frontend: `npm start`

## To start Qdrant (Using Docker):
- Make sure docker is running
- start the container: docker run -p 6333:6333 -v C:<path to>\qdrant_data:/qdrant/storage qdrant/qdrant
