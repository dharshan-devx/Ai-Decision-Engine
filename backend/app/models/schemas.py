from pydantic import BaseModel, Field
from typing import Optional, Literal


class AnalyzeRequest(BaseModel):
    dilemma: str = Field(..., min_length=20, max_length=2000,
                         description="The decision or dilemma to analyze")
    age: Optional[str] = Field(None, description="User age, e.g. '34'")
    risk_profile: Optional[Literal["conservative", "moderate", "aggressive", "contrarian"]] = "moderate"
    time_horizon: Optional[Literal["short-term", "medium-term", "long-term"]] = "medium-term"

    model_config = {
        "json_schema_extra": {
            "example": {
                "dilemma": "Should I quit my $180k engineering job to go full-time on my legal tech startup?",
                "age": "34",
                "risk_profile": "aggressive",
                "time_horizon": "long-term"
            }
        }
    }


class AnalyzeResponse(BaseModel):
    success: bool = True
    data: dict
