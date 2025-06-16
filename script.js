let cardd = document.querySelector(".cardd");
let loginButton = document.querySelector(".loginButton");
let alunoButton = document.querySelector(".alunoButton");

loginButton.onclick = () => {
    cardd.classList.remove("cadastroActive")
    cardd.classList.add("loginActive")
}
alunoButton.onclick = () => {
    cardd.classList.remove("loginActive")
    cardd.classList.add("cadastroActive")
}

/*Validação do Login*/
const form = document.querySelector(".formLogin form");
const inputEmail = form.querySelector('input[type="text"]');
const inputSenha = form.querySelector('input[type="password"]');

form.addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    // Login fixo para professor
    const emailCorreto = "annebeatriz139@gmail.com";
    const senhaCorreta = "123456";

    if (!email || !senha) {
        alert("Por favor, preencha o e-mail e a senha.");
        return; // Para a execução aqui
    }

    if (email === emailCorreto && senha === senhaCorreta) {
        window.location.href = "professor.html";
    } else {
        alert("E-mail ou senha incorretos.");
    }
});


/*Grafico */
const ctx = document.getElementById('graficoPizza').getContext('2d');
const graficoPizza = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [{
            label: 'Respostas',
            data: [40, 15, 15, 20],
            backgroundColor: [
                '#f76ed2',
                '#42b8f4',
                '#f4d142',
                '#4dd2a3'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    },
    options: {
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});


// Função para validar e entrar na sala do aluno 
function entrarSala() {
    const codigoInput = document.getElementById("codigo");
    if (!codigoInput) return;

    let codigo = codigoInput.value.trim().toUpperCase();

    
    codigo = codigo.replace(/\s/g, '');

    // Verifica se o código tem exatamente 6 caracteres alfanuméricos
    const regexCodigo = /^[A-Z0-9]{6}$/;
    if (!regexCodigo.test(codigo)) {
        alert("Digite um código válido de 6 letras ou números.");
        return;
    }


    if (!localStorage.getItem(codigo)) {
        alert("Sala não encontrada. Verifique o código.");
        return;
    }

    // Redireciona o aluno para a página da sala
    window.location.href = `aluno.html?codigo=${codigo}`;
}


document.addEventListener("DOMContentLoaded", () => {
    const botaoEntrar = document.getElementById("btnEntrarSala");
    if (botaoEntrar) {
        botaoEntrar.addEventListener("click", entrarSala);
    }
});




