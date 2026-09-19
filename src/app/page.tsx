import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-gray-500">
            Hive Inspect
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Template Importer
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Import Spectora inspection templates, review their
            structure, edit template content, and save changes
            to the database.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/import"
              className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90"
            >
              Import Template
            </Link>

            <Link
              href="/templates"
              className="rounded-md border bg-white px-5 py-3 text-sm font-medium hover:bg-gray-50"
            >
              View Templates
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold">
              Import
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Upload an Excel template exported from Spectora.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold">
              Edit
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Edit sections, items, and comment text.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-5">
            <h2 className="font-semibold">
              Save
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Store template changes in the PostgreSQL database.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}