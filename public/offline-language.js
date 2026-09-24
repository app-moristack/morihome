;(() => {
  const messages = {
    en: [
      'You are offline',
      'Search results and provider details need a connection. Reconnect and try again.',
      'Try again',
    ],
    fr: [
      'Vous êtes hors connexion',
      'La recherche et les profils nécessitent une connexion. Reconnectez-vous et réessayez.',
      'Réessayer',
    ],
    mfe: [
      'Ou pa konekte',
      'Bann rezilta resers ek detay profesionnèl bizin enn koneksion. Rekonekte ek esey ankor.',
      'Esey ankor',
    ],
  }
  let locale = 'en'
  try {
    locale = localStorage.getItem('morihome_locale') || 'en'
  } catch {
    /* Use the default language. */
  }
  if (locale !== 'en' && locale !== 'fr') locale = 'en'
  const [title, description, retry] = messages[locale]
  document.documentElement.lang = locale
  document.title = `${title} — MoriHome`
  document.querySelector('h1').textContent = title
  document.querySelector('p').textContent = description
  const button = document.querySelector('button')
  button.textContent = retry
  button.addEventListener('click', () => window.location.replace('/'))
})()
