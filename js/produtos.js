const LOJA = {
  // Informe o WhatsApp da Grace com DDI e DDD, somente números.
  whatsapp: '',
  mensagemPedido: 'Olá! Quero fazer meu pedido na Grace:',
  maxProdutos: 10,
};

const CUPONS = [
  { codigo: 'GRACE10', tipo: 'percentual', valor: 10 },
];

const CATEGORIAS = [
  { id: 'todos', nome: 'Todas' },
  { id: 'colares', nome: 'Colares' },
  { id: 'brincos', nome: 'Brincos' },
  { id: 'aneis', nome: 'Anéis' },
  { id: 'pulseiras', nome: 'Pulseiras' },
];

const PRODUTOS = [
  {
    nome: 'Colar Lumière Inicial',
    descricao: 'Corrente cravejada com pingente de inicial em destaque.',
    detalhe: 'Prata e dourado',
    foto: 'img/colar-iniciais.png',
    preco: 89,
    categoria: 'colares',
    icone: '✦',
  },
  {
    nome: 'Argolas Coração Étoile',
    descricao: 'Corações cravejados para iluminar qualquer ocasião.',
    detalhe: 'Dourado',
    foto: 'img/argolas-coracao.png',
    preco: 96,
    categoria: 'brincos',
    icone: '♡',
  },
  {
    nome: 'Anéis Elos Dourados',
    descricao: 'Conjunto de formas marcantes com acabamento polido.',
    detalhe: 'Mix de anéis',
    foto: 'img/aneis-elos.png',
    preco: 78,
    categoria: 'aneis',
    icone: '✧',
  },
  {
    nome: 'Pulseiras Duo Escultural',
    descricao: 'Trio de pulseiras com formas orgânicas e toque bicolor.',
    detalhe: 'Kit com 3 peças',
    foto: 'img/pulseiras-duo.png',
    preco: 100,
    categoria: 'pulseiras',
    icone: '✦',
  },
];
