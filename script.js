/* =========================================================================
   EcoGasto — Monitor de Água e Energia
   Vanilla JavaScript puro + LocalStorage (sem back-end)
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. CONSTANTES E "BANCO DE DADOS" LOCAL
   ------------------------------------------------------------------------- */

// Chave usada no LocalStorage
const STORAGE_KEY = 'ecogasto_registro_atual';

// Médias fictícias de referência do município de Sorocaba
const MEDIA_SOROCABA = {
  energia: 150, // kWh
  agua: 12      // m³
};

// Tarifas médias estimadas (usadas para traduzir hábitos em R$)
const TARIFA_ESTIMADA = {
  energia: 0.85, // R$ por kWh (estimativa)
  agua: 6.5       // R$ por m³ (estimativa)
};

// Consumo médio estimado de cada eletrodoméstico (para cálculo de economia)
// energiaKwhPorUso: consumo aproximado de energia por uso/ciclo/hora
const PERFIL_ELETRODOMESTICOS = {
  'Chuveiro elétrico': {
    icone: 'bi-droplet-fill',
    energiaKwhPorUso: 1.2,   // kWh por banho de ~15 min
    dica: 'Reduzir o tempo de banho em 5 minutos e evitar a posição "verão" no inverno',
    economiaFormula: (qtd) => qtd * 4 * 1.2 * TARIFA_ESTIMADA.energia * 0.25 // 25% de redução estimada
  },
  'Máquina de lavar roupa': {
    icone: 'bi-basket-fill',
    energiaKwhPorUso: 0.6,
    dica: 'Acumular roupas para lavar cargas completas em vez de várias cargas pequenas',
    economiaFormula: (qtd) => qtd * 4 * 0.6 * TARIFA_ESTIMADA.energia * 0.35 // 35% de redução estimada
  },
  'Ferro de passar': {
    icone: 'bi-lightning-charge-fill',
    energiaKwhPorUso: 1.0,
    dica: 'Passar todas as roupas da semana de uma só vez, aproveitando o ferro ainda quente',
    economiaFormula: (qtd) => qtd * 4 * 1.0 * TARIFA_ESTIMADA.energia * 0.30 // 30% de redução estimada
  },
  'Ar-condicionado': {
    icone: 'bi-snow',
    energiaKwhPorUso: 1.1, // por hora
    dica: 'Manter o termostato em 23°C e desligar 30 min antes de sair do ambiente',
    economiaFormula: (qtdHorasDia) => qtdHorasDia * 4 * 1.1 * TARIFA_ESTIMADA.energia * 0.20 // 20% de redução estimada
  }
};

/* -------------------------------------------------------------------------
   2. UTILITÁRIOS DE NAVEGAÇÃO ENTRE TELAS
   ------------------------------------------------------------------------- */

function mostrarTela(idTela) {
  document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
  document.getElementById(idTela).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* -------------------------------------------------------------------------
   3. LOCALSTORAGE — SALVAR E RECUPERAR DADOS
   ------------------------------------------------------------------------- */

/**
 * Salva o registro de consumo do mês no LocalStorage.
 * @param {Object} dados - objeto com todos os dados do formulário
 */
function salvarRegistro(dados) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    return true;
  } catch (erro) {
    console.error('Erro ao salvar no LocalStorage:', erro);
    return false;
  }
}

/**
 * Recupera o último registro salvo no LocalStorage.
 * @returns {Object|null}
 */
function recuperarRegistro() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? JSON.parse(bruto) : null;
  } catch (erro) {
    console.error('Erro ao ler LocalStorage:', erro);
    return null;
  }
}

/**
 * Limpa o registro salvo (usado ao voltar para um novo cadastro).
 */
function limparRegistro() {
  localStorage.removeItem(STORAGE_KEY);
}

/* -------------------------------------------------------------------------
   4. TELA 1 — FORMULÁRIO DE CADASTRO
   ------------------------------------------------------------------------- */

const formConsumo = document.getElementById('formConsumo');
const tipoConsumoSelect = document.getElementById('tipoConsumo');
const labelConsumo = document.getElementById('labelConsumo');
const unidadeConsumo = document.getElementById('unidadeConsumo');
const alertaFormulario = document.getElementById('alertaFormulario');
const nomeUsuarioInput = document.getElementById('nomeUsuario');
const boasVindas = document.getElementById('boasVindas');

// Atualiza rótulos e unidade conforme o tipo de consumo escolhido (água/energia)
tipoConsumoSelect.addEventListener('change', () => {
  const tipo = tipoConsumoSelect.value;
  if (tipo === 'agua') {
    labelConsumo.textContent = 'Consumo em m³ *';
    unidadeConsumo.textContent = 'm³';
    document.getElementById('consumoValor').placeholder = 'Ex: 14';
  } else {
    labelConsumo.textContent = 'Consumo em kWh *';
    unidadeConsumo.textContent = 'kWh';
    document.getElementById('consumoValor').placeholder = 'Ex: 180';
  }
});

