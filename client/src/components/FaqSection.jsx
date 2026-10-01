import { faqItems } from '../data/faq'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion'
import { Reveal } from './motion'

export default function FaqSection() {
  return (
    <section
      id="faq"
      tabIndex={-1}
      className="scroll-mt-28 bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary-deep uppercase">
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                help
              </span>
              Questions fréquentes
            </p>
            <h2 className="mb-4 text-[28px] font-semibold text-on-surface md:text-[48px]">
              Vous avez une question ?
            </h2>
            <p className="text-on-surface-variant">
              Tout ce qu’il faut savoir avant de trouver l’artisan de vos travaux — en quelques mots.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion
            type="multiple"
            defaultValue={['trouver']}
            className="mx-auto max-w-3xl rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-2 py-2 shadow-raised"
          >
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}