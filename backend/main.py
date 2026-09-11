import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client
from fastapi.middleware.cors import CORSMiddleware
from datetime import date

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    title: str
    completed: bool = False
    priority: str = "medium"
    due_date: date | None = None

class TaskUpdate(BaseModel):
    title: str
    priority: str
    due_date: date | None = None

@app.get("/")
def home():
    return {"message": "Tideflow API is running!"}


@app.get("/tasks")
def get_tasks():
    response = supabase.table("tasks").select("*").execute()
    return response.data

@app.post("/tasks")
def create_task(task: Task):
    response = (
        supabase
        .table("tasks")
        .insert({
            "title": task.title,
            "completed": task.completed,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
        })
        .execute()
    )

    return response.data


@app.patch("/task/{task_id}")
def update_task(task_id: str, completed: bool):
    response = (
        supabase
        .table("tasks")
        .update({"completed": completed})
        .eq("id", task_id)
        .execute()
    )

    return response.data

@app.patch("/task/{task_id}/edit")
def edit_task(task_id: str, task: TaskUpdate):
    response = (
        supabase
        .table("tasks")
        .update({
            "title": task.title,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
        })
        .eq("id", task_id)
        .execute()
    )
    return response.data


@app.patch("/task/{task_id}/note")
def update_note(task_id: str, note: str):
    response = (
        supabase
        .table("tasks")
        .update({"note": note})
        .eq("id", task_id)
        .execute()
    )

    return response.data


@app.delete("/task/{task_id}")
def delete_task(task_id: str):
    response = (
        supabase
        .table("tasks")
        .delete()
        .eq("id", task_id)
        .execute()
    )

    return response.data

