'use strict';

/* ==========================================================
   1. DADOS
   ========================================================== */
const APP_NAME = 'Nuvem de pensamento computacional';
const DURATION = 1258; // 20:58 em segundos

const TOPICS = {
  algoritmo: {
    name: 'Algoritmo', color: 'var(--yellow)',
    summary: 'Passo a passo para resolver um problema.',
    example: 'Uma receita de bolo tem passos em ordem certa. Isso é um algoritmo!',
    challenge: 'Escreva os passos para escovar os dentes sem pular nenhum.'
  },
  abstracao: {
    name: 'Abstração', color: 'var(--purple)',
    summary: 'Focar no que importa e ignorar o resto.',
    example: 'Um mapa do metrô mostra só linhas e estações, sem as casas. Isso é abstração!',
    challenge: 'Descreva seu quarto usando só 3 detalhes importantes.'
  },
  padronizacao: {
    name: 'Padronização', color: 'var(--blue)',
    summary: 'Encontrar padrões que se repetem.',
    example: 'Uma música tem refrão que volta várias vezes. Achar o que se repete é achar um padrão!',
    challenge: 'Invente um padrão com 3 formas e peça a um colega para continuar.'
  },
  decomposicao: {
    name: 'Decomposição', color: 'var(--pink)',
    summary: 'Quebrar um problema grande em partes pequenas.',
    example: 'Montar um castelo de blocos fica fácil se você separa torres, muros e portão.',
    challenge: 'Divida “arrumar a mochila” em 4 mini-tarefas.'
  }
};

const QUIZ = {
  algoritmo: { q: 'Qual é a ordem certa para fazer um suco?', options: ['Beber, colocar água, espremer', 'Espremer, colocar água, mexer, beber', 'Mexer, beber, espremer'], right: 1 },
  abstracao: { q: 'O que é abstração?', options: ['Focar no que importa', 'Copiar tudo', 'Apagar o problema'], right: 0 },
  padronizacao: { q: 'O que vem depois: círculo, quadrado, círculo, quadrado…?', options: ['Triângulo', 'Círculo', 'Estrela'], right: 1 },
  decomposicao: { q: 'Para montar um castelo gigante de blocos, o melhor é…', options: ['Dividir em torres e muros', 'Montar tudo de uma vez', 'Desistir'], right: 0 }
};

const GAMES = [
  { title: 'Robótica para crianças', type: 'Plugado', level: 'Iniciante', theme: 'Algoritmo', color: '#ffd95a', desc: 'Monte e programe pequenos robôs com desafios curtos de lógica.' },
  { title: 'CodeCombat', type: 'Plugado', level: 'Intermediário', theme: 'Programação', color: '#8fd3a0', desc: 'Jogo educativo online que ensina programação por meio de uma aventura em masmorras.' },
  { title: 'Scratch com a turma da Mônica', type: 'Plugado', level: 'Iniciante', theme: 'Padronização', color: '#ffb3c7', desc: 'Arraste blocos coloridos para criar histórias e animações.' },
  { title: 'Labirinto com algoritmo', type: 'Desplugado', level: 'Iniciante', theme: 'Algoritmo', color: '#9bdcff', desc: 'Com papel, tampinhas e setas, a turma cria o caminho até a saída.' }
];

const BADGES = [
  { name: 'Primeira aula', hint: 'Conclua uma aula', test: s => Object.keys(s.done).length > 0 },
  { name: 'Mestre do quiz', hint: 'Acerte 2 quizzes', test: s => s.quizHits >= 2 },
  { name: 'Explorador', hint: 'Jogue 2 jogos', test: s => Object.keys(s.played).length >= 2 },
  { name: 'Voz ativa', hint: 'Participe do mural', test: s => s.posts > 0 },
  { name: 'Bom de papo', hint: 'Converse 3 vezes com o assistente', test: s => s.chats >= 3 }
];

const NAV = [
  ['home', 'Início'], ['aulas', 'Aulas'], ['jogos', 'Jogos'],
  ['forum', 'Mural'], ['perfil', 'Conquistas'], ['sobre', 'Sobre']
];
const VIEW_NAMES = ['login', 'home', 'aulas', 'jogos', 'jogo', 'forum', 'perfil', 'sobre'];

/* ==========================================================
   2. ESTADO (salvo no navegador) E ESTADO DE TELA
   ========================================================== */
const STORAGE_KEY = 'nuvem-pc-v2';

