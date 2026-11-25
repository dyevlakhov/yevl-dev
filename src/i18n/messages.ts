import type { Locale } from './locales';
import type { Theme } from '@/lib/theme';

export type TerminalCommand =
  | 'help'
  | 'whoami'
  | 'experience'
  | 'stack'
  | 'contact'
  | 'email'
  | 'cv'
  | 'github'
  | 'linkedin'
  | 'goto'
  | 'lang'
  | 'theme'
  | 'clear';

type SectionCopy = { title: string; subtitle: string };

export type Messages = {
  nav: {
    label: string;
    expertise: string;
    work: string;
    experience: string;
    contact: string;
    otherLocale: string;
    /** Shown instead of otherLocale below 640px. */
    otherLocaleShort: string;
  };
  sections: {
    expertise: SectionCopy;
    work: SectionCopy;
    experience: SectionCopy;
    how: SectionCopy;
    contact: SectionCopy;
  };
  see: string;
  career: { label: string };
  where: string;
  kv: { file: string; status: string; focus: string; stack: string; education: string };
  actions: { email: string; cv: string; unityCase: string; linkedin: string; github: string };
  contactComment: string;
  contact: {
    copy: string;
    copied: string;
    announce: string;
    fallback: string;
    fallbackMac: string;
    /** Touch-only devices have no copy shortcut. */
    fallbackTouch: string;
    /** Subject of the draft opened by "Email me". */
    subject: string;
    /** Shown after "Email me": the address is copied in case no mail app opens. */
    ctaCopied: string;
    open: string;
    download: string;
  };
  cases: { read: string; collapse: string; result: string };
  diagrams: Record<'architecture' | 'decisions' | 'release', { file: string; label: string }>;
  terminal: {
    label: string;
    inputLabel: string;
    hint: string;
    helpHeader: string;
    help: Record<TerminalCommand, string>;
    notFound: string;
    copied: string;
    copyFailed: string;
    newTab: string;
    opening: string;
    gotoUsage: string;
    going: string;
    theme: string;
    themeSet: string;
    themeUsage: string;
    lang: string;
    hirePassword: string;
    hireGranted: string;
    matches: string;
  };
  newTab: string;
  footer: string;
  /** Footer privacy note (details/summary). */
  privacy: { label: string; body: string };
  theme: { group: string; names: Record<Theme, string>; option: string };
  skip: string;
};

