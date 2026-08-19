// Toàn bộ câu chữ hiển thị trên website — trích nguyên văn từ
// website-copy-the-final-ten.md. Không diễn giải lại, không thêm bớt.

export const journeyName = "THE FINAL TEN";
export const oneLine = "Tập riêng từng ngày. Đứng chung một vạch xuất phát.";

export const hero = {
  eyebrow: "DINH HARVEST FINAL 2026 · 10K · NÚI DINH",
  title: "THE FINAL TEN",
  subtitle: "Mười cây số cuối cùng của năm.",
  intro: ["Cuộc đua bắt đầu trước tiếng còi xuất phát rất lâu.", "Nó bắt đầu từ buổi tập hôm nay."],
  countdownLabel: "CÒN LẠI TRƯỚC 07:00 · 27.12.2026",
  countdownMeta: "10 KM · KHOẢNG 410 M+ · HỒ BÊN SUỐI · CUT-OFF 5 GIỜ",
  primaryCta: "Xem việc của hôm nay",
  secondaryCta: "Ghi lại buổi vừa xong",
};

export const promiseSection = {
  title: "MỘT NGÀY HẸN Ở NÚI DINH",
  body: [
    "Ngày 27 tháng 12 rồi cũng sẽ tới.",
    "Hai người sẽ có mặt ở Hồ Bên Suối, đứng trước cùng một vạch xuất phát và bắt đầu mười cây số cuối cùng của năm.",
    "Nhưng ngày hôm đó không quyết định toàn bộ câu chuyện. Phần lớn câu chuyện được viết từ trước: trong những buổi chạy rất chậm, những ngày chân nặng, những lần phải dừng đúng lúc và những hôm vẫn xỏ giày dù chẳng có ai nhìn thấy.",
    "Không ai cần một hành trình hoàn hảo. Chỉ cần khi đứng ở vạch xuất phát, không ai phải nghĩ:",
  ],
  quote: "“Giá như mình đã tập nghiêm túc hơn.”",
  closing: "Đây là nơi hai người giữ lại lời hẹn đó.",
};

export const dualDashboard = {
  title: "HAI NGƯỜI. MỘT VẠCH XUẤT PHÁT.",
  lead: oneLine,
  statLabels: ["BUỔI ĐÃ HOÀN THÀNH", "TỔNG QUÃNG ĐƯỜNG", "TUẦN HIỆN TẠI", "LẦN TẬP GẦN NHẤT"],
  footer: "Không cần giống nhau ở mọi chỉ số. Chỉ cần trung thực với cùng một lời hẹn.",
};

export const todayTask = {
  title: ["ĐỪNG NGHĨ ĐẾN MƯỜI CÂY.", "NGHĨ ĐẾN BUỔI TẬP TRƯỚC MẶT."],
  intro: "Đích đến còn ở phía trước. Việc cần làm thì nằm ngay hôm nay.",
  workoutLabel: "BÀI HÔM NAY",
  viewDetailCta: "Xem chi tiết bài",
  logCta: "Ghi kết quả",
  restDay: {
    title: "HÔM NAY LÀ NGÀY NGHỈ.",
    body: "Nghỉ đúng cũng là một phần của giáo án. Đừng biến sự sốt ruột thành một buổi tập thừa.",
  },
  bothDone: {
    title: "HAI Ô XANH. MỘT NGÀY KHÔNG BỊ PHÍ.",
    body: "Hôm nay, cả hai đều giữ lời.",
  },
  reduced: {
    title: "BIẾT GIẢM BÀI CŨNG LÀ BIẾT TẬP.",
    body: "Giữ đôi chân lành là một phần của con đường đến ngày 27 tháng 12.",
  },
  onePersonDone(doneName, remainingName) {
    return {
      title: `${doneName} đã xong phần của mình.`,
      body: `${remainingName} còn một lời hẹn chưa giữ.`,
    };
  },
};

export const weeklyPromises = {
  title: "NHỮNG LỜI HẸN CỦA TUẦN NÀY",
  lead: "Giáo án không được đo bằng những gì đã dự định. Nó được đo bằng những buổi thực sự đã làm.",
  statusLabels: {
    upcoming: "CHƯA ĐẾN",
    unlogged: "CHƯA GHI NHẬN",
    completed: "ĐÃ HOÀN THÀNH",
    adjusted: "ĐÃ ĐIỀU CHỈNH",
    recovery: "NGHỈ PHỤC HỒI",
    missed: "ĐÃ BỎ LỠ",
  },
  weekOpen: "Tuần này vẫn chưa khép lại.",
  weekComplete: { title: "THÊM MỘT TUẦN NẰM LẠI PHÍA SAU.", body: "Những gì cần làm đã được làm." },
  weekMissed: "Một ô trống không phá hỏng cả hành trình. Nhưng để nó lặp lại thì có thể.",
};

