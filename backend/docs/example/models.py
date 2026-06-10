from pydantic import BaseModel
# Data model
class User(BaseModel):
    name: str
    email: str
    age: int
