import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "User Profile Page": "User Profile Page",
      "Personal user profile details": "Personal user profile details, preplanned itineraries, and previous trips overview.",
      "Hide Edit Form": "Hide Edit Form",
      "Show Edit Form": "Show Edit Form",
      "Upload New Avatar Photo": "Upload New Avatar Photo",
      "EMAIL ADDRESS": "EMAIL ADDRESS",
      "FULL NAME": "FULL NAME",
      "LANGUAGE PREFERENCE": "LANGUAGE PREFERENCE",
      "CURRENCY PREFERENCE": "CURRENCY PREFERENCE",
      "Save Profile Changes": "Save Profile Changes",
      "Preplanned Trips": "Preplanned Trips",
      "Upcoming Journeys": "Upcoming Journeys",
      "Language": "Language",
    }
  },
  es: {
    translation: {
      "User Profile Page": "Página de perfil de usuario",
      "Personal user profile details": "Detalles del perfil de usuario personal, itinerarios planificados y descripción general de viajes anteriores.",
      "Hide Edit Form": "Ocultar formulario",
      "Show Edit Form": "Mostrar formulario",
      "Upload New Avatar Photo": "Subir nueva foto de avatar",
      "EMAIL ADDRESS": "CORREO ELECTRÓNICO",
      "FULL NAME": "NOMBRE COMPLETO",
      "LANGUAGE PREFERENCE": "PREFERENCIA DE IDIOMA",
      "CURRENCY PREFERENCE": "PREFERENCIA DE MONEDA",
      "Save Profile Changes": "Guardar cambios",
      "Preplanned Trips": "Viajes planificados",
      "Upcoming Journeys": "Próximos viajes",
      "Language": "Idioma",
    }
  },
  hi: {
    translation: {
      "User Profile Page": "उपयोगकर्ता प्रोफ़ाइल पृष्ठ",
      "Personal user profile details": "व्यक्तिगत उपयोगकर्ता प्रोफ़ाइल विवरण, पूर्व-नियोजित यात्रा कार्यक्रम और पिछली यात्राओं का अवलोकन।",
      "Hide Edit Form": "संपादन फॉर्म छिपाएं",
      "Show Edit Form": "संपादन फॉर्म दिखाएं",
      "Upload New Avatar Photo": "नया अवतार फोटो अपलोड करें",
      "EMAIL ADDRESS": "ईमेल पता",
      "FULL NAME": "पूरा नाम",
      "LANGUAGE PREFERENCE": "भाषा प्राथमिकता",
      "CURRENCY PREFERENCE": "मुद्रा प्राथमिकता",
      "Save Profile Changes": "प्रोफ़ाइल परिवर्तन सहेजें",
      "Preplanned Trips": "पूर्व-नियोजित यात्राएं",
      "Upcoming Journeys": "आगामी यात्राएं",
      "Language": "भाषा",
    }
  },
  fr: {
    translation: {
      "User Profile Page": "Page de profil utilisateur",
      "Personal user profile details": "Détails du profil, itinéraires planifiés et aperçu des voyages précédents.",
      "Hide Edit Form": "Masquer le formulaire",
      "Show Edit Form": "Afficher le formulaire",
      "Upload New Avatar Photo": "Télécharger une nouvelle photo",
      "EMAIL ADDRESS": "ADRESSE E-MAIL",
      "FULL NAME": "NOM COMPLET",
      "LANGUAGE PREFERENCE": "PRÉFÉRENCE DE LANGUE",
      "CURRENCY PREFERENCE": "PRÉFÉRENCE DE DEVISE",
      "Save Profile Changes": "Enregistrer les modifications",
      "Preplanned Trips": "Voyages planifiés",
      "Upcoming Journeys": "Voyages à venir",
      "Language": "Langue",
    }
  },
  de: {
    translation: {
      "User Profile Page": "Benutzerprofilseite",
      "Personal user profile details": "Persönliche Profildetails, geplante Reiserouten und Übersicht über frühere Reisen.",
      "Hide Edit Form": "Bearbeitungsformular ausblenden",
      "Show Edit Form": "Bearbeitungsformular anzeigen",
      "Upload New Avatar Photo": "Neues Avatar-Foto hochladen",
      "EMAIL ADDRESS": "E-MAIL-ADRESSE",
      "FULL NAME": "VOLLSTÄNDIGER NAME",
      "LANGUAGE PREFERENCE": "SPRACHPRÄFERENZ",
      "CURRENCY PREFERENCE": "WÄHRUNGSPRÄFERENZ",
      "Save Profile Changes": "Profiländerungen speichern",
      "Preplanned Trips": "Geplante Reisen",
      "Upcoming Journeys": "Anstehende Reisen",
      "Language": "Sprache",
    }
  },
  ja: {
    translation: {
      "User Profile Page": "ユーザープロフィールページ",
      "Personal user profile details": "個人のプロフィール詳細、予定された旅程、過去の旅行の概要。",
      "Hide Edit Form": "編集フォームを隠す",
      "Show Edit Form": "編集フォームを表示",
      "Upload New Avatar Photo": "新しいアバター写真をアップロード",
      "EMAIL ADDRESS": "メールアドレス",
      "FULL NAME": "氏名",
      "LANGUAGE PREFERENCE": "言語設定",
      "CURRENCY PREFERENCE": "通貨設定",
      "Save Profile Changes": "変更を保存",
      "Preplanned Trips": "予定された旅行",
      "Upcoming Journeys": "今後の旅行",
      "Language": "言語",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
