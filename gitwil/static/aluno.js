let grafico; // variável global

document.addEventListener("DOMContentLoaded", async () => {
    const pathParts = window.location.pathname.split("/");
    const codigo = pathParts[pathParts.length - 1];

    const status = document.getElementById("aluno-mensagem-status");
    const container = document.getElementById("aluno-pergunta-container");
    const opcoesContainer = document.getElementById("aluno-opcoes");
    const btnEnviar = document.getElementById("aluno-btn-enviar");
    const canvasGrafico = document.getElementById("aluno-grafico-respostas");
    const elContadorRespondentes = document.getElementById("aluno-respondentes-count");

    async function carregarDados() {
        try {
            const res = await fetch(`/api/sala/${codigo}`);
            if (!res.ok) throw new Error("Sala não encontrada");

            const { opcoes, respostas_ativas, respostas, respondentes } = await res.json();

            status.style.display = "none";
            container.style.display = "block";

            if (elContadorRespondentes && Array.isArray(respondentes)) {
                elContadorRespondentes.textContent = respondentes.length;
            }

            if (opcoesContainer.children.length === 0) {
                // Gera botões só uma vez
                opcoes.forEach(opcao => {
                    const btn = document.createElement("button");
                    btn.className = "aluno-opcao-btn";
                    btn.innerText = `${opcao.letra}`;
                    btn.style.backgroundColor = opcao.cor;
                    btn.dataset.letra = opcao.letra;

                    btn.onclick = () => {
                        if (!btnEnviar.disabled) {
                            document.querySelectorAll(".aluno-opcao-btn").forEach(b => b.classList.remove("aluno-selecionada"));
                            btn.classList.add("aluno-selecionada");
                        }
                    };

                    opcoesContainer.appendChild(btn);
                });
            }

            let userId = sessionStorage.getItem('user_id');
            if (!userId) {
                userId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 14);
                sessionStorage.setItem('user_id', userId);
            }

            // Bloqueia se necessário
            const bloqueado = !respostas_ativas || (respondentes && respondentes.includes(userId));
            btnEnviar.disabled = bloqueado;
            document.querySelectorAll(".aluno-opcao-btn").forEach(b => {
                b.disabled = bloqueado;
                if (bloqueado) b.classList.remove("aluno-selecionada");
            });

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

            if (!resp.ok) {
                const errorData = await resp.json();
                if (errorData.erro === "Usuário já respondeu") {
                    alert("Você já respondeu nesta rodada.");
                } else {
                    alert(errorData.erro || "Erro ao enviar resposta");
                }
            } else {
                alert("Resposta enviada com sucesso!");
            }

            btnEnviar.disabled = true;
            document.querySelectorAll(".aluno-opcao-btn").forEach(b => {
                b.disabled = true;
                b.classList.remove("aluno-selecionada");
            });

            await carregarDados(); // atualiza gráfico e contador

        } catch (e) {
            alert("Erro ao enviar resposta.");
            console.error(e);
        }
    };

    setInterval(carregarDados, 5000);
});
