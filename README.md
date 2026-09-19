 
# Hive Inspect Template Importer

A web application for importing Spectora HTML-text template exports into a structured, editable template system.

The goal of this project is to make it possible for an inspection company moving from Spectora to Hive Inspect to bring an existing inspection template across without manually recreating years of structured inspection content.

The application supports:

- Spectora `.xls` and `.xlsx` HTML-text exports
- Template hierarchy preservation
- Section, item, and comment extraction
- Original ordering preservation
- HTML comment content storage
- Import validation
- Import warnings
- Editable template names
- Editable section names
- Editable item names
- Editable comment text
- Persistent database storage
- Template duplication
- Independent editing of duplicated templates
- Failure handling for unsupported files and invalid spreadsheets
- Public deployment through Vercel
- PostgreSQL persistence

---

## 1. Project Overview

Inspectors often spend years tuning inspection templates. When they move from one inspection platform to another, manually recreating those templates is time-consuming and can result in lost content or structure.

This project focuses on one part of that migration workflow:

```text
Spectora Template
       |
       v
Spectora HTML-text Excel Export
       |
       v
Upload
       |
       v
Parse Excel
       |
       v
Detect Template Structure
       |
       v
Normalize Data
       |
       v
Validate Imported Data
       |
       v
PostgreSQL
       |
       v
Editable Template
       |
       +---- Edit
       |
       +---- Save
       |
       +---- Duplicate
````

The application does not attempt to recreate the entire inspection platform.

The focus is on:

1. Faithful template import
2. Structured editable data
3. Persistent storage
4. Safe editing
5. Independent template copies
6. Clear handling of unsupported or invalid input

---

# 2. Assignment Context

This project was built for the Hive Inspect Forward Deployed Engineer take-home assignment.

The assignment asks for a workflow that takes a Spectora HTML-text template export, imports it into a structured system, allows the inspector to edit it, save those edits, and duplicate templates independently.

The assignment emphasizes faithful import and preservation of customer content rather than building a complete inspection product.

The application therefore intentionally does not include:

* Inspection report generation
* Scheduling
* Payments
* Homeowner portals
* Mobile-specific workflows
* Full inspection management

These areas are outside the scope of the assignment.

---

# 3. Input Template

The application was tested with a real Spectora template export.

## Source

Template:

```text
InterNACHI Residential
```

Exported from:

```text
Spectora
```

Export type:

```text
Export to spreadsheet → Export HTML Text
```

Input file:

```text
InterNACHI Residential -2026-09-18.xls
```

The export is included in the repository under:

```text
data/
```

The Spectora HTML-text export was intentionally used instead of the plain-text export because the HTML-text format can contain HTML-based comment content and richer formatting information.

The assignment specifically asks for a real Spectora template export and requires the export used for testing to be committed to the repository.

---

# 4. Import Result

The real InterNACHI Residential export was successfully imported into the application.

The imported template contained:

```text
13 sections
69 items
309 comments
0 warnings
```

The imported structure can then be opened and edited through the application.

The application stores the imported hierarchy as:

```text
Template
   |
   +-- Section
          |
          +-- Item
                 |
                 +-- Comment
                 +-- Comment
```

---

# 5. Main Features

## 5.1 Spectora Template Import

Users can upload:

```text
.xls
.xlsx
```

Spectora HTML-text spreadsheet exports.

The importer:

1. Receives the uploaded file
2. Reads the workbook
3. Detects worksheets
4. Detects the header row
5. Normalizes headers
6. Reads rows
7. Detects section/item/comment structure
8. Normalizes the structure
9. Validates the result
10. Stores the template in PostgreSQL

---

## 5.2 Template Structure Preservation

The imported template is not stored as one large HTML blob.

Instead, the application creates structured records:

```text
templates
    |
    +-- sections
            |
            +-- items
                    |
                    +-- comments
```

This allows individual sections, items, and comments to be edited independently.

The original ordering is represented using a `position` field.

For example:

```text
Section 0
Section 1
Section 2

Item 0
Item 1
Item 2