const defaults = () => ({
  xp: 120, name: 'Explorador(a)', topic: 'algoritmo', fontSize: 16,
  done: {}, watched: {}, answers: {}, notes: {}, played: {}, fav: {},
  quizHits: 0, posts: 0, chats: 0,
  questions: [
    { text: 'Como posso usar pensamento computacional na matemática?', author: 'Maria Cecília', date: '01/07/2025', replies: [] },
    { text: 'Qual jogo desplugado combina com o 4º ano?', author: 'Théo', date: '28/06/2025', replies: ['Experimente o Labirinto com algoritmo, ele usa só papel e tampinhas.'] },
    { text: 'Como explicar abstração com um desenho?', author: 'Serena', date: '25/06/2025', replies: ['Desenhe um mapa só com ruas e pontos importantes.', 'Boa ideia, vou testar!'] }
  ]
});

function load() {
  try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}); }
  catch (err) { return defaults(); }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); } catch (err) { /* sem armazenamento */ }
}

const S = load();
const UI = { tab: 'res', playing: false, progress: 0, speed: 1, fType: '', fLevel: '', query: '', gameId: 0, forumFilter: 'all', openQuestion: -1 };

/* ==========================================================
   3. UTILITÁRIOS
   ========================================================== */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const level = () => 1 + Math.floor(S.xp / 300);
