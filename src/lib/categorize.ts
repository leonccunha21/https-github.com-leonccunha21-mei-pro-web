// Classificação automática de produtos por categoria com base no nome.

export const DEFAULT_CATEGORY = 'Diversos';

export function categorizeProduct(name: string): string {
  const n = (name || '').toLowerCase();

  // Capas e Películas
  if (/(capa|capinha|película|pelicula|privacidade|vidro temperado|protetor de tela|proteção de tela|pelicular)/.test(n)) {
    return 'Capas e Películas';
  }

  // Cabos e Adaptadores
  if (/(cabo|adaptador|hub|hubusb|hub usb|extensor|conversor)/.test(n)) {
    return 'Cabos e Adaptadores';
  }

  // Fones de Ouvido
  if (/(fone|earphone|airpods|headphone|ouvido)/.test(n)) {
    return 'Fones de Ouvido';
  }

  // Carregadores
  if (/(carregador|fontes?|carreg)/.test(n)) {
    return 'Carregadores';
  }

  // Acessórios para Celular
  if (/(suporte|suportecelular|ventosa|magnetico|magnético|veicular|retrovisor|suporte moto|suporte veicular|suporte celular|suporte de celular|suporte de mesa|suporte braço|suporte gancho|suporte triplo|suporte de tv|suporte fone|imã|cordinha|cordão|crachá|porta crachá|estoj|luvinha|luva|capa de chuva|capa a prova|selfie|tripé|tripe)/.test(n)) {
    return 'Acessórios para Celular';
  }

  // Computador e Periféricos
  if (/(mouse|teclado|keyboard|monitor|computador|pc |notebook|laptop|cool|hub.*porta|placa de som|hdmi|vga|displayport|mousepad|mouse pad|gamer.*mouse|gamer.*teclado)/.test(n)) {
    return 'Computador e Periféricos';
  }

  // Memória e Armazenamento
  if (/(memória|memoria|cartão de memória|cartao de memoria|micro sd|memory card|pendrive|pen drive|hd |ssd|case.*hd|cartão|cartao)/.test(n)) {
    return 'Memória e Armazenamento';
  }

  // Som Automotivo
  if (/(som automotivo|radio automotivo|rádio automotivo|auto radio|auto rádio|autoradio|subwoofer|subwofer|modulo amplificador|módulo amplificador|amplificador automotivo|falante automotivo|tweeter automotivo|crossover|caixa automotiva|auto falante|auto-falante|mid bass|midbass|corneta|driver automotivo|install automotivo|car audio|car áudio)/.test(n)) {
    return 'Som Automotivo';
  }

  // Áudio e Vídeo
  if (/(caixa de som|alto falante|parafuso|som|tweeter|evok|fluxo|áudio|audio|bluetooth.*speaker|mini caixa|impressora|impressão|impressao|xerox|lousa|projetor)/.test(n)) {
    return 'Áudio e Vídeo';
  }

  // Eletrônicos Diversos
  if (/(lanterna|câmera|camera|ip cam|detector|isqueiro|bateria|pilha|fusível|fusivel|antena|wifi|router|roteador|mini router|controle.*tv|controle.*universal|tv box|unitv|chip|sim card|globo de luz|led|lâmpada|lampada|luminária|luminaria|refletor|módulo|modulo)/.test(n)) {
    return 'Eletrônicos Diversos';
  }

  // Casa e Utensílios
  if (/(garrafa|stanley|kit.*forma|kit.*colher|kit.*talher|kit.*facas|kit.*pote|kit.*banheiro|kit.*taboa|ralador|fatiador|triturador|processador|liquidificador|mini liquidificado|máquina de costura|mini máquina|dispenser|bucha|porta detergente|balança|balâ|tapete|massageador|escova|depilador|cortador|desentupidor|lixas?|canivete|alicate|chave|chaveiro|tork)/.test(n)) {
    return 'Casa e Utensílios';
  }

  // Brinquedos e Jogos
  if (/(lego|boneco|brinquedo|jogo.*ps|jogo.*xbox|jogo.*game|game boy|controle.*ps|controle.*xbox|pen drive.*jogo|pop it|card.*jogo|figurinha|baralho|lousa|mochila|caderno|bobbie)/.test(n)) {
    return 'Brinquedos e Jogos';
  }

  // Relógios e Wearables
  if (/(relógio|relogio|smartband|pulseira|watch|xiaomi.*band|laxasfit)/.test(n)) {
    return 'Relógios e Wearables';
  }

  // Serviços
  if (/(formatação|formatacao|restauração|restauracao|serviço|servico|impressão|impressao|xerox|gravação|gravacao|manutenção|manutencao|instalação|instalacao)/.test(n)) {
    return 'Serviços';
  }

  // Microscopio, Calculadora, etc. -> Diversos
  if (/(calculadora|microscópio|microscopio|calculadora|calcul)/.test(n)) {
    return 'Diversos';
  }

  return DEFAULT_CATEGORY;
}