// Habilita/desabilita o campo de quantidade conforme o checkbox do eletrodoméstico
document.querySelectorAll('.eletro-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const box = checkbox.closest('.appliance-box');
    const inputQtd = box.querySelector('input[type="number"]');
    inputQtd.disabled = !checkbox.checked;
    if (checkbox.checked) {
      inputQtd.focus();
    }
  });
});

// Nome do usuário personaliza a mensagem de boas-vindas em tempo real
nomeUsuarioInput.addEventListener('input', () => {
  const nome = nomeUsuarioInput.value.trim();
  boasVindas.textContent = nome
    ? `Olá, ${nome}! Vamos analisar seu consumo deste mês.`
    : 'Monitore sua água e energia, economize todo mês.';
});

/**
 * Valida o formulário manualmente, além da validação HTML5.
 * Retorna um array de mensagens de erro (vazio se tudo estiver ok).
 */
function validarFormulario() {
  const erros = [];

  const mes = document.getElementById('mesReferencia').value;
  const consumo = parseFloat(document.getElementById('consumoValor').value);
  const conta = parseFloat(document.getElementById('valorConta').value);

  if (!mes) {
    erros.push('Informe o mês de referência.');
  }

  if (isNaN(consumo) || consumo <= 0) {
    erros.push('Informe um valor de consumo válido (maior que zero).');
  }

  if (isNaN(conta) || conta <= 0) {
    erros.push('Informe o valor total da conta (maior que zero).');
  }

  return erros;
}

/**
 * Coleta os eletrodomésticos marcados e suas quantidades.
 */
function coletarEletrodomesticos() {
  const selecionados = [];
  document.querySelectorAll('.eletro-checkbox').forEach(checkbox => {
    if (checkbox.checked) {
      const box = checkbox.closest('.appliance-box');
      const inputQtd = box.querySelector('input[type="number"]');
      selecionados.push({
        nome: checkbox.dataset.nome,
        icone: checkbox.dataset.icon,
        quantidade: parseInt(inputQtd.value, 10) || 1
      });
    }
  });
  return selecionados;
}

// Envio do formulário: valida, salva no LocalStorage e navega para a Tela 2
formConsumo.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const erros = validarFormulario();

  // Marca visualmente os campos inválidos (Bootstrap)
  formConsumo.classList.add('was-validated');

  if (erros.length > 0) {
    alertaFormulario.innerHTML = '<strong>Corrija os campos abaixo:</strong><ul class="mb-0 mt-1">' +
      erros.map(e => `<li>${e}</li>`).join('') + '</ul>';
    alertaFormulario.classList.remove('d-none');
    alertaFormulario.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  alertaFormulario.classList.add('d-none');

  const dados = {
    nomeUsuario: nomeUsuarioInput.value.trim(),
    mesReferencia: document.getElementById('mesReferencia').value,
    tipoConsumo: tipoConsumoSelect.value,
    consumoValor: parseFloat(document.getElementById('consumoValor').value),
    valorConta: parseFloat(document.getElementById('valorConta').value),
    eletrodomesticos: coletarEletrodomesticos()
  };

  const salvouComSucesso = salvarRegistro(dados);

  if (!salvouComSucesso) {
    alertaFormulario.innerHTML = 'Não foi possível salvar seus dados neste navegador. Verifique se o LocalStorage está habilitado.';
    alertaFormulario.classList.remove('d-none');
    return;
  }

  renderizarResultado(dados);
  mostrarTela('tela2');
});

/**
 * Reseta o formulário para um novo cadastro (Tela 1).
 */
function resetarFormulario() {
  formConsumo.reset();
  formConsumo.classList.remove('was-validated');
  alertaFormulario.classList.add('d-none');
  boasVindas.textContent = 'Monitore sua água e energia, economize todo mês.';

  // Reseta rótulos de unidade
  labelConsumo.textContent = 'Consumo em kWh *';
  unidadeConsumo.textContent = 'kWh';

  // Desabilita novamente os campos de quantidade
  document.querySelectorAll('.appliance-box input[type="number"]').forEach(input => {
    input.disabled = true;
  });
}

/* -------------------------------------------------------------------------
   5. TELA 2 — CÁLCULO DO COMPARATIVO E SEMÁFORO
   ------------------------------------------------------------------------- */

/**
 * Calcula a diferença percentual entre o consumo do usuário e a média do município.
 * @returns {Object} { percentual, status } onde status é 'verde' | 'amarelo' | 'vermelho'
 */
