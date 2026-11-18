document.addEventListener("DOMContentLoaded", () => {
    const chatForm = document.getElementById("chat-form");
    const chatBox = document.getElementById("chat-box");
    const inputApiKey = document.getElementById("api-key");
    const btnToggleApi = document.getElementById("toggle-api");
    const inputMensagem = document.getElementById("mensagem-usuario");
    const btnEnviar = document.getElementById("btn-enviar");

    // Instrução de sistema parametrizada conforme solicitado
    const INSTRUCAO_SISTEMA =
        "Você é um chatbot da empresa Jardim Encantado seu nome é  gato risonho sua função é auxiliar com dúvidas referentes aos preços, valores de entregas, encomendas, os melhores arranjos de flores. Responda sempre em no máximo 170 tokens. Se a resposta precisar ser maior, faça um resumo objetivo. Para perguntas que não sejam do contexto de saudação ou fora do contexto de preços, valores de entregas, encomendas, os melhores arranjos de flores você deverá responder “Estou configurado com a função de auxiliar no contexto de floricultura e cafeteria. Esta pergunta foge do meu contexto”.";

    // Histórico da conversa iniciado com a instrução do sistema
    const historicoMensagens = [
        { role: "system", content: INSTRUCAO_SISTEMA }
    ];

    // Alternar visualização da chave de API
    btnToggleApi.addEventListener("click", () => {
        inputApiKey.type = inputApiKey.type === "password" ? "text" : "password";
    });

    // Envio da mensagem para a API da OpenAI
    chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const apiKey = inputApiKey.value.trim();
        const textoUsuario = inputMensagem.value.trim();

        if (!apiKey) {
            adicionarMensagem("Por favor, insira sua chave de API da OpenAI antes de enviar uma mensagem.", "erro");
            inputApiKey.focus();
            return;
        }

        if (!textoUsuario) return;

        // Exibe a mensagem do usuário na tela e adiciona ao histórico
        adicionarMensagem(textoUsuario, "user");
        historicoMensagens.push({ role: "user", content: textoUsuario });

        inputMensagem.value = "";
        inputMensagem.disabled = true;
        btnEnviar.disabled = true;

        const indicadorDigitando = adicionarIndicadorDigitando();

        try {
            const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-5.4-nano",
                    messages: historicoMensagens,
                    temperature: 2,
                    max_completion_tokens: 170
                })
            });

            const dados = await resposta.json();
            indicadorDigitando.remove();

            if (!resposta.ok) {
                const mensagemErro = dados.error?.message || "Erro ao se comunicar com a API do ChatGPT.";
                adicionarMensagem(`Erro da API: ${mensagemErro}`, "erro");
                historicoMensagens.pop(); // Remove a última mensagem do histórico em caso de falha
                return;
            }

            const respostaBot = dados.choices[0].message.content;
            historicoMensagens.push({ role: "assistant", content: respostaBot });
            adicionarMensagem(respostaBot, "bot");

        } catch (erro) {
            indicadorDigitando.remove();
            adicionarMensagem("Falha de conexão com a API. Verifique sua internet ou a chave informada.", "erro");
            historicoMensagens.pop();
        } finally {
            inputMensagem.disabled = false;
            btnEnviar.disabled = false;
            inputMensagem.focus();
        }
    });

    // Função para inserir mensagens no chat
    function adicionarMensagem(texto, tipo) {
        const div = document.createElement("div");

        if (tipo === "user") {
            div.className = "mensagem msg-user";
            div.innerHTML = `<span class="autor">Você</span><p></p>`;
            div.querySelector("p").textContent = texto;
        } else if (tipo === "bot") {
            div.className = "mensagem msg-bot";
            div.innerHTML = `<span class="autor">Gato Risonho</span><p></p>`;
            div.querySelector("p").textContent = texto;
        } else {
            div.className = "mensagem msg-erro";
            div.textContent = texto;
        }

        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        return div;
    }

    // Indicador visual enquanto aguarda resposta
    function adicionarIndicadorDigitando() {
        const div = document.createElement("div");
        div.className = "mensagem msg-bot digitando";
        div.innerHTML = `<span class="autor">Gato Risonho</span><p>Digitando...</p>`;
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        return div;
    }
});