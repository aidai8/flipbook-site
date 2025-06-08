const url = 'book.pdf';
const container = document.getElementById('flipbook');

// Проверка: мобильное устройство?
const isMobile = window.innerWidth <= 900;

// Подгрузка PDF
pdfjsLib.getDocument(url).promise.then(pdf => {
    const numPages = pdf.numPages;
    const pages = [];

    // Загрузка одной страницы
    const loadPage = pageNum => {
        return pdf.getPage(pageNum).then(page => {
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            return page.render({
                canvasContext: context,
                viewport: viewport
            }).promise.then(() => {
                const wrapper = document.createElement('div');
                wrapper.className = 'page-wrapper';
                wrapper.appendChild(canvas);
                pages[pageNum - 1] = wrapper;
            });
        });
    };

    // Загрузка всех страниц
    const loadAll = [];
    for (let i = 1; i <= numPages; i++) {
        loadAll.push(loadPage(i));
    }

    Promise.all(loadAll).then(() => {
        pages.forEach(wrapper => container.appendChild(wrapper));

        // Инициализация turn.js
        $('#flipbook').turn({
            width: isMobile ? window.innerWidth * 0.9 : 1686,
            height: isMobile ? 600 : 600,
            autoCenter: true,
            display: isMobile ? 'single' : 'double',
            elevation: 50,
            gradients: true
        });

        // Включаем свайп на мобильных
        if (isMobile) {
            enableTouchSwipe(document.getElementById('flipbook'));
        }
    });
});

// Функция свайпа
function enableTouchSwipe(flipbook) {
    let startX = 0;

    flipbook.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    flipbook.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const deltaX = endX - startX;

        if (Math.abs(deltaX) > 50) {
            if (deltaX < 0) {
                $('#flipbook').turn('next');
            } else {
                $('#flipbook').turn('previous');
            }
        }
    });
}