export const roadToNuiDinh = {
  title: "ĐƯỜNG TỚI NÚI DINH KHÔNG BẮT ĐẦU Ở NÚI DINH.",
  lead: "Nó bắt đầu ở những con đường quen, những vòng chạy ngắn và những buổi tập chẳng có gì để khoe. Từng tuần một, những đoạn đường nhỏ đó sẽ dẫn tới vạch xuất phát.",
  axisName: "ROAD TO 27.12",
  reachedMilestone: {
    title: "MỘT MỐC NỮA ĐÃ Ở PHÍA SAU.",
    body: "Đường tới Núi Dinh ngắn đi thêm một đoạn.",
  },
};

export const numbers = {
  title: "NHỮNG GÌ ĐÃ THỰC SỰ ĐƯỢC LÀM",
  lead: "Những con số không kể hết hành trình. Nhưng chúng không cho phép ta nhớ sai về nó.",
  metricLabels: [
    "TỔNG SỐ BUỔI",
    "TỔNG QUÃNG ĐƯỜNG",
    "TỶ LỆ BÁM GIÁO ÁN",
    "TUẦN ĐỀU NHẤT",
    "BÀI TEST GẦN NHẤT",
    "SỐ NGÀY CÒN LẠI",
  ],
  chartLead: "Không tìm người thắng trong từng buổi easy. Chỉ nhìn xem ai đang trở nên sẵn sàng hơn.",
  testCompareLabel: "BÀI KIỂM TRA ĐỐI ĐẦU",
  testLine: "Cùng bài. Cùng điều kiện. Lúc này mới tính chuyện nhanh hơn.",
};

export const journalSection = {
  title: "NHỮNG NGÀY KHÔNG AI NHÌN THẤY",
  lead: [
    "Vạch đích sẽ có người chụp. Những ngày xây nên vạch đích thì thường không.",
    "Giữ lại ở đây một tấm ảnh, một đoạn đường, một lần chân nặng hoặc một buổi bất ngờ thấy mình khỏe hơn. Đến cuối hành trình, những điều nhỏ đó mới là phần đáng nhớ nhất.",
  ],
  addCta: "Thêm một trang nhật ký",
  uploadHint: "Kéo ảnh vào đây hoặc chọn từ thiết bị",
  promptHints: ["Hôm nay chân thế nào?", "Điều gì khó nhất?", "Có khoảnh khắc nào muốn nhớ lại không?"],
  empty: "Chưa có gì ở đây. Hành trình đã bắt đầu, nhưng chưa ai giữ lại một khoảnh khắc.",
  archiveCaption: "Ảnh tư liệu · Trail Station · Núi Dinh",
  archiveExplain: "Không khí từ những mùa trước. Hành trình của Nam Quốc và Hồng Phúc sẽ được viết tiếp tại đây.",
};

export const raceDaySection = {
  eyebrow: "DINH HARVEST FINAL 2026 · CỰ LY 10K",
  title: "NGÀY HẸN",
  lead: "Đây là lúc mọi buổi tập thôi còn là kế hoạch.",
  schedule: [
    { time: "06:00–06:45", label: "Tập trung và gửi đồ" },
    { time: "06:45", label: "Khởi động và phổ biến an toàn" },
    { time: "07:00", label: "Xuất phát cự ly 10K" },
    { time: "12:00", label: "Cut-off · Giới hạn hoàn thành 5 giờ" },
  ],
  specs: ["10 KM", "KHOẢNG 410 M+", "HỒ BÊN SUỐI · NÚI DINH"],
  ctaSchedule: "Xem lịch trình chính thức",
  ctaChecklist: "Mở checklist ngày thi",
  closing: "Khi đồng hồ về 0, không còn gì để cập nhật. Chỉ còn việc chạy.",
};

export const closingSection = {
  title: "NGÀY 27 THÁNG 12 SẼ ĐẾN DÙ HAI NGƯỜI CÓ SẴN SÀNG HAY KHÔNG.",
  body: "Phần còn lại là quyết định mình sẽ xuất hiện như thế nào.",
  footer: "THE FINAL TEN · ROAD TO DINH HARVEST FINAL 2026",
};

