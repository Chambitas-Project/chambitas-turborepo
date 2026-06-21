export default function Header() {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shadow-sm shrink-0">
      <h1 className="font-semibold text-lg flex items-center">
        Dashboard
      </h1>
      <div className="flex items-center space-x-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium border border-green-500/20">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
        ML-Engine: ONLINE
      </div>
    </header>
  );
}
