document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-cadastro");
    const mensagemStatus = document.getElementById("mensagem-status");

    // Elementos do Formulário
    const nome = document.getElementById("nome");
    const email = document.getElementById("email");
    const telefone = document.getElementById("telefone");
    const cep = document.getElementById("cep");
    const rua = document.getElementById("rua");
    const numero = document.getElementById("numero");
    const bairro = document.getElementById("bairro");
    const cidade = document.getElementById("cidade");
    const estado = document.getElementById("estado");
    const senha = document.getElementById("senha");
    const confirmaSenha = document.getElementById("confirma-senha");

    // --- MÁSCARA E BUSCA AUTOMÁTICA DE CEP (ViaCEP) ---
    cep.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, ""); // Remove não dígitos
        if (valor.length > 8) valor = valor.slice(0, 8);
        if (valor.length > 5) {
            valor = valor.replace(/^(\d{5})(\d)/, "$1-$2"); // Formata 00000-000
        }
        e.target.value = valor;
    });

    cep.addEventListener("blur", () => {
        const cepLimpo = cep.value.replace(/\D/g, "");
        if (cepLimpo.length === 8) {
            buscarCep(cepLimpo);
        } else if (cepLimpo.length > 0) {
            mostrarErro(cep, "erro-cep", "CEP inválido (deve conter 8 dígitos).");
        }
    });

    async function buscarCep(cepDigitos) {
        limparErroCampo(cep, "erro-cep");
        
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepDigitos}/json/`);
            const dados = await resposta.json();

            if (dados.erro) {
                mostrarErro(cep, "erro-cep", "CEP não encontrado.");
                limparCamposEndereco();
            } else {
                rua.value = dados.logradouro || "";
                bairro.value = dados.bairro || "";
                cidade.value = dados.localidade || "";
                estado.value = dados.uf || "";
                numero.focus(); // Coloca o cursor direto no campo número
            }
        } catch (erro) {
            mostrarErro(cep, "erro-cep", "Erro ao buscar CEP. Verifique sua conexão.");
        }
    }

    function limparCamposEndereco() {
        rua.value = "";
        bairro.value = "";
        cidade.value = "";
        estado.value = "";
    }

    // --- VALIDAÇÃO E ENVIO DO FORMULÁRIO ---
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        limparErrosGerais();

        let valido = true;

        if (nome.value.trim() === "") {
            mostrarErro(nome, "erro-nome", "Informe seu nome completo.");
            valido = false;
        }

        if (email.value.trim() === "" || !validarEmail(email.value)) {
            mostrarErro(email, "erro-email", "Insira um e-mail válido.");
            valido = false;
        }

        if (telefone.value.trim() === "" || telefone.value.trim().length < 10) {
            mostrarErro(telefone, "erro-telefone", "Informe um telefone válido.");
            valido = false;
        }

        if (cep.value.trim() === "" || cep.value.replace(/\D/g, "").length !== 8) {
            mostrarErro(cep, "erro-cep", "Informe um CEP válido.");
            valido = false;
        }

        if (rua.value.trim() === "") {
            mostrarErro(rua, "erro-rua", "Informe o nome da rua.");
            valido = false;
        }

        if (numero.value.trim() === "") {
            mostrarErro(numero, "erro-numero", "Informe o número.");
            valido = false;
        }

        if (bairro.value.trim() === "") {
            mostrarErro(bairro, "erro-bairro", "Informe o bairro.");
            valido = false;
        }

        if (cidade.value.trim() === "") {
            mostrarErro(cidade, "erro-cidade", "Informe a cidade.");
            valido = false;
        }

        if (estado.value.trim() === "") {
            mostrarErro(estado, "erro-estado", "Informe o estado (UF).");
            valido = false;
        }

        if (senha.value.length < 6) {
            mostrarErro(senha, "erro-senha", "Mínimo 6 caracteres.");
            valido = false;
        }

        if (confirmaSenha.value === "") {
            mostrarErro(confirmaSenha, "erro-confirma-senha", "Confirme sua senha.");
            valido = false;
        } else if (senha.value !== confirmaSenha.value) {
            mostrarErro(confirmaSenha, "erro-confirma-senha", "As senhas não coincidem.");
            valido = false;
        }

        if (valido) {
            mensagemStatus.className = "mensagem-status sucesso";
            mensagemStatus.textContent = "🌸 Cadastro realizado com sucesso! Seja bem-vindo ao Jardim Encantado.";
            form.reset();
            mensagemStatus.scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Funções auxiliares
    function validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function mostrarErro(inputElement, idErro, mensagem) {
        inputElement.classList.add("input-erro");
        const spanErro = document.getElementById(idErro);
        if (spanErro) {
            spanErro.textContent = mensagem;
        }
    }

    function limparErroCampo(inputElement, idErro) {
        inputElement.classList.remove("input-erro");
        const spanErro = document.getElementById(idErro);
        if (spanErro) {
            spanErro.textContent = "";
        }
    }

    function limparErrosGerais() {
        const inputs = form.querySelectorAll("input");
        inputs.forEach(input => input.classList.remove("input-erro"));

        const errosSpan = form.querySelectorAll(".erro-campo");
        errosSpan.forEach(span => span.textContent = "");

        mensagemStatus.className = "mensagem-status";
        mensagemStatus.textContent = "";
    }
});