const clock = () => { const t = Math.round(UI.progress / 100 * DURATION); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
const currentView = () => { const h = location.hash.slice(1); return VIEW_NAMES.includes(h) ? h : 'login'; };

let toastTimer, videoTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function gainXP(n, msg) { S.xp += n; save(); renderHeader(); toast((msg ? msg + ' ' : '') + '+' + n + ' XP'); }
function go(view) { if (location.hash === '#' + view) render(); else location.hash = view; }

/* ==========================================================
   4. AÇÕES
   ========================================================== */
function enterApp() {
  const v = $('login-name').value.trim();
  if (v) S.name = v.split(/[ @]/)[0];
  save(); go('home');
}
function openTopic(key) { S.topic = key; UI.tab = 'res'; UI.progress = 0; UI.playing = false; save(); go('aulas'); }
function setTab(t) { UI.tab = t; render(); }
function download(name) { toast('Baixando: ' + name + ' (simulação)'); }
function finishLesson() {
  if (!S.done[S.topic]) { S.done[S.topic] = 1; gainXP(60, 'Aula concluída!'); }
  save(); render();
}
function saveNote() { S.notes[S.topic] = $('note').value; save(); gainXP(10, 'Resposta salva!'); }
function answerQuiz(i) {
  if (S.answers[S.topic] !== undefined) return;
  S.answers[S.topic] = i;
  if (i === QUIZ[S.topic].right) { S.quizHits++; gainXP(40, 'Resposta certa!'); }
  else toast('Quase! Releia o exemplo e tente outra aula.');
  save(); render();
}
function toggleFilter(key, value) { UI[key] = UI[key] === value ? '' : value; render(); }
function clearFilters() { UI.fType = UI.fLevel = UI.query = ''; render(); }
function toggleFav(i) { S.fav[i] = !S.fav[i]; save(); render(); }
function openGame(i) { UI.gameId = i; go('jogo'); }
function playGame() {
  if (!S.played[UI.gameId]) { S.played[UI.gameId] = 1; gainXP(30, 'Jogo iniciado!'); } else toast('Bom jogo!');
  save();
}
function toggleQuestion(i) { UI.openQuestion = UI.openQuestion === i ? -1 : i; render(); }
function postQuestion() {
  const v = $('question-input').value.trim();
  if (!v) return;
  S.questions.unshift({ text: v, author: S.name, date: 'hoje', replies: [], mine: true });
  S.posts++; UI.openQuestion = -1; save(); gainXP(15, 'Pergunta publicada!'); render();
}
function postReply(i) {
  const v = $('reply-input').value.trim();
  if (!v) return;
  S.questions[i].replies.push(v);
  S.posts++; save(); gainXP(10, 'Resposta enviada!'); render();
}

/* Player de vídeo simulado */
function togglePlay() { UI.playing = !UI.playing; if (UI.progress >= 100) UI.progress = 0; render(); }
function seekVideo(ev) { const r = ev.currentTarget.getBoundingClientRect(); UI.progress = Math.round((ev.clientX - r.left) / r.width * 100); render(); }
function cycleSpeed() { UI.speed = UI.speed === 1 ? 1.5 : UI.speed === 1.5 ? 2 : 1; render(); }
function startVideoTimer() {
  clearInterval(videoTimer);
  if (currentView() !== 'aulas' || !UI.playing) return;
  videoTimer = setInterval(() => {
    UI.progress = Math.min(100, UI.progress + UI.speed * 1.2);
    const bar = $('seek-fill');
    if (bar) { bar.style.width = UI.progress + '%'; $('clock').textContent = clock(); }
    if (UI.progress >= 100) {
      UI.playing = false; clearInterval(videoTimer);
      if (!S.watched[S.topic]) { S.watched[S.topic] = 1; save(); gainXP(20, 'Vídeo assistido!'); }
      render();
    }
  }, 500);
}

/* Acessibilidade */
function changeFont(d) { S.fontSize = Math.max(13, Math.min(22, S.fontSize + d * 2)); document.documentElement.style.fontSize = S.fontSize + 'px'; save(); }
function toggleTheme() {
  const root = document.documentElement, cur = root.getAttribute('data-theme');
  const dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-theme', dark ? 'light' : 'dark');
}

/* ==========================================================
   5. TELAS
   ========================================================== */
function lessonTab() {
  const t = TOPICS[S.topic];
  if (UI.tab === 'ati') {
    return `<p><b>Desafio:</b> ${t.challenge}</p>
      <textarea id="note" rows="4" aria-label="Sua resposta" placeholder="Escreva sua resposta aqui">${esc(S.notes[S.topic] || '')}</textarea>
      <button class="btn" onclick="saveNote()">Salvar resposta</button>`;
  }
  if (UI.tab === 'qz') {
    const q = QUIZ[S.topic], a = S.answers[S.topic];
    return `<p><b>${q.q}</b></p>
      ${q.options.map((o, i) => `<button class="option ${a === undefined ? '' : i === q.right ? 'right' : i === a ? 'wrong' : ''}" onclick="answerQuiz(${i})">${o}</button>`).join('')}
      ${a !== undefined ? `<p><b>Dica do assistente:</b> ${t.example}</p>` : ''}`;
  }
  return `<p>${t.summary}</p><p><b>Exemplo:</b> ${t.example}</p>
    <div class="actions">
      <button class="btn blue" onclick="download('Material de aula')">Baixar material de aula</button>
      <button class="btn yellow" onclick="go('jogos')">Jogos relacionados</button>
      <button class="btn green" onclick="finishLesson()">${S.done[S.topic] ? 'Aula concluída' : 'Concluir aula'}</button>
    </div>`;
}

const VIEWS = {
  login: () => `<div class="login card">
    <h1>Bem-vindo(a)!</h1>
    <p>Entre na ${APP_NAME} e aprenda com jogos, vídeos e desafios.</p>
    <input class="field" id="login-name" placeholder="Seu nome ou e-mail" aria-label="Nome ou e-mail">
    <input class="field" type="password" placeholder="Senha" aria-label="Senha">
    <div class="actions">
      <button class="btn" onclick="enterApp()">Entrar</button>
      <button class="btn yellow" onclick="enterApp()">Cadastrar-se</button>
    </div>
    <p><button class="link" onclick="enterApp()">Explorar sem conta</button></p>
  </div>`,

  home: () => {
    const missions = [
      ['Concluir uma aula', Object.keys(S.done).length > 0],
      ['Acertar um quiz', S.quizHits > 0],
      ['Conversar com o assistente', S.chats > 0]
    ];
    return `<h1 class="center">Escolha seu mapa de aprendizagem</h1>
      <p class="subtitle">Cada nuvem é um caminho do pensamento computacional. Vamos explorar?</p>
      <div class="cloud-grid">${Object.keys(TOPICS).map(k => `
        <div class="island"><button class="cloud" style="background:${TOPICS[k].color}" onclick="openTopic('${k}')">
          <h3>${TOPICS[k].name}</h3><p>${TOPICS[k].summary}</p><span class="go">Entrar</span></button></div>`).join('')}
      </div>
      <div class="two">
        <div class="card"><h3>Continue assistindo</h3>
          <p><b>${TOPICS[S.topic].name}</b></p>
          <div class="progress"><i style="width:${UI.progress}%"></i></div>
          <button class="btn" onclick="go('aulas')">Continuar</button></div>
        <div class="card"><h3>Missões do dia</h3>
          ${missions.map(m => `<p>${m[0]}: <span class="status ${m[1] ? 'done' : 'todo'}">${m[1] ? 'Feito' : 'A fazer'}</span></p>`).join('')}</div>
      </div>
      <div class="three">
        <button class="card" onclick="go('jogos')"><h3>Ilha dos jogos</h3><p>Plugados e desplugados.</p></button>
        <button class="card" onclick="go('forum')"><h3>Mural de dúvidas</h3><p>Pergunte e ajude colegas.</p></button>
        <button class="card" onclick="go('perfil')"><h3>Conquistas</h3><p>Veja seu progresso.</p></button>
      </div>`;
  },

  aulas: () => {
    const t = TOPICS[S.topic], keys = Object.keys(TOPICS);
    return `<div class="top"><button class="btn dark small" onclick="history.back()">Voltar</button><h1>${t.name}</h1></div>
      <div class="lessons">
        <div class="card topic-list"><b>Tópicos</b>${keys.map(k => `<button class="${k === S.topic ? 'on' : ''}" onclick="openTopic('${k}')"><span>${TOPICS[k].name}</span>${S.done[k] ? '<span>Concluída</span>' : ''}</button>`).join('')}</div>
        <div>
          <div class="card">
            <div class="video"><span class="label">${t.name}</span>
              <button class="play" onclick="togglePlay()">${UI.playing ? 'Pausar' : 'Reproduzir'}</button></div>
            <div class="controls"><span id="clock">${clock()}</span>
              <div class="seek" onclick="seekVideo(event)"><i id="seek-fill" style="width:${UI.progress}%"></i></div>
              <span>20:58</span><button class="btn dark small" onclick="cycleSpeed()" aria-label="Velocidade">${UI.speed}x</button></div>
            <div class="tabs">${[['res', 'Resumo'], ['ati', 'Atividade'], ['qz', 'Quiz']].map(x => `<button class="chip ${UI.tab === x[0] ? 'on' : ''}" onclick="setTab('${x[0]}')">${x[1]}</button>`).join('')}</div>
            ${lessonTab()}
          </div>
          <h3 style="margin:18px 0 8px">Assista também</h3>
          <div class="three" style="margin-top:0">${keys.filter(k => k !== S.topic).map(k => `<button class="card" onclick="openTopic('${k}')"><b>${TOPICS[k].name}</b><br><span class="muted">20:58</span></button>`).join('')}</div>
        </div>
      </div>`;
  },

  jogos: () => {
    const q = UI.query.toLowerCase();
    const list = GAMES.map((g, i) => [g, i]).filter(([g]) =>
      (!UI.fType || g.type === UI.fType) && (!UI.fLevel || g.level === UI.fLevel) &&
      (!q || (g.title + g.theme).toLowerCase().includes(q)));
    const chips = (label, key, values) => `<b>${label}</b> ${values.map(v => `<button class="chip ${UI[key] === v ? 'on' : ''}" onclick="toggleFilter('${key}','${v}')">${v}</button>`).join('')}`;
    return `<h1 class="center">Ilha dos jogos</h1>
      <p class="subtitle">Plugados usam telas. Desplugados usam papel, peças e imaginação.</p>
      <div class="card chips">${chips('Tipo:', 'fType', ['Plugado', 'Desplugado'])}${chips('Nível:', 'fLevel', ['Iniciante', 'Intermediário'])}
        <button class="btn dark small" onclick="clearFilters()">Limpar</button></div><br>
      <div class="games">${list.map(([g, i]) => `<div class="card">
        <div class="thumb" style="background:${g.color}">${g.title}</div>
        <p class="muted">${g.type} | ${g.level} | ${g.theme}</p>
        <div class="actions"><button class="btn yellow" onclick="openGame(${i})">Acessar</button>
          <button class="btn dark small ${S.fav[i] ? 'on' : ''}" onclick="toggleFav(${i})">${S.fav[i] ? 'Favorito' : 'Favoritar'}</button></div></div>`).join('')}</div>
      ${list.length ? '' : '<p class="subtitle">Nenhum jogo encontrado. Tente limpar os filtros.</p>'}`;
  },

  jogo: () => {
    const g = GAMES[UI.gameId];
    return `<div class="top"><button class="btn dark small" onclick="history.back()">Voltar</button><h1>${g.title}</h1></div>
      <div class="card" style="max-width:720px">
        <div class="thumb" style="background:${g.color}">${g.title}</div>
        <p>${g.desc}</p>
        <p class="muted">Tipo | ${g.type} &nbsp; Nível | ${g.level} &nbsp; Tema | ${g.theme}</p>
        <div class="actions"><button class="btn green" onclick="playGame()">Jogar agora</button>
          <button class="btn dark" onclick="toggleFav(${UI.gameId})">${S.fav[UI.gameId] ? 'Favoritado' : 'Favoritar'}</button></div>
        <p><b>Anexos</b></p>
        <div class="actions"><button class="btn blue" onclick="download('Guia didático (PDF)')">Guia didático (PDF)</button>
          <button class="btn blue" onclick="download('Guia didático (Libras)')">Guia didático (Libras)</button></div>
      </div>`;
  },

  forum: () => {
    const f = UI.forumFilter;
    const list = S.questions.map((q, i) => [q, i]).filter(([q]) => f === 'all' || (f === 'mine' && q.mine) || (f === 'none' && !q.replies.length));
    return `<h1 class="center">Mural de dúvidas</h1><p class="subtitle">Pergunte, ajude e ganhe XP.</p>
      <div class="two" style="margin-top:0">
        <div class="card">
          <input class="field" id="question-input" placeholder="Escreva sua pergunta" aria-label="Sua pergunta">
          <button class="btn blue" onclick="postQuestion()">Fazer pergunta</button>
          <div class="chips" style="margin:14px 0">${[['all', 'Todas'], ['mine', 'Minhas'], ['none', 'Sem resposta']].map(x => `<button class="chip ${f === x[0] ? 'on' : ''}" onclick="UI.forumFilter='${x[0]}';render()">${x[1]}</button>`).join('')}</div>
          ${list.map(([q, i]) => `<div class="question"><b>${esc(q.text)}</b><br>
            <span class="muted">${esc(q.author)} · ${q.date} · </span><span class="status ${q.replies.length ? 'done' : 'todo'}">${q.replies.length ? q.replies.length + ' resposta(s)' : 'Nenhuma resposta'}</span>
            <div><button class="link" onclick="toggleQuestion(${i})">${UI.openQuestion === i ? 'Fechar' : 'Ver e responder'}</button></div>
            ${UI.openQuestion === i ? q.replies.map(r => `<div class="reply">${esc(r)}</div>`).join('') + `<input class="field" id="reply-input" placeholder="Sua resposta" aria-label="Sua resposta"><button class="btn dark small" onclick="postReply(${i})">Responder</button>` : ''}
          </div>`).join('') || '<p>Nada por aqui ainda.</p>'}
        </div>
        <div class="card"><h3>Exploradores mais ativos</h3>
          ${[['Aureliano', 1500], ['Serena', 1000], ['Théo', 950]].map((x, i) => `<div class="rank-item"><b>${i + 1}º ${x[0]}</b><br><span class="muted">${x[1]} jogos acessados</span></div>`).join('')}</div>
      </div>`;
  },

  perfil: () => {
    const keys = Object.keys(TOPICS);
    return `<h1 class="center">Minhas conquistas</h1>
      <p class="subtitle">Nível ${level()} · ${S.xp} XP. Faltam ${300 - S.xp % 300} XP para o próximo nível.</p>
      <div class="two" style="margin-top:0">
        <div class="card"><h3>Progresso por trilha</h3>${keys.map(k => {
          const p = (S.watched[k] ? 30 : 0) + (S.answers[k] === QUIZ[k].right ? 30 : 0) + (S.done[k] ? 40 : 0);
          return `<b>${TOPICS[k].name}</b> <span class="muted">${p}%</span><div class="progress"><i style="width:${p}%"></i></div>`;
        }).join('')}</div>
        <div class="card"><h3>Estatísticas</h3>
          <p>Quizzes certos: <b>${S.quizHits}</b></p>
          <p>Jogos jogados: <b>${Object.keys(S.played).length}</b></p>
          <p>Conversas com o assistente: <b>${S.chats}</b></p>
          <button class="btn dark small" onclick="resetProgress()">Zerar progresso</button></div>
      </div>
      <h3 style="margin:22px 0 10px">Medalhas</h3>
      <div class="three">${BADGES.map(b => { const ok = b.test(S); return `<div class="badge ${ok ? '' : 'locked'}"><b>${b.name}</b><small>${b.hint}</small><small class="status ${ok ? 'done' : ''}">${ok ? 'Conquistada' : 'Bloqueada'}</small></div>`; }).join('')}</div>`;
  },

  sobre: () => `<div class="card" style="max-width:680px;margin:20px auto;text-align:center">
    <h1>${APP_NAME}</h1>
    <p>Uma plataforma gratuita e acessível para aprender computação com jogos, vídeos e desafios, com ou sem recursos tecnológicos. Aqui o aprendizado é prático, colaborativo e feito para todos.</p>
  </div>`
};

function resetProgress() {
  if (!confirm('Tem certeza de que quer zerar todo o progresso?')) return;
  Object.assign(S, defaults(), { name: S.name }); save(); render();
}

/* ==========================================================
   6. CABEÇALHO E RENDERIZAÇÃO
   ========================================================== */
function renderHeader() {
  const view = currentView();
  if (view === 'login') { $('header').innerHTML = `<span class="brand">${APP_NAME}</span>`; return; }
  $('header').innerHTML = `
    <button class="brand" onclick="go('home')">${APP_NAME}</button>
    <nav aria-label="Menu principal">${NAV.map(n => `<button onclick="go('${n[0]}')" ${view === n[0] || (n[0] === 'jogos' && view === 'jogo') ? 'aria-current="page"' : ''}>${n[1]}</button>`).join('')}</nav>
    <div class="search"><input id="search-input" value="${esc(UI.query)}" placeholder="Pesquisar jogos" aria-label="Pesquisar jogos"
      onkeydown="if(event.key==='Enter'){UI.query=this.value;go('jogos')}"></div>
    <div class="tools">
      <button onclick="changeFont(-1)" aria-label="Diminuir letras">A-</button>
      <button onclick="changeFont(1)" aria-label="Aumentar letras">A+</button>
      <button onclick="toggleTheme()">Tema</button>
      <button class="user-chip" onclick="go('perfil')"><b>${esc(S.name)}</b><small>Nível ${level()} · ${S.xp} XP</small><div class="xp-bar"><i style="width:${S.xp % 300 / 3}%"></i></div></button>
      <button onclick="go('login')">Sair</button>
    </div>`;
}

function render() {
  const view = currentView();
  renderHeader();
  $('app').innerHTML = VIEWS[view]();
  $('assistant').hidden = view === 'login';
  startVideoTimer();
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

/* ==========================================================
   7. ASSISTENTE
   ========================================================== */
const SUGGESTIONS = ['Explique de um jeito fácil', 'Me dê um desafio', 'Dica de jogo'];

function say(who, text) {
  const box = $('msgs'), d = document.createElement('div');
  d.className = 'msg ' + who; d.textContent = text;
  box.appendChild(d); box.scrollTop = box.scrollHeight;
}
function botReply(text) {
  const s = text.toLowerCase(), t = TOPICS[S.topic];
  for (const k in TOPICS) if (s.includes(k.slice(0, 5))) return TOPICS[k].example;
  if (/desafio/.test(s)) return 'Desafio de ' + t.name + ': ' + t.challenge;
  if (/jogo/.test(s)) return 'Experimente o Labirinto com algoritmo. Ele funciona sem computador!';
  if (/quiz|teste/.test(s)) return 'Abra a aula de ' + t.name + ' e use a aba Quiz.';
  if (/f[aá]cil|explic/.test(s)) return t.example;
  return 'Boa pergunta! Em ' + t.name + ': ' + t.example;
}
function sendToAssistant(text) {
  say('user', text);
  S.chats++; S.xp += 5; save(); renderHeader();
  setTimeout(() => say('bot', botReply(text)), 350);
}

$('assistant-toggle').addEventListener('click', () => {
  const p = $('panel'); p.hidden = !p.hidden;
  $('assistant-toggle').setAttribute('aria-expanded', String(!p.hidden));
});
$('chat-form').addEventListener('submit', ev => {
  ev.preventDefault();
  const i = $('chat-input'), v = i.value.trim();
  if (v) { i.value = ''; sendToAssistant(v); }
});
$('suggestions').innerHTML = SUGGESTIONS.map(x => `<button class="chip" type="button">${x}</button>`).join('');
$('suggestions').addEventListener('click', ev => { if (ev.target.matches('.chip')) sendToAssistant(ev.target.textContent); });

/* ==========================================================
   8. INICIALIZAÇÃO
   ========================================================== */
document.documentElement.style.fontSize = S.fontSize + 'px';
say('bot', 'Oi! Eu sou o assistente. Posso explicar, propor desafios e dar dicas sobre a aula que você está vendo.');
render();
