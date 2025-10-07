import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, BookOpen, DollarSign, Users, BarChart, Settings, Plus, Eye, Store, Edit, Trash2, UserCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AbebooksListing {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  bookIsbn: string;
  condition: 'New' | 'Like New' | 'Very Good' | 'Good' | 'Acceptable' | 'Poor';
  price: string;
  shippingCost: string;
  vendorName: string;
  vendorRating: number;
  vendorCountry: string;
  vendorReviews: number;
  imageUrl?: string;
  description?: string;
  accountId: string;
  createdAt: string;
}

interface AbebooksAccount {
  id: string;
  accountName: string;
  isActive: boolean;
  isDefault: boolean;
  maxRequestsPerMinute: number;
  requestsUsed: number;
  targetCountries: string[];
  preferredCurrency: string;
  lastUsedAt: string | null;
  createdAt: string;
}

interface SearchResult {
  listings: AbebooksListing[];
  totalFound: number;
  searchTime: number;
  accountUsed: string;
}

// Book Seller Management Types
interface BookSeller {
  id: string;
  sellerId: string;
  displayName: string;
  businessName: string;
  profile: {
    avatar?: string;
    description: string;
    specialties: string[];
    location: {
      city: string;
      district: string;
      address?: string;
    };
    contact: {
      email: string;
      phone: string;
      website?: string;
    };
    businessInfo: {
      taxId?: string;
      licenseNumber?: string;
      establishedYear?: number;
    };
  };
  tier: 'standard' | 'premium' | 'top_seller';
  pricingTier: 'standard_price' | 'markup_price';
  totalSales: string;
  totalOrders: number;
  avgRating: string;
  responseTime: number;
  maxBooks: number;
  currentBooks: number;
  autoAssignBooks: boolean;
  isActive: boolean;
  isTopSeller: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BookCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  readingPreferences: {
    favoriteGenres: string[];
    languagePreference: string[];
    priceRange: { min: number; max: number };
    bookFormats: string[];
  };
  totalSpent: string;
  totalBooks: number;
  avgOrderValue: string;
  lastPurchase?: string;
  emailSubscribed: boolean;
  smsSubscribed: boolean;
  marketingTags: string[];
  status: 'active' | 'inactive' | 'vip';
  createdAt: string;
  updatedAt: string;
}

interface CreateSellerData {
  displayName: string;
  businessName: string;
  description: string;
  specialties: string[];
  city: string;
  district: string;
  email: string;
  phone: string;
  tier: 'standard' | 'premium' | 'top_seller';
  pricingTier: 'standard_price' | 'markup_price';
  maxBooks: number;
}

