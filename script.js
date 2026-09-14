/* 
   BACK-END (simulado)
   Funções reaproveitáveis de CRUD operando sobre um Array.
   Em uma API real, cada uma dessas funções corresponderia
   a uma rota (POST, GET, PUT/PATCH, DELETE).
  */

let produtos = []; // estrutura de armazenamento
let proximoId = 1;

// C -Create
function criarProduto({ nome, categoria, preco, quantidade }) {
  const novoProduto = {
    id: proximoId++,
    nome: nome.trim(),
    categoria,
    preco: Number(preco),
    quantidade: Number(quantidade)
  };
  produtos.push(novoProduto);
  return novoProduto;
}

// R - Read
function lerProdutos() {
  return produtos;
}

function lerProdutoPorId(id) {
  return produtos.find(p => p.id === id);
}

// U -Update
function atualizarProduto(id, dadosAtualizados) {
  const produto = lerProdutoPorId(id);
  if (!produto) return null;
  Object.assign(produto, {
    nome: dadosAtualizados.nome.trim(),
    categoria: dadosAtualizados.categoria,
    preco: Number(dadosAtualizados.preco),
    quantidade: Number(dadosAtualizados.quantidade)
  });
  return produto;
}

// D -Delete
function deletarProduto(id) {
  const indice = produtos.findIndex(p => p.id === id);
  if (indice === -1) return false;
  produtos.splice(indice, 1);
  return true;
}

/*
   FRONT-END
   Interface que demonstra as quatro operações do CRUD.*/

const form = document.getElementById('form-produto');
const campoNome = document.getElementById('nome');
const campoCategoria = document.getElementById('categoria');
const campoPreco = document.getElementById('preco');
const campoQuantidade = document.getElementById('quantidade');
const tabela = document.getElementById('tabela-produtos');
const contador = document.getElementById('contador');
const msgVazio = document.getElementById('msg-vazio');
const formMsg = document.getElementById('form-msg');
const formTitulo = document.getElementById('form-titulo');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const stamp = document.getElementById('stamp');

let idEmEdicao = null; // null = modo criação, número = modo edição

function formatarPreco(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizarTabela() {
  const lista = lerProdutos();
  tabela.innerHTML = '';

  if (lista.length === 0) {
    msgVazio.style.display = 'block';
  } else {
    msgVazio.style.display = 'none';
  }

  lista.forEach(produto => {
    const tr = document.createElement('tr');
    const qtdClasse = produto.quantidade <= 3 ? 'qtd-baixa' : '';
    tr.innerHTML = `
      <td class="sku">#${String(produto.id).padStart(4, '0')}</td>
      <td>${produto.nome}</td>
      <td>${produto.categoria}</td>
      <td>${formatarPreco(produto.preco)}</td>
      <td class="${qtdClasse}">${produto.quantidade}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn edit" title="Editar" data-id="${produto.id}">✎</button>
          <button class="icon-btn del" title="Excluir" data-id="${produto.id}">✕</button>
        </div>
      </td>
    `;
    tabela.appendChild(tr);
  });

  contador.textContent = `${lista.length} ${lista.length === 1 ? 'item' : 'itens'}`;
  stamp.textContent = lista.length > 0 ? 'EM USO' : 'VAZIO';
}

function mostrarMensagem(texto, tipo = 'sucesso') {
  formMsg.textContent = texto;
  formMsg.className = tipo === 'erro' ? 'erro' : '';
  clearTimeout(mostrarMensagem._t);
  mostrarMensagem._t = setTimeout(() => { formMsg.textContent = ''; }, 2500);
}

function entrarModoEdicao(id) {
  const produto = lerProdutoPorId(id);
  if (!produto) return;
  idEmEdicao = id;
  campoNome.value = produto.nome;
  campoCategoria.value = produto.categoria;
  campoPreco.value = produto.preco;
  campoQuantidade.value = produto.quantidade;
  formTitulo.textContent = `Editando #${String(id).padStart(4, '0')}`;
  btnSalvar.textContent = 'Salvar alterações';
  btnCancelar.style.display = 'inline-block';
  campoNome.focus();
}

function sairModoEdicao() {
  idEmEdicao = null;
  form.reset();
  formTitulo.textContent = 'Novo produto';
  btnSalvar.textContent = 'Adicionar produto';
  btnCancelar.style.display = 'none';
}

form.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const dados = {
    nome: campoNome.value,
    categoria: campoCategoria.value,
    preco: campoPreco.value,
    quantidade: campoQuantidade.value
  };

  if (!dados.nome) {
    mostrarMensagem('Informe o nome do produto.', 'erro');
    return;
  }

  if (idEmEdicao === null) {
    criarProduto(dados);
    mostrarMensagem('Produto adicionado.');
  } else {
    atualizarProduto(idEmEdicao, dados);
    mostrarMensagem('Produto atualizado.');
    sairModoEdicao();
  }

  form.reset();
  renderizarTabela();
});

btnCancelar.addEventListener('click', sairModoEdicao);

tabela.addEventListener('click', (evento) => {
  const alvo = evento.target;
  const id = Number(alvo.dataset.id);
  if (!id) return;

  if (alvo.classList.contains('edit')) {
    entrarModoEdicao(id);
  }

  if (alvo.classList.contains('del')) {
    const produto = lerProdutoPorId(id);
    const confirmar = confirm(`Excluir "${produto.nome}" do estoque?`);
    if (confirmar) {
      deletarProduto(id);
      if (idEmEdicao === id) sairModoEdicao();
      mostrarMensagem('Produto excluído.');
      renderizarTabela();
    }
  }
});

// Dados inciais para demonnstração
criarProduto({ nome: 'Cadeira de escritório', categoria: 'Móveis', preco: 349.9, quantidade: 12 });
criarProduto({ nome: 'Monitor 24"', categoria: 'Eletrônicos', preco: 899, quantidade: 5 });
criarProduto({ nome: 'Caderno universitário', categoria: 'Papelaria', preco: 18.5, quantidade: 2 });

renderizarTabela();
