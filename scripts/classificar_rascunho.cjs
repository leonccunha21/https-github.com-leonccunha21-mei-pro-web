const XLSX = require('xlsx');

const wb = XLSX.readFile('data/excel/Dados coletas/Modelo_Importacao.xlsx');
const p = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1, defval: null });
const nomes = p.slice(1).map(r => String(r[1] || ''));

const norm = s => ' ' + String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() + ' ';
const has = (t, kw) => kw.some(k => { const r = new RegExp('(^|[^a-z0-9])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)'); return r.test(t); });

// Taxonomia (mais específica primeiro). Casamento por palavra inteira.
const CATS = [
  ['Games e Controles', ['controle','ps2','ps3','ps4','ps5','xbox','gamepad','console','joystick','pubg']],
  ['Áudio e Som', ['fone','headphone','headfone','caixa de som','caixa som','caixa acustica','caixa audio','alto falante','falante','speaker','ouvido','microfone','amplificador','som','aparelho de cd','aparelho cd','cd player','aparelho de som','aparelho som','radio','rudio']],
  ['Relógios e Wearables', ['relogio','smartwatch','smart watch','pulseira smart','monitor de batimento','fit band']],
  ['Informática', ['mouse','teclado','webcam','pendrive','pen drive','memoria','notebook','computador','monitor','impressora','cartucho','cabos de rede','roteador','hub usb','placa','hd','ssd']],
  ['Acessórios para Celular', ['capa','pelicula','pelicula','película','vidro temperado','suporte celular','suporte de celular','suporte para celular','carregador celular','carteira','chip','telefone','celular','iphone','android']],
  ['Cabos e Conectores', ['cabo','hdmi','adaptador','conector','fio','extensao','extensão','tomada','tipo c','display port','vga','usb']],
  ['Iluminação', ['led','lanterna','lampada','lampada','luz','abajur','refletor','fita led']],
  ['Ferramentas e Reparo', ['chave','furadeira','solda','ferro de soldar','alicate','parafuso','reparo','ferramenta','serra','lima','chave de fenda','martelo','broca','kit reparo','estaca','limador','desencapado','descascador','afaidor','amolador','estacao de solda','canivete']],
  ['Automotivo e Moto', ['carro','moto','motocicleta','pneu','oleo','farol','bike','bicicleta','capacete','motor','veicular','limpador','retrovisor','cambio','auto']],
  ['Baterias e Energia', ['pilha','bateria','power bank','energia','carregador']],
  ['Casa e Decoração', ['relógio de parede','relogio de parede','quadro','vaso','decoracao','decoração','prateleira','porta','espelho','tapete','cortina','almofada','quadro de','porta retrato','enfeite','aquario','aquário','peixe','planta','armario','espelho','jarra']],
  ['Utilidades Domésticas', ['spray','alcool','sabonete','detergente','limpador','vassoura','balde','saco de lixo','papel higienico','guardanapo','toalha','tupper','organizador','necessaire','varal','pregador','escova','esponja','pano','tampa','pote','garrafa','cantil','copo','prato','panela','facas','tesoura','faca','kit costura','adesivo','cola','abracadeira','abraçadeira','saco','balao','balão','acendedor','isqueiro','amassador','espremedor','liquidificador','batedeira','ferro de passar','prendedor','taba','ralador','potes','squeezer','corta','abridor']],
  ['Saúde e Beleza', ['perfume','colonia','hidratante','creme','shampoo','condicionador','barbeador','barbear','esmalte','make','cosmetico','cosmético','glossy','algodao','algodão','protetor solar','acetona','pincel','aparador','removedor','nariz','cravo','espinha','depilador','secador','escova de dente','dente','massagem','pupa','unha']],
  ['Vestuário', ['camiseta','camisa','bermuda','calca','calça','roupa','blusa','vestido','jaqueta','meia','cueca','regata','moletom','tenis','tênis']],
  ['Papelaria e Escritório', ['caneta','lapis','lápis','caderno','papel','borracha','estojo','mochila','agenda','album','álbum','figurinha','livro']],
  ['Brinquedos', ['boneca','lego','brinquedo','pelucia','pelúcia','quebra','jogo de','boneco','carrinho','arminha','arma de','pistola de agua','hidrogel','gel mp','pistola','pelucia']],
  ['Esportes e Fitness', ['bola','futebol','skate','academia','halter','corda','yoga','basquete','peteca','frisbee','tênis de','tenis de']],
  ['Eletrônicos Diversos', ['bluetooth','bluet','digital','eletronico','eletrônico','camera','câmera','drone','projetor','ventilador','antena','wifi','receptor','sensor','mini','carregador','ar condicionado','aromatizador','umidificador','purificador','carregador','aparelho']],
];

const counts = {}, samples = {};
let diverso = [];
for (const nome of nomes) {
  const t = norm(nome);
  let cat = 'Diversos';
  for (const [c, kws] of CATS) { if (has(t, kws)) { cat = c; break; } }
  counts[cat] = (counts[cat] || 0) + 1;
  (samples[cat] = samples[cat] || []).push(nome);
  if (cat === 'Diversos') diverso.push(nome);
}

console.log('=== DISTRIBUIÇÃO (v2, palavra inteira) ===');
const order = [...CATS.map(c => c[0]), 'Diversos'];
for (const c of order) { console.log(`\n${c}: ${counts[c] || 0}`); (samples[c] || []).slice(0, 4).forEach(s => console.log('   - ' + s)); }
console.log('\nTOTAL Diversos:', diverso.length);
console.log('Amostra Diversos (25):'); diverso.slice(0, 25).forEach(s => console.log('   - ' + s));
