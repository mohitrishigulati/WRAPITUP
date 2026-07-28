import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STORE_INFO_PAGES } from "@/lib/store/store-pages";

type PageProps = { params: { slug: string } };

export function generateStaticParams() {
  return Object.keys(STORE_INFO_PAGES).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const page = STORE_INFO_PAGES[params.slug];
  if (!page) return { title: "Not found" };
  return { title: page.title, description: page.description };
}

export default function StoreInfoPage({ params }: PageProps) {
  const page = STORE_INFO_PAGES[params.slug];
  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-zinc-900">{page.title}</h1>
      <div className="prose prose-zinc mt-8 max-w-none text-zinc-700">
        {page.sections.map((section, i) => (
          <div key={i} className="mb-8">
            {section.heading ? (
              <h2 className="text-lg font-semibold text-zinc-900">{section.heading}</h2>
            ) : null}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="mt-3 text-sm leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>
    </article>
  );
}
