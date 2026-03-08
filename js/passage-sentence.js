// Hàm kiểm tra phần tử có nằm trong viewport không
function isInViewport(element) {
const rect = element.getBoundingClientRect();
return rect.top < window.innerHeight && rect.bottom >= 0;
}
let activeImageCard = null;

function showImageCard(imageData) {
if (activeImageCard) {
closeImageCard();
}

```
const card = document.createElement('div');
card.className = 'image-card';
card.innerHTML = imageData.imageSrc
    ? `<img src="${imageData.imageSrc}" alt="${imageData.character}">
       <h3>${imageData.character}</h3>
       <p>${imageData.meaning}</p>
       <p>${imageData.pinyin}</p>`
    : `<h3>${imageData.character}</h3>
       <p>${imageData.meaning}</p>
       <p>${imageData.pinyin}</p>`;

document.body.appendChild(card);
activeImageCard = card;
```

}

function closeImageCard() {
if (activeImageCard) {
activeImageCard.style.display = ‘none’;
activeImageCard = null;
}
}

document.addEventListener(‘click’, (event) => {
if (activeImageCard && !activeImageCard.contains(event.target)) {
closeImageCard();
}
});

// ── Main load function ──
function loadPosts(startpId, endpId, listId) {
const itemList = document.getElementById(listId);

```
const filesToFetch = [
    'data/p-words.json',
    'data/passage-sentence.json'
];

Promise.all(filesToFetch.map(file =>
    fetch(file).then(response => {
        if (!response.ok) throw new Error(`Failed to fetch ${file}`);
        return response.json();
    })
))
.then(allData => {
    const imagesData   = allData.filter((_, i) => filesToFetch[i].includes('p-words')).flat();
    const sentenceData = allData.filter((_, i) => filesToFetch[i].includes('passage-sentence')).flat();

    // Support both string and number IDs
    const filteredPosts = sentenceData.filter(post =>
        Number(post.id) >= Number(startpId) && Number(post.id) <= Number(endpId)
    );

    filteredPosts.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'animate box';

        const row = document.createElement('div');
        row.className = 'row';

        // ── Audio / TTS span ──
        const audio = document.createElement('span');
        audio.className = 'audio';
        audio.textContent = '☊';
        audio.style.cursor = 'pointer';
        audio.title = 'Listen';

        audio.addEventListener('click', () => {
            if (item.audioSrc && item.audioSrc.trim()) {
                // Has a real audio file — play it
                const audioElement = new Audio(item.audioSrc);
                audioElement.play();
            }
            // If empty, the TTS patch in writing-post.html will handle it
        });

        // ── Toggle description button ──
        const toggleButton = document.createElement('button');
        toggleButton.className = 'toggle-description';
        toggleButton.textContent = '⬇️';

        const p = document.createElement('p');
        p.className = 'description';
        p.itemProp = 'description';
        p.innerHTML = item.description.replace(/\\n/g, '<br>');
        p.style.display = 'none';

        toggleButton.addEventListener('click', () => {
            if (p.style.display === 'block') {
                p.style.display = 'none';
                toggleButton.textContent = '⬇️';
            } else {
                p.style.display = 'block';
                toggleButton.textContent = '⬅️';
            }
        });

        li.appendChild(audio);
        li.appendChild(toggleButton);

        // ── Sentence h2 with segments & highlights ──
        const h2 = document.createElement('h2');
        h2.itemProp = 'name';

        // Build a trimmed highlight set for fast lookup
        // FIX: trim both segment and highlight values before comparing
        //      so trailing spaces from the builder don't break matching
        const highlightSet = new Set(
            (item.highlight || []).map(h => h.trim())
        );

        (item.segments || []).forEach(segment => {
            const span = document.createElement('span');
            span.textContent = segment; // keep original (with space) for display
            span.style.cursor = 'pointer';

            // FIX: compare trimmed segment against trimmed highlight set
            if (highlightSet.has(segment.trim())) {
                span.classList.add('highlight');

                span.addEventListener('click', (event) => {
                    event.stopPropagation();
                    // Look up by trimmed value
                    const imageData = imagesData.find(
                        image => image.character === segment.trim()
                    );
                    if (imageData) showImageCard(imageData);
                });
            }

            h2.appendChild(span);
        });

        li.appendChild(row);
        li.appendChild(h2);
        li.appendChild(p);
        itemList.appendChild(li);

        // Viewport animation
        if (isInViewport(li)) {
            setTimeout(() => li.classList.add('visible'), 100 * index);
        }
        window.addEventListener('scroll', () => {
            if (isInViewport(li)) li.classList.add('visible');
        });
    });
})
.catch(error => {
    console.error('Error fetching JSON files:', error);
});
```

}