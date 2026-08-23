from typing import List, Optional, TypedDict

from models.schemas import (
    BottleneckReport,
    GeneratedCodeFiles,
    MigrationReport,
    Opportunity,
    TestResult,
    WorkflowBlueprint,
)


class AdaptFlowState(TypedDict, total=False):
    workflow_description: str
    workflow_logs: Optional[List[str]]
    job_id: Optional[str]

    bottleneck_report: Optional[BottleneckReport]
    opportunities: Optional[List[Opportunity]]
    blueprint: Optional[WorkflowBlueprint]
    generated_code: Optional[GeneratedCodeFiles]
    test_results: Optional[TestResult]
    migration_report: Optional[MigrationReport]

    retry_count: int
    max_retries: int
    current_stage: str
    errors: List[str]
    status: str
