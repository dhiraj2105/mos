from flask import Flask, jsonify, request, abort
from sentence_transformers import SentenceTransformer
from pathlib import Path

app = Flask(__name__)

CACHE_DIR = Path(__file__).parent / "models"

# Load model on startup
print("Loading embedding model...")

model = SentenceTransformer("all-MiniLM-L6-v2",
                            cache_folder=str(CACHE_DIR))

print("Embedding model loaded.")


@app.route("/embed", methods=["POST"])
def embed():
    payload = request.get_json(silent=True)

    if (
        not payload
        or not isinstance(payload.get("text"), str)
        or not payload["text"].strip()
    ):
        abort(400, description="text is required")

    emb = model.encode(
        payload["text"],
        convert_to_numpy=True,
    )

    return jsonify({
        "embedding": emb.tolist(),
    })

@app.route("/health", methods=["GET"])
def health():
    return {"status": "healthy"}, 200

if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000)