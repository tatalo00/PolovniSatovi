import "server-only";

// Supported locales
export const locales = ["sr", "en", "hr", "bs"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "sr";

// Translation keys
export type TranslationKey = keyof typeof translations["sr"];

// Translation data
const translations = {
  sr: {
    // Common
    appName: "PolovniSatovi",
    common: {
      loading: "Učitavanje...",
      save: "Sačuvaj",
      cancel: "Otkaži",
      delete: "Obriši",
      edit: "Izmeni",
      view: "Pregled",
      submit: "Pošalji",
      search: "Pretraga",
      filter: "Filteri",
      clear: "Obriši",
      apply: "Primeni",
      back: "Nazad",
      next: "Sledeće",
      previous: "Prethodno",
      yes: "Da",
      no: "Ne",
      close: "Zatvori",
    },
    // Navigation
    nav: {
      home: "Početna",
      listings: "Oglasi",
      sell: "Prodaj",
      dashboard: "Dashboard",
      admin: "Admin Panel",
      signIn: "Prijava",
      signUp: "Registracija",
      signOut: "Odjavi se",
    },
    // Auth
    auth: {
      signIn: "Prijava",
      signUp: "Registracija",
      email: "Email",
      password: "Šifra",
      name: "Ime",
      confirmPassword: "Potvrdi šifru",
      forgotPassword: "Zaboravili ste šifru?",
      noAccount: "Nemate nalog?",
      hasAccount: "Već imate nalog?",
    },
    // Listings
    listings: {
      title: "Oglasi",
      create: "Kreiraj oglas",
      edit: "Izmeni oglas",
      view: "Pregled oglasa",
      noListings: "Nema oglasa",
      price: "Cena",
      condition: "Stanje",
      brand: "Marka",
      model: "Model",
      year: "Godina",
      location: "Lokacija",
      description: "Opis",
      photos: "Fotografije",
      submitForApproval: "Pošalji na odobrenje",
      draft: "Nacrt",
      pending: "Čeka odobrenje",
      approved: "Odobren",
      rejected: "Odbijen",
      archived: "Arhiviran",
    },
    // Seller
    seller: {
      profile: "Prodavac profil",
      storeName: "Naziv prodavnice",
      description: "Opis",
      location: "Lokacija",
      createProfile: "Kreiraj prodavac profil",
      updateProfile: "Ažuriraj profil",
    },
    // Admin
    admin: {
      title: "Admin Panel",
      listings: "Oglasi za odobrenje",
      reports: "Prijave",
      approve: "Odobri",
      reject: "Odbij",
      pendingCount: "Čekaju odobrenje",
      openReports: "Otvorene prijave",
    },
    // Currency
    currency: {
      eur: "EUR",
      rsd: "RSD",
      bam: "BAM",
      hrk: "HRK",
      showIn: "Prikaži u",
    },
  },
  en: {
    appName: "PolovniSatovi",
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      submit: "Submit",
      search: "Search",
      filter: "Filters",
      clear: "Clear",
      apply: "Apply",
      back: "Back",
      next: "Next",
      previous: "Previous",
      yes: "Yes",
      no: "No",
      close: "Close",
    },
    nav: {
      home: "Home",
      listings: "Listings",
      sell: "Sell",
      dashboard: "Dashboard",
      admin: "Admin Panel",
      signIn: "Sign In",
      signUp: "Sign Up",
      signOut: "Sign Out",
    },
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      email: "Email",
      password: "Password",
      name: "Name",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
    },
    listings: {
      title: "Listings",
      create: "Create Listing",
      edit: "Edit Listing",
      view: "View Listing",
      noListings: "No listings",
      price: "Price",
      condition: "Condition",
      brand: "Brand",
      model: "Model",
      year: "Year",
      location: "Location",
      description: "Description",
      photos: "Photos",
      submitForApproval: "Submit for Approval",
      draft: "Draft",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      archived: "Archived",
    },
    seller: {
      profile: "Seller Profile",
      storeName: "Store Name",
      description: "Description",
      location: "Location",
      createProfile: "Create Seller Profile",
      updateProfile: "Update Profile",
    },
    admin: {
      title: "Admin Panel",
      listings: "Listings for Approval",
      reports: "Reports",
      approve: "Approve",
      reject: "Reject",
      pendingCount: "Pending Approval",
      openReports: "Open Reports",
    },
    currency: {
      eur: "EUR",
      rsd: "RSD",
      bam: "BAM",
      hrk: "HRK",
      showIn: "Show in",
    },
  },
  hr: {
    // Croatian translations (similar structure, abbreviated for brevity)
    appName: "PolovniSatovi",
    common: {
      loading: "Učitavanje...",
      save: "Spremi",
      cancel: "Odustani",
      delete: "Obriši",
      edit: "Uredi",
      view: "Pregled",
      submit: "Pošalji",
      search: "Pretraži",
      filter: "Filteri",
      clear: "Očisti",
      apply: "Primijeni",
      back: "Natrag",
      next: "Sljedeće",
      previous: "Prethodno",
      yes: "Da",
      no: "Ne",
      close: "Zatvori",
    },
    nav: {
      home: "Početna",
      listings: "Oglasi",
      sell: "Prodaj",
      dashboard: "Nadzorna ploča",
      admin: "Admin Panel",
      signIn: "Prijava",
      signUp: "Registracija",
      signOut: "Odjavi se",
    },
    auth: {
      signIn: "Prijava",
      signUp: "Registracija",
      email: "Email",
      password: "Lozinka",
      name: "Ime",
      confirmPassword: "Potvrdi lozinku",
      forgotPassword: "Zaboravili ste lozinku?",
      noAccount: "Nemate račun?",
      hasAccount: "Već imate račun?",
    },
    listings: {
      title: "Oglasi",
      create: "Kreiraj oglas",
      edit: "Uredi oglas",
      view: "Pregled oglasa",
      noListings: "Nema oglasa",
      price: "Cijena",
      condition: "Stanje",
      brand: "Marka",
      model: "Model",
      year: "Godina",
      location: "Lokacija",
      description: "Opis",
      photos: "Fotografije",
      submitForApproval: "Pošalji na odobrenje",
      draft: "Nacrt",
      pending: "Čeka odobrenje",
      approved: "Odobreno",
      rejected: "Odbijeno",
      archived: "Arhivirano",
    },
    seller: {
      profile: "Profil prodavača",
      storeName: "Naziv trgovine",
      description: "Opis",
      location: "Lokacija",
      createProfile: "Kreiraj profil prodavača",
      updateProfile: "Ažuriraj profil",
    },
    admin: {
      title: "Admin Panel",
      listings: "Oglasi za odobrenje",
      reports: "Prijave",
      approve: "Odobri",
      reject: "Odbij",
      pendingCount: "Čekaju odobrenje",
      openReports: "Otvorene prijave",
    },
    currency: {
      eur: "EUR",
      rsd: "RSD",
      bam: "BAM",
      hrk: "HRK",
      showIn: "Prikaži u",
    },
  },
  bs: {
    // Bosnian translations (similar structure, abbreviated for brevity)
    appName: "PolovniSatovi",
    common: {
      loading: "Učitavanje...",
      save: "Sačuvaj",
      cancel: "Otkaži",
      delete: "Obriši",
      edit: "Uredi",
      view: "Pregled",
      submit: "Pošalji",
      search: "Pretraga",
      filter: "Filteri",
      clear: "Obriši",
      apply: "Primijeni",
      back: "Nazad",
      next: "Sljedeće",
      previous: "Prethodno",
      yes: "Da",
      no: "Ne",
      close: "Zatvori",
    },
    nav: {
      home: "Početna",
      listings: "Oglasi",
      sell: "Prodaj",
      dashboard: "Kontrolna tabla",
      admin: "Admin Panel",
      signIn: "Prijava",
      signUp: "Registracija",
      signOut: "Odjavi se",
    },
    auth: {
      signIn: "Prijava",
      signUp: "Registracija",
      email: "Email",
      password: "Šifra",
      name: "Ime",
      confirmPassword: "Potvrdi šifru",
      forgotPassword: "Zaboravili ste šifru?",
      noAccount: "Nemate nalog?",
      hasAccount: "Već imate nalog?",
    },
    listings: {
      title: "Oglasi",
      create: "Kreiraj oglas",
      edit: "Uredi oglas",
      view: "Pregled oglasa",
      noListings: "Nema oglasa",
      price: "Cijena",
      condition: "Stanje",
      brand: "Marka",
      model: "Model",
      year: "Godina",
      location: "Lokacija",
      description: "Opis",
      photos: "Fotografije",
      submitForApproval: "Pošalji na odobrenje",
      draft: "Nacrt",
      pending: "Čeka odobrenje",
      approved: "Odobren",
      rejected: "Odbijen",
      archived: "Arhiviran",
    },
    seller: {
      profile: "Profil prodavača",
      storeName: "Naziv prodavnice",
      description: "Opis",
      location: "Lokacija",
      createProfile: "Kreiraj profil prodavača",
      updateProfile: "Ažuriraj profil",
    },
    admin: {
      title: "Admin Panel",
      listings: "Oglasi za odobrenje",
      reports: "Prijave",
      approve: "Odobri",
      reject: "Odbij",
      pendingCount: "Čekaju odobrenje",
      openReports: "Otvorene prijave",
    },
    currency: {
      eur: "EUR",
      rsd: "RSD",
      bam: "BAM",
      hrk: "HRK",
      showIn: "Prikaži u",
    },
  },
} as const;

// Get translation function
export function getTranslations(locale: Locale = defaultLocale) {
  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations[defaultLocale][key] || String(key);
  };

  return t;
}

// Get nested translation
export function getNestedTranslation(
  locale: Locale,
  path: string
): string | Record<string, any> {
  const keys = path.split(".");
  let value: any = translations[locale];

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key as keyof typeof value];
    } else {
      // Fallback to default locale
      value = translations[defaultLocale];
      for (const fallbackKey of keys) {
        if (value && typeof value === "object" && fallbackKey in value) {
          value = value[fallbackKey as keyof typeof value];
        } else {
          return path;
        }
      }
      break;
    }
  }

  return typeof value === "string" ? value : value || path;
}

