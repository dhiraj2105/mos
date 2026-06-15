from flask import Flask, jsonify, request, abort
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

# Load model on startup
model = SentenceTransformer("all-MiniLM-L6-v2")


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


if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)