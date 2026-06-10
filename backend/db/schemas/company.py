from pydantic import BaseModel, EmailStr
from uuid import UUID
from db.models.company import CompanyStatus


class CompanyCreate(BaseModel):
    company_name: str
    email: EmailStr
    logo: str | None = None
    status: CompanyStatus = CompanyStatus.active


class CompanyResponse(CompanyCreate):
    id: UUID
    model_config = {"from_attributes": True}
