import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0c14] text-slate-400 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
          {/* Brand */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <img src="/Logo.png" alt="Logo" className="w-5 h-5 object-contain brightness-0 invert opacity-90" />
              <span className="text-base font-bold text-white">RiskAnalysis</span>
            </div>
            <p className="text-xs text-slate-500 leading-tight">
              Plataforma profesional de análisis y gestión de riesgos financieros para inversores modernos.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white text-xs font-semibold mb-2 uppercase tracking-wider">Enlaces Rápidos</h3>
            <ul className="space-y-1.5 flex flex-col">
              <Link to="/" className="text-xs hover:text-white transition-colors duration-200 w-fit">Inicio</Link>
              <Link to="/about" className="text-xs hover:text-white transition-colors duration-200 w-fit">Sobre Nosotros</Link>
              <Link to="/services" className="text-xs hover:text-white transition-colors duration-200 w-fit">Servicios</Link>
              <Link to="/blog" className="text-xs hover:text-white transition-colors duration-200 w-fit">Blog</Link>
              <Link to="/contact" className="text-xs hover:text-white transition-colors duration-200 w-fit">Contacto</Link>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-xs font-semibold mb-2 uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Cam. San Francisco de Paula, 19<br />38203 La Laguna, Santa Cruz de Tenerife</span>
              </li>
              <li className="flex items-center space-x-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span>+34 900 123 456</span>
              </li>
              <li className="flex items-center space-x-2 text-xs">
                <Mail className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span>contacto@riskanalysis.es</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white text-xs font-semibold mb-2 uppercase tracking-wider">Síguenos</h3>
            <div className="flex space-x-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors duration-200">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors duration-200">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors duration-200">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-400 transition-colors duration-200">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <p className="text-[11px] text-slate-500">
            &copy; 2026 Análisis de Riesgo Financiero. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <Link to="/privacy" className="hover:text-white transition-colors duration-200">Política de Privacidad</Link>
            <Link to="/terms" className="hover:text-white transition-colors duration-200">Términos y Condiciones</Link>
            <Link to="/cookies" className="hover:text-white transition-colors duration-200">Política de Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
