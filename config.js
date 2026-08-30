// ELITE GLASS & WINDOW QUIZ FUNNEL — CONFIG
window.CONFIG = {
  businessName: "Elite Glass & Window",
  tagline: "Custom Glass, Windows & Doors for Greater Seattle",
  phone: "+1 (425) 890-8233",
  businessHours: "Call for current showroom hours",
  logoUrl: "/assets/logo.svg",
  logoAlt: "Elite Glass & Window logo",

  colors: {
    primary: "#004080",
    primaryDark: "#002F5F",
    primaryLight: "#2B6EA6",
    bg: "#F7FAFC",
    surface: "#FFFFFF",
    text: "#1C2333",
    textMuted: "#667085",
    border: "#D9E2EC",
    success: "#16845B",
    landerGradFrom: "#F7FAFC",
    landerGradTo: "#DCEAF5"
  },
  headingFont: "Sora",
  bodyFont: "Inter",

  lander: {
    badge: "Free Glass & Window Estimate — No Obligation",
    headline: "Plan Your Glass or Window Project in 60 Seconds",
    subheadline: "Tell us what you want to improve and Elite Glass & Window will help you plan the right solution for your space.",
    bulletPoints: [
      "✓ Residential and commercial expertise",
      "✓ Custom-measured solutions",
      "✓ Serving Greater Seattle from Redmond"
    ],
    ctaLabel: "Get My Free Estimate →",
    crewImageUrl: "/assets/elite-glass-hero.png",
    crewImageAlt: "Contemporary Greater Seattle home with custom windows and glass",
    trustNote: "Local glass, window, and door specialists"
  },

  gallery: {
    eyebrow: "Recent project inspiration",
    headline: "See What Is Possible for Your Space",
    subheadline: "Explore the types of custom glass and window projects our team can help you plan.",
    items: [
      { title: "Window Replacement", image: "/assets/window-replacement.png", alt: "Bright home interior with replacement windows" },
      { title: "Shower Enclosures", image: "/assets/shower-enclosure.png", alt: "Modern custom glass shower enclosure" },
      { title: "Custom Glass & Mirrors", image: "/assets/custom-glass-mirror.png", alt: "Custom glass and mirror installation" },
      { title: "Railings & Storefronts", image: "/assets/glass-railing-storefront.png", alt: "Architectural glass railing and storefront work" }
    ]
  },

  reviews: {
    eyebrow: "Google reviews",
    headline: "Choose a Local Team with Confidence",
    subheadline: "Here are a few recent experiences shared by Elite Glass & Window customers.",
    rating: "4.8",
    reviewCount: 42,
    items: [
      {
        name: "Ting Cui",
        initials: "TC",
        contributor: "2 reviews · 1 photo",
        date: "a month ago",
        text: "Had a great experience working with Elite Glass! They did a fantastic job with our custom window order and installation. The team was professional, punctual, and left everything super clean. Highly recommend!"
      },
      {
        name: "Pepper Jia Chen",
        initials: "PC",
        contributor: "5 reviews · 12 photos",
        date: "a month ago",
        text: "Very professional and knowledgeable team. The owner provided an accurate quote and a well-planned solution. The installation quality was excellent, with great attention to detail, and the project was completed on schedule. Highly recommend!"
      },
      {
        name: "an weimeng",
        initials: "AW",
        contributor: "2 reviews · 2 photos",
        date: "2 years ago",
        text: "Through a friend's recommendation, I chose this company. The sliding glass door in my backyard was broken, and they promptly came to measure, provided a clear and reasonable quote, without any additional hidden fees. I'm very satisfied. The installation workers were very diligent and responsible."
      }
    ]
  },

  questions: [
    {
      id: "project_type",
      progress: "Question 1 of 5",
      question: "What glass or window project do you need?",
      type: "image-grid",
      options: [
        { label: "Window replacement", icon: "panels-top-left", image: "/assets/window-replacement.png" },
        { label: "Shower enclosure", icon: "bath", image: "/assets/shower-enclosure.png" },
        { label: "Custom glass or mirror", icon: "scan-line", image: "/assets/custom-glass-mirror.png" },
        { label: "Glass railing or storefront", icon: "store", image: "/assets/glass-railing-storefront.png" }
      ]
    },
    {
      id: "property_type",
      progress: "Question 2 of 5",
      question: "What type of property is this for?",
      type: "button-list",
      options: [
        { label: "Single-family home", icon: "house" },
        { label: "Condo or apartment", icon: "building-2" },
        { label: "Commercial property", icon: "briefcase-business" },
        { label: "New construction", icon: "hammer" }
      ]
    },
    {
      id: "top_priority",
      progress: "Question 3 of 5",
      question: "What matters most for this project?",
      type: "button-list",
      options: [
        { label: "Energy efficiency", icon: "leaf" },
        { label: "Repair or replacement", icon: "refresh-cw" },
        { label: "A modern look", icon: "sparkles" },
        { label: "Safety and security", icon: "shield-check" }
      ]
    },
    {
      id: "timeline",
      progress: "Question 4 of 5",
      question: "When would you like to begin?",
      type: "button-list",
      options: [
        { label: "As soon as possible", icon: "zap" },
        { label: "Within 1 month", icon: "calendar-days" },
        { label: "Within 3 months", icon: "calendar-clock" },
        { label: "Just researching", icon: "search" }
      ]
    },
    {
      id: "budget",
      progress: "Question 5 of 5",
      question: "What investment range are you considering?",
      type: "button-list",
      options: [
        { label: "Under $2,500", icon: "wallet" },
        { label: "$2,500 – $7,500", icon: "banknote" },
        { label: "$7,500 – $15,000", icon: "circle-dollar-sign" },
        { label: "$15,000+", icon: "badge-dollar-sign" }
      ]
    }
  ],

  form: {
    eyebrow: "Almost done!",
    headline: "Where should we send your free estimate details?",
    subtext: "We’ll review your project and contact you within 1 business day.",
    zipPlaceholder: "ZIP code",
    fields: [
      { name: "name", placeholder: "First & last name", type: "text", required: true },
      { name: "email", placeholder: "Email address", type: "email", required: true },
      { name: "phone", placeholder: "Phone number", type: "tel", required: true }
    ],
    ctaLabel: "Request My Free Estimate →",
    privacyText: "We respect your privacy. No spam, ever."
  },

  thankYou: {
    headline: "Your request is in!",
    body: "Elite Glass & Window received your project details and will be in touch within 1 business day.",
    callPrompt: "Prefer to talk now? Call us:",
    callLabel: "Call (425) 890-8233"
  },

  // Add live values before launch. Empty values safely disable these integrations.
  clarityId: "",
  metaPixelId: "",
  webhookUrl: "",
  smsConsentText: "I agree to receive SMS messages from {businessName} about my estimate request. Message & data rates may apply. Reply STOP to unsubscribe or HELP for help.",
  footerLinks: [
    { label: "Privacy Policy", href: "https://eliteglassandwindow.com/privacy-policy.html" },
    { label: "Terms of Use", href: "https://eliteglassandwindow.com/terms.html" }
  ]
};
