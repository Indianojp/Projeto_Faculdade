let grafico; // variável global

document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split("/");
    const codigo = pathParts[pathParts.length - 1];

    const status = document.getElementById("aluno-mensagem-status");
    const container = document.getElementById("aluno-pergunta-container");
    const opcoesContainer = document.getElementById("aluno-opcoes");
    const btnEnviar = document.getElementById("aluno-btn-enviar");
    const canvasGrafico = document.getElementById("aluno-grafico-respostas");

    let respostaJaEnviada = localStorage.getItem(`resposta_${codigo}`);

    async function carregarDados() {
        try {
            const res = await fetch(`/api/sala/${codigo}`);
            if (!res.ok) throw new Error("Sala não encontrada");

            const { opcoes, respostas_ativas, respostas } = await res.json();

            if (!respostas_ativas) btnEnviar.disabled = true;
            else btnEnviar.disabled = false;

            status.style.display = "none";
            container.style.display = "block";

            if (opcoesContainer.children.length === 0) {
                // Gera botões só uma vez
                opcoes.forEach(opcao => {
                    const btn = document.createElement("button");
                    btn.className = "aluno-opcao-btn";
                    btn.innerText = `${opcao.letra}`;
                    btn.style.backgroundColor = opcao.cor;
                    btn.dataset.letra = opcao.letra;

                    btn.onclick = () => {
                        document.querySelectorAll(".aluno-opcao-btn").forEach(b => b.classList.remove("aluno-selecionada"));
                        btn.classList.add("aluno-selecionada");
                    };

                    opcoesContainer.appendChild(btn);
                });
            }

            const letras = opcoes.map(o => o.letra);
            const cores = opcoes.map(o => o.cor);
            const contagens = letras.map(l => respostas[l] || 0);

            if (!grafico) {
                grafico = new Chart(canvasGrafico, {
                    type: "pie",
                    data: {
                        labels: letras,
                        datasets: [{
                            data: contagens,
                            backgroundColor: cores
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: "bottom" },
                            title: { display: true, text: "Respostas da sala" }
                        }
                    }
                });
            } else {
                grafico.data.datasets[0].data = contagens;
                grafico.update();
            }

        } catch (err) {
            status.innerText = `Erro: ${err.message}`;
        }
    }

    await carregarDados();

    btnEnviar.onclick = async () => {
        const selecionada = document.querySelector(".aluno-opcao-btn.aluno-selecionada");
        if (!selecionada) {
            alert("Selecione uma opção antes de enviar.");
            return;
        }

        const resposta = selecionada.dataset.letra;

        try {
            const resp = await fetch(`/api/sala/${codigo}/responder`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ letra: resposta })
            });

            if (!resp.ok) throw new Error("Erro ao enviar resposta");

            localStorage.setItem(`resposta_${codigo}`, resposta);
            document.querySelectorAll(".aluno-opcao-btn").forEach(b => b.disabled = true);
            btnEnviar.disabled = true;
            alert("Resposta enviada com sucesso!");

            await carregarDados(); // atualiza gráfico com novas contagens
        } catch (e) {
            alert("Erro ao enviar resposta.");
            console.error(e);
        }
    };

    // Atualização automática a cada 10 segundos (opcional)
    setInterval(carregarDados, 10000);
});
