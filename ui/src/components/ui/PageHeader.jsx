import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../lib/motion'

/**
 * Forest-themed page hero strip used at the top of every interior page.
 * Renders:
 *   - Optional eyebrow (small uppercase pill)
 *   - Display-serif title with optional italic accent (pass <em> in title)
 *   - Subtitle (max 1-2 sentences)
 *   - Optional right-aligned CTA / stat slot (children)
 *
 * Usage:
 *   <PageHeader
 *     eyebrow="Neighborhood Directory"
 *     title={<>Local businesses, <em className="text-gold-300">all in one place.</em></>}
 *     subtitle="Find and support every restaurant, shop, and service in the district."
 *   >
 *     <Button>Add a business</Button>
 *   </PageHeader>
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',           // 'left' | 'center'
  size = 'md',              // 'sm' | 'md' | 'lg'
  children,                 // optional right-aligned slot
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start'
  const titleSize = {
    sm: 'text-3xl sm:text-4xl md:text-5xl',
    md: 'text-4xl sm:text-5xl md:text-6xl',
    lg: 'text-5xl sm:text-6xl md:text-7xl',
  }[size]

  return (
    <section className="relative overflow-hidden bg-forest-900 text-cream-50">
      {/* Brand radial blooms */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-gold-500/12 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] bg-forest-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-forest-950/40 via-transparent to-forest-950/60" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 md:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger(0.06)}
          className={`flex flex-col ${alignClass} gap-5 ${
            children ? 'lg:flex-row lg:items-end lg:justify-between lg:gap-12' : ''
          }`}
        >
          <div className="max-w-3xl">
            {eyebrow && (
              <motion.span
                variants={fadeUp}
                className="inline-block px-3 py-1 mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] bg-gold-500/15 text-gold-200 border border-gold-400/30 rounded-full"
              >
                {eyebrow}
              </motion.span>
            )}
            <motion.h1
              variants={fadeUp}
              className={`font-display tracking-tight leading-[1.05] text-cream-50 ${titleSize}`}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                variants={fadeUp}
                className="mt-5 text-lg sm:text-xl text-cream-100/75 max-w-2xl leading-relaxed"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {children && (
            <motion.div variants={fadeUp} className="shrink-0">
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Subtle bottom gradient — softens transition into page body */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-b from-transparent to-cream-50 pointer-events-none" />
    </section>
  )
}
