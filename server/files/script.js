const defaultLanguage = php_var.Language;
let errorMessages = {};

document.addEventListener("DOMContentLoaded", function() {
  // Создаем элемент загрузчика
  var pageloader = document.createElement("div");
  pageloader.className = "pageloader";

  // Добавляем CSS стили
  var styles = `
  .pageloader {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    z-index: 9999;
    background: url("https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif") 50% 50% no-repeat rgb(249, 249, 249);
    opacity: 0.8;
  }`;
  
  var styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  
  // Вставляем элемент загрузчика сразу после тега <body>
  document.body.insertBefore(pageloader, document.body.firstChild);
  
  // Скрываем загрузчик после полной загрузки страницы
  window.addEventListener("load", function() {
      $(".pageloader").hide();
  });
});


// Тексты ошибок и статусов проверки данных на двух языках
async function loadErrorMessages() {
  try {
    const response = await fetch("errorMessages.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    errorMessages = await response.json();
    // Теперь errorMessages содержит все тексты ошибок и статусов
    console.log(errorMessages);
  } catch (error) {
    console.error("Error loading error messages:", error);
  }
}

// Вызов функции для загрузки сообщений об ошибках
loadErrorMessages();

toastr.options = {
  positionClass: "toast-top-right", // Позиция отображения
  timeOut: "7000", // Время отображения (5 секунд)
  extendedTimeOut: "1000", // Время отображения после наведения курсора (1 секунда)
  "z-index": 9999, // Устанавливаем высокий z-index
  closeButton: true,
  preventDuplicates: true,
  tapToDismiss: true,
};

function getErrorMessage(key, lang = defaultLanguage) {
  const selectedLang = errorMessages[lang] ? lang : "en";
  return errorMessages[selectedLang][key] || errorMessages["en"][key];
}

// Инициализация формы
function initializeForm() {
  console.log("Form Activation");
  initializeFormSubmission();
  disableSubmitButton();

  function initializeFormSubmission() {
    $("#registrationForm").on("submit", function (e) {
      e.preventDefault();
      var isButtonEnabled = !$(this).prop("disabled");
      var isFormValid =
        $("#firstName").hasClass("valid") &&
        $("#lastName").hasClass("valid") &&
        $("#phone").hasClass("valid") &&
        ($("#email").length === 0 || $("#email").hasClass("valid"));

      if (isFormValid && isButtonEnabled) {
        const payLoad = {
          firstName: $("#firstName").val(),
          lastName: $("#lastName").val(),
          email: $("#email").val(),
          phoneNumber: php_var.phone,
        };

        Object.keys(php_var).forEach((key) => {
          if (!payLoad.hasOwnProperty(key)) {
            payLoad[key] = php_var[key];
          }
        });

        const formData = new FormData();
        for (const key in payLoad) {
          formData.append(key, payLoad[key]);
        }

        $.ajax({
          url: "../api/action.php",
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          dataType: "json",
          beforeSend: function () {
            $(".pageloader").show();
            disableSubmitButton();
          },
          success: function (response) {
            if (response.status === "success") {
              localStorage.setItem("thanks", true);
              toastr.success(getErrorMessage("thanks"));
              // console.log("response success");
              window.location.href = "thankyou.php";
            } else {
              toastr.success(getErrorMessage("thanks"));
              // console.log("response false");
              window.location.href = "thankyou.php";
            }
          },
          error: function () {
            toastr.error(getErrorMessage("ajaxError"));
            $(".pageloader").hide();
            enableSubmitButton();
          },
        });
      } else {
        console.log("Форма не валидна, Ajax запрос не отправлен.");
        $(".pageloader").hide();
        enableSubmitButton();
      }
    });
  }

  function disableSubmitButton() {
    $("#registrationForm button[type=submit]")
      .prop("disabled", true)
      .css("opacity", "0.3");
  }

  function enableSubmitButton() {
    $("#registrationForm button[type=submit]")
      .prop("disabled", false)
      .css("opacity", "1");
  }

  function toggleSubmitButton() {
    var isFormValid =
      $("#firstName").hasClass("valid") &&
      $("#lastName").hasClass("valid") &&
      $("#phone").hasClass("valid") &&
      ($("#email").length === 0 || $("#email").hasClass("valid"));

    $("#registrationForm button[type=submit]")
      .prop("disabled", !isFormValid)
      .css("opacity", isFormValid ? "1" : "0.3");
  }

  function handleMutations(mutations) {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        toggleSubmitButton();
      }
    });
  }

  var observer = new MutationObserver(handleMutations);
  var config = { attributes: true, attributeFilter: ["class"] };

  $("#firstName, #lastName, #phone, #email").each(function () {
    observer.observe(this, config);
  });

  function loadScript(src, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }

  loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/js/utils.js",
    function () {
      console.log("Intl Tel Input Utils Loaded");
      initializePhoneValidation();
    }
  );

  loadScript("mailcheck.min.js", function () {
    console.log("Mailcheck Loaded");
    initializeEmailValidation();
  });

  function initializePhoneValidation() {
    var phoneInputField = document.querySelector("#phone");

    var phoneInput = window.intlTelInput(phoneInputField, {
      initialCountry: "auto",
      separateDialCode: true,
      formatOnDisplay: true,
      autoPlaceholder: "polite",
      placeholderNumberType: "MOBILE",
      showSelectedDialCode: true,
      geoIpLookup: function (callback) {
        $.get("https://ipinfo.io", function () {}, "jsonp").always(function (
          resp
        ) {
          var countryCode = resp && resp.country ? resp.country : "RU";
          callback(countryCode);
        });
      },
      utilsScript:
        "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.2.16/js/utils.js",
    });

    var form = document.querySelector("#registrationForm");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      validatePhoneNumber(phoneInput, phoneInputField, defaultLanguage, false);
  });
  

    document
      .querySelectorAll("#firstName, #lastName")
      .forEach(function (input) {
        input.addEventListener("blur", function (event) {
          validateNameField(event);
        });
      });

    phoneInputField.addEventListener("blur", function () {
      validatePhoneNumber(phoneInput, phoneInputField);
    });

    // Обновляем placeholder при смене страны
    phoneInputField.addEventListener("countrychange", function () {
      updatePlaceholder(phoneInput, phoneInputField);
    });

    // Устанавливаем первоначальный placeholder
    updatePlaceholder(phoneInput, phoneInputField);
  }

  function initializeEmailValidation() {
    var emailInputField = document.querySelector("#email");

    if (emailInputField) {
      emailInputField.addEventListener("blur", function () {
        validateEmail(emailInputField);
      });
    }
  }

  function validateNameField(event, lang = defaultLanguage) {
    var input = event.target;
    var value = input.value;
    var valid = true;
    var errorKeyPrefix =
      input.id === "firstName" ? "invalidFirstName" : "invalidLastName";
    var validKeyPrefix =
      input.id === "firstName" ? "validFirstName" : "validLastName";

    if (value.length < 2) {
      toastr.error(getErrorMessage(`${errorKeyPrefix}Length`, lang));
      valid = false;
    } else if (!value.match(/^[а-яА-ЯёЁa-zA-Z\s]+$/)) {
      toastr.error(getErrorMessage(`${errorKeyPrefix}Characters`, lang));
      valid = false;
    } else {
      toastr.success(getErrorMessage(validKeyPrefix, lang));
    }

    input.classList.toggle("invalid", !valid);
    input.classList.toggle("valid", valid);
  }

  function validatePhoneNumber(phoneInput, input, lang = defaultLanguage, loaderHide = true) {
    var phoneNumber = phoneInput.getNumber();
    const { parsePhoneNumberFromString } = libphonenumber;
    var countryData = phoneInput.getSelectedCountryData();

    // Проверка, был ли вызван $(".pageloader").show()
    if (!$(".pageloader").is(':visible')) {
        $(".pageloader").show();
    }

    fetch(
      `../api/getNumberType.php?phoneNumber=${encodeURIComponent(
        phoneNumber
      )}&numberRegion=${countryData.iso2.toUpperCase()}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Добавляем логирование данных ответа

        if (loaderHide) {
            $(".pageloader").hide();
        }

        if (data.success) {
          try {
            const parsedNumber = parsePhoneNumberFromString(phoneNumber);
            if (!parsedNumber) {
              setInvalidPhoneInput(input, "invalidPhoneNumber", lang);
              return;
            }
            php_var.phone = parsedNumber.format("E.164");

            if (
              phoneInput.isValidNumber() &&
              parsedNumber.isValid() &&
              parsedNumber.isPossible() &&
              data.numberType != 10
            ) {
              setValidPhoneInput(input, lang);
            } else {
              console.log("1");
              setInvalidPhoneInput(input, "invalidPhoneNumber", lang);
            }
          } catch (error) {
            console.log(error);
            console.log("2");
            setInvalidPhoneInput(input, "invalidPhoneNumber", lang);
          }
        } else {
          console.log("3");
          setInvalidPhoneInput(input, "invalidPhoneNumber", lang);
        }
      })
      .catch((error) => {
        if (loaderHide) {
            $(".pageloader").hide();
        }
        console.error(error); // Логирование ошибки
        setInvalidPhoneInput(input, "serverError", lang);
      });
}


  function validateEmail(input, lang = defaultLanguage) {
    var email = input.value;
    var valid = true;

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toastr.error(getErrorMessage("invalidEmail", lang));
      valid = false;
    } else {
      Mailcheck.run({
        email: email,
        suggested: function (suggestion) {
          var $toast = toastr.error(`Did you mean ${suggestion.full}?`);
          $toast.on("click", function () {
            input.value = suggestion.full;
            validateEmail(input, lang);
          });
          valid = false;
        },
        empty: function () {
          toastr.success(getErrorMessage("validEmail", lang));
        },
      });
    }

    input.classList.toggle("invalid", !valid);
    input.classList.toggle("valid", valid);
  }

  function setValidPhoneInput(input, lang) {
    input.classList.remove("invalid");
    input.classList.add("valid");
    toastr.success(getErrorMessage("validPhoneNumber", lang));
  }

  function setInvalidPhoneInput(input, errorKey, lang) {
    input.classList.remove("valid");
    input.classList.add("invalid");
    toastr.error(getErrorMessage(errorKey, lang));
  }

  function updatePlaceholder(phoneInput, input) {
    const countryData = phoneInput.getSelectedCountryData();
    const exampleNumber = intlTelInputUtils.getExampleNumber(
      countryData.iso2,
      true,
      intlTelInputUtils.numberFormat.INTERNATIONAL
    );
    input.placeholder = exampleNumber;
  }
}

// Создание наблюдателя
var isFormInitialized = false;

var observer = new MutationObserver(function (mutations) {
  var registrationForm = document.getElementById("registrationForm");
  if (!isFormInitialized && registrationForm) {
    initializeForm();
    isFormInitialized = true;
    observer.disconnect();
  }
});

var config = {
  childList: true,
  subtree: true,
};

observer.observe(document.body, config);
