from fastapi import APIRouter, BackgroundTasks, HTTPException, WebSocket, WebSocketDisconnect

from api.models.api_schemas import DecisionRequest, DecisionResponse, SessionCreateRequest, SessionResponse
from api.session_store import session_store
from graph.build_graph import build_graph
from graph.state import AdaptFlowState
from api.job_store import job_store

router = APIRouter(prefix='/sessions', tags=['sessions'])

_compiled_graph = build_graph()


def _run_session_graph(session_id: str, workflow_description: str) -> None:
    try:
        initial_state: AdaptFlowState = {
            'workflow_description': workflow_description,
            'workflow_logs': [],
            'retry_count': 0,
            'max_retries': 3,
            'current_stage': 'supervisor',
            'errors': [],
            'status': 'in_progress',
        }
        job_store.push_progress(session_id, 'supervisor', 'Starting workflow analysis', 5)
        result_state = _compiled_graph(initial_state)
        job_store.push_progress(session_id, 'complete', 'Workflow analysis completed', 100)
        job_store.update(
            session_id,
            status=result_state.get('status', 'complete'),
            current_stage=result_state.get('current_stage', 'complete'),
            workflow_logs=result_state.get('workflow_logs', []),
            bottleneck_report=result_state.get('bottleneck_report'),
            opportunities=result_state.get('opportunities'),
            blueprint=result_state.get('blueprint'),
            generated_code=result_state.get('generated_code'),
            test_results=result_state.get('test_results'),
            migration_report=result_state.get('migration_report'),
            errors=result_state.get('errors', []),
        )
        record = session_store.get(session_id)
        if record:
            session_store._store[session_id].sync_from_job(
                job_store.get(session_id).state,
                progress_percent=job_store.get(session_id).state.get('progress_percent'),
            )
    except Exception as exc:
        job_store.update(session_id, status='failed', errors=[str(exc)])
        job_store.push_progress(session_id, 'error', str(exc), 0)


@router.post('', response_model=SessionResponse)
def create_session(request: SessionCreateRequest, background_tasks: BackgroundTasks) -> SessionResponse:
    session = session_store.create(request)
    job_store.create(session.sessionId, {
        'workflow_description': request.content,
        'workflow_logs': [],
        'retry_count': 0,
        'max_retries': 3,
        'current_stage': 'queued',
        'errors': [],
        'status': 'in_progress',
    })
    background_tasks.add_task(_run_session_graph, session.sessionId, request.content)
    return session


@router.get('/{session_id}', response_model=SessionResponse)
def get_session(session_id: str) -> SessionResponse:
    response = session_store.get(session_id)
    if response is None:
        raise HTTPException(status_code=404, detail='Session not found')
    return response


@router.post('/{session_id}/decision', response_model=DecisionResponse)
def apply_decision(session_id: str, request: DecisionRequest) -> DecisionResponse:
    response = session_store.apply_decision(session_id, request)
    if response is None:
        raise HTTPException(status_code=404, detail='Session not found')
    return response


@router.websocket('/{session_id}/stream')
async def stream_session(websocket: WebSocket, session_id: str):
    await websocket.accept()
    try:
        record = session_store.get(session_id)
        if record is None:
            await websocket.send_json({'type': 'error', 'payload': {'stage': 'unknown', 'message': 'Session not found'}})
            await websocket.close()
            return

        job = job_store.get(session_id)
        if not job:
            await websocket.send_json({'type': 'error', 'payload': {'stage': 'unknown', 'message': 'Job not found'}})
            await websocket.close()
            return

        import asyncio
        last_stage = None
        while True:
            job = job_store.get(session_id)
            if not job:
                break
            current_stage = job.state.get('current_stage', 'unknown')
            logs = job.state.get('workflow_logs', [])
            message = logs[-1] if logs else f'Stage: {current_stage}'
            percent = job.state.get('progress_percent', 0)
            status = job.state.get('status', 'in_progress')

            if current_stage != last_stage and current_stage not in ('queued', 'complete', 'error'):
                await websocket.send_json({'type': 'stage_started', 'payload': {'stage': current_stage}})
                last_stage = current_stage

            if status == 'in_progress':
                await websocket.send_json({
                    'type': 'stage_progress',
                    'payload': {'stage': current_stage, 'message': message, 'percent': percent},
                })
            elif status == 'complete':
                await websocket.send_json({'type': 'stage_completed', 'payload': {'stage': current_stage, 'data': {}}})
                break
            elif status == 'failed':
                await websocket.send_json({'type': 'error', 'payload': {'stage': current_stage, 'message': message}})
                break

            await asyncio.sleep(1)
    except WebSocketDisconnect:
        pass
    finally:
        await websocket.close()
