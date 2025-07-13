import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Search, BookOpen, Download, ShoppingCart, Star, Users, Shield, CheckCircle, Menu, X } from 'lucide-react'
import './App.css'
import heroBg from './assets/hero-bg.jpg'

// Define the base URL for your Flask API
const API_BASE_URL = 'https://bookshelfhub.pythonanywhere.com';

function App() {
  const [books, setBooks] = useState([]);
  const [settings, setSettings] = useState({}); // State for website settings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Genres can still be hardcoded or fetched from an API if you have a /genres endpoint
  const genres = ['All', 'Modern Fiction', 'Science Fiction', 'Romance', 'Business', 'Mystery', 'Self-Help', 'Health & Fitness', 'Biography', 'History', 'Technology'];

  // useEffect hook to fetch books AND settings from the Flask API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch books
        const booksResponse = await axios.get(`${API_BASE_URL}/books`);
        if (booksResponse.data.success) {
          setBooks(booksResponse.data.books);
        } else {
          setError(booksResponse.data.error || 'Failed to fetch books');
        }

        // Fetch settings
        const settingsResponse = await axios.get(`${API_BASE_URL}/settings`);
        if (settingsResponse.data.success) {
          const fetchedSettings = {};
          for (const key in settingsResponse.data.settings) {
            fetchedSettings[key] = settingsResponse.data.settings[key].value;
          }
          setSettings(fetchedSettings);
        } else {
          setError(prev => prev ? prev + '; Failed to fetch settings' : 'Failed to fetch settings');
          console.error('Failed to fetch settings:', settingsResponse.data.error);
        }

      } catch (err) {
        setError('Error fetching data: ' + err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on component mount

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || book.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  // Function to render the book grid based on loading/error/data state
  const renderBookGrid = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-slate-600">Loading books...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-red-500">Error: {error}</p>
        </div>
      );
    }
    if (filteredBooks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-slate-600">No books found matching your criteria.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={book.image_filename ? `${API_BASE_URL}/static/uploads/${book.image_filename}` : 'https://placehold.co/300x400/cccccc/333333?text=No+Image'}
                alt={book.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400/cccccc/333333?text=Image+Error'; }}
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-slate-800 line-clamp-2">{book.title}</CardTitle>
                  <CardDescription className="text-slate-600 mt-1">by {book.author}</CardDescription>
                </div>
                <Badge variant="secondary" className="ml-2">{book.genre}</Badge>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium">{book.rating}</span>
                </div>
                <span className="text-sm text-slate-500">({book.reviews} reviews)</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm line-clamp-3">{book.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {book.content_locker_link && (
                <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                  <a href={book.content_locker_link} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Get Free Download
                  </a>
                </Button>
              )}
              {book.amazon_link && (
                <Button asChild variant="outline" className="w-full">
                  <a href={book.amazon_link} target="_blank" rel="noopener noreferrer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Buy on Amazon
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-orange-500" />
              <span className="text-2xl font-bold text-slate-800">{settings.site_name || 'BookShelf Hub'}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-slate-600 hover:text-orange-500 transition-colors">Home</a>
              <a href="#books" className="text-slate-600 hover:text-orange-500 transition-colors">Browse Books</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-orange-500 transition-colors">How It Works</a>
              <a href="#about" className="text-slate-600 hover:text-orange-500 transition-colors">About</a>
              <a href="#faq" className="text-slate-600 hover:text-orange-500 transition-colors">FAQ</a>
              <a href="#contact" className="text-slate-600 hover:text-orange-500 transition-colors">Contact</a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t pt-4">
              <div className="flex flex-col space-y-4">
                <a href="#home" className="text-slate-600 hover:text-orange-500 transition-colors">Home</a>
                <a href="#books" className="text-slate-600 hover:text-orange-500 transition-colors">Browse Books</a>
                <a href="#how-it-works" className="text-slate-600 hover:text-orange-500 transition-colors">How It Works</a>
                <a href="#about" className="text-slate-600 hover:text-orange-500 transition-colors">About</a>
                <a href="#faq" className="text-slate-600 hover:text-orange-500 transition-colors">FAQ</a>
                <a href="#contact" className="text-slate-600 hover:text-orange-500 transition-colors">Contact</a>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-slate-900/70"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {settings.site_tagline || 'Your Trusted Digital Library'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            {settings.site_description || 'Discover thousands of books with two convenient options: purchase through Amazon or get free downloads through simple offers.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* "Get Free Books" button - unchanged for now, links to #books */}
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg">
              <a href="#books">
                <Download className="mr-2 h-5 w-5" />
                Get Free Books
              </a>
            </Button>
            {/* MODIFIED: "Browse Collection" button with custom colors */}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="
                bg-blue-600 text-white border-blue-600
                hover:bg-blue-700 hover:border-blue-700 hover:text-white
                px-8 py-4 text-lg
                transition-colors duration-200
              "
            >
              <a href="#books">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Collection
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{settings.stats_users || '50,000+'}{settings.stats_users ? '' : ''}</h3>
              <p className="text-slate-600">Happy Readers</p>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{settings.stats_books || '10,000+'}{settings.stats_books ? '' : ''}</h3>
              <p className="text-slate-600">Books Available</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-bold text-slate-800 mb-2">100%</h3>
              <p className="text-slate-600">Secure & Trusted</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose your preferred way to access books - purchase through Amazon or get them free through simple offers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Option 1: Amazon Purchase */}
            <Card className="p-8 border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center">
                <ShoppingCart className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-slate-800">Option 1: Amazon Purchase</CardTitle>
                <CardDescription className="text-lg">Quick and direct access through Amazon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Browse our collection</h4>
                      <p className="text-slate-600">Find books you're interested in</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Click "Buy on Amazon"</h4>
                      <p className="text-slate-600">Redirected to Amazon for secure purchase</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Instant access</h4>
                      <p className="text-slate-600">Download immediately after purchase</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Option 2: Free Download */}
            <Card className="p-8 border-2 border-orange-200 hover:border-orange-300 transition-colors">
              <CardHeader className="text-center">
                <Download className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-slate-800">Option 2: Free Download</CardTitle>
                <CardDescription className="text-lg">Get books free by completing simple offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Choose a book</h4>
                      <p className="text-slate-600">Select from our free download collection</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Complete a simple offer</h4>
                      <p className="text-slate-600">Quick surveys or sign-ups (takes 2-3 minutes)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Download your book</h4>
                      <p className="text-slate-600">Get instant access to your free book</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 text-lg">
              <strong>Disclosure:</strong> As an Amazon Associate, we earn from qualifying purchases.
              Free downloads are provided through our content locker system with partner offers.
            </p>
          </div>
        </div>
      </section>

      {/* Book Collection */}
      <section id="books" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Featured Books</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Discover our curated collection of books across various genres
            </p>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search books or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 py-3 text-lg"
                  />
                </div>
              </div>

              {/* Genre Filter */}
              <div className="flex flex-wrap gap-2 justify-center">
                {genres.map((genre) => (
                  <Button
                    key={genre}
                    variant={selectedGenre === genre ? "default" : "outline"}
                    onClick={() => setSelectedGenre(genre)}
                    className={selectedGenre === genre ? "bg-orange-500 hover:bg-orange-600" : ""}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Books Grid - Now renders based on fetched data */}
          {renderBookGrid()}

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get answers to common questions about our service
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Is this service legitimate and safe?</h3>
              <p className="text-slate-600">
                Yes, absolutely. We are a legitimate service that partners with Amazon's affiliate program and trusted offer providers.
                All our free downloads are provided through verified content locker systems with legitimate partner offers.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">What kind of offers do I need to complete for free downloads?</h3>
              <p className="text-slate-600">
                Our offers are simple and quick, typically including surveys, newsletter sign-ups, or trial registrations.
                Most offers take 2-3 minutes to complete and are from reputable companies.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">How do Amazon purchases work?</h3>
              <p className="text-slate-600">
                When you click "Buy on Amazon," you'll be redirected to Amazon's website where you can purchase the book securely.
                As an Amazon Associate, we earn a small commission from qualifying purchases at no extra cost to you.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Are the free books the same quality as paid ones?</h3>
              <p className="text-slate-600">
                Yes, the books available for free download are the same high-quality titles available for purchase.
                The only difference is the access method - either through Amazon purchase or completing partner offers.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Do you store my personal information?</h3>
              <p className="text-slate-600">
                We respect your privacy and only collect minimal information necessary to provide our service.
                Please review our privacy policy for detailed information about data handling and protection.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-8 w-8 text-orange-500" />
                <span className="text-2xl font-bold">{settings.site_name || 'BookShelf Hub'}</span>
              </div>
              <p className="text-slate-300">
                {settings.site_description || 'Your trusted source for digital books with flexible access options.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-slate-300 hover:text-orange-500 transition-colors">Home</a></li>
                <li><a href="#books" className="text-slate-300 hover:text-orange-500 transition-colors">Browse Books</a></li>
                <li><a href="#how-it-works" className="text-slate-300 hover:text-orange-500 transition-colors">How It Works</a></li>
                <li><a href="#faq" className="text-slate-300 hover:text-orange-500 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#privacy" className="text-slate-300 hover:text-orange-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="text-slate-300 hover:text-orange-500 transition-colors">Terms of Service</a></li>
                <li><a href="#affiliate" className="text-slate-300 hover:text-orange-500 transition-colors">Affiliate Disclosure</a></li>
                <li><a href="#contact" className="text-slate-300 hover:text-orange-500 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Trust & Security</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">SSL Secured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">GDPR Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-400" />
                  <span className="text-slate-300">{settings.stats_users || '50,000+'} Users</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-300">
              © 2024 {settings.site_name || 'BookShelf Hub'}. All rights reserved. |
              <span className="text-sm"> As an Amazon Associate, we earn from qualifying purchases.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
