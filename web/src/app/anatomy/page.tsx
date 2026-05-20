import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Anatomy of a prompt',
  description:
    'A field guide to building image and video prompts that actually hit. Subject, environment, lighting, camera, atmosphere, color, film, vibes — what each layer does and how to swap them.',
  openGraph: {
    title: 'Anatomy of a prompt — Ultimate Image Prompt Generator',
    description:
      'A field guide to building image and video prompts that actually hit.',
    type: 'article',
  },
};

interface Field {
  key: string;
  label: string;
  body: string;
  example: string;
  swap: string;
}

const FIELDS: Field[] = [
  {
    key: '01',
    label: 'Subject',
    body:
      'The single most weighted field. Models lean on the first 30 tokens. Lead with who or what is in frame, with one defining adjective. Resist piling on three.',
    example: 'Striking Black woman, early 20s, rich dark skin with golden undertones',
    swap:
      'Drop the age. Drop the skin descriptor. Add an occupation. Watch the entire image reframe — same subject, different read.',
  },
  {
    key: '02',
    label: 'Environment',
    body:
      'Two phrases: location, condition. "Tokyo alley at night, weathered by rain" beats "a city." The condition phrase is where 80% of mood lives.',
    example: 'Neon-lit Tokyo alley at night · weathered by elements',
    swap:
      'Same subject, change condition from "weathered" to "pristine." The character reads as protagonist instead of antagonist with no other change.',
  },
  {
    key: '03',
    label: 'Clothing',
    body:
      'Main piece, then accessories. Models render fabric weight better than fabric name — say "high-gloss" before "latex." Accessories are cheap signal: necklace, watch, earring shape.',
    example: 'High-gloss cherry red latex catsuit · chunky gold nameplate necklace',
    swap:
      'Replace one accessory. The image keeps 95% of its identity but the era reads twenty years older or younger.',
  },
  {
    key: '04',
    label: 'Lighting',
    body:
      'The single biggest knob for "this looks AI" vs "this looks real." Specify source AND quality. "Neon signs providing colored light, harsh contrast" beats "moody lighting."',
    example: 'Neon signs providing colored light · harsh contrast, deep shadows',
    swap:
      'Change "neon signs" to "single window practical light." Same subject, same wardrobe — the image moves from Blade Runner to Vermeer.',
  },
  {
    key: '05',
    label: 'Camera',
    body:
      'Position + lens. "Eye level, 85mm" reads as portrait. "Low angle, 24mm" reads as power. Skip aperture unless you want shallow DOF — modern models read "85mm" as "subject-isolated."',
    example: 'Eye level, straight on · 85mm portrait',
    swap:
      'Switch 85mm to 24mm. Subject stays, scene swallows them. Switch to overhead — image becomes documentary.',
  },
  {
    key: '06',
    label: 'Atmosphere',
    body:
      'The mood paragraph. Two slots: emotional tone, one physical element. "Tension and urban alienation, rain drops on lens" gives the model permission to add detail you didn\'t name.',
    example: 'Tension and urban alienation · rain drops on lens',
    swap:
      'Replace "rain drops" with "lens flare." Same emotion, different decade. Atmosphere is where the medium imprints onto the subject.',
  },
  {
    key: '07',
    label: 'Color grade',
    body:
      'Cinema-borrowed shorthand pays here. "Warm orange and teal blockbuster" is more legible than "vibrant colors." Name a film genre or photographer and the model takes the bait.',
    example: 'Warm orange and teal blockbuster · rich deep brown with golden warmth',
    swap:
      'Swap to "desaturated kodachrome, ektar 100" and the same scene reads as 1976 instead of 2026.',
  },
  {
    key: '08',
    label: 'Film & format',
    body:
      'Grain + aspect. "Visible high ISO grain, 16:9 cinematic" tells the model what surface to render onto. Square reads social. 2.35:1 reads theatrical. 4:5 reads editorial.',
    example: 'Visible high ISO grain from low-light · 16:9 cinematic',
    swap:
      'Same prompt at 4:5 aspect with "clean digital, no grain" reads magazine. Format is half the rendering decision.',
  },
  {
    key: '09',
    label: 'Vibes',
    body:
      'The reference field. Name a photographer, a director, a year. Models index on names better than on adjectives. "Helmut Newton powerful women, 1985" carries 200 words of implicit instruction.',
    example: 'Helmut Newton powerful women · fashion editorial with attitude and edge',
    swap:
      'Replace with "Saul Leiter color street photography." Wardrobe, lens, color grade all shift even if you didn\'t change those fields.',
  },
];

