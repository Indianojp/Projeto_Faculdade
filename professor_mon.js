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

  const dadosString = localStorage.getItem(codigo);
  if (!dadosString) {
    alert(`Sala com código ${codigo} não encontrada.`);
    return;
  }

  const dados = JSON.parse(dadosString);
  const letras = dados.opcoes.map(o => o.letra);
  const cores = dados.opcoes.map(o => o.cor);
  const textos = dados.opcoes.map(o => `${o.letra}`);

  let chart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: textos,
      datasets: [{
        data: letras.map(() => 0), // inicia zerado
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
          text: `Respostas da Sala ${codigo}`
        }
      }
    }
  });

  function atualizarDados() {
    const respostasRaw = localStorage.getItem("respostas_" + codigo);
    const respostas = respostasRaw ? JSON.parse(respostasRaw) : {};
    console.log("Atualizando respostas:", respostas);

    let total = 0;
    const contagens = letras.map(letra => {
      const qtd = respostas[letra] || 0;
      total += qtd;
      return qtd;
    });

    // Atualiza contadores
    elRespostasContador.textContent = total;
    elPessoasContador.textContent = total;

    // Atualiza gráfico
    chart.data.datasets[0].data = contagens;
    chart.update();
  }

  // Atualiza a cada 2 segundos
  setInterval(atualizarDados, 2000);
  atualizarDados(); // chamada inicial

  // Botões
  document.getElementById("mon-btn-reset-respostas").onclick = () => {
    if (confirm("Deseja resetar todas as respostas da sala?")) {
      localStorage.removeItem("respostas_" + codigo);
      localStorage.setItem("respostas_ativas_" + codigo, "true"); // libera o envio para os alunos
      atualizarDados();
    }
  };


  document.getElementById("mon-btn-reset-sala").onclick = () => {
    if (confirm("Deseja apagar completamente a sala e todas as respostas?")) {
      localStorage.removeItem("respostas_" + codigo);
      localStorage.removeItem(codigo);
      location.href = "index.html";
    }
  };

  document.getElementById("mon-btn-voltar").onclick = () => {
    history.back();
  };

  document.getElementById("mon-btn-sair").onclick = () => {
    location.href = "index.html";
  };

document.getElementById("mon-btn-copiar-grafico").addEventListener("click", () => {
    const canvas = document.getElementById("mon-grafico-pizza");
    const tempCanvas = document.createElement("canvas");
    const ctx = tempCanvas.getContext("2d");

    // Define mesmo tamanho do gráfico original
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fundo branco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(canvas, 0, 0);

    // Converte para PNG
    tempCanvas.toBlob((blob) => {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item])
            .then(() => alert("Gráfico copiado com Sucesso!"))
            .catch(err => {
                console.error("Erro ao copiar o gráfico:", err);
                alert(" Não foi possível copiar o gráfico.");
            });
    }, "image/png");
});


});

