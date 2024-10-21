const express = require('express');
const multer = require('multer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

let filepath;

// Обработка загруженного файла
app.post('/upload', upload.single('html'), (req, res) => {

    filepath = req.file.path;
    const html = fs.readFileSync(filepath, 'utf8');

    res.json(html)    
});

app.post('/form', (req, res) => {

    const { oldName, newName } = req.body;

    // Чтение HTML файла как текста
    const html = fs.readFileSync(filepath, 'utf8');

    // Используем Cheerio для работы с HTML
    const $ = cheerio.load(html);

    // 1. Замена имени на странице с помощью Cheerio
    if (oldName && newName) {
        $('body').each(function() {
            const bodyContent = $(this).html();
            const newContent = bodyContent.replace(new RegExp(oldName, 'g'), newName);
            $(this).html(newContent);
        });
    }

    const href = '{offer}'

    if (true) {
        $('a[href]').each(function() {
            $(this).attr('href', href);
        });

        // Также меняем в кнопках с атрибутом onclick
        $('button[onclick]').each(function() {
            $(this).attr('onclick', `window.location.href='${href}'`);
        });
    }

    // Теперь снова преобразуем содержимое HTML в строку
    html = $.html();

    // 3. Вставка PHP блока перед </head> через текстовые операции
    if (true) {
        const headCloseIndex = html.indexOf('</head>');
        if (headCloseIndex !== -1) {
            html = html.slice(0, headCloseIndex) + includeBlock + '\n' + html.slice(headCloseIndex);
        }
    }

    // Генерация нового HTML файла
    const outputFilePath = path.join(__dirname, 'uploads', `processed-${req.file.originalname}`);
    fs.writeFileSync(outputFilePath, html, 'utf8');

    // Отправка обработанного файла обратно пользователю
    res.download(outputFilePath, (err) => {
        if (err) {
            console.error(err);
        }
        // Удаление файлов после скачивания
        fs.unlinkSync(filepath);
        fs.unlinkSync(outputFilePath);
    });
})

// Запуск сервера
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});