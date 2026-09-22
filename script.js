// Configuração
const STORAGE_KEY = 'eco_brasil_registro_atual';
const HISTORY_KEY = 'eco_brasil_historico';

const REFERENCIAS_SOROCABA = {
  energia: {
    mediaMensal: 210.88,
    unidade: 'kWh',
    anoBase: 2024,
    fonteCurta: 'Anuário Estadual 2025',
    fonteCompleta: 'Anuário de Energéticos por Município do Estado de São Paulo 2025 - ano-base 2024, página 39.',
    metodologia: 'Média residencial mensal: 825.847.560 kWh anuais ÷ 326.343 consumidores residenciais ÷ 12 meses.'
  },
  agua: {
    mediaMensal: 13.18,
    unidade: 'm³',
    anoBase: 2024,
    fonteCurta: 'SINISA Água 2024',
    fonteCompleta: 'SINISA - Indicadores de Água, Base Municipal 2024 (retificação), município de Sorocaba.',
    metodologia: 'Indicador IAG2009: consumo total médio de água por economia, em m³/economia/mês.'
  }
};

const TARIFA_ESTIMADA = {
  energia: 0.85,
  agua: 6.5
};

const PERFIL_ELETRODOMESTICOS = {
  'Geladeira': {
    icone: 'bi-door-closed-fill',
    consumoMedio: 'aprox. 45 kWh/mês por aparelho',
    dica: 'Evitar abrir a porta sem necessidade, conferir a vedação e não guardar alimentos quentes',
    economiaFormula: (qtd) => qtd * 45 * TARIFA_ESTIMADA.energia * 0.10
  },
  'Chuveiro elétrico': {
    icone: 'bi-droplet-fill',
    energiaKwhPorUso: 1.2,
    consumoMedio: 'aprox. 67 kWh/mês com 14 banhos por semana',
    dica: 'Reduzir o tempo de banho em 5 minutos e usar a posição "verão" quando a temperatura permitir',
    economiaFormula: (qtd) => qtd * 4 * 1.2 * TARIFA_ESTIMADA.energia * 0.25
  },
  'Televisão': {
    icone: 'bi-tv-fill',
    consumoMedio: 'aprox. 9 kWh/mês com 3 horas por dia',
    dica: 'Desligar completamente quando ninguém estiver assistindo e reduzir o brilho excessivo',
    economiaFormula: (horasDia) => horasDia * 30 * 0.10 * TARIFA_ESTIMADA.energia * 0.25
  },
  'Iluminação': {
    icone: 'bi-lightbulb-fill',
    consumoMedio: 'aprox. 7 kWh/mês para 5 lâmpadas LED',
    dica: 'Apagar as luzes ao sair e aproveitar a iluminação natural durante o dia',
    economiaFormula: (qtdLampadas) => qtdLampadas * 5 * 30 * 0.009 * TARIFA_ESTIMADA.energia * 0.35
  },
  'Máquina de lavar roupa': {
    icone: 'bi-basket-fill',
    energiaKwhPorUso: 0.6,
    consumoMedio: 'aprox. 10 kWh/mês com 4 ciclos por semana',
    dica: 'Acumular roupas para lavar cargas completas em vez de várias cargas pequenas',
    economiaFormula: (qtd) => qtd * 4 * 0.6 * TARIFA_ESTIMADA.energia * 0.35
  },
  'Micro-ondas': {
    icone: 'bi-grid-3x3-gap-fill',
    consumoMedio: 'aprox. 4 kWh/mês com 4 usos por semana',
    dica: 'Usar apenas pelo tempo necessário e manter o aparelho limpo para aquecer com eficiência',
    economiaFormula: (qtd) => qtd * 4 * 0.25 * TARIFA_ESTIMADA.energia * 0.20
  },
  'Air fryer': {
    icone: 'bi-basket2-fill',
    consumoMedio: 'aprox. 10 kWh/mês com 4 usos por semana',
    dica: 'Evitar abrir o cesto durante o preparo e aproveitar a capacidade para fazer porções completas',
    economiaFormula: (qtd) => qtd * 4 * 0.60 * TARIFA_ESTIMADA.energia * 0.20
  },
  'Ventilador': {
    icone: 'bi-wind',
    consumoMedio: 'aprox. 10 kWh/mês com 4 horas por dia',
    dica: 'Desligar quando o ambiente estiver vazio e manter as pás limpas',
    economiaFormula: (horasDia) => horasDia * 30 * 0.08 * TARIFA_ESTIMADA.energia * 0.25
  },
  'Ferro de passar': {
    icone: 'bi-lightning-charge-fill',
    energiaKwhPorUso: 1.0,
    consumoMedio: 'aprox. 12 kWh/mês com 3 usos por semana',
    dica: 'Passar todas as roupas da semana de uma só vez, aproveitando o ferro ainda quente',
    economiaFormula: (qtd) => qtd * 4 * 1.0 * TARIFA_ESTIMADA.energia * 0.30
  },
  'Ar-condicionado': {
    icone: 'bi-snow',
    energiaKwhPorUso: 1.1,
    consumoMedio: 'aprox. 132 kWh/mês com 4 horas por dia',
    dica: 'Manter o termostato em 23°C e desligar 30 minutos antes de sair do ambiente',
    economiaFormula: (qtdHorasDia) => qtdHorasDia * 30 * 1.1 * TARIFA_ESTIMADA.energia * 0.20
  }
};

