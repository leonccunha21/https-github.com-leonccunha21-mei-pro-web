const XLSX = require('xlsx');
const fs = require('fs');
const MODELO = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';
const wb = XLSX.readFile(MODELO);
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1, defval: null });
const nomes = rows.slice(1).map(r => String(r[1] || ''));

const norm = s => ' ' + String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase() + ' ';
const nk = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ESC = k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const has = (t, kw) => kw.some(k => { const r = new RegExp('(^|[^a-z0-9])' + ESC(nk(k)) + '([^a-z0-9]|$)'); return r.test(t); });

const CATS = [
  ['Games e Controles', ['controle','ps2','ps3','ps4','ps5','xbox','gamepad','console','joystick','pubg','game boy','gameboy','gatilho','gatilhos','controller','brick game','in 1','oculos vr','vr box','oculosvr']],
  ['Áudio e Som', ['fone','fones','headphone','headfone','headset','heatset','caixa de som','caixa som','caixa acustica','caixa audio','caixa','alto falante','falante','speaker','ouvid','microfone','amplificador','som','aparelho de cd','aparelho cd','cd player','aparelho de som','aparelho som','radio','rudio','evok','tweeter','tweter','titwwer','power vox','boombox','mid bass','corneta','airdots','xtreme','charge','jbl','lapela']],
  ['Relógios e Wearables', ['relogio','smartwatch','smart watch','pulseira smart','monitor de batimento','fit band','mi band','smartband','smartwhat','rolex','relocio','pelicula relogio','pelicularelogio']],
  ['Informática', ['mouse','teclado','webcam','pendrive','pen drive','memoria','notebook','computador','computadores','monitor','impressora','cartucho','cabos de rede','roteador','hub usb','placa','hd','ssd','micro sd','microsd','memory card','memorycard','cartao','m.2','fonte','processador','pc','tablet','switch','modem','moden','protoboard','modulo','opl','kit opl','chromecast','fire tv','hub','filtro de linha','keyboard','cooler','cooles']],
  ['Acessórios para Celular', ['capa','pelicula','película','vidro temperado','suporte celular','suporte de celular','suporte para celular','carregador celular','carteira','chip','telefone','celular','iphone','android','capinha','case','selfie','pau de self','pop socket','popsocket','blindagem','suporte','suporte tv','suporte de tv','tripe','triper','tripé']],
  ['Celulares e Smartphones', ['samsung','xiaomi','redmi','realmi','realme','motorola','note 10','note 10s','note 11','a04e','a51','c61']],
  ['Cabos e Conectores', ['cabo','hdmi','adaptador','conector','fio','extensao','extensão','tomada','tipo c','display port','vga','usb','cable','otg']],
  ['Iluminação', ['led','lanterna','lampada','luz','abajur','refletor','fita led','pisca pisca','lampiao','lampião','lampa','lampapada','lamapada','lampaia','lamperna','luminaria','luminária','ring light','lantern']],
  ['Ferramentas e Reparo', ['chave','furadeira','solda','ferro de soldar','alicate','parafuso','reparo','ferramenta','serra','lima','chave de fenda','martelo','broca','kit reparo','estaca','limador','desencapado','descascador','afaidor','amolador','estacao de solda','canivete','estilete','estileite','chaves','morsa','multimetro','nivel','trena','manta de trabalho','furador','grampeador','pincas','pinças','corrente','cadeado','compressor','regua','refratometro','refatrometro','soprador','asoprador','kit chaves','kit ferramentas','kit ferramente','kit maçarico','kit de chaves','kit tesouras','chave de vela','graxa','macarico','maçarico','maleta','maleta de ferramentas','maleta ferramentas','fusivel','fusível','ponta','pontas','marsarico','estensao','estençao','foice','capina','jardinagem']],
  ['Automotivo e Moto', ['carro','moto','motocicleta','pneu','pneus','oleo','farol','bike','bicicleta','capacete','motor','veicular','limpador','retrovisor','cambio','auto','calotas','h7','drl','conversor','tv car','palheta','parabrisa','tampao','volante','kit fusivel']],
  ['Baterias e Energia', ['pilha','pilhas','bateria','baterias','power bank','powerbank','powebank','energia','carregador','cabeça','carregadri','usina','uzina','testador']],
  ['Casa e Decoração', ['relógio de parede','relogio de parede','quadro','vaso','decoracao','decoração','prateleira','espelho','tapete','cortina','almofada','quadro de','porta retrato','enfeite','armario','jarra','arvore de natal','natal','guirlanda','bandeira','cadeira','despertador','travesseiro','rede de janela','tela de janela','tela mosquiteiro','mosquiteiro','tela mosquito']],
  ['Saúde e Beleza', ['perfume','colonia','hidratante','creme','shampoo','condicionador','barbeador','barbear','esmalte','make','cosmetico','cosmético','glossy','algodao','algodão','protetor solar','acetona','pincel','aparador','removedor','nariz','cravo','espinha','depilador','secador','escova de dente','dente','massagem','massageado','pupa','unha','unhas','cortador de cabelo','derma','laiser','massageador','microscopio','mascara','máscara','pente','taser','taeser','taise','teiser','taiser','tornozoleira','silicone de banho','vaper','pod','koko','hinode','cheirinho','postura','kit manicure','kit pedicure','kit cabelereiro','kit cortador de unhas','oculos','maquina de cabelo','maaquina de cabelo','maquina de tosa','oximetro','oxímetro']],
  ['Utilidades Domésticas', ['spray','alcool','sabonete','detergente','limpador','vassoura','balde','saco de lixo','papel higienico','guardanapo','toalha','tupper','organizador','necessaire','varal','pregador','escova','esponja','pano','tampa','pote','garrafa','cantil','copo','prato','panela','facas','tesoura','faca','kit costura','kit de costura','adesivo','cola','abracadeira','abraçadeira','saco','balao','balão','acendedor','isqueiro','amassador','espremedor','liquidificador','liquidificado','lidificador','batedeira','ferro de passar','prendedor','taba','ralador','potes','squeezer','corta','abridor','aspirador','sugador','balanca','balança','bolsa','pochete','sacola','caneca','canecas','cesto','chaleira','ebulidor','esfoliador','esfregao','esfrega','esqueiro','desentupidor','fita','fitas','durex','fogao','fogão','frigideira','churrasqueira','guarda chuva','guarda-chuva','etiquetadora','limpa tela','linha costura','luva','luvas','luvinha','luvinhas','kit agulha','kit para costura','kit caneca','kit churrasco','kit colheres','kit talheres','kit pintura','kit bomba','kit adesivos','kit dia das mães','kit 6 formas','kit stanley','kit botoes','papa bolinha','papa bolinhas','puxadora','raquete','protetor','manta termica','talheres','colheres','churrasco','processador de alimentos','triturador','triturado','cortador de','maquina','maquina de costura','maquina de cortar tempero','maquina de sopro','maquina de','bomba','mosquito','misturador','mixer','fatiador','refrigerador','marmita','porta cracha','porta crachá','porta documentos','porta rg','agulha','cartela','botoes','botões','costura','card']],
  ['Calçados', ['tenis','tênis','sapato','sandalia','sandália','bota','chinelo','chinela','botina']],
  ['Vestuário', ['camiseta','camisa','bermuda','calca','calça','roupa','blusa','vestido','jaqueta','meia','meias','cueca','regata','moletom','chapeu','chapéu','bone','bonés','cordao','cordão','cordinha','chaveiro']],
  ['Papelaria e Escritório', ['caneta','lapis','lápis','caderno','papel','borracha','estojo','mochila','agenda','album','álbum','figurinha','figurinhas','livro','envelope','grafite','lousa','carta','cartinha','calculadora','card']],
  ['Brinquedos', ['boneca','lego','brinquedo','pelucia','pelúcia','quebra','jogo de','boneco','carrinho','arminha','arma de','pistola de agua','hidrogel','gel mp','pistola','beyblade','bleybleid','bleybleyd','funko','cubo magico','pop it','d20','domino','baralho','bingo','poker','kit poker','robot','robo','magic ring','slime','papagaio','viatura','polvo','game pop it','estilingue','cavalo','pula pula','mao inflavel','inflavel','bolinha de gel','blocos','montar']],
  ['Esportes e Fitness', ['bola','futebol','skate','academia','halter','corda','yoga','basquete','peteca','frisbee','hand grip','joelheira','vuvuzela','vuvunzela','vuvulzela','bandeirinha']],
  ['Eletrônicos Diversos', ['bluetooth','bluet','digital','eletronico','eletrônico','camera','câmera','drone','projetor','ventilador','venditlador','antena','wifi','receptor','sensor','carregador','ar condicionado','aromatizador','umidificador','umidiifcador','purificador','pufericador','purrificado','aparelho','tv box','unitv','mxq','climatizador','estabilizador','solar powered','sonoff','refrigerador']],
  ['Aquários e Pets', ['aquario','aquário','labeo','tenebrio','tenebrios','tenebriomulher','tenebra','skimmer','peixe']],
  ['Alimentos e Doces', ['amendoin','biscoito','bala','bolinho','candy','canddy','doce','chocolate','pirulito','super chá']],
];