export default function BooksManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'isbn' | 'general'>('isbn');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Seller Management State
  const [showCreateSeller, setShowCreateSeller] = useState(false);
  const [editingSeller, setEditingSeller] = useState<BookSeller | null>(null);
  const [newSeller, setNewSeller] = useState<CreateSellerData>({
    displayName: '',
    businessName: '',
    description: '',
    specialties: [],
    city: '',
    district: '',
    email: '',
    phone: '',
    tier: 'standard',
    pricingTier: 'markup_price',
    maxBooks: 1000
  });
  
  const queryClient = useQueryClient();

  // Fetch AbeBooks accounts
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['abebooks-accounts'],
    queryFn: async () => {
      const response = await fetch('/api/books/abebooks/accounts');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json();
    }
  });

  const accounts = accountsData?.accounts || [];

  // Book Sellers API Functions
  const fetchBookSellers = async (): Promise<BookSeller[]> => {
    const response = await fetch('/api/book-sellers');
    if (!response.ok) throw new Error('Failed to fetch book sellers');
    return response.json();
  };

  const createBookSeller = async (data: CreateSellerData): Promise<BookSeller> => {
    const sellerId = `SELLER_${String(Date.now()).slice(-6)}`;
    const response = await fetch('/api/book-sellers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...data, 
        sellerId,
        profile: {
          description: data.description,
          specialties: data.specialties,
          location: {
            city: data.city,
            district: data.district
          },
          contact: {
            email: data.email,
            phone: data.phone
          },
          businessInfo: {}
        }
      }),
    });
    if (!response.ok) throw new Error('Failed to create seller');
    return response.json();
  };

  const updateBookSeller = async ({ id, ...data }: Partial<BookSeller> & { id: string }): Promise<BookSeller> => {
    const response = await fetch(`/api/book-sellers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update seller');
    return response.json();
  };

  const deleteBookSeller = async (id: string): Promise<void> => {
    const response = await fetch(`/api/book-sellers/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete seller');
  };

  const fetchBookCustomers = async (): Promise<BookCustomer[]> => {
    const response = await fetch('/api/book-customers');
    if (!response.ok) throw new Error('Failed to fetch book customers');
    return response.json();
  };

  // Fetch Book Sellers
  const { data: sellersData, isLoading: sellersLoading } = useQuery({
    queryKey: ['book-sellers'],
    queryFn: fetchBookSellers
  });

  const sellers = sellersData || [];

  // Fetch Book Customers  
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['book-customers'],
    queryFn: fetchBookCustomers
  });

  const bookCustomers = customersData || [];

  // Seller Mutations
  const createSellerMutation = useMutation({
    mutationFn: createBookSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-sellers'] });
      setShowCreateSeller(false);
      setNewSeller({
        displayName: '',
        businessName: '',
        description: '',
        specialties: [],
        city: '',
        district: '',
        email: '',
        phone: '',
        tier: 'standard',
        pricingTier: 'markup_price',
        maxBooks: 1000
      });
    }
  });

  const updateSellerMutation = useMutation({
    mutationFn: updateBookSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-sellers'] });
      setEditingSeller(null);
    }
  });

  const deleteSellerMutation = useMutation({
    mutationFn: deleteBookSeller,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-sellers'] });
    }
  });

  // Fetch account status
  const { data: statusData } = useQuery({
    queryKey: ['abebooks-status'],
    queryFn: async () => {
      const response = await fetch('/api/books/abebooks/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const status = statusData?.status || {};

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: async (params: { query: string; type: 'isbn' | 'general' }) => {
      const endpoint = params.type === 'isbn' 
        ? `/api/books/abebooks/search/isbn/${params.query}`
        : `/api/books/abebooks/search/${params.query}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return data as SearchResult;
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setIsSearching(false);
    },
    onError: (error) => {
      console.error('Search error:', error);
      setIsSearching(false);
    }
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    searchMutation.mutate({ query: searchQuery.trim(), type: searchType });
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? amount : `$${num.toFixed(2)}`;
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      'New': 'bg-green-100 text-green-800',
      'Like New': 'bg-green-100 text-green-700',
      'Very Good': 'bg-blue-100 text-blue-800',
      'Good': 'bg-yellow-100 text-yellow-800',
      'Acceptable': 'bg-orange-100 text-orange-800',
      'Poor': 'bg-red-100 text-red-800'
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                Books Management
              </h1>
              <p className="text-gray-600 mt-2">
                Comprehensive AbeBooks integration with multi-vendor pricing and rare book specialization
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Accounts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {accounts.filter((acc: AbebooksAccount) => acc.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Requests Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {status?.totalRequestsToday || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Search Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {status?.averageResponseTime || '0'}ms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {searchResults?.totalFound || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="search">Book Search</TabsTrigger>
            <TabsTrigger value="sellers">Seller Management</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">Search History</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Search AbeBooks</CardTitle>
                <CardDescription>
                  Search for books by ISBN or general query across multiple vendor accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder={searchType === 'isbn' ? 'Enter ISBN (e.g., 9780123456789)' : 'Enter book title, author, or keywords'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={searchType === 'isbn' ? 'default' : 'outline'}
                      onClick={() => setSearchType('isbn')}
                    >
                      ISBN
                    </Button>
                    <Button
                      variant={searchType === 'general' ? 'default' : 'outline'}
                      onClick={() => setSearchType('general')}
                    >
                      General
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !searchQuery.trim()}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    Found {searchResults.totalFound} listings in {searchResults.searchTime}ms 
                    using account {searchResults.accountUsed}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {searchResults.listings.map((listing) => (
                      <div key={listing.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{listing.bookTitle}</h3>
                            <p className="text-sm text-gray-600">by {listing.bookAuthor}</p>
                            <p className="text-xs text-gray-500 mt-1">ISBN: {listing.bookIsbn}</p>
                            
                            <div className="flex items-center gap-4 mt-3">
                              <Badge className={getConditionColor(listing.condition)}>
                                {listing.condition}
                              </Badge>
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(listing.price)}
                              </span>
                              <span className="text-sm text-gray-500">
                                + {formatCurrency(listing.shippingCost)} shipping
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>{listing.vendorName} ({listing.vendorCountry})</span>
                              <span>⭐ {listing.vendorRating}/5</span>
                              <span>({listing.vendorReviews} reviews)</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sellers" className="space-y-6">
            {/* Seller Management Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <Store className="h-6 w-6 text-blue-600" />
                      Book Seller Management
                    </CardTitle>
                    <CardDescription>
                      Manage 20+ automated sellers with dynamic pricing and inventory distribution
                    </CardDescription>
                  </div>
                  <Dialog open={showCreateSeller} onOpenChange={setShowCreateSeller}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create New Book Seller</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input
                              id="displayName"
                              placeholder="Nhà sách Minh Khai"
                              value={newSeller.displayName}
                              onChange={(e) => setNewSeller(prev => ({ ...prev, displayName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                              id="businessName"
                              placeholder="Công ty TNHH Sách Minh Khai"
                              value={newSeller.businessName}
                              onChange={(e) => setNewSeller(prev => ({ ...prev, businessName: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Chuyên cung cấp sách giáo khoa và sách tham khảo..."
                            value={newSeller.description}
                            onChange={(e) => setNewSeller(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Select value={newSeller.city} onValueChange={(value) => setNewSeller(prev => ({ ...prev, city: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select city" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ho Chi Minh">Hồ Chí Minh</SelectItem>
                                <SelectItem value="Ha Noi">Hà Nội</SelectItem>
                                <SelectItem value="Da Nang">Đà Nẵng</SelectItem>
                                <SelectItem value="Can Tho">Cần Thơ</SelectItem>
                                <SelectItem value="Hai Phong">Hải Phòng</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="district">District</Label>
                            <Input
                              id="district"
                              placeholder="Quận 1, Quận 2..."
                              value={newSeller.district}
                              onChange={(e) => setNewSeller(prev => ({ ...prev, district: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="contact@sachminhai.com"
                              value={newSeller.email}
                              onChange={(e) => setNewSeller(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              placeholder="0901234567"
                              value={newSeller.phone}
                              onChange={(e) => setNewSeller(prev => ({ ...prev, phone: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="tier">Seller Tier</Label>
                            <Select value={newSeller.tier} onValueChange={(value: 'standard' | 'premium' | 'top_seller') => setNewSeller(prev => ({ ...prev, tier: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="top_seller">Top Seller</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="pricingTier">Pricing Tier</Label>
                            <Select value={newSeller.pricingTier} onValueChange={(value: 'standard_price' | 'markup_price') => setNewSeller(prev => ({ ...prev, pricingTier: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="markup_price">Markup Price (Default)</SelectItem>
                                <SelectItem value="standard_price">Standard Price (Limited)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="maxBooks">Max Books</Label>
                            <Input
                              id="maxBooks"
                              type="number"
                              placeholder="1000"
                              value={newSeller.maxBooks}
                              onChange={(e) => setNewSeller(prev => ({ ...prev, maxBooks: parseInt(e.target.value) || 1000 }))}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button variant="outline" onClick={() => setShowCreateSeller(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => createSellerMutation.mutate(newSeller)}
                            disabled={createSellerMutation.isPending || !newSeller.displayName || !newSeller.businessName}
                          >
                            {createSellerMutation.isPending ? 'Creating...' : 'Create Seller'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Seller Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Store className="h-8 w-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Sellers</p>
                      <p className="text-2xl font-bold text-gray-900">{sellers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <UserCheck className="h-8 w-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Sellers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sellers.filter(seller => seller.isActive).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Standard Price Sellers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {sellers.filter(seller => seller.pricingTier === 'standard_price').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Book Customers</p>
                      <p className="text-2xl font-bold text-gray-900">{bookCustomers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sellers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sellers List</CardTitle>
                <CardDescription>
                  Manage your automated book sellers and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sellersLoading ? (
                  <div className="text-center py-8">Loading sellers...</div>
                ) : sellers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No sellers found. Create your first seller to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellers.map((seller) => (
                      <div key={seller.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{seller.displayName}</h3>
                              <Badge variant={seller.isActive ? 'default' : 'secondary'}>
                                {seller.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant={seller.pricingTier === 'standard_price' ? 'destructive' : 'outline'}>
                                {seller.pricingTier === 'standard_price' ? 'Standard Price' : 'Markup Price'}
                              </Badge>
                              {seller.isTopSeller && (
                                <Badge variant="default" className="bg-yellow-500">
                                  ⭐ Top Seller
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-2">{seller.profile.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Business:</span> {seller.businessName}
                              </div>
                              <div>
                                <span className="font-medium">Location:</span> {seller.profile.location.city}, {seller.profile.location.district}
                              </div>
                              <div>
                                <span className="font-medium">Contact:</span> {seller.profile.contact.email}
                              </div>
                              <div>
                                <span className="font-medium">Phone:</span> {seller.profile.contact.phone}
                              </div>
                              <div>
                                <span className="font-medium">Total Sales:</span> ${seller.totalSales}
                              </div>
                              <div>
                                <span className="font-medium">Orders:</span> {seller.totalOrders}
                              </div>
                              <div>
                                <span className="font-medium">Rating:</span> ⭐ {seller.avgRating}/5
                              </div>
                              <div>
                                <span className="font-medium">Books:</span> {seller.currentBooks}/{seller.maxBooks}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteSellerMutation.mutate(seller.id)}
                              disabled={deleteSellerMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AbeBooks Accounts</CardTitle>
                <CardDescription>
                  Manage your AbeBooks API accounts and rotation settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {accounts.map((account: AbebooksAccount) => (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{account.accountName}</h3>
                            {account.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                            <Badge variant={account.isActive ? 'default' : 'secondary'}>
                              {account.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Requests: {account.requestsUsed}/{account.maxRequestsPerMinute}</span>
                            <span>Countries: {account.targetCountries.join(', ')}</span>
                            <span>Currency: {account.preferredCurrency}</span>
                            <span>Last used: {account.lastUsedAt ? new Date(account.lastUsedAt).toLocaleString() : 'Never'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Metrics</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Performance</CardTitle>
                <CardDescription>
                  Monitor search performance and account usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart className="h-12 w-12 mx-auto mb-4" />
                  <p>Analytics dashboard coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Search History</CardTitle>
                <CardDescription>
                  Review recent searches and their results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4" />
                  <p>Search history will appear here...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}