const PERFIL_HABITOS_AGUA = {
  'Chuveiro/banho': {
    icone: 'bi-droplet-fill',
    consumoMedio: 'aprox. 10 litros por minuto',
    dica: 'Reduzir até 5 minutos do tempo diário de banho e fechar o chuveiro ao se ensaboar',
    economiaFormula: (minutosDia) => Math.min(minutosDia, 5) * 0.010 * 30 * TARIFA_ESTIMADA.agua
  },
  'Máquina de lavar roupa': {
    icone: 'bi-basket-fill',
    consumoMedio: 'aprox. 135 litros por ciclo',
    dica: 'Juntar roupas e utilizar a máquina apenas com carga completa',
    economiaFormula: (usosSemana) => usosSemana * 4 * 0.135 * TARIFA_ESTIMADA.agua * 0.25
  },
  'Torneira': {
    icone: 'bi-faucet-fill',
    consumoMedio: 'aprox. 10 litros por minuto',
    dica: 'Fechar a torneira enquanto ensaboa louças ou escova os dentes',
    economiaFormula: (minutosDia) => minutosDia * 0.010 * 30 * TARIFA_ESTIMADA.agua * 0.50
  },
  'Vaso sanitário': {
    icone: 'bi-badge-wc-fill',
    consumoMedio: 'aprox. 6 litros por descarga com caixa acoplada',
    dica: 'Evitar acionamentos desnecessários e verificar vazamentos na caixa ou na válvula',
    economiaFormula: (descargasDia) => descargasDia * 0.006 * 30 * TARIFA_ESTIMADA.agua * 0.15
  },
  'Mangueira': {
    icone: 'bi-moisture',
    consumoMedio: 'aprox. 12 litros por minuto',
    dica: 'Preferir balde, vassoura ou água reaproveitada na limpeza de áreas externas',
    economiaFormula: (minutosSemana) => minutosSemana * 4 * 0.012 * TARIFA_ESTIMADA.agua * 0.70
  }
};

// Navegação
function mostrarTela(idTela) {
  const destino = document.getElementById(idTela);
  if (!destino) return;

  document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
  destino.classList.add('active');

  document.querySelectorAll('.side-nav a').forEach(link => link.classList.remove('active'));

  if (idTela === 'tela1') {
    document.getElementById('navHome')?.classList.add('active');
  }

  if (idTela === 'telaHistorico') {
    document.getElementById('navHistorico')?.classList.add('active');
  }

  if (idTela === 'telaDicas') {
    document.getElementById('navDicas')?.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Armazenamento
function salvarRegistro(dados) {
  try {
    const registro = {
      ...dados,
      id: dados.id || Date.now(),
      criadoEm: dados.criadoEm || new Date().toISOString()
    };

    const historico = recuperarHistorico();
    const semDuplicados = historico.filter(item => item.id !== registro.id);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(registro));
    semDuplicados.unshift(registro);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(semDuplicados.slice(0, 36)));

    return true;
  } catch (erro) {
    console.error('Erro ao salvar no LocalStorage:', erro);
    return false;
  }
}

function recuperarRegistro() {
  try {
    const bruto = localStorage.getItem(STORAGE_KEY);
    return bruto ? JSON.parse(bruto) : null;
  } catch (erro) {
    console.error('Erro ao ler LocalStorage:', erro);
    return null;
  }
}

function limparRegistro() {
  localStorage.removeItem(STORAGE_KEY);
}

function recuperarHistorico(incluirRegistroLegado = true) {
  try {
    const bruto = localStorage.getItem(HISTORY_KEY);
    const registros = bruto ? JSON.parse(bruto) : [];

    if (Array.isArray(registros) && registros.length > 0) {
      return registros;
    }

    if (incluirRegistroLegado) {
      const registroAtual = recuperarRegistro();
      return registroAtual ? [registroAtual] : [];
    }

    return [];
  } catch (erro) {
    console.error('Erro ao ler histórico:', erro);
    return [];
  }
}

function formatarMes(mesReferencia) {
  if (!mesReferencia || !/^\d{4}-\d{2}$/.test(mesReferencia)) {
    return 'Mês não informado';
  }

  const [ano, mes] = mesReferencia.split('-');

  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(Number(ano), Number(mes) - 1, 1));
}

