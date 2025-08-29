//chapeu
class Chapeu {
    constructor(cor, modificadorSorte) {
        this.cor = cor;
        this.modificadorSorte = modificadorSorte;
    }
}
//classe principal
class Gnomo {
    #nome;
    #velocidadeBase;
    #posicao;
    chapeu;

    constructor(nome, velocidadeBase, chapeu) {
        if (new.target === Gnomo) {
            throw new Error("A classe Gnomo não pode ser instanciada diretamente.");//perguntar para que serve isso
        }
        this.#nome = nome;
        this.#velocidadeBase = velocidadeBase;
        this.#posicao = 0;
        this.chapeu = chapeu;
    }


    get nome() {
        return this.#nome;
    }

    get posicao() {
        return this.#posicao;
    }

    get velocidadeBase() {
        return this.#velocidadeBase;
    }
    
    _mover(passos) {
        this.#posicao += passos;
    }

    resetarPosicao() {
        this.#posicao = 0;
    }
    
    avancar() {
        throw new Error("O método 'avancar()' deve ser implementado na subclasse.");//isso aqui é realmente necessário?
    }
}

class GnomoVeloz extends Gnomo {
    constructor(nome, chapeu) {
        super(nome, 10, chapeu);
    }

    avancar() {
        const passos = this._gerarPassosAleatorios();
        this._mover(passos);
    }

    _gerarPassosAleatorios() {
        const sorte = Math.random() * this.chapeu.modificadorSorte;
        return this.velocidadeBase + sorte;
    }
}

class GnomoAzarado extends Gnomo {
    constructor(nome, chapeu) {
        super(nome, 7, chapeu);
    }

    avancar() {
        const sorte = Math.random() * this.chapeu.modificadorSorte;
        const chanceDeAzar = Math.random();

        if (chanceDeAzar < 0.2) {
            this._mover(this.velocidadeBase / 2);
        } else {
            this._mover(this.velocidadeBase + sorte*10);
        }
    }
}
class Corrida {
    competidores = [];
    distanciaTotal;
    #intervalo;

    constructor(distanciaTotal) {
        this.distanciaTotal = distanciaTotal;
    }

    adicionarCompetidor(gnomo) {
        this.competidores.push(gnomo);
    }

    proximoTurno() {
        this.competidores.forEach(gnomo => {
            gnomo.avancar();
        });

        const vencedor = this.competidores.find(gnomo => gnomo.posicao >= this.distanciaTotal);
        if (vencedor) {
            this.finalizarSimulacao(vencedor);
            return true;
        }
        
        return false;
    }

    iniciarSimulacao(callbackTurno) {
        this.competidores.forEach(gnomo => gnomo.resetarPosicao());

        this.#intervalo = setInterval(() => {
            const corridaTerminou = this.proximoTurno();
            callbackTurno();

            if (corridaTerminou) {
                clearInterval(this.#intervalo);
            }
        }, 500);
    }

    finalizarSimulacao(vencedor) {
        console.log(`Corrida finalizada! O vencedor é: ${vencedor.nome}`);
    }
}

const corrida = new Corrida(100);

const formNome = document.getElementById('nome-gnomo');
const formTipo = document.getElementById('tipo-gnomo');
const formChapeu = document.getElementById('cor-chapeu');
const btnAdicionar = document.getElementById('adicionar-gnomo');
const btnIniciar = document.getElementById('iniciar-corrida');
const pistasArea = document.getElementById('pistas-area');
const mensagemVencedor = document.getElementById('mensagem-vencedor');

const chapeuEfeitos = {
    'verde': 1.5,
    'azul': 1,
    'vermelho': 0.5
};

const gnomoTipos = {
    'GnomoVeloz': GnomoVeloz,
    'GnomoAzarado': GnomoAzarado
};

btnAdicionar.addEventListener('click', () => {
    const nome = formNome.value.trim();
    const tipo = formTipo.value;
    const corChapeu = formChapeu.value;

    if (nome === '') {
        alert('Por favor, digite um nome para o gnomo.');
        return;
    }

    const modificadorSorte = chapeuEfeitos[corChapeu];
    const GnomoClasse = gnomoTipos[tipo];

    const chapeu = new Chapeu(corChapeu, modificadorSorte);
    const novoGnomo = new GnomoClasse(nome, chapeu);

    corrida.adicionarCompetidor(novoGnomo);
    adicionarPistaDOM(novoGnomo, tipo, corChapeu);
    btnIniciar.disabled = false;
});

btnIniciar.addEventListener('click', () => {
    if (corrida.competidores.length < 2) {
        alert('Adicione pelo menos 2 gnomos para começar a corrida!');
        return;
    }
    btnAdicionar.disabled = true;
    btnIniciar.disabled = true;
    mensagemVencedor.textContent = '';
    
    corrida.iniciarSimulacao(atualizarPistasDOM);
});

function adicionarPistaDOM(gnomo, tipo, corChapeu) {
    const competidorDiv = document.createElement('div');
    competidorDiv.classList.add('competidor-pista');
    competidorDiv.id = `pista-${gnomo.nome.replace(/\s/g, '-')}`;

    const nomeSpan = document.createElement('span');
    nomeSpan.classList.add('gnomo-nome');
    nomeSpan.textContent = gnomo.nome;
    
    const pistaDiv = document.createElement('div');
    pistaDiv.classList.add('pista');

    const spriteimg = document.createElement('img');
    spriteimg.classList.add('gnomo-sprite', tipo.toLowerCase(), corChapeu);
    spriteimg.src = `assets/${tipo.toLowerCase()}.png`;
    pistaDiv.appendChild(spriteimg);
    competidorDiv.appendChild(nomeSpan);
    competidorDiv.appendChild(pistaDiv);
    pistasArea.appendChild(competidorDiv);
}

function atualizarPistasDOM() {
    corrida.competidores.forEach(gnomo => {
        const pistaDiv = document.getElementById(`pista-${gnomo.nome.replace(/\s/g, '-')}`);
        const spriteimg = pistaDiv.querySelector('.gnomo-sprite');
        
        const percentual = (gnomo.posicao / corrida.distanciaTotal) * 100;
        spriteimg.style.left = `${Math.min(percentual, 100)}%`;
        
        if (gnomo.posicao >= corrida.distanciaTotal) {
            spriteimg.classList.add('vencedor');
            mensagemVencedor.textContent = `O vencedor é ${gnomo.nome}! Parabéns!`;
        }
    });
}