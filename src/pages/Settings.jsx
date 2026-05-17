import { User, Bell, Shield, Paintbrush, Database, Sparkles } from "lucide-react";

export function Settings() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-text-muted">Manage your account, preferences, and AI configurations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          {[
            { label: "Account Profile", icon: User, active: true },
            { label: "Notifications", icon: Bell },
            { label: "Privacy & Security", icon: Shield },
            { label: "Appearance", icon: Paintbrush },
            { label: "AI Preferences", icon: Sparkles },
            { label: "Data Management", icon: Database },
          ].map((item, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                item.active 
                  ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20" 
                  : "text-text-muted hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          <div className="premium-card p-8">
            <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-teal p-0.5">
                <img 
                  src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent" 
                  alt="Profile" 
                  className="w-full h-full rounded-full bg-card"
                />
              </div>
              <div>
                <button className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors border border-white/5 mb-2">
                  Change Avatar
                </button>
                <p className="text-sm text-text-muted">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">First Name</label>
                <input 
                  type="text" 
                  defaultValue="Alex"
                  className="w-full bg-base border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-teal transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Last Name</label>
                <input 
                  type="text" 
                  defaultValue="Carter"
                  className="w-full bg-base border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-teal transition-colors"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-text-muted">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="alex@example.com"
                  className="w-full bg-base border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-accent-teal transition-colors"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button className="bg-gradient-teal hover:bg-teal-500 text-card font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
