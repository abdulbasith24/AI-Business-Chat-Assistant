# AI Business Assistant - Project Context Ledger

This document serves as the project ledger, tracking architectural decisions, current system state, directory layouts, and historical progress. It is updated at the conclusion of every development phase.

---

## 1. Project Summary
**AI Business Assistant** is a portfolio-quality, production-ready single-company AI chatbot. It is designed to be embedded on a target company's website to ground conversations securely using a custom Retrieval-Augmented Generation (RAG) knowledge base. 

---

## 2. Current Development Phase
* **Active Status**: Phase 9 Completed successfully.
* **Next Up**: Phase 10: Testing, Production Build, and Deployment.

---

## 3. Technology Stack & Specifications
* **Frontend**: Next.js 15+ (App Router, Turbopack compiler), React 19, TypeScript, Tailwind CSS.
* **Backend**: Next.js Serverless Route Handlers.
* **Database**: PostgreSQL (Hosted on Neon serverless cloud) with `pgvector` enabled.
* **ORM & Connection**: Prisma ORM v7.8.0 utilizing `@prisma/adapter-pg` driver adapters.
* **Validation**: Zod (Consistent Client and API validation).
* **Forms**: React Hook Form with Zod Resolvers.

---

## 4. Completed Milestones

### Phase 1: Project Setup & Database Architecture (Completed)
* Installed Next.js, Tailwind CSS, TypeScript, and Prisma ORM.
* Built the Prisma schema supporting models for `Company`, `Document`, `DocumentChunk`, `FAQ`, and `ChatMessage`.
* Integrated PostgreSQL's native `vector` (pgvector) column type through Prisma's `Unsupported("vector(768)")` representation.
* Successfully generated migration history and completed active schema sync with the Neon cloud serverless host.

### Phase 2: Company Information Module (Completed)
* Implemented the connection-resilient database client singleton matching Prisma 7 driver parameters (`src/lib/db.ts`).
* Wrote client-backend unified validation rules using Zod (`src/lib/validation.ts`).
* Configured backend API handler `GET` and `PATCH` endpoints supporting database upsert logic (`src/app/api/admin/company/route.ts`).
* Built the responsive Admin Layout wrapper with unified Sidebar navigation (`src/app/admin/layout.tsx`).
* Developed the Company Settings form client interface managing state, validation notifications, and network persistence (`src/app/admin/page.tsx`).

### Phase 3: Knowledge Base Upload (Completed)
* Programmed secure multi-part form-data file parser handlers (`POST /api/admin/documents`).
* Configured robust filename sanitization to mitigate path-traversal attacks.
* Developed persistent local filesystem storage helpers writing to safe disk directories.
* Integrated dynamic resource deletion handlers cleaning up filesystem assets and issuing cascade database queries (`DELETE /api/admin/documents/[id]`).
* Structured the UI Inventory panel featuring live uploading, load animations, feedback alerts, and verification delete-triggers (`src/app/admin/knowledge/page.tsx`).

### Phase 4: Knowledge Processing (Completed)
* Integrated modern, type-safe Google GenAI client SDK (`src/lib/gemini.ts`).
* Developed native, unbundled ESM-CJS dynamic bridge imports using Node's `createRequire` engine.
* Engineered a sliding-window chunking utility resolving semantic sentence-cut truncation (`src/lib/rag.ts`).
* Configured the `gemini-embedding-001` model to compress vector output dimensionality to exactly 768 dimensions using Matryoshka Representation Learning.
* Programmed SQL vector-casting injections via raw `$executeRawUnsafe` parameters (`POST /api/admin/documents`).

### Phase 5: Vector Search & Retrieval (Completed)
* Engineered PostgreSQL Cosine Similarity vector queries utilizing the `<=>` distance operator.
* Implemented a strict `0.50` (50%) similarity threshold to prevent hallucinations during retrieval.
* Built the backend search API route resolving query matching arrays (`POST /api/admin/test-search`).
* Developed the interactive RAG Simulator dashboard visualizer presenting matching source titles, precise similarity scores, and raw block content (`src/app/admin/test-chat/page.tsx`).

### Phase 6: Gemini Integration (Completed)
* Integrated the grounded reasoning model `gemini-2.5-flash`.
* Configured the system instruction prompts to force strict factual grounding constraints.
* Established rigid out-of-scope triggers to block irrelevant queries and return consistent company-focused refusal messages.
* Updated the RAG Simulator dashboard to render final synthesized AI responses alongside matching source documents and similarity scores.

