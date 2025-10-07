#!/bin/bash
# Tạo icon placeholders (cần ImageMagick)
# Nếu không có ImageMagick, tải icon từ internet
echo "Note: Icon placeholders cần ImageMagick để tạo"
echo "Hoặc tải icon từ: https://www.flaticon.com/"
echo ""
echo "Tạm thời tạo file placeholder..."

for size in 16 48 128; do
  echo "Creating icon${size}.png placeholder..."
  cat > "icon${size}.png" << 'ICON'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
ICON
done

echo "Done! Replace with real icons later."
