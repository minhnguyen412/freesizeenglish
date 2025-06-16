// Hàm kiểm tra phần tử có nằm trong viewport không
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom >= 0;
}
let activeImageCard = null; // Biến để theo dõi image card đang mở

function showImageCard(imageData) {
    // Nếu đã có một card đang mở, đóng nó lại
    if (activeImageCard) {
        closeImageCard(); // Gọi hàm để đóng card hiện tại
    }

    // Kiểm tra xem imageSrc có tồn tại không
    if (imageData.imageSrc) {
        // Tạo mới card
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            <img src="${imageData.imageSrc}" alt="${imageData.character}">
            <h3>${imageData.character}</h3>
            <p>${imageData.meaning}</p>
            <p>${imageData.pinyin}</p>
        `;
        
        document.body.appendChild(card);
        activeImageCard = card; // Cập nhật activeImageCard với card mới
    } else {
        // Tạo mới card
        const card = document.createElement('div');
        card.className = 'image-card';
        card.innerHTML = `
            
            <h3>${imageData.character}</h3>
            <p>${imageData.meaning}</p>
            <p>${imageData.pinyin}</p>
        `;
        
        document.body.appendChild(card);
        activeImageCard = card; // Cập nhật activeImageCard với card mới
    }
}

// Hàm để đóng image card
function closeImageCard() {
    if (activeImageCard) {
        activeImageCard.style.display = 'none'; // Đóng card
        activeImageCard = null; // Reset activeImageCard
    }
}

// Thêm sự kiện click cho toàn bộ tài liệu
document.addEventListener('click', (event) => {
    // Kiểm tra xem click có xảy ra bên trong card không
    if (activeImageCard && !activeImageCard.contains(event.target)) {
        closeImageCard(); // Đóng card nếu click bên ngoài
    }
});
// Hàm chính để load posts với các tham số có thể thay đổi
function loadPosts(startpId, endpId, listId) {
    const itemList = document.getElementById(listId);

    // Danh sách các file JSON cần tải
    const filesToFetch = [
        '../data/p-words.json',
        '../data/passage-sentence.json'
        
    ];

    // Dùng Promise.all để tải nhiều file cùng lúc
    Promise.all(filesToFetch.map(file => fetch(file).then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch ${file}`);
        }
        return response.json();
    })))
    .then(allData => {
        // Gộp dữ liệu từ các file cùng loại
        const imagesData = allData.filter((_, index) => filesToFetch[index].includes('p-words')).flat();
        const sentenceData = allData.filter((_, index) => filesToFetch[index].includes('passage-sentence')).flat();

        console.log('Images Data:', imagesData);
        console.log('Sentence Data:', sentenceData);

        // Lọc bài viết theo ID từ startpId đến endpId
        const filteredPosts = sentenceData.filter(post => post.id >= startpId && post.id <= endpId);

        filteredPosts.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'animate box'; // Thêm class box cho hiệu ứng

            const row = document.createElement('div');
            row.className = 'row';
                    
            
            const audio = document.createElement('span');
            audio.className = 'audio';
            audio.textContent = '☊'; // Biểu tượng âm thanh
            audio.style.cursor = 'pointer'; // Thay đổi con trỏ khi hover

            // Thêm sự kiện click để phát âm thanh
            audio.addEventListener('click', () => {
                const audioElement = new Audio(item.audioSrc); // Tạo đối tượng Audio với đường dẫn
                audioElement.play(); // Phát âm thanh
            });

            const toggleButton = document.createElement('button');
            toggleButton.className = 'toggle-description';
            toggleButton.textContent = '⬇️';

            const p = document.createElement('p');
            p.className = 'description';
            p.itemProp = 'description';
            p.innerHTML = item.description.replace(/\\n/g, '<br>'); // Sử dụng innerHTML để hiển thị mô tả
            p.style.display = 'none';
            // Xử lý sự kiện click vào nút toggle
            toggleButton.addEventListener('click', () => {
                if (p.style.display === 'block') {
                    p.style.display = 'none';
                    toggleButton.textContent = '⬇️';
                } else {
                    p.style.display = 'block';
                    toggleButton.textContent = '⬅️';
                }
            });

            // Thêm avatar và user vào thẻ row
            
            li.appendChild(audio);
            li.appendChild(toggleButton);

            const h2 = document.createElement('h2');
            h2.itemProp = 'name';
                        
            // Tạo các phần tử từ segments
            item.segments.forEach(segment => {
                const span = document.createElement('span');
                span.textContent = segment;
                span.style.cursor = 'pointer';
                // Kiểm tra xem segment có nằm trong danh sách highlight không
                if (item.highlight.includes(segment.trim())) {
                    span.classList.add('highlight'); // Thêm class highlight
                    // Thêm sự kiện click vào từng cụm từ
                    span.addEventListener('click', (event) => {
                        event.stopPropagation(); // Ngăn chặn sự kiện click đi lên document
                        const imageData = imagesData.find(image => image.character === segment);
                        // Nếu không, mở image card mới
                        if (imageData) {
                            showImageCard(imageData);
                                        
                        }
                                
                                
                    });
                }
                h2.appendChild(span); // Thêm ký tự vào h2
            });

            li.appendChild(row);
            li.appendChild(h2);
            li.appendChild(p);
            itemList.appendChild(li);

            // Kiểm tra ngay khi tải trang với khoảng delay
            if (isInViewport(li)) {
                setTimeout(() => {
                    li.classList.add('visible');
                }, 100 * index); // Thêm khoảng delay dựa trên chỉ số của item
            }
             // Thêm sự kiện cuộn
            window.addEventListener('scroll', () => {
                if (isInViewport(li)) {
                    li.classList.add('visible');
                }
            });
        });
    })
    .catch(error => {
        console.error('Error fetching JSON files:', error);
    });
}
