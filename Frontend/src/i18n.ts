import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Welcome': 'Welcome',
      'Settings': 'Settings',
      'Profile': 'Profile',
      'Students': 'Students',
      'Teachers': 'Teachers',
      'Report Cards': 'Report Cards',
      'Homework': 'Homework',
      'Classes': 'Classes',
      'Creativity Board': 'Creativity Board',
      'Dashboard': 'Dashboard',
      'Language': 'Language',
      'Theme': 'Theme',
      'Light': 'Light',
      'Dark': 'Dark',
      'System': 'System',
      'Save': 'Save',
      'Sign In': 'Sign In',
      'Email': 'Email',
      'Password': 'Password',
      'Logout': 'Logout',
      // Add more keys as needed
    }
  },
  es: {
    translation: {
      'Welcome': 'Bienvenido',
      'Settings': 'Configuración',
      'Profile': 'Perfil',
      'Students': 'Estudiantes',
      'Teachers': 'Profesores',
      'Report Cards': 'Boletines',
      'Homework': 'Tarea',
      'Classes': 'Clases',
      'Creativity Board': 'Tablero Creativo',
      'Dashboard': 'Panel',
      'Language': 'Idioma',
      'Theme': 'Tema',
      'Light': 'Claro',
      'Dark': 'Oscuro',
      'System': 'Sistema',
      'Save': 'Guardar',
      'Sign In': 'Iniciar sesión',
      'Email': 'Correo electrónico',
      'Password': 'Contraseña',
      'Logout': 'Cerrar sesión',
      // Add more keys as needed
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 