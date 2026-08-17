#!/usr/bin/env python
"""Run the FastAPI server"""
import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(__file__))

import uvicorn
from app.main import app

if __name__ == "__main__":
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False, app_dir=backend_dir)