function classify(n) {
  const t = norm(n);
  for (const [cat, kws] of CATS) { if (has(t, kws)) return cat; }
  return 'Diversos';
}
module.exports = { CATS, norm, nk, has, classify };

if (require.main === module) {
const map = new Map();
let diverso = [];
for (const n of nomes) {
  const t = norm(n); let c = 'Diversos';
  for (const [cat, kws] of CATS) { if (has(t, kws)) { c = cat; break; } }
  map.set(n, c); if (c === 'Diversos') diverso.push(n);
}

const counts = {};
for (const c of map.values()) counts[c] = (counts[c] || 0) + 1;
console.log('=== DISTRIBUIÇÃO FINAL (v3) ===');
for (const [cat] of CATS) console.log(cat + ': ' + (counts[cat] || 0));
console.log('Diversos: ' + (counts['Diversos'] || 0));
console.log('\n--- DIVERSOS RESTANTES (' + diverso.length + ') ---');
diverso.forEach((d, i) => console.log((i + 1) + '|' + d));

// Aplicar se solicitado
if (process.argv[2] === 'write') {
  const catCol = rows[0].indexOf('Categoria');
  for (let i = 1; i < rows.length; i++) rows[i][catCol] = map.get(String(rows[i][1] || '')) || 'Diversos';
  wb.Sheets['Produtos'] = XLSX.utils.aoa_to_sheet(rows);
  // reconstrói aba Categorias (uma por linha, sem 'Diversos' se vazio? mantém)
  const catsUnicas = CATS.map(c => c[0]).concat(['Diversos']);
  const catAoa = [['Nome da Categoria']].concat(catsUnicas.map(c => [c]));
  wb.Sheets['Categorias'] = XLSX.utils.aoa_to_sheet(catAoa);
  XLSX.writeFile(wb, MODELO);
  console.log('\nGRAVADO em ' + MODELO + ' (coluna Categoria + aba Categorias atualizada).');
}
}
