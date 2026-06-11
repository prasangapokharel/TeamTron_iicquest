import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI

api_key = os.getenv("GPT_API_KEY")
if not api_key:
    raise RuntimeError("GPT_API_KEY not set in .env")

client = OpenAI(api_key=api_key)

jsonl_path = os.path.join(os.path.dirname(__file__), "viva.jsonl")

print("Uploading training file...")
training_file = client.files.create(
    file=open(jsonl_path, "rb"),
    purpose="fine-tune"
)
print(f"File uploaded: {training_file.id}")

print("Starting fine-tune job...")
job = client.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-4o-mini",
    suffix="vivad",
)

print(f"Fine-tune job started!")
print(f"Job ID:    {job.id}")
print(f"Model:     {job.model}")
print(f"Status:    {job.status}")
print(f"Created:   {job.created_at}")
print()
print("Monitor status:")
print(f"  python -c \"from openai import OpenAI; import os; from dotenv import load_dotenv; load_dotenv(); c=OpenAI(api_key=os.getenv('GPT_API_KEY')); j=c.fine_tuning.jobs.retrieve('{job.id}'); print(j.status, j.fine_tuned_model)\"")
