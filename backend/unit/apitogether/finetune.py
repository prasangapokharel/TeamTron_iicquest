import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from together import Together

api_key = os.getenv("TOGETHER_API_KEY")
if not api_key:
    raise RuntimeError("TOGETHER_API_KEY not set in .env")

client = Together(api_key=api_key)

jsonl_path = os.path.join(os.path.dirname(__file__), "viva.jsonl")

# Step 1: Upload dataset
print("Uploading training file...")
file_resp = client.files.upload(file=jsonl_path)
file_id = file_resp.id
print(f"File uploaded: {file_id}")

# Step 2: Create fine-tune job
# Model: Qwen/Qwen3-8B — fast, latest Qwen3, LoRA, 40k context, ideal for assistant
print("Starting fine-tune job...")
job = client.fine_tuning.create(
    training_file=file_id,
    model="Qwen/Qwen3-8B",
    lora=True,
    suffix="Vivad",
)

print()
print("Fine-tune job started!")
print(f"Job ID:        {job.id}")
print(f"Base model:    {job.model_output_name or 'Qwen/Qwen3-8B'}")
print(f"Status:        {job.status}")
print(f"Training file: {file_id}")
print()
print("Check status:")
print(f"  python unit/apitogether/status.py {job.id}")