Comment 0
Comment 1
Comment 2
```

This makes ordering explicit in the database.

---

# 6. Editing

After import, users can edit:

### Template name

Example:

```text
InterNACHI Residential -2026-09-18
```

can be changed to:

```text
My Residential Inspection Template
```

### Section names

Example:

```text
Exterior
```

can be changed to:

```text
Exterior Inspection
```

### Item names

Example:

```text
Garage Door
```

can be changed to another item name.

### Comment text

Comments can also be edited.

Changes are saved to PostgreSQL through the backend.

---

# 7. Template Duplication

A template can be duplicated.

For example:

```text
InterNACHI Residential -2026-09-18
```

can become:

```text
InterNACHI Residential -2026-09-18 Copy
```

The duplicate receives its own database records.

The hierarchy is copied:

```text
Original Template
    |
    +-- Sections
          |
          +-- Items
                |
                +-- Comments
```

into:

```text
Copied Template
    |
    +-- New Sections
          |
          +-- New Items
                |
                +-- New Comments
```

The original and duplicate do not share editable child records.

This allows the copied template to be changed independently.

For example:

```text
Original:
InterNACHI Residential -2026-09-18

Copy:
InterNACHI Residential -2026-09-18 Copy
```

If the copy is renamed or edited, the original remains unchanged.

---

# 8. Database

The application uses PostgreSQL for persistent storage.

Supabase PostgreSQL is used as the database provider.

The application connects to PostgreSQL using the `pg` Node.js package.

The database is not browser storage.

This means templates remain available after:

* Browser refresh
* Closing the browser
* Reopening the application
* Navigating away from the template

---

# 9. Database Schema

The main database tables are:

```text
templates
sections
items
comments
import_warnings
```

## Relationship

```text
templates
    |
    | 1-to-many
    v
sections
    |
    | 1-to-many
    v
items
    |
    | 1-to-many
    v
comments
```

---

## 9.1 templates

Stores the main template information.

Important fields:

```text
id
name
source
source_filename
created_at
updated_at
```

Example:

```text
name:
InterNACHI Residential -2026-09-18

source:
Spectora

source_filename:
InterNACHI Residential -2026-09-18.xls
```

---

## 9.2 sections

Stores template sections.

Important fields:

```text
id
template_id
name
position
created_at
updated_at
```

`template_id` connects the section to its parent template.

`position` preserves ordering.

---

## 9.3 items

Stores items inside sections.

Important fields:

```text
id
section_id
name
position
created_at
updated_at
```

`section_id` connects an item to its parent section.

---

## 9.4 comments

Stores comments associated with items.

Important fields:

```text
id
item_id
content_html
position
created_at
updated_at
```

The comment is stored separately from the item.

HTML is allowed inside individual comment fields.

For example:

```html
<p>Automatic garage door opener operated using normal controls.</p>
```

The database stores the HTML content instead of treating the complete template as one HTML document.

---

## 9.5 import_warnings

Stores import warnings and unsupported content notices.

Important fields:

```text
id
template_id
severity
message
source_location
original_content
created_at
```

Severity can be:

```text
info
warning
error
```

When applicable, the original content is retained with the warning so that content is not silently discarded.

---

# 10. Database Initialization

The database schema is located at:

```text
supabase/migrations/001_initial_schema.sql
```

Run the SQL migration against the PostgreSQL database.

The migration creates:

```text
templates
sections
items
comments
import_warnings
```

It also creates indexes for foreign keys and ordering.

Foreign key relationships use cascading deletes so that removing a parent template removes its associated sections, items, comments, and warnings.

---

# 11. Environment Variables

Create a local file:

```text
.env.local
```

Do not commit this file.

The application requires:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_DATABASE_HOST:5432/postgres
```

Example format:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.example.supabase.co:5432/postgres
```

Replace the values with the actual PostgreSQL connection details.

---

# 12. Security

Database credentials must not be committed to GitHub.

The following file should remain local:

```text
.env.local
```

The repository should contain:

```text
.env.example
```

with placeholder values only.

Example:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_DATABASE_HOST:5432/postgres
```

Never put the real database password in:

* GitHub
* README
* source code
* screenshots
* frontend code
* client-side environment variables

`DATABASE_URL` is used only on the server.

---

