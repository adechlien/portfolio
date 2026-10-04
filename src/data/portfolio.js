export const tabs = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export const profile = {
  name: "Alejandro J. Hernández P.",
  role: "Frontend Developer",
  photo: "/me.jpg",
  photoAlt: "Alejandro J. Hernandez P.",
  links: [
    {
      href: "https://www.linkedin.com/in/adechlien/",
      icon: "brand-linkedin",
      label: "LinkedIn",
    },
    {
      href: "/alejandro-hernandez-cv.pdf",
      icon: "file-cv",
      label: "Download CV",
      download: true,
    },
    {
      href: "https://github.com/adechlien",
      icon: "brand-github",
      label: "GitHub",
    },
  ],
};

export const about = {
  title: "About",
  paragraphs: [
    [
      { text: "Systems Engineering student at Universidad del Norte in Colombia. UX/UI are my thing, so I specialize in Frontend development. Out of the code, I really enjoy playing tennis and learning about cinema." },
    ],
  ],
  location: {
    label: "Barranquilla, Colombia",
    href: "https://www.google.com/maps/place/Barranquilla,+Colombia",
  },
};

export const techColors = {
  html5: "text-adech-sunny-2",
  css3: "text-adech-boulevard-3",
  javascript: "text-adech-sunny-1",
  typescript: "text-adech-boulevard-4",
  tailwind: "text-adech-boulevard-1",
  astro: "text-adech-sunny-3",
  react: "text-adech-boulevard-3",
  "react-native": "text-adech-boulevard-3",
  expo: "text-adech-boulevard-2",
  nativewind: "text-adech-boulevard-1",
  npm: "text-adech-sunny-3",
  nodejs: "text-adech-venomous-1",
  express: "text-adech-boulevard-2",
  postgresql: "text-adech-boulevard-4",
  git: "text-adech-sunny-3",
  docker: "text-adech-boulevard-4",
  figma: "text-adech-venomous-5",
  "adobe-illustrator": "text-adech-sunny-2",
};

export const techIcons = {
  "react-native": "brand-react-native",
  expo: "brand-expo",
  nativewind: "brand-tailwind",
};

export const skillGroups = [
  { title: "UX/UI", colorClass: "text-[#d0bfff]", items: [{ label: "Figma", icon: "brand-figma" }] },
  { title: "Frontend", colorClass: "text-[#eebefa]", items: [
    { label: "HTML", icon: "brand-html5" },
    { label: "CSS", icon: "brand-css3" },
    { label: "JavaScript", icon: "brand-javascript" },
    { label: "TypeScript", icon: "brand-typescript" },
    { label: "TailwindCSS", icon: "brand-tailwind" },
    { label: "AstroJS", icon: "brand-astro" },
    { label: "ReactJS", icon: "brand-react" },
  ] },
  { title: "Backend", colorClass: "text-[#fcc2d7]", items: [{ label: "NodeJS", icon: "brand-nodejs" }] },
  { title: "Databases", colorClass: "text-[#ffd8a8]", items: [
    { label: "MySQL", icon: "brand-mysql" },
    { label: "PostgreSQL", icon: "database" },
    { label: "MongoDB", icon: "brand-mongodb" },
  ] },
  { title: "DevOps", colorClass: "text-[#ffec99]", items: [
    { label: "Docker", icon: "brand-docker" },
    { label: "Git", icon: "brand-git" },
  ] },
];

export const projects = [
  {
    name: "Benjamín",
    logo: "/leggiamo-icon.svg",
    favicon: "https://adechlien.blog/favicon.svg",
    href: "https://adechlien.blog/",
    desc: "My personal blog",
    tech: [
      { label: "Astro", className: "text-adech-sunny-2" },
      { label: "Tailwind", className: "text-adech-boulevard-3" },
      { label: "SQLite", className: "text-adech-boulevard-2" },
    ],
  },
  {
    name: "Adech",
    logo: "/adech-logo.svg",
    favicon: "https://adechthemes.vercel.app/adech-logo.svg",
    href: "https://adechthemes.vercel.app/",
    desc: "Color ecosystem",
    tech: [
      { label: "React", className: "text-adech-sunny-1" },
      { label: "Tailwind", className: "text-adech-boulevard-3" },
      { label: "NPM", className: "text-adech-sunny-3" },
    ],
  },
];

export const contact = {
  title: "Contact",
  action: "https://formspree.io/f/xwvrvyve",
  subject: "New portfolio message",
  fields: {
    name: {
      label: "Name",
      placeholder: "Your name",
    },
    email: {
      label: "Email",
      placeholder: "you@email.com",
    },
    message: {
      label: "Message",
      placeholder: "Write your message...",
    },
  },
  submitLabel: "Send message",
  sendingLabel: "Sending...",
  successMessage: "Message sent successfully.",
  errorMessage: "Something went wrong. Please try again.",
  connectionErrorMessage: "Connection error. Please try again.",
};
