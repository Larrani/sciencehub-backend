import { Atom } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    navigation: [
      { href: "#", label: "Home" },
      { href: "#", label: "Articles" },
      { href: "#", label: "Videos" },
      { href: "#", label: "Categories" },
    ],
    legal: [
      { href: "#", label: "About" },
      { href: "#", label: "Contact" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  };

  const socialLinks = [
    { href: "#", icon: "🐦", label: "Twitter" },
    { href: "#", icon: "📘", label: "Facebook" },
    { href: "#", icon: "💼", label: "LinkedIn" },
    { href: "#", icon: "📺", label: "YouTube" },
  ];

  return (
    <footer className="bg-black border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Atom className="h-8 w-8 text-blue-500" />
              <h3 className="text-xl font-bold text-white">ScienceHeaven</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Your gateway to fascinating science content and cutting-edge research discoveries.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.navigation.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Connect</h4>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.label}
                  href={social.href} 
                  className="text-gray-400 hover:text-white transition-colors text-xl"
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 ScienceHeaven. All rights reserved. Made with ❤️ for science enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
