function Validator(options) {
    var selectorRules = {};

    // Hàm xử lý validate
    function validate(inputElm, rule) {
        var errorElm = inputElm.parentElement.querySelector(options.errorSelector);
        var errorMsg;
        // lấy ra các rule của selector
        var rules = selectorRules[rule.selector];
        // Lặp qua từng rule để kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for(var i = 0; i < rules.length; i++) {
            errorMsg = rules[i](inputElm.value);
            if(errorMsg) break;
        } 
                    
        if(errorMsg) {
            errorElm.innerText = errorMsg;
            inputElm.parentElement.classList.add('invalid');
        } else {
            errorElm.innerText = '';
            inputElm.parentElement.classList.remove('invalid');
        }

        return !errorMsg;
    }

    // Lấy elm của form cần validate
    var formElm = document.querySelector(options.form);
    
    if(formElm) {
        // Khi submit form
        formElm.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            // Thực hiện lặp qua từng rule và validate
            options.rules.forEach(function(rule) {
                var inputElm = formElm.querySelector(rule.selector);
                var isValid = validate(inputElm, rule);
                if(!isValid) {
                    isFormValid = false;
                }
            });

            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    // Lấy các input có thuộc tính và name và không có disabled
                    var enableInputs = formElm.querySelectorAll('[name]:not([disabled])'); 
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        return (values[input.name] = input.value) && values;
                    }, {});

                    options.onSubmit(formValues);
                } 
                // Trường hợp submit với trình duyệt mặt định
                else {
                    formElm.submit();
                }
            }
        }

        // Lặp qua mỗi rule  và xử lý (lắng nghe sự kiện blur, input)
        options.rules.forEach(function (rule) {
            // Lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            
            var inputElm = formElm.querySelector(rule.selector);
           
            if(inputElm) {
                // Xử lý blur ra ngoài
                inputElm.onblur = function() {
                    validate(inputElm, rule);
                }

                // Xử lý khi người dùng nhập
                inputElm.oninput = function() {
                    var errorElm = inputElm.parentElement.querySelector(options.errorSelector);

                    errorElm.innerText = '';
                    inputElm.parentElement.classList.remove('invalid');
                }
            }
        });
    }
}

// Định nghĩa các rule
// Nguyên tắc của các rules
// 1. Khi có lỗi => message lỗi
// 2. Khi hợp lệ => không trả ra gì cả (undifined)

Validator.isRequired = function(selector, message) {
    return {
        selector: selector,
        // validate
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        // validate
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email';
        }
    };
}

Validator.minLength = function(selector, min) {
    return {
        selector: selector,
        // validate
        test: function(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    };
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        // validate
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    };
}