const form = document.getElementById('form');
const scriptURL = 'https://script.google.com/macros/s/AKfycbw_sqzUBfBkWEOhg9hY9sK8XBvWKDEGJTzcoGidE6ijPTwesFTrh1UAY0mmmJmbF2S4/exec';
const errorIcon = '<i class="fa-solid fa-circle-exclamation"></i>';

const fields = [
    {
        id: 'name',
        label: 'Nome',
        validator: nameIsValid
    },
    {
        id: 'last-name',
        label: 'Sobrenome',
        validator: nameIsValid
    },
    {
        id: 'birthdate',
        label: 'Nascimento',
        validator: dateIsValid
    },
    {
        id: 'email',
        label: 'E-mail',
        validator: emailIsValid
    },
    {
        id: 'password',
        label: 'Senha',
        validator: passwordIsSecure
    },
    {
        id: 'confirm_password',
        label: 'Confirmar senha',
        validator: passwordMatch
    }
];

// Valida todos os campos, mostra os erros e devolve true (tudo certo) ou false
function validarFormulario() {
    let formularioValido = true;

    fields.forEach(function (field) {
        const input = document.getElementById(field.id);
        const inputBox = input.closest('.input-box');
        const errorSpan = inputBox.querySelector('.error');
        const resultado = field.validator(input.value);

        if (resultado.isValid) {
            errorSpan.innerHTML = '';
            inputBox.classList.add('valid');
            inputBox.classList.remove('invalid');
        } else {
            errorSpan.innerHTML = `${errorIcon} ${resultado.errorMessage}`;
            inputBox.classList.add('invalid');
            inputBox.classList.remove('valid');
            formularioValido = false;
        }
    });

    const radioContainer = document.querySelector('.radio-container');
    const genderErrorSpan = radioContainer.querySelector('.error');
    const selectedGender = [...document.getElementsByName('gender')].find(input => input.checked);

    if (selectedGender) {
        genderErrorSpan.innerHTML = '';
        radioContainer.classList.add('valid');
        radioContainer.classList.remove('invalid');
    } else {
        genderErrorSpan.innerHTML = `${errorIcon} Selecione um gênero!`;
        radioContainer.classList.add('invalid');
        radioContainer.classList.remove('valid');
        formularioValido = false;
    }

    return formularioValido;
}

form.addEventListener('submit', async (event) => {
    event.preventDefault(); // impede a página de recarregar

    if (!validarFormulario()) {
        return; // tem campo errado: para aqui e não envia nada
    }

    const dados = new FormData(form);
    dados.delete('confirm_password');

    const botao = form.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
        const resposta = await fetch(scriptURL, { method: 'POST', body: dados });
        const resultado = await resposta.json();

        if (resultado.result === 'success') {
            alert('Conta criada com sucesso!');
            form.reset();
            document.querySelectorAll('.valid').forEach(el => el.classList.remove('valid'));
        } else {
            throw new Error(resultado.error);
        }
    } catch (erro) {
        alert('Erro ao enviar: ' + erro.message);
    } finally {
        botao.disabled = false;
    }
});

function isEmpty(value) {
    return value.trim() === '';
}

function nameIsValid(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    };

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = 'O campo é obrigatório!';
        return validator;
    }

    const min = 3;
    if (value.length < min) {
        validator.isValid = false;
        validator.errorMessage = `O nome deve ter no mínimo ${min} caracteres!`;
        return validator;
    }

    const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!regex.test(value)) {
        validator.isValid = false;
        validator.errorMessage = 'O campo deve conter apenas letras!';
    }

    return validator;
}

function dateIsValid(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    };

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = 'O nascimento é obrigatório!';
        return validator;
    }

    const year = new Date(value).getFullYear();

    if (year < 1920 || year > new Date().getFullYear()) {
        validator.isValid = false;
        validator.errorMessage = 'Data inválida!';
        return validator;
    }

    return validator;
}

function emailIsValid(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    };

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = 'O e-mail é obrigatório!';
        return validator;
    }

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(value)) {
        validator.isValid = false;
        validator.errorMessage = 'O e-mail precisa ser válido!';
        return validator;
    }

    return validator;
}

function passwordIsSecure(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    };

    if (isEmpty(value)) {
        validator.isValid = false;
        validator.errorMessage = 'A senha é obrigatória!';
        return validator;
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!regex.test(value)) {
        validator.isValid = false;
        validator.errorMessage = `
            Sua senha deve conter ao menos: <br/>
            8 dígitos <br/>
            1 letra minúscula <br/>
            1 letra maiúscula <br/>
            1 número <br/>
            1 caractere especial!
        `;
        return validator;
    }

    return validator;
}

function passwordMatch(value) {
    const validator = {
        isValid: true,
        errorMessage: null
    };

    const passwordValue = document.getElementById('password').value;

    if (value === '' || passwordValue !== value) {
        validator.isValid = false;
        validator.errorMessage = 'Senhas não condizem!';
        return validator;
    }

    return validator;
}

const passwordIcons = document.querySelectorAll('.password-icon');

passwordIcons.forEach(icon => {
    icon.addEventListener('click', function () {
        const input = this.parentElement.querySelector('.form-control');
        input.type = input.type === 'password' ? 'text' : 'password';
        this.classList.toggle('fa-eye');
    });
});
