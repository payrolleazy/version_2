import { PublicSectionCard } from '@/components/public/PublicSection';

const FAQS = [
  {
    question: 'Do candidates or invited users count toward billing?',
    answer: 'No. The commercial model is built around active workforce seats, not early candidate or invitation activity.',
  },
  {
    question: 'Can an existing customer skip pricing and sign in directly?',
    answer: 'Yes. Existing users should move directly into the application auth flow instead of repeating the buying journey.',
  },
  {
    question: 'Do we need to buy before guided setup starts?',
    answer: 'Only when workforce size moves beyond the free threshold or the chosen commercial path requires paid activation.',
  },
] as const;

export function PricingFaq() {
  return (
    <PublicSectionCard>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-[0.72rem] font-black uppercase tracking-[0.24em] text-sky-600">FAQ</p>
          <h2 className="text-4xl font-black tracking-[-0.03em] text-slate-950">Answer the buying questions before they become objections.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {FAQS.map((faq) => (
            <div key={faq.question} className="rounded-[1.55rem] border border-slate-200/70 bg-white/92 p-6 shadow-[var(--shadow-card)]">
              <h3 className="text-xl font-black tracking-tight text-slate-950">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicSectionCard>
  );
}