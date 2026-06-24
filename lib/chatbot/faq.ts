/**
 * Static FAQ content for the site chatbot.
 *
 * The chatbot no longer uses an LLM — instead it presents a fixed set of
 * suggested questions, grouped by category, each with a ready-made answer.
 * Answers are written from the actual site content (see lib/i18n/translations.ts
 * and the public pages). Assistant answers render as Markdown.
 */

export type FaqItem = { q: string; a: string }
export type FaqCategory = {
  id: string
  /** lucide-react icon name resolved in the widget */
  icon: string
  label: string
  items: FaqItem[]
}

type Locale = 'ar' | 'en'

export const FAQ: Record<Locale, FaqCategory[]> = {
  ar: [
    {
      id: 'about',
      icon: 'Building2',
      label: 'عن جاز',
      items: [
        {
          q: 'شنو هي منصة JAZ؟',
          a: 'جاز (Joint Annual Zone) هي منصة عراقية تربط الحكومة والشركات والأكاديميا والمهنيين بالمعارض والمؤتمرات الدولية والشركاء المؤسسيين.\n\nمنذ أكثر من عقد نعمل كبوابة استراتيجية تُسهّل المشاركة، تنظّم الوفود، وتبني تعاوناً طويل الأمد يقود النمو المستدام والأثر العالمي.',
        },
        {
          q: 'شنو رؤيتكم ورسالتكم؟',
          a: '**رؤيتنا:** أن نكون البوابة الأكثر ثقة في العراق نحو المعارض والمؤتمرات الدولية.\n\n**رسالتنا:** تنسيق المساحات الاستراتيجية التي يلتقي فيها المهنيون والشركات، وتمكينهم من خلق فرص نمو حقيقية.',
        },
        {
          q: 'وين مكاتبكم؟',
          a: 'عندنا ثلاث مكاتب استراتيجية تغطي العراق من الشمال للجنوب:\n\n- **البصرة** — المقر الرئيسي وبوابتنا إلى الخليج والتجارة الدولية.\n- **بغداد** — تربط قلب العراق بالفرص العالمية.\n- **أربيل** — تخدم إقليم كردستان والمحافظات الشمالية.',
        },
        {
          q: 'شنو قيم جاز؟',
          a: 'تقوم منصة جاز على خمس قيم:\n\n- **النزاهة** — نتصرف بصدق وشفافية.\n- **التميز** — نسعى لتحقيق الجودة دائماً.\n- **التعاون** — الشراكات تخلق تأثيراً أعظم.\n- **الابتكار** — نتبنى حلولاً جديدة.\n- **الأثر** — مدفوعون بنتائج ملموسة.',
        },
      ],
    },
    {
      id: 'events',
      icon: 'CalendarDays',
      label: 'الفعاليات',
      items: [
        {
          q: 'شلون أعرف الفعاليات القادمة؟',
          a: 'تكدر تشوف كل الفعاليات والمعارض القادمة من صفحة [الفعاليات](/events)، أو تستعرض الجدول الكامل عبر [تقويم الفعاليات](/calendar) وتفلتر حسب التصنيف والموقع.',
        },
        {
          q: 'شلون أسجل بفعالية؟',
          a: 'افتح صفحة الفعالية اللي تريدها من [قسم الفعاليات](/events)، واضغط على زر **سجّل الآن**، وبعد التأكيد راح يطلعلك **رقم تذكرة** — احتفظ بيه لتقديمه عند الدخول.',
        },
        {
          q: 'أكو فعاليات دولية ومحلية؟',
          a: 'نعم، نوفّر فعاليات **دولية** و**محلية**. تكدر تفلتر بينهن وتستكشف الأقسام الاستراتيجية من صفحة [الفعاليات](/events) أو [التقويم](/calendar).',
        },
        {
          q: 'هل التسجيل بالفعاليات مجاني؟',
          a: 'بعض الفعاليات **مجانية** وبعضها برسوم. السعر (إن وجد) يظهر بوضوح داخل صفحة كل فعالية قبل التسجيل.',
        },
      ],
    },
    {
      id: 'sectors',
      icon: 'LayoutGrid',
      label: 'الأقسام',
      items: [
        {
          q: 'شنو الأقسام الاستراتيجية عندكم؟',
          a: 'نركّز على أربعة أقسام استراتيجية:\n\n- **الرعاية الصحية وعلوم الحياة**\n- **التحول الرقمي والتكنولوجيا**\n- **التطوير الصناعي والتجاري**\n- **الشؤون المهنية والأكاديمية**\n\nتفاصيل كل قسم موجودة في صفحة [الأقسام](/departments).',
        },
        {
          q: 'ليش اخترتوا هذه الأقسام الأربعة؟',
          a: 'اختيرت الأقسام بناءً على معطيات الاقتصاد العراقي وطبيعة الطلب المحلي والشراكات الدولية المتاحة، لتشكّل معاً منظومة متكاملة تخدم التنمية المستدامة وتربط المؤسسات العراقية بالأسواق العالمية.',
        },
      ],
    },
    {
      id: 'partners',
      icon: 'Handshake',
      label: 'الشراكات',
      items: [
        {
          q: 'شلون أصير شريك ويا جاز؟',
          a: 'روح لصفحة [الشراكات](/partnership)، اختر نوع الشراكة المناسب، وبعدها تكدر تتواصل ويانا عبر البريد الإلكتروني أو تملأ استمارة التعاون ونرجعلك.',
        },
        {
          q: 'شنو أنواع الشراكات المؤسسية؟',
          a: 'نوفّر أربعة أنواع من الشراكات المؤسسية:\n\n- **الشراكات التجارية** — دعم المنتجات والخدمات المستدامة.\n- **الشراكات التسويقية** — ترويج مشترك للمبادرات.\n- **الدعم التقني** — حلول تقنية مبتكرة.\n- **المسؤولية الاجتماعية** — رعاية حملات التوعية والتدريب المجتمعي.',
        },
        {
          q: 'شلون أتطوع وياكم؟',
          a: 'نرحّب بالطاقات التطوعية! تكدر تنضم بأحد المجالات: **التصميم الجرافيكي**، **إدارة المشاريع**، **التسويق الرقمي**، **الدعم المجتمعي**، أو **تطوير الويب**. سجّل من صفحة [الشراكات](/partnership).',
        },
        {
          q: 'عندي فكرة مشروع مستدام، تكدرون تدعموني؟',
          a: 'أكيد! نساعد الأفراد والمؤسسات على تحويل الأفكار إلى مشاريع حقيقية تخدم البيئة والمجتمع. شارك فكرتك معنا من صفحة [الشراكات](/partnership) وراح نناقش كيفية دعمها وتطويرها.',
        },
      ],
    },
    {
      id: 'training',
      icon: 'GraduationCap',
      label: 'التدريب',
      items: [
        {
          q: 'أكو برامج تدريبية؟',
          a: 'نعم، نشتغل على باقة برامج تدريبية متخصصة مع خبراء معتمدين دولياً، وشهادات مهنية معتمدة، ومنهجية تطبيقية تفاعلية، ومرونة كاملة بالوقت. شوف التفاصيل بصفحة [التدريب](/training).',
        },
        {
          q: 'شلون أسجل بالتدريب؟',
          a: 'تكدر تسجّل مسبقاً عبر التواصل مع مستشار التدريب من صفحة [التدريب](/training)، وراح نخطّرك فور إطلاق البرامج لحجز مقعدك. متوفّر هم برامج مخصصة حسب احتياجكم.',
        },
      ],
    },
    {
      id: 'services',
      icon: 'Briefcase',
      label: 'الخدمات',
      items: [
        {
          q: 'شنو الخدمات اللي تقدمونها؟',
          a: 'نقدّم مسارات خدمية متكاملة، منها:\n\n- المشاركة في المعارض الدولية وإدارة الوفود.\n- دعم خطابات الدعوة والتنسيق القنصلي.\n- تنسيق اللقاءات الثنائية والمؤسسية.\n- تطوير الشراكات ودعم دخول السوق.\n- التنسيق بين الحكومة والشركات.\n\nالتفاصيل بصفحة [الخدمات](/services).',
        },
        {
          q: 'شنو خدمة دعم الدعوات؟',
          a: 'نوفّر خطابات دعوة رسمية للحصول على تأشيرة الدخول، وللفعاليات والمعارض والاجتماعات المؤسسية. تكدر تطلبها من صفحة [دعم الدعوات](/invitation-support) أو عبر [التواصل](/contact).',
        },
      ],
    },
    {
      id: 'contact',
      icon: 'Phone',
      label: 'التواصل',
      items: [
        {
          q: 'شلون أتواصل وياكم؟',
          a: 'تكدر تتواصل ويانا عبر:\n\n- **الهاتف:** 07719000600\n- **البريد الإلكتروني:** contact@jaz.iq\n- **نموذج التواصل:** صفحة [تواصل معنا](/contact)',
        },
        {
          q: 'شنو أوقات العمل وعناوينكم؟',
          a: '**ساعات العمل:** الأحد – الخميس، 8:30 صباحاً – 4:30 مساءً.\n\n**مكاتبنا:** البصرة (المقر الرئيسي)، بغداد، وأربيل. تفاصيل العناوين والخرائط بصفحة [تواصل معنا](/contact).',
        },
      ],
    },
  ],
  en: [
    {
      id: 'about',
      icon: 'Building2',
      label: 'About JAZ',
      items: [
        {
          q: 'What is the JAZ platform?',
          a: 'JAZ (Joint Annual Zone) is an Iraqi platform that connects government, businesses, academia, and professionals with international exhibitions, conferences, and institutional partners.\n\nFor over a decade we have served as a strategic gateway that facilitates participation, organizes delegations, and builds long-term cooperation driving sustainable growth and global impact.',
        },
        {
          q: 'What is your vision and mission?',
          a: '**Vision:** To be Iraq\'s most trusted gateway to international exhibitions and conferences.\n\n**Mission:** To curate the strategic spaces where professionals and companies meet, empowering them to create real growth opportunities.',
        },
        {
          q: 'Where are your offices?',
          a: 'We have three strategic offices covering Iraq from north to south:\n\n- **Basra** — our headquarters and gateway to the Gulf and international trade.\n- **Baghdad** — connecting the heart of Iraq with global opportunities.\n- **Erbil** — serving the Kurdistan Region and northern provinces.',
        },
        {
          q: 'What are JAZ\'s values?',
          a: 'JAZ is built on five values:\n\n- **Integrity** — we act with honesty and transparency.\n- **Excellence** — we always strive for quality.\n- **Collaboration** — partnerships create greater impact.\n- **Innovation** — we embrace new solutions.\n- **Impact** — driven by tangible results.',
        },
      ],
    },
    {
      id: 'events',
      icon: 'CalendarDays',
      label: 'Events',
      items: [
        {
          q: 'How do I find upcoming events?',
          a: 'You can browse all upcoming events and exhibitions on the [Events](/events) page, or view the full schedule in the [Events Calendar](/calendar) and filter by category and location.',
        },
        {
          q: 'How do I register for an event?',
          a: 'Open the event you want from the [Events](/events) page and click **Register Now**. After confirmation you\'ll receive a **ticket number** — keep it to present at the entrance.',
        },
        {
          q: 'Do you have international and local events?',
          a: 'Yes, we offer both **international** and **local** events. You can filter between them and explore the strategic divisions from the [Events](/events) page or the [Calendar](/calendar).',
        },
        {
          q: 'Is event registration free?',
          a: 'Some events are **free** and others require a fee. The price (if any) is clearly shown on each event\'s page before you register.',
        },
      ],
    },
    {
      id: 'sectors',
      icon: 'LayoutGrid',
      label: 'Divisions',
      items: [
        {
          q: 'What strategic divisions do you have?',
          a: 'We focus on four strategic divisions:\n\n- **Healthcare & Life Sciences**\n- **Digital Transformation & Technology**\n- **Industrial & Commercial Development**\n- **Professional & Academic Affairs**\n\nDetails for each are on the [Departments](/departments) page.',
        },
        {
          q: 'Why these four divisions?',
          a: 'They were selected based on Iraq\'s economic landscape, local demand signals, and available international partnerships — together forming an integrated ecosystem for sustainable development that links Iraqi institutions with global markets.',
        },
      ],
    },
    {
      id: 'partners',
      icon: 'Handshake',
      label: 'Partnerships',
      items: [
        {
          q: 'How can I become a partner?',
          a: 'Go to the [Partnership](/partnership) page, choose the partnership type that fits you, then reach out by email or fill out the collaboration form and we\'ll get back to you.',
        },
        {
          q: 'What types of corporate partnerships are there?',
          a: 'We offer four types of corporate partnerships:\n\n- **Commercial** — supporting sustainable products and services.\n- **Marketing** — joint promotion of initiatives.\n- **Technical Support** — innovative technology solutions.\n- **Social Responsibility** — sponsoring awareness campaigns and community training.',
        },
        {
          q: 'How can I volunteer with you?',
          a: 'We welcome volunteers! You can join in: **Graphic Design**, **Project Management**, **Digital Marketing**, **Community Support**, or **Web Development**. Register from the [Partnership](/partnership) page.',
        },
        {
          q: 'I have a sustainable project idea — can you support it?',
          a: 'Absolutely! We help individuals and institutions turn ideas into real projects that serve the environment and society. Share your idea via the [Partnership](/partnership) page and we\'ll discuss how to support and develop it.',
        },
      ],
    },
    {
      id: 'training',
      icon: 'GraduationCap',
      label: 'Training',
      items: [
        {
          q: 'Do you offer training programs?',
          a: 'Yes, we are preparing specialized training programs with internationally certified experts, accredited professional certificates, interactive hands-on methodology, and full schedule flexibility. See the [Training](/training) page for details.',
        },
        {
          q: 'How do I register for training?',
          a: 'You can pre-register by contacting a training advisor from the [Training](/training) page, and we\'ll notify you as soon as programs launch so you can reserve your seat. Custom programs tailored to your needs are also available.',
        },
      ],
    },
    {
      id: 'services',
      icon: 'Briefcase',
      label: 'Services',
      items: [
        {
          q: 'What services do you provide?',
          a: 'We provide integrated service tracks, including:\n\n- International exhibition participation and delegation management.\n- Invitation letter support and consular coordination.\n- B2B and institutional matchmaking.\n- Partnership development and market-entry support.\n- Government & business liaison.\n\nFull details on the [Services](/services) page.',
        },
        {
          q: 'What is the invitation support service?',
          a: 'We issue official invitation letters for entry visas, events, exhibitions, and institutional meetings. You can request one from the [Invitation Support](/invitation-support) page or via [Contact](/contact).',
        },
      ],
    },
    {
      id: 'contact',
      icon: 'Phone',
      label: 'Contact',
      items: [
        {
          q: 'How can I contact you?',
          a: 'You can reach us via:\n\n- **Phone:** 07719000600\n- **Email:** contact@jaz.iq\n- **Contact form:** the [Contact Us](/contact) page',
        },
        {
          q: 'What are your working hours and locations?',
          a: '**Working hours:** Sunday – Thursday, 8:30 AM – 4:30 PM.\n\n**Offices:** Basra (HQ), Baghdad, and Erbil. Full addresses and maps are on the [Contact Us](/contact) page.',
        },
      ],
    },
  ],
}