const KNOB_VARIATIONS = [
  {
    src: '/showcase/01-neon-noir.png',
    label: 'Neon, harsh contrast',
    note: 'Tokyo alley, rain on lens',
  },
  {
    src: '/showcase/03-golden-hour-ethereal.png',
    label: 'Golden hour, soft warm',
    note: 'Open field, natural backlight',
  },
  {
    src: '/showcase/06-vintage-hollywood.png',
    label: 'Studio, tungsten key',
    note: '1940s soundstage, hard fill',
  },
  {
    src: '/showcase/05-intimate-snapshot.png',
    label: 'Flash, hard direct',
    note: 'Bedroom, on-camera bounce',
  },
];

const ENGINE_COMPARE = [
  '/showcase/01-neon-noir.png',
  '/showcase/04-brutalist-fashion.png',
  '/showcase/06-vintage-hollywood.png',
  '/showcase/08-avant-garde-editorial.png',
  '/showcase/14-synthwave-retro.png',
  '/showcase/11-cyberpunk-vendor.png',
];

export default function AnatomyPage() {
  return (
    <main className="relative min-h-screen" style={{ background: 'var(--ink)' }}>
      {/* ── Hero ── */}
      <section
        className="relative"
        style={{
          padding: 'clamp(72px, 9vw, 144px) var(--gutter) clamp(48px, 6vw, 96px)',
          borderBottom: '1px solid var(--rule-strong)',
        }}
      >
        <div className="mx-auto max-w-7xl">
          <p className="section-meta">
            <span className="meta-bullet">◆</span>Field guide · 01
          </p>
          <h1
            className="hero-lockup"
            style={{ fontSize: 'clamp(2.75rem, 9vw, 9.5rem)', maxWidth: '14ch' }}
          >
            Anatomy of <br />
            <span className="highlight">a prompt</span>.
          </h1>
          <p className="body-serif mt-10 max-w-3xl">
            Most prompts fail because they describe a vibe instead of a frame.
            A great prompt is nine fields, in order, with one defining word
            per field. The model already knows how to render an image — your
            job is to tell it which image, not how to render. Here&apos;s the
            anatomy, dissected against a real piece from the showcase.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-7">
              <div
                className="duotone-soft relative aspect-[4/5] overflow-hidden"
                style={{ borderRadius: 2, border: '1px solid var(--rule-strong)' }}
              >
                <Image
                  src="/showcase/01-neon-noir.png"
                  alt="Neon Noir Portrait — the reference piece this anatomy is built around"
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
              <p className="meta-clock mt-3">
                ◆ Neon Noir Portrait · 85mm · 16:9 cinematic
              </p>
            </div>
            <div className="md:col-span-5">
              <p className="section-meta">
                <span className="meta-bullet">◆</span>Reference piece
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  fontWeight: 900,
                  color: 'var(--paper)',
                  margin: 0,
                  lineHeight: 0.95,
                }}
              >
                Nine fields, <br />ninety percent of the work.
              </h2>
              <p className="body-editorial mt-6">
                The piece on the left was generated from a structured nine-field
                prompt. Subject leads. Environment locates. Clothing characterizes.
                Lighting decides whether it reads cinematic or amateur. Camera
                picks the read. Atmosphere imprints emotion. Color grades the era.
                Film + format chooses the medium. Vibes signs the work.
              </p>
              <p className="body-editorial mt-4">
                Below: each field in turn. What it does. The line that produced
                this piece. The one-word swap that would change everything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── The nine fields ── */}
      <section
        style={{ padding: 'clamp(72px, 9vw, 144px) var(--gutter)' }}
      >
        <div className="mx-auto max-w-7xl">
          <p className="section-meta">
            <span className="meta-bullet">◆</span>The nine fields
          </p>
          <h2
            className="max-w-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 6vw, 5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.025em',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--paper)',
              margin: '0 0 4rem',
            }}
          >
            One field per knob. <br />
            <span className="highlight">turn one, see the rest move</span>.
          </h2>

          <ol className="space-y-16 md:space-y-20" style={{ listStyle: 'none', padding: 0 }}>
            {FIELDS.map((f) => (
              <li
                key={f.key}
                className="grid gap-4 md:grid-cols-12 md:gap-8"
                style={{ borderTop: '1px solid var(--rule)', paddingTop: '2rem' }}
              >
                <div className="md:col-span-2">
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '2.25rem',
                      fontWeight: 500,
                      color: 'var(--paper)',
                      lineHeight: 1,
                    }}
                  >
                    {f.key}
                  </span>
                </div>
                <div className="md:col-span-4">
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
                      letterSpacing: '-0.02em',
                      textTransform: 'uppercase',
                      fontWeight: 900,
                      color: 'var(--paper)',
                      margin: 0,
                      lineHeight: 0.95,
                    }}
                  >
                    {f.label}
                  </h3>
                  <p className="body-editorial mt-4">{f.body}</p>
                </div>
                <div className="md:col-span-6 space-y-5">
                  <div>
                    <p className="section-meta" style={{ marginBottom: 6 }}>
                      <span className="meta-bullet">◆</span>From this piece
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9375rem',
                        color: 'var(--paper)',
                        lineHeight: 1.55,
                        background: 'var(--ink-2)',
                        padding: '0.875rem 1rem',
                        border: '1px solid var(--rule-strong)',
                        borderRadius: 2,
                      }}
                    >
                      {f.example}
                    </p>
                  </div>
                  <div>
                    <p className="section-meta" style={{ marginBottom: 6 }}>
                      <span className="meta-bullet">◆</span>One-word swap
                    </p>
                    <p className="body-serif">{f.swap}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── One knob, four results ── */}
      <section
        style={{
          padding: 'clamp(72px, 9vw, 144px) var(--gutter)',
          background: 'var(--ink-2)',
          borderTop: '1px solid var(--rule-strong)',
          borderBottom: '1px solid var(--rule-strong)',
        }}
      >
        <div className="mx-auto max-w-7xl">
          <p className="section-meta">
            <span className="meta-bullet">◆</span>One knob, four results
          </p>
          <h2
            className="max-w-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 6vw, 5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.025em',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--paper)',
              margin: '0 0 1.5rem',
            }}
          >
            Same subject. <br />
            <span className="highlight">lighting alone</span> moves the era.
          </h2>
          <p className="body-editorial mb-12 max-w-3xl">
            Hold subject, wardrobe, camera, format, and vibes constant. Change
            only the lighting field. The same prompt yields four different
            decades. This is the single highest-leverage swap in the wizard.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {KNOB_VARIATIONS.map((v, i) => (
              <div key={v.src} className="flex flex-col gap-3">
                <div
                  className="duotone-soft relative aspect-[4/5] overflow-hidden"
                  style={{ borderRadius: 2, border: '1px solid var(--rule-strong)' }}
                >
                  <Image
                    src={v.src}
                    alt={v.label}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '-0.01em',
                      color: 'var(--paper)',
                    }}
                  >
                    {v.label}
                  </p>
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.8125rem',
                      color: 'var(--paper-soft)',
                      lineHeight: 1.45,
                    }}
                  >
                    {v.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Engine compare strip ── */}
      <section
        style={{ padding: 'clamp(72px, 9vw, 144px) var(--gutter)' }}
      >
        <div className="mx-auto max-w-7xl">
          <p className="section-meta">
            <span className="meta-bullet">◆</span>Style register
          </p>
          <h2
            className="max-w-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 6vw, 5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.025em',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--paper)',
              margin: '0 0 1.5rem',
            }}
          >
            The vibes field <br />
            <span className="highlight">does the heavy lifting</span>.
          </h2>
          <p className="body-editorial mb-12 max-w-3xl">
            Six pieces from the showcase, each anchored on a different reference
            in the vibes field — Newton, brutalist, Hollywood, avant-garde,
            synthwave, cyberpunk. Same engine, same nine-field structure,
            entirely different work. Names index harder than adjectives.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-6">
            {ENGINE_COMPARE.map((src) => (
              <div
                key={src}
                className="duotone-soft relative aspect-[4/5] overflow-hidden"
                style={{ borderRadius: 2, border: '1px solid var(--rule)' }}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA close ── */}
      <section
        style={{
          padding: 'clamp(72px, 9vw, 144px) var(--gutter)',
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, var(--accent-soft), var(--ink) 70%)',
          color: 'var(--paper)',
          borderTop: '1px solid var(--rule-strong)',
        }}
      >
        <div className="mx-auto max-w-5xl text-center">
          <p
            className="section-meta"
            style={{ color: 'var(--paper)', justifyContent: 'center', display: 'inline-flex' }}
          >
            <span className="meta-bullet" style={{ color: 'var(--accent)' }}>◆</span>
            Now build one
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 7vw, 6rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.025em',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--paper)',
              margin: '1rem 0 2rem',
            }}
          >
            The wizard fills <br />
            <span style={{ background: 'var(--accent)', color: 'var(--paper)', padding: '0.04em 0.18em 0.10em' }}>
              all nine fields
            </span> for you.
          </h2>
          <p
            className="mx-auto max-w-2xl"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'rgba(244, 239, 230, 0.78)',
              lineHeight: 1.6,
            }}
          >
            13 guided categories. 7,000+ curated suggestions per field. Pick
            the engine, fill the anatomy, copy or generate. Free tier on
            Gemini, bring-your-own-key on the rest.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm uppercase tracking-[0.18em] font-bold"
              style={{
                background: 'var(--paper)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-display)',
                borderRadius: 2,
              }}
            >
              <span>Prompt</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-[0.18em] font-bold"
              style={{
                background: 'transparent',
                color: 'var(--paper)',
                border: '1px solid rgba(244, 239, 230, 0.32)',
                fontFamily: 'var(--font-display)',
                borderRadius: 2,
              }}
            >
              Read the breakdowns
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
