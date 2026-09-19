

## Hive Inspect Template Importer

This document summarizes the implementation decisions, scope cuts, supported input, limitations, testing, development time, and tools used for the Hive Inspect template importer assignment.

---

# 1. What I Built

I built a web application that imports a Spectora HTML-text spreadsheet export into a structured, editable template system.

The main workflow is:

```text
Spectora HTML-text export
        ↓
Upload
        ↓
Spreadsheet parsing
        ↓
Structure detection
        ↓
Normalization
        ↓
Validation
        ↓
PostgreSQL persistence
        ↓
Editable template
        ↓
Save changes
        ↓
Duplicate template
        ↓
Edit duplicate independently
````

The implementation focuses on the core migration problem: preserving an inspector's existing template structure and content while making it editable in a new system.

---

# 2. Source Template Used

I used the real Spectora:

```text
InterNACHI Residential
```

template.

The template was obtained from Spectora's Template Center and exported using:

```text
Templates
→ My Templates
→ InterNACHI Residential
→ Export to spreadsheet
→ Export HTML Text
```

The committed test input is:

```text
InterNACHI Residential -2026-09-18.xls
```

The file is included in:

```text
data/
```

The assignment specifically requested using a real Spectora HTML-text export rather than the plain-text export.

No real customer inspection information was intentionally used.

---

# 3. Supported Input

The importer currently supports:

```text
.xls
.xlsx
```

The expected input is a Spectora spreadsheet export using the HTML-text export workflow.

The importer reads the workbook using SheetJS.

The parser handles:

* Excel worksheets
* Header detection
* Spreadsheet rows
* Empty rows
* Normalized column names
* Cell values
* HTML-related spreadsheet content

The importer then attempts to identify:

* Section
* Item
* Comment
* Ordering information

---

# 4. Real Import Result

The real InterNACHI Residential export was successfully imported.

The imported result was:

```text
13 sections
69 items
309 comments
0 warnings
```

The imported template was then opened in the editor.

Representative sections and items were checked to confirm that the hierarchy was persisted correctly.

---

# 5. Data Model

I intentionally did not store the complete template as one opaque HTML document.

The database structure is:

```text
Template
   ↓
Section
   ↓
Item
   ↓
Comment
```

The main PostgreSQL tables are:

```text
templates
sections
items
comments
import_warnings
```

The relationships are represented with foreign keys.

Ordering is represented using:

```text
position
```

This allows sections, items, and comments to remain independently editable.

---

# 6. What I Preserved

The importer focuses on preserving:

* Template name
* Template source
* Section hierarchy
* Item hierarchy
* Comment content
* Original ordering
* HTML content inside individual comments

The database keeps comments separately from items so that individual comments can be edited without modifying the complete template.

---

# 7. HTML and Rich Content

Spectora's HTML-text export can contain HTML inside comment fields.

For example:

```html
<p>Automatic garage door opener operated using normal controls.</p>
```

I store this content in:

```text
comments.content_html
```

This means HTML can be retained at the comment level.

The editor currently presents comment content as readable text rather than exposing HTML tags directly to the inspector.

When edited, the text is converted back into simple HTML paragraphs and line breaks.

---

# 8. Rich Content Limitation

I did not implement a complete rich-text editor.

This means that complex HTML formatting is not fully editable through the current editor.

For example, advanced formatting, embedded media, or complex HTML structures may be normalized if the comment is edited.

The distinction I use is:

```text
Content present in the Spectora export
```

versus:

```text
Content currently modeled and editable by the importer
```

The importer preserves the comment HTML at import time, but the simple editor does not attempt to provide complete Spectora rich-content editing.

I chose this intentionally because the assignment's core requirement is faithful template migration and a usable editor, not full rich-text editor parity.

---

# 9. Unsupported or Unmapped Content

The importer does not silently claim that every Spectora-specific field is supported.

The structured model currently focuses on:

```text
Sections
Items
Comments
Ordering
HTML comment content
```

Some additional Spectora export fields may not have corresponding editable fields in the current application.

The importer includes warning handling for content that cannot be associated with the expected structure.

Warnings can contain:

```text
Severity
Message
Source location
Original content
```

This makes unsupported or unexpected content visible instead of silently dropping it.

---

# 10. Validation

Imported data is validated before being persisted.

Validation checks include:

* Template name
* Section existence
* Section names
* Item existence
* Item names
* Comment structure
* Position values
* Required fields

If validation produces an error, the template is not persisted.

Warnings are displayed to the user after import.

---

# 11. Failure Cases Tested

I tested failure handling for unsupported file types.

The application accepts:

```text
.xls
.xlsx
```

and rejects unsupported file types.

I also added handling for:

* Empty uploads
* Unreadable Excel files
* Workbooks without readable worksheets
* Invalid imported template structure
* Validation failures

The goal is to fail clearly instead of creating incomplete or misleading template data.

---

# 12. Editing Test

After importing the real Spectora template, I tested editing.

I changed:

```text
Template name
```

and saved the changes.

I also tested editing:

```text
Section name
Item name
Comment text
```

After saving, I refreshed/reopened the template to verify that the changes remained persisted in PostgreSQL.

This confirmed that the application does not depend on browser-only state for template persistence.

---

# 13. Duplication Test

I tested the duplicate workflow using the imported InterNACHI Residential template.

The original template was:

```text
InterNACHI Residential -2026-09-18
```

A duplicate was created:

```text
InterNACHI Residential -2026-09-18 Copy
```

I then edited the copy.

The copy was renamed to demonstrate independent editing.

The original template remained unchanged.

This verifies that the duplicated template receives its own sections, items, and comments instead of sharing editable child records with the original.

---

# 14. Persistence Test

The database is PostgreSQL.

The application does not use:

```text
localStorage
```

or browser-only storage as the source of truth.

I tested:

```text
Import
→ Save
→ Refresh
→ Reopen
```

and verified that the saved data remained available.

The same persistence model is used for duplicated templates.

---

# 15. Database Transaction Handling

Import operations use a database transaction.

The flow is:

```text
BEGIN
   ↓
