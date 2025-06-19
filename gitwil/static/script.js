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
    const input = document.getElementById("codigo");
    let codigo = input.value.trim().toUpperCase().replace(/\s/g, '');

    const regexCodigo = /^[A-Z0-9]{6}$/;
    if (!regexCodigo.test(codigo)) {
        alert("Digite um código válido de 6 letras ou números.");
        return false;
    }

    // Redireciona via JS
    window.location.href = `/sala/${codigo}`;
    return false; // Impede o submit padrão
}


document.addEventListener("DOMContentLoaded", () => {
    const botaoEntrar = document.getElementById("btnEntrarSala");
    if (botaoEntrar) {
        botaoEntrar.addEventListener("click", entrarSala);
    }
});




