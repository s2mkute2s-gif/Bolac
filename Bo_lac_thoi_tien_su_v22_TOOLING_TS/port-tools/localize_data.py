from pathlib import Path
import json
p=Path(__file__).resolve().parents[1];root=p/'original-web';src=root/'resources/0'
s=src.joinpath('s').read_text().split('|')
labels='''Kho vũ khí
Phòng tập
Lều
Lều tù trưởng
Bếp
Khu tập ném
Kho
Sàn nhảy
Thánh địa
Trung tâm PIA
Nhà trẻ
Chòi canh
Dùi cui
Đá
Giáo
Búa đá
Chùy xương
Rìu nhỏ
Bẫy lưới
Bẫy lò xo
Bẫy hầm
Xây dựng
Tập hợp!
Lệnh chiến đấu!
Dân làng
Giải tán
Trở lại làm việc
Nâng cấp
Phá hủy
Ra khỏi đây!
Chữa thương
Phòng thủ
Thuốc tình yêu
Bệnh dịch
Thông tin: tất cả
Thông tin: đã chọn
Ẩn thông tin
Sửa chữa
Hủy nâng cấp
Hủy sửa chữa
Hủy tải
Chọn tù trưởng
 được sinh ra
 được sinh ra
 đã chết
 đã chết
Công trình đã hoàn thành.
Phát hiện kẻ thù!
Chúng ta đang bị tấn công!
Công trình đã bị phá hủy!
Cần nguyên liệu!
Đã có quá nhiều công trình.
Dân số đã đạt giới hạn.
Chúng ta cần đầu bếp.
Chúng ta cần pháp sư.
Chúng ta cần thợ chế tạo vũ khí.
Chúng ta cần một DJ.
Bắt đầu trò chơi
Trợ giúp
Tùy chọn
Về trò chơi
Trò chơi khác
Thoát
Tiếp tục
Lưu lại
Chơi tiếp
Thoát
Trò chơi mới
Tiếp tục
Chiến dịch
Trò chơi tùy chỉnh
Hướng dẫn
Âm nhạc
Gợi ý
Tắt
Bật
Độ khó
Dễ
Khó
Cảnh báo!
Menu chính
Menu tạm dừng
Bên ngoài
Trả thù
Chạy trốn
Vùng đất hoang
Ngôi nhà mới
Hồ rồng
Vượt qua sa mạc
Rừng dây leo
Tàn sát
Mảnh đất
Tiếng Việt
Français
Italiano
Deutsch
Español
Điểm
Về trò chơi
Điều khiển
Cách chơi
Người dân
Hướng dẫn
Kết thúc
Tù trưởng nk2klove
Pháp sư
Bộ tộc ăn thịt người'''.splitlines()
assert len(labels)==107,len(labels)
s=labels+[x.capitalize() for x in s[107:]]
t='''Thợ chế tạo vũ khí làm việc tại đây.
Chiến binh rèn luyện kỹ năng cận chiến tại đây.
Người dân nghỉ ngơi, hồi sức tại đây. Mỗi lều có chỗ cho bốn người.
Tù trưởng nk2klove sống ở đây. Các bô lão cũng họp tại đây để bàn việc của bộ lạc.
Mọi người ăn uống tại đây. Cần một đầu bếp để nấu thức ăn.
Chiến binh rèn luyện kỹ năng ném tại đây.
Nơi cất giữ vũ khí và tài nguyên.
Người dân đến nghỉ ngơi, nhảy múa và uống Tigerilla để lấy lại tinh thần. Cần một DJ để bắt đầu buổi tiệc.
Pháp sư lắng nghe lời các vị thần tại đây. Ông có thể làm phép và chữa bệnh.
Cơ quan Tình báo Tiền sử đào tạo trinh sát. Họ nhìn xa hơn và có thể ẩn mình trước kẻ địch.
Trẻ nhỏ chơi ở đây thay vì đi lang thang trên bản đồ. Đúng là một nhà trẻ!
Lính canh nhìn xa hơn và có thể ném giáo từ trên chòi để tấn công kẻ địch.
Bộ lạc sắp chết đói! Chúng ta cần một cái bếp!
Không đủ chỗ ở! Hãy xây thêm lều.
Bộ lạc buồn bã quá! Một sàn nhảy sẽ giúp mọi người vui lên.
Chúng ta cần pháp sư để chữa bệnh cho dân làng!
Ááá! Quân địch ở đây! Ngươi có muốn ra gặp chúng không?
Á! Ta sắp bị ăn thịt! Mau đến cứu ta!
Ta cần cất vũ khí đi để làm việc này.
Ta cần một vũ khí ném để làm việc này.
Không có giáo thì làm sao ta bắt cá được, đại ca?
Trông ta giống trẻ con lắm à?
Ta mà làm thế thì tù trưởng nk2klove đánh chết mất!
Ngươi không biết bắt trẻ con lao động là vô đạo đức à?
Để ta yên, đại ca! Ta đang chán lắm.
Cho ta chút riêng tư đi, đồ quấy rối!
Tên nô lệ trước của ngươi chết thế nào, đồ bóc lột? Để ta kiếm cái gì ăn đã!
Ta nghỉ một chút được không? Ta sẽ làm bạn thân của ngươi!
Thú hoang vừa ăn thịt một đứa trẻ! Cần xây nhà trẻ để giữ bọn trẻ an toàn!
Quân địch đã bắt cóc một đứa trẻ! Cần xây nhà trẻ để bảo vệ bọn trẻ!
Tù trưởng nk2klove đã chết! Vậy thì… tốt nhất nên chọn người khác.
Ta tự nói chuyện với mình vì đó là cách duy nhất để có một cuộc trò chuyện thông minh… Chúng ta đâu có bị tâm thần phân liệt!
Có ai thấy người vẽ bản đồ đâu không…? Đừng nói anh ta lại làm hỏng việc nhé!
Đặt một công trình.
Chọn một người dân.
Chọn một khoảng đất.
Phá hủy? Bạn chắc chứ?
Ở đây không có việc gì để làm.
Dân số
Chỗ ở
Thức ăn
Gỗ
Đá
Xương
Giới tính
Tuổi
Hạnh phúc
Máu hiện tại / máu tối đa
Đói
Mệt mỏi
Vũ khí
Kỹ năng chiến đấu tốt nhất
Tốc độ
Hàng hóa
Nhiệm vụ hiện tại
Kỹ năng dân sự tốt nhất
Bạn đã thất bại!
Hoan hô! Bạn đã chiến thắng!
Chơi lại?
Bật âm nhạc?
Bật hướng dẫn?
Tạm dừng
Tất cả dữ liệu chiến dịch đã lưu sẽ mất! Tiếp tục?
Tiến trình của lần chơi này sẽ mất! Tiếp tục?
Dữ liệu đã lưu trước đó sẽ mất! Tiếp tục?
Tiến trình chưa lưu sẽ mất! Bạn vẫn muốn thoát?
Không đủ bộ nhớ để lưu trò chơi.
Đã lưu trò chơi.
Bạn muốn thoát trò chơi?
Vui lòng đợi…
Hãy xem phần hướng dẫn trước!'''.splitlines()+['']
assert len(t)==72,len(t)
# Each line is one unchanged story identifier; blank entries are retained.
d=Path(__file__).with_name('vi-dialogues.txt').read_text().splitlines();assert len(d)==236,len(d)
root.joinpath('locale/vi.json').write_text(json.dumps({'s':s,'t':t,'d0':d},ensure_ascii=False,indent=2))
print('Localized labels:',len(s),'help:',len(t),'story:',len(d))
