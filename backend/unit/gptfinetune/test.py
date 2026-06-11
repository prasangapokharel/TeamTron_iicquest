from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY")

training_file = client.files.create(
    file=open("training.jsonl", "rb"),
    purpose="fine-tune"
)

job = client.fine_tuning.jobs.create(
    training_file=training_file.id,
    model="gpt-4o-mini",
    suffix="vivad"
)

print(job.id)