export const timeBasedCopy = {
  over90: { title: "Còn đủ xa để thay đổi. Nhưng không còn sớm để trì hoãn.", body: "Những bước chạy cuối năm được xây từ những ngày vẫn còn rất xa cuối năm." },
  d61to90: { title: "HÀNH TRÌNH ĐÃ ĐỦ DÀI ĐỂ NHÌN THẤY SỰ KHÁC BIỆT.", body: "Mỗi tuần trôi qua, đôi chân phải biết thêm một điều." },
  d31to60: { title: "NGÀY HẸN ĐÃ Ở ĐỦ GẦN ĐỂ KHÔNG THỂ TẬP MƠ HỒ.", body: "Những gì làm trong tháng này sẽ xuất hiện trên đường chạy." },
  d8to30: { title: "KHÔNG CÒN NHIỀU CHỖ CHO NHỮNG TUẦN BỊ PHÍ.", body: "Tập đúng. Nghỉ đúng. Đừng cố chứng minh điều gì trong một buổi tập." },
  d1to7: { title: "BÀI TẬP ĐÃ GẦN XONG. GIỜ LÀ LÚC GIỮ CHÂN NHẸ VÀ ĐẦU ÓC YÊN.", body: "Không còn gì để bù vào phút cuối. Hãy tin vào những gì đã thực sự làm." },
  raceDay: { title: "HÔM NAY KHÔNG CÒN LÀ ĐẾM NGƯỢC.", body: "07:00 · Hồ Bên Suối. Đến lúc chạy mười cây cuối cùng của năm." },
  afterBothFinished: { title: "MƯỜI CÂY CUỐI CÙNG ĐÃ NẰM LẠI PHÍA SAU.", body: "Đồng hồ đã dừng. Câu chuyện thì còn ở lại." },
  dnfOrDns: { title: "KHÔNG PHẢI MỌI HÀNH TRÌNH ĐỀU KHÉP LẠI THEO CÁCH ĐÃ DỰ TÍNH.", body: "Giữ lại sự thật của ngày hôm đó. Không tô đẹp, cũng không xóa bỏ những gì đã làm để tới được đây." },
};

export const workoutFeedback = {
  bothCompleted: ["Hai ô xanh. Hôm nay cả hai đều giữ lời.", "Một ngày nữa đã được làm cho xứng đáng."],
  namQuocFirst: "Nam Quốc đã xong phần của mình. Hồng Phúc còn một ô trống.",
  hongPhucFirst: "Hồng Phúc đã xong phần của mình. Nam Quốc còn một ô trống.",
  adjusted: ["Bài tập đã thay đổi. Lời hẹn thì chưa.", "Điều chỉnh để tiếp tục, không phải để trốn tránh."],
  recovery: ["Biết dừng đúng lúc cũng là một phần của việc tập nghiêm túc.", "Đi chậm hôm nay để còn đứng ở vạch xuất phát ngày 27 tháng 12."],
  missed: ["Một buổi bị bỏ lỡ không phá hỏng hành trình. Nhưng đừng để nó trở thành cách sống của tuần này.", "Ô trống này không tồn tại để kết tội. Nó tồn tại để không ai tự lừa mình."],
  testBetter: { title: "NHANH HƠN CHÍNH MÌNH CỦA LẦN TRƯỚC.", body: "Đây mới là một con số đáng giữ lại." },
  easyTooFast: "Nhanh hơn kế hoạch không có nghĩa là tốt hơn. Buổi easy chỉ hoàn thành đúng khi nó vẫn là easy.",
};

export const logForm = {
  title: "GHI LẠI MỘT BUỔI ĐÃ LÀM",
  lead: "Đừng kể đẹp hơn thực tế. Dữ liệu này tồn tại để hai người nhìn đúng hành trình của mình.",
  fields: {
    plannedWorkout: "Bài theo kế hoạch",
    actual: "Thực tế đã làm",
    distance: "Quãng đường (km)",
    duration: "Thời gian vận động (phút)",
    avgPace: "Pace trung bình",
    avgHr: "Nhịp tim trung bình",
    rpe: "Mức gắng sức · RPE 1–10",
    pain: "Đau hoặc khó chịu · 0–10",
    painLocation: "Vị trí khó chịu",
    notes: "Ghi chú muốn giữ lại",
    activityLink: "Link hoạt động",
    photo: "Ảnh kết quả",
  },
  rpeHint: "1 là rất nhẹ · 10 là nỗ lực tối đa",
  notesPlaceholder: "Chân thế nào? Hơi thở thế nào? Có điều gì cần nhớ cho buổi sau?",
  aiUploadTitle: "ĐƯA ẢNH KẾT QUẢ LÊN",
  aiUploadBody: "Hệ thống sẽ đọc những con số nhìn thấy. Kiểm tra lại trước khi lưu.",
  aiNote: "Bản demo tĩnh này chưa nối AI đọc ảnh — nhập tay các số liệu bên dưới.",
  saveCta: "Lưu buổi tập",
  successTitle: "ĐÃ GHI LẠI.",
  successBody: "Một buổi nữa đã ở phía sau.",
  errorMsg: "Chưa lưu được buổi tập. Dữ liệu vẫn còn trên màn hình — thử lại khi kết nối ổn định.",
  deleteCta: "Xóa buổi này",
  deleteConfirm: "Buổi tập sẽ bị xóa khỏi hành trình và các thống kê liên quan. Vẫn tiếp tục?",
};

