document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get("codigo");

    const status = document.getElementById("aluno-mensagem-status");
    const container = document.getElementById("aluno-pergunta-container");
    const opcoesContainer = document.getElementById("aluno-opcoes");
    const btnEnviar = document.getElementById("aluno-btn-enviar");
    const respostasAtivas = localStorage.getItem("respostas_ativas_" + codigo);
    if (respostasAtivas !== "true") {
        btnEnviar.disabled = true;
    } else {
        btnEnviar.disabled = false;
    }
    const canvasGrafico = document.getElementById("aluno-grafico-respostas");

    if (!codigo) {
        status.innerText = "Código da sala não encontrado na URL.";
        return;
    }

    const dadosString = localStorage.getItem(codigo);
    if (!dadosString) {
        status.innerText = `Nenhuma sala encontrada com o código: ${codigo}`;
        return;
    }

    const respostaAnterior = localStorage.getItem(`resposta_${codigo}`);
    const dados = JSON.parse(dadosString);
    const { opcoes } = dados;

    status.style.display = "none";
    container.style.display = "block";

    opcoes.forEach((opcao) => {
        const btn = document.createElement("button");
        btn.className = "aluno-opcao-btn";
        btn.innerText = `${opcao.letra}`;
        btn.style.backgroundColor = opcao.cor;
        btn.dataset.letra = opcao.letra;

        btn.onclick = () => {
            document.querySelectorAll(".aluno-opcao-btn").forEach(b => {
                b.classList.remove("aluno-selecionada");
            });
            btn.classList.add("aluno-selecionada");
        };

        opcoesContainer.appendChild(btn);
    });


    const codigoSala = codigo;
    let respostas = JSON.parse(localStorage.getItem("respostas_" + codigoSala)) || {
        A: 0, B: 0, C: 0, D: 0, E: 0
    };
    const textos = opcoes.map(o => o.letra);
    const cores = opcoes.map(o => o.cor);
    const contagens = opcoes.map(o => respostas[o.letra] || 0);

    const grafico = new Chart(canvasGrafico, {
        type: "pie",
        data: {
            labels: textos,
            datasets: [{
                data: contagens,
                backgroundColor: cores
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                },
                title: {
                    display: true,
                    text: "Respostas da sala"
                }
            }
        }
    });

    btnEnviar.onclick = () => {
        const selecionada = document.querySelector(".aluno-opcao-btn.aluno-selecionada");
        if (!selecionada) {
            alert("Selecione uma opção antes de enviar.");
            return;
        }

        const resposta = selecionada.dataset.letra;
        localStorage.setItem(`resposta_${codigo}`, resposta);

        respostas[resposta] += 1;
        localStorage.setItem("respostas_" + codigo, JSON.stringify(respostas));

        document.querySelectorAll(".aluno-opcao-btn").forEach(b => b.disabled = true);
        btnEnviar.disabled = true;
        localStorage.setItem("respostas_ativas_" + codigo, "false"); 

        grafico.data.datasets[0].data = opcoes.map(o => respostas[o.letra] || 0);
        grafico.update();
    };

    setInterval(() => {
        const liberado = localStorage.getItem("respostas_ativas_" + codigo);
        const jaRespondeu = localStorage.getItem(`resposta_${codigo}`);

        if (liberado === "true" && jaRespondeu) {
            btnEnviar.disabled = false;
            document.querySelectorAll(".aluno-opcao-btn").forEach(b => b.disabled = false);
            localStorage.removeItem(`resposta_${codigo}`); 
            respostas = { A: 0, B: 0, C: 0, D: 0, E: 0 };
            grafico.data.datasets[0].data = opcoes.map(o => 0);
            grafico.update();

            alert(" Foi liberado uma nova rodada de respostas!");
        }
    }, 2000);


});
