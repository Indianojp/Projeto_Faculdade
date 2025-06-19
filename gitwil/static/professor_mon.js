document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const codigo = params.get("codigo");

  const elCodigoSala = document.getElementById("mon-codigo-sala");
  const elRespostasContador = document.getElementById("mon-respostas-contador");
  const elPessoasContador = document.getElementById("mon-pessoas-contador");
  const canvas = document.getElementById("mon-grafico-pizza");

  if (!codigo) {
    alert("Código da sala não encontrado na URL.");
    return;
  }

  elCodigoSala.textContent = codigo;

  let chart = null;

  async function atualizarDados() {
    try {
      const res = await fetch(`/api/sala/${codigo}/dados`);
      const dados = await res.json();
      if (dados.erro) {
        alert(dados.erro);
        return;
      }

      const { opcoes, respostas } = dados;
      const letras = opcoes.map(o => o.letra);
      const cores = opcoes.map(o => o.cor);
      const textos = opcoes.map(o => o.letra);

      const contagens = letras.map(l => respostas[l] || 0);
      const total = contagens.reduce((acc, val) => acc + val, 0);

      elRespostasContador.textContent = total;
      elPessoasContador.textContent = total;

      if (!chart) {
        chart = new Chart(canvas, {
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
              legend: { position: "bottom" },
              title: { display: true, text: `Respostas da Sala ${codigo}` }
            }
          }
        });
      } else {
        chart.data.datasets[0].data = contagens;
        chart.update();
      }

    } catch (e) {
      console.error("Erro ao buscar dados da sala:", e);
    }
  }

  // Atualiza a cada 2s
  setInterval(atualizarDados, 2000);
  atualizarDados();

  // Resetar respostas
  document.getElementById("mon-btn-reset-respostas").onclick = async () => {
    if (confirm("Deseja resetar todas as respostas da sala?")) {
      await fetch(`/api/sala/${codigo}/resetar_respostas`, { method: "POST" });
      atualizarDados();
    }
  };

  // Apagar sala
  document.getElementById("mon-btn-reset-sala").onclick = async () => {
    if (confirm("Deseja apagar completamente a sala e todas as respostas?")) {
      await fetch(`/api/sala/${codigo}/apagar`, { method: "POST" });
      location.href = "/";
    }
  };

  // Navegação
  document.getElementById("mon-btn-voltar").onclick = () => history.back();
  document.getElementById("mon-btn-sair").onclick = () => location.href = "/";

  // Copiar gráfico
  document.getElementById("mon-btn-copiar-grafico").addEventListener("click", () => {
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    tempCanvas.toBlob((blob) => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item])
        .then(() => alert("Gráfico copiado com Sucesso!"))
        .catch(err => {
          console.error("Erro ao copiar o gráfico:", err);
          alert("Não foi possível copiar o gráfico.");
        });
    }, "image/png");
  });
});
