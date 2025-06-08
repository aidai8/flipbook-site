const url = 'book.pdf';
const container = document.getElementById('flipbook');

// Проверим, мобильное ли устройство
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

        $('#flipbook').turn({
            width: isMobile ? window.innerWidth * 0.9 : 1686,
            height: isMobile ? 600 : 600,
            autoCenter: true,
            display: isMobile ? 'single' : 'double',
            elevation: 50,
            gradients: true
        });
    });
});
