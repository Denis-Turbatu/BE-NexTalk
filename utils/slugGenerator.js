function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Sostituisce spazi con -
    .replace(/[^\w\-]+/g, '') // Rimuove tutti i caratteri non-word
    .replace(/\-\-+/g, '-')   // Sostituisce multipli - con singolo -
    .replace(/^-+/, '')       // Taglia - dall'inizio del testo
    .replace(/-+$/, '');      // Taglia - dalla fine del testo
}

module.exports = generateSlug;
