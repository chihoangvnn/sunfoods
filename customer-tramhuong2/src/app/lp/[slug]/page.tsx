'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useParams } from 'next/navigation'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MobileHeader } from '@/components/MobileHeader'
import { ImageSlider } from '@/components/ImageSlider'
import { ProductReviews } from '@/components/ProductReviews'
import { formatVietnamPrice } from '@/utils/currency'
import {
  Star,
  Check,
  ShoppingCart,
  Shield,
  Truck,
  Clock,
  Users,
  TrendingUp,
  Package,
  Phone,
  MapPin,
  Mail,
  ChevronRight
} from 'lucide-react'

interface LandingPageData {
  id: string
  slug: string
  title: string
  description: string
  product: {
    id: string
    name: string
    price: number
    originalPrice: number
    image: string
    images: string[]
    short_description: string
    description: string
  }
  finalPrice: number
  discount: number
  isActive: boolean
  affiliateId?: string
  affiliateCode?: string
  reviewsData?: {
    reviews: any[]
    averageRating: number
    totalReviews: number
  }
}

interface OrderFormData {
  name: string
  phone: string
  email: string
  address: string
  quantity: number
  paymentMethod: 'cod' | 'bank_transfer' | 'online'
  notes: string
}

export default function PublicLandingPage() {
  const params = useParams()
  const slug = params.slug as string
  const searchParams = useSearchParams()
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)
  const [viewersCount, setViewersCount] = useState(10)
  const [mounted, setMounted] = useState(false)
  
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    quantity: 1,
    paymentMethod: 'cod',
    notes: ''
  })

  const [showOrderForm, setShowOrderForm] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    setMounted(true)
    setViewersCount(Math.floor(Math.random() * 20) + 5)
  }, [])

  // Parse affiliate code from URL
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      localStorage.setItem('affiliateRef', refCode)
      setAffiliateCode(refCode)
    } else {
      const existingRef = localStorage.getItem('affiliateRef')
      if (existingRef) {
        setAffiliateCode(existingRef)
      }
    }
  }, [searchParams])

  // Simulate dynamic viewers
  useEffect(() => {
    const interval = setInterval(() => {
      setViewersCount(prev => Math.max(3, prev + Math.floor(Math.random() * 3) - 1))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Fetch landing page data
  const { data: landingPage, isLoading, error } = useQuery<LandingPageData>({
    queryKey: ['/api/public-landing', slug],
    queryFn: async () => {
      const res = await fetch(`/api/public-landing/${slug}`)
      if (!res.ok) throw new Error('Landing page not found')
      return res.json()
    }
  })

  // Create order mutation
  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch('/api/landing-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          affiliateCode: affiliateCode
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create order')
      }
      
      return response.json()
    },
    onSuccess: () => {
      alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.')
      setOrderForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        quantity: 1,
        paymentMethod: 'cod',
        notes: ''
      })
      setShowOrderForm(false)
    },
    onError: () => {
      alert('Không thể đặt hàng. Vui lòng thử lại.')
    }
  })

  // Validation
  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Họ và tên là bắt buộc'
        if (value.trim().length < 2) return 'Họ và tên phải có ít nhất 2 ký tự'
        return ''
      case 'phone':
        if (!value.trim()) return 'Số điện thoại là bắt buộc'
        const phoneRegex = /^(\+84|0)[0-9]{9,10}$/
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Số điện thoại không hợp lệ (VD: 0123456789)'
        }
        return ''
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email không hợp lệ'
        }
        return ''
      case 'address':
        if (!value.trim()) return 'Địa chỉ giao hàng là bắt buộc'
        if (value.trim().length < 10) return 'Vui lòng nhập địa chỉ chi tiết'
        return ''
      default:
        return ''
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setValidationErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleSubmitOrder = () => {
    // Validate all fields
    const errors: { [key: string]: string } = {}
    errors.name = validateField('name', orderForm.name)
    errors.phone = validateField('phone', orderForm.phone)
    errors.email = validateField('email', orderForm.email)
    errors.address = validateField('address', orderForm.address)
    
    setValidationErrors(errors)
    
    if (Object.values(errors).some(error => error)) {
      alert('Vui lòng kiểm tra lại thông tin.')
      return
    }

    const totalPrice = (landingPage?.finalPrice || 0) * orderForm.quantity

    const orderData = {
      landingPageId: landingPage?.id,
      customerInfo: {
        name: orderForm.name,
        phone: orderForm.phone,
        email: orderForm.email,
        address: orderForm.address
      },
      productInfo: {
        productId: landingPage?.product?.id,
        variantId: null,
        quantity: orderForm.quantity,
        unitPrice: landingPage?.finalPrice,
        totalPrice: totalPrice
      },
      paymentMethod: orderForm.paymentMethod,
      deliveryType: 'standard',
      notes: orderForm.notes
    }

    orderMutation.mutate(orderData)
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      )
    }
    return stars
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (error || !landingPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Trang không tồn tại</h2>
            <p className="text-gray-600 mb-4">
              Trang landing page bạn tìm không tồn tại hoặc đã bị xóa.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const discountPercent = landingPage.product.originalPrice 
    ? Math.round(((landingPage.product.originalPrice - landingPage.finalPrice) / landingPage.product.originalPrice) * 100)
    : 0

  const totalPrice = landingPage.finalPrice * orderForm.quantity
  const slides = landingPage.product.images?.length > 0 
    ? landingPage.product.images.map(url => ({ url }))
    : [{ url: landingPage.product.image }]

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader storeName="Landing Page" />
      
      <div className="max-w-4xl mx-auto bg-white">
        {/* Hero Image/Video Slider */}
        <ImageSlider slides={slides} autoplay autoplayDelay={4000} />

        {/* Social Proof Bar */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{viewersCount} người đang xem</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span>Bán chạy nhất tuần</span>
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="p-4 space-y-4">
          {/* Title and Price */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-red-500">HOT</Badge>
              {discountPercent > 0 && (
                <Badge className="bg-orange-500">-{discountPercent}%</Badge>
              )}
              <Badge className="bg-green-600">Freeship</Badge>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {landingPage.title || landingPage.product.name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-red-600">
                {formatVietnamPrice(landingPage.finalPrice)}
              </span>
              {landingPage.product.originalPrice > landingPage.finalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatVietnamPrice(landingPage.product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Reviews */}
          {landingPage.reviewsData && landingPage.reviewsData.totalReviews > 0 && (
            <div className="flex items-center gap-2 py-2 border-t border-b">
              <div className="flex">
                {renderStars(landingPage.reviewsData.averageRating)}
              </div>
              <span className="text-gray-600">
                {landingPage.reviewsData.averageRating.toFixed(1)} ({landingPage.reviewsData.totalReviews} đánh giá)
              </span>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 py-4">
            <div className="text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Chính hãng 100%</p>
            </div>
            <div className="text-center">
              <Truck className="h-8 w-8 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Freeship toàn quốc</p>
            </div>
            <div className="text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-gray-600">Giao hàng nhanh</p>
            </div>
          </div>

          {/* Description */}
          <div className="border-t pt-4">
            <h2 className="text-lg font-semibold mb-2">Mô tả sản phẩm</h2>
            <div className="prose prose-sm max-w-none text-gray-700">
              {landingPage.description || landingPage.product.description}
            </div>
          </div>

          {/* Benefits */}
          {landingPage.product.short_description && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Lợi ích nổi bật
              </h3>
              <ul className="space-y-2">
                {landingPage.product.short_description.split('\n').map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <ChevronRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reviews Section */}
          {landingPage.reviewsData && landingPage.reviewsData.reviews?.length > 0 && (
            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-3">Đánh giá từ khách hàng</h2>
              <ProductReviews 
                productId={landingPage.product.id}
                reviews={landingPage.reviewsData.reviews.slice(0, 5)}
              />
            </div>
          )}
        </div>

        {/* Order Form Section */}
        {!showOrderForm ? (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Giá chỉ từ</p>
                <p className="text-xl font-bold text-red-600">
                  {formatVietnamPrice(landingPage.finalPrice)}
                </p>
              </div>
              <Button 
                onClick={() => setShowOrderForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg flex-shrink-0"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Đặt hàng ngay
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 pb-24 bg-gray-50">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Thông tin đặt hàng</h2>
                
                <div className="space-y-4">
                  {/* Quantity */}
                  <div>
                    <Label>Số lượng</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrderForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={orderForm.quantity}
                        onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        className="w-20 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOrderForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={orderForm.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className={validationErrors.name ? 'border-red-500' : ''}
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={orderForm.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className={validationErrors.phone ? 'border-red-500' : ''}
                    />
                    {validationErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email (tùy chọn)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={orderForm.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className={validationErrors.email ? 'border-red-500' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                    <Textarea
                      id="address"
                      value={orderForm.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      rows={3}
                      className={validationErrors.address ? 'border-red-500' : ''}
                    />
                    {validationErrors.address && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label>Phương thức thanh toán</Label>
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={orderForm.paymentMethod === 'cod'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: 'cod' }))}
                          className="text-green-600"
                        />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank_transfer"
                          checked={orderForm.paymentMethod === 'bank_transfer'}
                          onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: 'bank_transfer' }))}
                          className="text-green-600"
                        />
                        <span>Chuyển khoản ngân hàng</span>
                      </label>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                    <Textarea
                      id="notes"
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                      placeholder="Thời gian giao hàng, yêu cầu đặc biệt..."
                    />
                  </div>

                  {/* Total Price */}
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Tổng thanh toán:</span>
                      <span className="text-2xl font-bold text-red-600">
                        {formatVietnamPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowOrderForm(false)}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={orderMutation.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {orderMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom padding when order form is not shown */}
      {!showOrderForm && <div className="h-24" />}
    </div>
  )
}