function calcularComparativo(consumoUsuario, media) {
  const diferenca = consumoUsuario - media;
  const percentual = (diferenca / media) * 100;

  let status;
  if (percentual <= 0) {
    status = 'verde';
  } else if (percentual <= 10) {
    status = 'amarelo';
  } else {
    status = 'vermelho';
  }

  return { percentual, status };
}

/**
 * Aplica as cores e textos do semáforo na interface, conforme o status calculado.
 */
function aplicarSemaforo(status, percentual) {
  const box = document.getElementById('semaforoBox');
  const luz = document.getElementById('luzSemaforo');
  const statusTexto = document.getElementById('statusSemaforo');
  const mensagem = document.getElementById('mensagemSemaforo');
  const percentualEl = document.getElementById('percentualDiferenca');

  // Remove classes de status anteriores
  box.classList.remove('semaforo-verde', 'semaforo-amarelo', 'semaforo-vermelho');
  luz.classList.remove('luz-verde', 'luz-amarela', 'luz-vermelha');

  const percentualExibido = `${percentual > 0 ? '+' : ''}${percentual.toFixed(1)}%`;
  percentualEl.textContent = percentualExibido;

  if (status === 'verde') {
    box.classList.add('semaforo-verde');
    luz.classList.add('luz-verde');
    statusTexto.textContent = 'Consumo abaixo da média — parabéns!';
    mensagem.textContent = 'Você está consumindo menos que a média de Sorocaba. Continue assim!';
  } else if (status === 'amarelo') {
    box.classList.add('semaforo-amarelo');
    luz.classList.add('luz-amarela');
    statusTexto.textContent = 'Consumo próximo da média — fique atento';
    mensagem.textContent = 'Seu consumo está na média, mas pequenos ajustes já fazem diferença no fim do mês.';
  } else {
    box.classList.add('semaforo-vermelho');
    luz.classList.add('luz-vermelha');
    statusTexto.textContent = 'Consumo acima da média — hora de agir';
    mensagem.textContent = 'Seu consumo está bem acima da média de Sorocaba. Veja as dicas abaixo para economizar.';
  }

  return status;
}

/**
 * Preenche as barras comparativas de "Seu consumo" vs "Média Sorocaba".
 */
function renderizarComparativo(dados, media) {
  const unidade = dados.tipoConsumo === 'agua' ? 'm³' : 'kWh';

  document.getElementById('consumoUsuarioValor').textContent = `${dados.consumoValor.toFixed(1)} ${unidade}`;
  document.getElementById('contaUsuarioValor').textContent = formatarMoeda(dados.valorConta);
  document.getElementById('consumoMediaValor').textContent = `${media.toFixed(1)} ${unidade}`;

  // Largura da barra do usuário proporcional à média (limite visual de 150%)
  const proporcao = Math.min((dados.consumoValor / media) * 100, 150);
  const barraUsuario = document.getElementById('barraUsuario');
  barraUsuario.style.width = `${Math.min(proporcao, 100)}%`;
  barraUsuario.textContent = `${dados.consumoValor.toFixed(0)} ${unidade}`;

  // Cor da barra do usuário acompanha o semáforo
  const cor = proporcao <= 100 ? 'var(--eco-verde)' : (proporcao <= 110 ? 'var(--energia-amarelo)' : 'var(--alerta-vermelho)');
  barraUsuario.style.backgroundColor = cor;
}

/* -------------------------------------------------------------------------
   6. IMPACTO NO BOLSO — SUGESTÕES DE ECONOMIA POR ELETRODOMÉSTICO
   ------------------------------------------------------------------------- */

function renderizarEconomia(eletrodomesticos) {
  const container = document.getElementById('listaEconomia');
  const avisoVazio = document.getElementById('semEletrodomesticos');
  container.innerHTML = '';

  if (!eletrodomesticos || eletrodomesticos.length === 0) {
    avisoVazio.classList.remove('d-none');
    return;
  }

  avisoVazio.classList.add('d-none');

  let totalEconomia = 0;

  eletrodomesticos.forEach(item => {
    const perfil = PERFIL_ELETRODOMESTICOS[item.nome];
    if (!perfil) return;

    const economia = perfil.economiaFormula(item.quantidade);
    totalEconomia += economia;

    const bloco = document.createElement('div');
    bloco.className = 'economia-card';
    bloco.innerHTML = `
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <i class="bi ${perfil.icone} me-2 text-primary"></i>
          <strong>${item.nome}</strong>
          <p class="mb-0 mt-1 small text-muted">${perfil.dica}.</p>
        </div>
        <span class="economia-valor fs-6">até ${formatarMoeda(economia)}/mês</span>
      </div>
    `;
    container.appendChild(bloco);
  });

  // Card de resumo total
  const resumo = document.createElement('div');
  resumo.className = 'alert alert-success d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2';
  resumo.innerHTML = `
    <span><i class="bi bi-piggy-bank-fill me-2"></i>Economia total estimada com esses hábitos</span>
    <strong class="fs-5">${formatarMoeda(totalEconomia)}/mês</strong>
  `;
  container.appendChild(resumo);
}