# 13. Technology Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
```

## Backend

```text
Next.js API Routes
Node.js
```

## Database

```text
PostgreSQL
Supabase
```

## Database Driver

```text
pg
```

## Spreadsheet Processing

```text
SheetJS / xlsx
```

## Testing

```text
Vitest
```

## Deployment

```text
Vercel
```

## Source Control

```text
Git
GitHub
```

---

# 14. Project Structure

```text
hive-inspect-template-importer/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   │
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   └── [templateId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── import/
│   │   │   └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── templates/
│   │       │   ├── route.ts
│   │       │   └── [templateId]/
│   │       │       ├── route.ts
│   │       │       └── duplicate/
│   │       │           └── route.ts
│   │       │
│   │       └── import/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── templates/
│   │   │   ├── TemplateList.tsx
│   │   │   ├── TemplateCard.tsx
│   │   │   ├── TemplateEditor.tsx
│   │   │   ├── TemplateHeader.tsx
│   │   │   ├── SectionEditor.tsx
│   │   │   ├── ItemEditor.tsx
│   │   │   ├── CommentEditor.tsx
│   │   │   └── DuplicateTemplateButton.tsx
│   │   │
│   │   ├── import/
│   │   │   ├── FileUploader.tsx
│   │   │   ├── ImportProgress.tsx
│   │   │   ├── ImportSummary.tsx
│   │   │   └── ImportWarnings.tsx
│   │   │
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── dialog.tsx
│   │       └── card.tsx
│   │
│   ├── lib/
│   │   ├── importer/
│   │   │   ├── parse-xlsx.ts
│   │   │   ├── detect-structure.ts
│   │   │   ├── normalize.ts
│   │   │   ├── validate.ts
│   │   │   ├── warnings.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── supabase/
│   │   │   ├── server.ts
│   │   │   ├── client.ts
│   │   │   └── queries.ts
│   │   │
│   │   └── templates/
│   │       ├── get-template.ts
│   │       ├── create-template.ts
│   │       ├── update-template.ts
│   │       └── duplicate-template.ts
│   │
│   ├── actions/
│   │   ├── template-actions.ts
│   │   └── import-actions.ts
│   │
│   └── types/
│       ├── template.ts
│       ├── import.ts
│       └── database.ts
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── data/
│   ├── README.md
│   └── InterNACHI Residential -2026-09-18.xls
│
├── tests/
│   ├── importer/
│   │   ├── parse-xlsx.test.ts
│   │   ├── normalize.test.ts
│   │   └── preservation.test.ts
│   │
│   └── templates/
│       └── duplicate-template.test.ts
│
├── .env.example
├── .env.local
├── .gitignore
├── package.json
├── README.md
└── NOTES.md
```

---

# 15. Import Pipeline

The importer is separated into multiple stages.

```text
Excel File
    |
    v
parse-xlsx.ts
    |
    v
ParsedSheet
    |
    v
detect-structure.ts
    |
    v
StructureDetection
    |
    v
normalize.ts
    |
    v
ImportedTemplate
    |
    v
validate.ts
    |
    v
Validated Template
    |
    v
PostgreSQL
```

---

# 16. Spreadsheet Parsing

The application uses SheetJS.

The parser:

* Reads `.xls`
* Reads `.xlsx`
* Detects worksheets
* Finds the first meaningful header row
* Normalizes header names
* Removes empty rows
* Converts cells into structured row objects

The parser uses:

```text
cellDates: true
cellHTML: true
```

This allows the importer to work with HTML-related spreadsheet content where available.

---

# 17. Structure Detection

The importer attempts to identify columns corresponding to:

```text
Section
Item
Comment
Order
```

The detected structure is passed to the normalization stage.

The structure detector also produces warnings when the input does not clearly match the expected structure.

---

# 18. Normalization

The normalization stage converts spreadsheet rows into the application's internal model.

Conceptually:

```text
Spreadsheet Row
       |
       v
Section
       |
       +-- Item
              |
              +-- Comment
```

Repeated section names are associated with the existing section.

Repeated item names within a section are associated with the existing item.

Comments are appended to their associated items.

Ordering is normalized using explicit position values.

---

# 19. Validation

Imported templates are validated before database persistence.

Validation checks include:

* Template name
* Section existence
* Section names
* Item existence
* Item names
* Comment structure
* Position values
* Required fields

If validation produces errors, the template is not persisted.

Warnings can still be displayed to the user when the import is successful.

---

# 20. Warning Handling

The importer is designed not to silently discard unsupported content.

For example, if comment content appears before a section or item can be associated with it, the importer can generate a warning containing:

```text
Severity
Message
Source location
Original content
```

The UI displays warnings after import.

This makes it possible for the user to understand what happened during migration.

The assignment specifically requires skipped or unsupported content to be visible rather than silently dropped.

---

# 21. HTML and Rich Content

The Spectora HTML-text export can contain HTML inside comment fields.

For example:

```html
<p>Automatic garage door opener operated using normal controls.</p>
```

The application stores comment content in:

```text
comments.content_html
```

This keeps HTML associated with the individual comment instead of storing the entire template as one HTML blob.

## Current editor behavior

The editor displays comment content in a cleaner text-oriented form.

When a comment is edited, the editor converts the text back into simple HTML paragraphs and line breaks.

For example:

```text
Automatic garage door opener operated using normal controls.
```

can be stored as:

```html
<p>Automatic garage door opener operated using normal controls.</p>
```

## Current limitation

The editor does not provide a full rich-text editor.

Complex formatting such as advanced styling, embedded media, or every possible HTML structure is not represented as a fully editable rich-text experience.

Imported HTML is retained at the comment level, but editing a complex comment through the simple text editor may normalize the formatting.

This is an intentional scope decision for the assignment.

The important distinction is:

```text
Information present in the Spectora export
```

versus:

```text
Information modeled and editable by this importer
```

The importer focuses on preserving the core template hierarchy and comment content rather than implementing a complete HTML editor.

---

# 22. Failure Handling

The application handles several failure cases.

## Unsupported file type

The application accepts:

```text
.xls
.xlsx
```

Other file types are rejected.

For example:

```text
.pdf
.docx
.txt
```

are not accepted as spreadsheet imports.

---

## Empty file

An empty upload produces an error:

```text
The selected file is empty.
```

---

## Invalid spreadsheet

If SheetJS cannot read the uploaded file, the importer returns:

```text
The uploaded file could not be read as an Excel spreadsheet.
```

---

## No worksheets

If the workbook contains no readable worksheets, the importer reports an error.

---

## Validation failure

If the normalized template fails required validation checks, the template is not inserted into the database.

Warnings and errors are shown to the user instead of silently creating incomplete data.

---

# 23. Persistence

All important template data is persisted to PostgreSQL.

The application does not depend on:

```text
localStorage
sessionStorage
browser state
```

as the source of truth.

The database remains the source of truth.

The template can therefore be:

1. Imported
2. Saved
3. Browser refreshed
4. Template reopened
5. Data still available

---

# 24. API Routes

The application uses Next.js API routes.

## Import

```text
POST /api/import
```

Uploads and imports a Spectora template.

---

## List Templates

```text
GET /api/templates
```

Returns available templates.

---

## Get / Update Template

```text
GET /api/templates/[templateId]
```

Retrieves a template.

```text
PUT /api/templates/[templateId]
```

Updates the template.

---

## Duplicate Template

```text
POST /api/templates/[templateId]/duplicate
```

Creates an independent copy of a template.

---

# 25. Local Development

## Requirements

Install:

```text
Node.js
npm
PostgreSQL
```

A Supabase PostgreSQL database can be used instead of running PostgreSQL locally.

---

## Install dependencies

Run:

```bash
npm install
```

The important packages include:

```text
next
react
react-dom
pg
xlsx
```

Development dependencies include TypeScript and React/Node type packages.

---

# 26. Environment Setup

Create:

```text
.env.local
```

Add:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_DATABASE_HOST:5432/postgres
```

Do not commit `.env.local`.

---

# 27. Database Setup

Run:

```text
supabase/migrations/001_initial_schema.sql
```

against the PostgreSQL database.

After the tables are created, start the application.

---

# 28. Start the Application

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The import page is:

```text
http://localhost:3000/import
```

The templates page is:

```text
http://localhost:3000/templates
```

---

# 29. Production Build

Before deployment, verify that the application builds successfully.

Run:

```bash
npm run build
```

Then:

```bash
npm start
```

---

# 30. Vercel Deployment

The application is designed to run on Vercel.

The deployment architecture is:

```text
GitHub
   |
   v
Vercel
   |
   +-- Next.js frontend
   |
   +-- Next.js server/API routes
   |
   v
PostgreSQL / Supabase
```

No separate Render deployment is required.

---

# 31. Vercel Environment Variable

In the Vercel project settings, add:

```text
DATABASE_URL
```

with the production PostgreSQL connection string.

Do not commit the production database password to GitHub.

After adding the environment variable, redeploy the application.

---

# 32. Live Application

The live application should be seeded with an already imported template so reviewers can immediately explore the workflow.

Expected initial experience:

```text
Live URL
   |
   v
Templates
   |
   v
InterNACHI Residential
   |
   v
Edit / Duplicate / Save
```

The assignment asks for the live application to open with an imported template available for exploration.

---

# 33. Testing Checklist

The following workflow was used to verify the implementation.

## Import test

Input:

```text
InterNACHI Residential -2026-09-18.xls
```

Expected:

```text
13 sections
69 items
309 comments
0 warnings
```

---

## Structure test

Verify:

```text
Template
  -> Sections
  -> Items
  -> Comments
```

are correctly linked.

---

## Content preservation test

Check representative imported items and comments.

For example:

```text
Garage Door
```

and its associated comments were available in the imported template.

---

## Edit test

Change:

```text
Template Name
```

Save.

Refresh.

Verify the new value remains.

---

## Section edit test

Change a section name.

Save.

Refresh.

Verify the new section name remains.

---

## Item edit test

Change an item name.

Save.

Refresh.

Verify the new item name remains.

---

## Comment edit test

Change comment text.

Save.

Refresh.

Verify the new comment remains.

---

## Duplicate test

Duplicate a template.

Verify:

```text
Original
```

and:

```text
Copy
```

exist independently.

---

## Independent copy test

Change the copied template.

Verify the original does not change.

---

## Failure test

Attempt to upload an unsupported file type.

Verify the application displays a clear error instead of silently failing.

---

# 34. Performance Considerations

The initial implementation used multiple database queries during import and template retrieval.

The implementation was then optimized to reduce unnecessary database round trips.

The optimized approach uses set-based PostgreSQL operations where appropriate.

For example, sections, items, comments, and warnings can be inserted using structured JSON data and PostgreSQL `jsonb_to_recordset`.

Template retrieval uses joined queries rather than making a separate database request for every section/item/comment.

This is important because a real template can contain hundreds or thousands of records.

---

# 35. Design Decisions

## Why PostgreSQL?

The assignment requires real backend persistence.

A relational database fits the hierarchy naturally:

```text
Template
Section
Item
Comment
```

PostgreSQL also provides:

* Foreign keys
* Transactions
* Cascading deletes
* Ordering
* Structured relationships
* Reliable persistence

---

## Why not browser storage?

Browser storage would not satisfy the persistence requirement.

The database is therefore used as the source of truth.

---

## Why structured records instead of one HTML blob?

The assignment requires the imported template to remain editable.

A single HTML blob would make it difficult to independently edit:

```text
Section
Item
Comment
```

The relational structure makes these entities independently editable.

---

## Why keep HTML in comments?

The Spectora HTML-text export can contain HTML comment content.

Keeping the HTML inside the individual comment record allows the importer to retain useful source information without turning the entire template into an opaque HTML document.

---

# 36. Scope Decisions

The project intentionally prioritizes the core migration workflow.

Implemented:

```text
Import
Edit
Save
Duplicate
Persist
Validate
Warn
```

Not implemented:

```text
Inspection reports
Scheduling
Payments
Homeowner portal
Mobile application
Full rich-text editing
Complete Spectora feature parity
```

These features were intentionally left out to focus the implementation on the customer migration problem.

---

# 37. AI-Assisted Development

AI coding tools were used during development.

AI assistance was used for:

* Exploring implementation approaches
* Debugging TypeScript errors
* Debugging Next.js issues
* Designing importer stages
* Improving database queries
* Debugging PostgreSQL relationship issues
* Reviewing frontend components
* Improving import validation
* Improving failure handling
* Reviewing the overall assignment requirements

The generated code was tested and adjusted against the actual application and real Spectora export.

The final implementation was manually verified through:

```text
Real Spectora import
Database persistence
Template editing
Template duplication
Independent copy editing
Browser refresh
Failure cases
```

AI-generated suggestions were not treated as automatically correct.

---

# 38. Development Lessons

One of the important implementation issues was ensuring that imported child records were correctly linked to their parent records.

The initial optimized import implementation successfully created the sections but had an issue linking items and comments because the JSON field names used by the application did not match the names expected by PostgreSQL.

The mapping was corrected to use explicit fields such as:

```text
section_position
item_position
content_html
```

After the correction, imported items and comments were correctly associated with their sections and items.

This was an important validation of the data model because a successful import count alone does not prove that the hierarchy was correctly persisted.

---

# 39. Known Limitations

## 39.1 Rich HTML editing

The importer stores HTML comment content, but the editor is intentionally simple.

Editing a complex HTML comment may normalize its formatting.

A future version could use a proper rich-text editor.

---

## 39. Spectora-specific variations

The importer is designed around the Spectora HTML-text spreadsheet structure.

Different Spectora exports may contain different columns or structures.

The structure detection layer is intended to make the importer more resilient, but complete compatibility with every possible Spectora export is not guaranteed.

---

## 39. Unsupported Spectora features

Not every Spectora-specific feature is represented as an editable entity in this application.

The importer focuses on:

```text
Sections
Items
Comments
Ordering
HTML comment content
```

Additional fields from the export may not currently have corresponding editable database models.

When content cannot be mapped into the structured model, the importer should surface warnings rather than silently pretending that the information was preserved.

---

## 39. No authentication

The current take-home implementation does not require user authentication.

The application is intended as a focused demonstration of the template migration workflow.

Authentication and multi-user authorization could be added for a production implementation.

---

# 40. Future Improvements

If this were continued beyond the take-home scope, possible improvements would include:

1. Rich-text comment editing
2. Better import preview
3. Field-level preservation reporting
4. Side-by-side source/import comparison
5. More detailed unsupported-content warnings
6. More Spectora export variants
7. Drag-and-drop section/item ordering
8. Authentication
9. Multi-user permissions
10. Import history
11. Rollback/version history
12. Background import processing for very large templates

These were not prioritized for the current assignment because the primary goal was a reliable import/edit/save/duplicate workflow.

---

# 41. Repository Data

The repository includes the Spectora export used during development and testing.

The committed export allows reviewers to reproduce the import workflow against the same input file.

The file contains sample template content and does not contain real customer inspection information.

---

# 42. Useful Commands

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build production application:

```bash
npm run build
```

Start production server:

```bash
npm start
```

Run tests:

```bash
npm test
```

Check Git status:

```bash
git status
```

Commit changes:

```bash
git add .
git commit -m "Complete Spectora template importer"
```

Push changes:

```bash
git push
```

---

# 43. Quick Start

For a reviewer:

```text
1. Clone repository
2. Install dependencies
3. Create .env.local
4. Add DATABASE_URL
5. Run database migration
6. Run npm install
7. Run npm run dev
8. Open /import
9. Upload the included Spectora .xls export
10. Review imported sections/items/comments
11. Edit a template
12. Save changes
13. Duplicate the template
14. Edit the copy
15. Verify the original remains unchanged
```

---

# 44. Reviewer Verification

A reviewer can verify the main assignment requirements through this workflow:

```text
Import
  ↓
13 sections
69 items
309 comments
  ↓
Open template
  ↓
Edit template
  ↓
Save
  ↓
Refresh
  ↓
Verify persistence
  ↓
Duplicate
  ↓
Edit duplicate
  ↓
Verify original unchanged
```

The important property is that the template is stored as structured persistent data rather than browser-only state or one opaque HTML document.

---

# 45. Assignment Deliverables

The final submission includes:

### 1. Repository

Contains:

* Source code
* Database migration
* Spectora export
* README
* NOTES.md
* Tests
* Meaningful Git history

### 2. Live URL

A Vercel deployment containing an already imported template.

### 3. Walkthrough Video

The walkthrough demonstrates:

1. Introduction
2. Import
3. Editing
4. Saving
5. Duplication
6. Independent copy editing
7. Repository and stack
8. Data model
9. Import mapping
10. Preservation checks
11. Scope decisions
12. Hardest import issue
13. Failure case
14. Feedback about Hive Inspect

### 4. NOTES.md

Documents:

* What was cut
* Why it was cut
* Supported input
* Known limitations
* Testing/checks
* Approximate development time
* Existing code or starters
* AI assistance

---

# 46. Current Status

Core workflow:

```text
Spectora Import       ✅
.xls Support          ✅
.xlsx Support         ✅
Structure Detection   ✅
Validation            ✅
Warnings              ✅
PostgreSQL Storage    ✅
Template Editing      ✅
Save Changes          ✅
Template Duplication  ✅
Independent Copies    ✅
HTML Comment Storage  ✅
Failure Handling      ✅
Real Spectora Test    ✅
Vercel Deployment     Pending
```

---

# 47. Conclusion

This project focuses on the core customer problem: moving a tuned inspection template from Spectora into a structured system without requiring the inspector to recreate the template manually.

The implementation prioritizes:

```text
Faithful import
+
Structured data
+
Persistent storage
+
Editable templates
+
Independent copies
+
Visible failures and limitations
```

The application intentionally avoids unrelated product functionality so that the available development time is focused on the migration workflow.

