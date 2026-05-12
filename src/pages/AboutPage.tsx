import { motion } from 'framer-motion';

/** Placeholder: conteúdo “Sobre mim” será implementado depois. */
export function AboutPage() {
   return (
      <motion.section
         aria-label="Sobre mim"
         className="min-h-[50vh] bg-[var(--bg-color)] px-4 py-10"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         transition={{ duration: 0.28, ease: 'easeOut' }}
      />
   );
}