export const messages: Record<Locale, Messages> = {
  en: {
    nav: {
      label: 'Primary',
      expertise: 'expertise',
      work: 'work',
      experience: 'experience',
      contact: 'contact',
      otherLocale: 'Українською',
      otherLocaleShort: 'UK',
    },
    sections: {
      expertise: {
        title: 'expertise',
        subtitle: 'Six areas, each backed by shipped work.',
      },
      work: { title: 'work', subtitle: 'Selected projects. Each covers several areas.' },
      experience: { title: 'experience', subtitle: 'Roles and dates, newest first.' },
      how: { title: 'how I work', subtitle: 'Three habits behind the work above.' },
      contact: {
        title: 'Hiring a senior full-stack engineer?',
        subtitle: 'Email is the fastest way to reach me.',
      },
    },
    see: 'see:',
    career: { label: 'Career' },
    where: 'where:',
    kv: {
      file: 'profile.yaml',
      status: 'status',
      focus: 'focus',
      stack: 'stack',
      education: 'education',
    },
    actions: {
      email: 'Email me',
      cv: 'Download CV (PDF)',
      unityCase: 'View Unity case study',
      linkedin: 'linkedin',
      github: 'github',
    },
    contactComment: '// contact',
    contact: {
      copy: 'copy',
      copied: 'copied ✓',
      announce: 'Email address copied',
      fallback: 'Press Ctrl+C to copy',
      fallbackMac: 'Press ⌘C to copy',
      fallbackTouch: 'Address selected: tap and hold it to copy',
      subject: 'Senior full-stack role',
      ctaCopied: 'Address copied. If no mail app opened, paste it into a new email.',
      open: 'open',
      download: 'download',
    },
    cases: { read: 'read the case', collapse: 'collapse', result: 'Result:' },
    diagrams: {
      architecture: {
        file: 'architecture.svg',
        label:
          'Diagram: dashboards call the API; the API hands slow work to an SQS queue and a worker, and talks to another service over gRPC; Terraform and CI/CD underneath.',
      },
      decisions: {
        file: 'decisions.log',
        label:
          'Commit log: the web client was frozen in favour of Expo, AI recipe generation was added, decisions are kept as ADRs, and backup restore is tested.',
      },
      release: {
        file: 'release.yml',
        label: 'Pipeline: test, then build, then release to the App Store and Google Play.',
      },
    },
    terminal: {
      label: 'Terminal',
      inputLabel: 'Terminal command',
      hint: 'Type help and press Enter. Open: / or Ctrl+K. Leave: Esc.',
      helpHeader: 'Available commands:',
      help: {
        help: 'show this list',
        whoami: 'who I am, in three lines',
        experience: 'roles and years',
        stack: 'technologies I work with',
        contact: 'all contact links',
        email: 'copy my email address',
        cv: 'open the CV (PDF)',
        github: 'open GitHub',
        linkedin: 'open LinkedIn',
        goto: 'jump to a section: goto work',
        lang: 'switch to Ukrainian',
        theme: 'switch theme: theme vice | dark | light',
        clear: 'clear the output',
      },
      notFound: 'command not found: {cmd}. Type help to see commands.',
      copied: 'Copied {email} to the clipboard.',
      copyFailed: 'Could not copy. The address is {email}',
      newTab: '(opens in a new tab)',
      opening: 'Opening {target}...',
      gotoUsage:
        'usage: goto expertise | work | experience | contact | unity | meal-planner | career-pro',
      going: 'Jumping to #{id}.',
      theme: 'Switching theme.',
      themeSet: 'Theme: {name}.',
      themeUsage: 'usage: theme vice | dark | light',
      lang: 'Switching to Ukrainian.',
      hirePassword: '[sudo] password for recruiter: ********',
      hireGranted: 'Permission granted. Opening email...',
      matches: 'Matches: {list}',
    },
    newTab: '(opens in a new tab)',
    footer: 'Next.js · Vercel',
    privacy: {
      label: 'Privacy',
      body: 'This site sets no cookies and has no forms or accounts. Vercel Web Analytics and Speed Insights count visits and measure page speed anonymously: page, referrer, country, browser, device type and load metrics. Vercel hosts the site and processes request data such as IP addresses to serve it. Your theme choice is stored only in your browser. If you email me, I use your address only to reply.',
    },
    theme: {
      group: 'Theme',
      names: { vice: 'vice', dark: 'dark', light: 'light' },
      option: '{name} theme',
    },
    skip: 'Skip to content',
  },
  uk: {
    nav: {
      label: 'Основна навігація',
      expertise: 'експертиза',
      work: 'проєкти',
      experience: 'досвід',
      contact: 'контакти',
      otherLocale: 'English',
      otherLocaleShort: 'EN',
    },
    sections: {
      expertise: {
        title: 'експертиза',
        subtitle: 'Шість напрямів, кожен підтверджений реальною роботою.',
      },
      work: { title: 'проєкти', subtitle: 'Вибрані проєкти. Кожен охоплює кілька напрямів.' },
      experience: { title: 'досвід', subtitle: 'Посади й дати, від нових до старих.' },
      how: { title: 'як я працюю', subtitle: 'Три звички, що стоять за роботою вище.' },
      contact: {
        title: 'Шукаєте senior full-stack інженера?',
        subtitle: 'Найшвидше зі мною зв’язатися поштою.',
      },
    },
    see: 'див.:',
    career: { label: 'Кар’єра' },
    where: 'де:',
    kv: {
      file: 'profile.yaml',
      status: 'статус',
      focus: 'фокус',
      stack: 'стек',
      education: 'освіта',
    },
    actions: {
      email: 'Написати на email',
      cv: 'Завантажити CV (PDF)',
      unityCase: 'Переглянути кейс Unity',
      linkedin: 'linkedin',
      github: 'github',
    },
    contactComment: '// контакти',
    contact: {
      copy: 'копіювати',
      copied: 'скопійовано ✓',
      announce: 'Адресу скопійовано',
      fallback: 'Натисніть Ctrl+C, щоб скопіювати',
      fallbackMac: 'Натисніть ⌘C, щоб скопіювати',
      fallbackTouch: 'Адресу виділено: утримуйте її, щоб скопіювати',
      subject: 'Роль senior full-stack інженера',
      ctaCopied:
        'Адресу скопійовано. Якщо поштова програма не відкрилася, вставте її в новий лист.',
      open: 'відкрити',
      download: 'завантажити',
    },
    cases: { read: 'читати кейс', collapse: 'згорнути', result: 'Результат:' },
    diagrams: {
      architecture: {
        file: 'architecture.svg',
        label:
          'Схема: дашборди звертаються до API; API передає повільну роботу в чергу SQS і обробник та спілкується з іншим сервісом через gRPC; під ними Terraform і CI/CD.',
      },
      decisions: {
        file: 'decisions.log',
        label:
          'Журнал комітів: вебклієнт заморожено на користь Expo, додано AI-генерацію рецептів, рішення зберігаються як ADR, відновлення з бекапу перевірено.',
      },
      release: {
        file: 'release.yml',
        label: 'Пайплайн: тести, потім збірка, потім реліз в App Store і Google Play.',
      },
    },
    terminal: {
      label: 'Термінал',
      inputLabel: 'Команда терміналу',
      hint: 'Введіть help і натисніть Enter. Відкрити: / або Ctrl+K. Вийти: Esc.',
      helpHeader: 'Доступні команди:',
      help: {
        help: 'показати цей список',
        whoami: 'хто я, у трьох рядках',
        experience: 'посади й роки',
        stack: 'технології, з якими працюю',
        contact: 'усі контакти',
        email: 'скопіювати мою пошту',
        cv: 'відкрити CV (PDF)',
        github: 'відкрити GitHub',
        linkedin: 'відкрити LinkedIn',
        goto: 'перейти до розділу: goto work',
        lang: 'перемкнути на англійську',
        theme: 'змінити тему: theme vice | dark | light',
        clear: 'очистити вивід',
      },
      notFound: 'команду не знайдено: {cmd}. Введіть help, щоб побачити команди.',
      copied: 'Скопійовано {email} у буфер обміну.',
      copyFailed: 'Не вдалося скопіювати. Адреса: {email}',
      newTab: '(відкриється в новій вкладці)',
      opening: 'Відкриваю {target}...',
      gotoUsage:
        'використання: goto expertise | work | experience | contact | unity | meal-planner | career-pro',
      going: 'Переходжу до #{id}.',
      theme: 'Перемикаю тему.',
      themeSet: 'Тема: {name}.',
      themeUsage: 'використання: theme vice | dark | light',
      lang: 'Перемикаю на англійську.',
      hirePassword: '[sudo] пароль для рекрутера: ********',
      hireGranted: 'Доступ надано. Відкриваю пошту...',
      matches: 'Збіги: {list}',
    },
    newTab: '(відкриється в новій вкладці)',
    footer: 'Next.js · Vercel',
    privacy: {
      label: 'Приватність',
      body: 'Сайт не встановлює cookie і не має форм чи акаунтів. Vercel Web Analytics і Speed Insights анонімно рахують відвідування та вимірюють швидкість сторінки: сторінка, джерело переходу, країна, браузер, тип пристрою і метрики завантаження. Vercel хостить сайт і обробляє дані запитів, як-от IP-адреси, щоб його показувати. Вибрана тема зберігається лише у вашому браузері. Якщо ви напишете мені, я використаю вашу адресу лише для відповіді.',
    },
    theme: {
      group: 'Тема',
      names: { vice: 'vice', dark: 'темна', light: 'світла' },
      option: 'тема «{name}»',
    },
    skip: 'Перейти до змісту',
  },
};
