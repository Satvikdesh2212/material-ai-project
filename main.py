from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    text: str

STRICT_REPLY = "I am a specialized Materials Science assistant. I can only answer questions related to materials science."

SYSTEM_PROMPT = """
You are MaterialAI, an expert-level Materials Science research assistant.

STRICT DOMAIN RULES:
- You ONLY answer questions related to materials science.
- Allowed topics include:
  crystal structures (FCC, BCC, HCP),
  phase diagrams,
  thermodynamics of materials,
  mechanical properties,
  polymers,
  ceramics,
  semiconductors,
  nanomaterials,
  metallurgy,
  diffusion,
  band theory,
  microstructure,
  defects in solids,
  grain boundaries,
  stress-strain behavior.

- If the question is NOT about materials science,
  respond ONLY with:
  "I am a specialized Materials Science assistant. I can only answer questions related to materials science."

ANSWER STYLE RULES:
- Be clear and scientific.
- Use structured format when possible:
    Definition
    Key Properties
    Applications
- Avoid unnecessary storytelling.
- Keep responses educational and technical.
"""

@app.post("/chat")
async def chat(message: Message):

    user_text = message.text.strip()

    full_prompt = f"""{SYSTEM_PROMPT}

User Question:
{user_text}

Answer:"""

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3",
            "prompt": full_prompt,
            "stream": False,
            "temperature": 0.2,
            "top_p": 0.9
        }
    )

    result = response.json()
    answer = result.get("response", "")

    # Extra safety: if model still drifts off-topic
    if "materials science" not in answer.lower() and len(answer) < 20:
        return {"reply": STRICT_REPLY}

    return {"reply": answer.strip()}