/* -------------------------------------------------------------------------
   7. DICAS PRÁTICAS — VARIAM CONFORME O SEMÁFORO
   ------------------------------------------------------------------------- */

const BANCO_DE_DICAS = {
  verde: [
    'Você está no caminho certo! Continue registrando seu consumo todo mês para manter o controle.',
    'Aproveite para revisar se há vazamentos ou aparelhos antigos que possam ser trocados por versões mais eficientes.',
    'Compartilhe suas dicas de economia com a família — hábito bom se espalha rápido!',
    'Considere reaproveitar a água da máquina de lavar para lavar quintal ou calçada.',
    'Desligue aparelhos da tomada quando não estiverem em uso, evitando o consumo em modo "stand-by".'
  ],
  amarelo: [
    'Você está na média, mas um pequeno ajuste na rotina já evita passar para a faixa de alerta.',
    'Tente concentrar o uso de aparelhos elétricos fora do horário de pico (18h às 21h).',
    'Reduza o tempo de banho em alguns minutos — o impacto no fim do mês é maior do que parece.',
    'Verifique se torneiras e registros estão bem fechados para evitar desperdício silencioso.',
    'Programe o uso da máquina de lavar e do ferro para dias específicos, evitando o uso avulso.'
  ],
  vermelho: [
    'Seu consumo está bem acima da média — comece revisando o uso do chuveiro elétrico e do ar-condicionado.',
    'Troque lâmpadas comuns por LED e evite deixar equipamentos ligados sem necessidade.',
    'Estabeleça um "horário de pico doméstico" e evite usar vários aparelhos pesados ao mesmo tempo.',
    'Verifique possíveis vazamentos de água e o estado dos vedantes de torneiras e chuveiros.',
    'Considere reavaliar a potência do chuveiro elétrico e do ar-condicionado no verão/inverno.'
  ]
};

function renderizarDicas(status) {
  const container = document.getElementById('listaDicas');
  container.innerHTML = '';

  const dicas = BANCO_DE_DICAS[status] || BANCO_DE_DICAS.amarelo;

  dicas.forEach(texto => {
    const item = document.createElement('div');
    item.className = 'dica-item';
    item.innerHTML = `<i class="bi bi-check2-circle text-success me-2"></i>${texto}`;
    container.appendChild(item);
  });
}

/* -------------------------------------------------------------------------
   8. FUNÇÃO PRINCIPAL — RENDERIZA TODA A TELA 2 A PARTIR DOS DADOS
   ------------------------------------------------------------------------- */

function renderizarResultado(dados) {
  const media = MEDIA_SOROCABA[dados.tipoConsumo];
  const nome = dados.nomeUsuario ? `, ${dados.nomeUsuario}` : '';

  document.getElementById('tituloResultado').textContent = `Resultado da sua análise${nome}`;
  document.getElementById('legendaPercentual').textContent =
    `em relação à média de Sorocaba (${media} ${dados.tipoConsumo === 'agua' ? 'm³' : 'kWh'})`;

  const { percentual, status } = calcularComparativo(dados.consumoValor, media);

  aplicarSemaforo(status, percentual);
  renderizarComparativo(dados, media);
  renderizarEconomia(dados.eletrodomesticos);
  renderizarDicas(status);
}

/* -------------------------------------------------------------------------
   9. FORMATAÇÃO E NAVEGAÇÃO
   ------------------------------------------------------------------------- */

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

document.getElementById('btnVoltar').addEventListener('click', () => {
  limparRegistro();
  resetarFormulario();
  mostrarTela('tela1');
});

/* -------------------------------------------------------------------------
   10. INICIALIZAÇÃO DA APLICAÇÃO
   ------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  // Se já existir um registro salvo (ex: usuário atualizou a página na Tela 2),
  // recupera os dados e exibe o resultado diretamente.
  const registroExistente = recuperarRegistro();
  if (registroExistente) {
    // Restaura também os campos do formulário, caso o usuário volte à Tela 1
    nomeUsuarioInput.value = registroExistente.nomeUsuario || '';
    renderizarResultado(registroExistente);
    mostrarTela('tela2');
  } else {
    mostrarTela('tela1');
  }
});
