import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { 
  User, Briefcase, ShieldCheck, Search, Star, Calendar, 
  Clock, MapPin, Menu, X, LogOut, Plus, Edit, Trash2, 
  DollarSign, BarChart3, Users, Home, CheckCircle, XCircle, 
  Moon, Sun, Filter, ChevronRight, ImageIcon, LayoutGrid,
  Phone, Mail, Facebook, Twitter, Instagram, Linkedin, Heart,
  Zap, Award, Headphones
} from "lucide-react";

// --- Types & Interfaces (Simulating DB Schema) ---

type Role = 'user' | 'provider' | 'admin';
type BookingStatus = 'pending' | 'accepted' | 'completed' | 'cancelled' | 'rejected';

interface UserData {
  id: string;
  name: string;
  email: string;
  password?: string; // stored for simulation
  role: Role;
  avatar?: string;
  joinedDate: string;
}

interface Service {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  category: string;
  description: string;
  price: number;
  duration: string; // e.g., "1 hour"
  image: string;
  rating: number;
  reviewCount: number;
}

interface Booking {
  id: string;
  userId: string;
  userName: string;
  providerId: string;
  serviceId: string;
  serviceTitle: string;
  servicePrice: number;
  date: string;
  time: string;
  status: BookingStatus;
  notes?: string;
}

