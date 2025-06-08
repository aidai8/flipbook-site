const url = 'book.pdf';
const container = document.getElementById('flipbook');
const isMobile = window.innerWidth <= 900;

pdfjsLib.getDocument(url).promise.then(pdf => {
    const numPages = pdf.numPages;
    const pages = [];

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

    const loadAll = [];
    for (let i = 1; i <= numPages; i++) {
        loadAll.push(loadPage(i));
    }

    Promise.all(loadAll).then(() => {
        pages.forEach(wrapper => container.appendChild(wrapper));

        // Расчёт адаптивного размера
        const pageWidth = 843;
        const pageHeight = 600;
        const maxBookWidth = window.innerWidth * 0.95;
        const scale = isMobile ? 1 : Math.min(maxBookWidth / (pageWidth * 2), 1);

        const bookWidth = isMobile ? pageWidth * scale : pageWidth * 2 * scale;
        const bookHeight = pageHeight * scale;

        $('#flipbook').turn({
            width: bookWidth,
            height: bookHeight,
            autoCenter: true,
            display: isMobile ? 'single' : 'double',
            elevation: 50,
            gradients: true
        });

        if (isMobile) {
            enableTouchSwipe(document.getElementById('flipbook'));
        }
    });
});

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
