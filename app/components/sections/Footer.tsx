// app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-slate-950 text-gray-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-bold text-white mb-4">GameZone</h4>
            <p className="text-sm">Your ultimate gaming platform</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Games</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-purple-400">
                  Browse Games
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  New Releases
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-purple-400">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-purple-400">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-purple-400">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm">
          <p>&copy; 2026 GameZone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
