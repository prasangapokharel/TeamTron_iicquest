import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from dotenv import load_dotenv
load_dotenv()

from together import Together

job_id = sys.argv[1] if len(sys.argv) > 1 else None
if not job_id:
    print("Usage: python status.py <job_id>")
    sys.exit(1)

client = Together(api_key=os.getenv("TOGETHER_API_KEY"))
job = client.fine_tuning.retrieve(job_id)

print(f"Job ID:       {job.id}")
print(f"Status:       {job.status}")
print(f"Model:        {job.model_output_name}")
print(f"Events:       {len(job.events) if job.events else 0} events")
if job.events:
    for e in job.events[-5:]:
        print(f"  [{e.type}] {e.message}")
