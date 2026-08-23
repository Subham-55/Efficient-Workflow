from models.schemas import GeneratedCodeFiles, TestResult


def execute(files: GeneratedCodeFiles, timeout: int = 30) -> TestResult:
    return TestResult(
        passed=True,
        issues=[],
        execution_log=f"Sandbox execution placeholder for {len(files.files)} files",
    )
