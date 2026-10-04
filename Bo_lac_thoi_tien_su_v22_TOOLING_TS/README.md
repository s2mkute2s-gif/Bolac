# Bộ lạc thời tiền sử — chạy mã Java gốc trên web

Bản 2 thay hoàn toàn bản remake trước đó. Game logic không còn nằm trong engine JavaScript tự sáng tác. `original-web/classes.json` chứa constant pool, trường, mã bytecode và bảng ngoại lệ trích xuất từ 7 lớp game nguyên gốc trong JAR; trình chạy JavaScript thực thi các hàm này. `original-web/resources/` giữ nguyên 31 tệp tài nguyên không phải class trong JAR. Màn hình, menu, bản đồ, hội thoại, nghề, công trình, chiến đấu, chiến dịch và định dạng lưu đều do mã gốc xử lý.

Đồ họa gốc 240 × 320 được giữ lại để ưu tiên yêu cầu chuyển nguyên bản. Không dùng nền/công trình/nhân vật tạo mới từ bản remake. Bản cũ vẫn nằm trong lịch sử Git.

## Chạy

`npm start`, mở http://localhost:8080. Hoặc phục vụ thư mục `dist` bằng máy chủ HTTP tĩnh bất kỳ. Không cần máy chủ gameplay hay API. Không dùng file:// vì ứng dụng có ES modules và tải tài nguyên bằng fetch.

`dist` là bản xuất bản; `original-web` là nguồn tương ứng. Khi sửa nguồn cần đồng bộ sang `dist` trước khi xuất bản. `reference/Bolacthoitiensu.jar` giữ tệp người dùng gửi nguyên vẹn.

## Điều khiển và lưu

