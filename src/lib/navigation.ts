import { LayoutDashboard, Gem, Github, Twitter, Linkedin } from "lucide-react";

// For the main header navigation
export const mainNavLinks = [
  { href: "/about", label: "About" },
  { href: "/plans", label: "Plans" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

// For the top section of the logged-in sidebar
export const sidebarInfoLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

// For the main section of the logged-in sidebar
export const sidebarDashboardLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/plans",
    label: "Plans",
    icon: Gem,
  },
];

export const footerContent = {
  platformLinks: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/plans", label: "Pricing" },
    { href: "/dashboard", label: "Create Vision" },
  ],
  companyLinks: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
  socialLinks: [
    { href: "#", label: "Twitter", icon: Twitter },
    { href: "#", label: "GitHub", icon: Github },
    { href: "#", label: "LinkedIn", icon: Linkedin },
  ],
};
