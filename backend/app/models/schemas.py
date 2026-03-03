from pydantic import BaseModel, Field
from typing import Optional, Literal


class AnalyzeRequest(BaseModel):
    dilemma: str = Field(..., min_length=20, max_length=2000,
                         description="The decision or dilemma to analyze")
    age: Optional[str] = Field(None, description="User age, e.g. '34'")
    risk_profile: Optional[Literal["conservative", "moderate", "aggressive", "contrarian"]] = "moderate"
    time_horizon: Optional[Literal["short-term", "medium-term", "long-term"]] = "medium-term"
    context: Optional[str] = Field(None, description="Optional parsed context from uploaded docs")
    api_key: Optional[str] = Field(None, description="Optional custom Gemini API key for this request")
    language: Optional[str] = Field("english", description="Response language: english, hindi, or telugu")

    model_config = {
        "json_schema_extra": {
            "example": {
                "dilemma": "Should I quit my $180k engineering job to go full-time on my legal tech startup?",
                "age": "34",
                "risk_profile": "aggressive",
                "time_horizon": "long-term",
                "api_key": ""
            }
        }
    }


class FollowUpRequest(BaseModel):
    dilemma: str = Field(..., min_length=10, max_length=2000)
    context_summary: str = Field(..., max_length=5000)
    question: str = Field(..., min_length=5, max_length=1000)
    api_key: Optional[str] = Field(None, description="Optional custom Gemini API key for this request")


class AnalyzeResponse(BaseModel):
    success: bool = True
    data: dict


class FollowUpResponse(BaseModel):
    success: bool = True
    answer: str


