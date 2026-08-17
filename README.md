<img width="1919" height="927" alt="Screenshot 2026-08-17 232100" src="https://github.com/user-attachments/assets/10edb52d-7c89-4dd9-931b-f477e61307f2" />
# 🤖 AI Knowledge Assistant

> **Enterprise RAG Platform — Turn Your Documents Into Accurate Knowledge**

AI Knowledge Assistant is a full-stack **Retrieval-Augmented Generation (RAG)** platform that allows users to upload private documents and interact with them through an intelligent AI chatbot.

The system processes documents, converts their content into searchable vector representations, retrieves the most relevant information using **ChromaDB**, and generates context-aware answers using an LLM. Responses can be grounded in the uploaded documents with source references.

<img width="1919" height="927" alt="Screenshot 2026-08-17 232100" src="https://github.com/user-attachments/assets/94012fbb-1215-4c8f-b54b-00db1f060e10" />


---

## 🚀 Project Overview

Traditional AI chatbots may generate answers without knowing the user's private documents.

**AI Knowledge Assistant solves this problem using RAG.**

Instead of asking the AI to answer only from its general knowledge, the system:

1. Accepts user documents.
2. Extracts and processes the document content.
3. Splits the content into smaller chunks.
4. Generates embeddings for those chunks.
5. Stores the embeddings in a vector database.
6. Searches for the most relevant information when a user asks a question.
7. Sends the retrieved context to the LLM.
8. Generates a grounded response.
9. Displays relevant document/source references.

This makes the chatbot more useful for **document-based question answering and enterprise knowledge management**.

---

## 🎯 Problem Statement

Organizations often have large amounts of information stored in PDFs and other documents.

Searching these documents manually can be:

* Time-consuming
* Difficult to scale
* Inefficient
* Prone to missing relevant information

The goal of this project is to create an AI-powered knowledge assistant that allows users to **ask questions in natural language and retrieve relevant information from their own documents.**

---

## ✨ Key Features

### 📄 Document-Based AI

Upload documents and use them as the knowledge source for AI responses.

### 🧠 Retrieval-Augmented Generation

The system retrieves relevant document content before generating an answer.

### 🔎 Semantic Search

Documents are converted into vector embeddings and searched semantically rather than relying only on keyword matching.

### 🗃️ ChromaDB Vector Store

ChromaDB is used to store and retrieve document embeddings efficiently.

### 💬 AI Chat Interface

Users can interact with the knowledge assistant through a modern conversational interface.

### 📚 Source-Grounded Responses

Responses can include the document and page/source information used to generate the answer.

### 🔐 Authentication

The application includes user authentication and protected application areas.

### 📴 Offline/PWA Support

The frontend includes Progressive Web App functionality and offline-related support.

### 🌐 Modern Responsive UI

Built with a modern responsive interface for desktop and mobile users.

### 🦙 Local LLM Support

The project supports local LLM workflows through **Ollama**, reducing dependency on external AI APIs when configured.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │       User           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js Frontend   │
                    │ React + TypeScript   │
                    └──────────┬───────────┘
                               │
                               │ API Request
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    │      Python          │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐       ┌──────────────────┐
       │ Document Service │       │   Chat / RAG     │
       └────────┬─────────┘       └────────┬─────────┘
                │                          │
                ▼                          ▼
       ┌──────────────────┐       ┌──────────────────┐
       │ Text Extraction  │       │ Semantic Search  │
       │ & Chunking       │       └────────┬─────────┘
       └────────┬─────────┘                │
                │                          ▼
                ▼                 ┌──────────────────┐
       ┌──────────────────┐       │    ChromaDB      │
       │    Embeddings    │──────▶│  Vector Store    │
       └──────────────────┘       └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Relevant Context │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │   LLM / Ollama   │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │ Grounded Answer  │
                                  └────────┬─────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │   User Response  │
                                  └──────────────────┘
```

---

# 🔄 RAG Processing Pipeline

The core workflow of the project is:

```text
Document Upload
      │
      ▼
Document Validation
      │
      ▼
Text Extraction
      │
      ▼
Text Cleaning
      │
      ▼
Document Chunking
      │
      ▼
Embedding Generation
      │
      ▼
ChromaDB Vector Store
      │
      ▼
User Question
      │
      ▼
Query Embedding
      │
      ▼
Similarity Search
      │
      ▼
Relevant Document Chunks
      │
      ▼
Context + User Query
      │
      ▼
LLM / Ollama
      │
      ▼
Grounded AI Response
      │
      ▼
Source Citation
```

---

# 🧠 How RAG Works in This Project

## 1. Document Upload

The user uploads a document through the frontend.

```text
User → Frontend → FastAPI Backend
```

---

## 2. Document Processing

The backend processes the uploaded document and extracts its useful textual content.

The extracted content is cleaned and prepared for indexing.

---

## 3. Chunking

Large documents are divided into smaller chunks.

For example:

```text
Large Document
      ↓
Chunk 1
Chunk 2
Chunk 3
Chunk 4
...
```

Chunking makes semantic retrieval more efficient.

---

## 4. Embedding Generation

Each chunk is converted into a numerical vector representation called an **embedding**.

```text
Document Chunk
      ↓
Embedding Model
      ↓
Vector Representation
```

---

## 5. Vector Storage

The generated embeddings are stored in **ChromaDB**.

```text
Chunk + Embedding
        ↓
     ChromaDB