export const planPage = {
  title: "TỪ HÔM NAY ĐẾN VẠCH XUẤT PHÁT",
  lead: "Một giáo án không hứa rằng mọi ngày đều thuận lợi. Nó chỉ giúp hai người biết hôm nay cần làm gì và khi nào phải biết lùi lại.",
  filters: ["Tuần này", "Tháng này", "Toàn hành trình"],
};

export const progressPage = {
  title: "NHỮNG THAY ĐỔI KHÔNG THỂ NHÌN THẤY TRONG MỘT NGÀY",
  lead: "Một buổi chạy hiếm khi thay đổi được điều gì. Nhiều buổi đặt cạnh nhau thì có.",
};

export const journalPage = {
  title: "NHỮNG NGÀY ĐÃ ĐI QUA",
  lead: "Không chỉ có pace và kilomet. Đây là nơi giữ lại những gì các con số không kể được.",
};

export const raceInfoPage = {
  title: "TRƯỚC KHI ĐẾN NÚI DINH",
  lead: "Lịch trình, thông số, trang bị và những việc phải biết trước 07:00 ngày 27 tháng 12.",
};

export const adminPage = {
  title: "CHỈNH LẠI HÀNH TRÌNH",
  lead: "Thay đổi giáo án, thông tin giải và các mốc quan trọng. Mọi thay đổi phải được ghi nhận, không âm thầm viết lại quá khứ.",
};

export const finishedHero = {
  title: "THE FINAL TEN — FINISHED",
  subtitle: "Mười cây cuối cùng đã nằm lại phía sau.",
  body: "Hai người đã đến Núi Dinh bằng hàng tháng tập luyện. Đây là những gì còn lại sau khi đồng hồ dừng.",
};

export const finishedResults = {
  title: "KẾT QUẢ NGÀY 27.12",
  fieldLabels: ["THỜI GIAN", "THỨ HẠNG", "CẢM NHẬN"],
};

export const finishedSummary = {
  title: "TRƯỚC KHI CÓ MỘT BUỔI SÁNG Ở NÚI DINH",
  questions: ["Điều gì đã khó hơn mình nghĩ?", "Nếu bắt đầu lại, mình sẽ làm khác điều gì?"],
  closing: "VẠCH ĐÍCH KHÉP LẠI CUỘC ĐUA. KHÔNG XÓA ĐI CON ĐƯỜNG ĐÃ DẪN TỚI NÓ.",
};

export const officialAssets = {
  keyVisual: {
    url: "https://tikpik.vn/media/uploads/2026/08/10/400x800_-_Avatar_18e22b43.webp",
    credit: "BTC Dinh Harvest Final 2026",
    alt: "Key visual chính thức Dinh Harvest Final 2026",
  },
  schedule: {
    url: "https://tikpik.vn/media/uploads/2026/08/06/Lich_Trinh_Su_Kien_-_DHFinal_d92a38c0.webp",
    credit: "BTC Dinh Harvest Final 2026",
    alt: "Lịch trình chính thức Dinh Harvest Final 2026",
  },
  distanceSpecs: {
    url: "https://tikpik.vn/media/uploads/2026/08/06/_Thong_So_Cu_Ly__-_DHFinal_edf6b824.webp",
    credit: "BTC Dinh Harvest Final 2026",
    alt: "Thông số các cự ly Dinh Harvest Final 2026",
  },
  expo: {
    url: "https://tikpik.vn/media/uploads/2026/08/06/Khu_Vuc_EXPO_-_DHFinal_94d2ee53.webp",
    credit: "BTC Dinh Harvest Final 2026",
    alt: "Khu vực Expo Dinh Harvest Final 2026",
  },
  previousSeasonAlbum: "https://tikpik.vn/events/dinh-harvest-winter-2025/photos/",
};