function escaparHTML(texto = '') {
  return String(texto).replace(/[&<>'"]/g, caractere => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  })[caractere]);
}

function renderizarHistorico() {
  const lista = document.getElementById('listaHistorico');
  const vazio = document.getElementById('historicoVazio');
  const historico = recuperarHistorico();

  lista.innerHTML = '';

  if (historico.length === 0) {
    vazio.classList.remove('d-none');
    return;
  }

  vazio.classList.add('d-none');

  historico.forEach((registro, indice) => {
    const tipo = registro.tipoConsumo === 'agua' ? 'agua' : 'energia';
    const unidade = tipo === 'agua' ? 'm³' : 'kWh';
    const rotuloTipo = tipo === 'agua' ? 'Água' : 'Energia';
    const icone = tipo === 'agua'
      ? 'bi-droplet-fill'
      : 'bi-lightning-charge-fill';

    const coluna = document.createElement('div');
    coluna.className = 'col-12 col-md-6 col-xl-4';

    coluna.innerHTML = `
      <article class="history-card">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
          <span class="history-type ${tipo}">
            <i class="bi ${icone}"></i>${rotuloTipo}
          </span>
          <small class="text-muted text-capitalize">
            ${escaparHTML(formatarMes(registro.mesReferencia))}
          </small>
        </div>

        <h3 class="h6 fw-bold mb-3">
          ${escaparHTML(registro.nomeUsuario || 'Registro residencial')}
        </h3>

        <div class="d-flex justify-content-between mb-2">
          <span class="text-muted">Consumo</span>
          <strong>${Number(registro.consumoValor || 0).toFixed(1)} ${unidade}</strong>
        </div>

        <div class="d-flex justify-content-between mb-2">
          <span class="text-muted">Conta</span>
          <strong>${formatarMoeda(Number(registro.valorConta || 0))}</strong>
        </div>

        <div class="d-flex justify-content-between mb-3">
          <span class="text-muted">Moradores</span>
          <strong>${Number(registro.quantidadePessoas || 1)}</strong>
        </div>

        <button type="button" class="btn btn-outline-eco btn-sm w-100 btn-ver-registro" data-indice="${indice}">
          <i class="bi bi-eye me-1"></i> Ver resultado
        </button>
      </article>
    `;

    lista.appendChild(coluna);
  });

  lista.querySelectorAll('.btn-ver-registro').forEach(botao => {
    botao.addEventListener('click', () => {
      const registro = historico[Number(botao.dataset.indice)];

      if (!registro) return;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(registro));
      restaurarFormulario(registro);
      renderizarResultado(registro);
      mostrarTela('tela2');
    });
  });
}

// Formulário
const formConsumo = document.getElementById('formConsumo');
const tipoConsumoInput = document.getElementById('tipoConsumo');
const tipoConsumoRadios = document.querySelectorAll('input[name="tipoConsumoOpcao"]');
const labelConsumo = document.getElementById('labelConsumo');
const unidadeConsumo = document.getElementById('unidadeConsumo');
const alertaFormulario = document.getElementById('alertaFormulario');
const nomeUsuarioInput = document.getElementById('nomeUsuario');
const quantidadePessoasInput = document.getElementById('quantidadePessoas');
const boasVindas = document.getElementById('boasVindas');
const tituloHabitos = document.getElementById('tituloHabitos');
const descricaoHabitos = document.getElementById('descricaoHabitos');
const listaEletrodomesticos = document.getElementById('listaEletrodomesticos');
const listaHabitosAgua = document.getElementById('listaHabitosAgua');

function atualizarTipoConsumo(tipo) {
  tipoConsumoInput.value = tipo;
  document.body.dataset.tipo = tipo;

  const consumoValorInput = document.getElementById('consumoValor');

  if (tipo === 'agua') {
    labelConsumo.textContent = 'Consumo em m³ *';
    unidadeConsumo.textContent = 'm³';
    consumoValorInput.placeholder = 'Ex: 13,2';

    tituloHabitos.innerHTML =
      '<i class="bi bi-droplet-half me-1"></i>Quais equipamentos ou hábitos que usam água fazem parte da sua rotina?';

    descricaoHabitos.textContent =
      'Selecione os equipamentos e hábitos residenciais mais relevantes para Sorocaba. Os consumos em litros são estimativas e variam conforme o modelo e a vazão.';

    listaEletrodomesticos.classList.add('d-none');
    listaHabitosAgua.classList.remove('d-none');
  } else {
    labelConsumo.textContent = 'Consumo em kWh *';
    unidadeConsumo.textContent = 'kWh';
    consumoValorInput.placeholder = 'Ex: 210';

    tituloHabitos.innerHTML =
      '<i class="bi bi-house-gear me-1"></i>Quais eletrodomésticos você usa com frequência?';

    descricaoHabitos.textContent =
      'Selecione os aparelhos de uso residencial comum ou relevante em Sorocaba. O consumo médio exibido é uma estimativa e pode variar conforme o modelo e o tempo de uso.';

    listaHabitosAgua.classList.add('d-none');
    listaEletrodomesticos.classList.remove('d-none');
  }
}

tipoConsumoRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      atualizarTipoConsumo(radio.value);
      document.getElementById('consumoValor').value = '';
    }
  });
});

