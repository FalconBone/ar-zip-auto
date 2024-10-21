const express = require('express');
const multer = require('multer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const AdmZip = require('adm-zip'); // Для работы с архивами

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

// Функция для замены текстов и ссылок
function replaceContent($, oldName, newName, offerValueName) {
    if (oldName && newName) {
        $('body').each(function() {
            const bodyContent = $(this).html();
            const newContent = bodyContent.replace(new RegExp(oldName, 'g'), newName);
            $(this).html(newContent);
        });
    }

    const offerValueNameText = '{_offer_value:name}';
    if (offerValueName) {
        $('body').each(function() {
            const bodyContent = $(this).html();
            const newContent = bodyContent.replace(new RegExp(offerValueName, 'g'), offerValueNameText);
            $(this).html(newContent);
        });
    }
}

// Функция для добавления PHP перед </head>
function insertPHP($) {
    const headPHP =
        "\n<?php\n" +
        "\tinclude '../api/integration/back.php';\n" +
        "\tinclude '../api/integration/php_var_int.php';\n" +
        "?>\n";

    if (!$('html').html().includes(headPHP)) {
        const headCloseIndex = $('head').html();
        if (headCloseIndex) {
            $('head').append(headPHP);
        }
    }
}

// Функция для работы с оффером
function processOfferMode($) {
    // 1. Комментируем post/get запросы и удаляем intlTelInput.css
    $('script[src*="post"]').each(function() {
        const scriptContent = $(this).html();
        $(this).replaceWith(`<!-- ${scriptContent} -->`);
    });

    $('link[href*="intlTelInput.css"]').remove();

    // 2. Вставка кода в head и перед </body>
    const headContent = `
        <link rel="stylesheet" href="styles.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/js/intlTelInput.min.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/css/intlTelInput.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/libphonenumber-js/1.10.58/libphonenumber-js.min.js"></script>
    `;

    const bodyContent = `
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/2.1.4/toastr.min.js"></script>
        <script src="script.js"></script>
        <script src="mailcheck.min.js"></script>
    `;

    $('head').append(headContent);
    $('body').append(bodyContent);

    // 3. Добавление id="registrationForm" в <form>
    $('form').attr('id', 'registrationForm');

    // 4. Добавление id для <input> элементов
    $('input[name="firstName"]').attr('id', 'firstName');
    $('input[name="lastName"]').attr('id', 'lastName');
    $('input[name="email"]').attr('id', 'email');
    $('input[name="phone"]').attr('id', 'phone');

    // 5. Добавление класса к кнопке в форме
    $('form button').addClass('rf-form-button');
}

// Загрузка ZIP архива и работа с ним
app.post('/upload', upload.single('archive'), (req, res) => {
    const zip = new AdmZip(req.file.path);
    const zipEntries = zip.getEntries();

    let htmlFile = null;

    zipEntries.forEach((entry) => {
        if (entry.entryName === 'index.html') {
            htmlFile = entry.getData().toString('utf8');
        }
    });

    if (!htmlFile) {
        return res.status(400).json({ message: 'index.html not found in the archive' });
    }

    const $ = cheerio.load(htmlFile);

    // Проверяем какой режим выбран (prelanding или offer)
    const mode = req.body.mode; // Пусть с клиента передается режим

    if (mode === 'prelanding') {
        // Логика для prelanding
        replaceContent($, req.body.oldName, req.body.newName, req.body.offerValueName);
        insertPHP($);
    } else if (mode === 'offer') {
        // Логика для offer
        processOfferMode($);
    }

    // Обновляем HTML файл
    const updatedHTML = $.html();
    zip.updateFile('index.html', Buffer.from(updatedHTML));

    // Добавляем файлы в архив (script.js, mailcheck.min.js, styles.css, errorMessages.json)
    const filesToAdd = ['script.js', 'mailcheck.min.js', 'styles.css', 'errorMessages.json'];
    filesToAdd.forEach((file) => {
        zip.addLocalFile(path.join(__dirname, 'files', file));
    });

    // Сохраняем новый архив
    const outputPath = path.join(__dirname, 'uploads', 'modified.zip');
    zip.writeZip(outputPath);

    res.download(outputPath, (err) => {
        if (err) {
            console.error(err);
        }
        fs.unlinkSync(req.file.path); // Удаляем оригинальный архив
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