```

---

## 6. User Query

The user asks a natural-language question.

Example:

> "Summarize the financial highlights from Q3."

---

## 7. Semantic Retrieval

The question is converted into an embedding and compared with stored document vectors.

The system retrieves the most relevant chunks.

---

## 8. Context-Aware Generation

The retrieved information is provided to the LLM along with the user's question.

```text
User Question
      +
Relevant Context
      ↓
     LLM
      ↓
Grounded Answer
```

---

## 9. Source References

The application can show the document/source information used to support the answer.

This improves transparency and helps users verify the generated response.

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Progressive Web App (PWA)

## Backend

* Python
* FastAPI
* REST APIs

## AI / RAG

* Retrieval-Augmented Generation
* LLM Integration
* Embeddings
* ChromaDB
* Ollama Local LLM Support

## Authentication

* Clerk Authentication

## Database

* SQLite / SQL-based database support
* ChromaDB Vector Store

## Development & Deployment

* Git
* GitHub
* Docker
* Docker Compose
* npm
* Python

---

# 📁 Project Structure

```text
ai-knowledge-assistant/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   ├── documents.py
│   │   │   ├── health.py
│   │   │   ├── notifications.py
│   │   │   └── profile.py
│   │   │
│   │   ├── auth/
│   │   │   ├── clerk.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── database/
│   │   │   ├── base.py
│   │   │   ├── init_db.py
│   │   │   └── session.py
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── rag/
│   │   ├── services/
│   │   │   ├── document_service.py
│   │   │   ├── embedding_service.py
│   │   │   ├── llm_service.py
│   │   │   ├── rag_service.py
│   │   │   └── user_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── run_server.py
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── offline/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── landing/
│   │   └── shared/
│   │
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
│
├── docker-compose.yml
├── package.json
├── Pipfile
└── README.md
```

---

# ⚙️ Installation

## Prerequisites

Make sure the following are installed:

* Python 3.x
* Node.js
* npm
* Git
* Docker (optional)
* Ollama (optional, for local LLM usage)

---

# 🔧 Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
DATABASE_URL=your_database_url
CLERK_SECRET_KEY=your_clerk_secret
LLM_API_KEY=your_llm_api_key
```

**Never commit real API keys or secrets to GitHub.**

Use the provided:

```text
backend/.env.example
```

as a reference.

---

# ▶️ Run Backend

From the backend directory:

```bash
python run_server.py
```

Or, depending on the project configuration:

```bash
uvicorn app.main:app --reload
```

The FastAPI backend will then be available locally.

---

# 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The Next.js application will start in development mode.

---

# 🦙 Optional: Ollama

For local LLM support, install Ollama and configure the required model.

Example workflow:

```bash
ollama pull <model-name>
```

Then configure the backend to use the local Ollama endpoint.

---

# 🐳 Docker

The project also includes:

```text
docker-compose.yml
```

Docker can be used to simplify running the application's services together.

Start the services with:

```bash
docker compose up --build
```

Stop the services:

```bash
docker compose down
```

---

# 🔌 API Overview

The backend provides API endpoints for major application functionality, including:

```text
/api/chat
/api/documents
/api/health
/api/notifications
/api/profile
```

The exact request and response structures can be found inside the corresponding files under:

```text
backend/app/api/
```

---

# 🔒 Security

The project is designed with security considerations including:

* Authentication
* Protected API routes
* Environment-based secret management
* No API keys stored directly in source code
* `.env` exclusion through `.gitignore`
* User-specific application access

---

# 📊 Example Workflow

```text
1. User signs in
        ↓
2. User uploads a document
        ↓
3. Backend processes document
        ↓
4. Text is extracted
        ↓
5. Text is divided into chunks
        ↓
6. Embeddings are generated
        ↓
7. Embeddings stored in ChromaDB
        ↓
8. User asks a question
        ↓
9. Relevant chunks retrieved
        ↓
10. LLM generates grounded response
        ↓
11. Source information displayed
```

---

# 💡 Example Use Cases

### 🏢 Enterprise Knowledge

Employees can ask questions about internal documents.

### 📚 Education

Students can upload study materials and ask questions about them.

### 📑 Research

Researchers can interact with large collections of documents.

### ⚖️ Policy & Documentation

Organizations can search and understand internal policies.

### 💼 Business Reports

Users can query financial, operational, and business documents.

---

# 🚀 Future Improvements

* Multi-document conversational reasoning
* Advanced document citation
* Improved vector search
* Hybrid keyword + semantic search
* More LLM providers
* Advanced analytics dashboard
* Role-based access control
* Cloud deployment
* Scalable vector database
* Document version management
* Multi-language support
* Streaming AI responses
* Advanced evaluation and RAG quality metrics

---

# 📸 Project Preview

The application provides a modern enterprise-style interface focused on document-grounded AI conversations.


<img width="1919" height="927" alt="Screenshot 2026-08-17 232100" src="https://github.com/user-attachments/assets/ac1a4b83-4bd6-47e7-8dd8-1a40b61df7b2" />


---

# 👨‍💻 Author

**Subhadip Bera**

B.Tech — Computer Science & Engineering
Specialization: Data Science

---

# ⭐ Project

If you find this project useful, consider giving the repository a ⭐ on GitHub.

**AI Knowledge Assistant — Enterprise RAG Platform**

Built with modern AI, RAG, vector search, FastAPI, Next.js, and TypeScript.
