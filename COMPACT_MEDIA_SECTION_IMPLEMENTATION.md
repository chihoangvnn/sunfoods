# Compact Media Section Implementation

## Problem Solved
The media section in `Step1BasicInfo` was taking 15+ lines due to:
- ImageUploader rendering its own multi-row UI
- Full-width stacked sections
- Large preview cards and drag-and-drop zones

## Solution Implemented

### 1. Created `CompactMediaSection` Component
Location: `admin-web/src/components/ProductFormTabbed.tsx` (lines 1044-1218)

### 2. Key Features

#### Ultra-Compact Layout (~4-6 lines total)
```
📸 Media
- Legacy URL:    [input field]                                    (1 line)
- Hình ảnh:      [thumb][thumb][thumb] [Upload btn] (3 ảnh)      (1-2 lines)
- Videos:        [thumb][thumb] [Upload btn] (2 video)            (1-2 lines)
```

#### Design Elements:
- **Compact headers**: `text-xs font-semibold py-1`
- **Minimal padding**: `p-2` on container
- **Small inputs**: `h-7 text-xs` for legacy URL input
- **Tiny thumbnails**: `w-12 h-12` (48px) for images/videos
- **Horizontal layout**: `flex gap-1 flex-wrap` for thumbnails
- **Inline controls**: Upload buttons integrated inline

#### Smart Upload System:
- **Click to upload**: Small buttons open full ImageUploader in dialogs
- **Image limit**: maxFiles={5} in dialog
- **Video limit**: maxFiles={3} in dialog
- **Thumbnail preview**: Shows existing media as small previews
- **Delete on hover**: X button appears on hover for each thumbnail

### 3. Implementation Details

#### Legacy Image URL (1 line)
```tsx
<div className="flex gap-2 items-center">
  <Label htmlFor="legacy-image" className="text-xs whitespace-nowrap w-24">URL Legacy:</Label>
  <Input className="text-xs h-7 flex-1" />
</div>
```

#### Cloudinary Images (1-2 lines)
```tsx
<div className="flex gap-2 items-start">
  <Label className="text-xs whitespace-nowrap w-24 pt-1">Hình ảnh:</Label>
  <div className="flex-1 flex gap-1 items-center flex-wrap">
    {/* 12x12px thumbnails in horizontal row */}
    <Button onClick={() => setShowImageUploader(true)} className="h-7 text-xs px-2">
      <Upload className="h-3 w-3 mr-1" />
      {formData.images?.length > 0 ? 'Thêm' : 'Upload'}
    </Button>
  </div>
</div>
```

#### Videos (1-2 lines)
- Same structure as images
- Shows video thumbnails with PlayCircle icon overlay

#### Upload Dialogs
- Opens full ImageUploader in modal when needed
- Maintains all functionality without taking up space
- User can still drag & drop, see progress, etc.

### 4. Acceptance Criteria - All Met ✅

✅ **Media section fits in ~5-8 lines TOTAL** (now ~4-6 lines instead of 15+)  
✅ **All upload functionality still works** (via dialogs)  
✅ **User can see and manage uploaded media** (thumbnails with delete buttons)  
✅ **Responsive behavior maintained** (flex-wrap handles overflow)

### 5. Technical Changes

#### Modified Files:
- `admin-web/src/components/ProductFormTabbed.tsx`
  - Line 967: Replaced old media section with `<CompactMediaSection />`
  - Lines 1044-1218: Added new CompactMediaSection component
  - Line 19: Added imports for `PlayCircle, Upload` icons

#### Component Structure:
```tsx
function CompactMediaSection({ formData, setFormData }: any) {
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  
  // Compact inline display + dialogs for uploading
  return (
    <>
      <div className="border rounded-lg p-2 space-y-1 bg-gray-50">
        {/* Legacy URL, Images, Videos - all compact */}
      </div>
      <Dialog>{/* Image uploader */}</Dialog>
      <Dialog>{/* Video uploader */}</Dialog>
    </>
  );
}
```

## Result
The media section is now **truly compact** at ~4-6 lines maximum, compared to the previous 15+ lines, while maintaining full functionality.