Create template
   ↓
Create sections
   ↓
Create items
   ↓
Create comments
   ↓
Create warnings
   ↓
COMMIT
```

If an error occurs during persistence:

```text
ROLLBACK
```

is performed.

This prevents a partially imported template from being left in the database.

---

# 16. Performance Improvement

During development, the initial implementation used multiple database queries for importing and retrieving template data.

This became noticeably slower as the number of sections, items, and comments increased.

I changed the implementation to use more set-based PostgreSQL operations and joined retrieval queries.

This reduced unnecessary database round trips and also exposed an important hierarchy-mapping issue during testing.

The import initially created sections successfully but did not correctly link all child records.

I traced the issue to mismatched JSON field names used during the PostgreSQL `jsonb_to_recordset` mapping.

The mapping was corrected using explicit fields such as:

```text
section_position
item_position
content_html
```

After the correction, the real InterNACHI template correctly showed its imported items and comments.

This was one of the most important debugging issues during development because an import count alone does not prove that the hierarchy is correctly connected.

---

# 17. Scope Cuts

I deliberately did not build several features.

## Full Inspection Reports

Not implemented.

Reason:

The assignment is about template migration rather than creating inspection reports.

---

## Scheduling

Not implemented.

Reason:

Scheduling is outside the template migration workflow.

---

## Payments

Not implemented.

Reason:

Payments are unrelated to importing and editing inspection templates.

---

## Homeowner Portal

Not implemented.

Reason:

The assignment explicitly keeps homeowner-facing workflows out of scope.

---

## Mobile Application

Not implemented.

Reason:

The assignment describes this as a desk-oriented workflow, so I focused on the web application.

---

## Authentication

A full authentication and authorization system was not implemented.

Reason:

The take-home focuses on the migration workflow, and authentication would add scope without improving the core import/edit/duplicate workflow.

For a production version, authentication and multi-user permissions would be necessary.

---

## Full Rich-Text Editor

Not implemented.

Reason:

I chose a simpler comment editor so more time could be spent on reliable import, persistence, duplication, and failure handling.

The current implementation retains HTML comment content but does not provide complete rich-text editing.

---

## Complete Spectora Feature Parity

Not implemented.

Reason:

Spectora contains more fields and features than the baseline required for this assignment.

I focused on the core structured model:

```text
Template
Section
Item
Comment
```

and documented the current limitations rather than pretending to support fields that are not modeled.

---

# 18. Why I Made These Scope Decisions

The central customer problem is migration of an existing template that an inspector has spent years tuning.

The highest-value workflow is therefore:

```text
Import existing template
→ Preserve structure
→ Preserve content
→ Edit
→ Save
→ Duplicate
→ Continue editing
```

I prioritized that workflow over adding unrelated product features.

This follows the assignment's emphasis on faithful import, usable workflow, and deliberate scope decisions.

---

# 19. Improvement Added

The main improvement I focused on was making the import easier to trust.

The application shows an import summary containing:

```text
Sections
Items
Comments
Warnings
```

After import, warnings are shown separately.

For warnings, the UI can display:

```text
Severity
Source location
Message
Original content
```

This gives the inspector visibility into what happened during the import.

I chose this because migration trust is important: an inspector needs to know whether content was actually imported rather than simply seeing an apparently successful upload.

---

# 20. Testing Approach

I tested the application at several levels.

## Import

Tested the real Spectora InterNACHI Residential HTML-text export.

Result:

```text
13 sections
69 items
309 comments
0 warnings
```

---

## Structure

Verified that:

```text
Template
→ Sections
→ Items
→ Comments
```

were correctly connected.

---

## Content

Checked representative imported items and comments.

---

## Save

Changed template data and verified that the changes remained after reopening.

---

## Duplicate

Duplicated the imported template and changed the copy.

Verified that the original remained unchanged.

---

## Failure

Tested unsupported file types and invalid input handling.

---

## Refresh / Persistence

Verified that saved data remained available after browser refresh/reopen.

---

# 21. Automated Tests

The project includes tests for importer behavior and template duplication.

The intended test areas are:

```text
Parser
Normalization
Content preservation
Template duplication
```

These tests complement the manual end-to-end testing performed with the real Spectora export.

---

# 22. AI Coding Tools

AI coding tools were used during development.

AI assistance was used for:

* Initial implementation ideas
* Code generation
* TypeScript debugging
* Next.js debugging
* PostgreSQL query optimization
* Importer design
* Error investigation
* UI improvements
* Reviewing assignment requirements

I reviewed and tested the generated code rather than treating generated output as automatically correct.

A concrete example was the PostgreSQL hierarchy issue.

The first optimized import approach produced sections but did not correctly link all items and comments.

I investigated the actual database result, identified the field-mapping problem, corrected the SQL mapping, and re-tested against the real Spectora export.

This helped ensure that the shipped implementation was based on observed behavior rather than generated code alone.

---

# 23. Existing Code / Starters

The application was built as a dedicated implementation for this assignment.

The main application structure, importer, database model, API routes, and editor workflow were developed specifically for the project.

Libraries used include:

```text
Next.js
React
TypeScript
Tailwind CSS
SheetJS / xlsx
PostgreSQL
pg
Vitest
```

These are standard development dependencies rather than an existing template importer being submitted as-is.

---

# 24. Approximate Time Spent

Approximate total development time:

```text
Approximately 2 focused days
```

Time was divided approximately across:

```text
Product exploration and requirements
Importer implementation
Database/model implementation
Frontend editor
Debugging and optimization
Testing with real Spectora export
Documentation
Deployment preparation
```

The exact time varied because several debugging issues required investigation, particularly spreadsheet structure and database hierarchy mapping.

---

# 25. Current Known Limitations

The current implementation has the following known limitations:

1. It is focused on Spectora HTML-text spreadsheet exports.
2. The importer is not guaranteed to support every possible Spectora export variation.
3. Some Spectora-specific fields are not represented in the editable schema.
4. The comment editor is not a complete rich-text editor.
5. Complex HTML formatting may be normalized when a comment is edited.
6. Authentication and multi-user authorization are not implemented.
7. The application focuses on desktop workflows.
8. Full inspection report functionality is outside the project scope.

These limitations are intentional and documented rather than hidden.

---

# 26. What I Would Improve Next

If more development time were available, I would prioritize:

1. Rich-text comment editing
2. More detailed import preview
3. Source-to-import comparison
4. Field-level preservation reporting
5. More Spectora export variants
6. Import version/history
7. Authentication and user permissions
8. Drag-and-drop ordering
9. More extensive automated end-to-end tests

The next improvement I would prioritize would be a more transparent import review experience, where an inspector could compare source content against the imported structure before committing the template.

---

# 27. Submission Checklist

Before submitting, I will verify:

* [ ] GitHub repository is accessible
* [ ] Meaningful Git history is present
* [ ] Real Spectora export is committed
* [ ] README.md is complete
* [ ] NOTES.md is complete
* [ ] `.env.local` and credentials are not committed
* [ ] Database schema is documented
* [ ] Vercel deployment is working
* [ ] Production `DATABASE_URL` is configured
* [ ] Live app opens with an imported template
* [ ] Import workflow works
* [ ] Edit/save workflow works
* [ ] Duplicate workflow works
* [ ] Original and duplicate remain independent
* [ ] Failure case can be demonstrated
* [ ] Walkthrough video is recorded
* [ ] Walkthrough link is accessible without requesting permission

