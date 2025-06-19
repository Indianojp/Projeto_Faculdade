let letras = ["A", "B", "C", "D", "E"];
let coresPadrao = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"];
/*Função para fazer opção*/
function criarOpcao(index) {
  const container = document.getElementById("opcoes-container");

  const wrapper = document.createElement("div");
  wrapper.className = "opcao";

  /*Seletor da Cor*/
  const circle = document.createElement("input");
  circle.type = "color";
  circle.className = "cor";
  circle.value = coresPadrao[index]; 
  circle.style.backgroundColor = circle.value;


  circle.addEventListener("input", (event) => {
    circle.style.backgroundColor = event.target.value;
  });

  const label = document.createElement("span");
  label.className = "letra";
  label.innerText = letras[index];
  label.textContent = letras[index] || `Opção ${index + 1}`;


  /*Campo de Texto da Questão*/
  const input = document.createElement("input");
  input.type = "text";
  input.className = "texto";
  input.placeholder = `Opção ${index + 1}`;
  input.value = letras[index];


  const excluir = document.createElement("button");
  excluir.className = "remover";
  excluir.innerText = "×";
  excluir.onclick = () => {
    wrapper.remove();
    atualizarLetras();
  };

  /*Coloca todos os elementos de cima dentro da opção
  wrapper- isso encapsula*/
  wrapper.appendChild(circle);
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  wrapper.appendChild(excluir);
  container.appendChild(wrapper);
}

function atualizarLetras() {
  const opcoes = document.querySelectorAll(".opcao");
  opcoes.forEach((opcao, i) => {
    opcao.querySelector(".letra").innerText = letras[i] || `?`;
    opcao.querySelector(".texto").placeholder = `Opção ${i + 1}`;
  });
}

/*Adiciona um nova opção clicando no button: add-opcao*/
document.getElementById("add-opcao").onclick = () => {
  const qtd = document.querySelectorAll(".opcao").length;
  if (qtd < 5) {
    criarOpcao(qtd);
  } else {
    alert("Limite de 5 opções atingido.");
  }
};

/*Função para gerar o codigo da sala e salvar as opções da questão*/
function gerarCodigo() {
  const opcoes = document.querySelectorAll(".opcao");
  if (opcoes.length < 2) {
    alert("Adicione pelo menos 2 opções.");
    return;
  }

  const dados = { opcoes: [] };

  opcoes.forEach((opcao, i) => {
    const letra = letras[i];
    const texto = opcao.querySelector(".texto").value.trim() || letra;
    const cor = opcao.querySelector(".cor").value;
    dados.opcoes.push({ letra, texto, cor });
  });

  fetch("/criar_sala", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dados)
  })
    .then(res => res.json())
    .then(res => {
      if (res.erro) {
        alert(res.erro);
        return;
      }

      const codigo = res.codigo;
      document.getElementById("codigo").innerHTML = `Código: <strong>${codigo}</strong>`;
      document.getElementById("qrcode").innerHTML = "";

      const url = `${location.origin}/index.html?codigo=${codigo}`;
      new QRCode(document.getElementById("qrcode"), {
        text: url,
        width: 300,
        height: 300
      });

      localStorage.setItem("codigo_atual", codigo);
      localStorage.setItem("respostas_ativas_" + codigo, "true");
    })
    .catch(err => {
      console.error("Erro ao criar sala:", err);
      alert("Erro ao criar sala.");
    });
}

// Função para copiar o QR Code para a área de transferência (Ctrl+C + Ctrl+V)
function copiarQRCode() {
    const img = document.querySelector("#qrcode img");
    if (!img) {
        alert("QR Code ainda não foi gerado!");
        return;
    }

    fetch(img.src)
        .then(response => response.blob())
        .then(blob => {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]).then(() => {
                alert("QR Code copiado para a área de transferência!");
            }).catch(err => {
                console.error("Erro ao copiar:", err);
            });
        })
        .catch(err => console.error("Erro ao buscar a imagem:", err));
}


// Inicializa com as opções sempre
criarOpcao(0);
criarOpcao(1);
criarOpcao(2);
criarOpcao(3);
criarOpcao(4);

document.getElementById("btn-monitorar").addEventListener("click", () => {
  const codigo = localStorage.getItem("codigo_atual");
  if (codigo) {
    window.location.href = `/professor/${codigo}`;
  } else {
    alert("Código da sala não encontrado.");
  }
});