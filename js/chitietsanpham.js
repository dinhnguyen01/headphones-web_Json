var nameProduct, maProduct; // Tên sản phẩm trong trang này, 
// là biến toàn cục để có thể dùng ở bát cứ đâu trong trang
// không cần tính toán lấy tên từ url nhiều lần

window.onload = function () {
    khoiTao();

    // thêm tags (từ khóa) vào khung tìm kiếm
    var tags = ["Apple", "Xiaomi", "Beats", "Oppo", "Sony", "JBL"];
    for (var t of tags) addTags(t, "index.html?search=" + t, true);

    phanTich_URL_chiTietSanPham();

    // autocomplete cho khung tim kiem
    autocomplete(document.getElementById('search-box'), listProducts);
}

function phanTich_URL_chiTietSanPham() {
    nameProduct = window.location.href.split('?')[1]; // lấy tên

    if (!nameProduct) return; // nếu không tìm thấy tên thì thoát hàm

    // tách theo dấu '-' vào gắn lại bằng dấu ' ', code này giúp bỏ hết dấu '-' thay vào bằng khoảng trắng.
    // code này làm ngược lại so với lúc tạo href cho sản phẩm trong file classes.js
    nameProduct = nameProduct.split('-').join(' ').replace(/%C3%AA/g, "ê");
    nameProduct = nameProduct.split('-').join(' ').replace(/%E1%BB%83/g, "ể");
    nameProduct = nameProduct.split('-').join(' ').replace(/%C4%90/g, "Đ");
    nameProduct = nameProduct.split('-').join(' ').replace(/%E1%BB%A5/g, "ụ");
    nameProduct = nameProduct.split('-').join(' ').replace(/%C3%B3/g, "ó");
    nameProduct = nameProduct.split('-').join(' ').replace(/%C3%A2/g, "â");

    console.log(nameProduct);

    for(var p of listProducts) {
        if(nameProduct == p.name) {
            maProduct = p.masp;
            break;
        }
    }

    var sanPham = timKiemTheoTen(listProducts, nameProduct)[0];
    var divChiTiet = document.getElementsByClassName('chitietSanpham')[0];

    // Đổi title
    document.title = nameProduct + ' - HeadPhone Store';

    // Cập nhật tên h1
    var h1 = divChiTiet.getElementsByTagName('h1')[0];
    h1.innerHTML += nameProduct;

    // Cập nhật sao
    var rating = "";
    if (sanPham.rateCount > 0) {
        for (var i = 1; i <= 5; i++) {
            if (i <= sanPham.star) {
                rating += `<i class="fa fa-star"></i>`
            } else {
                rating += `<i class="fa fa-star-o"></i>`
            }
        }
        rating += `<span> ` + sanPham.rateCount + ` đánh giá</span>`;
    }
    divChiTiet.getElementsByClassName('rating')[0].innerHTML += rating;

    // Cập nhật giá + label khuyến mãi
    var price = divChiTiet.getElementsByClassName('area_price')[0];
    if (sanPham.promo.name != 'giareonline') {
        price.innerHTML = `<strong>` + sanPham.price + `₫</strong>`;
        price.innerHTML += new Promo(sanPham.promo.name, sanPham.promo.value).toWeb();
    } else {
        document.getElementsByClassName('ship')[0].style.display = ''; // hiển thị 'giao hàng trong 1 giờ'
        price.innerHTML = `<strong>` + sanPham.promo.value + `&#8363;</strong>
					        <span>` + sanPham.price + `&#8363;</span>`;
    }

    // Cập nhật chi tiết khuyến mãi
    document.getElementById('detailPromo').innerHTML = getDetailPromo(sanPham);

    // Cập nhật thông số
    var info = document.getElementsByClassName('info')[0];
    var s = addThongSo('Thời gian sử dụng', sanPham.detail.info1);
    s += addThongSo('Thời gian sử dụng hộp sạc', sanPham.detail.info2);
    s += addThongSo('Cổng sạc', sanPham.detail.info3);
    s += addThongSo('Công nghệ âm thanh', sanPham.detail.info4);
    s += addThongSo('Tương thích', sanPham.detail.info5);
    s += addThongSo('Tiện ích', sanPham.detail.info6);
    s += addThongSo('Kết nối', sanPham.detail.info7);
    s += addThongSo('Phím điều kiển', sanPham.detail.info8);
    s += addThongSo('Sản xuất', sanPham.detail.info9);
    info.innerHTML = s;

    // Cập nhật hình
    var hinh = divChiTiet.getElementsByClassName('picture')[0];
    hinh = hinh.getElementsByTagName('img')[0];
    hinh.src = sanPham.img;
    document.getElementById('bigimg').src = sanPham.img;

    // Hình nhỏ
    addSmallImg("img/chitietsanpham/apple1.jpg");
    addSmallImg("img/chitietsanpham/apple2.jpg");
    addSmallImg("img/chitietsanpham/apple3.jpg");
    addSmallImg("img/chitietsanpham/apple4.jpg");
    addSmallImg("img/chitietsanpham/apple5.jpg");

    // Khởi động thư viện hỗ trợ banner - chỉ chạy sau khi tạo xong hình nhỏ
    var owl = $('.owl-carousel');
    owl.owlCarousel({
        items: 5,
        center: true,
        smartSpeed: 450,
    });
}


// Chi tiết khuyến mãi
function getDetailPromo(sp) {
    switch (sp.promo.name) {
        case 'tragop':
            var span = `<span style="font-weight: bold"> lãi suất ` + sp.promo.value + `% </span>`;
            return `Khách hàng có thể mua trả góp sản phẩm với ` + span + `với thời hạn 6 tháng kể từ khi mua hàng.`;

        case 'giamgia':
            var span = `<span style="font-weight: bold">` + sp.promo.value + `</span>`;
            return `Khách hàng sẽ được giảm ` + span + `₫ khi tới mua trực tiếp tại cửa hàng`;

        case 'moiramat':
            return `Khách hàng sẽ được trải nghiệm sản phẩm miễn phí tại cửa hàng. Có thể đổi trả sản phẩm lỗi trong vòng 2 tháng.`;

        case 'giareonline':
            var del = stringToNum(sp.price) - stringToNum(sp.promo.value);
            var span = `<span style="font-weight: bold">` + numToString(del) + `</span>`;
            return `Sản phẩm sẽ được giảm ` + span + `₫ khi mua hàng online bằng thẻ tín dụng hoặc các ví tiền điện tử`;

        default:
            var span = `<span style="font-weight: bold">Wave Tàu</span>`;
            return `Cơ hội trúng ` + span + ` khi trả góp qua thẻ`;
    }
}

function addThongSo(ten, giatri) {
    return `<li>
                <p>` + ten + `</p>
                <div>` + giatri + `</div>
            </li>`;
}

// add hình
function addSmallImg(img) {
    var newDiv = `<div class='item'>
                        <a>
                            <img src=` + img + ` onclick="changepic(this.src)">
                        </a>
                    </div>`;
    var banner = document.getElementsByClassName('owl-carousel')[0];
    banner.innerHTML += newDiv;
}

// đóng mở xem hình
function opencertain() {
    document.getElementById("overlaycertainimg").style.transform = "scale(1)";
}

function closecertain() {
    document.getElementById("overlaycertainimg").style.transform = "scale(0)";
}

// đổi hình trong chế độ xem hình
function changepic(src) {
    document.getElementById("bigimg").src = src;
}