document.querySelectorAll('.habito-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    const box = checkbox.closest('.appliance-box');
    const inputQtd = box.querySelector('input[type="number"]');

    inputQtd.disabled = !checkbox.checked;

    if (checkbox.checked) {
      inputQtd.focus();
    }
  });
});

document.querySelectorAll('.appliance-box').forEach(box => {
  box.addEventListener('click', evento => {
    if (evento.target.closest('input, label')) return;
    box.querySelector('.habito-checkbox').click();
  });
});

nomeUsuarioInput?.addEventListener('input', () => {
  const nome = nomeUsuarioInput.value.trim();

  boasVindas.textContent = nome
    ? `Olá, ${nome}! Vamos analisar seu consumo deste mês.`
    : 'Monitore sua água e energia, economize todo mês.';
});

function validarFormulario() {
  const erros = [];

  const mes = document.getElementById('mesReferencia').value;
  const quantidadePessoas = parseInt(quantidadePessoasInput.value, 10);
  const consumo = parseFloat(document.getElementById('consumoValor').value);
  const conta = parseFloat(document.getElementById('valorConta').value);

  if (!mes) {
    erros.push('Informe o mês de referência.');
  }

  if (
    !Number.isInteger(quantidadePessoas) ||
    quantidadePessoas < 1 ||
    quantidadePessoas > 20
  ) {
    erros.push('Informe uma quantidade de pessoas entre 1 e 20.');
  }

  if (isNaN(consumo) || consumo <= 0) {
    erros.push('Informe um valor de consumo válido (maior que zero).');
  }

  if (isNaN(conta) || conta <= 0) {
    erros.push('Informe o valor total da conta (maior que zero).');
  }

  return erros;
}

