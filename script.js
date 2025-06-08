const url = 'book.pdf';
const container = document.getElementById('flipbook');

pdfjsLib.getDocument(url).promise.then(pdf => {
    const numPages = pdf.numPages;
    const pages = [];

    const loadPage = pageNum => {
        return pdf.getPage(pageNum).then(page => {
            // Масштаб высокий для качества
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
            width: 1686,
            height: 600,
            autoCenter: true,
            display: 'double',
            elevation: 50,
            gradients: true
        });


    });
});