- 2/4/6/8 hoặc mũi tên: di chuyển. 5 hoặc Enter: chọn.
- 1/3/7/9 và 0/*/#: chức năng gốc tùy màn.
- Hai phím mềm: nút ✓ và ↩, hoặc Q và E/Escape trên bàn phím.
- Lưu bằng menu trong game: khi không ở menu phụ, nhấn phím mềm phải để mở menu tạm dừng, chọn **Lưu lại**.
- Đọc bản lưu: **Bắt đầu trò chơi → Chiến dịch → Tiếp tục** sau khi mở lại game.
- RMS gốc lưu trong localStorage theo tiền tố `tribes-original-rms:`. Tùy chọn ngoài game cho phép xuất/nhập toàn bộ record RMS. Dữ liệu của bản remake cũ không tương thích và không bị xóa.
- Bộ đệm service worker hỗ trợ tải lại tài nguyên đã tải. Khả năng mở offline của URL riêng tư còn phụ thuộc lớp đăng nhập Sites; chưa kiểm thử offline end-to-end.

## Độ nguyên vẹn

SHA-256 JAR: `4028818ccc92daa9ce051ea3d57c36f25b337d416c2d584903ab595526eac6ba`.

- 7 lớp game: a, b, c, d, e, f, tribes.
- 399 hàm; 157600 byte mã lệnh gốc.
- 103 loại opcode xuất hiện trong game; trình chạy xử lý các opcode đó.
- Tất cả 31 tệp tài nguyên được so sánh byte-for-byte với JAR.
- Không thực thi MIDlet quảng cáo riêng `WapTai/COM/WapTai`; entrypoint game là `tribes`. Tài nguyên splash đóng gói trong game vẫn giữ nguyên.

`python3 port-tools/extract.py` tạo lại dữ liệu từ JAR; `python3 port-tools/audit.py` xuất bản kiểm kê hàm, hash từng phương thức/tệp và danh sách opcode tại `port-tools/preservation-audit.json`.

## Lớp tương thích

`vm.js`: số nguyên có dấu, long 64-bit, stack/locals, array có dấu, chuyển kiểu, điều khiển luồng, gọi hàm, khởi tạo lớp và xử lý ngoại lệ Java; lập lịch Thread.

`midp.js`: canvas/graphics/image MIDP, clip/anchor/transform sprite, byte stream/data stream, Java Random, System, Display, RMS và media bridge. `midi.js` đọc nhạc MIDI gốc và tổng hợp trong Web Audio. Nốt, nhịp và program change được đọc từ MIDI; âm sắc không mô phỏng chính xác từng synthesizer điện thoại Java.

## Kiểm tra đã làm

- `npm test`: 7 kiểm tra VM, số nguyên/long, ngoại lệ, byte có dấu, descriptor, số lượng phương thức và nhịp MIDI.
- `npm run test:original`: chạy trực tiếp toàn bộ bytecode gốc bằng Node + Canvas, bấm phím qua chọn ngôn ngữ/nhạc, chọn chiến dịch/dễ/hướng dẫn, các đoạn mở đầu, lời thoại, vào làng, mở menu xây, menu hệ thống, lưu game, khởi động lại VM và tiếp tục từ RMS gốc.
- Bài tích hợp cần `@napi-rs/canvas` trong môi trường; có thể dùng `CODEX_PRIMARY_RUNTIME_NODE_MODULES` nếu được cung cấp. Người chơi web không cần gói này.
- Ảnh đầu ra Canvas và nhật ký kiểm tra nằm trong `port-tools`. Đây là ảnh thật của mã gốc thực thi, không phải mockup.
- `port-tools/integration-report.json` ghi kết quả, số lệnh và record RMS được lưu/đọc. `rmsRoundTripExact` kiểm tra record đọc lại trùng nguyên byte.

Giới hạn xác minh: chưa chơi hết 10 chiến dịch, chưa kiểm thử thiết bị Android/trình duyệt thực và chưa có phép so sánh từng khung hình với máy Java gốc. Giữ toàn bộ mã game không đồng nghĩa đã chứng minh mọi API/thời điểm/âm sắc giống 100% trên mọi thiết bị. Ngoại lệ trong c tại pc 337 được bảng ngoại lệ của game gốc bắt lại; không làm dừng game trong các luồng đã kiểm tra. Các lớp API không được game này sử dụng không phải phạm vi của runtime.

## Tiếng Việt có dấu

Toàn bộ 229 nhãn, 72 mục trợ giúp và 236 mục hội thoại (kể cả mục trống của định dạng gốc) có bảng Unicode riêng tại `original-web/locale/vi.json`. Phông DejaVu Sans Bold được đóng gói cùng giấy phép để hỗ trợ dấu tiếng Việt, không phụ thuộc phông thiết bị. Cầu nối `unicode-text.js` chỉ thay cách trình bày chữ, giữ quy tắc Java và dữ liệu lưu gốc. Hội thoại được đo chiều rộng và phân trang lại theo khung 240 × 320.

Đã kiểm tra bằng Node native Canvas: menu, hội thoại, vào làng, menu xây dựng, lưu và đọc lại dữ liệu RMS chính xác từng byte, không có lỗi chưa xử lý. Chưa kiểm thử toàn bộ chiến dịch hoặc trên mọi trình duyệt điện thoại.

## Nâng đồ họa đợt 1

`art.js` giữ toàn bộ tọa độ Java nhưng vẽ trên canvas 720 × 960. Các bề mặt trung gian cũng tăng 3 lần để ảnh mới không bị thu về 240 × 320. Menu chính có tranh mới; atlas địa hình thay cỏ/đất/nước; trang phục và cơ thể dân làng dùng các phần ảnh vẽ mới được ánh xạ lại vào ô hoạt ảnh gốc. Khuôn mặt nhỏ, cây, đá, công trình và biểu tượng còn dùng đồ họa gốc, chưa phải thay mới toàn bộ tài nguyên.

Ba ảnh được tạo bằng công cụ imagegen tích hợp, mỗi ảnh một lần. Brief menu: làng tiền sử vẽ tay, rừng cọ/vách đá/sông/voi ma mút, ánh bình minh, hai nhân vật ở góc dưới, khoảng trống tối ở giữa, không chữ. Brief địa hình: ba dải bằng nhau cỏ/đất vàng/nước xanh nhìn từ trên. Brief nhân vật: giữ bố cục atlas gốc và làm lại trang phục da thú có đổ bóng, nền trong suốt. Ảnh nhân vật không giữ bố cục yêu cầu nên không thay atlas trực tiếp: chương trình lấy vùng thân/chân/tay và ghép vào vị trí cũ; các khuôn mặt và nhận diện gốc giữ nguyên.

Ảnh dùng trong web nằm tại `original-web/art/menu.webp`, `terrain.webp`, `character.webp`. Kiểm thử `node port-tools/run-hd.mjs` chạy menu, hội thoại, làng, lưu/khôi phục, và xác nhận sáu lần thay atlas trên hai lần khởi động. Đây là kiểm thử Node Canvas, chưa phải kiểm thử trình duyệt điện thoại.

## Sửa lệch trang phục

Đã gỡ ánh xạ cơ thể dân làng từ ảnh tạo mới vì các vùng thân/tay/chân không đúng bố cục và điểm ghép của atlas gốc. Nhân vật trở về toàn bộ atlas gốc, bao gồm mọi tư thế và hai biến thể màu. Map, menu và độ phân giải hiển thị mới vẫn giữ nguyên. Không còn tải ảnh nhân vật không tương thích khi khởi động.

## Thanh chi tiết nhân vật

Thanh nhân vật được chọn ở đầu màn hình dùng nền xanh tối, viền vàng và khung tròn cho chân dung. Các ô xóa số được vẽ đồng nhất với nền; các thanh trạng thái, tên, tuổi và kỹ năng vẫn do game gốc cập nhật. Nhận diện hai loại bảng nhân vật của game (chọn trên map và danh sách), không thay bố cục menu thao tác phía dưới. Chân dung vẫn là ảnh gốc được hiển thị mượt trong khung mới; bộ chân dung vẽ lại chưa hoàn thành vì công cụ tạo ảnh từ chối kết quả. Không đụng tới sprite cơ thể/hoạt ảnh.

`port-tools/probe-details.mjs` kiểm tra chọn dân làng, xem giải thích, bỏ chọn, vào danh sách và chọn người khác; ảnh kiểm chứng `detail-probe-2.png` và `detail-probe-10.png`.

## Avatar dân làng vẽ mới

Bộ 20 chân dung mới (12 nam, 8 nữ) tại `art/villager-avatars.webp`, nguồn 1122 × 1402 px, khoảng 280 px mỗi mặt. Khi game yêu cầu chân dung dân làng từ atlas 121 × 151 gốc, `GameArt.avatar` chọn đúng ô theo chỉ số khuôn mặt rồi vẽ trực tiếp từ nguồn mới vào khung tròn ở độ phân giải cao, không đưa ảnh qua atlas 30 px. Không thay sprite trên map, không đổi dữ liệu dân làng. Các chân dung nhân vật đặc biệt ở atlas khác vẫn giữ nguyên. Kiểm tra 20/20 ô bằng `verify-avatars.mjs` và chọn/đổi dân làng bằng `probe-details.mjs`.

Ảnh tạo bằng imagegen tích hợp theo mô tả: lưới 4 × 5, 20 khuôn mặt hoạt hình người trưởng thành đa dạng, nam ở ba hàng đầu, nữ hai hàng cuối, phong cách minh họa tiền sử sắc nét, nền xanh rừng, không chữ.

## Khởi động HD

Bỏ hiển thị và giải mã hai logo mở đầu `/l0` (WapTai), `/l1` (con kiến); bỏ ba lần chờ tổng cộng 5 giây chỉ trong `tribes.run`. Vẫn chạy phần khởi tạo game gốc. Ảnh `/l2` được thay trực tiếp bằng tranh mới `art/startup-hd.webp`, nguồn 1086 × 1448, giữ kích thước tọa độ gốc. Màn chọn ngôn ngữ và âm nhạc vẫn giữ nguyên.

Tranh do imagegen tích hợp tạo theo bố cục ảnh khởi động gốc: tiêu đề đá PREHISTORIC TRIBES, gia đình trước lều, rừng cọ, nồi trên bếp lửa, phong cách hoạt hình sắc nét. `verify-startup.mjs` xác nhận chỉ vẽ trạng thái mở đầu 2/5, không giải mã logo cũ, bỏ đúng ba khoảng chờ, vào được menu và không có lỗi chưa xử lý.

## Sửa avatar theo giới tính

Chân dung ở bảng chọn trên map và danh sách lấy giới tính từ byte 1515 + ID dân làng trong dữ liệu Java gốc (0 nam, 1 nữ), dùng đúng ID của từng bảng. Chọn ảnh trong nhóm 12 nam hoặc 8 nữ; không suy đoán giới tính từ vị trí atlas. Ngữ cảnh không xác định giữ ảnh gốc. Không sửa dữ liệu lưu hoặc sprite cơ thể.

`verify-avatars.mjs`: 80 tổ hợp gồm 20 vị trí ảnh, hai giới tính và hai bảng chọn. `probe-gender.mjs`: chạy game gốc và chuyển qua danh sách dân làng, xác nhận cả nam và nữ, không lỗi VM; kết quả tại `gender-report.json`. Ảnh kiểm chứng `gender-male-check.png` và `gender-female-check.png`.

## Biểu tượng thanh nhân vật sắc nét

`hud-icons.js` vẽ lại các ký hiệu chức năng trực tiếp theo độ phân giải Canvas: máu, thức ăn, nghỉ ngơi, giới tính, năm mức tâm trạng, chiến đấu, tốc độ, kỹ năng dân sự, nghề nghiệp, hàng hóa và vũ khí. Ánh xạ đúng hình chữ nhật trong atlas gốc; chỉ áp dụng cho hai loại bảng nhân vật 4/12. Biểu tượng nghỉ ngơi ghép từ nhiều mảnh được thay đồng bộ để không sót pixel cũ. Thanh chỉ số giữ cách cắt theo giá trị của Java, vẽ lại màu chuyển mượt. Không đổi dữ liệu nhân vật, logic hay điều khiển.

`probe-icons.mjs` chạy game Java qua chọn/bỏ chọn nhân vật và danh sách dân làng, ghi nhận 24 loại ký hiệu được thay, 1.563 lượt vẽ và không lỗi VM trong lần kiểm tra. Xem `icons-report.json`, `hd-icons-male.png`, `hd-icons-female.png`. Đã kiểm tra ảnh ở độ phân giải 720 × 960 bằng Node Canvas; chưa kiểm tra trực tiếp trên điện thoại.

## Điều khiển cảm ứng

Bỏ bàn phím số ảo, mở rộng vùng chơi theo khung nhìn. `touch.js` quy đổi tọa độ con trỏ từ kích thước hiển thị về 240 × 320, nhận chạm vào menu chữ và dãy biểu tượng, chạm cơ thể dân làng hoặc ô bản đồ, vuốt camera và nhấn giữ/kéo để chọn nhóm. Hai góc dưới tương ứng các phím mềm gốc; ô nhóm 7/9 và biểu tượng bản đồ nhỏ nhận chạm, giữ ô nhóm để gán. Hướng dẫn tiếng Việt đã đổi sang cách dùng cảm ứng. Bàn phím máy tính vẫn hỗ trợ.

Chỉ cập nhật con trỏ/menu/camera của Java rồi gửi sự kiện phím gốc; không thay luật di chuyển, xây dựng, tài nguyên hoặc định dạng lưu. Có kiểm soát một ngón tay, ngưỡng phân biệt vuốt/chạm, hủy khi mất tương tác hoặc tạm dừng và loại bỏ lệnh chờ khi màn hình đã đổi.

Kiểm tra `verify-touch.mjs`: khởi động, ngôn ngữ, menu, tùy chọn, chiến dịch, hội thoại, chọn Mumbo, di chuyển tới ô [5,11], vuốt camera, dãy thao tác, chọn Tazza qua danh sách, chọn công trình/vị trí đặt/hủy, lưu game và chọn nhóm bằng nhấn giữ/kéo. Lưu tạo bản ghi t1 và t0 gốc; không có lỗi VM. `verify-touch-events.mjs` kiểm tra quy đổi tọa độ ở ba kích thước, ngón tay thứ hai, hủy con trỏ, mất capture và chặn thao tác khi tạm dừng. Kết quả `touch-report.json`. Kiểm tra bằng Node Canvas và sự kiện con trỏ giả lập; chưa kiểm tra trực tiếp trên điện thoại.
