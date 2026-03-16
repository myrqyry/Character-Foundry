import json
import os
import base64
import torch
import soundfile as sf
import io
import tempfile
from qwen_tts import Qwen3TTSModel

# Global model variable for potential reuse in persistent environments
_model = None


def get_model():
    global _model
    if _model is None:
        model_id = os.getenv("QWEN_TTS_MODEL_ID", "Qwen/Qwen3-TTS-12Hz-0.6B-Base")
        # Use 0.6B by default for lower memory usage in serverless/small environments
        # Use CPU if CUDA is not available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32

        _model = Qwen3TTSModel.from_pretrained(
            model_id,
            device_map=device,
            dtype=dtype,
        )
    return _model


def handler(event, context):
    try:
        data = json.loads(event.get("body") or "{}")
        text = data.get("text")
        ref_audio_b64 = data.get("ref_audio")  # Base64 string
        ref_text = data.get("ref_text")
        language = data.get("language", "English")

        if not text or not ref_audio_b64 or not ref_text:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                "body": json.dumps(
                    {"error": "text, ref_audio (base64), and ref_text are required"}
                ),
            }

        # Decode reference audio
        audio_bytes = base64.b64decode(ref_audio_b64.split(",")[-1])

        # Load audio into memory
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as tmp:
            tmp.write(audio_bytes)
            tmp.flush()

            model = get_model()

            # Generate cloned voice
            wavs, sr = model.generate_voice_clone(
                text=text,
                language=language,
                ref_audio=tmp.name,
                ref_text=ref_text,
            )

        # Convert output to base64
        out_buf = io.BytesIO()
        sf.write(out_buf, wavs[0], sr, format="WAV")
        out_b64 = base64.b64encode(out_buf.getvalue()).decode("utf-8")

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"audioContent": out_b64, "mimeType": "audio/wav"}),
        }

    except Exception as e:
        import traceback

        print(traceback.format_exc())
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            "body": json.dumps({"error": str(e)}),
        }
