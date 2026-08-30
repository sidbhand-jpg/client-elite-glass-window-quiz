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
    eyebrow: "Recent projects",
    headline: "See Our Work Around Greater Seattle",
    subheadline: "Browse completed projects by the Elite Glass & Window team.",
    items: [
      { title: "Frameless Shower Door", location: "Bellevue, WA", image: "/assets/projects/project_1.jpg", alt: "Elite Glass & Window frameless shower door installation in Bellevue" },
      { title: "Front Door Replacement", location: "Bothell, WA", image: "/assets/projects/frontdoor_main.jpg", alt: "Elite Glass & Window front door replacement in Bothell" },
      { title: "Glass Staircase Railing", location: "Medina, WA", image: "/assets/projects/stair_medina_main.jpg", alt: "Elite Glass & Window glass staircase railing replacement in Medina" },
      { title: "Whole-Home Window Replacement", location: "Redmond, WA", image: "/assets/projects/window_redmond_main.jpg", alt: "Elite Glass & Window home window replacement in Redmond" },
      { title: "Custom Wall Mirror", location: "Kirkland, WA", image: "/assets/projects/mirror_kirkland_main.jpg", alt: "Elite Glass & Window custom wall mirror installation in Kirkland" },
      { title: "Sliding Patio Door", location: "Redmond, WA", image: "/assets/projects/patiodoor_redmond_main.jpg", alt: "Elite Glass & Window sliding patio door installation in Redmond" }
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
    body: "Be on the lookout for a call from our team in the next few minutes.",
    callPrompt: "Prefer to talk now? Call us:",
    callLabel: "Call (425) 890-8233"
  },

  // Add live values before launch. Empty values safely disable these integrations.
  clarityId: "yadrhyi60g",
  metaPixelId: "",
  webhookUrl: "",
  smsConsentText: "I agree to receive SMS messages from {businessName} about my estimate request. Message & data rates may apply. Reply STOP to unsubscribe or HELP for help.",
  footerLinks: [
    { label: "Privacy Policy", href: "https://eliteglassandwindow.com/privacy-policy.html" },
    { label: "Terms of Use", href: "https://eliteglassandwindow.com/terms.html" }
  ]
};
