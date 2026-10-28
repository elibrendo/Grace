(function () {
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  const grade = document.getElementById('grade');
  const filtros = document.getElementById('filtros');
  const contagem = document.getElementById('contagem');

  const produtos = PRODUTOS.slice(0, LOJA.maxProdutos);
  let categoriaAtual = 'todos';

  function linkWhatsApp(texto) {
    return 'https://wa.me/' + LOJA.whatsapp + '?text=' + encodeURIComponent(texto);
  }

  function el(tag, classe, texto) {
    const n = document.createElement(tag);
    if (classe) n.className = classe;
    if (texto != null) n.textContent = texto;
    return n;
  }

  function nomeCompleto(p) {
    return p.nome + (p.detalhe && p.detalhe !== 'Unidade' ? ' (' + p.detalhe + ')' : '');
  }

  // ---------- Carrinho ----------
  const CHAVE = 'grace-carrinho';
  let itens = {};      // { indiceDoProduto: quantidade }
  let cupomAtivo = null;

  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) || '{}');
    Object.keys(salvo.itens || {}).forEach(function (i) {
      const q = parseInt(salvo.itens[i], 10);
      if (produtos[i] && q > 0) itens[i] = q;
    });
    cupomAtivo = CUPONS.find(function (c) { return c.codigo === salvo.cupom; }) || null;
  } catch (e) { /* sem armazenamento: segue vazio */ }

  function salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify({ itens: itens, cupom: cupomAtivo && cupomAtivo.codigo }));
    } catch (e) { /* ignora */ }
  }

  function calcular() {
    let subtotal = 0, qtd = 0;
    Object.keys(itens).forEach(function (i) {
      subtotal += produtos[i].preco * itens[i];
      qtd += itens[i];
    });
    let desconto = 0;
    if (cupomAtivo) {
      desconto = cupomAtivo.tipo === 'percentual' ? subtotal * cupomAtivo.valor / 100 : cupomAtivo.valor;
      desconto = Math.min(desconto, subtotal);
    }
    return { subtotal: subtotal, desconto: desconto, total: subtotal - desconto, qtd: qtd };
  }

  function adicionar(i) {
    itens[i] = (itens[i] || 0) + 1;
    renderCarrinho();
  }

  function alterar(i, delta) {
    const q = (itens[i] || 0) + delta;
    if (q > 0) itens[i] = q; else delete itens[i];
    renderCarrinho();
  }

  const modal = document.getElementById('carrinho');
  const botaoCarrinho = document.getElementById('carrinho-abrir');
  const lista = document.getElementById('carrinho-itens');
  const cupomForm = document.getElementById('cupom-form');
  const cupomInput = document.getElementById('cupom-codigo');
  const cupomMsg = document.getElementById('cupom-msg');
  const linkPedir = document.getElementById('carrinho-pedir');

  function mensagemCupom(texto, erro) {
    cupomMsg.textContent = texto;
    cupomMsg.classList.toggle('cupom__msg--erro', !!erro);
  }

  function montarMensagem(t) {
    const linhas = [LOJA.mensagemPedido, ''];
    Object.keys(itens).forEach(function (i) {
      const p = produtos[i];
      linhas.push('• ' + itens[i] + 'x ' + nomeCompleto(p) + ' — ' + brl.format(p.preco * itens[i]));
    });
    linhas.push('');
    if (cupomAtivo) {
      linhas.push('Subtotal: ' + brl.format(t.subtotal));
      linhas.push('Cupom ' + cupomAtivo.codigo + ': -' + brl.format(t.desconto));
    }
    linhas.push('*Total: ' + brl.format(t.total) + '*');
    return linhas.join('\n');
  }

  function renderCarrinho() {
    const t = calcular();
    const vazio = t.qtd === 0;

    botaoCarrinho.hidden = vazio && modal.hidden;
    document.getElementById('carrinho-qtd').textContent = t.qtd;
    botaoCarrinho.setAttribute('aria-label', 'Abrir carrinho, ' + t.qtd + (t.qtd === 1 ? ' item' : ' itens'));

    lista.innerHTML = '';
    if (vazio) {
      lista.appendChild(el('li', 'itens__vazio', 'Seu carrinho está vazio.'));
    }
    Object.keys(itens).forEach(function (i) {
      const p = produtos[i];
      const li = el('li', 'item');
      const foto = el('img', 'item__foto');
      foto.src = p.foto;
      foto.alt = p.nome;
      foto.loading = 'lazy';
      li.appendChild(foto);

      const txt = el('div', 'item__txt');
      txt.appendChild(el('strong', 'item__nome', nomeCompleto(p)));
      txt.appendChild(el('span', 'item__unit', brl.format(p.preco) + ' cada'));
      li.appendChild(txt);

      const qtd = el('div', 'item__qtd');
      const menos = el('button', null, '−');
      menos.type = 'button';
      menos.setAttribute('aria-label', 'Diminuir quantidade de ' + nomeCompleto(p));
      menos.addEventListener('click', function () { alterar(i, -1); });
      const mais = el('button', null, '+');
      mais.type = 'button';
      mais.setAttribute('aria-label', 'Aumentar quantidade de ' + nomeCompleto(p));
      mais.addEventListener('click', function () { alterar(i, 1); });
      qtd.appendChild(menos);
      qtd.appendChild(el('span', null, String(itens[i])));
      qtd.appendChild(mais);
      li.appendChild(qtd);

      li.appendChild(el('span', 'item__total', brl.format(p.preco * itens[i])));
      lista.appendChild(li);
    });

    document.getElementById('total-subtotal').textContent = brl.format(t.subtotal);
    document.getElementById('total-desconto-linha').hidden = !cupomAtivo;
    document.getElementById('total-desconto').textContent = '-' + brl.format(t.desconto);
    document.getElementById('total-final').textContent = brl.format(t.total);

    if (cupomAtivo) mensagemCupom('Cupom ' + cupomAtivo.codigo + ' aplicado.', false);

    linkPedir.href = vazio ? '#' : linkWhatsApp(montarMensagem(t));
    linkPedir.setAttribute('aria-disabled', String(vazio));
    linkPedir.classList.toggle('botao--desativado', vazio);
    salvar();
  }

  function abrir() {
    modal.hidden = false;
    document.body.classList.add('modal-aberto');
    modal.querySelector('.modal__fechar').focus();
  }

  function fechar() {
    modal.hidden = true;
    document.body.classList.remove('modal-aberto');
    renderCarrinho();
    botaoCarrinho.focus();
  }

  botaoCarrinho.addEventListener('click', abrir);
  modal.querySelectorAll('[data-fechar]').forEach(function (n) { n.addEventListener('click', fechar); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) fechar();
  });

  cupomForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const codigo = cupomInput.value.trim().toUpperCase();
    if (!codigo) return;
    const c = CUPONS.find(function (x) { return x.codigo === codigo; });
    if (!c) {
      mensagemCupom('Cupom inválido.', true);
      return;
    }
    cupomAtivo = c;
    cupomInput.value = '';
    renderCarrinho();
  });

  linkPedir.addEventListener('click', function (e) {
    if (calcular().qtd === 0) e.preventDefault();
  });

  document.getElementById('carrinho-limpar').addEventListener('click', function () {
    itens = {};
    cupomAtivo = null;
    mensagemCupom('', false);
    renderCarrinho();
  });

  function cartao(p) {
    const art = el('article', 'produto');

    const arte = el('div', 'produto__arte produto__arte--' + p.categoria);
    const icone = el('span', 'produto__icone', p.icone || '✦');
    icone.setAttribute('aria-hidden', 'true');
    arte.appendChild(icone);
    const categoria = CATEGORIAS.find(function (item) { return item.id === p.categoria; });
    arte.appendChild(el('span', 'produto__tipo', categoria ? categoria.nome : 'Semijoia'));
    if (p.foto) {
      const foto = el('img', 'produto__foto');
      foto.src = p.foto;
      foto.alt = p.nome;
      foto.loading = 'lazy';
      // Se a foto não existir, mantém a arte ilustrativa
      foto.addEventListener('error', function () { foto.remove(); });
      arte.appendChild(foto);
    }
    art.appendChild(arte);

    const info = el('div', 'produto__info');
    info.appendChild(el('h3', 'produto__nome', p.nome));
    if (p.descricao) info.appendChild(el('p', 'produto__descricao', p.descricao));
    if (p.detalhe) info.appendChild(el('p', 'produto__detalhe', p.detalhe));

    const precos = el('div', 'produto__precos');
    precos.appendChild(el('span', 'preco', brl.format(p.preco)));
    if (p.precoAntigo != null) {
      precos.appendChild(el('span', 'preco--antigo', brl.format(p.precoAntigo)));
    }
    info.appendChild(precos);

    const pedir = el('button', 'pedir', 'Adicionar');
    pedir.type = 'button';
    pedir.setAttribute('aria-label', 'Adicionar ' + nomeCompleto(p) + ' ao carrinho');
    pedir.addEventListener('click', function () {
      adicionar(produtos.indexOf(p));
      pedir.textContent = 'Adicionado ✓';
      setTimeout(function () { pedir.textContent = 'Adicionar'; }, 1200);
    });
    info.appendChild(pedir);

    art.appendChild(info);
    return art;
  }

  function renderFiltros() {
    filtros.innerHTML = '';
    CATEGORIAS.forEach(function (c) {
      const b = el('button', 'filtro', c.nome);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(c.id === categoriaAtual));
      b.addEventListener('click', function () {
        categoriaAtual = c.id;
        renderFiltros();
        renderGrade();
      });
      filtros.appendChild(b);
    });
  }

  function renderGrade() {
    const lista = categoriaAtual === 'todos'
      ? produtos
      : produtos.filter(function (p) { return p.categoria === categoriaAtual; });

    grade.innerHTML = '';
    if (!lista.length) {
      grade.appendChild(el('p', 'vazio', 'Nenhum produto nesta categoria.'));
    } else {
      lista.forEach(function (p) { grade.appendChild(cartao(p)); });
    }
    contagem.textContent = lista.length + (lista.length === 1 ? ' produto' : ' produtos');
  }

  renderFiltros();
  renderGrade();
  renderCarrinho();
})();
