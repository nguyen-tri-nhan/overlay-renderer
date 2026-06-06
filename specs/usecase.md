# Use Cases — Circle Display

## Actors
- **User** — người dùng app

## Scope V1
- Desktop app (Electron)
- 1 màn hình duy nhất
- Không hỗ trợ di chuyển/resize shape sau khi vẽ

---

## UC-01: Chuyển sang Edit Mode
**Trigger:** User muốn vẽ hình mới
**Hotkey:** `Ctrl+Alt+Shift+1`
**Flow:**
1. User nhấn hotkey (hoặc click nút "Edit" trên toolbar)
2. System hiển thị toolbar/panel công cụ
3. System bật nhận mouse event trên canvas
4. System đổi cursor về dạng crosshair/pencil

---

## UC-02: Chuyển sang Display Mode
**Trigger:** User muốn dùng app khác trong khi vẫn thấy hình
**Hotkey:** `Ctrl+Alt+Shift+1` (toggle lại từ Edit Mode)
**Flow:**
1. User nhấn hotkey (hoặc click nút "Display" trên toolbar)
2. System ẩn toolbar
3. System gọi `setIgnoreMouseEvents(true)` — click xuyên qua window
4. Các hình đã vẽ vẫn hiển thị đè lên màn hình

---

## UC-03: Vẽ hình tròn (Circle)
**Precondition:** Đang ở Edit Mode
**Flow:**
1. User chọn tool "Circle"
2. User click điểm tâm, kéo để xác định bán kính
3. System preview hình tròn realtime khi kéo
4. User thả chuột → System lưu shape vào danh sách

---

## UC-04: Vẽ hình Ellipse
**Precondition:** Đang ở Edit Mode
**Flow:**
1. User chọn tool "Ellipse"
2. User click-drag để vẽ bounding box
3. System preview ellipse realtime khi kéo
4. User thả chuột → System lưu shape vào danh sách

---

## UC-05: Chấm điểm (Dot)
**Precondition:** Đang ở Edit Mode
**Flow:**
1. User chọn tool "Dot"
2. User click lên canvas
3. System vẽ 1 chấm tại vị trí đó, lưu shape

---

## UC-06: Chọn màu
**Precondition:** Đang ở Edit Mode
**Flow:**
1. User mở color picker trên toolbar
2. User chọn màu
3. System áp dụng màu cho các shape sẽ vẽ tiếp theo

---

## UC-07: Xóa shape
**Precondition:** Đang ở Edit Mode
**Flow:**
1. User click vào shape đã vẽ để select
2. User nhấn `Delete`
3. System xóa shape khỏi canvas

---

## UC-08: Xóa toàn bộ canvas
**Precondition:** Đang ở Edit Mode
**Flow:**
1. User nhấn "Clear All"
2. System hiện confirm dialog
3. User xác nhận → System xóa tất cả shapes

---

## UC-09: Lưu file
**Precondition:** Đang ở Edit Mode, canvas có ít nhất 1 shape
**Flow:**
1. User nhấn `Ctrl+S`
2. System mở Save dialog (lần đầu) hoặc lưu đè file hiện tại
3. System lưu danh sách shapes ra file (JSON)

---

## UC-10: Mở file
**Flow:**
1. User nhấn `Ctrl+O`
2. System mở Open dialog
3. User chọn file JSON đã lưu trước
4. System load shapes và render lên canvas
5. System chuyển sang Edit Mode