interface Review {
  id: string;
  bookingId: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

// --- Mock Data (Seeding the "Database") ---

const CATEGORIES = ["Plumbing", "Electrical", "Cleaning", "Carpentry", "Painting", "Beauty", "Moving"];

const INITIAL_USERS: UserData[] = [
  { id: 'u1', name: 'John Doe', email: 'user@demo.com', password: '123', role: 'user', joinedDate: '2023-01-15' },
  { id: 'p1', name: 'Mike Fixit', email: 'provider@demo.com', password: '123', role: 'provider', joinedDate: '2023-02-10' },
  { id: 'a1', name: 'Admin User', email: 'admin@demo.com', password: '123', role: 'admin', joinedDate: '2023-01-01' },
];

const INITIAL_SERVICES: Service[] = [
  { 
    id: 's1', providerId: 'p1', providerName: 'Mike Fixit', title: 'Full House Cleaning', category: 'Cleaning', 
    description: 'Complete deep cleaning for 2BHK apartments.', price: 80, duration: '4 hours', 
    image: 'https://images.unsplash.com/photo-1581578731117-104f2a41272c?auto=format&fit=crop&q=80&w=400', 
    rating: 4.8, reviewCount: 12 
  },
  { 
    id: 's2', providerId: 'p1', providerName: 'Mike Fixit', title: 'Pipe Leak Repair', category: 'Plumbing', 
    description: 'Fixing leaks, clogged drains, and pipe fitting.', price: 45, duration: '1 hour', 
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&q=80&w=400', 
    rating: 4.5, reviewCount: 8 
  },
  {
    id: 's3', providerId: 'p2', providerName: 'Sarah Sparkles', title: 'Bridal Makeup', category: 'Beauty',
    description: 'Professional bridal makeup with premium products.', price: 200, duration: '3 hours',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=400',
    rating: 5.0, reviewCount: 5
  }
];

const INITIAL_BOOKINGS: Booking[] = [
  { 
    id: 'b1', userId: 'u1', userName: 'John Doe', providerId: 'p1', serviceId: 's1', serviceTitle: 'Full House Cleaning', 
    servicePrice: 80, date: '2023-10-25', time: '10:00', status: 'completed' 
  },
  { 
    id: 'b2', userId: 'u1', userName: 'John Doe', providerId: 'p1', serviceId: 's2', serviceTitle: 'Pipe Leak Repair', 
    servicePrice: 45, date: '2023-11-05', time: '14:00', status: 'pending', notes: 'Urgent please' 
  }
];

// --- Helper Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: any) => {
  const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95";
  const variants: any = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30",
    secondary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    outline: "border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200",
    ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
  };
  return (
    <button className={`${baseClass} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }: { status: BookingStatus }) => {
  const styles: Record<BookingStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Service Form Modal Component ---

const ServiceModal = ({ isOpen, onClose, service, onSave }: { isOpen: boolean, onClose: () => void, service: Service | null, onSave: (data: Partial<Service>) => void }) => {
  const [formData, setFormData] = useState<Partial<Service>>({
    title: '',
    category: CATEGORIES[0],
    description: '',
    price: 0,
    duration: '',
    image: ''
  });

  useEffect(() => {
    if (service) {
      setFormData(service);
    } else {
      setFormData({
        title: '',
        category: CATEGORIES[0],
        description: '',
        price: 0,
        duration: '',
        image: ''
      });
    }
  }, [service, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use default image if none provided
    const finalData = {
      ...formData,
      image: formData.image || 'https://images.unsplash.com/photo-1581578731117-104f2a41272c?auto=format&fit=crop&q=80&w=400'
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold dark:text-white">{service ? 'Edit Service' : 'Add New Service'}</h3>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Title</label>
            <input 
              required 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Sofa Deep Cleaning" 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
             <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
             >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
              <input 
                type="number" 
                required 
                value={formData.price || ''}
                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                placeholder="0.00" 
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
              <input 
                required 
                value={formData.duration}
                onChange={e => setFormData({...formData, duration: e.target.value})}
                placeholder="e.g. 2 hours" 
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
             <div className="flex gap-2">
                 <input 
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg" 
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                 />
             </div>
             <p className="text-xs text-gray-500 mt-1">Leave empty for default image</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              required 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what this service includes..." 
              rows={4} 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <Button className="w-full" type="submit">{service ? 'Update Service' : 'Create Service'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Application ---

const App = () => {
  // --- "Backend" State ---
  const [users, setUsers] = useState<UserData[]>(INITIAL_USERS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState('landing'); // landing, login, register, user-dash, provider-dash, admin-dash
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Service Management State (Shared between Provider and Admin)
  const [isServiceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- Auth Logic ---
  const handleLogin = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'admin') setCurrentView('admin-dash');
      else if (user.role === 'provider') setCurrentView('provider-dash');
      else setCurrentView('user-dash');
      showNotification(`Welcome back, ${user.name}!`);
    } else {
      showNotification('Invalid credentials', 'error');
    }
  };

  const handleRegister = (name: string, email: string, pass: string, role: Role) => {
    if (users.find(u => u.email === email)) {
      showNotification('Email already exists', 'error');
      return;
    }
    const newUser: UserData = {
      id: Math.random().toString(36).substr(2, 9),
      name, email, password: pass, role, joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    if (role === 'provider') setCurrentView('provider-dash');
    else setCurrentView('user-dash');
    showNotification('Account created successfully!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
  };

  // --- Service Logic (Create/Update/Delete) ---
  const handleSaveService = (serviceData: Partial<Service>) => {
    if (editingService) {
      // Update existing
      setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceData } : s));
      showNotification("Service updated successfully!");
    } else {
      // Create new
      const newService: Service = {
        id: Math.random().toString(36).substr(2, 9),
        providerId: currentUser?.role === 'admin' ? 'p1' : currentUser!.id,
        providerName: currentUser?.name || 'Unknown',
        title: serviceData.title!,
        category: serviceData.category!,
        description: serviceData.description!,
        price: serviceData.price!,
        duration: serviceData.duration!,
        image: serviceData.image!,
        rating: 0,
        reviewCount: 0
      };
      setServices([...services, newService]);
      showNotification("Service created successfully!");
    }
    setServiceModalOpen(false);
    setEditingService(null);
  };

  const handleDeleteService = (id: string) => {
    if(confirm("Are you sure you want to delete this service?")) {
        setServices(services.filter(s => s.id !== id));
        showNotification("Service deleted successfully");
    }
  };

  const openAddServiceModal = () => {
    setEditingService(null);
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (service: Service) => {
    setEditingService(service);
    setServiceModalOpen(true);
  };

  // --- Views ---

  // 1. Landing Page (Updated with Navbar, About, Contact, Features)
  const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const scrollTo = (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    };

    const Navbar = () => (
      <nav className="fixed w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
              <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <Briefcase size={24} />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                UrbanService
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollTo('home')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Home</button>
              <button onClick={() => scrollTo('services')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Services</button>
              <button onClick={() => scrollTo('features')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Features</button>
              <button onClick={() => scrollTo('about')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">About</button>
              <button onClick={() => scrollTo('contact')} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium">Contact</button>
              <div className="flex items-center gap-3 ml-4">
                 <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <Button variant="ghost" onClick={() => setCurrentView('login')}>Log In</Button>
                <Button onClick={() => setCurrentView('register-provider')}>Join as Pro</Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
                 <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 dark:text-gray-300">
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 animate-fade-in-up">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <button onClick={() => scrollTo('home')} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Home</button>
              <button onClick={() => scrollTo('services')} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Services</button>
              <button onClick={() => scrollTo('features')} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Features</button>
              <button onClick={() => scrollTo('about')} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">About</button>
              <button onClick={() => scrollTo('contact')} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">Contact</button>
              <div className="pt-4 flex flex-col gap-3">
                <Button variant="outline" onClick={() => setCurrentView('login')} className="w-full justify-center">Log In</Button>
                <Button onClick={() => setCurrentView('register-provider')} className="w-full justify-center">Join as Professional</Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    );

    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />

        {/* Hero Section */}
        <div id="home" className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 -z-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
                Your Personal Home <br/>
                <span className="text-indigo-600">Service Expert</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Get instant access to reliable and verified professionals for cleaning, plumbing, beauty, and more. Quality service at your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setCurrentView('login')} className="text-lg px-8 py-4 shadow-xl shadow-indigo-500/20">
                  Book a Service
                </Button>
                <Button variant="outline" onClick={() => scrollTo('services')} className="text-lg px-8 py-4">
                  Explore Services
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Why Choose Us</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                The Smartest Way to Book Services
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, title: "Verified Pros", desc: "Background checked & trained professionals." },
                { icon: Clock, title: "On-Time Service", desc: "We value your time. Punctuality is our promise." },
                { icon: DollarSign, title: "Transparent Pricing", desc: "No hidden costs. Pay for what you see." },
                { icon: Headphones, title: "24/7 Support", desc: "Dedicated support team to help you anytime." }
              ].map((feature, idx) => (
                <div key={idx} className={`p-6 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow duration-300 animate-fade-in-up`} style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Services */}
        <div id="services" className="py-20 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Most Popular Services
              </h2>
            </div>
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 3).map((service, idx) => (
                <div key={service.id} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <ServiceCard service={service} onBook={() => {
                        showNotification("Please login to book", 'error');
                        setCurrentView('login');
                    }} />
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button variant="outline" onClick={() => setCurrentView('login')} className="inline-flex">View All Services <ChevronRight size={16} /></Button>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="py-20 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="mb-12 lg:mb-0 animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
                  Empowering Professionals, <br /> Delighting Customers
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">
                  UrbanService was founded with a simple mission: to bridge the gap between skilled service providers and customers seeking quality home services.
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
                  We believe in fair pay for professionals and transparent pricing for customers. Our platform uses advanced algorithms to match you with the best experts in your area.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-l-4 border-indigo-600 pl-4">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">50k+</div>
                    <div className="text-sm text-gray-500">Happy Customers</div>
                  </div>
                  <div className="border-l-4 border-purple-600 pl-4">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">2,000+</div>
                    <div className="text-sm text-gray-500">Service Partners</div>
                  </div>
                </div>
              </div>
              <div className="relative animate-fade-in-up animate-delay-200">
                <div className="absolute inset-0 bg-indigo-600 rounded-2xl rotate-3 opacity-20 transform translate-x-4 translate-y-4"></div>
                <img 
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=1000" 
                  alt="Team working" 
                  className="relative rounded-2xl shadow-2xl w-full object-cover h-96"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div id="contact" className="py-20 bg-indigo-600 dark:bg-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="animate-fade-in-up">
                <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
                <p className="text-indigo-100 mb-8 text-lg">Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="font-medium opacity-80">Phone</p>
                      <p className="text-lg font-semibold">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="font-medium opacity-80">Email</p>
                      <p className="text-lg font-semibold">support@urbanservice.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <p className="font-medium opacity-80">Office</p>
                      <p className="text-lg font-semibold">123 Market St, San Francisco, CA</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl animate-fade-in-up animate-delay-200">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); showNotification('Message sent!'); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea rows={4} className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="How can we help?"></textarea>
                  </div>
                  <Button className="w-full">Send Message</Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-4 text-white">
                  <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <Briefcase size={20} />
                  </div>
                  <span className="text-xl font-bold">UrbanService</span>
                </div>
                <p className="text-gray-400 max-w-sm mb-6">
                  Your one-stop destination for all home service needs. Trusted, reliable, and affordable.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-white transition"><Facebook size={20}/></a>
                  <a href="#" className="hover:text-white transition"><Twitter size={20}/></a>
                  <a href="#" className="hover:text-white transition"><Instagram size={20}/></a>
                  <a href="#" className="hover:text-white transition"><Linkedin size={20}/></a>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><button onClick={() => scrollTo('about')} className="hover:text-white transition">About Us</button></li>
                  <li><button onClick={() => scrollTo('features')} className="hover:text-white transition">Features</button></li>
                  <li><a href="#" className="hover:text-white transition">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">Services</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-white transition">Cleaning</a></li>
                  <li><a href="#" className="hover:text-white transition">Plumbing</a></li>
                  <li><a href="#" className="hover:text-white transition">Electrical</a></li>
                  <li><a href="#" className="hover:text-white transition">Beauty</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} UrbanService Inc. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  };

  // 2. Auth Pages (Updated with Animation)
  const AuthPage = ({ type }: { type: 'login' | 'register' | 'register-provider' }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-200"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-400"></div>
        </div>

        <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl animate-fade-in-up border border-white/20">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 mb-4">
               {type === 'login' ? <User size={24}/> : <Briefcase size={24}/>}
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {type === 'login' ? 'Welcome Back' : type === 'register-provider' ? 'Partner Registration' : 'Create Account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {type === 'login' ? 'Sign in to access your dashboard' : 'Join our community of professionals and users'}
            </p>
          </div>
          <div className="mt-8 space-y-6">
            {type !== 'login' && (
              <div className="animate-fade-in-up animate-delay-100">
                <input
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            <div className="animate-fade-in-up animate-delay-200">
              <input
                type="email"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Email address"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="animate-fade-in-up animate-delay-300">
              <input
                type="password"
                required
                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-all"
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <div className="animate-fade-in-up animate-delay-300 pt-2">
                <Button className="w-full py-3 text-lg" onClick={() => {
                  if (type === 'login') handleLogin(formData.email, formData.password);
                  else handleRegister(formData.name, formData.email, formData.password, type === 'register-provider' ? 'provider' : 'user');
                }}>
                  {type === 'login' ? 'Sign In' : 'Register'}
                </Button>
            </div>

            <div className="flex flex-col gap-2 text-center text-sm animate-fade-in-up animate-delay-300">
               {type === 'login' ? (
                 <>
                  <button onClick={() => setCurrentView('register')} className="text-indigo-600 hover:text-indigo-500 font-medium">Don't have an account? Sign up</button>
                  <button onClick={() => setCurrentView('register-provider')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">Want to join as a Service Provider?</button>
                 </>
               ) : (
                 <button onClick={() => setCurrentView('login')} className="text-indigo-600 hover:text-indigo-500 font-medium">Already have an account? Sign in</button>
               )}
                <button onClick={() => setCurrentView('landing')} className="text-xs text-gray-400 mt-4 hover:text-gray-600">Back to Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. Service Card Component
  const ServiceCard = ({ service, onBook, isProviderView = false, onEdit, onDelete }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl duration-300 flex flex-col h-full group">
      <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
        <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm text-indigo-600">
          ${service.price}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">{service.category}</span>
          <div className="flex items-center text-amber-400 text-sm font-bold">
            <Star size={14} fill="currentColor" />
            <span className="ml-1 text-gray-600 dark:text-gray-400">{service.rating > 0 ? service.rating : 'New'}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{service.title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{service.description}</p>
        
        <div className="flex items-center text-gray-500 text-sm mb-6 border-t dark:border-gray-700 pt-4 mt-auto">
          <Clock size={16} className="mr-2" />
          <span className="mr-auto">{service.duration}</span>
          <span className="text-xs">By {service.providerName}</span>
        </div>

        {isProviderView ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onEdit(service)}><Edit size={16} /> Edit</Button>
            <Button variant="danger" className="px-3" onClick={() => onDelete(service.id)}><Trash2 size={16} /></Button>
          </div>
        ) : (
          <Button className="w-full" onClick={() => onBook(service)}>Book Now</Button>
        )}
      </div>
    </div>
  );

  // 4. Booking Modal
  const BookingModal = ({ service, onClose }: { service: Service, onClose: () => void }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    const confirmBooking = () => {
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser!.id,
        userName: currentUser!.name,
        providerId: service.providerId,
        serviceId: service.id,
        serviceTitle: service.title,
        servicePrice: service.price,
        date,
        time,
        status: 'pending',
        notes
      };
      setBookings([...bookings, newBooking]);
      showNotification('Booking request sent successfully!');
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fade-in-up">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold dark:text-white">Book {service.title}</h3>
            <button onClick={onClose}><X className="text-gray-500" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Date</label>
              <input type="date" className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Time</label>
              <input type="time" className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={time} onChange={e => setTime(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
              <textarea className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." />
            </div>
            <div className="pt-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button className="flex-1" onClick={confirmBooking}>Confirm Booking</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 5. User Dashboard
  const UserDashboard = () => {
    const [activeTab, setActiveTab] = useState<'services' | 'bookings' | 'profile'>('services');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const filteredServices = services.filter(s => 
      (categoryFilter === 'All' || s.category === categoryFilter) &&
      (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const myBookings = bookings.filter(b => b.userId === currentUser!.id);

    return (
      <DashboardLayout title="Customer Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} menuItems={[
        { id: 'services', label: 'Browse Services', icon: Search },
        { id: 'bookings', label: 'My Bookings', icon: Calendar },
        { id: 'profile', label: 'Profile', icon: User },
      ]}>
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search for services..." 
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <Button variant={categoryFilter === 'All' ? 'primary' : 'outline'} onClick={() => setCategoryFilter('All')} className="whitespace-nowrap">All</Button>
                {CATEGORIES.map(cat => (
                  <Button key={cat} variant={categoryFilter === cat ? 'primary' : 'outline'} onClick={() => setCategoryFilter(cat)} className="whitespace-nowrap">{cat}</Button>
                ))}
              </div>
            </div>

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} onBook={() => setSelectedService(service)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <Card className="animate-fade-in-up">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Booking History</h2>
            <div className="space-y-4">
              {myBookings.length === 0 && <p className="text-gray-500 text-center py-8">No bookings found.</p>}
              {myBookings.map(booking => (
                <div key={booking.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{booking.serviceTitle}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.date} at {booking.time}
                    </p>
                    <p className="text-sm font-medium text-indigo-600 mt-1">${booking.servicePrice}</p>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center gap-4">
                    <Badge status={booking.status} />
                    {booking.status === 'pending' && (
                      <Button variant="danger" className="text-xs px-2 py-1" onClick={() => {
                        const updated = bookings.map(b => b.id === booking.id ? {...b, status: 'cancelled' as BookingStatus} : b);
                        setBookings(updated);
                        showNotification('Booking cancelled');
                      }}>Cancel</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
                <Card>
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600 text-3xl font-bold">
                            {currentUser?.name.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold dark:text-white">{currentUser?.name}</h2>
                        <p className="text-gray-500">{currentUser?.email}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg dark:text-white border-b pb-2 dark:border-gray-700">Account Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500 block">Member Since</label>
                                <p className="font-medium dark:text-gray-200">{currentUser?.joinedDate}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Account Type</label>
                                <p className="font-medium dark:text-gray-200 capitalize">{currentUser?.role}</p>
                            </div>
                        </div>
                        <div className="pt-4">
                             <Button className="w-full" onClick={() => showNotification("Profile updated!")}>Save Changes</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}
      </DashboardLayout>
    );
  };

  // 6. Provider Dashboard
  const ProviderDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'bookings'>('bookings');

    const myServices = services.filter(s => s.providerId === currentUser!.id);
    const myBookings = bookings.filter(b => b.providerId === currentUser!.id);
    
    const updateBookingStatus = (id: string, status: BookingStatus) => {
      setBookings(bookings.map(b => b.id === id ? {...b, status} : b));
      showNotification(`Booking ${status}`);
    };

    return (
      <DashboardLayout title="Partner Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} menuItems={[
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'services', label: 'My Services', icon: Briefcase },
        { id: 'overview', label: 'Overview', icon: BarChart3 },
      ]}>
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fade-in-up">
             {/* Stats Row */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-yellow-400">
                    <div className="text-gray-500 text-sm">Pending</div>
                    <div className="text-2xl font-bold dark:text-white">{myBookings.filter(b=>b.status==='pending').length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-blue-400">
                    <div className="text-gray-500 text-sm">Upcoming</div>
                    <div className="text-2xl font-bold dark:text-white">{myBookings.filter(b=>b.status==='accepted').length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-green-400">
                    <div className="text-gray-500 text-sm">Completed</div>
                    <div className="text-2xl font-bold dark:text-white">{myBookings.filter(b=>b.status==='completed').length}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-indigo-400">
                    <div className="text-gray-500 text-sm">Earnings</div>
                    <div className="text-2xl font-bold dark:text-white">${myBookings.filter(b=>b.status==='completed').reduce((acc, b) => acc + b.servicePrice, 0)}</div>
                </div>
             </div>

            <Card>
              <h3 className="font-bold text-lg mb-4 dark:text-white">Booking Requests</h3>
              <div className="space-y-4">
                {myBookings.length === 0 && <p className="text-gray-500 text-center">No bookings yet.</p>}
                {myBookings.map(booking => (
                  <div key={booking.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">{booking.serviceTitle}</h4>
                                <Badge status={booking.status} />
                            </div>
                            <p className="text-sm text-gray-500">Customer: <span className="font-medium text-gray-700 dark:text-gray-300">{booking.userName}</span></p>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Calendar size={14}/> {booking.date}</span>
                                <span className="flex items-center gap-1"><Clock size={14}/> {booking.time}</span>
                            </div>
                            {booking.notes && <p className="text-sm text-gray-500 mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">Note: {booking.notes}</p>}
                        </div>
                        
                        <div className="flex gap-2">
                            {booking.status === 'pending' && (
                                <>
                                    <Button variant="secondary" onClick={() => updateBookingStatus(booking.id, 'accepted')}>Accept</Button>
                                    <Button variant="danger" onClick={() => updateBookingStatus(booking.id, 'rejected')}>Reject</Button>
                                </>
                            )}
                            {booking.status === 'accepted' && (
                                <Button variant="primary" onClick={() => updateBookingStatus(booking.id, 'completed')}>Mark Completed</Button>
                            )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'services' && (
           <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold dark:text-white">My Services</h2>
                    <Button onClick={openAddServiceModal}><Plus size={18}/> Add Service</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myServices.map(service => (
                        <ServiceCard 
                            key={service.id} 
                            service={service} 
                            isProviderView 
                            onEdit={openEditServiceModal}
                            onDelete={handleDeleteService}
                        />
                    ))}
                </div>
           </div>
        )}
      </DashboardLayout>
    );
  };

  // 7. Admin Dashboard
  const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'providers' | 'services'>('overview');

    return (
      <DashboardLayout title="Admin Portal" activeTab={activeTab} setActiveTab={setActiveTab} menuItems={[
        { id: 'overview', label: 'Dashboard', icon: BarChart3 },
        { id: 'services', label: 'Manage Services', icon: LayoutGrid },
        { id: 'users', label: 'Manage Users', icon: Users },
        { id: 'providers', label: 'Service Providers', icon: Briefcase },
      ]}>
        {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full"><Users size={24}/></div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Users</p>
                            <p className="text-2xl font-bold dark:text-white">{users.filter(u=>u.role==='user').length}</p>
                        </div>
                    </Card>
                    <Card className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full"><Briefcase size={24}/></div>
                        <div>
                            <p className="text-gray-500 text-sm">Providers</p>
                            <p className="text-2xl font-bold dark:text-white">{users.filter(u=>u.role==='provider').length}</p>
                        </div>
                    </Card>
                    <Card className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Calendar size={24}/></div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Bookings</p>
                            <p className="text-2xl font-bold dark:text-white">{bookings.length}</p>
                        </div>
                    </Card>
                    <Card className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><DollarSign size={24}/></div>
                        <div>
                            <p className="text-gray-500 text-sm">Total Revenue</p>
                            <p className="text-2xl font-bold dark:text-white">${bookings.filter(b=>b.status==='completed').reduce((acc,b) => acc + b.servicePrice, 0)}</p>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="font-bold mb-4 dark:text-white">Recent Activity</h3>
                        <div className="space-y-4">
                            {bookings.slice(0, 5).map(b => (
                                <div key={b.id} className="flex justify-between items-center text-sm border-b dark:border-gray-700 pb-2">
                                    <span className="dark:text-gray-300">New booking for <b>{b.serviceTitle}</b></span>
                                    <span className="text-gray-500">{b.date}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <h3 className="font-bold mb-4 dark:text-white">Category Distribution</h3>
                        <div className="space-y-2">
                            {CATEGORIES.map(cat => {
                                const count = services.filter(s => s.category === cat).length;
                                const max = Math.max(...CATEGORIES.map(c => services.filter(s => s.category === c).length));
                                return (
                                    <div key={cat} className="flex items-center gap-2">
                                        <span className="w-24 text-sm text-gray-600 dark:text-gray-400">{cat}</span>
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(count / max) * 100}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-500">{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {activeTab === 'services' && (
           <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold dark:text-white">All Services</h2>
                    {/* Admin can add services if needed, usually they manage existing ones */}
                    <Button onClick={openAddServiceModal}><Plus size={18}/> Add Service</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map(service => (
                        <ServiceCard 
                            key={service.id} 
                            service={service} 
                            isProviderView 
                            onEdit={openEditServiceModal}
                            onDelete={handleDeleteService}
                        />
                    ))}
                </div>
           </div>
        )}

        {(activeTab === 'users' || activeTab === 'providers') && (
            <Card className="animate-fade-in-up">
                <h3 className="font-bold text-lg mb-4 capitalize dark:text-white">{activeTab} Management</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b dark:border-gray-700 text-gray-500 text-sm">
                                <th className="pb-3 pl-2">Name</th>
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Joined</th>
                                <th className="pb-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(u => u.role === (activeTab === 'users' ? 'user' : 'provider')).map(u => (
                                <tr key={u.id} className="border-b dark:border-gray-700 text-sm dark:text-gray-200">
                                    <td className="py-3 pl-2 font-medium">{u.name}</td>
                                    <td className="py-3">{u.email}</td>
                                    <td className="py-3">{u.joinedDate}</td>
                                    <td className="py-3">
                                        <button className="text-red-500 hover:text-red-600" onClick={() => {
                                            setUsers(users.filter(user => user.id !== u.id));
                                            showNotification("User removed");
                                        }}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        )}
      </DashboardLayout>
    );
  };

  // Shared Dashboard Layout
  const DashboardLayout = ({ title, activeTab, setActiveTab, menuItems, children }: any) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="h-full flex flex-col">
                <div className="h-16 flex items-center justify-center border-b dark:border-gray-700 cursor-pointer" onClick={() => setCurrentView('landing')}>
                    <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">UrbanService</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {currentUser?.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{currentUser?.role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
            <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <Menu className="text-gray-600 dark:text-gray-300"/>
                    </button>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
                </div>
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </header>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}
    </div>
  );

  // --- Render Logic ---

  return (
    <div className="font-sans antialiased text-gray-900 dark:text-white bg-white dark:bg-gray-900 min-h-screen">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in-down ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.msg}
        </div>
      )}

      {/* Conditional Rendering based on View */}
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'login' && <AuthPage type="login" />}
      {currentView === 'register' && <AuthPage type="register" />}
      {currentView === 'register-provider' && <AuthPage type="register-provider" />}
      {currentView === 'user-dash' && currentUser && <UserDashboard />}
      {currentView === 'provider-dash' && currentUser && <ProviderDashboard />}
      {currentView === 'admin-dash' && currentUser && <AdminDashboard />}

      {/* Booking Modal (Global) */}
      {selectedService && (
        <BookingModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
      
      {/* Service Add/Edit Modal (Global) */}
      <ServiceModal 
        isOpen={isServiceModalOpen} 
        onClose={() => setServiceModalOpen(false)}
        service={editingService}
        onSave={handleSaveService}
      />
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}