function coletarItensConsumo(tipoConsumo) {
  const selecionados = [];
  const grupoAtivo = tipoConsumo === 'agua'
    ? listaHabitosAgua
    : listaEletrodomesticos;

  grupoAtivo.querySelectorAll('.habito-checkbox').forEach(checkbox => {
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

formConsumo?.addEventListener('submit', evento => {
  evento.preventDefault();

  const erros = validarFormulario();

  formConsumo.classList.add('was-validated');

  if (erros.length > 0) {
    alertaFormulario.innerHTML =
      '<strong>Corrija os campos abaixo:</strong><ul class="mb-0 mt-1">' +
      erros.map(erro => `<li>${erro}</li>`).join('') +
      '</ul>';

    alertaFormulario.classList.remove('d-none');
    alertaFormulario.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    return;
  }

  alertaFormulario.classList.add('d-none');

  const dados = {
    nomeUsuario: nomeUsuarioInput.value.trim(),
    quantidadePessoas: parseInt(quantidadePessoasInput.value, 10),
    mesReferencia: document.getElementById('mesReferencia').value,
    tipoConsumo: tipoConsumoInput.value,
    consumoValor: parseFloat(document.getElementById('consumoValor').value),
    valorConta: parseFloat(document.getElementById('valorConta').value),
    itensConsumo: coletarItensConsumo(tipoConsumoInput.value)
  };

  const salvouComSucesso = salvarRegistro(dados);

  if (!salvouComSucesso) {
    alertaFormulario.innerHTML =
      'Não foi possível salvar seus dados neste navegador. Verifique se o LocalStorage está habilitado.';

    alertaFormulario.classList.remove('d-none');
    return;
  }

  renderizarResultado(dados);
  mostrarTela('tela2');
});

function resetarFormulario() {
  formConsumo.reset();
  formConsumo.classList.remove('was-validated');
  alertaFormulario.classList.add('d-none');
  boasVindas.textContent = 'Monitore sua água e energia, economize todo mês.';

  document.getElementById('tipoEnergia').checked = true;
  atualizarTipoConsumo('energia');

  document.querySelectorAll('.appliance-box input[type="number"]').forEach(input => {
    input.disabled = true;
  });
}

function restaurarFormulario(dados) {
  if (!dados) return;

  formConsumo.reset();
  formConsumo.classList.remove('was-validated');
  alertaFormulario.classList.add('d-none');

  const tipo = dados.tipoConsumo === 'agua' ? 'agua' : 'energia';
  const radioTipo = document.getElementById(
    tipo === 'agua' ? 'tipoAgua' : 'tipoEnergia'
  );

  if (radioTipo) {
    radioTipo.checked = true;
  }

  atualizarTipoConsumo(tipo);

  nomeUsuarioInput.value = dados.nomeUsuario || '';
  quantidadePessoasInput.value = Number(dados.quantidadePessoas) || 1;

  document.getElementById('mesReferencia').value =
    dados.mesReferencia || '';

  document.getElementById('consumoValor').value =
    Number.isFinite(Number(dados.consumoValor))
      ? Number(dados.consumoValor)
      : '';

  document.getElementById('valorConta').value =
    Number.isFinite(Number(dados.valorConta))
      ? Number(dados.valorConta)
      : '';

  boasVindas.textContent = nomeUsuarioInput.value.trim()
    ? `Olá, ${nomeUsuarioInput.value.trim()}! Vamos analisar seu consumo deste mês.`
    : 'Monitore sua água e energia, economize todo mês.';

  document.querySelectorAll('.habito-checkbox').forEach(checkbox => {
    checkbox.checked = false;

    const inputQtd = checkbox
      .closest('.appliance-box')
      ?.querySelector('input[type="number"]');

    if (inputQtd) {
      inputQtd.disabled = true;
      inputQtd.value = '';
    }
  });

  const grupoAtivo = tipo === 'agua'
    ? listaHabitosAgua
    : listaEletrodomesticos;

  const itensSalvos = Array.isArray(dados.itensConsumo)
    ? dados.itensConsumo
    : [];

  itensSalvos.forEach(item => {
    const checkbox = Array.from(
      grupoAtivo.querySelectorAll('.habito-checkbox')
    ).find(opcao => opcao.dataset.nome === item.nome);

    if (!checkbox) return;

    checkbox.checked = true;

    const inputQtd = checkbox
      .closest('.appliance-box')
      ?.querySelector('input[type="number"]');

    if (inputQtd) {
      inputQtd.disabled = false;
      inputQtd.value = Math.max(
        1,
        Number.parseInt(item.quantidade, 10) || 1
      );
    }
  });
}

// Comparação
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

  return {
    percentual,
    status
  };
}

function aplicarSemaforo(status, percentual) {
  const box = document.getElementById('semaforoBox');
  const luz = document.getElementById('luzSemaforo');
  const statusTexto = document.getElementById('statusSemaforo');
  const mensagem = document.getElementById('mensagemSemaforo');
  const percentualEl = document.getElementById('percentualDiferenca');

  box.classList.remove(
    'semaforo-verde',
    'semaforo-amarelo',
    'semaforo-vermelho'
  );

  luz.classList.remove(
    'luz-verde',
    'luz-amarela',
    'luz-vermelha'
  );

  const percentualExibido =
    `${percentual > 0 ? '+' : ''}${percentual.toFixed(1)}%`;

  percentualEl.textContent = percentualExibido;

  if (status === 'verde') {
    box.classList.add('semaforo-verde');
    luz.classList.add('luz-verde');
    statusTexto.textContent = 'Consumo abaixo da média — parabéns!';
    mensagem.textContent =
      'Você está consumindo menos que a média de Sorocaba. Continue assim!';
  } else if (status === 'amarelo') {
    box.classList.add('semaforo-amarelo');
    luz.classList.add('luz-amarela');
    statusTexto.textContent =
      'Consumo próximo da média — fique atento';
    mensagem.textContent =
      'Seu consumo está na média, mas pequenos ajustes já fazem diferença no fim do mês.';
  } else {
    box.classList.add('semaforo-vermelho');
    luz.classList.add('luz-vermelha');
    statusTexto.textContent =
      'Consumo acima da média — hora de agir';
    mensagem.textContent =
      'Seu consumo está bem acima da média de Sorocaba. Veja as dicas abaixo para economizar.';
  }

  return status;
}

function renderizarComparativo(dados, media) {
  const unidade = dados.tipoConsumo === 'agua' ? 'm³' : 'kWh';
  const quantidadePessoas = Math.max(
    parseInt(dados.quantidadePessoas, 10) || 1,
    1
  );

  const consumoPorPessoa =
    dados.consumoValor / quantidadePessoas;

  document.getElementById('consumoUsuarioValor').textContent =
    `${dados.consumoValor.toFixed(1)} ${unidade}`;

  document.getElementById('moradoresUsuarioValor').textContent =
    `${quantidadePessoas} ${
      quantidadePessoas === 1 ? 'pessoa' : 'pessoas'
    }`;

  document.getElementById('consumoPessoaValor').textContent =
    `${consumoPorPessoa.toFixed(1)} ${unidade}/pessoa`;

  document.getElementById('contaUsuarioValor').textContent =
    formatarMoeda(dados.valorConta);

  document.getElementById('consumoMediaValor').textContent =
    `${media.toFixed(1)} ${unidade}`;

  const proporcao = Math.min(
    (dados.consumoValor / media) * 100,
    150
  );

  const barraUsuario = document.getElementById('barraUsuario');

  barraUsuario.style.width =
    `${Math.min(proporcao, 100)}%`;

  barraUsuario.textContent =
    `${dados.consumoValor.toFixed(0)} ${unidade}`;

  const cor = proporcao <= 100
    ? 'var(--verde)'
    : 'var(--azul)';

  barraUsuario.style.backgroundColor = cor;
}

// Economia
function renderizarEconomia(itensConsumo, tipoConsumo) {
  const container = document.getElementById('listaEconomia');
  const avisoVazio = document.getElementById('semEletrodomesticos');
  const descricaoEconomia = document.getElementById('descricaoEconomia');

  const bancoPerfis = tipoConsumo === 'agua'
    ? PERFIL_HABITOS_AGUA
    : PERFIL_ELETRODOMESTICOS;

  container.innerHTML = '';

  descricaoEconomia.textContent = tipoConsumo === 'agua'
    ? 'Estimativas baseadas nos equipamentos e hábitos de água selecionados. Os valores podem variar conforme o modelo, a vazão e a tarifa da residência.'
    : 'Estimativas baseadas nos eletrodomésticos selecionados. Os valores podem variar conforme potência, tempo de uso e tarifa.';

  if (!itensConsumo || itensConsumo.length === 0) {
    avisoVazio.classList.remove('d-none');
    return;
  }

  avisoVazio.classList.add('d-none');

  let totalEconomia = 0;

  itensConsumo.forEach(item => {
    const perfil = bancoPerfis[item.nome];

    if (!perfil) return;

    const economia = perfil.economiaFormula(item.quantidade);
    totalEconomia += economia;

    const consumoMedio = perfil.consumoMedio
      ? `<div class="small fw-semibold text-primary mt-1">${perfil.consumoMedio}</div>`
      : '';

    const bloco = document.createElement('div');
    bloco.className = 'economia-card';

    bloco.innerHTML = `
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <i class="bi ${perfil.icone} me-2 text-primary"></i>
          <strong>${item.nome}</strong>
          ${consumoMedio}
          <p class="mb-0 mt-1 small text-muted">${perfil.dica}.</p>
        </div>
        <span class="economia-valor fs-6">até ${formatarMoeda(economia)}/mês</span>
      </div>
    `;

    container.appendChild(bloco);
  });

  const resumo = document.createElement('div');
  resumo.className =
    'alert alert-success d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2';

  resumo.innerHTML = `
    <span>
      <i class="bi bi-piggy-bank-fill me-2"></i>
      Economia total estimada com esses hábitos
    </span>
    <strong class="fs-5">${formatarMoeda(totalEconomia)}/mês</strong>
  `;

  container.appendChild(resumo);
}

// Dicas
const BANCO_DE_DICAS = {
  energia: {
    verde: [
      'Continue acompanhando a conta todos os meses para manter o consumo controlado.',
      'Desligue aparelhos da tomada quando não estiverem em uso e evite o modo stand-by.',
      'Dê preferência a lâmpadas LED e equipamentos com selo de eficiência energética.'
    ],
    amarelo: [
      'Reduza alguns minutos do banho elétrico e use a posição verão quando possível.',
      'Concentre o uso da máquina de lavar e do ferro para evitar vários ciclos pequenos.',
      'Observe quais aparelhos ficam ligados por muitas horas ao longo do dia.'
    ],
    vermelho: [
      'Comece revisando o tempo de banho e o uso diário do ar-condicionado.',
      'Evite deixar vários aparelhos de alto consumo ligados ao mesmo tempo.',
      'Compare a próxima conta após aplicar uma mudança de hábito por vez.'
    ]
  },
  agua: {
    verde: [
      'Continue observando a conta e verificando se o consumo permanece estável.',
      'Reaproveite água da máquina de lavar para limpar quintais quando for possível.',
      'Faça verificações periódicas em torneiras, descargas e registros.'
    ],
    amarelo: [
      'Reduza alguns minutos do banho e feche a torneira enquanto se ensaboa.',
      'Use a máquina de lavar somente com carga completa.',
      'Prefira balde e água reaproveitada no lugar da mangueira.'
    ],
    vermelho: [
      'Verifique primeiro a existência de vazamentos em torneiras, descargas e registros.',
      'Reduza o tempo de banho e evite deixar torneiras abertas sem necessidade.',
      'Acompanhe o hidrômetro com tudo fechado para identificar consumo inesperado.'
    ]
  }
};

function renderizarDicas(status, tipoConsumo) {
  const container = document.getElementById('listaDicas');
  container.innerHTML = '';

  const bancoTipo =
    BANCO_DE_DICAS[tipoConsumo] || BANCO_DE_DICAS.energia;

  const dicas =
    bancoTipo[status] || bancoTipo.amarelo;

  dicas.forEach(texto => {
    const item = document.createElement('div');
    item.className = 'dica-item';

    item.innerHTML =
      `<i class="bi bi-check2-circle text-success me-2"></i>${texto}`;

    container.appendChild(item);
  });
}

// Resultado
function renderizarResultado(dados) {
  const tipo = dados.tipoConsumo === 'agua'
    ? 'agua'
    : 'energia';

  const dadosNormalizados = {
    ...dados,
    tipoConsumo: tipo
  };

  document.body.dataset.tipo = tipo;

  const referencia = REFERENCIAS_SOROCABA[tipo];
  const media = referencia.mediaMensal;
  const nome = dados.nomeUsuario
    ? `, ${dados.nomeUsuario}`
    : '';

  document.getElementById('tituloResultado').textContent =
    `Resultado da sua análise${nome}`;

  document.getElementById('legendaPercentual').textContent =
    `em relação à média de Sorocaba (${media.toFixed(1)} ${referencia.unidade})`;

  document.getElementById('fonteMedia').textContent =
    `${referencia.fonteCurta} (${referencia.anoBase})`;

  document.getElementById('detalheFonteMedia').textContent =
    `${referencia.fonteCompleta} ${referencia.metodologia}`;

  const {
    percentual,
    status
  } = calcularComparativo(
    dadosNormalizados.consumoValor,
    media
  );

  const itensConsumo =
    dados.itensConsumo ||
    dados.eletrodomesticos ||
    [];

  aplicarSemaforo(status, percentual);
  renderizarComparativo(dadosNormalizados, media);
  renderizarEconomia(itensConsumo, tipo);
  renderizarDicas(status, tipo);
}

// Eventos
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

document.getElementById('btnVoltar')?.addEventListener('click', () => {
  limparRegistro();
  resetarFormulario();
  mostrarTela('tela1');
});

function abrirInicio(evento) {
  evento?.preventDefault();
  mostrarTela('tela1');
}

document.getElementById('logoHome')?.addEventListener('click', abrirInicio);
document.getElementById('navHome')?.addEventListener('click', abrirInicio);
document.getElementById('btnHistoricoHome')?.addEventListener('click', abrirInicio);

document.getElementById('navConsumo')?.addEventListener('click', evento => {
  evento.preventDefault();
  mostrarTela('tela1');

  requestAnimationFrame(() => {
    document
      .getElementById('formConsumo')
      .scrollIntoView({
        behavior: 'smooth'
      });
  });
});

document.getElementById('navHistorico')?.addEventListener('click', evento => {
  evento.preventDefault();
  renderizarHistorico();
  mostrarTela('telaHistorico');
});

document.getElementById('navDicas')?.addEventListener('click', evento => {
  evento.preventDefault();
  mostrarTela('telaDicas');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  atualizarTipoConsumo('energia');

  const registroExistente = recuperarRegistro();

  if (registroExistente) {
    restaurarFormulario(registroExistente);
    renderizarResultado(registroExistente);
    mostrarTela('tela2');
  } else {
    mostrarTela('tela1');
  }
});
/* RELATÓRIO DE HISTÓRICO */

// Organiza os registros por data (mais recente primeiro)
function ordenarPorData(registros) {
  return [...registros].sort((a, b) => {
    const dataA = a.mesReferencia || (a.criadoEm ? String(a.criadoEm).slice(0, 7) : '');
    const dataB = b.mesReferencia || (b.criadoEm ? String(b.criadoEm).slice(0, 7) : '');
    return dataB.localeCompare(dataA);
  });
}

// Separa registros de Água e Energia
function separarPorTipo(registros) {
  const agua = [];
  const energia = [];

  registros.forEach(r => {
    if (r.tipoConsumo === 'agua') agua.push(r);
    else energia.push(r);
  });

  return { energia, agua };
}

function formatarDataHoraRelatorio(data = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(data);
}

function montarLinhasTabela(registros, tipo) {
  if (!registros.length) {
    return `<tr><td colspan="6" class="sem-registros">
      Nenhum registro de ${tipo === 'agua' ? 'água' : 'energia'} encontrado.
    </td></tr>`;
  }

  const unidade = tipo === 'agua' ? 'm³' : 'kWh';

  return registros.map(r => {
    const mes = formatarMes(r.mesReferencia);
    const pessoas = Number(r.quantidadePessoas) || 1;
    const consumo = Number(r.consumoValor) || 0;
    const conta = Number(r.valorConta) || 0;
    const porPessoa = consumo / Math.max(pessoas, 1);

    return `
      <tr>
        <td class="mes">${escaparHTML(mes)}</td>
        <td>${escaparHTML(r.nomeUsuario || '—')}</td>
        <td class="num">${pessoas}</td>
        <td class="num"><strong>${consumo.toFixed(1)} ${unidade}</strong></td>
        <td class="num">${porPessoa.toFixed(1)} ${unidade}</td>
        <td class="num">${formatarMoeda(conta)}</td>
      </tr>`;
  }).join('');
}

function calcularResumo(registros, tipo) {
  const unidade = tipo === 'agua' ? 'm³' : 'kWh';
  const qtd = registros.length;
  const totalConsumo = registros.reduce((s, r) => s + (Number(r.consumoValor) || 0), 0);
  const totalConta = registros.reduce((s, r) => s + (Number(r.valorConta) || 0), 0);
  const media = qtd ? totalConsumo / qtd : 0;

  return `
    <div class="card-resumo ${tipo}">
      <h3>${tipo === 'agua' ? '💧 Água' : '⚡ Energia elétrica'}</h3>
      <ul>
        <li><span>Registros:</span> <strong>${qtd}</strong></li>
        <li><span>Consumo total:</span> <strong>${totalConsumo.toFixed(1)} ${unidade}</strong></li>
        <li><span>Consumo médio:</span> <strong>${media.toFixed(1)} ${unidade}</strong></li>
        <li><span>Total em contas:</span> <strong>${formatarMoeda(totalConta)}</strong></li>
      </ul>
    </div>`;
}

function gerarHTMLRelatorio() {
  const historico = recuperarHistorico();
  if (!historico.length) return null;

  const ordenado = ordenarPorData(historico);
  const { energia, agua } = separarPorTipo(ordenado);

  const dataGeracao = formatarDataHoraRelatorio();
  const linhasEnergia = montarLinhasTabela(energia, 'energia');
  const linhasAgua = montarLinhasTabela(agua, 'agua');
  const resumoEnergia = calcularResumo(energia, 'energia');
  const resumoAgua = calcularResumo(agua, 'agua');

  const css = `
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f4f8fb; color: #183153; margin: 0; padding: 32px 20px; }
    .container { max-width: 1000px; margin: 0 auto; }
    header { background: linear-gradient(135deg, #1677e8 0%, #18a957 100%); color: #fff; padding: 28px 32px; border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,.12); margin-bottom: 24px; }
    header h1 { margin: 0 0 6px; font-size: 26px; }
    header p { margin: 0; opacity: .92; font-size: 14px; }
    .resumo-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .card-resumo { background: #fff; border-radius: 12px; padding: 18px 22px; box-shadow: 0 3px 12px rgba(45,94,135,.08); border-left: 6px solid #999; }
    .card-resumo.energia { border-left-color: #18a957; }
    .card-resumo.agua { border-left-color: #1677e8; }
    .card-resumo h3 { margin: 0 0 12px; font-size: 17px; }
    .card-resumo ul { list-style: none; padding: 0; margin: 0; }
    .card-resumo li { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e5edf5; font-size: 14px; }
    .card-resumo li:last-child { border-bottom: none; }
    .card-resumo li span { color: #63718b; }
    section.secao { background: #fff; border-radius: 12px; padding: 22px 26px; margin-bottom: 24px; box-shadow: 0 3px 12px rgba(45,94,135,.08); }
    section.secao h2 { margin: 0 0 16px; font-size: 19px; }
    section.secao.energia h2 { color: #108847; }
    section.secao.agua h2 { color: #0e5fc5; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    thead th { background: #f1f7fd; text-align: left; padding: 10px 12px; font-weight: 700; border-bottom: 2px solid #dce8f3; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid #eef3f8; }
    tbody tr:nth-child(even) { background: #fafcfe; }
    td.num { text-align: right; white-space: nowrap; }
    td.mes { text-transform: capitalize; white-space: nowrap; }
    td.sem-registros { text-align: center; color: #8894a8; padding: 22px 0; font-style: italic; }
    footer { text-align: center; font-size: 12px; color: #63718b; margin-top: 12px; padding-top: 14px; border-top: 1px solid #dce8f3; }
    @media print { body { background: #fff; padding: 0; } header, section.secao, .card-resumo { box-shadow: none; } }
  `;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório EcoBrasil — Histórico de Consumo</title>
<style>${css}</style>
</head>
<body>
  <div class="container">
    <header>
      <h1>EcoBrasil — Relatório de Consumo</h1>
      <p>Histórico completo de consumo de água e energia elétrica</p>
      <p style="margin-top:6px;font-size:13px;"><strong>Gerado em:</strong> ${escaparHTML(dataGeracao)}</p>
      <p style="margin-top:2px;font-size:13px;"><strong>Total:</strong> ${ordenado.length} registros (${energia.length} energia / ${agua.length} água)</p>
    </header>

    <div class="resumo-grid">${resumoEnergia}${resumoAgua}</div>

    <section class="secao energia">
      <h2>⚡ Energia elétrica</h2>
      <table>
        <thead><tr>
          <th>Mês</th><th>Responsável</th>
          <th style="text-align:right;">Pessoas</th>
          <th style="text-align:right;">Consumo</th>
          <th style="text-align:right;">Por pessoa</th>
          <th style="text-align:right;">Conta</th>
        </tr></thead>
        <tbody>${linhasEnergia}</tbody>
      </table>
    </section>

    <section class="secao agua">
      <h2>💧 Água</h2>
      <table>
        <thead><tr>
          <th>Mês</th><th>Responsável</th>
          <th style="text-align:right;">Pessoas</th>
          <th style="text-align:right;">Consumo</th>
          <th style="text-align:right;">Por pessoa</th>
          <th style="text-align:right;">Conta</th>
        </tr></thead>
        <tbody>${linhasAgua}</tbody>
      </table>
    </section>

    <footer>
      Relatório gerado automaticamente pelo EcoBrasil.<br>
      Dica: use Ctrl+P (Cmd+P no Mac) para salvar em PDF.
    </footer>
  </div>
</body>
</html>`;
}

function baixarRelatorio() {
  const html = gerarHTMLRelatorio();

  if (!html) {
    alert('Não há registros no histórico para exportar. Faça uma análise primeiro.');
    return;
  }

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const agora = new Date();
  const dataArquivo = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  const link = document.createElement('a');
  link.href = url;
  link.download = `ecobrasil-relatorio-${dataArquivo}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

document.getElementById('btnBaixarRelatorio')?.addEventListener('click', baixarRelatorio);