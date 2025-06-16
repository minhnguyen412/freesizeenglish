// Lấy id từ URL
function getPostIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id2'); // Trả về giá trị của tham số 'id'
}

// Hàm hiển thị bài viết
function displayPost(post) {
    const container = document.getElementById('post-container');
    
    // Khởi tạo nội dung HTML
    let content = `
        
        ${post.content.map(paragraph => `<p>${paragraph}</p>`).join('')}
    `;

    // Thêm hình ảnh nếu có
    if (post.imageSrc) {
        content = `<img src="${post.imageSrc}">` + content;
    }

    // Cập nhật nội dung vào container
    container.innerHTML = content;
}

// Hàm load bài viết từ file JSON
function loadPost() {
    const postId = getPostIdFromUrl();
    if (!postId) {
        document.getElementById('post-container').innerHTML = '<p>ID không hợp lệ.</p>';
        return;
    }

    const passageFiles = ['../data/book.json']; // Thêm các file tại đây

    const fetchPromises = passageFiles.map(file => fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error('Lỗi khi tải dữ liệu từ ' + file);
            }
            return response.json();
        })
    );

    Promise.all(fetchPromises)
        .then(allPosts => {
            // Kết hợp tất cả các bài viết từ các file
            const posts = allPosts.flat(); // Sử dụng flat() để kết hợp các mảng
            const post = posts.find(p => p.id === Number(postId));
            if (post) {
                displayPost(post);
            } else {
                document.getElementById('post-container').innerHTML = '<p>Bài viết không tồn tại.</p>';
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            document.getElementById('post-container').innerHTML = '<p>Lỗi khi tải bài viết.</p>';
        });
}

// Gọi hàm load bài viết
loadPost();
