export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 bg-blue-600 rounded"></div>
          <span className="text-xl font-bold text-gray-900">PDFstripper.com</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Features
          </a>
          <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Pricing
          </a>
          <a href="#help" className="text-sm font-medium text-gray-600 hover:text-blue-600">
            Help
          </a>
        </nav>
        
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign In
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
