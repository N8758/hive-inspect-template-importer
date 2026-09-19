import Link from "next/link";
import TemplateList from "../../components/templates/TemplateList";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Templates
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your imported inspection templates.
            </p>
          </div>

          <Link
            href="/import"
            className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Import Template
          </Link>
        </div>

        <TemplateList />
      </div>
    </main>
  );
}