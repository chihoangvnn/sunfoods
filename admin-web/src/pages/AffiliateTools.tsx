import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Link2, 
  Copy, 
  QrCode, 
  Share2, 
  Search,
  Filter,
  Loader2,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Package,
  Eye,
  TrendingUp,
  Facebook,
  Bolt,
  MessageCircle,
  Instagram
} from 'lucide-react';
import AffiliateLayout from '@/layouts/AffiliateLayout';

interface Product {
  productId: string;
  productName: string;
  productSlug: string;
  productPrice: number;
  productPriceFormatted: string;
  productImage: string;
  categoryId: string;
  affiliateLink: string;
  shortLink: string;
  commissionAmount: number;
  commissionAmountFormatted: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AffiliateLinksResponse {
  success: boolean;
  data: {
    affiliateCode: string;
    commissionRate: number;
    storefrontUrl: string;
    links: Product[];
    categories: Category[];
    linkUsageInstructions: {
      howToUse: string;
      trackingInfo: string;
      commissionNote: string;
    };
  };
}

export default function AffiliateTools() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());

  // Fetch affiliate links and products
  const { 
    data: linksData, 
    isLoading, 
    error, 
    refetch,
    isRefetching
  } = useQuery<AffiliateLinksResponse>({
    queryKey: ['/api/affiliate-portal/links', { 
      search: searchQuery, 
      categoryId: selectedCategory,
      productId: selectedProductId 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedProductId) params.append('productId', selectedProductId);
      params.append('limit', '20');
      
      const response = await apiRequest('GET', `/api/affiliate-portal/links?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tải danh sách sản phẩm');
      }
      
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const copyToClipboard = async (text: string, productId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLinks(prev => new Set(prev).add(productId));
      toast({
        title: "Đã sao chép!",
        description: "Link affiliate đã được sao chép vào clipboard",
        duration: 2000,
      });

      // Remove from copied set after 3 seconds
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 3000);
    } catch (err) {
      toast({
        title: "Lỗi sao chép",
        description: "Không thể sao chép link. Vui lòng thử lại.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const generateQRCode = (link: string, productName: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
    
    // Open QR code in new tab
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${productName}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                text-align: center; 
                padding: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .container { 
                background: white; 
                padding: 30px; 
                border-radius: 15px; 
                display: inline-block;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
              }
              .qr-code { margin: 20px 0; }
              .product-info { color: #333; margin-bottom: 20px; }
              .instructions { 
                color: #666; 
                font-size: 14px; 
                max-width: 300px; 
                margin: 20px auto; 
                line-height: 1.5;
              }
              @media print {
                body { background: white; color: black; }
                .container { box-shadow: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2 class="product-info">🛍️ ${productName}</h2>
              <div class="qr-code">
                <img src="${qrUrl}" alt="QR Code" />
              </div>
              <p class="instructions">
                📱 Quét mã QR này để truy cập link affiliate<br>
                💰 Hoa hồng sẽ được tính khi khách hàng mua hàng
              </p>
              <button onclick="window.print()" style="
                background: #4F46E5; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 10px;
              ">🖨️ In QR Code</button>
              <button onclick="window.close()" style="
                background: #6B7280; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 5px; 
                cursor: pointer;
                margin: 10px;
              ">Đóng</button>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const shareToSocial = (link: string, productName: string, platform: string) => {
    const message = `🛍️ Khuyến mãi đặc biệt: ${productName}\n💰 Giá tốt nhất thị trường!\n🔗 Xem ngay: ${link}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`;
        break;
      case 'zalo':
        shareUrl = `https://zalo.me/share/sms?content=${encodeURIComponent(message)}`;
        break;
      case 'messenger':
        shareUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(link)}&app_id=YOUR_APP_ID`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=500');
  };

  if (isLoading) {
    return (
      <AffiliateLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          
          <div className="grid gap-4">
            {[1,2,3,4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-48"></div>
                      <div className="h-4 bg-gray-200 rounded w-64"></div>
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <div className="text-gray-600">Đang tải danh sách sản phẩm...</div>
          </div>
        </div>
      </AffiliateLayout>
    );
  }

  if (error) {
    return (
      <AffiliateLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600 mb-6">
            {(error as Error).message || 'Không thể kết nối tới server. Vui lòng thử lại.'}
          </p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </Button>
        </div>
      </AffiliateLayout>
    );
  }

  const { affiliateCode, commissionRate, links, categories, linkUsageInstructions } = linksData?.data || {};

  return (
    <AffiliateLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              Công cụ Affiliate
            </h1>
            <p className="text-gray-600 mt-1">
              Tạo link giới thiệu, QR code và chia sẻ lên mạng xã hội • 
              Mã affiliate: <span className="font-mono font-medium">{affiliateCode}</span> • 
              Hoa hồng {commissionRate}%
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Làm mới
            </Button>
          </div>
        </div>

        {/* Usage Instructions */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Hướng dẫn sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-medium text-blue-900">Bước 1</div>
                <div className="text-sm text-blue-700">{linkUsageInstructions?.howToUse}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-blue-900">Bước 2</div>
                <div className="text-sm text-blue-700">{linkUsageInstructions?.trackingInfo}</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium text-blue-900">Bước 3</div>
                <div className="text-sm text-blue-700">{linkUsageInstructions?.commissionNote}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5 text-purple-600" />
              Bộ lọc sản phẩm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Tìm kiếm sản phẩm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category">Danh mục</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả danh mục</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product ID Filter */}
              <div className="space-y-2">
                <Label htmlFor="productId">Mã sản phẩm cụ thể</Label>
                <Input
                  id="productId"
                  type="text"
                  placeholder="ID sản phẩm (tùy chọn)"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid gap-4">
          {links?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600">
                  Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.
                </p>
              </CardContent>
            </Card>
          ) : (
            links?.map((product) => (
              <Card key={product.productId} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        {product.productImage ? (
                          <img 
                            src={product.productImage} 
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {product.productName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="font-medium">{product.productPriceFormatted}</span>
                            <span>•</span>
                            <span className="text-green-600 font-medium">
                              Hoa hồng: {product.commissionAmountFormatted}
                            </span>
                          </div>
                        </div>
                        
                        <Badge className="bg-purple-100 text-purple-800">
                          {commissionRate}% hoa hồng
                        </Badge>
                      </div>

                      {/* Affiliate Link */}
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Link affiliate:
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              value={product.affiliateLink}
                              readOnly
                              className="font-mono text-xs bg-gray-50"
                            />
                            <Button
                              size="sm"
                              variant={copiedLinks.has(product.productId) ? "default" : "outline"}
                              onClick={() => copyToClipboard(product.affiliateLink, product.productId)}
                            >
                              {copiedLinks.has(product.productId) ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Đã copy
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {/* QR Code */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateQRCode(product.affiliateLink, product.productName)}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            QR Code
                          </Button>

                          {/* Preview Link */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(product.affiliateLink, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem trước
                          </Button>

                          {/* Social Sharing */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => shareToSocial(product.affiliateLink, product.productName, 'facebook')}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Facebook className="h-4 w-4 mr-1" />
                            Facebook
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => shareToSocial(product.affiliateLink, product.productName, 'zalo')}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <Bolt className="h-4 w-4 mr-1" />
                            Zalo
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => shareToSocial(product.affiliateLink, product.productName, 'messenger')}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Messenger
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More or Pagination could be added here if needed */}
        {links?.length === 20 && (
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Hiển thị tối đa 20 sản phẩm. Sử dụng bộ lọc để tìm sản phẩm cụ thể.
            </p>
          </div>
        )}
      </div>
    </AffiliateLayout>
  );
}