### Phase 7: Public Chat Interface (Completed)
* Programmed the unified public streaming API endpoint routing (`POST /api/chat`).
* Built a standard Web `ReadableStream` pipeline to stream Gemini's content chunks directly to the browser.
* Overwrote the default Next.js landing template at `src/app/page.tsx` with a clean, fully-typed chat client.
* Added interactive suggested question chips, automatic chat bubble scrolling, and live streaming message parsers.

### Phase 8: FAQ System (Completed)
* Engineered an in-memory normalized string-comparison matcher bypassing API overheads (`src/lib/faq.ts`).
* Integrated the FAQ interceptor into the beginning of the public streaming thread API (`POST /api/chat`).
* Programmed REST API endpoints handling full CRUD actions on FAQs (`src/app/api/admin/faqs/route.ts` & `/faqs/[id]/route.ts`).
* Developed the administrative FAQ Manager grid and creation modules (`src/app/admin/faqs/page.tsx`).

### Phase 9: Unified Admin Dashboard (Completed)
* Developed the parallel-compiled metrics API endpoint returning active stats arrays (`GET /api/admin/stats`).
* Relocated the Company Settings view path cleanly to `/admin/company`.
* Configured real-time database handshake indicators monitoring active cloud database pools.
* Redesigned the root `/admin` panel to serve as a visual dashboard display compiling general stats, knowledge inventory counts, vector database status, and quick-action directories.

---

## 5. Current File Structure
The files currently written and actively in use:

ai-business-assistant/
├── prisma/
│   ├── schema.prisma             # Core models schema (unsupported pgvector configurations)
│   └── migrations/               # Database SQL migration history files
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root HTML head/body wrapper
│   │   ├── globals.css           # Tailwind variables and global theme styles
│   │   ├── page.tsx              # Overwritten: Main public chat page client UI (streaming & chips)
│   │   │
│   │   ├── admin/                # Unified Administration Portal
│   │   │   ├── layout.tsx        # Persistent dashboard navigation sidebar layout
│   │   │   ├── page.tsx          # Dashboard overview landing panel (system metrics & database status)
│   │   │   ├── company/
│   │   │   │   └── page.tsx      # Relocated: Company settings form UI (react-hook-form + zod)
│   │   │   ├── knowledge/
│   │   │   │   └── page.tsx      # Knowledge base document upload form and list inventory UI
│   │   │   ├── faqs/
│   │   │   │   └── page.tsx      # FAQ list table and instant FAQ registration form UI
│   │   │   └── test-chat/
│   │   │       └── page.tsx      # RAG simulator testing dashboard (AI Answer, chunks, match scores)
│   │   │
│   │   └── api/                  # Backend REST API server endpoints
│   │       ├── chat/
│   │       │   └── route.ts      # Public chatbot message handler (FAQ interceptor, RAG, Gemini stream)
│   │       └── admin/
│   │           ├── company/
│   │           │   └── route.ts  # GET/PATCH endpoints for managing general company settings
│   │           ├── documents/
│   │           │   ├── route.ts  # GET all documents / POST upload, parse, chunk, and embed documents
│   │           │   └── [id]/
│   │           │       └── route.ts # DELETE document from disk and db (cascade purges chunks)
│   │           ├── faqs/
│   │           │   ├── route.ts  # GET all FAQs / POST create instant FAQ
│   │           │   └── [id]/
│   │           │       └── route.ts # DELETE FAQ from database
│   │           ├── stats/
│   │           │   └── route.ts  # GET dynamic totals counters and database health indicators
│   │           └── test-search/
│   │               └── route.ts  # POST developer testing vector search and AI answer generation
│   │
│   ├── lib/                      # Shared modular system utilities and engines
│   │   ├── db.ts                 # Prisma client singleton initializer with PG Adapter pooling
│   │   ├── gemini.ts             # Google GenAI client and grounded answer generator
│   │   ├── rag.ts                # PDF-parsing, sliding chunking, and similarity query executors
│   │   ├── validation.ts         # Centralized Zod verification schemas
│   │   └── faq.ts                # In-memory normalized string-matching FAQ interceptor
│   │
│   └── types/
│
├── uploads/                      # Local filesystem directory for securely stored file assets
├── .env                          # Local database connection & API key configurations (GIT IGNORED)
├── CONTEXT.md                    # This Project Context Ledger
├── next.config.ts / next.config.js # Excludes native server packages (pdf-parse) from compiler bundling
├── package.json                  # Dynamic Node development and production dependencies
├── prisma.config.ts              # Prisma 7 unified database connection registry
└── tsconfig.json                 # TypeScript strict compilation parameters