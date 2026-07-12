import { Product, Sale, Category } from './types';

export const initialCategories: Category[] = [
  { id: 'cat_acessoriosconectores', name: 'Acessorios/Conectores' },
  { id: 'cat_geral', name: 'Geral' },
  { id: 'cat_brinquedos', name: 'Brinquedos' },
  { id: 'cat_jogos', name: 'Jogos' },
  { id: 'cat_pilhasbaterias', name: 'Pilhas/Baterias' },
  { id: 'cat_armazenamento', name: 'Armazenamento' },
  { id: 'cat_audiosom', name: 'Audio/Som' },
  { id: 'cat_camerasseguranca', name: 'Cameras/Seguranca' },
  { id: 'cat_capaspeliculas', name: 'Capas/Peliculas' },
  { id: 'cat_iluminacao', name: 'Iluminacao' },
  { id: 'cat_acessorios', name: 'Acessorios' },
  { id: 'cat_computadores', name: 'Computadores' },
  { id: 'cat_controles', name: 'Controles' },
  { id: 'cat_climatizacao', name: 'Climatizacao' },
  { id: 'cat_suportesveicular', name: 'Suportes/Veicular' },
  { id: 'cat_fonesaudio', name: 'Fones/Audio' },
  { id: 'cat_servicos', name: 'Servicos' },
  { id: 'cat_perifericos_pc', name: 'Perifericos PC' },
  { id: 'cat_tvvideo', name: 'TV/Video' },
  { id: 'cat_figurinhas', name: 'Figurinhas' },
];

export const initialProducts: Product[] = [
  {
    id: 'p_1001',
    code: 'SKU-1001',
    name: 'Adaptador Bluetooth',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1002',
    code: 'SKU-1002',
    name: 'Adaptador Ios P2',
    category: 'Acessorios/Conectores',
    costPrice: 5.9,
    salePrice: 10.62,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1003',
    code: 'SKU-1003',
    name: 'Adaptador Micro Sd',
    category: 'Acessorios/Conectores',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1004',
    code: 'SKU-1004',
    name: 'Adaptador P2 - P10',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1005',
    code: 'SKU-1005',
    name: 'Adaptador P2 Tipo C',
    category: 'Acessorios/Conectores',
    costPrice: 8,
    salePrice: 14.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1006',
    code: 'SKU-1006',
    name: 'Adaptador P3X2 - P2',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1007',
    code: 'SKU-1007',
    name: 'Adaptador Rede - Usb',
    category: 'Acessorios/Conectores',
    costPrice: 0,
    salePrice: 0,
    stock: 2,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1008',
    code: 'SKU-1008',
    name: 'Adaptador T',
    category: 'Acessorios/Conectores',
    costPrice: 1.5,
    salePrice: 2.7,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1009',
    code: 'SKU-1009',
    name: 'Adaptador Tipo C Para Usb',
    category: 'Acessorios/Conectores',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1010',
    code: 'SKU-1010',
    name: 'Adaptador Tomada 2 Entrada',
    category: 'Acessorios/Conectores',
    costPrice: 9.9,
    salePrice: 17.82,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1011',
    code: 'SKU-1011',
    name: 'Adaptador V8 - Iphone',
    category: 'Acessorios/Conectores',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1012',
    code: 'SKU-1012',
    name: 'Adaptador Vga Para Hdmi',
    category: 'Acessorios/Conectores',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1013',
    code: 'SKU-1013',
    name: 'Adaptador Wifi 2.5G',
    category: 'Acessorios/Conectores',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1014',
    code: 'SKU-1014',
    name: 'Adaptador Wifi 2.5G Antena',
    category: 'Acessorios/Conectores',
    costPrice: 12,
    salePrice: 21.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1015',
    code: 'SKU-1015',
    name: 'Adaptador Wifi 2.5G Antena Ms',
    category: 'Acessorios/Conectores',
    costPrice: 9,
    salePrice: 16.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1016',
    code: 'SKU-1016',
    name: 'Adaptador Wifi 6',
    category: 'Acessorios/Conectores',
    costPrice: 17.18,
    salePrice: 30.92,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1017',
    code: 'SKU-1017',
    name: 'Alicate Universal 8 Id-4762A',
    category: 'Geral',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1018',
    code: 'SKU-1018',
    name: 'Arma De Hidrogel Ar15',
    category: 'Geral',
    costPrice: 35,
    salePrice: 63,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1019',
    code: 'SKU-1019',
    name: 'Arminha De Agua',
    category: 'Brinquedos',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.077Z'
  },
  {
    id: 'p_1020',
    code: 'SKU-1020',
    name: 'Balança 10Kg',
    category: 'Geral',
    costPrice: 14,
    salePrice: 25.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1021',
    code: 'SKU-1021',
    name: 'Balança De Precisão Xm-50522',
    category: 'Geral',
    costPrice: 16,
    salePrice: 28.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1022',
    code: 'SKU-1022',
    name: 'Baralho C 2 Jogos Bar-69087',
    category: 'Jogos',
    costPrice: 1,
    salePrice: 1.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1023',
    code: 'SKU-1023',
    name: 'Bateria 23A',
    category: 'Pilhas/Baterias',
    costPrice: 1.5,
    salePrice: 2.7,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1024',
    code: 'SKU-1024',
    name: 'Bateria 9V',
    category: 'Pilhas/Baterias',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1025',
    code: 'SKU-1025',
    name: 'Bleybleyd',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1026',
    code: 'SKU-1026',
    name: 'Bobbie Goods Caderno',
    category: 'Geral',
    costPrice: 13,
    salePrice: 23.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1027',
    code: 'SKU-1027',
    name: 'Bobbie Goods Card',
    category: 'Armazenamento',
    costPrice: 2.5,
    salePrice: 4.5,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1028',
    code: 'SKU-1028',
    name: 'Bolinha De Gel',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1029',
    code: 'SKU-1029',
    name: 'Boneco Lego',
    category: 'Brinquedos',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1030',
    code: 'SKU-1030',
    name: 'Boneco Lego Kit',
    category: 'Brinquedos',
    costPrice: 0,
    salePrice: 0,
    stock: 97,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1031',
    code: 'SKU-1031',
    name: 'Brinquedo Arminha',
    category: 'Brinquedos',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1032',
    code: 'SKU-1032',
    name: 'Cabeça Carregador 3.1A Ka-5601',
    category: 'Acessorios/Conectores',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1033',
    code: 'SKU-1033',
    name: 'Cabo Auxiliar P2 H\'Maston',
    category: 'Acessorios/Conectores',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1034',
    code: 'SKU-1034',
    name: 'Cabo Auxiliar P2 Kingo',
    category: 'Acessorios/Conectores',
    costPrice: 7,
    salePrice: 12.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1035',
    code: 'SKU-1035',
    name: 'Cabo Auxiliar P2 Le-804',
    category: 'Acessorios/Conectores',
    costPrice: 2.5,
    salePrice: 4.5,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1036',
    code: 'SKU-1036',
    name: 'Cabo Colorido',
    category: 'Acessorios/Conectores',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1037',
    code: 'SKU-1037',
    name: 'Cabo De Dados Tc Kapbom Kap 1Mtc',
    category: 'Acessorios/Conectores',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1038',
    code: 'SKU-1038',
    name: 'Cabo De Dados V8 Kapbom Kap 1Mv8',
    category: 'Acessorios/Conectores',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1039',
    code: 'SKU-1039',
    name: 'Cabo De Força - 2 Pinos',
    category: 'Acessorios/Conectores',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1040',
    code: 'SKU-1040',
    name: 'Cabo De Força - 3 Pinos',
    category: 'Acessorios/Conectores',
    costPrice: 6,
    salePrice: 10.8,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1041',
    code: 'SKU-1041',
    name: 'Cabo De Força - Pc',
    category: 'Acessorios/Conectores',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1042',
    code: 'SKU-1042',
    name: 'Cabo De Rede',
    category: 'Acessorios/Conectores',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1043',
    code: 'SKU-1043',
    name: 'Cabo Displayport',
    category: 'Acessorios/Conectores',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1044',
    code: 'SKU-1044',
    name: 'Cabo Hdmi 1,8/2M',
    category: 'Acessorios/Conectores',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1045',
    code: 'SKU-1045',
    name: 'Cabo Hdmi 2M',
    category: 'Acessorios/Conectores',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1046',
    code: 'SKU-1046',
    name: 'Cabo Hdmi 3M Multilaser',
    category: 'Acessorios/Conectores',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1047',
    code: 'SKU-1047',
    name: 'Cabo Hdmi 4M',
    category: 'Acessorios/Conectores',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1048',
    code: 'SKU-1048',
    name: 'Cabo Hmaster Tpc 4.8A',
    category: 'Acessorios/Conectores',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1049',
    code: 'SKU-1049',
    name: 'Cabo H\'Maston Hb01-1',
    category: 'Acessorios/Conectores',
    costPrice: 4.5,
    salePrice: 8.1,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1050',
    code: 'SKU-1050',
    name: 'Cabo Inova Tc Cbo-12223',
    category: 'Acessorios/Conectores',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1051',
    code: 'SKU-1051',
    name: 'Cabo Iphone 20W',
    category: 'Acessorios/Conectores',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1052',
    code: 'SKU-1052',
    name: 'Cabo Iphone Caixa Branca',
    category: 'Acessorios/Conectores',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1053',
    code: 'SKU-1053',
    name: 'Cabo Iphone Hb10-2 Iphone',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1054',
    code: 'SKU-1054',
    name: 'Cabo Iphone Hb10-3 Tipo C',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1055',
    code: 'SKU-1055',
    name: 'Cabo Iphone Kap',
    category: 'Acessorios/Conectores',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1056',
    code: 'SKU-1056',
    name: 'Cabo Kingo Iphone 1M',
    category: 'Acessorios/Conectores',
    costPrice: 7,
    salePrice: 12.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1057',
    code: 'SKU-1057',
    name: 'Cabo Kingo Iphone 2M Leo',
    category: 'Acessorios/Conectores',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1058',
    code: 'SKU-1058',
    name: 'Cabo Kingo Tc 1M',
    category: 'Acessorios/Conectores',
    costPrice: 7,
    salePrice: 12.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1059',
    code: 'SKU-1059',
    name: 'Cabo P2/P10',
    category: 'Acessorios/Conectores',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1060',
    code: 'SKU-1060',
    name: 'Cabo Pmcell Tc Laranja',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1061',
    code: 'SKU-1061',
    name: 'Cabo Rca Para Rca',
    category: 'Acessorios/Conectores',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1062',
    code: 'SKU-1062',
    name: 'Cabo Spartan V8',
    category: 'Acessorios/Conectores',
    costPrice: 4.5,
    salePrice: 8.1,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1063',
    code: 'SKU-1063',
    name: 'Cabo Spartan V8 Leo',
    category: 'Acessorios/Conectores',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1064',
    code: 'SKU-1064',
    name: 'Cabo Tipo C - Digital',
    category: 'Acessorios/Conectores',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1065',
    code: 'SKU-1065',
    name: 'Cabo Usb Extensor',
    category: 'Acessorios/Conectores',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1066',
    code: 'SKU-1066',
    name: 'Cabo Usb X Usb',
    category: 'Acessorios/Conectores',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1067',
    code: 'SKU-1067',
    name: 'Cabo V8 4.8 Max H72-1',
    category: 'Acessorios/Conectores',
    costPrice: 4.5,
    salePrice: 8.1,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1068',
    code: 'SKU-1068',
    name: 'Cabo Verde',
    category: 'Acessorios/Conectores',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1069',
    code: 'SKU-1069',
    name: 'Cabo Vga',
    category: 'Acessorios/Conectores',
    costPrice: 9,
    salePrice: 16.2,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1070',
    code: 'SKU-1070',
    name: 'Cabo Y P2/P3',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1071',
    code: 'SKU-1071',
    name: 'Cabos Variados Saco Branco',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1072',
    code: 'SKU-1072',
    name: 'Caixa De Som Pc',
    category: 'Audio/Som',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1073',
    code: 'SKU-1073',
    name: 'Calculadora 12 Dígitos Crs8585',
    category: 'Geral',
    costPrice: 23,
    salePrice: 41.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1074',
    code: 'SKU-1074',
    name: 'Calculadora Pequena',
    category: 'Geral',
    costPrice: 2.7,
    salePrice: 4.86,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1075',
    code: 'SKU-1075',
    name: 'Camera Ip Dupla',
    category: 'Cameras/Seguranca',
    costPrice: 105.175,
    salePrice: 189.32,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1076',
    code: 'SKU-1076',
    name: 'Caneta Depiladora',
    category: 'Geral',
    costPrice: 12.5,
    salePrice: 22.5,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1077',
    code: 'SKU-1077',
    name: 'Canivete Automático Knife',
    category: 'Geral',
    costPrice: 9,
    salePrice: 16.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1078',
    code: 'SKU-1078',
    name: 'Capa A Prova D\'Água',
    category: 'Capas/Peliculas',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1079',
    code: 'SKU-1079',
    name: 'Capa Celular Simples',
    category: 'Capas/Peliculas',
    costPrice: 2,
    salePrice: 3.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1080',
    code: 'SKU-1080',
    name: 'Capa De Chuva',
    category: 'Capas/Peliculas',
    costPrice: 7,
    salePrice: 12.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1081',
    code: 'SKU-1081',
    name: 'Capinha',
    category: 'Capas/Peliculas',
    costPrice: 3,
    salePrice: 5.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1082',
    code: 'SKU-1082',
    name: 'Capinha Iphone',
    category: 'Capas/Peliculas',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1083',
    code: 'SKU-1083',
    name: 'Capinha Simples',
    category: 'Capas/Peliculas',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1084',
    code: 'SKU-1084',
    name: 'Card',
    category: 'Armazenamento',
    costPrice: 0.4,
    salePrice: 0.72,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1085',
    code: 'SKU-1085',
    name: 'Card Caixa 50',
    category: 'Armazenamento',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1086',
    code: 'SKU-1086',
    name: 'Carregador Cabeça  Spartan  - Cw-178',
    category: 'Acessorios/Conectores',
    costPrice: 12,
    salePrice: 21.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1087',
    code: 'SKU-1087',
    name: 'Carregador Cabeça 20W',
    category: 'Acessorios/Conectores',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1088',
    code: 'SKU-1088',
    name: 'Carregador Completo Iphone 20W',
    category: 'Acessorios/Conectores',
    costPrice: 15,
    salePrice: 27,
    stock: 96,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1089',
    code: 'SKU-1089',
    name: 'Carregador Completo Lehmox Tipo C',
    category: 'Acessorios/Conectores',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1090',
    code: 'SKU-1090',
    name: 'Carregador Completo Lehmox v8',
    category: 'Acessorios/Conectores',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1091',
    code: 'SKU-1091',
    name: 'Carregador Completo Lehmox iphone',
    category: 'Acessorios/Conectores',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1092',
    code: 'SKU-1092',
    name: 'Jogos De Ps2',
    category: 'Jogos',
    costPrice: 0.7,
    salePrice: 1.26,
    stock: 990,
    minStock: 198,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1093',
    code: 'SKU-1093',
    name: 'Jogo Ps2 tiktok',
    category: 'Jogos',
    costPrice: 0.7,
    salePrice: 1.26,
    stock: 964,
    minStock: 192,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1094',
    code: 'SKU-1094',
    name: 'Carregador Lehmox 5.1 Le-82',
    category: 'Acessorios/Conectores',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1095',
    code: 'SKU-1095',
    name: 'Carregador Spartan V8  Leo',
    category: 'Acessorios/Conectores',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1096',
    code: 'SKU-1096',
    name: 'Carregador Tipo C 4.1 Le-497',
    category: 'Acessorios/Conectores',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1097',
    code: 'SKU-1097',
    name: 'Carregador Tipo C 50W',
    category: 'Acessorios/Conectores',
    costPrice: 19,
    salePrice: 34.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1098',
    code: 'SKU-1098',
    name: 'Carregador Tipo C 67 W',
    category: 'Acessorios/Conectores',
    costPrice: 20,
    salePrice: 36,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1099',
    code: 'SKU-1099',
    name: 'Carregador Tipo C Le-484',
    category: 'Acessorios/Conectores',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1100',
    code: 'SKU-1100',
    name: 'Carregador Veicular Inova Tc',
    category: 'Acessorios/Conectores',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1101',
    code: 'SKU-1101',
    name: 'Carregador Veicular Kingo',
    category: 'Acessorios/Conectores',
    costPrice: 14,
    salePrice: 25.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1102',
    code: 'SKU-1102',
    name: 'Carregador Veicular L01-3',
    category: 'Acessorios/Conectores',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1103',
    code: 'SKU-1103',
    name: 'Carregador Veicular Simples',
    category: 'Acessorios/Conectores',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1104',
    code: 'SKU-1104',
    name: 'Carregador Veicular Spartan',
    category: 'Acessorios/Conectores',
    costPrice: 7,
    salePrice: 12.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1105',
    code: 'SKU-1105',
    name: 'Carregador Veicular Tipo C Le-535',
    category: 'Acessorios/Conectores',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1106',
    code: 'SKU-1106',
    name: 'Cartão De Memoria 16Gb',
    category: 'Armazenamento',
    costPrice: 18.8,
    salePrice: 33.84,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1107',
    code: 'SKU-1107',
    name: 'Cartão De Memoria 32Gb',
    category: 'Armazenamento',
    costPrice: 23.5,
    salePrice: 42.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1108',
    code: 'SKU-1108',
    name: 'Cartao Micro Sd 16Gb',
    category: 'Armazenamento',
    costPrice: 0,
    salePrice: 0,
    stock: 97,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1109',
    code: 'SKU-1109',
    name: 'Carteira Pequena',
    category: 'Geral',
    costPrice: 2.5,
    salePrice: 4.5,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1110',
    code: 'SKU-1110',
    name: 'Cartinha',
    category: 'Geral',
    costPrice: 1,
    salePrice: 1.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1111',
    code: 'SKU-1111',
    name: 'Cascata Led - Fios De Fada',
    category: 'Iluminacao',
    costPrice: 12.88,
    salePrice: 23.18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1112',
    code: 'SKU-1112',
    name: 'Case 2.5 Hd',
    category: 'Armazenamento',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1113',
    code: 'SKU-1113',
    name: 'Chave Allen - Canivete Ls-A08',
    category: 'Geral',
    costPrice: 13,
    salePrice: 23.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1114',
    code: 'SKU-1114',
    name: 'Chave Para Bicicleta',
    category: 'Geral',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1115',
    code: 'SKU-1115',
    name: 'Chave Tork 8Pçs Lst08',
    category: 'Geral',
    costPrice: 11.5,
    salePrice: 20.7,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1116',
    code: 'SKU-1116',
    name: 'Chaveiro',
    category: 'Acessorios',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1117',
    code: 'SKU-1117',
    name: 'Cheirinho',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1118',
    code: 'SKU-1118',
    name: 'Cheirinho Para Carro',
    category: 'Geral',
    costPrice: 7.5,
    salePrice: 13.5,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1119',
    code: 'SKU-1119',
    name: 'Chip Normal',
    category: 'Cameras/Seguranca',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1120',
    code: 'SKU-1120',
    name: 'Chip Recarregado',
    category: 'Cameras/Seguranca',
    costPrice: 17,
    salePrice: 30.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1121',
    code: 'SKU-1121',
    name: 'Chip Sem Recarga',
    category: 'Cameras/Seguranca',
    costPrice: 0,
    salePrice: 0,
    stock: 97,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1122',
    code: 'SKU-1122',
    name: 'Coleção_4_Jogos_Ben_10_Ps2',
    category: 'Jogos',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1123',
    code: 'SKU-1123',
    name: 'Computadores',
    category: 'Computadores',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.078Z'
  },
  {
    id: 'p_1124',
    code: 'SKU-1124',
    name: 'Conjunto De Chaves Allen 9Pçs Ls-4113',
    category: 'Geral',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1125',
    code: 'SKU-1125',
    name: 'Controle Gamepad Com-7436',
    category: 'Jogos',
    costPrice: 17,
    salePrice: 30.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1126',
    code: 'SKU-1126',
    name: 'Controle Gamer Celular Ly84358',
    category: 'Jogos',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1127',
    code: 'SKU-1127',
    name: 'Controle Gatilho',
    category: 'Controles',
    costPrice: 17,
    salePrice: 30.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1128',
    code: 'SKU-1128',
    name: 'Controle Pc',
    category: 'Controles',
    costPrice: 20,
    salePrice: 36,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1129',
    code: 'SKU-1129',
    name: 'Controle Ps2',
    category: 'Jogos',
    costPrice: 20,
    salePrice: 36,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1130',
    code: 'SKU-1130',
    name: 'Controle Tv Box  Le-7490-1',
    category: 'Controles',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1131',
    code: 'SKU-1131',
    name: 'Controle Tv Universal',
    category: 'Controles',
    costPrice: 8.5,
    salePrice: 15.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1132',
    code: 'SKU-1132',
    name: 'Conversor Vga Para Hdmi',
    category: 'Armazenamento',
    costPrice: 0,
    salePrice: 0,
    stock: 97,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1133',
    code: 'SKU-1133',
    name: 'Cooler Fan G-Vr332',
    category: 'Climatizacao',
    costPrice: 20,
    salePrice: 36,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1134',
    code: 'SKU-1134',
    name: 'Cooler Table - Suporte Notbook',
    category: 'Suportes/Veicular',
    costPrice: 25,
    salePrice: 45,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1135',
    code: 'SKU-1135',
    name: 'Cordao Simples Cracha',
    category: 'Acessorios',
    costPrice: 2,
    salePrice: 3.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1136',
    code: 'SKU-1136',
    name: 'Cordão Vasco',
    category: 'Geral',
    costPrice: 2.5,
    salePrice: 4.5,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1137',
    code: 'SKU-1137',
    name: 'Cortador De Legumes Verde Grande',
    category: 'Geral',
    costPrice: 44,
    salePrice: 79.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1138',
    code: 'SKU-1138',
    name: 'Depilador Removedor Pelos Corporal Yes Finishing Touch Light',
    category: 'Geral',
    costPrice: 21.99,
    salePrice: 39.58,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1139',
    code: 'SKU-1139',
    name: 'Desentupidor',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 96,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1140',
    code: 'SKU-1140',
    name: 'Detector De Dinheiro',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1141',
    code: 'SKU-1141',
    name: 'Detector De Metal',
    category: 'Geral',
    costPrice: 48,
    salePrice: 86.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1142',
    code: 'SKU-1142',
    name: 'Dispenser Banheiro',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1143',
    code: 'SKU-1143',
    name: 'Durex',
    category: 'Geral',
    costPrice: 2.5,
    salePrice: 4.5,
    stock: 2,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1144',
    code: 'SKU-1144',
    name: 'Envelope A4',
    category: 'Geral',
    costPrice: 0.39549999999999996,
    salePrice: 0.71,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1145',
    code: 'SKU-1145',
    name: 'Escova De Dente Eletrica',
    category: 'Geral',
    costPrice: 15.11,
    salePrice: 27.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1146',
    code: 'SKU-1146',
    name: 'Extensor P2',
    category: 'Geral',
    costPrice: 2.5,
    salePrice: 4.5,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1147',
    code: 'SKU-1147',
    name: 'Fone De Ouvido Gamer Inova',
    category: 'Fones/Audio',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1148',
    code: 'SKU-1148',
    name: 'Fone De Ouvido Gamr Q0008',
    category: 'Fones/Audio',
    costPrice: 20,
    salePrice: 36,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1149',
    code: 'SKU-1149',
    name: 'Fone De Ouvido Inova Fon-30063',
    category: 'Fones/Audio',
    costPrice: 8,
    salePrice: 14.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1150',
    code: 'SKU-1150',
    name: 'Fone De Ouvido Lelong Le-02',
    category: 'Fones/Audio',
    costPrice: 9,
    salePrice: 16.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1151',
    code: 'SKU-1151',
    name: 'Fone De Ouvido M10',
    category: 'Fones/Audio',
    costPrice: 17,
    salePrice: 30.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1152',
    code: 'SKU-1152',
    name: 'Fone De Ouvido P3 Fon8619',
    category: 'Fones/Audio',
    costPrice: 18,
    salePrice: 32.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1153',
    code: 'SKU-1153',
    name: 'Fone Fon30024 Inova',
    category: 'Fones/Audio',
    costPrice: 8,
    salePrice: 14.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1154',
    code: 'SKU-1154',
    name: 'Fone I7',
    category: 'Fones/Audio',
    costPrice: 18,
    salePrice: 32.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1155',
    code: 'SKU-1155',
    name: 'Fone Iphone Hmaster Ej-56',
    category: 'Fones/Audio',
    costPrice: 12,
    salePrice: 21.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1156',
    code: 'SKU-1156',
    name: 'Fone Jbl 950',
    category: 'Fones/Audio',
    costPrice: 35,
    salePrice: 63,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1157',
    code: 'SKU-1157',
    name: 'Fone M10',
    category: 'Fones/Audio',
    costPrice: 18,
    salePrice: 32.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1158',
    code: 'SKU-1158',
    name: 'Fone M20',
    category: 'Fones/Audio',
    costPrice: 25,
    salePrice: 45,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1159',
    code: 'SKU-1159',
    name: 'Fone P9',
    category: 'Fones/Audio',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1160',
    code: 'SKU-1160',
    name: 'Fone Pmcell Fo-11',
    category: 'Fones/Audio',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1161',
    code: 'SKU-1161',
    name: 'Fone Pmcell Fo-15',
    category: 'Fones/Audio',
    costPrice: 9,
    salePrice: 16.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1162',
    code: 'SKU-1162',
    name: 'Fone Pmcell Leo',
    category: 'Fones/Audio',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1163',
    code: 'SKU-1163',
    name: 'Fone Pmcell Tc',
    category: 'Fones/Audio',
    costPrice: 9,
    salePrice: 16.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1164',
    code: 'SKU-1164',
    name: 'Fone Redmi Branco',
    category: 'Fones/Audio',
    costPrice: 35,
    salePrice: 63,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1165',
    code: 'SKU-1165',
    name: 'Fone Redmi Vermelho',
    category: 'Fones/Audio',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1166',
    code: 'SKU-1166',
    name: 'Fone Simples Ka-833 Leo',
    category: 'Fones/Audio',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1167',
    code: 'SKU-1167',
    name: 'Fone Simples Lef-1055 Leo',
    category: 'Fones/Audio',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1168',
    code: 'SKU-1168',
    name: 'Fone Simples Ms-5V 1 Leo',
    category: 'Fones/Audio',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1169',
    code: 'SKU-1169',
    name: 'Fone Tipo C Apple',
    category: 'Fones/Audio',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1170',
    code: 'SKU-1170',
    name: 'Fonte 12V',
    category: 'Acessorios/Conectores',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1171',
    code: 'SKU-1171',
    name: 'Fonte Notebook Grasep',
    category: 'Acessorios/Conectores',
    costPrice: 32,
    salePrice: 57.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1172',
    code: 'SKU-1172',
    name: 'Fonte Pc 200W',
    category: 'Acessorios/Conectores',
    costPrice: 60,
    salePrice: 108,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1173',
    code: 'SKU-1173',
    name: 'Fonte Tv Box 5V',
    category: 'Acessorios/Conectores',
    costPrice: 7,
    salePrice: 12.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1174',
    code: 'SKU-1174',
    name: 'Fonte Usb Sparta 5.8W',
    category: 'Acessorios/Conectores',
    costPrice: 8.8,
    salePrice: 15.84,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1175',
    code: 'SKU-1175',
    name: 'Fonte Usb Spartan',
    category: 'Acessorios/Conectores',
    costPrice: 5.5,
    salePrice: 9.9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1176',
    code: 'SKU-1176',
    name: 'Fonte Veicular Usb-C Spartan',
    category: 'Acessorios/Conectores',
    costPrice: 18,
    salePrice: 32.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1177',
    code: 'SKU-1177',
    name: 'Formatação',
    category: 'Servicos',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1178',
    code: 'SKU-1178',
    name: 'Game Boy + Controle',
    category: 'Jogos',
    costPrice: 50,
    salePrice: 90,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1179',
    code: 'SKU-1179',
    name: 'Game Pop It',
    category: 'Jogos',
    costPrice: 27,
    salePrice: 48.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1180',
    code: 'SKU-1180',
    name: 'Game Pop It 15 Reais',
    category: 'Jogos',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1181',
    code: 'SKU-1181',
    name: 'Garrafa 3 In 1 Colorida',
    category: 'Geral',
    costPrice: 22,
    salePrice: 39.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1182',
    code: 'SKU-1182',
    name: 'Garrafa 3 In 1 Colorida Leo',
    category: 'Geral',
    costPrice: 22,
    salePrice: 39.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1183',
    code: 'SKU-1183',
    name: 'Garrafa Colorida Motivacional',
    category: 'Geral',
    costPrice: 13.5,
    salePrice: 24.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1184',
    code: 'SKU-1184',
    name: 'Garrafa Stanley 1L',
    category: 'Geral',
    costPrice: 50,
    salePrice: 90,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1185',
    code: 'SKU-1185',
    name: 'Garrafa Stanley 600Lm',
    category: 'Geral',
    costPrice: 35,
    salePrice: 63,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1186',
    code: 'SKU-1186',
    name: 'Gatilhos Simples',
    category: 'Geral',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1187',
    code: 'SKU-1187',
    name: 'Gatilhos Simples Leo',
    category: 'Geral',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1188',
    code: 'SKU-1188',
    name: 'Globo De Luz  Com Controle',
    category: 'Controles',
    costPrice: 35,
    salePrice: 63,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1189',
    code: 'SKU-1189',
    name: 'Globo De Luz  Sem Controle',
    category: 'Controles',
    costPrice: 30,
    salePrice: 54,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1190',
    code: 'SKU-1190',
    name: 'Gravação De Musica',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 96,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1191',
    code: 'SKU-1191',
    name: 'Guarda Chuva Automático Transparente Cabo Curvo 8 Varetas',
    category: 'Acessorios/Conectores',
    costPrice: 16.75,
    salePrice: 30.15,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1192',
    code: 'SKU-1192',
    name: 'Guirlanda Verde/Branca',
    category: 'Geral',
    costPrice: 3,
    salePrice: 5.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1193',
    code: 'SKU-1193',
    name: 'Hd 500',
    category: 'Armazenamento',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1194',
    code: 'SKU-1194',
    name: 'Hub 7 Portas 2.0',
    category: 'Acessorios',
    costPrice: 10.99,
    salePrice: 19.78,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1195',
    code: 'SKU-1195',
    name: 'Hub Usb 2',
    category: 'Geral',
    costPrice: 8,
    salePrice: 14.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1196',
    code: 'SKU-1196',
    name: 'Impressao Colorida',
    category: 'Servicos',
    costPrice: 0.05,
    salePrice: 0.09,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1197',
    code: 'SKU-1197',
    name: 'Impressao Preta',
    category: 'Servicos',
    costPrice: 0.07,
    salePrice: 0.13,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1198',
    code: 'SKU-1198',
    name: 'Isqueiro Auto',
    category: 'Geral',
    costPrice: 0.8,
    salePrice: 1.44,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1199',
    code: 'SKU-1199',
    name: 'Joelheira Ec3360 Leo',
    category: 'Geral',
    costPrice: 19,
    salePrice: 34.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1200',
    code: 'SKU-1200',
    name: 'Jogo C 2 Canecas Vidro Chopp 480Ml',
    category: 'Jogos',
    costPrice: 19,
    salePrice: 34.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1201',
    code: 'SKU-1201',
    name: 'Jogo De Chaves Peq.',
    category: 'Jogos',
    costPrice: 3.5,
    salePrice: 6.3,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1202',
    code: 'SKU-1202',
    name: 'Jogo De Xbox',
    category: 'Jogos',
    costPrice: 5,
    salePrice: 9,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1203',
    code: 'SKU-1203',
    name: 'Jogo Ps2 Shopee',
    category: 'Jogos',
    costPrice: 0.7,
    salePrice: 1.26,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1204',
    code: 'SKU-1204',
    name: 'Jogos De Ps2',
    category: 'Jogos',
    costPrice: 0,
    salePrice: 0,
    stock: 90,
    minStock: 18,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1205',
    code: 'SKU-1205',
    name: 'Jogos De Xbox',
    category: 'Jogos',
    costPrice: 7.5,
    salePrice: 13.5,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1206',
    code: 'SKU-1206',
    name: 'Kemei Maquina De Barbear 4 In 1',
    category: 'Geral',
    costPrice: 32.95,
    salePrice: 59.31,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1207',
    code: 'SKU-1207',
    name: 'Kit 10 Jogos Ps2',
    category: 'Jogos',
    costPrice: 0,
    salePrice: 0,
    stock: 95,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1208',
    code: 'SKU-1208',
    name: 'Kit 6 Formas Silicone Para Air Fryer Reutilizável Com Alça',
    category: 'Geral',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1209',
    code: 'SKU-1209',
    name: 'Kit Caneca Café Stanley',
    category: 'Geral',
    costPrice: 26,
    salePrice: 46.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1210',
    code: 'SKU-1210',
    name: 'Kit Chave Com 6Pçs Lsc-Ppcs',
    category: 'Geral',
    costPrice: 3.8,
    salePrice: 6.84,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1211',
    code: 'SKU-1211',
    name: 'Kit Chaves 6024A',
    category: 'Geral',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1212',
    code: 'SKU-1212',
    name: 'Kit Colheres Colorida',
    category: 'Geral',
    costPrice: 50,
    salePrice: 90,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1213',
    code: 'SKU-1213',
    name: 'Kit Com 10 Mini Fusível',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1214',
    code: 'SKU-1214',
    name: 'Kit Completo Carregador 20W',
    category: 'Acessorios/Conectores',
    costPrice: 17,
    salePrice: 30.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1215',
    code: 'SKU-1215',
    name: 'Kit Costura Crs 1184',
    category: 'Geral',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1216',
    code: 'SKU-1216',
    name: 'Kit De Ferramentas 41Pçs Id-2226K',
    category: 'Geral',
    costPrice: 36.9,
    salePrice: 66.42,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1217',
    code: 'SKU-1217',
    name: 'Kit Facas',
    category: 'Geral',
    costPrice: 23,
    salePrice: 41.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1218',
    code: 'SKU-1218',
    name: 'Kit Ferramentas 41 Pçs Maleta',
    category: 'Geral',
    costPrice: 30,
    salePrice: 54,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1219',
    code: 'SKU-1219',
    name: 'Kit Fusível Grande Leo',
    category: 'Geral',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1220',
    code: 'SKU-1220',
    name: 'Kit Jogo De Facas',
    category: 'Jogos',
    costPrice: 20,
    salePrice: 36,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1221',
    code: 'SKU-1221',
    name: 'Kit Maçarico',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1222',
    code: 'SKU-1222',
    name: 'Kit Mouse E Teclado Sem Fio K4',
    category: 'Perifericos PC',
    costPrice: 60,
    salePrice: 108,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1223',
    code: 'SKU-1223',
    name: 'Kit Porta Detergente Dispense Com Bucha Louça',
    category: 'Acessorios',
    costPrice: 8.99,
    salePrice: 16.18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1224',
    code: 'SKU-1224',
    name: 'Kit Pote Banheiro',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1225',
    code: 'SKU-1225',
    name: 'Kit Taboa Idea',
    category: 'Geral',
    costPrice: 7,
    salePrice: 12.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1226',
    code: 'SKU-1226',
    name: 'Kit Talheres',
    category: 'Geral',
    costPrice: 38,
    salePrice: 68.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1227',
    code: 'SKU-1227',
    name: 'Kit Teclado E Mouse Sem Fio Mb54264',
    category: 'Perifericos PC',
    costPrice: 55,
    salePrice: 99,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1228',
    code: 'SKU-1228',
    name: 'Kit Tesoura Cabelo',
    category: 'Geral',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1229',
    code: 'SKU-1229',
    name: 'Lanterna',
    category: 'Iluminacao',
    costPrice: 0,
    salePrice: 0,
    stock: 96,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1230',
    code: 'SKU-1230',
    name: 'Lapela Tipoc',
    category: 'Cameras/Seguranca',
    costPrice: 25,
    salePrice: 45,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1231',
    code: 'SKU-1231',
    name: 'Laxasfit 2024 Relógio Inteligente',
    category: 'Geral',
    costPrice: 34.19,
    salePrice: 61.54,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1232',
    code: 'SKU-1232',
    name: 'Lego Ali',
    category: 'Brinquedos',
    costPrice: 2.5,
    salePrice: 4.5,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1233',
    code: 'SKU-1233',
    name: 'Lego Grande',
    category: 'Brinquedos',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1234',
    code: 'SKU-1234',
    name: 'Lego Pequeno',
    category: 'Brinquedos',
    costPrice: 2,
    salePrice: 3.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1235',
    code: 'SKU-1235',
    name: 'Leitor De Cartao De Memoria Dkq02',
    category: 'Armazenamento',
    costPrice: 2,
    salePrice: 3.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1236',
    code: 'SKU-1236',
    name: 'Leitor De Cartao De Memoria Uf0013',
    category: 'Armazenamento',
    costPrice: 2,
    salePrice: 3.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1237',
    code: 'SKU-1237',
    name: 'Lixa De Unha',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1238',
    code: 'SKU-1238',
    name: 'Lousa Magica 10Pol',
    category: 'Geral',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1239',
    code: 'SKU-1239',
    name: 'Lousa Magica 12Pol',
    category: 'Geral',
    costPrice: 20,
    salePrice: 36,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1240',
    code: 'SKU-1240',
    name: 'Lousa Magica 12Pol Novo',
    category: 'Geral',
    costPrice: 13,
    salePrice: 23.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1241',
    code: 'SKU-1241',
    name: 'Lousa Magica 16Pol',
    category: 'Geral',
    costPrice: 28,
    salePrice: 50.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1242',
    code: 'SKU-1242',
    name: 'Lousa Magica 8Pol',
    category: 'Geral',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1243',
    code: 'SKU-1243',
    name: 'Luminária Astronauta',
    category: 'Geral',
    costPrice: 75,
    salePrice: 135,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1244',
    code: 'SKU-1244',
    name: 'Luminaria Solar Led Refletor',
    category: 'Iluminacao',
    costPrice: 30,
    salePrice: 54,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1245',
    code: 'SKU-1245',
    name: 'Luvinha De Dedo',
    category: 'Geral',
    costPrice: 1,
    salePrice: 1.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1246',
    code: 'SKU-1246',
    name: 'Luvinhas Dedo N',
    category: 'Geral',
    costPrice: 0.29425,
    salePrice: 0.53,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1247',
    code: 'SKU-1247',
    name: 'Maquina De Cabelo Dragao Ml',
    category: 'Geral',
    costPrice: 16,
    salePrice: 28.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1248',
    code: 'SKU-1248',
    name: 'Maquina Dourada Dragao',
    category: 'Geral',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1249',
    code: 'SKU-1249',
    name: 'Maquinha De Bolhas Automático',
    category: 'Geral',
    costPrice: 32.33,
    salePrice: 58.19,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1250',
    code: 'SKU-1250',
    name: 'Massageador Pistola',
    category: 'Geral',
    costPrice: 55,
    salePrice: 99,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1251',
    code: 'SKU-1251',
    name: 'Mata Mosquito Eletric Mw-555',
    category: 'Geral',
    costPrice: 28,
    salePrice: 50.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1252',
    code: 'SKU-1252',
    name: 'Memoria',
    category: 'Armazenamento',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1253',
    code: 'SKU-1253',
    name: 'Memory Card 15Mb',
    category: 'Armazenamento',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1254',
    code: 'SKU-1254',
    name: 'Memory Card 16Mb',
    category: 'Armazenamento',
    costPrice: 18,
    salePrice: 32.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1255',
    code: 'SKU-1255',
    name: 'Micro Sd Kodak 64Gb',
    category: 'Geral',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1256',
    code: 'SKU-1256',
    name: 'Microscopio 1000X',
    category: 'Geral',
    costPrice: 75,
    salePrice: 135,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.079Z'
  },
  {
    id: 'p_1257',
    code: 'SKU-1257',
    name: 'Mini Antena Digital',
    category: 'Geral',
    costPrice: 13,
    salePrice: 23.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1258',
    code: 'SKU-1258',
    name: 'Mini Caixa De Som Cs2C',
    category: 'Audio/Som',
    costPrice: 23,
    salePrice: 41.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1259',
    code: 'SKU-1259',
    name: 'Mini Fatiador',
    category: 'Geral',
    costPrice: 1.7,
    salePrice: 3.06,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1260',
    code: 'SKU-1260',
    name: 'Mini Jogo De Luz C/C',
    category: 'Jogos',
    costPrice: 37,
    salePrice: 66.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1261',
    code: 'SKU-1261',
    name: 'Mini Lanterna Kal1114',
    category: 'Iluminacao',
    costPrice: 20,
    salePrice: 36,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1262',
    code: 'SKU-1262',
    name: 'Mini Liquidificado',
    category: 'Geral',
    costPrice: 25,
    salePrice: 45,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1263',
    code: 'SKU-1263',
    name: 'Mini Liquidificado Max',
    category: 'Geral',
    costPrice: 77,
    salePrice: 138.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1264',
    code: 'SKU-1264',
    name: 'Mini Máquina De Costura',
    category: 'Geral',
    costPrice: 7.5,
    salePrice: 13.5,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1265',
    code: 'SKU-1265',
    name: 'Mini Massageador',
    category: 'Geral',
    costPrice: 8,
    salePrice: 14.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1266',
    code: 'SKU-1266',
    name: 'Mini Pau De Self  Leo',
    category: 'Geral',
    costPrice: 5.5,
    salePrice: 9.9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1267',
    code: 'SKU-1267',
    name: 'Mini Router Wifi',
    category: 'Geral',
    costPrice: 99,
    salePrice: 178.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1268',
    code: 'SKU-1268',
    name: 'Miniteclado Tv Box',
    category: 'Perifericos PC',
    costPrice: 19,
    salePrice: 34.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1269',
    code: 'SKU-1269',
    name: 'Misturador De Bebidas Ovos Portátil Mixer Elétrico 2 Peças Whisk',
    category: 'Geral',
    costPrice: 30,
    salePrice: 54,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1270',
    code: 'SKU-1270',
    name: 'Mochila Dobrável À Prova D\'Água Design Exclusivo Escolar Unissex  Preto',
    category: 'Geral',
    costPrice: 16.9,
    salePrice: 30.42,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1271',
    code: 'SKU-1271',
    name: 'Mochila Escolar Unissex Impermeável Com Entrada Usb  Preto',
    category: 'Geral',
    costPrice: 31.99,
    salePrice: 57.58,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1272',
    code: 'SKU-1272',
    name: 'Mochila Escolar Universitária Unissex',
    category: 'Geral',
    costPrice: 45,
    salePrice: 81,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1273',
    code: 'SKU-1273',
    name: 'Mochila Escolar Universitária Unissex Com Estojo',
    category: 'Geral',
    costPrice: 31.99,
    salePrice: 57.58,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1274',
    code: 'SKU-1274',
    name: 'Moeba',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 97,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1275',
    code: 'SKU-1275',
    name: 'Moldem Tplink',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1276',
    code: 'SKU-1276',
    name: 'Mouse B-Max',
    category: 'Perifericos PC',
    costPrice: 5.5,
    salePrice: 9.9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1277',
    code: 'SKU-1277',
    name: 'Mouse Com Fio Exbom Md-9',
    category: 'Perifericos PC',
    costPrice: 5.5,
    salePrice: 9.9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1278',
    code: 'SKU-1278',
    name: 'Mouse Com Fio In-20055',
    category: 'Perifericos PC',
    costPrice: 7,
    salePrice: 12.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1279',
    code: 'SKU-1279',
    name: 'Mouse Gamer 01',
    category: 'Jogos',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1280',
    code: 'SKU-1280',
    name: 'Mouse Pad Com Gel',
    category: 'Perifericos PC',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1281',
    code: 'SKU-1281',
    name: 'Mouse Pad Simples',
    category: 'Perifericos PC',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1282',
    code: 'SKU-1282',
    name: 'Mouse Sem Fio',
    category: 'Perifericos PC',
    costPrice: 0,
    salePrice: 0,
    stock: 96,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1283',
    code: 'SKU-1283',
    name: 'Opl 16 Mb',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1284',
    code: 'SKU-1284',
    name: 'Par Alto Falante Evok 6X9 280Rms',
    category: 'Audio/Som',
    costPrice: 350,
    salePrice: 630,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1285',
    code: 'SKU-1285',
    name: 'Pd Usb Adaptador De Carregamento Leo',
    category: 'Acessorios/Conectores',
    costPrice: 20.5,
    salePrice: 36.9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1286',
    code: 'SKU-1286',
    name: 'Pelicula 3D',
    category: 'Capas/Peliculas',
    costPrice: 3,
    salePrice: 5.4,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1287',
    code: 'SKU-1287',
    name: 'Pelicula Privacidade',
    category: 'Capas/Peliculas',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1288',
    code: 'SKU-1288',
    name: 'Pelicularelogio 49Mm',
    category: 'Capas/Peliculas',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1289',
    code: 'SKU-1289',
    name: 'Pen Drive Com 10 Jogos Para Ps2',
    category: 'Jogos',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1290',
    code: 'SKU-1290',
    name: 'Pente De Cabelo Redondo',
    category: 'Geral',
    costPrice: 2.5,
    salePrice: 4.5,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1291',
    code: 'SKU-1291',
    name: 'Placa De Som Usb',
    category: 'Audio/Som',
    costPrice: 9,
    salePrice: 16.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1292',
    code: 'SKU-1292',
    name: 'Porta Cracha Completo',
    category: 'Acessorios',
    costPrice: 4,
    salePrice: 7.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1293',
    code: 'SKU-1293',
    name: 'Porta Crachá Esticado Leo',
    category: 'Acessorios',
    costPrice: 1,
    salePrice: 1.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1294',
    code: 'SKU-1294',
    name: 'Porta Retrato Duplo Te Amo De Plástico 10X15 Cm Colors',
    category: 'Acessorios',
    costPrice: 12,
    salePrice: 21.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1295',
    code: 'SKU-1295',
    name: 'Processador De Alimentos 1352',
    category: 'Geral',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1296',
    code: 'SKU-1296',
    name: 'Processador De Alimentos Pequeno Leo',
    category: 'Geral',
    costPrice: 12,
    salePrice: 21.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1297',
    code: 'SKU-1297',
    name: 'Protetor Documento',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1298',
    code: 'SKU-1298',
    name: 'Ralador 4 Faces',
    category: 'Geral',
    costPrice: 9,
    salePrice: 16.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1299',
    code: 'SKU-1299',
    name: 'Ralador 6 In 1 Mandolina Multilaminas Leo',
    category: 'Geral',
    costPrice: 37,
    salePrice: 66.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1300',
    code: 'SKU-1300',
    name: 'Ralador De Legumes Diagonal',
    category: 'Geral',
    costPrice: 43,
    salePrice: 77.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1301',
    code: 'SKU-1301',
    name: 'Ralador Panela Leo',
    category: 'Geral',
    costPrice: 25,
    salePrice: 45,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1302',
    code: 'SKU-1302',
    name: 'Relógio Pulseira M7 Inteligente Smatband Monitora Pressão',
    category: 'Computadores',
    costPrice: 25.99,
    salePrice: 46.78,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1303',
    code: 'SKU-1303',
    name: 'Restauraçao Dados',
    category: 'Servicos',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1304',
    code: 'SKU-1304',
    name: 'Serviço Aleatorio',
    category: 'Geral',
    costPrice: 0,
    salePrice: 0,
    stock: 96,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1305',
    code: 'SKU-1305',
    name: 'Super. Cola 3G Leo',
    category: 'Geral',
    costPrice: 0.5,
    salePrice: 0.9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1306',
    code: 'SKU-1306',
    name: 'Suporte Articulado',
    category: 'Suportes/Veicular',
    costPrice: 8,
    salePrice: 14.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1307',
    code: 'SKU-1307',
    name: 'Suporte Celular Braço Leo',
    category: 'Suportes/Veicular',
    costPrice: 5,
    salePrice: 9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1308',
    code: 'SKU-1308',
    name: 'Suporte Celular Veicular Ventosa Bmg02',
    category: 'Suportes/Veicular',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1309',
    code: 'SKU-1309',
    name: 'Suporte De Celular Ima Leo',
    category: 'Suportes/Veicular',
    costPrice: 12,
    salePrice: 21.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1310',
    code: 'SKU-1310',
    name: 'Suporte De Mesa Ecooda Ec9085',
    category: 'Suportes/Veicular',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1311',
    code: 'SKU-1311',
    name: 'Suporte De Tv Pequeno',
    category: 'Suportes/Veicular',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1312',
    code: 'SKU-1312',
    name: 'Suporte De Tv Simples',
    category: 'Suportes/Veicular',
    costPrice: 12,
    salePrice: 21.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1313',
    code: 'SKU-1313',
    name: 'Suporte Fone Leo',
    category: 'Fones/Audio',
    costPrice: 1,
    salePrice: 1.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1314',
    code: 'SKU-1314',
    name: 'Suporte Gancho Adesivo',
    category: 'Suportes/Veicular',
    costPrice: 4.6,
    salePrice: 8.28,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1315',
    code: 'SKU-1315',
    name: 'Suporte Magnetico 360 Kac305',
    category: 'Suportes/Veicular',
    costPrice: 15,
    salePrice: 27,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1316',
    code: 'SKU-1316',
    name: 'Suporte Magnético Veicular Barra',
    category: 'Suportes/Veicular',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1317',
    code: 'SKU-1317',
    name: 'Suporte Moto Le-030D',
    category: 'Suportes/Veicular',
    costPrice: 16,
    salePrice: 28.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1318',
    code: 'SKU-1318',
    name: 'Suporte Triplo Jb-K5556',
    category: 'Suportes/Veicular',
    costPrice: 13,
    salePrice: 23.4,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1319',
    code: 'SKU-1319',
    name: 'Suporte Veicular',
    category: 'Suportes/Veicular',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1320',
    code: 'SKU-1320',
    name: 'Suporte Veicular',
    category: 'Suportes/Veicular',
    costPrice: 12,
    salePrice: 21.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1321',
    code: 'SKU-1321',
    name: 'Suporte Veicular B-Max Bmg-07',
    category: 'Suportes/Veicular',
    costPrice: 10,
    salePrice: 18,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1322',
    code: 'SKU-1322',
    name: 'Suporte Veicular Le-010',
    category: 'Suportes/Veicular',
    costPrice: 6,
    salePrice: 10.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1323',
    code: 'SKU-1323',
    name: 'Suporte Veicular Retrovisor B-Max',
    category: 'Suportes/Veicular',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1324',
    code: 'SKU-1324',
    name: 'Suporte Veicular Ventosa It-Blue',
    category: 'Suportes/Veicular',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1325',
    code: 'SKU-1325',
    name: 'T 3 Pontas',
    category: 'Geral',
    costPrice: 1.5,
    salePrice: 2.7,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1326',
    code: 'SKU-1326',
    name: 'Tapete Massageador',
    category: 'Geral',
    costPrice: 17,
    salePrice: 30.6,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1327',
    code: 'SKU-1327',
    name: 'Teclado Bright 0014',
    category: 'Perifericos PC',
    costPrice: 14,
    salePrice: 25.2,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1328',
    code: 'SKU-1328',
    name: 'Teclado Bring Usb Preto',
    category: 'Perifericos PC',
    costPrice: 15.5,
    salePrice: 27.9,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1329',
    code: 'SKU-1329',
    name: 'Teclado Semigamer',
    category: 'Jogos',
    costPrice: 25,
    salePrice: 45,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1330',
    code: 'SKU-1330',
    name: 'Tripe Pequeno',
    category: 'Cameras/Seguranca',
    costPrice: 4.99,
    salePrice: 8.98,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1331',
    code: 'SKU-1331',
    name: 'Triturador De Alimentos Manual Grande',
    category: 'Geral',
    costPrice: 11,
    salePrice: 19.8,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1332',
    code: 'SKU-1332',
    name: 'Tweeter Evok 400',
    category: 'Audio/Som',
    costPrice: 0,
    salePrice: 0,
    stock: 98,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1333',
    code: 'SKU-1333',
    name: 'Unitv V10',
    category: 'TV/Video',
    costPrice: 305,
    salePrice: 549,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1334',
    code: 'SKU-1334',
    name: 'Uno',
    category: 'Geral',
    costPrice: 6,
    salePrice: 10.8,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1335',
    code: 'SKU-1335',
    name: 'Xerox Preta',
    category: 'Servicos',
    costPrice: 0,
    salePrice: 0,
    stock: 1,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1336',
    code: 'SKU-1336',
    name: 'kit opl + 32gb',
    category: 'Geral',
    costPrice: 34,
    salePrice: 61.2,
    stock: 97,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1337',
    code: 'SKU-1337',
    name: 'Desentupidor',
    category: 'Geral',
    costPrice: 12.5,
    salePrice: 22.5,
    stock: 96,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1338',
    code: 'SKU-1338',
    name: 'Jogo Ps2 tiktok',
    category: 'Jogos',
    costPrice: 0.7,
    salePrice: 1.26,
    stock: 64,
    minStock: 12,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1339',
    code: 'SKU-1339',
    name: 'Figurinhas copa ifood',
    category: 'Figurinhas',
    costPrice: 4.5,
    salePrice: 8.1,
    stock: 7,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1340',
    code: 'SKU-1340',
    name: 'figurinha separada ifood',
    category: 'Figurinhas',
    costPrice: 0.7619047619047619,
    salePrice: 1.37,
    stock: 58,
    minStock: 11,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1341',
    code: 'SKU-1341',
    name: 'Figurinhas copa brasil',
    category: 'Figurinhas',
    costPrice: 6,
    salePrice: 10.8,
    stock: 5,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1342',
    code: 'SKU-1342',
    name: 'figurinhas',
    category: 'Figurinhas',
    costPrice: 0.71,
    salePrice: 1.28,
    stock: 68,
    minStock: 13,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1343',
    code: 'SKU-1343',
    name: 'Arquivo pdf Shopee',
    category: 'Geral',
    costPrice: 1,
    salePrice: 1.8,
    stock: 0,
    minStock: 1,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1344',
    code: 'SKU-1344',
    name: 'Evok 6\'\' 6mb300 300w Rms Mid Bass',
    category: 'Audio/Som',
    costPrice: 350,
    salePrice: 630,
    stock: 95,
    minStock: 19,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
  {
    id: 'p_1345',
    code: 'SKU-1345',
    name: 'figurinha personalizada',
    category: 'Figurinhas',
    costPrice: 0.1875,
    salePrice: 0.34,
    stock: 997,
    minStock: 199,
    createdAt: '2026-07-12T22:29:22.080Z'
  },
];

export const initialSales: Sale[] = [
  {
    id: 'v_25_1_dy1o',
    date: '2025-01-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1170',
        productName: 'Fonte 12V',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    clientName: 'hugo Som',
    paymentMethod: 'money',
    total: 15,
    totalCost: 10,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_2_ph34',
    date: '2025-01-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'senhor loja',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_3_lyn3',
    date: '2025-01-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_4_1y1j',
    date: '2025-01-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1001',
        productName: 'Adaptador Bluetooth',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    clientName: 'cliente israel',
    paymentMethod: 'money',
    total: 20,
    totalCost: 5,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_5_g9we',
    date: '2025-01-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1005',
        productName: 'Controle wireless gamepad alto-4w',
        quantity: 1,
        costPrice: 63,
        salePrice: 110,
        total: 110
      },
    ],
    clientName: 'cliente israel',
    paymentMethod: 'money',
    total: 110,
    totalCost: 63,
    profit: 47,
    status: 'completed'
  },
  {
    id: 'v_25_6_jy1f',
    date: '2025-01-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_7_8vtv',
    date: '2025-01-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_8_y8gq',
    date: '2025-01-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 29,
        total: 29
      },
    ],
    paymentMethod: 'money',
    total: 29,
    totalCost: 0,
    profit: 29,
    status: 'completed'
  },
  {
    id: 'v_25_9_70sy',
    date: '2025-01-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 6,
    profit: 24,
    status: 'completed'
  },
  {
    id: 'v_25_10_c8mi',
    date: '2025-01-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1081',
        productName: 'Capinha',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 6,
    profit: 24,
    status: 'completed'
  },
  {
    id: 'v_25_11_ail0',
    date: '2025-01-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1245',
        productName: 'Luvinha De Dedo',
        quantity: 2,
        costPrice: 1,
        salePrice: 1.8,
        total: 3.6
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 2,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_12_ey03',
    date: '2025-01-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'Cliente Impressão João Pedro',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_13_loof',
    date: '2025-01-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 60,
        total: 60
      },
    ],
    clientName: 'Cliente Pc Ronei',
    paymentMethod: 'money',
    total: 60,
    totalCost: 0,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_25_14_ewwa',
    date: '2025-01-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'Cliente mateus impressao',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_15_hr0b',
    date: '2025-01-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_16_edsq',
    date: '2025-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 3,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.39
      },
    ],
    paymentMethod: 'money',
    total: 3,
    totalCost: 0.21000000000000002,
    profit: 2.79,
    status: 'completed'
  },
  {
    id: 'v_25_17_gdwv',
    date: '2025-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'hugo Som',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_18_o1xi',
    date: '2025-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1018',
        productName: 'chip com recarga',
        quantity: 2,
        costPrice: 0,
        salePrice: 30,
        total: 60
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 0,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_25_19_6gj3',
    date: '2025-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1019',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 37.5,
        total: 37.5
      },
    ],
    paymentMethod: 'money',
    total: 37.5,
    totalCost: 0,
    profit: 37.5,
    status: 'completed'
  },
  {
    id: 'v_25_20_wwrg',
    date: '2025-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 150,
        total: 150
      },
    ],
    paymentMethod: 'money',
    total: 150,
    totalCost: 0,
    profit: 150,
    status: 'completed'
  },
  {
    id: 'v_25_21_14w9',
    date: '2025-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1021',
        productName: 'Pendrive 16gb AL-U-16',
        quantity: 1,
        costPrice: 13,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'luiz',
    paymentMethod: 'money',
    total: 20,
    totalCost: 13,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_22_mgsp',
    date: '2025-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1022',
        productName: 'PILHA FLEX AAA',
        quantity: 1,
        costPrice: 4,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_23_dzdh',
    date: '2025-01-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    clientName: 'hugo Som',
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_24_akgd',
    date: '2025-01-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_25_233p',
    date: '2025-01-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1035',
        productName: 'Cabo Auxiliar P2 Le-804',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'RELOGIO',
    paymentMethod: 'money',
    total: 10,
    totalCost: 2.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_26_6229',
    date: '2025-01-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'senhor',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_27_8mjp',
    date: '2025-01-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1245',
        productName: 'Luvinha De Dedo',
        quantity: 2,
        costPrice: 1,
        salePrice: 1.8,
        total: 3.6
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 2,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_28_owb6',
    date: '2025-01-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1096',
        productName: 'Carregador Tipo C 4.1 Le-497',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_29_fe43',
    date: '2025-01-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1056',
        productName: 'Cabo Kingo Iphone 1M',
        quantity: 1,
        costPrice: 7,
        salePrice: 12.6,
        total: 12.6
      },
    ],
    clientName: 'fernando',
    paymentMethod: 'money',
    total: 20,
    totalCost: 7,
    profit: 13,
    status: 'completed'
  },
  {
    id: 'v_25_30_u4oz',
    date: '2025-01-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    clientName: 'hugo Som',
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_31_uedl',
    date: '2025-01-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_32_onw7',
    date: '2025-01-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1032',
        productName: 'Bateria 2032',
        quantity: 1,
        costPrice: 1,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 1,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_33_0mu2',
    date: '2025-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_34_w8c7',
    date: '2025-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 9,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.17
      },
    ],
    paymentMethod: 'money',
    total: 9,
    totalCost: 0.6300000000000001,
    profit: 8.37,
    status: 'completed'
  },
  {
    id: 'v_25_35_ai1q',
    date: '2025-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1171',
        productName: 'Fonte Notebook Grasep',
        quantity: 1,
        costPrice: 32,
        salePrice: 57.6,
        total: 57.6
      },
    ],
    clientName: 'Diretora higor',
    paymentMethod: 'money',
    total: 70,
    totalCost: 32,
    profit: 38,
    status: 'completed'
  },
  {
    id: 'v_25_36_dfer',
    date: '2025-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1144',
        productName: 'Envelope A4',
        quantity: 1,
        costPrice: 0.39549999999999996,
        salePrice: 0.71,
        total: 0.71
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.39549999999999996,
    profit: 0.6045,
    status: 'completed'
  },
  {
    id: 'v_25_37_l9zm',
    date: '2025-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1037',
        productName: 'Escova magica',
        quantity: 2,
        costPrice: 25,
        salePrice: 50,
        total: 100
      },
    ],
    clientName: 'leandro',
    paymentMethod: 'money',
    total: 100,
    totalCost: 50,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_38_hkw7',
    date: '2025-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1038',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'Diretora higor',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_39_nrl9',
    date: '2025-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1317',
        productName: 'Suporte Moto Le-030D',
        quantity: 1,
        costPrice: 16,
        salePrice: 28.8,
        total: 28.8
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 16,
    profit: 19,
    status: 'completed'
  },
  {
    id: 'v_25_40_1o1e',
    date: '2025-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 57.5,
        total: 57.5
      },
    ],
    paymentMethod: 'money',
    total: 57.5,
    totalCost: 0,
    profit: 57.5,
    status: 'completed'
  },
  {
    id: 'v_25_41_21wm',
    date: '2025-01-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1277',
        productName: 'Mouse Com Fio Exbom Md-9',
        quantity: 1,
        costPrice: 5.5,
        salePrice: 9.9,
        total: 9.9
      },
    ],
    clientName: 'naiane',
    paymentMethod: 'money',
    total: 15,
    totalCost: 5.5,
    profit: 9.5,
    status: 'completed'
  },
  {
    id: 'v_25_42_xm1y',
    date: '2025-01-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'naiane',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_43_hemi',
    date: '2025-01-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1043',
        productName: 'Lanterna Chaveiro Recarregável',
        quantity: 1,
        costPrice: 10,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'Magdar',
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_44_grkk',
    date: '2025-01-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1200',
        productName: 'Jogo C 2 Canecas Vidro Chopp 480Ml',
        quantity: 1,
        costPrice: 19,
        salePrice: 34.2,
        total: 34.2
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 25,
    totalCost: 19,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_45_w6r1',
    date: '2025-01-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1045',
        productName: 'caixa de som kts-1576',
        quantity: 1,
        costPrice: 60,
        salePrice: 90,
        total: 90
      },
    ],
    clientName: 'max',
    paymentMethod: 'money',
    total: 90,
    totalCost: 60,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_46_pkhs',
    date: '2025-01-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1046',
        productName: 'PILHA SULYC AAA',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'andre',
    paymentMethod: 'money',
    total: 10,
    totalCost: 2.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_47_mrxd',
    date: '2025-01-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1268',
        productName: 'Miniteclado Tv Box',
        quantity: 1,
        costPrice: 19,
        salePrice: 34.2,
        total: 34.2
      },
    ],
    clientName: 'andre',
    paymentMethod: 'money',
    total: 30,
    totalCost: 19,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_48_34nh',
    date: '2025-01-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1057',
        productName: 'Cabo Kingo Iphone 2M Leo',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 10,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_49_xl8b',
    date: '2025-01-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1049',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 37,
        total: 37
      },
    ],
    clientName: 'andre',
    paymentMethod: 'money',
    total: 37,
    totalCost: 0,
    profit: 37,
    status: 'completed'
  },
  {
    id: 'v_25_50_4ioj',
    date: '2025-01-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1050',
        productName: 'lamapada 40w',
        quantity: 1,
        costPrice: 15,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 50,
    totalCost: 15,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_25_51_9iz1',
    date: '2025-01-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1051',
        productName: 'Lâmpada Led 9W',
        quantity: 1,
        costPrice: 4.5,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 15,
    totalCost: 4.5,
    profit: 10.5,
    status: 'completed'
  },
  {
    id: 'v_25_52_ponh',
    date: '2025-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_53_zt1w',
    date: '2025-01-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_54_icht',
    date: '2025-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 12,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.56
      },
    ],
    paymentMethod: 'money',
    total: 12,
    totalCost: 0.8400000000000001,
    profit: 11.16,
    status: 'completed'
  },
  {
    id: 'v_25_55_40bc',
    date: '2025-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1144',
        productName: 'Envelope A4',
        quantity: 1,
        costPrice: 0.39549999999999996,
        salePrice: 0.71,
        total: 0.71
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.39549999999999996,
    profit: 1.6045,
    status: 'completed'
  },
  {
    id: 'v_25_56_5lvm',
    date: '2025-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1056',
        productName: 'Manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 61.75,
        total: 61.75
      },
    ],
    paymentMethod: 'money',
    total: 61.75,
    totalCost: 0,
    profit: 61.75,
    status: 'completed'
  },
  {
    id: 'v_25_57_qo9g',
    date: '2025-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1057',
        productName: 'Manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 0,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_58_b8xx',
    date: '2025-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1058',
        productName: 'Carregador completo tipoc LE-285CC',
        quantity: 1,
        costPrice: 11,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 11,
    profit: 19,
    status: 'completed'
  },
  {
    id: 'v_25_59_uq9t',
    date: '2025-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1059',
        productName: 'Máquina De Cabelo Dragão',
        quantity: 1,
        costPrice: 18,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'hugo Som',
    paymentMethod: 'money',
    total: 20,
    totalCost: 18,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_25_60_wfd1',
    date: '2025-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1173',
        productName: 'Fonte Tv Box 5V',
        quantity: 1,
        costPrice: 7,
        salePrice: 12.6,
        total: 12.6
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 7,
    profit: 18,
    status: 'completed'
  },
  {
    id: 'v_25_61_5var',
    date: '2025-01-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1061',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_62_qna6',
    date: '2025-01-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_63_wjfw',
    date: '2025-01-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1063',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'serrat',
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_64_h2uh',
    date: '2025-01-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1064',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 35,
        total: 35
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 0,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_25_65_7myj',
    date: '2025-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 15,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.9500000000000002
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 1.05,
    profit: 13.95,
    status: 'completed'
  },
  {
    id: 'v_25_66_7nsq',
    date: '2025-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1066',
        productName: 'ring light',
        quantity: 1,
        costPrice: 50,
        salePrice: 70,
        total: 70
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 70,
    totalCost: 50,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_67_0onb',
    date: '2025-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1032',
        productName: 'Cabeça Carregador 3.1A Ka-5601',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 15,
    totalCost: 6,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_68_wd19',
    date: '2025-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 15,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.9500000000000002
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 1.05,
    profit: 13.95,
    status: 'completed'
  },
  {
    id: 'v_25_69_zpii',
    date: '2025-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1069',
        productName: 'Pendrive 16gb AL-U-16',
        quantity: 1,
        costPrice: 13,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 13,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_70_c7ql',
    date: '2025-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_71_u369',
    date: '2025-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1013',
        productName: 'Adaptador Wifi 2.5G',
        quantity: 1,
        costPrice: 11,
        salePrice: 19.8,
        total: 19.8
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 11,
    profit: 19,
    status: 'completed'
  },
  {
    id: 'v_25_72_efi2',
    date: '2025-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1123',
        productName: 'Computadores',
        quantity: 1,
        costPrice: 0,
        salePrice: 600,
        total: 600
      },
    ],
    paymentMethod: 'money',
    total: 600,
    totalCost: 0,
    profit: 600,
    status: 'completed'
  },
  {
    id: 'v_25_73_zvy1',
    date: '2025-01-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1073',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18,
        salePrice: 25,
        total: 25
      },
    ],
    clientName: 'RELOGIO',
    paymentMethod: 'money',
    total: 25,
    totalCost: 18,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_74_icfn',
    date: '2025-01-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1148',
        productName: 'Fone De Ouvido Gamr Q0008',
        quantity: 1,
        costPrice: 20,
        salePrice: 36,
        total: 36
      },
    ],
    clientName: 'Tauan',
    paymentMethod: 'money',
    total: 60,
    totalCost: 20,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_75_43rn',
    date: '2025-01-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 55,
        total: 55
      },
    ],
    clientName: 'Tauan',
    paymentMethod: 'money',
    total: 55,
    totalCost: 0,
    profit: 55,
    status: 'completed'
  },
  {
    id: 'v_25_76_n2kb',
    date: '2025-01-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1252',
        productName: 'Memoria',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'Tauan',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_77_x42p',
    date: '2025-01-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'senhora feira',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_78_mxrf',
    date: '2025-01-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'Cliente tabela',
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_79_ux6r',
    date: '2025-01-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1079',
        productName: 'fita dupla face',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_80_haua',
    date: '2025-01-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'loja senhor',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_81_lgkr',
    date: '2025-01-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1081',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_82_5zla',
    date: '2025-01-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1153',
        productName: 'Fone Fon30024 Inova',
        quantity: 1,
        costPrice: 8,
        salePrice: 14.4,
        total: 14.4
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 8,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_83_kj29',
    date: '2025-01-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1245',
        productName: 'Luvinha De Dedo',
        quantity: 4,
        costPrice: 1,
        salePrice: 1.8,
        total: 7.2
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 4,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_84_pmvr',
    date: '2025-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1058',
        productName: 'Cabo Kingo Tc 1M',
        quantity: 1,
        costPrice: 7,
        salePrice: 12.6,
        total: 12.6
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 7,
    profit: 13,
    status: 'completed'
  },
  {
    id: 'v_25_85_053n',
    date: '2025-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1323',
        productName: 'Suporte Veicular Retrovisor B-Max',
        quantity: 1,
        costPrice: 11,
        salePrice: 19.8,
        total: 19.8
      },
    ],
    clientName: 'marcelo pai',
    paymentMethod: 'money',
    total: 30,
    totalCost: 11,
    profit: 19,
    status: 'completed'
  },
  {
    id: 'v_25_86_rawk',
    date: '2025-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1086',
        productName: 'Fone Simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_87_chq4',
    date: '2025-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1171',
        productName: 'Fonte Notebook Grasep',
        quantity: 1,
        costPrice: 32,
        salePrice: 57.6,
        total: 57.6
      },
    ],
    clientName: 'cliente viviane',
    paymentMethod: 'money',
    total: 70,
    totalCost: 30,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_88_stez',
    date: '2025-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'cliente viviane',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_89_6pxv',
    date: '2025-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1089',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 45,
        total: 45
      },
    ],
    paymentMethod: 'money',
    total: 45,
    totalCost: 0,
    profit: 45,
    status: 'completed'
  },
  {
    id: 'v_25_90_92eh',
    date: '2025-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1090',
        productName: 'SSD 220gb',
        quantity: 1,
        costPrice: 0,
        salePrice: 250,
        total: 250
      },
    ],
    clientName: 'cliente viviane',
    paymentMethod: 'money',
    total: 250,
    totalCost: 0,
    profit: 250,
    status: 'completed'
  },
  {
    id: 'v_25_91_qqrz',
    date: '2025-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1171',
        productName: 'Fonte Notebook Grasep',
        quantity: 1,
        costPrice: 32,
        salePrice: 57.6,
        total: 57.6
      },
    ],
    paymentMethod: 'money',
    total: 68,
    totalCost: 38,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_92_bru2',
    date: '2025-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1123',
        productName: 'Computadores',
        quantity: 1,
        costPrice: 0,
        salePrice: 140,
        total: 140
      },
    ],
    clientName: 'Senhor relogio',
    paymentMethod: 'money',
    total: 140,
    totalCost: 0,
    profit: 140,
    status: 'completed'
  },
  {
    id: 'v_25_93_511l',
    date: '2025-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1120',
        productName: 'Chip Recarregado',
        quantity: 1,
        costPrice: 17,
        salePrice: 30.6,
        total: 30.6
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_94_bwuu',
    date: '2025-02-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1120',
        productName: 'Chip Recarregado',
        quantity: 1,
        costPrice: 17,
        salePrice: 30.6,
        total: 30.6
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_95_ywwo',
    date: '2025-02-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1157',
        productName: 'Fone M10',
        quantity: 1,
        costPrice: 18,
        salePrice: 32.4,
        total: 32.4
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 18,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_25_96_yv54',
    date: '2025-02-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1160',
        productName: 'Fone Pmcell Fo-11',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    paymentMethod: 'money',
    total: 45,
    totalCost: 3.5,
    profit: 41.5,
    status: 'completed'
  },
  {
    id: 'v_25_97_8j0g',
    date: '2025-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1081',
        productName: 'Capinha',
        quantity: 3,
        costPrice: 3,
        salePrice: 5.4,
        total: 16.200000000000003
      },
    ],
    clientName: 'marcellin',
    paymentMethod: 'money',
    total: 45,
    totalCost: 18,
    profit: 27,
    status: 'completed'
  },
  {
    id: 'v_25_98_5emg',
    date: '2025-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1056',
        productName: 'Cabo Kingo Iphone 1M',
        quantity: 1,
        costPrice: 7,
        salePrice: 12.6,
        total: 12.6
      },
    ],
    clientName: 'marcellin',
    paymentMethod: 'money',
    total: 15,
    totalCost: 7,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_99_i59g',
    date: '2025-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1172',
        productName: 'Fonte Pc 200W',
        quantity: 1,
        costPrice: 60,
        salePrice: 108,
        total: 108
      },
    ],
    paymentMethod: 'money',
    total: 110,
    totalCost: 60,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_100_n9gz',
    date: '2025-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1100',
        productName: 'filtro de linha 7',
        quantity: 1,
        costPrice: 38,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 38,
    profit: 32,
    status: 'completed'
  },
  {
    id: 'v_25_101_ud2c',
    date: '2025-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1101',
        productName: 'Manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_102_jwdw',
    date: '2025-02-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 3,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.39
      },
    ],
    clientName: 'Cliente mateus impressao',
    paymentMethod: 'money',
    total: 3,
    totalCost: 0.21000000000000002,
    profit: 2.79,
    status: 'completed'
  },
  {
    id: 'v_25_103_i7al',
    date: '2025-02-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1287',
        productName: 'Pelicula Privacidade',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'marcellin',
    paymentMethod: 'money',
    total: 15,
    totalCost: 6,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_104_7ixn',
    date: '2025-02-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_105_thec',
    date: '2025-02-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1155',
        productName: 'Fone Iphone Hmaster Ej-56',
        quantity: 1,
        costPrice: 12,
        salePrice: 21.6,
        total: 21.6
      },
    ],
    clientName: 'Filho Serrat',
    paymentMethod: 'money',
    total: 15,
    totalCost: 12,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_106_jlu3',
    date: '2025-02-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1106',
        productName: 'Cabo v3',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'Filho Serrat',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_107_zp3i',
    date: '2025-02-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1119',
        productName: 'Chip Normal',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_108_ss1o',
    date: '2025-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_109_7t3t',
    date: '2025-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1051',
        productName: 'Cabo Iphone 20W',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'hugo Som',
    paymentMethod: 'money',
    total: 15,
    totalCost: 6,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_110_fs15',
    date: '2025-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'senhor loja',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_111_nvqf',
    date: '2025-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1111',
        productName: 'Fone Simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_112_6a6h',
    date: '2025-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1119',
        productName: 'Chip Normal',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_113_yhz2',
    date: '2025-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_114_qk7h',
    date: '2025-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 15,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.9500000000000002
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 1.05,
    profit: 13.95,
    status: 'completed'
  },
  {
    id: 'v_25_115_imhm',
    date: '2025-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1115',
        productName: 'SSD 220gb',
        quantity: 1,
        costPrice: 145,
        salePrice: 260,
        total: 260
      },
    ],
    clientName: 'Tio Fernando',
    paymentMethod: 'money',
    total: 260,
    totalCost: 145,
    profit: 115,
    status: 'completed'
  },
  {
    id: 'v_25_116_b7pg',
    date: '2025-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1116',
        productName: 'Caddy',
        quantity: 1,
        costPrice: 11,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'Tio Fernando',
    paymentMethod: 'money',
    total: 30,
    totalCost: 11,
    profit: 19,
    status: 'completed'
  },
  {
    id: 'v_25_117_tv89',
    date: '2025-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1316',
        productName: 'Suporte Magnético Veicular Barra',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 6,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_118_w8vn',
    date: '2025-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1118',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 125,
        total: 125
      },
    ],
    clientName: 'Gian',
    paymentMethod: 'money',
    total: 125,
    totalCost: 0,
    profit: 125,
    status: 'completed'
  },
  {
    id: 'v_25_119_z7h6',
    date: '2025-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1119',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 66,
        total: 66
      },
    ],
    clientName: 'cabeleiro treta',
    paymentMethod: 'money',
    total: 66,
    totalCost: 0,
    profit: 66,
    status: 'completed'
  },
  {
    id: 'v_25_120_jvaa',
    date: '2025-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    clientName: 'gata ruiva',
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_121_lff3',
    date: '2025-02-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'Helena loja',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_122_4w31',
    date: '2025-02-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_123_hunr',
    date: '2025-02-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_124_baqu',
    date: '2025-02-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1214',
        productName: 'Kit Completo Carregador 20W',
        quantity: 1,
        costPrice: 17,
        salePrice: 30.6,
        total: 30.6
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 17,
    profit: 33,
    status: 'completed'
  },
  {
    id: 'v_25_125_qmcj',
    date: '2025-02-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'brunno',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_126_itpx',
    date: '2025-02-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1252',
        productName: 'Memoria',
        quantity: 1,
        costPrice: 0,
        salePrice: 150,
        total: 150
      },
    ],
    clientName: 'brunno',
    paymentMethod: 'money',
    total: 150,
    totalCost: 0,
    profit: 150,
    status: 'completed'
  },
  {
    id: 'v_25_127_gfss',
    date: '2025-02-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_128_z7uf',
    date: '2025-02-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_129_8ysx',
    date: '2025-02-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1129',
        productName: 'Pendrive 8gb',
        quantity: 1,
        costPrice: 14,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 14,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_130_461v',
    date: '2025-02-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 0.5,
        total: 0.5
      },
    ],
    paymentMethod: 'money',
    total: 0.5,
    totalCost: 0.05,
    profit: 0.45,
    status: 'completed'
  },
  {
    id: 'v_25_131_34ko',
    date: '2025-02-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_132_fn03',
    date: '2025-02-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_133_sjze',
    date: '2025-02-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_134_r2yc',
    date: '2025-02-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 0,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_135_fv3r',
    date: '2025-02-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_136_d3us',
    date: '2025-02-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_137_8vz7',
    date: '2025-02-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1144',
        productName: 'Envelope A4',
        quantity: 1,
        costPrice: 0.39549999999999996,
        salePrice: 0.71,
        total: 0.71
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.39549999999999996,
    profit: 1.6045,
    status: 'completed'
  },
  {
    id: 'v_25_138_p7lo',
    date: '2025-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_139_jiz7',
    date: '2025-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1139',
        productName: 'Copo Stanley 500Ml',
        quantity: 1,
        costPrice: 20,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 20,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_140_s6ed',
    date: '2025-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1099',
        productName: 'Carregador Tipo C Le-484',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_141_gi5d',
    date: '2025-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1246',
        productName: 'Luvinhas Dedo N',
        quantity: 6,
        costPrice: 0.29425,
        salePrice: 0.53,
        total: 3.18
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 1.7655,
    profit: 28.2345,
    status: 'completed'
  },
  {
    id: 'v_25_142_uxrp',
    date: '2025-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1325',
        productName: 'T 3 Pontas',
        quantity: 1,
        costPrice: 1.5,
        salePrice: 2.7,
        total: 2.7
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 5,
    totalCost: 1.5,
    profit: 3.5,
    status: 'completed'
  },
  {
    id: 'v_25_143_41lg',
    date: '2025-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_144_3ehp',
    date: '2025-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_145_4wcb',
    date: '2025-02-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 2,
        costPrice: 0,
        salePrice: 15,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_146_vt1w',
    date: '2025-02-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_147_dat0',
    date: '2025-02-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1150',
        productName: 'Fone De Ouvido Lelong Le-02',
        quantity: 1,
        costPrice: 9,
        salePrice: 16.2,
        total: 16.2
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 30,
    totalCost: 9,
    profit: 21,
    status: 'completed'
  },
  {
    id: 'v_25_148_mj50',
    date: '2025-02-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 3,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.39
      },
    ],
    paymentMethod: 'money',
    total: 3,
    totalCost: 0.21000000000000002,
    profit: 2.79,
    status: 'completed'
  },
  {
    id: 'v_25_149_3o0g',
    date: '2025-02-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1183',
        productName: 'Garrafa Colorida Motivacional',
        quantity: 1,
        costPrice: 13.5,
        salePrice: 24.3,
        total: 24.3
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 25,
    totalCost: 13.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_150_jkfa',
    date: '2025-02-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 2,
        costPrice: 0,
        salePrice: 0.5,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.1,
    profit: 0.9,
    status: 'completed'
  },
  {
    id: 'v_25_151_lvhy',
    date: '2025-02-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'hugo Som',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_152_yrgy',
    date: '2025-02-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1152',
        productName: 'Climatizador Utra Air Cooler',
        quantity: 1,
        costPrice: 50,
        salePrice: 75,
        total: 75
      },
    ],
    paymentMethod: 'money',
    total: 75,
    totalCost: 50,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_153_vakr',
    date: '2025-03-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1153',
        productName: 'Cabo automotivo',
        quantity: 1,
        costPrice: 0,
        salePrice: 40,
        total: 40
      },
    ],
    clientName: 'Vici Sindico',
    paymentMethod: 'money',
    total: 40,
    totalCost: 0,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_154_w3ox',
    date: '2025-03-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_155_9pmt',
    date: '2025-03-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_156_1r4n',
    date: '2025-03-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1131',
        productName: 'Controle Tv Universal',
        quantity: 1,
        costPrice: 8.5,
        salePrice: 15.3,
        total: 15.3
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 8.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_157_nc2h',
    date: '2025-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1157',
        productName: 'SSD 120gb DF',
        quantity: 1,
        costPrice: 95,
        salePrice: 200,
        total: 200
      },
    ],
    clientName: 'Cliente pc luiz',
    paymentMethod: 'money',
    total: 200,
    totalCost: 95,
    profit: 105,
    status: 'completed'
  },
  {
    id: 'v_25_158_6m65',
    date: '2025-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1123',
        productName: 'Computadores',
        quantity: 1,
        costPrice: 0,
        salePrice: 220,
        total: 220
      },
    ],
    clientName: 'Cliente pc luiz',
    paymentMethod: 'money',
    total: 220,
    totalCost: 0,
    profit: 220,
    status: 'completed'
  },
  {
    id: 'v_25_159_bg3b',
    date: '2025-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1013',
        productName: 'Adaptador Wifi 2.5G',
        quantity: 1,
        costPrice: 11,
        salePrice: 19.8,
        total: 19.8
      },
    ],
    clientName: 'Cliente pc luiz',
    paymentMethod: 'money',
    total: 20,
    totalCost: 11,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_160_654i',
    date: '2025-03-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 14,
        total: 14
      },
    ],
    paymentMethod: 'money',
    total: 14,
    totalCost: 0,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_25_161_567x',
    date: '2025-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1099',
        productName: 'Carregador Tipo C Le-484',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_162_soo3',
    date: '2025-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1162',
        productName: 'Camera ip BM-IP170',
        quantity: 1,
        costPrice: 115,
        salePrice: 165,
        total: 165
      },
    ],
    clientName: 'Cliente Jheff',
    paymentMethod: 'money',
    total: 165,
    totalCost: 115,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_163_di4l',
    date: '2025-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'Mae hugo',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_164_rx9n',
    date: '2025-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'Cliente mateus impressao',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.07,
    profit: 1.93,
    status: 'completed'
  },
  {
    id: 'v_25_165_issa',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_166_8ax9',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_167_sh2x',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1120',
        productName: 'Chip Recarregado',
        quantity: 1,
        costPrice: 17,
        salePrice: 30.6,
        total: 30.6
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_168_arrt',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1153',
        productName: 'Fone Fon30024 Inova',
        quantity: 1,
        costPrice: 8,
        salePrice: 14.4,
        total: 14.4
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 8,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_169_hzyt',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1005',
        productName: 'Adaptador P2 Tipo C',
        quantity: 1,
        costPrice: 8,
        salePrice: 14.4,
        total: 14.4
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 8,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_170_vmai',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1135',
        productName: 'Cordao Simples Cracha',
        quantity: 1,
        costPrice: 2,
        salePrice: 3.6,
        total: 3.6
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_171_n9vk',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1135',
        productName: 'Cordao Simples Cracha',
        quantity: 1,
        costPrice: 2,
        salePrice: 3.6,
        total: 3.6
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_172_6nox',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1172',
        productName: 'jogo ps2',
        quantity: 6,
        costPrice: 0,
        salePrice: 4,
        total: 24
      },
    ],
    paymentMethod: 'money',
    total: 24,
    totalCost: 0,
    profit: 24,
    status: 'completed'
  },
  {
    id: 'v_25_173_mom3',
    date: '2025-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1173',
        productName: 'Tv box 5g',
        quantity: 1,
        costPrice: 105,
        salePrice: 165,
        total: 165
      },
    ],
    clientName: 'serrat',
    paymentMethod: 'money',
    total: 165,
    totalCost: 105,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_25_174_g3zx',
    date: '2025-03-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1331',
        productName: 'Triturador De Alimentos Manual Grande',
        quantity: 1,
        costPrice: 11,
        salePrice: 19.8,
        total: 19.8
      },
    ],
    clientName: 'Magdar',
    paymentMethod: 'money',
    total: 20,
    totalCost: 11,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_175_0hmj',
    date: '2025-03-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1175',
        productName: 'Teaser Azul',
        quantity: 1,
        costPrice: 40,
        salePrice: 85,
        total: 85
      },
    ],
    paymentMethod: 'money',
    total: 85,
    totalCost: 40,
    profit: 45,
    status: 'completed'
  },
  {
    id: 'v_25_176_mel3',
    date: '2025-03-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1038',
        productName: 'Cabo De Dados V8 Kapbom Kap 1Mv8',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    clientName: 'Mae hugo',
    paymentMethod: 'money',
    total: 5,
    totalCost: 3.5,
    profit: 1.5,
    status: 'completed'
  },
  {
    id: 'v_25_177_yx7n',
    date: '2025-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_178_eqhk',
    date: '2025-03-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1246',
        productName: 'Luvinhas Dedo N',
        quantity: 2,
        costPrice: 0.29425,
        salePrice: 0.53,
        total: 1.06
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0.5885,
    profit: 9.4115,
    status: 'completed'
  },
  {
    id: 'v_25_179_317v',
    date: '2025-03-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 2,
        costPrice: 0,
        salePrice: 0.5,
        total: 1
      },
    ],
    clientName: 'Luna otica',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.1,
    profit: 0.9,
    status: 'completed'
  },
  {
    id: 'v_25_180_rx68',
    date: '2025-03-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_181_uczm',
    date: '2025-03-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1181',
        productName: 'cadeado medio',
        quantity: 1,
        costPrice: 10,
        salePrice: 25,
        total: 25
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 25,
    totalCost: 10,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_182_i9fs',
    date: '2025-03-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1182',
        productName: 'Caixa de som Grasep D-S4145',
        quantity: 1,
        costPrice: 58,
        salePrice: 100,
        total: 100
      },
    ],
    clientName: 'Luna otica',
    paymentMethod: 'money',
    total: 100,
    totalCost: 58,
    profit: 42,
    status: 'completed'
  },
  {
    id: 'v_25_183_o8xe',
    date: '2025-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1038',
        productName: 'Cabo De Dados V8 Kapbom Kap 1Mv8',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3.5,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_25_184_bj8k',
    date: '2025-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1246',
        productName: 'Luvinhas Dedo N',
        quantity: 2,
        costPrice: 0.29425,
        salePrice: 0.53,
        total: 1.06
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0.5885,
    profit: 14.4115,
    status: 'completed'
  },
  {
    id: 'v_25_185_b18i',
    date: '2025-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1185',
        productName: 'Fire TV Stick',
        quantity: 1,
        costPrice: 250,
        salePrice: 315,
        total: 315
      },
    ],
    clientName: 'teinha',
    paymentMethod: 'money',
    total: 315,
    totalCost: 250,
    profit: 65,
    status: 'completed'
  },
  {
    id: 'v_25_186_feoq',
    date: '2025-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    clientName: 'Cliente LUKMAN🏅',
    paymentMethod: 'money',
    total: 25,
    totalCost: 0,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_187_ni84',
    date: '2025-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_188_bqzi',
    date: '2025-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1120',
        productName: 'Chip Recarregado',
        quantity: 1,
        costPrice: 17,
        salePrice: 30.6,
        total: 30.6
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_189_8t2v',
    date: '2025-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1157',
        productName: 'Fone M10',
        quantity: 1,
        costPrice: 18,
        salePrice: 32.4,
        total: 32.4
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 18,
    profit: 22,
    status: 'completed'
  },
  {
    id: 'v_25_190_jg2z',
    date: '2025-03-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1190',
        productName: 'Cabo RCA',
        quantity: 1,
        costPrice: 20,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_191_cbhc',
    date: '2025-03-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_192_zg7c',
    date: '2025-03-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 27.67,
        total: 27.67
      },
    ],
    clientName: 'Luna otica',
    paymentMethod: 'money',
    total: 27.67,
    totalCost: 0,
    profit: 27.67,
    status: 'completed'
  },
  {
    id: 'v_25_193_e1id',
    date: '2025-03-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 2,
        costPrice: 0,
        salePrice: 0.5,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.1,
    profit: 0.9,
    status: 'completed'
  },
  {
    id: 'v_25_194_k504',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'cunhada',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_195_e31c',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 2,
        costPrice: 0,
        salePrice: 0.5,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.1,
    profit: 0.9,
    status: 'completed'
  },
  {
    id: 'v_25_196_0vmc',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1160',
        productName: 'Fone Pmcell Fo-11',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    clientName: 'cunhada',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3.5,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_25_197_zyr1',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1197',
        productName: 'Canivete multifuncional',
        quantity: 1,
        costPrice: 18.48,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'marcellin',
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.48,
    profit: 11.52,
    status: 'completed'
  },
  {
    id: 'v_25_198_2vxg',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1198',
        productName: 'Rosa lampada',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'marcellin',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_199_nly2',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1115',
        productName: 'Chave Tork 8Pçs Lst08',
        quantity: 1,
        costPrice: 11.5,
        salePrice: 20.7,
        total: 20.7
      },
    ],
    clientName: 'marcellin',
    paymentMethod: 'money',
    total: 15,
    totalCost: 11.5,
    profit: 3.5,
    status: 'completed'
  },
  {
    id: 'v_25_200_qq51',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1214',
        productName: 'Kit Completo Carregador 20W',
        quantity: 1,
        costPrice: 17,
        salePrice: 30.6,
        total: 30.6
      },
    ],
    clientName: 'gian',
    paymentMethod: 'money',
    total: 35,
    totalCost: 17,
    profit: 18,
    status: 'completed'
  },
  {
    id: 'v_25_201_xjds',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1201',
        productName: 'Carregador por indução 15w',
        quantity: 1,
        costPrice: 23,
        salePrice: 35,
        total: 35
      },
    ],
    clientName: 'gian',
    paymentMethod: 'money',
    total: 35,
    totalCost: 23,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_202_3w06',
    date: '2025-03-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1320',
        productName: 'Suporte Veicular',
        quantity: 1,
        costPrice: 12,
        salePrice: 21.6,
        total: 21.6
      },
    ],
    clientName: 'gian',
    paymentMethod: 'money',
    total: 25,
    totalCost: 12,
    profit: 13,
    status: 'completed'
  },
  {
    id: 'v_25_203_9ogb',
    date: '2025-03-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'Magdar',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_204_s9mg',
    date: '2025-03-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1204',
        productName: 'smartwatch s2',
        quantity: 2,
        costPrice: 50,
        salePrice: 100,
        total: 200
      },
    ],
    clientName: 'gian',
    paymentMethod: 'money',
    total: 200,
    totalCost: 100,
    profit: 100,
    status: 'completed'
  },
  {
    id: 'v_25_205_d9eq',
    date: '2025-03-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1171',
        productName: 'Fonte Notebook Grasep',
        quantity: 1,
        costPrice: 32,
        salePrice: 57.6,
        total: 57.6
      },
    ],
    clientName: 'Cliente Cesar Augusto',
    paymentMethod: 'money',
    total: 49,
    totalCost: 32,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_206_7ftg',
    date: '2025-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 2,
        costPrice: 0,
        salePrice: 0.5,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.1,
    profit: 0.9,
    status: 'completed'
  },
  {
    id: 'v_25_207_0qc7',
    date: '2025-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_208_mvze',
    date: '2025-03-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'Magdar',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_209_s3t7',
    date: '2025-03-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1144',
        productName: 'Envelope A4',
        quantity: 1,
        costPrice: 0.39549999999999996,
        salePrice: 0.71,
        total: 0.71
      },
    ],
    clientName: 'Magdar',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.39549999999999996,
    profit: 1.6045,
    status: 'completed'
  },
  {
    id: 'v_25_210_alwq',
    date: '2025-03-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 6,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.78
      },
    ],
    paymentMethod: 'money',
    total: 6,
    totalCost: 0.42000000000000004,
    profit: 5.58,
    status: 'completed'
  },
  {
    id: 'v_25_211_f33j',
    date: '2025-03-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_212_36q2',
    date: '2025-03-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'relogio',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_213_on1w',
    date: '2025-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1213',
        productName: 'Aspirador 95000pa',
        quantity: 1,
        costPrice: 66.23,
        salePrice: 100,
        total: 100
      },
    ],
    clientName: 'Senhor relogio',
    paymentMethod: 'money',
    total: 100,
    totalCost: 66.23,
    profit: 33.769999999999996,
    status: 'completed'
  },
  {
    id: 'v_25_214_obyr',
    date: '2025-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 0.5,
        total: 0.5
      },
    ],
    paymentMethod: 'money',
    total: 0.5,
    totalCost: 0.05,
    profit: 0.45,
    status: 'completed'
  },
  {
    id: 'v_25_215_irng',
    date: '2025-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 0.5,
        total: 0.5
      },
    ],
    clientName: 'Lanchonete',
    paymentMethod: 'money',
    total: 0.5,
    totalCost: 0.05,
    profit: 0.45,
    status: 'completed'
  },
  {
    id: 'v_25_216_pwq3',
    date: '2025-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1198',
        productName: 'Isqueiro Auto',
        quantity: 1,
        costPrice: 0.8,
        salePrice: 1.44,
        total: 1.44
      },
    ],
    clientName: 'Lanchonete',
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.8,
    profit: 3.2,
    status: 'completed'
  },
  {
    id: 'v_25_217_tm3s',
    date: '2025-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_218_sqce',
    date: '2025-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1218',
        productName: 'Pendrive lenovo 16gb',
        quantity: 1,
        costPrice: 15.9,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15.9,
    profit: 14.1,
    status: 'completed'
  },
  {
    id: 'v_25_219_gh3v',
    date: '2025-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1120',
        productName: 'Chip Recarregado',
        quantity: 1,
        costPrice: 17,
        salePrice: 30.6,
        total: 30.6
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 18,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_220_60me',
    date: '2025-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1029',
        productName: 'Boneco Lego',
        quantity: 2,
        costPrice: 15,
        salePrice: 27,
        total: 54
      },
    ],
    clientName: 'Lanchonete 13',
    paymentMethod: 'money',
    total: 10,
    totalCost: 30,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_221_k2wc',
    date: '2025-03-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1221',
        productName: 'Cabo hdmi',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_222_u9c2',
    date: '2025-03-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'cliente codhab',
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_223_h5hr',
    date: '2025-03-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1144',
        productName: 'Envelope A4',
        quantity: 1,
        costPrice: 0.39549999999999996,
        salePrice: 0.71,
        total: 0.71
      },
    ],
    clientName: 'cliente codhab',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.39549999999999996,
    profit: 1.6045,
    status: 'completed'
  },
  {
    id: 'v_25_224_nlem',
    date: '2025-03-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 3,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.39
      },
    ],
    clientName: 'cliente codhab',
    paymentMethod: 'money',
    total: 3,
    totalCost: 0.21000000000000002,
    profit: 2.79,
    status: 'completed'
  },
  {
    id: 'v_25_225_1dob',
    date: '2025-03-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1038',
        productName: 'Cabo De Dados V8 Kapbom Kap 1Mv8',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3.5,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_25_226_1nxe',
    date: '2025-03-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_227_kjjk',
    date: '2025-03-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 0.5,
        total: 0.5
      },
    ],
    paymentMethod: 'money',
    total: 0.5,
    totalCost: 0.05,
    profit: 0.45,
    status: 'completed'
  },
  {
    id: 'v_25_228_yk2q',
    date: '2025-03-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_229_udme',
    date: '2025-03-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_230_0fl8',
    date: '2025-03-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_231_ffmk',
    date: '2025-03-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 10,
        costPrice: 0,
        salePrice: 0.5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.5,
    profit: 4.5,
    status: 'completed'
  },
  {
    id: 'v_25_232_ahdi',
    date: '2025-03-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 0.5,
        total: 0.5
      },
    ],
    paymentMethod: 'money',
    total: 0.5,
    totalCost: 0.05,
    profit: 0.45,
    status: 'completed'
  },
  {
    id: 'v_25_233_ilja',
    date: '2025-03-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1123',
        productName: 'Computadores',
        quantity: 1,
        costPrice: 0,
        salePrice: 130,
        total: 130
      },
    ],
    paymentMethod: 'money',
    total: 130,
    totalCost: 0,
    profit: 130,
    status: 'completed'
  },
  {
    id: 'v_25_234_95bb',
    date: '2025-04-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1234',
        productName: 'Controle Rossi quadrado',
        quantity: 1,
        costPrice: 42,
        salePrice: 70,
        total: 70
      },
    ],
    clientName: 'relogio',
    paymentMethod: 'money',
    total: 70,
    totalCost: 42,
    profit: 28,
    status: 'completed'
  },
  {
    id: 'v_25_235_w82k',
    date: '2025-04-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1235',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    clientName: 'loja',
    paymentMethod: 'money',
    total: 25,
    totalCost: 0,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_236_ff12',
    date: '2025-04-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_237_jyql',
    date: '2025-04-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_238_pjyq',
    date: '2025-04-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1099',
        productName: 'Carregador Tipo C Le-484',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    clientName: 'kadu',
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_239_x643',
    date: '2025-04-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1239',
        productName: 'cabo iphonehb10-2 Iphone',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'kadu',
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_240_j5mo',
    date: '2025-04-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1245',
        productName: 'Luvinha De Dedo',
        quantity: 4,
        costPrice: 1,
        salePrice: 1.8,
        total: 7.2
      },
    ],
    clientName: 'Cliente Luva Olliver',
    paymentMethod: 'money',
    total: 20,
    totalCost: 4,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_241_yzvx',
    date: '2025-04-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1241',
        productName: 'bluetooth USB 5.0',
        quantity: 1,
        costPrice: 9,
        salePrice: 26,
        total: 26
      },
    ],
    clientName: 'Cliente Placa Mãe Felipe',
    paymentMethod: 'money',
    total: 26,
    totalCost: 9,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_242_unea',
    date: '2025-04-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 3,
        costPrice: 0,
        salePrice: 1,
        total: 3
      },
    ],
    paymentMethod: 'money',
    total: 3,
    totalCost: 0.15000000000000002,
    profit: 2.85,
    status: 'completed'
  },
  {
    id: 'v_25_243_m3lb',
    date: '2025-04-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 1,
        total: 1
      },
    ],
    clientName: 'lanchonete',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.05,
    profit: 0.95,
    status: 'completed'
  },
  {
    id: 'v_25_244_97rc',
    date: '2025-04-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1068',
        productName: 'Cabo Verde',
        quantity: 1,
        costPrice: 15,
        salePrice: 27,
        total: 27
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 15,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_245_4qkk',
    date: '2025-04-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1258',
        productName: 'Mini Caixa De Som Cs2C',
        quantity: 1,
        costPrice: 23,
        salePrice: 41.4,
        total: 41.4
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 23,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_246_kjd0',
    date: '2025-04-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_247_t2mf',
    date: '2025-04-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_248_uw5h',
    date: '2025-04-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 1,
        total: 1
      },
    ],
    clientName: 'lanchonete',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.05,
    profit: 0.95,
    status: 'completed'
  },
  {
    id: 'v_25_249_vxwh',
    date: '2025-04-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1292',
        productName: 'Porta Cracha Completo',
        quantity: 1,
        costPrice: 4,
        salePrice: 7.2,
        total: 7.2
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_250_rozd',
    date: '2025-04-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1157',
        productName: 'Fone M10',
        quantity: 1,
        costPrice: 18,
        salePrice: 32.4,
        total: 32.4
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 18,
    profit: 22,
    status: 'completed'
  },
  {
    id: 'v_25_251_46gx',
    date: '2025-04-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1257',
        productName: 'Mini Antena Digital',
        quantity: 1,
        costPrice: 13,
        salePrice: 23.4,
        total: 23.4
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 13,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_252_krfl',
    date: '2025-04-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1234',
        productName: 'Lego Pequeno',
        quantity: 1,
        costPrice: 2,
        salePrice: 3.6,
        total: 3.6
      },
    ],
    paymentMethod: 'money',
    total: 7,
    totalCost: 2,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_253_yhz3',
    date: '2025-04-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1253',
        productName: 'Cabo Colorido 2 Metros V8',
        quantity: 1,
        costPrice: 5.5,
        salePrice: 8,
        total: 8
      },
    ],
    paymentMethod: 'money',
    total: 8,
    totalCost: 5.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_254_h12h',
    date: '2025-04-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_255_81aa',
    date: '2025-04-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 3,
        costPrice: 0,
        salePrice: 10,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_256_fk14',
    date: '2025-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 12,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.56
      },
    ],
    paymentMethod: 'money',
    total: 12,
    totalCost: 0.8400000000000001,
    profit: 11.16,
    status: 'completed'
  },
  {
    id: 'v_25_257_5lca',
    date: '2025-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1257',
        productName: 'Climatizador Bommxax Pro',
        quantity: 1,
        costPrice: 45,
        salePrice: 65,
        total: 65
      },
    ],
    clientName: 'Luna otica',
    paymentMethod: 'money',
    total: 65,
    totalCost: 45,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_258_wykn',
    date: '2025-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1086',
        productName: 'Carregador Cabeça  Spartan  - Cw-178',
        quantity: 1,
        costPrice: 12,
        salePrice: 21.6,
        total: 21.6
      },
    ],
    clientName: 'val manicure',
    paymentMethod: 'money',
    total: 30,
    totalCost: 12,
    profit: 18,
    status: 'completed'
  },
  {
    id: 'v_25_259_kmb3',
    date: '2025-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1259',
        productName: 'cabo iphonehb10-3 tipo c',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'val manicure',
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_260_27vi',
    date: '2025-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'maura',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_261_62c4',
    date: '2025-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 60,
        total: 60
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 0,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_25_262_btj7',
    date: '2025-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_263_qnpw',
    date: '2025-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1149',
        productName: 'Fone De Ouvido Inova Fon-30063',
        quantity: 1,
        costPrice: 8,
        salePrice: 14.4,
        total: 14.4
      },
    ],
    clientName: 'Mae hugo',
    paymentMethod: 'money',
    total: 15,
    totalCost: 8,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_264_xvoe',
    date: '2025-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1264',
        productName: 'switch 24 portas',
        quantity: 1,
        costPrice: 0,
        salePrice: 150,
        total: 150
      },
    ],
    clientName: 'raquel 604',
    paymentMethod: 'money',
    total: 150,
    totalCost: 0,
    profit: 150,
    status: 'completed'
  },
  {
    id: 'v_25_265_9t0g',
    date: '2025-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1234',
        productName: 'Lego Pequeno',
        quantity: 2,
        costPrice: 2,
        salePrice: 3.6,
        total: 7.2
      },
    ],
    clientName: 'meninos',
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_266_k7am',
    date: '2025-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1266',
        productName: 'Pc dell completo ssd 240 monitor 20ppl',
        quantity: 1,
        costPrice: 0,
        salePrice: 300,
        total: 300
      },
    ],
    clientName: 'cliente Michael Moura',
    paymentMethod: 'money',
    total: 300,
    totalCost: 0,
    profit: 300,
    status: 'completed'
  },
  {
    id: 'v_25_267_l1n2',
    date: '2025-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_268_jxy4',
    date: '2025-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'Karol G',
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_269_c1vg',
    date: '2025-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1245',
        productName: 'Luvinha De Dedo',
        quantity: 4,
        costPrice: 1,
        salePrice: 1.8,
        total: 7.2
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 4,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_270_t1l9',
    date: '2025-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1198',
        productName: 'Isqueiro Auto',
        quantity: 1,
        costPrice: 0.8,
        salePrice: 1.44,
        total: 1.44
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.8,
    profit: 4.2,
    status: 'completed'
  },
  {
    id: 'v_25_271_obv1',
    date: '2025-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1094',
        productName: 'Carregador Lehmox 5.1 Le-82',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 25,
    totalCost: 10,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_272_gdky',
    date: '2025-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1272',
        productName: 'lego pequeno Grande',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'meninos',
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_273_oyl7',
    date: '2025-04-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1273',
        productName: 'Climatizador onistek',
        quantity: 1,
        costPrice: 35,
        salePrice: 65,
        total: 65
      },
    ],
    clientName: 'Magdar',
    paymentMethod: 'money',
    total: 65,
    totalCost: 35,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_274_o3hz',
    date: '2025-04-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_275_7wqa',
    date: '2025-04-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 7,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.91
      },
    ],
    paymentMethod: 'money',
    total: 7,
    totalCost: 0.49000000000000005,
    profit: 6.51,
    status: 'completed'
  },
  {
    id: 'v_25_276_u5tp',
    date: '2025-04-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 1,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.05,
    profit: 0.95,
    status: 'completed'
  },
  {
    id: 'v_25_277_fdvh',
    date: '2025-04-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1277',
        productName: 'Pc Lenovo i7 completo monitor 19ppl',
        quantity: 1,
        costPrice: 0,
        salePrice: 200,
        total: 200
      },
    ],
    clientName: 'MARCOS PORTELA',
    paymentMethod: 'money',
    total: 200,
    totalCost: 0,
    profit: 200,
    status: 'completed'
  },
  {
    id: 'v_25_278_n4ya',
    date: '2025-04-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1278',
        productName: 'biscoito mae Grande',
        quantity: 4,
        costPrice: 10,
        salePrice: 10,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 40,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_279_rlaz',
    date: '2025-04-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1279',
        productName: 'biscoito mae Pequeno',
        quantity: 3,
        costPrice: 0,
        salePrice: 5,
        total: 15
      },
    ],
    clientName: 'Mae hugo',
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_280_5mef',
    date: '2025-04-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1099',
        productName: 'Carregador Tipo C Le-484',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    clientName: 'lanchonete',
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_281_27c6',
    date: '2025-04-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 11,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.4300000000000002
      },
    ],
    paymentMethod: 'money',
    total: 11,
    totalCost: 0.77,
    profit: 10.23,
    status: 'completed'
  },
  {
    id: 'v_25_282_v26r',
    date: '2025-04-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_283_1ix7',
    date: '2025-04-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1283',
        productName: 'biscoito mae Grande',
        quantity: 1,
        costPrice: 10,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 10,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_284_11kl',
    date: '2025-04-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1276',
        productName: 'Mouse B-Max',
        quantity: 1,
        costPrice: 5.5,
        salePrice: 9.9,
        total: 9.9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5.5,
    profit: 4.5,
    status: 'completed'
  },
  {
    id: 'v_25_285_19dn',
    date: '2025-04-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1171',
        productName: 'Fonte Notebook Grasep',
        quantity: 1,
        costPrice: 32,
        salePrice: 57.6,
        total: 57.6
      },
    ],
    paymentMethod: 'money',
    total: 65,
    totalCost: 32,
    profit: 33,
    status: 'completed'
  },
  {
    id: 'v_25_286_ckpt',
    date: '2025-04-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'Luna otica',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_287_vje9',
    date: '2025-04-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1211',
        productName: 'Kit Chaves 6024A',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    clientName: 'Luna otica',
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_288_dgoa',
    date: '2025-04-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 1,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.05,
    profit: 0.95,
    status: 'completed'
  },
  {
    id: 'v_25_289_ygfw',
    date: '2025-04-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1234',
        productName: 'Lego Pequeno',
        quantity: 4,
        costPrice: 2,
        salePrice: 3.6,
        total: 14.4
      },
    ],
    clientName: 'Cliente Dayane Evangelista',
    paymentMethod: 'money',
    total: 20,
    totalCost: 8,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_290_ftis',
    date: '2025-04-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 44,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 5.720000000000001
      },
    ],
    clientName: 'Cliente Dayane Evangelista',
    paymentMethod: 'money',
    total: 22,
    totalCost: 3.08,
    profit: 18.92,
    status: 'completed'
  },
  {
    id: 'v_25_291_admk',
    date: '2025-04-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1291',
        productName: 'Máquina De Cabelo Dragão',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'Cliente Jeisson Máquina De Cabelo',
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_292_afz2',
    date: '2025-04-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'senhor loja',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_293_x8v5',
    date: '2025-04-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1293',
        productName: 'biscoito mae Grande',
        quantity: 3,
        costPrice: 10,
        salePrice: 10,
        total: 30
      },
    ],
    clientName: 'Mae hugo',
    paymentMethod: 'money',
    total: 30,
    totalCost: 30,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_294_wb3c',
    date: '2025-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1294',
        productName: 'Amendoin doce',
        quantity: 1,
        costPrice: 5,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 5,
    totalCost: 5,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_295_lq7i',
    date: '2025-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1295',
        productName: 'Carregador Completo Spartan 3 V8 Cw-Xg20-V8',
        quantity: 1,
        costPrice: 10,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'Luna otica',
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_296_00ns',
    date: '2025-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1296',
        productName: 'biscoito mae Grande',
        quantity: 1,
        costPrice: 10,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'Luna otica',
    paymentMethod: 'money',
    total: 10,
    totalCost: 10,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_297_4ece',
    date: '2025-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1297',
        productName: 'biscoito mae Grande',
        quantity: 1,
        costPrice: 10,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'Magdar',
    paymentMethod: 'money',
    total: 10,
    totalCost: 10,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_298_44i5',
    date: '2025-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1298',
        productName: 'biscoito mae Grande',
        quantity: 1,
        costPrice: 10,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'Helena loja',
    paymentMethod: 'money',
    total: 10,
    totalCost: 10,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_299_bu5d',
    date: '2025-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1299',
        productName: 'Amendoin doce',
        quantity: 1,
        costPrice: 5,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'Helena loja',
    paymentMethod: 'money',
    total: 5,
    totalCost: 5,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_300_uejt',
    date: '2025-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1300',
        productName: 'biscoito mae Grande',
        quantity: 1,
        costPrice: 10,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'francisco chaveiro',
    paymentMethod: 'money',
    total: 10,
    totalCost: 10,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_301_4gqy',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_302_7ie6',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1302',
        productName: 'Jogos PS2',
        quantity: 3,
        costPrice: 2.5,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_303_uqn2',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1119',
        productName: 'Chip Normal',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 10,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_304_o8p7',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 1,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.05,
    profit: 0.95,
    status: 'completed'
  },
  {
    id: 'v_25_305_3vfj',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 97,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 12.610000000000001
      },
    ],
    paymentMethod: 'money',
    total: 48.5,
    totalCost: 6.790000000000001,
    profit: 41.71,
    status: 'completed'
  },
  {
    id: 'v_25_306_3qql',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_307_p8ci',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1153',
        productName: 'Fone Fon30024 Inova',
        quantity: 1,
        costPrice: 8,
        salePrice: 14.4,
        total: 14.4
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 8,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_308_qopa',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1308',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 2020,
        total: 2020
      },
    ],
    clientName: 'Colegio 604',
    paymentMethod: 'money',
    total: 2020,
    totalCost: 0,
    profit: 2020,
    status: 'completed'
  },
  {
    id: 'v_25_309_s3y8',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1309',
        productName: 'biscoito mae Grande',
        quantity: 2,
        costPrice: 10,
        salePrice: 10,
        total: 20
      },
    ],
    clientName: 'Mae hugo',
    paymentMethod: 'money',
    total: 20,
    totalCost: 20,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_310_c9tr',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1310',
        productName: 'biscoito mae Grande',
        quantity: 1,
        costPrice: 10,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'lanchonete',
    paymentMethod: 'money',
    total: 10,
    totalCost: 10,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_311_g3xh',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_312_ftn6',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    paymentMethod: 'money',
    total: 400,
    totalCost: 270,
    profit: 130,
    status: 'completed'
  },
  {
    id: 'v_25_313_1kby',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1313',
        productName: 'biscoito mae Grande',
        quantity: 2,
        costPrice: 10,
        salePrice: 7.5,
        total: 15
      },
    ],
    clientName: 'francisca lanchonete',
    paymentMethod: 'money',
    total: 15,
    totalCost: 20,
    profit: -5,
    status: 'completed'
  },
  {
    id: 'v_25_314_x4ju',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1314',
        productName: 'Amendoin doce',
        quantity: 1,
        costPrice: 5,
        salePrice: 3,
        total: 3
      },
    ],
    clientName: 'francisca lanchonete',
    paymentMethod: 'money',
    total: 3,
    totalCost: 5,
    profit: -2,
    status: 'completed'
  },
  {
    id: 'v_25_315_2w9l',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1189',
        productName: 'Globo De Luz  Sem Controle',
        quantity: 2,
        costPrice: 30,
        salePrice: 54,
        total: 108
      },
    ],
    clientName: 'Cliente Manoel G Sousa',
    paymentMethod: 'money',
    total: 110,
    totalCost: 60,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_316_m0un',
    date: '2025-04-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_317_osbv',
    date: '2025-04-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1317',
        productName: 'taser azul',
        quantity: 1,
        costPrice: 0,
        salePrice: 80,
        total: 80
      },
    ],
    paymentMethod: 'money',
    total: 80,
    totalCost: 0,
    profit: 80,
    status: 'completed'
  },
  {
    id: 'v_25_318_w88c',
    date: '2025-04-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1318',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_319_r5yk',
    date: '2025-04-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_320_pszm',
    date: '2025-04-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1133',
        productName: 'Cooler Fan G-Vr332',
        quantity: 3,
        costPrice: 20,
        salePrice: 36,
        total: 108
      },
    ],
    clientName: 'brunno irmao',
    paymentMethod: 'money',
    total: 60,
    totalCost: 51,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_321_nle1',
    date: '2025-04-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1321',
        productName: 'manutençao',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'brunno irmao',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_322_ft0c',
    date: '2025-04-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_323_f9kh',
    date: '2025-04-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1198',
        productName: 'Isqueiro Auto',
        quantity: 1,
        costPrice: 0.8,
        salePrice: 1.44,
        total: 1.44
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.8,
    profit: 4.2,
    status: 'completed'
  },
  {
    id: 'v_25_324_xqr4',
    date: '2025-04-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_325_mr5m',
    date: '2025-04-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1325',
        productName: 'amassador de alhos',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_326_173n',
    date: '2025-04-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 6,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.78
      },
    ],
    paymentMethod: 'money',
    total: 6,
    totalCost: 0.42000000000000004,
    profit: 5.58,
    status: 'completed'
  },
  {
    id: 'v_25_327_3kev',
    date: '2025-04-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 7,
        total: 7
      },
    ],
    paymentMethod: 'money',
    total: 7,
    totalCost: 0,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_328_t8id',
    date: '2025-04-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1328',
        productName: 'bolinhos da mamae',
        quantity: 4,
        costPrice: 3.5,
        salePrice: 7.5,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 14,
    profit: 16,
    status: 'completed'
  },
  {
    id: 'v_25_329_kcud',
    date: '2025-04-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1329',
        productName: 'cesto de inox penenira',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 0,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_330_2fpz',
    date: '2025-04-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1295',
        productName: 'Processador De Alimentos 1352',
        quantity: 1,
        costPrice: 11,
        salePrice: 19.8,
        total: 19.8
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 11,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_331_99e5',
    date: '2025-04-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 1,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.05,
    profit: 0.95,
    status: 'completed'
  },
  {
    id: 'v_25_332_znno',
    date: '2025-04-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_333_ibg4',
    date: '2025-04-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1333',
        productName: 'bolinhos da mamae',
        quantity: 2,
        costPrice: 3.5,
        salePrice: 7.5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_334_hmy2',
    date: '2025-04-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1234',
        productName: 'Lego Pequeno',
        quantity: 4,
        costPrice: 2,
        salePrice: 3.6,
        total: 14.4
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 8,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_335_45ji',
    date: '2025-04-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1103',
        productName: 'Carregador Veicular Simples',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_336_d807',
    date: '2025-04-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_337_0o3a',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1337',
        productName: 'lego pequeno Grande',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_338_6pu4',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1338',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_339_a1t6',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_340_wsje',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 13,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.69
      },
    ],
    paymentMethod: 'money',
    total: 13,
    totalCost: 0.9100000000000001,
    profit: 12.09,
    status: 'completed'
  },
  {
    id: 'v_25_341_4hkg',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1234',
        productName: 'Lego Pequeno',
        quantity: 6,
        costPrice: 2,
        salePrice: 3.6,
        total: 21.6
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 12,
    profit: 18,
    status: 'completed'
  },
  {
    id: 'v_25_342_xibv',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 0,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_343_0cgy',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_344_km30',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1305',
        productName: 'Super. Cola 3G Leo',
        quantity: 1,
        costPrice: 0.5,
        salePrice: 0.9,
        total: 0.9
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.5,
    profit: 1.5,
    status: 'completed'
  },
  {
    id: 'v_25_345_g4wf',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1345',
        productName: 'bolinhos da mamae',
        quantity: 2,
        costPrice: 3.5,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 7,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_346_01hi',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1346',
        productName: 'cabo de rede 1m',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_347_qszx',
    date: '2025-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1123',
        productName: 'Computadores',
        quantity: 1,
        costPrice: 0,
        salePrice: 100,
        total: 100
      },
    ],
    paymentMethod: 'money',
    total: 100,
    totalCost: 0,
    profit: 100,
    status: 'completed'
  },
  {
    id: 'v_25_348_qipp',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1348',
        productName: 'carregador veicular 2usb cw-c2',
        quantity: 1,
        costPrice: 0,
        salePrice: 35,
        total: 35
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 0,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_25_349_5whz',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1349',
        productName: 'bolinhos da mamae',
        quantity: 3,
        costPrice: 3.5,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 10.5,
    profit: 4.5,
    status: 'completed'
  },
  {
    id: 'v_25_350_7ymp',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 5,
        costPrice: 3,
        salePrice: 5.4,
        total: 27
      },
    ],
    paymentMethod: 'money',
    total: 75,
    totalCost: 15,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_25_351_1u8w',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1351',
        productName: 'Jogos PS2',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_352_se6n',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1352',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_353_qri0',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 20,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 2.6
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 1.4000000000000001,
    profit: 18.6,
    status: 'completed'
  },
  {
    id: 'v_25_354_fq9v',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1305',
        productName: 'Super. Cola 3G Leo',
        quantity: 1,
        costPrice: 0.5,
        salePrice: 0.9,
        total: 0.9
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.5,
    profit: 1.5,
    status: 'completed'
  },
  {
    id: 'v_25_355_h1lb',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1099',
        productName: 'Carregador Tipo C Le-484',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_356_k6rv',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1081',
        productName: 'Capinha',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_357_jbe5',
    date: '2025-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1357',
        productName: 'instant headache gel',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_358_p7fp',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1358',
        productName: 'Pendrive 16gb AL-U-16',
        quantity: 1,
        costPrice: 13,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 13,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_359_1z6t',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1234',
        productName: 'Lego Pequeno',
        quantity: 7,
        costPrice: 2,
        salePrice: 3.6,
        total: 25.2
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 14,
    profit: 21,
    status: 'completed'
  },
  {
    id: 'v_25_360_s610',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_361_dxvd',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1361',
        productName: 'Pendrive 16gb AL-U-16',
        quantity: 3,
        costPrice: 13,
        salePrice: 30,
        total: 90
      },
    ],
    paymentMethod: 'money',
    total: 90,
    totalCost: 39,
    profit: 51,
    status: 'completed'
  },
  {
    id: 'v_25_362_5zsa',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1362',
        productName: 'bolinhos da mamae',
        quantity: 5,
        costPrice: 3.5,
        salePrice: 5,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 17.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_363_3scs',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1290',
        productName: 'Pente De Cabelo Redondo',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_364_hgxb',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1294',
        productName: 'Porta Retrato Duplo Te Amo De Plástico 10X15 Cm Colors',
        quantity: 1,
        costPrice: 12,
        salePrice: 21.6,
        total: 21.6
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 12,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_365_gm4a',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1094',
        productName: 'Carregador Lehmox 5.1 Le-82',
        quantity: 2,
        costPrice: 10,
        salePrice: 18,
        total: 36
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 20,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_366_gxr7',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 3,
        costPrice: 0,
        salePrice: 15,
        total: 45
      },
    ],
    paymentMethod: 'money',
    total: 45,
    totalCost: 0,
    profit: 45,
    status: 'completed'
  },
  {
    id: 'v_25_367_l6ff',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1367',
        productName: 'porta cartao',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_368_imcg',
    date: '2025-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1368',
        productName: 'camera bocal',
        quantity: 1,
        costPrice: 0,
        salePrice: 90,
        total: 90
      },
    ],
    paymentMethod: 'money',
    total: 90,
    totalCost: 0,
    profit: 90,
    status: 'completed'
  },
  {
    id: 'v_25_369_4lzo',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1152',
        productName: 'Fone De Ouvido P3 Fon8619',
        quantity: 1,
        costPrice: 18,
        salePrice: 32.4,
        total: 32.4
      },
    ],
    paymentMethod: 'money',
    total: 45,
    totalCost: 18,
    profit: 27,
    status: 'completed'
  },
  {
    id: 'v_25_370_qnup',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1370',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_371_vavb',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1371',
        productName: 'chaleira plastica 1.8l',
        quantity: 1,
        costPrice: 0,
        salePrice: 100,
        total: 100
      },
    ],
    paymentMethod: 'money',
    total: 100,
    totalCost: 0,
    profit: 100,
    status: 'completed'
  },
  {
    id: 'v_25_372_xglc',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1372',
        productName: 'pelicula de privacidade',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 0,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_373_vr75',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1081',
        productName: 'Capinha',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 3,
    profit: 27,
    status: 'completed'
  },
  {
    id: 'v_25_374_8fwk',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1305',
        productName: 'Super. Cola 3G Leo',
        quantity: 1,
        costPrice: 0.5,
        salePrice: 0.9,
        total: 0.9
      },
    ],
    paymentMethod: 'money',
    total: 2.5,
    totalCost: 0.5,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_25_375_is6o',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1375',
        productName: 'hub usb 2.0 4 portas',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_376_5ie3',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1099',
        productName: 'Carregador Tipo C Le-484',
        quantity: 2,
        costPrice: 10,
        salePrice: 18,
        total: 36
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 20,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_377_rha7',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1377',
        productName: 'Powerbank 10000 BTE-084',
        quantity: 1,
        costPrice: 57,
        salePrice: 90,
        total: 90
      },
    ],
    paymentMethod: 'money',
    total: 90,
    totalCost: 57,
    profit: 33,
    status: 'completed'
  },
  {
    id: 'v_25_378_1i7l',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1143',
        productName: 'Durex',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_379_eu2y',
    date: '2025-05-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1379',
        productName: 'otg tipoc para ubs',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_380_chbk',
    date: '2025-05-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1380',
        productName: 'carregador 20w completo',
        quantity: 1,
        costPrice: 0,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 0,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_381_7182',
    date: '2025-05-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1381',
        productName: 'fone de ouvido tipo-c kapbom',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_382_b6xh',
    date: '2025-06-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1382',
        productName: 'camera bocal',
        quantity: 1,
        costPrice: 0,
        salePrice: 120,
        total: 120
      },
    ],
    paymentMethod: 'money',
    total: 120,
    totalCost: 0,
    profit: 120,
    status: 'completed'
  },
  {
    id: 'v_25_383_rnv9',
    date: '2025-06-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1383',
        productName: 'taser azul',
        quantity: 1,
        costPrice: 0,
        salePrice: 80,
        total: 80
      },
    ],
    paymentMethod: 'money',
    total: 80,
    totalCost: 0,
    profit: 80,
    status: 'completed'
  },
  {
    id: 'v_25_384_xjuw',
    date: '2025-06-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 40,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 5.2
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 2.8000000000000003,
    profit: 37.2,
    status: 'completed'
  },
  {
    id: 'v_25_385_ua99',
    date: '2025-06-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1143',
        productName: 'Durex',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_386_tthg',
    date: '2025-06-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1386',
        productName: 'teclado hayon tc3201',
        quantity: 1,
        costPrice: 0,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 0,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_387_gep3',
    date: '2025-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1387',
        productName: 'bolinhos da mamae',
        quantity: 4,
        costPrice: 3.5,
        salePrice: 5,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 14,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_388_a250',
    date: '2025-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1388',
        productName: 'pendrive 8gb',
        quantity: 1,
        costPrice: 14,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 14,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_389_pj19',
    date: '2025-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_390_axx5',
    date: '2025-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1390',
        productName: 'cartao de memoria tfmicrosd 64gb',
        quantity: 2,
        costPrice: 17,
        salePrice: 50,
        total: 100
      },
    ],
    paymentMethod: 'money',
    total: 100,
    totalCost: 34,
    profit: 66,
    status: 'completed'
  },
  {
    id: 'v_25_391_vras',
    date: '2025-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1391',
        productName: 'cartao de memoria tfmicrosd 32gb',
        quantity: 2,
        costPrice: 16,
        salePrice: 45,
        total: 90
      },
    ],
    paymentMethod: 'money',
    total: 90,
    totalCost: 32,
    profit: 58,
    status: 'completed'
  },
  {
    id: 'v_25_392_94mo',
    date: '2025-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1305',
        productName: 'Super. Cola 3G Leo',
        quantity: 1,
        costPrice: 0.5,
        salePrice: 0.9,
        total: 0.9
      },
    ],
    paymentMethod: 'money',
    total: 2.5,
    totalCost: 0.5,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_25_393_q6kp',
    date: '2025-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1301',
        productName: 'Ralador Panela Leo',
        quantity: 1,
        costPrice: 25,
        salePrice: 45,
        total: 45
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 25,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_394_43te',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1299',
        productName: 'Ralador 6 In 1 Mandolina Multilaminas Leo',
        quantity: 1,
        costPrice: 37,
        salePrice: 66.6,
        total: 66.6
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 37,
    profit: 23,
    status: 'completed'
  },
  {
    id: 'v_25_395_rr4p',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1395',
        productName: 'Relogio parede redondo',
        quantity: 2,
        costPrice: 10,
        salePrice: 20,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 20,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_396_1s18',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1396',
        productName: 'Jogos PS2',
        quantity: 5,
        costPrice: 2.5,
        salePrice: 5,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 12.5,
    profit: 12.5,
    status: 'completed'
  },
  {
    id: 'v_25_397_1xgf',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1234',
        productName: 'Lego Pequeno',
        quantity: 15,
        costPrice: 2,
        salePrice: 3.6,
        total: 54
      },
    ],
    paymentMethod: 'money',
    total: 75,
    totalCost: 30,
    profit: 45,
    status: 'completed'
  },
  {
    id: 'v_25_398_uqi1',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 4,
        costPrice: 3,
        salePrice: 5.4,
        total: 21.6
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 12,
    profit: 48,
    status: 'completed'
  },
  {
    id: 'v_25_399_6thb',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1399',
        productName: 'pelicula de privacidade',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_400_r76a',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1400',
        productName: 'carregador 20w completo',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_401_n5z7',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1401',
        productName: 'bateria 2032 sony',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_402_l51n',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1402',
        productName: 'realmi c61',
        quantity: 1,
        costPrice: 0,
        salePrice: 1100,
        total: 1100
      },
    ],
    paymentMethod: 'money',
    total: 1100,
    totalCost: 0,
    profit: 1100,
    status: 'completed'
  },
  {
    id: 'v_25_403_p8i0',
    date: '2025-06-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1403',
        productName: 'lanterna taser',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_25_404_03uk',
    date: '2025-06-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1404',
        productName: 'lampada mata mosquito',
        quantity: 2,
        costPrice: 0,
        salePrice: 45,
        total: 90
      },
    ],
    paymentMethod: 'money',
    total: 90,
    totalCost: 0,
    profit: 90,
    status: 'completed'
  },
  {
    id: 'v_25_405_0770',
    date: '2025-06-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1081',
        productName: 'Capinha',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 3,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_406_amdv',
    date: '2025-06-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1406',
        productName: 'Carregador Completo Spartan 3 V8 Cw-Xg20-V8',
        quantity: 1,
        costPrice: 10,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_407_zh1r',
    date: '2025-06-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1407',
        productName: 'calculadora simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_408_icee',
    date: '2025-06-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_25_409_mrzj',
    date: '2025-06-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1409',
        productName: 'carregador 20w',
        quantity: 2,
        costPrice: 0,
        salePrice: 30,
        total: 60
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 0,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_25_410_765h',
    date: '2025-06-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1410',
        productName: 'bateria 27a',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_411_q7rm',
    date: '2025-07-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1411',
        productName: 'Carregador induçao relogio',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_412_zmzo',
    date: '2025-07-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1412',
        productName: 'Fonte dell original',
        quantity: 1,
        costPrice: 0,
        salePrice: 85,
        total: 85
      },
    ],
    clientName: 'Cliente Mikaela Monteiro',
    paymentMethod: 'money',
    total: 85,
    totalCost: 0,
    profit: 85,
    status: 'completed'
  },
  {
    id: 'v_25_413_4dsp',
    date: '2025-07-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1149',
        productName: 'Fone De Ouvido Inova Fon-30063',
        quantity: 1,
        costPrice: 8,
        salePrice: 14.4,
        total: 14.4
      },
    ],
    clientName: 'Helena loja',
    paymentMethod: 'money',
    total: 25,
    totalCost: 8,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_414_xd10',
    date: '2025-07-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'PAI DIEGO',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_415_6djw',
    date: '2025-07-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1415',
        productName: 'carregador 20w completo',
        quantity: 1,
        costPrice: 0,
        salePrice: 45,
        total: 45
      },
    ],
    clientName: 'GIAN',
    paymentMethod: 'money',
    total: 45,
    totalCost: 0,
    profit: 45,
    status: 'completed'
  },
  {
    id: 'v_25_416_r8vi',
    date: '2025-07-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_417_t8v0',
    date: '2025-07-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1312',
        productName: 'Suporte De Tv Simples',
        quantity: 1,
        costPrice: 12,
        salePrice: 21.6,
        total: 21.6
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 12,
    profit: 13,
    status: 'completed'
  },
  {
    id: 'v_25_418_8oe9',
    date: '2025-07-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1110',
        productName: 'Cartinha',
        quantity: 8,
        costPrice: 1,
        salePrice: 1.8,
        total: 14.4
      },
    ],
    paymentMethod: 'money',
    total: 16,
    totalCost: 8,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_419_ywut',
    date: '2025-07-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 6,
    profit: 24,
    status: 'completed'
  },
  {
    id: 'v_25_420_et3z',
    date: '2025-07-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1081',
        productName: 'Capinha',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_421_ltah',
    date: '2025-07-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.07,
    profit: 4.93,
    status: 'completed'
  },
  {
    id: 'v_25_422_vba8',
    date: '2025-07-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_423_qj75',
    date: '2025-07-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1110',
        productName: 'Cartinha',
        quantity: 2,
        costPrice: 1,
        salePrice: 1.8,
        total: 3.6
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 2,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_25_424_e3yi',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 2,
        costPrice: 5,
        salePrice: 9,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_425_2586',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.07,
    profit: 4.93,
    status: 'completed'
  },
  {
    id: 'v_25_426_6cbf',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1426',
        productName: 'lego',
        quantity: 2,
        costPrice: 0,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_427_22gh',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1427',
        productName: 'bateria 2025',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_428_hl18',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1428',
        productName: 'Pilha Alcalina flex AAA',
        quantity: 1,
        costPrice: 6.5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 6.5,
    profit: 3.5,
    status: 'completed'
  },
  {
    id: 'v_25_429_vwuu',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1110',
        productName: 'Cartinha',
        quantity: 8,
        costPrice: 1,
        salePrice: 1.8,
        total: 14.4
      },
    ],
    paymentMethod: 'money',
    total: 16,
    totalCost: 8,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_430_g67x',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1430',
        productName: 'carregador 20w completo',
        quantity: 1,
        costPrice: 0,
        salePrice: 40,
        total: 40
      },
    ],
    clientName: 'val',
    paymentMethod: 'money',
    total: 40,
    totalCost: 0,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_431_hrdw',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1431',
        productName: 'Máquina De Cabelo Dragão',
        quantity: 1,
        costPrice: 18,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'GIAN',
    paymentMethod: 'money',
    total: 20,
    totalCost: 18,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_25_432_fzzw',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1110',
        productName: 'Cartinha',
        quantity: 4,
        costPrice: 1,
        salePrice: 1.8,
        total: 7.2
      },
    ],
    paymentMethod: 'money',
    total: 8,
    totalCost: 4,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_433_7ojs',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1433',
        productName: 'memory card',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_434_s2fd',
    date: '2025-07-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_435_ryx6',
    date: '2025-07-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1435',
        productName: 'combi',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_436_5e58',
    date: '2025-07-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 3,
        costPrice: 5,
        salePrice: 9,
        total: 27
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_437_8n3b',
    date: '2025-07-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1437',
        productName: 'bola inflavel',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_438_qese',
    date: '2025-07-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1438',
        productName: 'Corrente 100X2,2 Try5860',
        quantity: 1,
        costPrice: 28,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 28,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_439_2xeq',
    date: '2025-07-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1439',
        productName: 'Carregador Completo Spartan Tc - Cw-301',
        quantity: 1,
        costPrice: 11,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 11,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_440_uhi0',
    date: '2025-07-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 0,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_441_0e71',
    date: '2025-07-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1231',
        productName: 'Laxasfit 2024 Relógio Inteligente',
        quantity: 1,
        costPrice: 34.19,
        salePrice: 61.54,
        total: 61.54
      },
    ],
    paymentMethod: 'money',
    total: 80,
    totalCost: 34.19,
    profit: 80,
    status: 'completed'
  },
  {
    id: 'v_25_442_rou1',
    date: '2025-07-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_443_3ty9',
    date: '2025-07-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 60,
        total: 60
      },
    ],
    clientName: 'Manu colegio',
    paymentMethod: 'money',
    total: 60,
    totalCost: 0,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_25_444_x6e2',
    date: '2025-07-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1171',
        productName: 'Fonte Notebook Grasep',
        quantity: 1,
        costPrice: 32,
        salePrice: 57.6,
        total: 57.6
      },
    ],
    clientName: 'Manu colegio',
    paymentMethod: 'money',
    total: 80,
    totalCost: 32,
    profit: 48,
    status: 'completed'
  },
  {
    id: 'v_25_445_3kzh',
    date: '2025-07-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1234',
        productName: 'Lego Pequeno',
        quantity: 2,
        costPrice: 2,
        salePrice: 3.6,
        total: 7.2
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_446_4r0b',
    date: '2025-07-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1446',
        productName: 'boneco agua',
        quantity: 2,
        costPrice: 0,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_447_g6ol',
    date: '2025-07-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 45,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 5.8500000000000005
      },
    ],
    paymentMethod: 'money',
    total: 40.5,
    totalCost: 3.1500000000000004,
    profit: 37.35,
    status: 'completed'
  },
  {
    id: 'v_25_448_rw80',
    date: '2025-07-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1448',
        productName: 'lanterna de cabeça',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_449_kmb8',
    date: '2025-07-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_450_wb9k',
    date: '2025-07-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 1,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.05,
    profit: 0.95,
    status: 'completed'
  },
  {
    id: 'v_25_451_81yv',
    date: '2025-07-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1451',
        productName: 'lanterna tomada',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_452_wm7g',
    date: '2025-07-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0.05,
    profit: 9.95,
    status: 'completed'
  },
  {
    id: 'v_25_453_n1gw',
    date: '2025-07-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 6,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 4.32
      },
    ],
    paymentMethod: 'money',
    total: 36,
    totalCost: 2.4000000000000004,
    profit: 33.6,
    status: 'completed'
  },
  {
    id: 'v_25_454_14fr',
    date: '2025-07-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_455_a7nk',
    date: '2025-07-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1455',
        productName: 'domino',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_456_w43v',
    date: '2025-07-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_457_zk74',
    date: '2025-07-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_458_a3gx',
    date: '2025-07-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 1,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 0.72
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.4,
    profit: 1.6,
    status: 'completed'
  },
  {
    id: 'v_25_459_oeeu',
    date: '2025-07-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1153',
        productName: 'Fone Fon30024 Inova',
        quantity: 1,
        costPrice: 8,
        salePrice: 14.4,
        total: 14.4
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 8,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_460_8olw',
    date: '2025-07-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_461_u94f',
    date: '2025-07-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1026',
        productName: 'Bobbie Goods Caderno',
        quantity: 1,
        costPrice: 13,
        salePrice: 23.4,
        total: 23.4
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 13,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_462_wufo',
    date: '2025-07-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 1,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 0.72
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.4,
    profit: 1.6,
    status: 'completed'
  },
  {
    id: 'v_25_463_qgtw',
    date: '2025-07-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 1,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 0.72
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.4,
    profit: 1.6,
    status: 'completed'
  },
  {
    id: 'v_25_464_8k47',
    date: '2025-07-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_465_4l3z',
    date: '2025-07-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_466_x4b8',
    date: '2025-07-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'val',
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_467_js1k',
    date: '2025-07-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_468_qlmo',
    date: '2025-07-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1085',
        productName: 'Card Caixa 50',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 5,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_469_mwzn',
    date: '2025-07-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_470_bcmw',
    date: '2025-07-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1143',
        productName: 'Durex',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'cacheados',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_471_h5aj',
    date: '2025-07-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_472_43ut',
    date: '2025-07-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'relogio',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_473_1687',
    date: '2025-07-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1473',
        productName: 'chaveiro carinha',
        quantity: 1,
        costPrice: 2,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'relogio',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_474_c3za',
    date: '2025-07-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 1,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 0.72
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.4,
    profit: 1.6,
    status: 'completed'
  },
  {
    id: 'v_25_475_gf36',
    date: '2025-07-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1475',
        productName: 'm.2 240 gb',
        quantity: 1,
        costPrice: 100,
        salePrice: 255,
        total: 255
      },
    ],
    clientName: 'edimais',
    paymentMethod: 'money',
    total: 255,
    totalCost: 100,
    profit: 155,
    status: 'completed'
  },
  {
    id: 'v_25_476_h7l5',
    date: '2025-07-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1075',
        productName: 'Camera Ip Dupla',
        quantity: 1,
        costPrice: 105.175,
        salePrice: 189.32,
        total: 189.32
      },
    ],
    clientName: 'elza',
    paymentMethod: 'money',
    total: 220,
    totalCost: 140,
    profit: 80,
    status: 'completed'
  },
  {
    id: 'v_25_477_ok6l',
    date: '2025-07-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 3,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 13.5
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_478_cyca',
    date: '2025-07-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 1,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 0.72
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.4,
    profit: 1.6,
    status: 'completed'
  },
  {
    id: 'v_25_479_c1bf',
    date: '2025-07-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1479',
        productName: 'Mouse Wireless Recarregável Led Rgb 2.4 Ghz Sem Fio',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'mak',
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_480_tvnz',
    date: '2025-07-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'karol g',
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.07,
    profit: 4.93,
    status: 'completed'
  },
  {
    id: 'v_25_481_429p',
    date: '2025-07-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1481',
        productName: 'cartao de memoria tfmicrosd 64gb',
        quantity: 1,
        costPrice: 17,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'elza',
    paymentMethod: 'money',
    total: 30,
    totalCost: 17,
    profit: 13,
    status: 'completed'
  },
  {
    id: 'v_25_482_gpau',
    date: '2025-07-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_483_e86c',
    date: '2025-07-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_484_aohi',
    date: '2025-07-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 5,
        costPrice: 5,
        salePrice: 9,
        total: 45
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 25,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_485_tksf',
    date: '2025-07-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_486_08f0',
    date: '2025-07-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_487_6vzs',
    date: '2025-07-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1487',
        productName: 'Mouse Wireless Recarregável Led Rgb 2.4 Ghz Sem Fio',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'mak',
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_488_nebn',
    date: '2025-07-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_489_qtx0',
    date: '2025-07-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'futura esposa',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_490_k5bl',
    date: '2025-07-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1490',
        productName: 'adaptador usb - para p2',
        quantity: 1,
        costPrice: 10,
        salePrice: 35,
        total: 35
      },
    ],
    clientName: 'futura esposa',
    paymentMethod: 'money',
    total: 35,
    totalCost: 10,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_491_5mba',
    date: '2025-07-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1491',
        productName: 'bola inflavel',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_492_3t86',
    date: '2025-07-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1492',
        productName: 'Jogos PS2',
        quantity: 3,
        costPrice: 2.5,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_493_iz2f',
    date: '2025-07-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1493',
        productName: 'capa space',
        quantity: 1,
        costPrice: 5,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 5,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_494_o121',
    date: '2025-07-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_495_dxyq',
    date: '2025-07-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1495',
        productName: 'kit cortador de unhas pequeno',
        quantity: 2,
        costPrice: 5,
        salePrice: 10,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_496_edin',
    date: '2025-07-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_497_j5fu',
    date: '2025-07-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1497',
        productName: 'Adaptador Wifi 5G',
        quantity: 2,
        costPrice: 28,
        salePrice: 50,
        total: 100
      },
    ],
    paymentMethod: 'money',
    total: 100,
    totalCost: 56,
    profit: 44,
    status: 'completed'
  },
  {
    id: 'v_25_498_kvz6',
    date: '2025-07-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1073',
        productName: 'Calculadora 12 Dígitos Crs8585',
        quantity: 1,
        costPrice: 23,
        salePrice: 41.4,
        total: 41.4
      },
    ],
    clientName: 'feicenter',
    paymentMethod: 'money',
    total: 35,
    totalCost: 23,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_499_hj2x',
    date: '2025-07-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1499',
        productName: 'pilha AAA',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'feicenter',
    paymentMethod: 'money',
    total: 10,
    totalCost: 2.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_500_9y4i',
    date: '2025-08-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1029',
        productName: 'Boneco Lego',
        quantity: 5,
        costPrice: 15,
        salePrice: 27,
        total: 135
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 12.5,
    profit: 12.5,
    status: 'completed'
  },
  {
    id: 'v_25_501_qskv',
    date: '2025-08-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1026',
        productName: 'Bobbie Goods Caderno',
        quantity: 1,
        costPrice: 13,
        salePrice: 23.4,
        total: 23.4
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 13,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_502_wvjr',
    date: '2025-08-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1502',
        productName: 'adaptador iphone para p2',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_503_sh51',
    date: '2025-08-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_504_0ska',
    date: '2025-08-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1083',
        productName: 'Capinha Simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_505_jb1w',
    date: '2025-08-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_506_ndp7',
    date: '2025-08-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_507_9ca3',
    date: '2025-08-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 1,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 0.72
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.4,
    profit: 1.6,
    status: 'completed'
  },
  {
    id: 'v_25_508_mz56',
    date: '2025-08-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_509_35vm',
    date: '2025-08-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    clientName: 'Gian',
    paymentMethod: 'money',
    total: 20,
    totalCost: 6,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_25_510_wqbr',
    date: '2025-08-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_511_ycfj',
    date: '2025-08-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_512_dxp5',
    date: '2025-08-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1512',
        productName: 'manutençao Celular',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    clientName: 'diego',
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_25_513_ageg',
    date: '2025-08-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1513',
        productName: 'manutençao Celular',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    clientName: 'diego',
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_25_514_y31n',
    date: '2025-08-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_515_ivfp',
    date: '2025-08-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1078',
        productName: 'Capa A Prova D\'Água',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    paymentMethod: 'money',
    total: 8,
    totalCost: 3.5,
    profit: 4.5,
    status: 'completed'
  },
  {
    id: 'v_25_516_hcb5',
    date: '2025-08-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1516',
        productName: 'cordao cracha',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_517_cjs3',
    date: '2025-08-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 7,
        costPrice: 5,
        salePrice: 9,
        total: 63
      },
    ],
    paymentMethod: 'money',
    total: 140,
    totalCost: 70,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_25_518_uhja',
    date: '2025-08-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1518',
        productName: 'Chaveiros lili',
        quantity: 2,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4.833333333333333,
    profit: 5.166666666666667,
    status: 'completed'
  },
  {
    id: 'v_25_519_mpxi',
    date: '2025-08-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 5,
        costPrice: 0,
        salePrice: 1,
        total: 5
      },
    ],
    clientName: 'elza',
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.25,
    profit: 4.75,
    status: 'completed'
  },
  {
    id: 'v_25_520_p203',
    date: '2025-08-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1143',
        productName: 'Durex',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'cacheados',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_521_2pjz',
    date: '2025-08-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1521',
        productName: 'pelicula de privacidade',
        quantity: 1,
        costPrice: 0,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'Cliente Silvânia',
    paymentMethod: 'money',
    total: 20,
    totalCost: 0,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_522_80c8',
    date: '2025-08-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'Cliente Silvânia',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_523_y7jd',
    date: '2025-08-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1523',
        productName: 'Chaveiros lili',
        quantity: 2,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 10
      },
    ],
    clientName: 'meninos',
    paymentMethod: 'money',
    total: 10,
    totalCost: 4.833333333333333,
    profit: 5.166666666666667,
    status: 'completed'
  },
  {
    id: 'v_25_524_jwol',
    date: '2025-08-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1524',
        productName: 'Chaveiros lili',
        quantity: 1,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.4166666666666665,
    profit: 2.5833333333333335,
    status: 'completed'
  },
  {
    id: 'v_25_525_hz8g',
    date: '2025-08-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 10,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.3
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0.7000000000000001,
    profit: 9.3,
    status: 'completed'
  },
  {
    id: 'v_25_526_2oqc',
    date: '2025-08-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1526',
        productName: 'Chaveiros lili',
        quantity: 1,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'lanchonete',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.4166666666666665,
    profit: 2.5833333333333335,
    status: 'completed'
  },
  {
    id: 'v_25_527_igsd',
    date: '2025-08-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1527',
        productName: 'jogos ps2',
        quantity: 3,
        costPrice: 2.5,
        salePrice: 5,
        total: 15
      },
    ],
    clientName: 'cliente ronaldo arauo',
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_528_vckk',
    date: '2025-08-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1528',
        productName: 'Chaveiros lili',
        quantity: 1,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'lanchonete',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.4166666666666665,
    profit: 2.5833333333333335,
    status: 'completed'
  },
  {
    id: 'v_25_529_4a9y',
    date: '2025-08-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_530_lpzf',
    date: '2025-08-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'elza',
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_531_uzec',
    date: '2025-08-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1531',
        productName: 'alicate bico fino',
        quantity: 1,
        costPrice: 10,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 15,
    totalCost: 10,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_532_xr0e',
    date: '2025-08-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1532',
        productName: 'Jogos PS2',
        quantity: 4,
        costPrice: 2.5,
        salePrice: 5,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_533_jd6w',
    date: '2025-08-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1533',
        productName: 'Chaveiros lili',
        quantity: 1,
        costPrice: 2.4166666666666665,
        salePrice: 4,
        total: 4
      },
    ],
    clientName: 'kaleb',
    paymentMethod: 'money',
    total: 4,
    totalCost: 2.4166666666666665,
    profit: 1.5833333333333335,
    status: 'completed'
  },
  {
    id: 'v_25_534_jfjh',
    date: '2025-08-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1534',
        productName: 'Chaveiros lili',
        quantity: 2,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 10
      },
    ],
    clientName: 'lanchonete',
    paymentMethod: 'money',
    total: 10,
    totalCost: 4.833333333333333,
    profit: 5.166666666666667,
    status: 'completed'
  },
  {
    id: 'v_25_535_2kik',
    date: '2025-08-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1535',
        productName: 'Chaveiros lili',
        quantity: 1,
        costPrice: 2.4166666666666665,
        salePrice: 7,
        total: 7
      },
    ],
    paymentMethod: 'money',
    total: 7,
    totalCost: 2.4166666666666665,
    profit: 4.583333333333334,
    status: 'completed'
  },
  {
    id: 'v_25_536_x2jj',
    date: '2025-08-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'santa',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_537_idqu',
    date: '2025-08-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1537',
        productName: 'Mouse Wireless Recarregável Led Rgb 2.4 Ghz Sem Fio',
        quantity: 1,
        costPrice: 18,
        salePrice: 35,
        total: 35
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 18,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_538_lpg1',
    date: '2025-08-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 1,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 0.72
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.4,
    profit: 1.6,
    status: 'completed'
  },
  {
    id: 'v_25_539_xz3m',
    date: '2025-08-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 10,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.3
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0.7000000000000001,
    profit: 9.3,
    status: 'completed'
  },
  {
    id: 'v_25_540_zpr3',
    date: '2025-08-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_541_kuol',
    date: '2025-08-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 3,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 2.16
      },
    ],
    paymentMethod: 'money',
    total: 6,
    totalCost: 1.2000000000000002,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_25_542_gnje',
    date: '2025-08-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_543_gue6',
    date: '2025-08-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_544_mrc2',
    date: '2025-08-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 3,
        costPrice: 0,
        salePrice: 0.5,
        total: 1.5
      },
    ],
    paymentMethod: 'money',
    total: 1.5,
    totalCost: 0.15000000000000002,
    profit: 1.35,
    status: 'completed'
  },
  {
    id: 'v_25_545_2rw1',
    date: '2025-08-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1335',
        productName: 'Xerox Preta',
        quantity: 2,
        costPrice: 0,
        salePrice: 0.5,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.1,
    profit: 0.9,
    status: 'completed'
  },
  {
    id: 'v_25_546_5gjf',
    date: '2025-08-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1546',
        productName: 'cabo extensor usb',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'sah',
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_547_nrhl',
    date: '2025-08-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1547',
        productName: 'Chaveiros lili',
        quantity: 1,
        costPrice: 2.4166666666666665,
        salePrice: 7,
        total: 7
      },
    ],
    paymentMethod: 'money',
    total: 7,
    totalCost: 2.4166666666666665,
    profit: 4.583333333333334,
    status: 'completed'
  },
  {
    id: 'v_25_548_kvui',
    date: '2025-08-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_549_xvp5',
    date: '2025-08-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1083',
        productName: 'Capinha Simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_550_9axo',
    date: '2025-08-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 3,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 2.16
      },
    ],
    clientName: 'Daniel',
    paymentMethod: 'money',
    total: 6,
    totalCost: 1.2000000000000002,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_25_551_07gt',
    date: '2025-08-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1551',
        productName: 'Chaveiros lili',
        quantity: 2,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 10
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 10,
    totalCost: 4.833333333333333,
    profit: 5.166666666666667,
    status: 'completed'
  },
  {
    id: 'v_25_552_03lx',
    date: '2025-08-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1085',
        productName: 'Card Caixa 50',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    clientName: 'kaleb',
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_553_eb5p',
    date: '2025-08-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1553',
        productName: 'Chaveiros lili',
        quantity: 1,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'Danilo',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.4166666666666665,
    profit: 2.5833333333333335,
    status: 'completed'
  },
  {
    id: 'v_25_554_ofp8',
    date: '2025-08-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1554',
        productName: 'BRINQUEDO emoj',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'danilo',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_555_86tp',
    date: '2025-08-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 3,
        costPrice: 5,
        salePrice: 9,
        total: 27
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_556_171t',
    date: '2025-08-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1556',
        productName: 'Chaveiros lili',
        quantity: 2,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 10
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 10,
    totalCost: 4.833333333333333,
    profit: 5.166666666666667,
    status: 'completed'
  },
  {
    id: 'v_25_557_9qb0',
    date: '2025-08-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1557',
        productName: 'BRINQUEDO emoj',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'danilo',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_558_3sdu',
    date: '2025-08-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_559_r9j7',
    date: '2025-08-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1058',
        productName: 'Cabo Kingo Tc 1M',
        quantity: 1,
        costPrice: 7,
        salePrice: 12.6,
        total: 12.6
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_560_oyme',
    date: '2025-08-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 40,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 5.2
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 2.8000000000000003,
    profit: 37.2,
    status: 'completed'
  },
  {
    id: 'v_25_561_dkzt',
    date: '2025-08-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_562_k21g',
    date: '2025-08-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1562',
        productName: 'Chaveiros lili',
        quantity: 1,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.4166666666666665,
    profit: 2.5833333333333335,
    status: 'completed'
  },
  {
    id: 'v_25_563_e4vl',
    date: '2025-08-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1563',
        productName: 'ssd 240gb',
        quantity: 1,
        costPrice: 69.63,
        salePrice: 234,
        total: 234
      },
    ],
    clientName: 'Marcello',
    paymentMethod: 'money',
    total: 234,
    totalCost: 69.63,
    profit: 164.37,
    status: 'completed'
  },
  {
    id: 'v_25_564_y75s',
    date: '2025-08-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1564',
        productName: 'Pc lenovo',
        quantity: 1,
        costPrice: 250,
        salePrice: 600,
        total: 600
      },
    ],
    paymentMethod: 'money',
    total: 600,
    totalCost: 250,
    profit: 350,
    status: 'completed'
  },
  {
    id: 'v_25_565_fcjs',
    date: '2025-08-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_566_bl30',
    date: '2025-08-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1566',
        productName: 'jogos ps2',
        quantity: 5,
        costPrice: 2.5,
        salePrice: 5,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 12.5,
    profit: 12.5,
    status: 'completed'
  },
  {
    id: 'v_25_567_ujyw',
    date: '2025-08-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1567',
        productName: 'Chaveiros lili',
        quantity: 2,
        costPrice: 2.4166666666666665,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4.833333333333333,
    profit: 5.166666666666667,
    status: 'completed'
  },
  {
    id: 'v_25_568_y3df',
    date: '2025-08-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1568',
        productName: 'brinquedo alvo',
        quantity: 1,
        costPrice: 10,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 10,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_569_sq56',
    date: '2025-08-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_570_yef1',
    date: '2025-08-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 3,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 2.16
      },
    ],
    paymentMethod: 'money',
    total: 6,
    totalCost: 1.2000000000000002,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_25_571_uivn',
    date: '2025-08-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1009',
        productName: 'Adaptador Tipo C Para Usb',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    clientName: 'feicenter',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3.5,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_25_572_bwyz',
    date: '2025-08-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 4,
        costPrice: 5,
        salePrice: 9,
        total: 36
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 30,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_573_esay',
    date: '2025-08-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1573',
        productName: 'cabo extensor usb',
        quantity: 2,
        costPrice: 10,
        salePrice: 15,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_574_d4j8',
    date: '2025-09-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_575_2nl5',
    date: '2025-09-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 2,
        costPrice: 5,
        salePrice: 9,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_576_1axv',
    date: '2025-09-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1576',
        productName: 'Bateria 27a',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'luiz som',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_577_qkf6',
    date: '2025-09-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1051',
        productName: 'Cabo Iphone 20W',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 6,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_25_578_gizw',
    date: '2025-09-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1578',
        productName: 'brinquedo mola',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_579_0fgy',
    date: '2025-09-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1579',
        productName: 'Adaptador dvi para hdmi',
        quantity: 1,
        costPrice: 7,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_580_daue',
    date: '2025-09-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'karol g',
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.07,
    profit: 4.93,
    status: 'completed'
  },
  {
    id: 'v_25_581_oo8k',
    date: '2025-09-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 7.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_582_n6zd',
    date: '2025-09-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1582',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18.5,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_583_ikbk',
    date: '2025-09-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 2,
        costPrice: 5,
        salePrice: 9,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 15,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_584_6sr8',
    date: '2025-09-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1110',
        productName: 'Cartinha',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 1,
    profit: 1,
    status: 'completed'
  },
  {
    id: 'v_25_585_h763',
    date: '2025-09-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_586_2rwz',
    date: '2025-09-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1586',
        productName: 'carregador universal',
        quantity: 1,
        costPrice: 38,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 38,
    profit: 32,
    status: 'completed'
  },
  {
    id: 'v_25_587_dgbs',
    date: '2025-09-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_588_9lci',
    date: '2025-09-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1588',
        productName: 'SSD 120gb',
        quantity: 1,
        costPrice: 104,
        salePrice: 200,
        total: 200
      },
    ],
    paymentMethod: 'money',
    total: 200,
    totalCost: 104,
    profit: 96,
    status: 'completed'
  },
  {
    id: 'v_25_589_w030',
    date: '2025-09-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1589',
        productName: 'canddy',
        quantity: 1,
        costPrice: 10,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_590_dako',
    date: '2025-09-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1026',
        productName: 'Bobbie Goods Caderno',
        quantity: 1,
        costPrice: 13,
        salePrice: 23.4,
        total: 23.4
      },
    ],
    clientName: 'Daniel',
    paymentMethod: 'money',
    total: 20,
    totalCost: 16,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_591_f8h3',
    date: '2025-09-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    clientName: 'maura',
    paymentMethod: 'money',
    total: 20,
    totalCost: 6,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_25_592_3xqg',
    date: '2025-09-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_593_0ubk',
    date: '2025-09-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 1,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 0.72
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.4,
    profit: 1.6,
    status: 'completed'
  },
  {
    id: 'v_25_594_mpjp',
    date: '2025-09-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1594',
        productName: 'gatilho para celular',
        quantity: 1,
        costPrice: 12,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 12,
    profit: 13,
    status: 'completed'
  },
  {
    id: 'v_25_595_s4h6',
    date: '2025-09-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_596_8awc',
    date: '2025-09-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1027',
        productName: 'Bobbie Goods Card',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_597_tyq9',
    date: '2025-09-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1597',
        productName: 'Suporte celular veicular',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_598_gyp9',
    date: '2025-09-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1598',
        productName: 'Cabo tipo C',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_599_s8i6',
    date: '2025-09-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 4,
        costPrice: 5,
        salePrice: 9,
        total: 36
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 30,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_600_ogw2',
    date: '2025-09-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1600',
        productName: 'adaptador v8 para tipo c',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_601_zh3u',
    date: '2025-09-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1601',
        productName: 'carregador v8',
        quantity: 1,
        costPrice: 9,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 9,
    profit: 21,
    status: 'completed'
  },
  {
    id: 'v_25_602_ztn2',
    date: '2025-09-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_603_a279',
    date: '2025-09-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1603',
        productName: 'Adaptador Wifi 5G',
        quantity: 1,
        costPrice: 23,
        salePrice: 35,
        total: 35
      },
    ],
    clientName: 'rafael',
    paymentMethod: 'money',
    total: 35,
    totalCost: 23,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_604_185g',
    date: '2025-09-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1604',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18.5,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_605_moh3',
    date: '2025-09-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'aisha',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_606_j1c5',
    date: '2025-09-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 3,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 13.5
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_607_vmot',
    date: '2025-09-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1084',
        productName: 'Card',
        quantity: 2,
        costPrice: 0.4,
        salePrice: 0.72,
        total: 1.44
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0.8,
    profit: 9.2,
    status: 'completed'
  },
  {
    id: 'v_25_608_fple',
    date: '2025-09-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'Dionisio',
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_609_9ejr',
    date: '2025-09-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1609',
        productName: 'cartao de memoria 32gb',
        quantity: 1,
        costPrice: 20,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'Dionisio',
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_610_wrpu',
    date: '2025-09-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'Dionisio',
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_611_eooj',
    date: '2025-09-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.07,
    profit: 4.93,
    status: 'completed'
  },
  {
    id: 'v_25_612_tegm',
    date: '2025-09-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    clientName: 'manu',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_613_d66u',
    date: '2025-09-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_614_qzsw',
    date: '2025-09-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'danilo',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_615_kfw6',
    date: '2025-09-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 5,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 22.5
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 12.5,
    profit: 12.5,
    status: 'completed'
  },
  {
    id: 'v_25_616_k6i8',
    date: '2025-09-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1616',
        productName: 'Bateria 27a',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'a',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_617_dtpf',
    date: '2025-09-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'danilo',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_618_63hz',
    date: '2025-09-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1618',
        productName: 'Carregador iphone 20w',
        quantity: 1,
        costPrice: 15,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'deborah',
    paymentMethod: 'money',
    total: 50,
    totalCost: 15,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_25_619_hdhm',
    date: '2025-09-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_620_j848',
    date: '2025-09-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'Ivonilde',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_621_jj1y',
    date: '2025-09-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1621',
        productName: 'bateria x550c',
        quantity: 1,
        costPrice: 97.55,
        salePrice: 200,
        total: 200
      },
    ],
    clientName: 'Ivonilde',
    paymentMethod: 'money',
    total: 200,
    totalCost: 97.55,
    profit: 102.45,
    status: 'completed'
  },
  {
    id: 'v_25_622_ctgh',
    date: '2025-09-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1622',
        productName: 'teclado x550c',
        quantity: 1,
        costPrice: 46.2,
        salePrice: 100,
        total: 100
      },
    ],
    clientName: 'Ivonilde',
    paymentMethod: 'money',
    total: 100,
    totalCost: 46.2,
    profit: 53.8,
    status: 'completed'
  },
  {
    id: 'v_25_623_l2t5',
    date: '2025-09-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1623',
        productName: 'carregador x550c',
        quantity: 1,
        costPrice: 35,
        salePrice: 75,
        total: 75
      },
    ],
    clientName: 'Ivonilde',
    paymentMethod: 'money',
    total: 75,
    totalCost: 35,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_624_hvka',
    date: '2025-09-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1624',
        productName: 'fone blu',
        quantity: 1,
        costPrice: 20,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'rafael',
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_625_n33e',
    date: '2025-09-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1625',
        productName: 'fone simples',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'rafael',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_626_rtyb',
    date: '2025-09-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1626',
        productName: 'manutençao Computador',
        quantity: 1,
        costPrice: 40,
        salePrice: 150,
        total: 150
      },
    ],
    clientName: 'diego',
    paymentMethod: 'money',
    total: 150,
    totalCost: 40,
    profit: 110,
    status: 'completed'
  },
  {
    id: 'v_25_627_wemz',
    date: '2025-09-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1627',
        productName: 'cabo iphone2metros',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'Gata',
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_628_gar6',
    date: '2025-09-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1316',
        productName: 'Suporte Magnético Veicular Barra',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'Gata',
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_629_b8ex',
    date: '2025-09-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 11,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.4300000000000002
      },
    ],
    clientName: 'relogio',
    paymentMethod: 'money',
    total: 11,
    totalCost: 0.77,
    profit: 10.23,
    status: 'completed'
  },
  {
    id: 'v_25_630_5brv',
    date: '2025-09-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 8,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.04
      },
    ],
    paymentMethod: 'money',
    total: 8,
    totalCost: 0.56,
    profit: 7.4399999999999995,
    status: 'completed'
  },
  {
    id: 'v_25_631_rkj8',
    date: '2025-09-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1631',
        productName: 'multimetro amarelo',
        quantity: 1,
        costPrice: 16,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'jhonatan shopee',
    paymentMethod: 'money',
    total: 30,
    totalCost: 16,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_25_632_bcth',
    date: '2025-09-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_633_gkbk',
    date: '2025-09-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1633',
        productName: 'boneco agua',
        quantity: 1,
        costPrice: 0,
        salePrice: 3,
        total: 3
      },
    ],
    paymentMethod: 'money',
    total: 3,
    totalCost: 0,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_634_80ay',
    date: '2025-09-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1634',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 4,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_635_9hkt',
    date: '2025-09-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_636_b0zc',
    date: '2025-09-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_25_637_u9b7',
    date: '2025-09-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_638_iws8',
    date: '2025-09-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    clientName: 'daniel',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_639_joqp',
    date: '2025-09-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'danilo',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_640_d2jj',
    date: '2025-09-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_641_utj7',
    date: '2025-09-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1641',
        productName: 'fita durex',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 5,
        total: 10
      },
    ],
    clientName: 'cacheados',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_642_7tew',
    date: '2025-09-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_643_nn6m',
    date: '2025-09-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 4,
        costPrice: 5,
        salePrice: 9,
        total: 36
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 20,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_644_cvdn',
    date: '2025-09-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1644',
        productName: 'fonte 5v',
        quantity: 1,
        costPrice: 9,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 9,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_645_j0sn',
    date: '2025-09-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1645',
        productName: 'fone de ouvido',
        quantity: 1,
        costPrice: 10,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 10,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_646_ykei',
    date: '2025-09-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_647_wod3',
    date: '2025-10-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_648_hjnr',
    date: '2025-10-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1083',
        productName: 'Capinha Simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_649_mjzu',
    date: '2025-10-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1170',
        productName: 'Fonte 12V',
        quantity: 1,
        costPrice: 10,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 10,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_650_isme',
    date: '2025-10-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1650',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_651_qu4f',
    date: '2025-10-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 3,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 13.5
      },
    ],
    clientName: 'manu',
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_652_xo76',
    date: '2025-10-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1652',
        productName: 'cabo iphone',
        quantity: 2,
        costPrice: 5,
        salePrice: 15,
        total: 30
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_653_jp2t',
    date: '2025-10-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    clientName: 'manu',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_654_ree1',
    date: '2025-10-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 26,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 3.38
      },
    ],
    clientName: 'karol g',
    paymentMethod: 'money',
    total: 26,
    totalCost: 1.8200000000000003,
    profit: 24.18,
    status: 'completed'
  },
  {
    id: 'v_25_655_fkuc',
    date: '2025-10-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1655',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18.5,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_656_3wn5',
    date: '2025-10-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 6,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 27
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_657_4ei1',
    date: '2025-10-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1657',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_658_q4ew',
    date: '2025-10-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'francisca',
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_659_lquo',
    date: '2025-10-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1659',
        productName: 'carregador 20w',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'francisca',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_660_mw2p',
    date: '2025-10-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1083',
        productName: 'Capinha Simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'francisca',
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_661_7or4',
    date: '2025-10-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_662_a9ey',
    date: '2025-10-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 15,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_663_1pph',
    date: '2025-10-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_664_yd7u',
    date: '2025-10-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'Renatinha',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_665_dey3',
    date: '2025-10-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1083',
        productName: 'Capinha Simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'Renatinha',
    paymentMethod: 'money',
    total: 15,
    totalCost: 6,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_666_lhtq',
    date: '2025-10-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1666',
        productName: 'carregador 20w completo',
        quantity: 1,
        costPrice: 15,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'Renatinha',
    paymentMethod: 'money',
    total: 50,
    totalCost: 15,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_25_667_5lep',
    date: '2025-10-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1667',
        productName: 'Pendrive 32gb',
        quantity: 1,
        costPrice: 20,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'andre',
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_668_j1s3',
    date: '2025-10-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_669_y1u5',
    date: '2025-10-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1669',
        productName: 'cartao de memoria tfmicrosd 32gb',
        quantity: 1,
        costPrice: 16,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 16,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_25_670_o5ho',
    date: '2025-10-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1670',
        productName: 'Máquina De Cabelo Dragão kenel',
        quantity: 1,
        costPrice: 35,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 35,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_671_g2bp',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1245',
        productName: 'Luvinha De Dedo',
        quantity: 2,
        costPrice: 1,
        salePrice: 1.8,
        total: 3.6
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 1,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_672_efmn',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1672',
        productName: 'cabo iphone',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_673_hfc6',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1673',
        productName: 'esqueiro',
        quantity: 1,
        costPrice: 2,
        salePrice: 6,
        total: 6
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 6,
    totalCost: 2,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_674_gyxy',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1674',
        productName: 'Climatizador duplo',
        quantity: 1,
        costPrice: 55,
        salePrice: 110,
        total: 110
      },
    ],
    paymentMethod: 'money',
    total: 110,
    totalCost: 55,
    profit: 55,
    status: 'completed'
  },
  {
    id: 'v_25_675_fr3i',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 10,
        costPrice: 0,
        salePrice: 38.62,
        total: 386.2
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 386.2,
    totalCost: 25,
    profit: 361.2,
    status: 'completed'
  },
  {
    id: 'v_25_676_43tt',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1676',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 3,
        costPrice: 7,
        salePrice: 27.5,
        total: 82.5
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 82.5,
    totalCost: 21,
    profit: 61.5,
    status: 'completed'
  },
  {
    id: 'v_25_677_04vw',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1677',
        productName: 'Capa RG',
        quantity: 1,
        costPrice: 2,
        salePrice: 4.76,
        total: 4.76
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 4.76,
    totalCost: 2,
    profit: 2.76,
    status: 'completed'
  },
  {
    id: 'v_25_678_6h01',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1678',
        productName: 'Tv box unittv',
        quantity: 1,
        costPrice: 295,
        salePrice: 386,
        total: 386
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 386,
    totalCost: 295,
    profit: 91,
    status: 'completed'
  },
  {
    id: 'v_25_679_pknt',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1679',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7,
        salePrice: 9.26,
        total: 9.26
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 9.26,
    totalCost: 7,
    profit: 2.26,
    status: 'completed'
  },
  {
    id: 'v_25_680_at8t',
    date: '2025-10-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1680',
        productName: 'barbeador animal',
        quantity: 1,
        costPrice: 55,
        salePrice: 95,
        total: 95
      },
    ],
    clientName: 'tiktok',
    paymentMethod: 'money',
    total: 95,
    totalCost: 55,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_681_5915',
    date: '2025-10-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    clientName: 'tiktok',
    paymentMethod: 'money',
    total: 334.4,
    totalCost: 250,
    profit: 84.39999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_682_veu2',
    date: '2025-10-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    clientName: 'tiktok',
    paymentMethod: 'money',
    total: 347.6,
    totalCost: 250,
    profit: 97.60000000000002,
    status: 'completed'
  },
  {
    id: 'v_25_683_bd6b',
    date: '2025-10-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    clientName: 'tiktok',
    paymentMethod: 'money',
    total: 304,
    totalCost: 250,
    profit: 54,
    status: 'completed'
  },
  {
    id: 'v_25_684_4qie',
    date: '2025-10-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1684',
        productName: 'Lâmpada de sinalização de',
        quantity: 1,
        costPrice: 20,
        salePrice: 21.19,
        total: 21.19
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 21.19,
    totalCost: 20,
    profit: 1.1900000000000013,
    status: 'completed'
  },
  {
    id: 'v_25_685_m7vh',
    date: '2025-10-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1685',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 12.46,
        total: 12.46
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 12.46,
    totalCost: 7.5,
    profit: 4.960000000000001,
    status: 'completed'
  },
  {
    id: 'v_25_686_ysuc',
    date: '2025-10-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1206',
        productName: 'Kemei Maquina De Barbear 4 In 1',
        quantity: 1,
        costPrice: 32.95,
        salePrice: 59.31,
        total: 59.31
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 48.7,
    totalCost: 32.95,
    profit: 15.75,
    status: 'completed'
  },
  {
    id: 'v_25_687_y132',
    date: '2025-10-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1687',
        productName: 'Estilingue Luz de Led',
        quantity: 1,
        costPrice: 2,
        salePrice: 5.87,
        total: 5.87
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 5.87,
    totalCost: 2,
    profit: 3.87,
    status: 'completed'
  },
  {
    id: 'v_25_688_nvll',
    date: '2025-10-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1688',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 12.46,
        total: 12.46
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 12.46,
    totalCost: 7.5,
    profit: 4.960000000000001,
    status: 'completed'
  },
  {
    id: 'v_25_689_8t6l',
    date: '2025-10-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 6,
        costPrice: 5,
        salePrice: 9,
        total: 54
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 45,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_690_kv62',
    date: '2025-10-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_691_pl11',
    date: '2025-10-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1691',
        productName: 'boneco agua',
        quantity: 3,
        costPrice: 0,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_692_ze6m',
    date: '2025-10-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1692',
        productName: 'Hand Grip Flexor',
        quantity: 1,
        costPrice: 12,
        salePrice: 15.76,
        total: 15.76
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 15.76,
    totalCost: 12,
    profit: 3.76,
    status: 'completed'
  },
  {
    id: 'v_25_693_staz',
    date: '2025-10-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 30,
    profit: 8.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_694_mp29',
    date: '2025-10-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1694',
        productName: 'Máquina De Tosa',
        quantity: 1,
        costPrice: 52,
        salePrice: 112.25,
        total: 112.25
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 112.25,
    totalCost: 52,
    profit: 60.25,
    status: 'completed'
  },
  {
    id: 'v_25_695_xn3y',
    date: '2025-10-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 3,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 13.5
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_696_4eko',
    date: '2025-10-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 6,
    profit: 19,
    status: 'completed'
  },
  {
    id: 'v_25_697_pkle',
    date: '2025-10-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1697',
        productName: 'carregadro tipo c',
        quantity: 1,
        costPrice: 10,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 10,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_698_vuz4',
    date: '2025-10-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 12,
        total: 12
      },
    ],
    paymentMethod: 'money',
    total: 12,
    totalCost: 0,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_699_o8dh',
    date: '2025-10-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1232',
        productName: 'Lego Ali',
        quantity: 10,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 45
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 25,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_700_7tw5',
    date: '2025-10-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_701_phjx',
    date: '2025-10-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 3,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.39
      },
    ],
    paymentMethod: 'money',
    total: 3,
    totalCost: 0.21000000000000002,
    profit: 2.79,
    status: 'completed'
  },
  {
    id: 'v_25_702_3njw',
    date: '2025-10-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1702',
        productName: 'lantern pequena',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_703_us0b',
    date: '2025-10-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1703',
        productName: 'Cabo de iphone',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'val p',
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_704_xouq',
    date: '2025-10-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1704',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 5,
        costPrice: 7.5,
        salePrice: 9.174,
        total: 45.87
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 45.87,
    totalCost: 37.5,
    profit: 8.369999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_705_wqnz',
    date: '2025-10-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 20,
    profit: 18.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_706_w92g',
    date: '2025-10-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 20,
    profit: 18.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_707_epa1',
    date: '2025-10-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 20,
    profit: 18.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_708_g2uh',
    date: '2025-10-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: 'Shopee',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 20,
    profit: 18.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_709_8a33',
    date: '2025-10-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1709',
        productName: 'kit 3 jogo de xbox',
        quantity: 1,
        costPrice: 10,
        salePrice: 33.2,
        total: 33.2
      },
    ],
    clientName: 'tiktok',
    paymentMethod: 'money',
    total: 33.2,
    totalCost: 10,
    profit: 23.200000000000003,
    status: 'completed'
  },
  {
    id: 'v_25_710_3krm',
    date: '2025-10-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1710',
        productName: 'Gravação de Jogos PS2',
        quantity: 4,
        costPrice: 0,
        salePrice: 5,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 0,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_711_vwjn',
    date: '2025-10-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1711',
        productName: 'Jogos PS2',
        quantity: 3,
        costPrice: 2.5,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_712_jmyh',
    date: '2025-10-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1712',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18.5,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_713_cg72',
    date: '2025-10-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_714_516i',
    date: '2025-10-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1714',
        productName: 'Jogos PS2',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_715_o9a5',
    date: '2025-10-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1715',
        productName: 'cartao de memoria tfmicrosd 32gb',
        quantity: 1,
        costPrice: 16,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 16,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_25_716_oukz',
    date: '2025-10-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: '251024UFEQ5C37',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 10,
    profit: 28.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_717_1pqw',
    date: '2025-10-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: '251023SA4CE2K2',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 10,
    profit: 28.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_718_9k5c',
    date: '2025-10-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: '251023S43AH3PT',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 10,
    profit: 28.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_719_zx87',
    date: '2025-10-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 38.62,
        total: 38.62
      },
    ],
    clientName: '2510250T39QW0M',
    paymentMethod: 'money',
    total: 38.62,
    totalCost: 10,
    profit: 28.619999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_720_2lyi',
    date: '2025-10-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1720',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 9.17,
        total: 9.17
      },
    ],
    clientName: '251022QW8WRWC1',
    paymentMethod: 'money',
    total: 9.17,
    totalCost: 7.5,
    profit: 1.67,
    status: 'completed'
  },
  {
    id: 'v_25_721_lcgl',
    date: '2025-10-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1110',
        productName: 'Cartinha',
        quantity: 7,
        costPrice: 1,
        salePrice: 1.8,
        total: 12.6
      },
    ],
    paymentMethod: 'money',
    total: 14,
    totalCost: 7,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_722_fegw',
    date: '2025-10-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1722',
        productName: 'cartao de memoria tfmicrosd 32gb',
        quantity: 1,
        costPrice: 16,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'Dionisio',
    paymentMethod: 'money',
    total: 30,
    totalCost: 16,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_25_723_1e9f',
    date: '2025-10-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'Dionisio',
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_724_tg8u',
    date: '2025-10-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1231',
        productName: 'Laxasfit 2024 Relógio Inteligente',
        quantity: 1,
        costPrice: 34.19,
        salePrice: 61.54,
        total: 61.54
      },
    ],
    clientName: 'Dionisio',
    paymentMethod: 'money',
    total: 100,
    totalCost: 40.37,
    profit: 59.63,
    status: 'completed'
  },
  {
    id: 'v_25_725_dj0b',
    date: '2025-10-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_726_hrqr',
    date: '2025-10-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 42.5,
        total: 42.5
      },
    ],
    paymentMethod: 'money',
    total: 42.5,
    totalCost: 12,
    profit: 30.5,
    status: 'completed'
  },
  {
    id: 'v_25_727_ovru',
    date: '2025-10-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 42.5,
        total: 42.5
      },
    ],
    clientName: '2510263XS7F3J5',
    paymentMethod: 'money',
    total: 42.5,
    totalCost: 12,
    profit: 30.5,
    status: 'completed'
  },
  {
    id: 'v_25_728_rmsr',
    date: '2025-10-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 42.5,
        total: 42.5
      },
    ],
    clientName: '2510265F9DN9NR',
    paymentMethod: 'money',
    total: 42.5,
    totalCost: 12,
    profit: 30.5,
    status: 'completed'
  },
  {
    id: 'v_25_729_8ncw',
    date: '2025-10-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 42.5,
        total: 42.5
      },
    ],
    clientName: '2510265HBSHQD7',
    paymentMethod: 'money',
    total: 42.5,
    totalCost: 12,
    profit: 30.5,
    status: 'completed'
  },
  {
    id: 'v_25_730_g27f',
    date: '2025-10-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1730',
        productName: '1 Par Alto 1 Par Alto Falante Evok 6x9 280rms',
        quantity: 1,
        costPrice: 0,
        salePrice: 102.1,
        total: 102.1
      },
    ],
    clientName: '2510276H79S327',
    paymentMethod: 'money',
    total: 102.1,
    totalCost: 0,
    profit: 102.1,
    status: 'completed'
  },
  {
    id: 'v_25_731_q6yq',
    date: '2025-10-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'cacheados',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_732_67i7',
    date: '2025-10-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 42.5,
        total: 42.5
      },
    ],
    clientName: '251028AN3589SG',
    paymentMethod: 'money',
    total: 42.5,
    totalCost: 20,
    profit: 22.5,
    status: 'completed'
  },
  {
    id: 'v_25_733_ptzr',
    date: '2025-10-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 42.5,
        total: 42.5
      },
    ],
    clientName: '25102890QMSA50',
    paymentMethod: 'money',
    total: 42.5,
    totalCost: 20,
    profit: 22.5,
    status: 'completed'
  },
  {
    id: 'v_25_734_tngt',
    date: '2025-10-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1734',
        productName: 'suporte de celular articulado',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_735_vob0',
    date: '2025-10-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 41.72,
        total: 41.72
      },
    ],
    clientName: '251029D5F5A0CC',
    paymentMethod: 'money',
    total: 41.72,
    totalCost: 20,
    profit: 21.72,
    status: 'completed'
  },
  {
    id: 'v_25_736_r93n',
    date: '2025-10-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1736',
        productName: 'Par De Super Tweeter Evok Ste 400',
        quantity: 1,
        costPrice: 0,
        salePrice: 44.75,
        total: 44.75
      },
    ],
    clientName: '251030D9DEWAE9',
    paymentMethod: 'money',
    total: 44.75,
    totalCost: 0,
    profit: 44.75,
    status: 'completed'
  },
  {
    id: 'v_25_737_milo',
    date: '2025-10-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1737',
        productName: 'kit 20 jogos ps2',
        quantity: 1,
        costPrice: 14,
        salePrice: 85.16,
        total: 85.16
      },
    ],
    clientName: '251030F8S9STWN',
    paymentMethod: 'money',
    total: 85.16,
    totalCost: 14,
    profit: 71.16,
    status: 'completed'
  },
  {
    id: 'v_25_738_lofm',
    date: '2025-10-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 41.72,
        total: 41.72
      },
    ],
    clientName: '251029D5F5A0CC',
    paymentMethod: 'money',
    total: 41.72,
    totalCost: 20,
    profit: 21.72,
    status: 'completed'
  },
  {
    id: 'v_25_739_5lk0',
    date: '2025-10-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1739',
        productName: 'cabo display porte para displeyport',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_740_9sqh',
    date: '2025-11-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1740',
        productName: 'isqueiro',
        quantity: 1,
        costPrice: 2,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'francisca',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_741_w5zz',
    date: '2025-11-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1741',
        productName: 'Jogos ps2 leo',
        quantity: 3,
        costPrice: 1,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_742_5wpa',
    date: '2025-11-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 41.9,
        total: 41.9
      },
    ],
    clientName: '251102NJ6SPH85',
    paymentMethod: 'money',
    total: 41.9,
    totalCost: 7,
    profit: 34.9,
    status: 'completed'
  },
  {
    id: 'v_25_743_9ovx',
    date: '2025-11-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1743',
        productName: '1 Par Alto Falante Evok 6x9 280rms',
        quantity: 1,
        costPrice: 0,
        salePrice: 40,
        total: 40
      },
    ],
    clientName: '251102Q652RSH7',
    paymentMethod: 'money',
    total: 40,
    totalCost: 0,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_744_r1et',
    date: '2025-11-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1744',
        productName: 'Pen Drive Jogos Para PS2',
        quantity: 1,
        costPrice: 20,
        salePrice: 53.37,
        total: 53.37
      },
    ],
    clientName: '251102MYQY566D',
    paymentMethod: 'money',
    total: 53.37,
    totalCost: 20,
    profit: 33.37,
    status: 'completed'
  },
  {
    id: 'v_25_745_hx5w',
    date: '2025-11-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1745',
        productName: 'Estilingue Luz de Led',
        quantity: 1,
        costPrice: 2,
        salePrice: 5.74,
        total: 5.74
      },
    ],
    clientName: '251103SHJAKJES',
    paymentMethod: 'money',
    total: 5.74,
    totalCost: 2,
    profit: 3.74,
    status: 'completed'
  },
  {
    id: 'v_25_746_lu6n',
    date: '2025-11-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1746',
        productName: 'pelicula de privacidade',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 7.5,
    profit: 12.5,
    status: 'completed'
  },
  {
    id: 'v_25_747_csae',
    date: '2025-11-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1254',
        productName: 'Memory Card 16Mb',
        quantity: 1,
        costPrice: 18,
        salePrice: 32.4,
        total: 32.4
      },
    ],
    clientName: 'evandrodo206',
    paymentMethod: 'money',
    total: 19.71,
    totalCost: 18,
    profit: 1.7100000000000009,
    status: 'completed'
  },
  {
    id: 'v_25_748_zkej',
    date: '2025-11-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1748',
        productName: 'Pen Drive Jogos Para PS2',
        quantity: 1,
        costPrice: 20,
        salePrice: 53.37,
        total: 53.37
      },
    ],
    clientName: 'evandrodo206',
    paymentMethod: 'money',
    total: 53.37,
    totalCost: 20,
    profit: 33.37,
    status: 'completed'
  },
  {
    id: 'v_25_749_5s7b',
    date: '2025-11-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 41.9,
        total: 41.9
      },
    ],
    clientName: 'fj5laf_w9t',
    paymentMethod: 'money',
    total: 41.9,
    totalCost: 7,
    profit: 34.9,
    status: 'completed'
  },
  {
    id: 'v_25_750_kddl',
    date: '2025-11-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1750',
        productName: 'cabo iphonetipoc',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_751_7xhg',
    date: '2025-11-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1751',
        productName: 'MID BASS 6X9MB250',
        quantity: 1,
        costPrice: 0,
        salePrice: 32,
        total: 32
      },
    ],
    clientName: 'zelton.novais',
    paymentMethod: 'money',
    total: 32,
    totalCost: 0,
    profit: 32,
    status: 'completed'
  },
  {
    id: 'v_25_752_irio',
    date: '2025-11-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 7.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_25_753_du5p',
    date: '2025-11-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1753',
        productName: 'pelicula de privacidade',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 7.5,
    profit: 12.5,
    status: 'completed'
  },
  {
    id: 'v_25_754_26jv',
    date: '2025-11-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_755_0b50',
    date: '2025-11-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_756_22vh',
    date: '2025-11-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 4,
        costPrice: 5,
        salePrice: 9,
        total: 36
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 20,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_757_m3fo',
    date: '2025-11-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1757',
        productName: 'memory Card 32mb',
        quantity: 1,
        costPrice: 25,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 25,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_25_758_xp7f',
    date: '2025-11-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1758',
        productName: 'Pen Drive Jogos Para PS2',
        quantity: 1,
        costPrice: 25,
        salePrice: 123.12,
        total: 123.12
      },
    ],
    paymentMethod: 'money',
    total: 123.12,
    totalCost: 25,
    profit: 98.12,
    status: 'completed'
  },
  {
    id: 'v_25_759_vagd',
    date: '2025-11-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 2,
        costPrice: 5,
        salePrice: 9,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_760_a7yt',
    date: '2025-11-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    clientName: 'Marcellin',
    paymentMethod: 'money',
    total: 14,
    totalCost: 6,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_761_3gdm',
    date: '2025-11-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1083',
        productName: 'Capinha Simples',
        quantity: 2,
        costPrice: 0,
        salePrice: 15,
        total: 30
      },
    ],
    clientName: 'Marcellin',
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_762_hzzy',
    date: '2025-11-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1762',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'Marcellin',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_763_qu4q',
    date: '2025-11-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_764_1iug',
    date: '2025-11-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1160',
        productName: 'Fone Pmcell Fo-11',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3.5,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_25_765_twwj',
    date: '2025-11-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1160',
        productName: 'Fone Pmcell Fo-11',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 6.3,
        total: 6.3
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_766_9ay1',
    date: '2025-11-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1766',
        productName: 'Jogos ps2 leo',
        quantity: 3,
        costPrice: 1,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_767_209k',
    date: '2025-11-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1767',
        productName: 'conversor avg - hdmi ps2',
        quantity: 1,
        costPrice: 20,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 20,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_768_34ax',
    date: '2025-11-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1768',
        productName: 'micro sd 64gb',
        quantity: 1,
        costPrice: 20,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'feicenter',
    paymentMethod: 'money',
    total: 50,
    totalCost: 20,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_769_hshz',
    date: '2025-11-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1769',
        productName: 'micro sd 128gb',
        quantity: 1,
        costPrice: 0,
        salePrice: 90,
        total: 90
      },
    ],
    clientName: 'max',
    paymentMethod: 'money',
    total: 90,
    totalCost: 0,
    profit: 90,
    status: 'completed'
  },
  {
    id: 'v_25_770_5po8',
    date: '2025-11-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1770',
        productName: 'cordao simples',
        quantity: 2,
        costPrice: 1,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 2,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_771_3865',
    date: '2025-11-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 37.24,
        total: 37.24
      },
    ],
    clientName: '251114QWQKY6H0',
    paymentMethod: 'money',
    total: 37.24,
    totalCost: 7,
    profit: 30.240000000000002,
    status: 'completed'
  },
  {
    id: 'v_25_772_9oxo',
    date: '2025-11-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1772',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 14.74,
        total: 14.74
      },
    ],
    clientName: '251113MACT2XDG',
    paymentMethod: 'money',
    total: 14.74,
    totalCost: 7.5,
    profit: 7.24,
    status: 'completed'
  },
  {
    id: 'v_25_773_3zuy',
    date: '2025-11-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1773',
        productName: '1 Par Alto Falante Evok 6x9 280rms',
        quantity: 1,
        costPrice: 0,
        salePrice: 42,
        total: 42
      },
    ],
    clientName: '251110C53YC34V',
    paymentMethod: 'money',
    total: 42,
    totalCost: 0,
    profit: 42,
    status: 'completed'
  },
  {
    id: 'v_25_774_am09',
    date: '2025-11-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1774',
        productName: 'bolinha de arminha',
        quantity: 1,
        costPrice: 5,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 5,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_775_vf52',
    date: '2025-11-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'geraldo',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_776_05ch',
    date: '2025-11-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1776',
        productName: 'placa de rede',
        quantity: 1,
        costPrice: 1,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'geraldo',
    paymentMethod: 'money',
    total: 50,
    totalCost: 1,
    profit: 49,
    status: 'completed'
  },
  {
    id: 'v_25_777_wb1g',
    date: '2025-11-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1777',
        productName: 'moden tplink',
        quantity: 1,
        costPrice: 1,
        salePrice: 100,
        total: 100
      },
    ],
    paymentMethod: 'money',
    total: 100,
    totalCost: 1,
    profit: 99,
    status: 'completed'
  },
  {
    id: 'v_25_778_9r6p',
    date: '2025-11-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1778',
        productName: 'cabo iphonelaranja',
        quantity: 1,
        costPrice: 4,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_779_chrw',
    date: '2025-11-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1779',
        productName: 'cabo de força ps2',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_780_0840',
    date: '2025-11-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1780',
        productName: 'Jogos ps2 leo',
        quantity: 3,
        costPrice: 1,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_781_2vyj',
    date: '2025-11-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 2,
        costPrice: 5,
        salePrice: 9,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_782_dbwo',
    date: '2025-11-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1782',
        productName: 'Mouse Wireless Recarregável Led Rgb 2.4 Ghz Sem Fio',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_783_w7r6',
    date: '2025-11-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1783',
        productName: 'cordao simples',
        quantity: 1,
        costPrice: 1,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 1,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_784_z7h7',
    date: '2025-11-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1784',
        productName: 'hd 320',
        quantity: 1,
        costPrice: 1,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'paulinho',
    paymentMethod: 'money',
    total: 50,
    totalCost: 1,
    profit: 49,
    status: 'completed'
  },
  {
    id: 'v_25_785_2htj',
    date: '2025-11-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1785',
        productName: 'cartinha de dinheiro',
        quantity: 3,
        costPrice: 5,
        salePrice: 10,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_786_t90n',
    date: '2025-11-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1786',
        productName: 'cabo iphone',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_787_j4o6',
    date: '2025-11-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1787',
        productName: 'brinquedo mordida',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_788_w9ee',
    date: '2025-11-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1788',
        productName: 'pelicula de privacidade',
        quantity: 2,
        costPrice: 7.5,
        salePrice: 20,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 15,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_789_y0ws',
    date: '2025-11-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1789',
        productName: 'ssd 240gb',
        quantity: 1,
        costPrice: 99.9,
        salePrice: 250,
        total: 250
      },
    ],
    clientName: 'diego',
    paymentMethod: 'money',
    total: 250,
    totalCost: 99.9,
    profit: 150.1,
    status: 'completed'
  },
  {
    id: 'v_25_790_gs5e',
    date: '2025-11-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1790',
        productName: 'arvore de natal',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'paulinha',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_791_7mxn',
    date: '2025-11-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1791',
        productName: 'bateria 2025 sony',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_792_1mu2',
    date: '2025-11-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1792',
        productName: 'boneco agua',
        quantity: 1,
        costPrice: 2,
        salePrice: 5,
        total: 5
      },
    ],
    clientName: 'danilo',
    paymentMethod: 'money',
    total: 5,
    totalCost: 2,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_25_793_y9ib',
    date: '2025-11-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1793',
        productName: 'cabo hdmi 10m',
        quantity: 1,
        costPrice: 25,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 25,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_794_5ldf',
    date: '2025-11-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1794',
        productName: 'Xiaomi bluetooth fones',
        quantity: 1,
        costPrice: 23.1,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 23.1,
    profit: 26.9,
    status: 'completed'
  },
  {
    id: 'v_25_795_m0rn',
    date: '2025-11-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_796_l6il',
    date: '2025-11-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1796',
        productName: 'cabo iphonekingo',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 7.5,
    profit: 12.5,
    status: 'completed'
  },
  {
    id: 'v_25_797_zgel',
    date: '2025-11-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1797',
        productName: 'Pisca pisca vermelho 100 leds',
        quantity: 1,
        costPrice: 8,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 20,
    totalCost: 8,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_798_w7h8',
    date: '2025-11-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1192',
        productName: 'Guirlanda Verde/Branca',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 10,
    totalCost: 6,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_799_hcz8',
    date: '2025-11-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1799',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 4,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_800_yyz5',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1800',
        productName: 'Mouse Wireless Recarregável Led Rgb 2.4 Ghz Sem Fio',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_801_ytbt',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1801',
        productName: 'Pisca pisca colorido',
        quantity: 1,
        costPrice: 8.5,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'paulinha',
    paymentMethod: 'money',
    total: 20,
    totalCost: 8.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_802_ir0o',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1192',
        productName: 'Guirlanda Verde/Branca',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    clientName: 'paulinha',
    paymentMethod: 'money',
    total: 10,
    totalCost: 6,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_803_ezaq',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1803',
        productName: 'arminha de gel',
        quantity: 1,
        costPrice: 38,
        salePrice: 60,
        total: 60
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 60,
    totalCost: 38,
    profit: 22,
    status: 'completed'
  },
  {
    id: 'v_25_804_ejhh',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1192',
        productName: 'Guirlanda Verde/Branca',
        quantity: 3,
        costPrice: 3,
        salePrice: 5.4,
        total: 16.200000000000003
      },
    ],
    clientName: 'paulinha',
    paymentMethod: 'money',
    total: 18,
    totalCost: 9,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_805_fueh',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1805',
        productName: 'Pisca pisca colorido',
        quantity: 1,
        costPrice: 8.5,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 20,
    totalCost: 8.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_806_jb8v',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1192',
        productName: 'Guirlanda Verde/Branca',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 10,
    totalCost: 6,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_807_w029',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1807',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.8,
        total: 13.8
      },
    ],
    clientName: '251125N6D00GHN',
    paymentMethod: 'money',
    total: 13.8,
    totalCost: 7.5,
    profit: 6.300000000000001,
    status: 'completed'
  },
  {
    id: 'v_25_808_j0de',
    date: '2025-11-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1808',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.8,
        total: 13.8
      },
    ],
    clientName: '251126QTAS3SAR',
    paymentMethod: 'money',
    total: 13.8,
    totalCost: 7.5,
    profit: 6.300000000000001,
    status: 'completed'
  },
  {
    id: 'v_25_809_zcdb',
    date: '2025-11-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 41,
        total: 41
      },
    ],
    clientName: '2511195SVS58WQ',
    paymentMethod: 'money',
    total: 41,
    totalCost: 7,
    profit: 34,
    status: 'completed'
  },
  {
    id: 'v_25_810_2obe',
    date: '2025-11-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1810',
        productName: 'arminha de gel',
        quantity: 1,
        costPrice: 38,
        salePrice: 60,
        total: 60
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 60,
    totalCost: 38,
    profit: 22,
    status: 'completed'
  },
  {
    id: 'v_25_811_f3ox',
    date: '2025-11-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1811',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18.5,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_25_812_zjuh',
    date: '2025-11-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1812',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_813_6chr',
    date: '2025-11-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1813',
        productName: 'cabo kingo tipo c',
        quantity: 1,
        costPrice: 8,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 8,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_25_814_dqsb',
    date: '2025-11-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_815_z1ib',
    date: '2025-11-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1815',
        productName: 'cabo extensor usb',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'sah',
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_816_84fv',
    date: '2025-11-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_25_817_cuwe',
    date: '2025-11-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1817',
        productName: '1 Par Alto Falante Evok 6x9 280rms',
        quantity: 1,
        costPrice: 0,
        salePrice: 21,
        total: 21
      },
    ],
    clientName: '251127T0EUU1WM',
    paymentMethod: 'money',
    total: 21,
    totalCost: 0,
    profit: 21,
    status: 'completed'
  },
  {
    id: 'v_25_818_bvev',
    date: '2025-11-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    clientName: '7550209518518535943',
    paymentMethod: 'money',
    total: 352.88,
    totalCost: 275,
    profit: 77.88,
    status: 'completed'
  },
  {
    id: 'v_25_819_wxlj',
    date: '2025-11-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_820_3f8w',
    date: '2025-11-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1820',
        productName: 'cabo completo iphone',
        quantity: 1,
        costPrice: 15,
        salePrice: 60,
        total: 60
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 15,
    profit: 45,
    status: 'completed'
  },
  {
    id: 'v_25_821_dgli',
    date: '2025-11-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1821',
        productName: 'cabo v8',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_822_qk43',
    date: '2025-12-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1822',
        productName: 'Jogos ps2 leo',
        quantity: 2,
        costPrice: 1,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 2,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_823_fyty',
    date: '2025-12-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1823',
        productName: 'Cabo de iphone',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_824_2ehy',
    date: '2025-12-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1824',
        productName: 'fone grande',
        quantity: 1,
        costPrice: 20,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 20,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_825_gblv',
    date: '2025-12-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_826_4opq',
    date: '2025-12-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1826',
        productName: 'pelicula de privacidade',
        quantity: 1,
        costPrice: 7,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 7,
    profit: 13,
    status: 'completed'
  },
  {
    id: 'v_25_827_w0sw',
    date: '2025-12-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1245',
        productName: 'Luvinha De Dedo',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 1,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_828_30j7',
    date: '2025-12-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_829_6xbc',
    date: '2025-12-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_830_b15j',
    date: '2025-12-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1830',
        productName: 'arvore de natal M',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_831_7wnh',
    date: '2025-12-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1831',
        productName: 'arminha de gel',
        quantity: 1,
        costPrice: 38,
        salePrice: 60,
        total: 60
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 60,
    totalCost: 38,
    profit: 22,
    status: 'completed'
  },
  {
    id: 'v_25_832_qqqs',
    date: '2025-12-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1334',
        productName: 'Uno',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 15,
    totalCost: 6,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_833_v7v5',
    date: '2025-12-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 2,
        costPrice: 5,
        salePrice: 9,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_834_bwde',
    date: '2025-12-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    clientName: 'eliane',
    paymentMethod: 'money',
    total: 350,
    totalCost: 280,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_25_835_y3w3',
    date: '2025-12-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1835',
        productName: 'Controle Com Fio Compatível Com Playstation Ps2 Cor Preto',
        quantity: 1,
        costPrice: 10,
        salePrice: 14,
        total: 14
      },
    ],
    clientName: '2512016D13CT6U',
    paymentMethod: 'money',
    total: 14,
    totalCost: 10,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_836_sxwt',
    date: '2025-12-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1836',
        productName: '1 Par Alto 1 Par Alto Falante Evok 6x9 280rms',
        quantity: 2,
        costPrice: 0,
        salePrice: 42,
        total: 84
      },
    ],
    clientName: '251204E2WQ3CR3',
    paymentMethod: 'money',
    total: 84,
    totalCost: 0,
    profit: 84,
    status: 'completed'
  },
  {
    id: 'v_25_837_jhjm',
    date: '2025-12-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1837',
        productName: '1 Par Alto 1 Par Alto Falante Evok 6x9 280rms',
        quantity: 1,
        costPrice: 0,
        salePrice: 21,
        total: 21
      },
    ],
    clientName: '25112819EYDS0J',
    paymentMethod: 'money',
    total: 21,
    totalCost: 0,
    profit: 21,
    status: 'completed'
  },
  {
    id: 'v_25_838_d2i7',
    date: '2025-12-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 37.24,
        total: 37.24
      },
    ],
    clientName: '251208S746WPVS',
    paymentMethod: 'money',
    total: 37.24,
    totalCost: 7,
    profit: 30.240000000000002,
    status: 'completed'
  },
  {
    id: 'v_25_839_e2bp',
    date: '2025-12-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1839',
        productName: '1 Par Alto 1 Par Alto Falante Evok 6x9 280rms',
        quantity: 1,
        costPrice: 0,
        salePrice: 9,
        total: 9
      },
    ],
    clientName: '251208TBTU0JQX',
    paymentMethod: 'money',
    total: 9,
    totalCost: 0,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_25_840_kk02',
    date: '2025-12-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 37.24,
        total: 37.24
      },
    ],
    clientName: '251208RNR5ABPX',
    paymentMethod: 'money',
    total: 37.24,
    totalCost: 7,
    profit: 30.240000000000002,
    status: 'completed'
  },
  {
    id: 'v_25_841_zupu',
    date: '2025-12-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 37.24,
        total: 37.24
      },
    ],
    clientName: '251206KWK4SX80',
    paymentMethod: 'money',
    total: 37.24,
    totalCost: 7,
    profit: 30.240000000000002,
    status: 'completed'
  },
  {
    id: 'v_25_842_rccc',
    date: '2025-12-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 37.24,
        total: 37.24
      },
    ],
    clientName: '251205JU4D091G',
    paymentMethod: 'money',
    total: 37.24,
    totalCost: 7,
    profit: 30.240000000000002,
    status: 'completed'
  },
  {
    id: 'v_25_843_lfm5',
    date: '2025-12-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1843',
        productName: '1 Par Alto 1 Par Alto Falante Evok 6x9 280rms',
        quantity: 1,
        costPrice: 0,
        salePrice: 21,
        total: 21
      },
    ],
    clientName: '251127T0EUU1WM',
    paymentMethod: 'money',
    total: 21,
    totalCost: 0,
    profit: 21,
    status: 'completed'
  },
  {
    id: 'v_25_844_2lpi',
    date: '2025-12-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1844',
        productName: 'Copo Térmico Cerveja',
        quantity: 1,
        costPrice: 19,
        salePrice: 29.74,
        total: 29.74
      },
    ],
    clientName: '25112811QMV818',
    paymentMethod: 'money',
    total: 29.74,
    totalCost: 19,
    profit: 10.739999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_845_bsdk',
    date: '2025-12-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1845',
        productName: 'Memory Card Opl',
        quantity: 1,
        costPrice: 18,
        salePrice: 22.24,
        total: 22.24
      },
    ],
    clientName: '251204E6UDR503',
    paymentMethod: 'money',
    total: 22.24,
    totalCost: 18,
    profit: 4.239999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_846_x8ay',
    date: '2025-12-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1846',
        productName: 'Memory Card Opl',
        quantity: 1,
        costPrice: 18,
        salePrice: 29.74,
        total: 29.74
      },
    ],
    clientName: '251204EPGA4ETC',
    paymentMethod: 'money',
    total: 29.74,
    totalCost: 18,
    profit: 11.739999999999998,
    status: 'completed'
  },
  {
    id: 'v_25_847_2gha',
    date: '2025-12-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1847',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.8,
        total: 13.8
      },
    ],
    clientName: '251205GCHYG20G',
    paymentMethod: 'money',
    total: 13.8,
    totalCost: 7.5,
    profit: 6.300000000000001,
    status: 'completed'
  },
  {
    id: 'v_25_848_ung6',
    date: '2025-12-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1848',
        productName: 'Par Alto Falante Snake Pro ESV320 6 Polegada 320W RMS 4 Ohms',
        quantity: 1,
        costPrice: 0,
        salePrice: 21,
        total: 21
      },
    ],
    clientName: '251205HE7YTHM6',
    paymentMethod: 'money',
    total: 21,
    totalCost: 0,
    profit: 21,
    status: 'completed'
  },
  {
    id: 'v_25_849_9gko',
    date: '2025-12-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1849',
        productName: 'Mini Máquina De Costura Manual Portátil De Mão Tecido',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 15.13,
        total: 15.13
      },
    ],
    clientName: '251208SMPRG11A',
    paymentMethod: 'money',
    total: 15.13,
    totalCost: 7.5,
    profit: 7.630000000000001,
    status: 'completed'
  },
  {
    id: 'v_25_850_8rf4',
    date: '2025-12-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1850',
        productName: 'Cheirinho para Carro Harts by Hungria',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.8,
        total: 13.8
      },
    ],
    clientName: '251208R3JYP1TD',
    paymentMethod: 'money',
    total: 13.8,
    totalCost: 7.5,
    profit: 6.300000000000001,
    status: 'completed'
  },
  {
    id: 'v_25_851_sgyo',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1851',
        productName: 'Protetor De Rg',
        quantity: 1,
        costPrice: 3,
        salePrice: 4.43,
        total: 4.43
      },
    ],
    clientName: '251207QQBN0Q1H',
    paymentMethod: 'money',
    total: 4.43,
    totalCost: 3,
    profit: 1.4299999999999997,
    status: 'completed'
  },
  {
    id: 'v_25_852_ita6',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1852',
        productName: 'micro SD 32gb',
        quantity: 1,
        costPrice: 15,
        salePrice: 34,
        total: 34
      },
    ],
    paymentMethod: 'money',
    total: 34,
    totalCost: 15,
    profit: 19,
    status: 'completed'
  },
  {
    id: 'v_25_853_l94o',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1853',
        productName: 'Adaptador display  porte',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_854_mtcr',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 10,
        costPrice: 5,
        salePrice: 9,
        total: 90
      },
    ],
    paymentMethod: 'money',
    total: 100,
    totalCost: 50,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_855_3f1t',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1855',
        productName: 'Jogos ps2 leo',
        quantity: 5,
        costPrice: 1,
        salePrice: 5,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 5,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_856_809v',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1856',
        productName: 'Guarda chuva',
        quantity: 2,
        costPrice: 20,
        salePrice: 35,
        total: 70
      },
    ],
    clientName: 'andre',
    paymentMethod: 'money',
    total: 70,
    totalCost: 40,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_857_e1wf',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1857',
        productName: 'pilha AA recarregavel',
        quantity: 1,
        costPrice: 35,
        salePrice: 45,
        total: 45
      },
    ],
    clientName: 'andre',
    paymentMethod: 'money',
    total: 45,
    totalCost: 35,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_858_whte',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1858',
        productName: 'Carregador pilhas recarregavel',
        quantity: 1,
        costPrice: 20,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'andre',
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_859_vr4e',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1111',
        productName: 'Cascata Led - Fios De Fada',
        quantity: 1,
        costPrice: 12.88,
        salePrice: 23.18,
        total: 23.18
      },
    ],
    clientName: 'andre',
    paymentMethod: 'money',
    total: 15.09,
    totalCost: 12.88,
    profit: 2.209999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_860_fsqm',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1860',
        productName: 'lanterna de cabeça',
        quantity: 1,
        costPrice: 19,
        salePrice: 35,
        total: 35
      },
    ],
    clientName: 'Francisco',
    paymentMethod: 'money',
    total: 35,
    totalCost: 19,
    profit: 16,
    status: 'completed'
  },
  {
    id: 'v_25_861_89x8',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'wisley',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_862_v9ap',
    date: '2025-12-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1862',
        productName: 'memoria 4gb ddr2',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'wisley',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_25_863_yct2',
    date: '2025-12-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1863',
        productName: 'Pendrive gravada',
        quantity: 1,
        costPrice: 15,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 15,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_864_49nm',
    date: '2025-12-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1864',
        productName: 'arminha de gel',
        quantity: 1,
        costPrice: 38,
        salePrice: 60,
        total: 60
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 60,
    totalCost: 38,
    profit: 22,
    status: 'completed'
  },
  {
    id: 'v_25_865_24je',
    date: '2025-12-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1143',
        productName: 'Durex',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    clientName: 'cacheados',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_866_6qzb',
    date: '2025-12-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1866',
        productName: 'fone de ouvido pmcell',
        quantity: 1,
        costPrice: 4,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_25_867_v3cr',
    date: '2025-12-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1867',
        productName: 'baby good',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_868_xyp2',
    date: '2025-12-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1868',
        productName: 'caneta 24 cores',
        quantity: 1,
        costPrice: 14,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 14,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_869_422c',
    date: '2025-12-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1869',
        productName: '3 par evok 300w',
        quantity: 1,
        costPrice: 0,
        salePrice: 270,
        total: 270
      },
    ],
    paymentMethod: 'money',
    total: 270,
    totalCost: 0,
    profit: 270,
    status: 'completed'
  },
  {
    id: 'v_25_870_dqyx',
    date: '2025-12-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1870',
        productName: 'Cabo iphone',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_871_nimn',
    date: '2025-12-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1871',
        productName: 'cabo de força',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_872_jl3g',
    date: '2025-12-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1872',
        productName: 'suporte de celular articulado',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_873_aga7',
    date: '2025-12-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1873',
        productName: 'suporte de celular articulado',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'Vall',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_874_uo5o',
    date: '2025-12-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1083',
        productName: 'Capinha Simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_875_5zc1',
    date: '2025-12-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1875',
        productName: 'bomba de pneu eletrico',
        quantity: 1,
        costPrice: 100,
        salePrice: 185,
        total: 185
      },
    ],
    clientName: 'alexandre',
    paymentMethod: 'money',
    total: 185,
    totalCost: 100,
    profit: 85,
    status: 'completed'
  },
  {
    id: 'v_25_876_shwa',
    date: '2025-12-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1876',
        productName: 'Pendrive 32gb',
        quantity: 1,
        costPrice: 15,
        salePrice: 35,
        total: 35
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 15,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_25_877_jddt',
    date: '2025-12-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1877',
        productName: 'cabo de iphone',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_25_878_sip6',
    date: '2025-12-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_25_879_gu6j',
    date: '2025-12-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_880_w1af',
    date: '2025-12-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1880',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_881_p01j',
    date: '2025-12-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1029',
        productName: 'Boneco Lego',
        quantity: 1,
        costPrice: 15,
        salePrice: 27,
        total: 27
      },
    ],
    clientName: 'manu',
    paymentMethod: 'money',
    total: 25,
    totalCost: 15,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_882_ai28',
    date: '2025-12-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1882',
        productName: 'raquete eletrica',
        quantity: 1,
        costPrice: 25,
        salePrice: 40,
        total: 40
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 40,
    totalCost: 25,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_883_thw7',
    date: '2025-12-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1883',
        productName: 'SSD 120gb',
        quantity: 1,
        costPrice: 40,
        salePrice: 100,
        total: 100
      },
    ],
    paymentMethod: 'money',
    total: 100,
    totalCost: 40,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_25_884_yqar',
    date: '2025-12-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1884',
        productName: 'pc dell',
        quantity: 1,
        costPrice: 0,
        salePrice: 200,
        total: 200
      },
    ],
    paymentMethod: 'money',
    total: 200,
    totalCost: 0,
    profit: 200,
    status: 'completed'
  },
  {
    id: 'v_25_885_xdj5',
    date: '2025-12-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1885',
        productName: 'monitor dell',
        quantity: 1,
        costPrice: 100,
        salePrice: 140,
        total: 140
      },
    ],
    paymentMethod: 'money',
    total: 140,
    totalCost: 100,
    profit: 40,
    status: 'completed'
  },
  {
    id: 'v_25_886_rl6u',
    date: '2025-12-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1886',
        productName: 'Máquina De Cabelo Dragão',
        quantity: 1,
        costPrice: 18,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_25_887_zqiq',
    date: '2025-12-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 15,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_25_888_wxh2',
    date: '2025-12-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1888',
        productName: 'carregadro veicular',
        quantity: 1,
        costPrice: 10,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 10,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_889_8huu',
    date: '2025-12-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1889',
        productName: '1 Par Alto 1 Par Alto Falante Evok 6x9 280rms',
        quantity: 1,
        costPrice: 0,
        salePrice: 153,
        total: 153
      },
    ],
    clientName: '251217JA47THQU',
    paymentMethod: 'money',
    total: 153,
    totalCost: 0,
    profit: 153,
    status: 'completed'
  },
  {
    id: 'v_25_890_cqxq',
    date: '2025-12-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1890',
        productName: 'Usina Smart 200',
        quantity: 1,
        costPrice: 0,
        salePrice: 105,
        total: 105
      },
    ],
    clientName: '1733237725498345439',
    paymentMethod: 'money',
    total: 105,
    totalCost: 0,
    profit: 105,
    status: 'completed'
  },
  {
    id: 'v_25_891_fswk',
    date: '2025-12-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1029',
        productName: 'Boneco Lego',
        quantity: 1,
        costPrice: 15,
        salePrice: 27,
        total: 27
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 15,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_892_nf1g',
    date: '2025-12-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1892',
        productName: 'Jogos ps2 leo',
        quantity: 6,
        costPrice: 1,
        salePrice: 5,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 6,
    profit: 24,
    status: 'completed'
  },
  {
    id: 'v_25_893_tsnc',
    date: '2025-12-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1893',
        productName: 'MemoryCard 64mb',
        quantity: 1,
        costPrice: 18,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 18,
    profit: 22,
    status: 'completed'
  },
  {
    id: 'v_25_894_8jg2',
    date: '2025-12-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1894',
        productName: 'Controle ps2 simples',
        quantity: 2,
        costPrice: 10,
        salePrice: 25,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 20,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_25_895_1b07',
    date: '2025-12-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    clientName: '581764922242532626',
    paymentMethod: 'money',
    total: 258,
    totalCost: 305,
    profit: 258,
    status: 'completed'
  },
  {
    id: 'v_25_896_csh4',
    date: '2025-12-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1896',
        productName: 'Bobby god card',
        quantity: 2,
        costPrice: 3,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 6,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_897_f40v',
    date: '2025-12-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1897',
        productName: 'card 50',
        quantity: 1,
        costPrice: 5,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 5,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_898_6fb7',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1029',
        productName: 'Boneco Lego',
        quantity: 1,
        costPrice: 15,
        salePrice: 27,
        total: 27
      },
    ],
    clientName: 'cacheados',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_899_qynd',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1143',
        productName: 'Durex',
        quantity: 2,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 9
      },
    ],
    clientName: 'cacheados',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_900_c7qn',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1900',
        productName: 'Bobby god',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_901_uodi',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1901',
        productName: 'fone bluetooth',
        quantity: 1,
        costPrice: 25,
        salePrice: 40,
        total: 40
      },
    ],
    clientName: 'kadu',
    paymentMethod: 'money',
    total: 40,
    totalCost: 25,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_902_hplp',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1902',
        productName: 'bingo',
        quantity: 1,
        costPrice: 28,
        salePrice: 45,
        total: 45
      },
    ],
    clientName: 'teinha',
    paymentMethod: 'money',
    total: 45,
    totalCost: 28,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_25_903_zfxw',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1903',
        productName: 'Adaptor hdmi ps2',
        quantity: 1,
        costPrice: 20,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_904_21gy',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1904',
        productName: 'jogo de ps2',
        quantity: 1,
        costPrice: 1,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 1,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_25_905_10mx',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1905',
        productName: 'carregador 20w completo',
        quantity: 1,
        costPrice: 15,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'Val pequena',
    paymentMethod: 'money',
    total: 50,
    totalCost: 15,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_25_906_k97l',
    date: '2025-12-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1906',
        productName: 'quebra cabeça',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_907_qpjw',
    date: '2025-12-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_25_908_w33p',
    date: '2025-12-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 350,
    totalCost: 270,
    profit: 80,
    status: 'completed'
  },
  {
    id: 'v_25_909_sqte',
    date: '2025-12-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1909',
        productName: 'Projetor hy320',
        quantity: 1,
        costPrice: 300,
        salePrice: 400,
        total: 400
      },
    ],
    clientName: 'val',
    paymentMethod: 'money',
    total: 400,
    totalCost: 300,
    profit: 100,
    status: 'completed'
  },
  {
    id: 'v_25_910_92a3',
    date: '2025-12-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1910',
        productName: 'ssd 240gb',
        quantity: 1,
        costPrice: 145,
        salePrice: 300,
        total: 300
      },
    ],
    clientName: 'eliane',
    paymentMethod: 'money',
    total: 300,
    totalCost: 145,
    profit: 155,
    status: 'completed'
  },
  {
    id: 'v_25_911_jej0',
    date: '2025-12-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 37.24,
        total: 37.24
      },
    ],
    clientName: '251226BB55U3C7',
    paymentMethod: 'money',
    total: 37.24,
    totalCost: 7,
    profit: 30.240000000000002,
    status: 'completed'
  },
  {
    id: 'v_25_912_e8cx',
    date: '2025-12-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 37.24,
        total: 37.24
      },
    ],
    clientName: '251228GM6DF9FD',
    paymentMethod: 'money',
    total: 37.24,
    totalCost: 7,
    profit: 30.240000000000002,
    status: 'completed'
  },
  {
    id: 'v_25_913_6c15',
    date: '2025-12-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1913',
        productName: 'Controle Com Fio Compatível Com Playstation Ps2',
        quantity: 1,
        costPrice: 10,
        salePrice: 18.5,
        total: 18.5
      },
    ],
    clientName: '251228GQAC35RE',
    paymentMethod: 'money',
    total: 18.5,
    totalCost: 10,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_25_914_lm0q',
    date: '2025-12-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1334',
        productName: 'Uno',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_25_915_0kyz',
    date: '2025-12-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1915',
        productName: 'Slime',
        quantity: 3,
        costPrice: 5,
        salePrice: 10,
        total: 30
      },
    ],
    clientName: 'Sara',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_916_93hd',
    date: '2025-12-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1916',
        productName: 'Jogos ps2 leo',
        quantity: 2,
        costPrice: 1,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 2,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_25_917_3tno',
    date: '2025-12-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1917',
        productName: 'brinquedo mole',
        quantity: 2,
        costPrice: 5,
        salePrice: 10,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_25_918_hpcc',
    date: '2025-12-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1918',
        productName: 'brinquedo mole',
        quantity: 3,
        costPrice: 5,
        salePrice: 10,
        total: 30
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_25_919_n51c',
    date: '2025-12-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1919',
        productName: 'Par Tweeter Tweter Tuita Tuite Evok 400',
        quantity: 1,
        costPrice: 280,
        salePrice: 378.4,
        total: 378.4
      },
    ],
    clientName: '581881466757613048',
    paymentMethod: 'money',
    total: 378.4,
    totalCost: 280,
    profit: 98.39999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_1_qr3y',
    date: '2026-01-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1088',
        productName: 'Carregador Completo Iphone 20W',
        quantity: 1,
        costPrice: 15,
        salePrice: 27,
        total: 27
      },
    ],
    clientName: 'elza',
    paymentMethod: 'money',
    total: 30,
    totalCost: 12,
    profit: 18,
    status: 'completed'
  },
  {
    id: 'v_26_2_8r2v',
    date: '2026-01-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'vall',
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_3_zmdg',
    date: '2026-01-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1117',
        productName: 'Cheirinho',
        quantity: 2,
        costPrice: 0,
        salePrice: 28.1,
        total: 56.2
      },
    ],
    clientName: '26010470HA378U',
    paymentMethod: 'money',
    total: 56.2,
    totalCost: 15,
    profit: 41.2,
    status: 'completed'
  },
  {
    id: 'v_26_4_wnm5',
    date: '2026-01-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1004',
        productName: 'Nterruptor De Controle Remoto',
        quantity: 1,
        costPrice: 15,
        salePrice: 41.6,
        total: 41.6
      },
    ],
    clientName: '2601057PDHKMGS',
    paymentMethod: 'money',
    total: 41.6,
    totalCost: 15,
    profit: 26.6,
    status: 'completed'
  },
  {
    id: 'v_26_5_10cm',
    date: '2026-01-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1337',
        productName: 'Desentupidor',
        quantity: 1,
        costPrice: 12.5,
        salePrice: 22.5,
        total: 22.5
      },
    ],
    clientName: '26010322KX6CM7',
    paymentMethod: 'money',
    total: 14.99,
    totalCost: 12,
    profit: 2.99,
    status: 'completed'
  },
  {
    id: 'v_26_6_3ox2',
    date: '2026-01-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1337',
        productName: 'Desentupidor',
        quantity: 1,
        costPrice: 12.5,
        salePrice: 22.5,
        total: 22.5
      },
    ],
    clientName: '26010321EYMMGF',
    paymentMethod: 'money',
    total: 14.99,
    totalCost: 12,
    profit: 2.99,
    status: 'completed'
  },
  {
    id: 'v_26_7_ydvl',
    date: '2026-01-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1112',
        productName: 'Case 2.5 Hd',
        quantity: 1,
        costPrice: 0,
        salePrice: 34.75,
        total: 34.75
      },
    ],
    clientName: '26010330Y0QYCC',
    paymentMethod: 'money',
    total: 34.75,
    totalCost: 19,
    profit: 15.75,
    status: 'completed'
  },
  {
    id: 'v_26_8_epgm',
    date: '2026-01-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'vall',
    paymentMethod: 'money',
    total: 15,
    totalCost: 6,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_26_9_glr2',
    date: '2026-01-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'boneca',
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_10_fy09',
    date: '2026-01-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1303',
        productName: 'Restauraçao Dados',
        quantity: 1,
        costPrice: 0,
        salePrice: 100,
        total: 100
      },
    ],
    clientName: 'Eliane',
    paymentMethod: 'money',
    total: 100,
    totalCost: 0,
    profit: 100,
    status: 'completed'
  },
  {
    id: 'v_26_11_3s2a',
    date: '2026-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_12_7ema',
    date: '2026-01-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1030',
        productName: 'Boneco Lego Kit',
        quantity: 1,
        costPrice: 0,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 11,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_26_13_zipf',
    date: '2026-01-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_14_1nuv',
    date: '2026-01-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1143',
        productName: 'Durex',
        quantity: 1,
        costPrice: 2.5,
        salePrice: 4.5,
        total: 4.5
      },
    ],
    clientName: 'cacheados',
    paymentMethod: 'money',
    total: 7,
    totalCost: 2.5,
    profit: 4.5,
    status: 'completed'
  },
  {
    id: 'v_26_15_ut72',
    date: '2026-01-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1274',
        productName: 'Moeba',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_16_n2ab',
    date: '2026-01-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_17_w328',
    date: '2026-01-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 2,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 27
      },
    ],
    clientName: '260113UN53PDB3',
    paymentMethod: 'money',
    total: 28.1,
    totalCost: 15,
    profit: 13.100000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_18_3hm6',
    date: '2026-01-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1289',
        productName: 'Pen Drive Com 10 Jogos Para Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 100.32,
        total: 100.32
      },
    ],
    clientName: '1732942733137053663',
    paymentMethod: 'money',
    total: 100.32,
    totalCost: 0,
    profit: 100.32,
    status: 'completed'
  },
  {
    id: 'v_26_19_ljnq',
    date: '2026-01-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'samuel',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_20_gj8x',
    date: '2026-01-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 4,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.52
      },
    ],
    clientName: 'eliane',
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.28,
    profit: 3.7199999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_21_emwe',
    date: '2026-01-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1297',
        productName: 'Protetor Documento',
        quantity: 1,
        costPrice: 0,
        salePrice: 4.54,
        total: 4.54
      },
    ],
    clientName: '26011533GTJVCC',
    paymentMethod: 'money',
    total: 4.54,
    totalCost: 3,
    profit: 1.54,
    status: 'completed'
  },
  {
    id: 'v_26_22_7dcm',
    date: '2026-01-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1221',
        productName: 'Kit Maçarico',
        quantity: 1,
        costPrice: 0,
        salePrice: 52.99,
        total: 52.99
      },
    ],
    clientName: '260115363HXRNS',
    paymentMethod: 'money',
    total: 52.99,
    totalCost: 25,
    profit: 27.990000000000002,
    status: 'completed'
  },
  {
    id: 'v_26_23_lxzd',
    date: '2026-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_26_24_k6s6',
    date: '2026-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1237',
        productName: 'Lixa De Unha',
        quantity: 2,
        costPrice: 0,
        salePrice: 0.5,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0,
    profit: 1,
    status: 'completed'
  },
  {
    id: 'v_26_25_5who',
    date: '2026-01-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_26_26_25tj',
    date: '2026-01-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1121',
        productName: 'Chip Sem Recarga',
        quantity: 1,
        costPrice: 0,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 11,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_26_27_a1qp',
    date: '2026-01-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1031',
        productName: 'Brinquedo Arminha',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    clientName: 'daniel',
    paymentMethod: 'money',
    total: 25,
    totalCost: 12,
    profit: 13,
    status: 'completed'
  },
  {
    id: 'v_26_28_w3d2',
    date: '2026-01-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_29_taor',
    date: '2026-01-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1072',
        productName: 'Caixa De Som Pc',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 15,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_30_mygx',
    date: '2026-01-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1028',
        productName: 'Bolinha De Gel',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 2.5,
    profit: 2.5,
    status: 'completed'
  },
  {
    id: 'v_26_31_r28d',
    date: '2026-01-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_26_32_3tv1',
    date: '2026-01-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 8,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.04
      },
    ],
    paymentMethod: 'money',
    total: 8,
    totalCost: 0.56,
    profit: 7.4399999999999995,
    status: 'completed'
  },
  {
    id: 'v_26_33_8gsd',
    date: '2026-01-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1025',
        productName: 'Bleybleyd',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 25,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_26_34_3jb6',
    date: '2026-01-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1159',
        productName: 'Fone P9',
        quantity: 1,
        costPrice: 0,
        salePrice: 40,
        total: 40
      },
    ],
    clientName: 'brinquedo',
    paymentMethod: 'money',
    total: 40,
    totalCost: 20,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_35_ript',
    date: '2026-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1274',
        productName: 'Moeba',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_36_y42x',
    date: '2026-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1036',
        productName: 'Cabo Colorido',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_37_3nqk',
    date: '2026-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1051',
        productName: 'Cabo Iphone 20W',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'ruiva',
    paymentMethod: 'money',
    total: 20,
    totalCost: 6,
    profit: 14,
    status: 'completed'
  },
  {
    id: 'v_26_38_na34',
    date: '2026-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1082',
        productName: 'Capinha Iphone',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'ruiva',
    paymentMethod: 'money',
    total: 15,
    totalCost: 6.5,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_39_56zc',
    date: '2026-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1040',
        productName: 'Cabo De Força - 3 Pinos',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 6,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_26_40_c9u9',
    date: '2026-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1019',
        productName: 'Arminha De Agua',
        quantity: 2,
        costPrice: 0,
        salePrice: 10,
        total: 20
      },
    ],
    clientName: 'vall',
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_41_mq94',
    date: '2026-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1283',
        productName: 'Opl 16 Mb',
        quantity: 1,
        costPrice: 0,
        salePrice: 35,
        total: 35
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 18,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_26_42_rbcb',
    date: '2026-01-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1042',
        productName: 'Pendrive 32',
        quantity: 1,
        costPrice: 25,
        salePrice: 60,
        total: 60
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 25,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_26_43_5fml',
    date: '2026-01-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1040',
        productName: 'Cabo De Força - 3 Pinos',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'thuane',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_44_1q3q',
    date: '2026-01-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1132',
        productName: 'Conversor Vga Para Hdmi',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'thuane',
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_45_6ksv',
    date: '2026-01-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1282',
        productName: 'Mouse Sem Fio',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'thuane',
    paymentMethod: 'money',
    total: 30,
    totalCost: 18,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_46_z16b',
    date: '2026-01-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260120HKJW21F6',
    paymentMethod: 'money',
    total: 11.2,
    totalCost: 7.5,
    profit: 3.6999999999999993,
    status: 'completed'
  },
  {
    id: 'v_26_47_9t5w',
    date: '2026-01-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1332',
        productName: 'Tweeter Evok 400',
        quantity: 1,
        costPrice: 0,
        salePrice: 45.84,
        total: 45.84
      },
    ],
    clientName: '260120HW0K4N7G',
    paymentMethod: 'money',
    total: 45.84,
    totalCost: 0,
    profit: 45.84,
    status: 'completed'
  },
  {
    id: 'v_26_48_13lt',
    date: '2026-01-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 55.2,
        total: 55.2
      },
    ],
    clientName: '582149843775227',
    paymentMethod: 'money',
    total: 55.2,
    totalCost: 7,
    profit: 48.2,
    status: 'completed'
  },
  {
    id: 'v_26_49_a6jv',
    date: '2026-01-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 12,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 1.56
      },
    ],
    clientName: 'sonia',
    paymentMethod: 'money',
    total: 12,
    totalCost: 0.8400000000000001,
    profit: 11.16,
    status: 'completed'
  },
  {
    id: 'v_26_50_qro3',
    date: '2026-01-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 2,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.26
      },
    ],
    clientName: 'BONECA',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.14,
    profit: 1.8599999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_51_jr3y',
    date: '2026-01-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1116',
        productName: 'Chaveiro',
        quantity: 1,
        costPrice: 0,
        salePrice: 3,
        total: 3
      },
    ],
    clientName: 'aysha',
    paymentMethod: 'money',
    total: 3,
    totalCost: 0,
    profit: 3,
    status: 'completed'
  },
  {
    id: 'v_26_52_imi7',
    date: '2026-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1177',
        productName: 'Formatação',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    clientName: 'alexandre',
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_26_53_27h2',
    date: '2026-01-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'Eliane',
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_26_54_umz1',
    date: '2026-01-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1334',
        productName: 'Uno',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'manu',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_55_d9b1',
    date: '2026-01-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 5,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.65
      },
    ],
    clientName: 'relogio',
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.35000000000000003,
    profit: 4.65,
    status: 'completed'
  },
  {
    id: 'v_26_56_rh4m',
    date: '2026-01-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26012501R0305B',
    paymentMethod: 'money',
    total: 6.26,
    totalCost: 0.7,
    profit: 5.56,
    status: 'completed'
  },
  {
    id: 'v_26_57_wsdi',
    date: '2026-01-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1122',
        productName: 'Coleção_4_Jogos_Ben_10_Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 6.26,
        total: 6.26
      },
    ],
    clientName: '260125W10MYBA6',
    paymentMethod: 'money',
    total: 6.26,
    totalCost: 2.8,
    profit: 3.46,
    status: 'completed'
  },
  {
    id: 'v_26_58_a1vw',
    date: '2026-01-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1213',
        productName: 'Kit Com 10 Mini Fusível',
        quantity: 1,
        costPrice: 0,
        salePrice: 17.06,
        total: 17.06
      },
    ],
    clientName: '260123QKXEPFNT',
    paymentMethod: 'money',
    total: 17.06,
    totalCost: 4.5,
    profit: 12.559999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_59_mqj1',
    date: '2026-01-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 45.39,
        total: 45.39
      },
    ],
    clientName: '2601262EWM7HSQ',
    paymentMethod: 'money',
    total: 45.39,
    totalCost: 7,
    profit: 38.39,
    status: 'completed'
  },
  {
    id: 'v_26_60_aw0u',
    date: '2026-01-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26012643AWWXYN',
    paymentMethod: 'money',
    total: 8.31,
    totalCost: 0.7,
    profit: 7.61,
    status: 'completed'
  },
  {
    id: 'v_26_61_tn7n',
    date: '2026-01-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    clientName: 'luiz',
    paymentMethod: 'money',
    total: 360,
    totalCost: 275,
    profit: 85,
    status: 'completed'
  },
  {
    id: 'v_26_62_znzh',
    date: '2026-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26012877ASXSW2',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_63_8ugp',
    date: '2026-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26012879CE069S',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_64_d6kp',
    date: '2026-01-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '2601287HCSF395',
    paymentMethod: 'money',
    total: 14.04,
    totalCost: 7.5,
    profit: 6.539999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_65_a26j',
    date: '2026-01-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2601288URC8VEF',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_66_y4ml',
    date: '2026-01-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1083',
        productName: 'Capinha Simples',
        quantity: 2,
        costPrice: 0,
        salePrice: 10,
        total: 20
      },
    ],
    clientName: 'remdio',
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_67_ohs4',
    date: '2026-01-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1108',
        productName: 'Cartao Micro Sd 16Gb',
        quantity: 1,
        costPrice: 0,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 14,
    profit: 26,
    status: 'completed'
  },
  {
    id: 'v_26_68_385z',
    date: '2026-01-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_69_f97u',
    date: '2026-01-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 45.39,
        total: 45.39
      },
    ],
    clientName: '260131E6UQ7MER',
    paymentMethod: 'money',
    total: 45.39,
    totalCost: 0,
    profit: 45.39,
    status: 'completed'
  },
  {
    id: 'v_26_70_k9ud',
    date: '2026-01-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_71_ks9y',
    date: '2026-01-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_1207',
        productName: 'Kit 10 Jogos Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 55.2,
        total: 55.2
      },
    ],
    clientName: '582355031501800714',
    paymentMethod: 'money',
    total: 55.2,
    totalCost: 0,
    profit: 55.2,
    status: 'completed'
  },
  {
    id: 'v_26_72_ctqo',
    date: '2026-01-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1320',
        productName: 'Suporte Veicular',
        quantity: 1,
        costPrice: 12,
        salePrice: 21.6,
        total: 21.6
      },
    ],
    clientName: 'gian',
    paymentMethod: 'money',
    total: 20,
    totalCost: 12,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_26_73_7c9n',
    date: '2026-01-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1051',
        productName: 'Cabo Iphone 20W',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'gian',
    paymentMethod: 'money',
    total: 30,
    totalCost: 5,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_26_74_uzu1',
    date: '2026-01-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_1229',
        productName: 'Lanterna',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_75_ma65',
    date: '2026-02-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 3,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 3.7800000000000002
      },
    ],
    clientName: '260202KGB8PW0S',
    paymentMethod: 'money',
    total: 66.06,
    totalCost: 2.0999999999999996,
    profit: 63.96,
    status: 'completed'
  },
  {
    id: 'v_26_76_t8ek',
    date: '2026-02-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260202KDJAYA04',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_77_z3v2',
    date: '2026-02-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260202KB9XFY1F',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_78_2xzw',
    date: '2026-02-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 2,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 2.52
      },
    ],
    clientName: '260201HUCC9A14',
    paymentMethod: 'money',
    total: 29.98,
    totalCost: 1.4,
    profit: 28.580000000000002,
    status: 'completed'
  },
  {
    id: 'v_26_79_zg0h',
    date: '2026-02-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260130BPA5UXQ0',
    paymentMethod: 'money',
    total: 14.04,
    totalCost: 7.5,
    profit: 6.539999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_80_2xqt',
    date: '2026-02-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 2,
        costPrice: 0,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 2.8,
    profit: 7.2,
    status: 'completed'
  },
  {
    id: 'v_26_81_orjf',
    date: '2026-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_82_zxr4',
    date: '2026-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1337',
        productName: 'Desentupidor',
        quantity: 1,
        costPrice: 12.5,
        salePrice: 22.5,
        total: 22.5
      },
    ],
    clientName: '260203QVC1NHGG',
    paymentMethod: 'money',
    total: 18.79,
    totalCost: 12,
    profit: 6.789999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_83_sj0o',
    date: '2026-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260203PK6Y0A25',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_84_4s2r',
    date: '2026-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260203PRHGUC97',
    paymentMethod: 'money',
    total: 7.2,
    totalCost: 0.7,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_85_w312',
    date: '2026-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260203Q3C34DNC',
    paymentMethod: 'money',
    total: 14.99,
    totalCost: 7.5,
    profit: 7.49,
    status: 'completed'
  },
  {
    id: 'v_26_86_0est',
    date: '2026-02-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260203QJNTUWSC',
    paymentMethod: 'money',
    total: 14.04,
    totalCost: 7.5,
    profit: 6.539999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_87_xbl9',
    date: '2026-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1042',
        productName: 'Cabo De Rede',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_88_c869',
    date: '2026-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1337',
        productName: 'Desentupidor',
        quantity: 1,
        costPrice: 12.5,
        salePrice: 22.5,
        total: 22.5
      },
    ],
    clientName: '260205TXSABCRN',
    paymentMethod: 'money',
    total: 18.79,
    totalCost: 12.5,
    profit: 6.289999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_89_x42a',
    date: '2026-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260205TXVP1P5N',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_90_pdif',
    date: '2026-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1132',
        productName: 'Conversor Vga Para Hdmi',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'Clauberto',
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_91_089y',
    date: '2026-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1040',
        productName: 'Cabo De Força - 3 Pinos',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'Clauberto',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_92_ds7s',
    date: '2026-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1069',
        productName: 'Cabo Vga',
        quantity: 1,
        costPrice: 9,
        salePrice: 16.2,
        total: 16.2
      },
    ],
    clientName: 'Clauberto',
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_93_8l7i',
    date: '2026-02-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260205UK2H546J',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_94_vrgx',
    date: '2026-02-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2602060TRY2SPR',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_95_cpmf',
    date: '2026-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26020619R29YC5',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_96_z6cw',
    date: '2026-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2602061AFHRWQS',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_97_juam',
    date: '2026-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1097',
        productName: 'Carregador lehmox tipo c',
        quantity: 1,
        costPrice: 11,
        salePrice: 35,
        total: 35
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 11,
    profit: 24,
    status: 'completed'
  },
  {
    id: 'v_26_98_peus',
    date: '2026-02-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1229',
        productName: 'Lanterna',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_99_yjfz',
    date: '2026-02-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1099',
        productName: 'adaptador hdmi ps2',
        quantity: 1,
        costPrice: 20,
        salePrice: 45,
        total: 45
      },
    ],
    paymentMethod: 'money',
    total: 45,
    totalCost: 20,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_26_100_fdy8',
    date: '2026-02-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1129',
        productName: 'Controle Ps2',
        quantity: 1,
        costPrice: 20,
        salePrice: 36,
        total: 36
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_101_6zl9',
    date: '2026-02-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2602087DYXN63P',
    paymentMethod: 'money',
    total: 7.2,
    totalCost: 0.7,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_102_3ha2',
    date: '2026-02-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 2,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 27
      },
    ],
    clientName: '26020987RHU086',
    paymentMethod: 'money',
    total: 28.1,
    totalCost: 15,
    profit: 13.100000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_103_8i28',
    date: '2026-02-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 3,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.39
      },
    ],
    clientName: 'francisco relogio',
    paymentMethod: 'money',
    total: 3,
    totalCost: 0.21000000000000002,
    profit: 2.79,
    status: 'completed'
  },
  {
    id: 'v_26_104_2o7g',
    date: '2026-02-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 6,
        costPrice: 0,
        salePrice: 5,
        total: 30
      },
    ],
    clientName: 'aleatorio uber',
    paymentMethod: 'money',
    total: 30,
    totalCost: 4.199999999999999,
    profit: 25.8,
    status: 'completed'
  },
  {
    id: 'v_26_105_ggwu',
    date: '2026-02-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 2,
        costPrice: 0,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 1.4,
    profit: 8.6,
    status: 'completed'
  },
  {
    id: 'v_26_106_y95h',
    date: '2026-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1282',
        productName: 'Mouse Sem Fio',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'eliane',
    paymentMethod: 'money',
    total: 30,
    totalCost: 0,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_26_107_o6i9',
    date: '2026-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1107',
        productName: 'fone i12',
        quantity: 1,
        costPrice: 0,
        salePrice: 35,
        total: 35
      },
    ],
    clientName: 'sarah',
    paymentMethod: 'money',
    total: 35,
    totalCost: 0,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_26_108_k0l7',
    date: '2026-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2602098NVFCAP8',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_109_cwly',
    date: '2026-02-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0.7,
    profit: 4.3,
    status: 'completed'
  },
  {
    id: 'v_26_110_e7u7',
    date: '2026-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1110',
        productName: 'carregador simples',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_111_yad9',
    date: '2026-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1337',
        productName: 'Desentupidor',
        quantity: 1,
        costPrice: 12.5,
        salePrice: 22.5,
        total: 22.5
      },
    ],
    clientName: '260211EY108RQH',
    paymentMethod: 'money',
    total: 18.79,
    totalCost: 12.5,
    profit: 6.289999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_112_35xb',
    date: '2026-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 6,
    profit: 24,
    status: 'completed'
  },
  {
    id: 'v_26_113_qifa',
    date: '2026-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260211EVXGJHUB',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_114_4mh1',
    date: '2026-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260212G46PXBNW',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_115_8fv7',
    date: '2026-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260212G72M35W6',
    paymentMethod: 'money',
    total: 12.14,
    totalCost: 7.5,
    profit: 4.640000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_116_smyh',
    date: '2026-02-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 3,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 40.5
      },
    ],
    clientName: '260212G4R2W2EE',
    paymentMethod: 'money',
    total: 36.44,
    totalCost: 22.5,
    profit: 13.939999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_117_hkj2',
    date: '2026-02-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1108',
        productName: 'Cartao Micro Sd 16Gb',
        quantity: 1,
        costPrice: 0,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'feicenter',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_118_ebl8',
    date: '2026-02-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1118',
        productName: 'cooles',
        quantity: 2,
        costPrice: 0,
        salePrice: 10,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 0,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_119_e1in',
    date: '2026-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 2,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 2.52
      },
    ],
    clientName: '260213JQR733AV',
    paymentMethod: 'money',
    total: 14.42,
    totalCost: 1.4,
    profit: 13.02,
    status: 'completed'
  },
  {
    id: 'v_26_120_ylzw',
    date: '2026-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260213JDRSN8HV',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_121_s80s',
    date: '2026-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260213HSDSJMQX',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_122_xiy5',
    date: '2026-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1122',
        productName: 'opl',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_123_uzig',
    date: '2026-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1123',
        productName: 'memorycard',
        quantity: 1,
        costPrice: 20,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 20,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_26_124_swot',
    date: '2026-02-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1124',
        productName: 'Power Vox 12 Polegadas 800w',
        quantity: 1,
        costPrice: 0,
        salePrice: 186.51999999999998,
        total: 186.51999999999998
      },
    ],
    clientName: '260214MX09MKJK',
    paymentMethod: 'money',
    total: 186.51999999999998,
    totalCost: 0,
    profit: 186.51999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_125_zyl1',
    date: '2026-02-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_126_kars',
    date: '2026-02-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1126',
        productName: 'gatilho simples',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_26_127_59zx',
    date: '2026-02-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260214PRACWP1G',
    paymentMethod: 'money',
    total: 7.2,
    totalCost: 0.7,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_128_ip3v',
    date: '2026-02-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260214NC6AV4AW',
    paymentMethod: 'money',
    total: 7.2,
    totalCost: 0.7,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_129_dnm5',
    date: '2026-02-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260215S10WG2NV',
    paymentMethod: 'money',
    total: 7.2,
    totalCost: 0.7,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_130_zh5j',
    date: '2026-02-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260215QY2AJYYW',
    paymentMethod: 'money',
    total: 7.2,
    totalCost: 0.7,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_131_r55n',
    date: '2026-02-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260215S0NNWVA1',
    paymentMethod: 'money',
    total: 7.2,
    totalCost: 0.7,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_132_dfhv',
    date: '2026-02-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1132',
        productName: 'Protetor De Rg',
        quantity: 1,
        costPrice: 3,
        salePrice: 4.54,
        total: 4.54
      },
    ],
    clientName: '260216UC5PEXQS',
    paymentMethod: 'money',
    total: 4.54,
    totalCost: 3,
    profit: 1.54,
    status: 'completed'
  },
  {
    id: 'v_26_133_vkiy',
    date: '2026-02-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260216T9YQWBCN',
    paymentMethod: 'money',
    total: 12.14,
    totalCost: 7.5,
    profit: 4.640000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_134_nntq',
    date: '2026-02-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260216UB0PYHCE',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_135_s1cj',
    date: '2026-02-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 3,
        costPrice: 0,
        salePrice: 5,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 2.0999999999999996,
    profit: 12.9,
    status: 'completed'
  },
  {
    id: 'v_26_136_3j4q',
    date: '2026-02-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2602181G0BWP7K',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_137_j1k9',
    date: '2026-02-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '2602170V61Y572',
    paymentMethod: 'money',
    total: 12.14,
    totalCost: 7.5,
    profit: 4.640000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_138_csva',
    date: '2026-02-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1138',
        productName: 'jogo de faqueiro',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'ana',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_139_xt44',
    date: '2026-02-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'ana',
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_140_msuu',
    date: '2026-02-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 2,
        costPrice: 3,
        salePrice: 5.4,
        total: 10.8
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 6,
    profit: 24,
    status: 'completed'
  },
  {
    id: 'v_26_141_o4cg',
    date: '2026-02-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1141',
        productName: 'luvinhas dedo',
        quantity: 2,
        costPrice: 0.5,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 1,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_26_142_fnoy',
    date: '2026-02-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1142',
        productName: 'Adaptador Tomada',
        quantity: 1,
        costPrice: 10,
        salePrice: 18.8,
        total: 18.8
      },
    ],
    clientName: '2602194QD3PDMR',
    paymentMethod: 'money',
    total: 18.8,
    totalCost: 10,
    profit: 8.8,
    status: 'completed'
  },
  {
    id: 'v_26_143_s1rg',
    date: '2026-02-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260219506EESHD',
    paymentMethod: 'money',
    total: 14.04,
    totalCost: 7.5,
    profit: 6.539999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_144_oa21',
    date: '2026-02-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26022088CEW7MH',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_145_d734',
    date: '2026-02-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '582671832439162687',
    paymentMethod: 'money',
    total: 8.99,
    totalCost: 0.7,
    profit: 8.290000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_146_o6ow',
    date: '2026-02-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1336',
        productName: 'kit opl + 32gb',
        quantity: 1,
        costPrice: 34,
        salePrice: 61.2,
        total: 61.2
      },
    ],
    clientName: '582693256409416785',
    paymentMethod: 'money',
    total: 108.2,
    totalCost: 34,
    profit: 74.2,
    status: 'completed'
  },
  {
    id: 'v_26_147_wqjt',
    date: '2026-02-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1147',
        productName: 'pente',
        quantity: 2,
        costPrice: 0,
        salePrice: 5,
        total: 10
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_148_57fe',
    date: '2026-02-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 4,
        costPrice: 0,
        salePrice: 5,
        total: 20
      },
    ],
    clientName: 'alea',
    paymentMethod: 'money',
    total: 20,
    totalCost: 2.8,
    profit: 17.2,
    status: 'completed'
  },
  {
    id: 'v_26_149_uvsh',
    date: '2026-02-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1149',
        productName: 'SSd 240gb',
        quantity: 1,
        costPrice: 0,
        salePrice: 300,
        total: 300
      },
    ],
    clientName: 'cliente instagram',
    paymentMethod: 'money',
    total: 300,
    totalCost: 0,
    profit: 300,
    status: 'completed'
  },
  {
    id: 'v_26_150_soeq',
    date: '2026-02-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1150',
        productName: 'cartinha 50',
        quantity: 1,
        costPrice: 5,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'cliente instagram',
    paymentMethod: 'money',
    total: 20,
    totalCost: 5,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_151_ronk',
    date: '2026-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 2,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 27
      },
    ],
    clientName: '260223DWGFD4CB',
    paymentMethod: 'money',
    total: 24.3,
    totalCost: 15,
    profit: 9.3,
    status: 'completed'
  },
  {
    id: 'v_26_152_zomy',
    date: '2026-02-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1152',
        productName: 'Par Alto Falante Snake Pro ESV320',
        quantity: 1,
        costPrice: 0,
        salePrice: 14.54000000000002,
        total: 14.54000000000002
      },
    ],
    clientName: '260223E5E800MU',
    paymentMethod: 'money',
    total: 14.54000000000002,
    totalCost: 0,
    profit: 14.54000000000002,
    status: 'completed'
  },
  {
    id: 'v_26_153_1axl',
    date: '2026-02-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1336',
        productName: 'kit opl + 32gb',
        quantity: 1,
        costPrice: 34,
        salePrice: 61.2,
        total: 61.2
      },
    ],
    clientName: 'cliente ps2 Victor Brandão',
    paymentMethod: 'money',
    total: 110,
    totalCost: 34,
    profit: 76,
    status: 'completed'
  },
  {
    id: 'v_26_154_zj4a',
    date: '2026-02-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1030',
        productName: 'Boneco Lego Kit',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'mara',
    paymentMethod: 'money',
    total: 10,
    totalCost: 10,
    profit: 0,
    status: 'completed'
  },
  {
    id: 'v_26_155_rf5p',
    date: '2026-02-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '582767102684267825',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_156_dfqx',
    date: '2026-02-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260224HATE1P51',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_157_5nmp',
    date: '2026-02-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1229',
        productName: 'Lanterna',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'relogio',
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_158_srcw',
    date: '2026-02-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 4,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 5.04
      },
    ],
    clientName: '582832973697222108',
    paymentMethod: 'money',
    total: 20,
    totalCost: 2.8,
    profit: 17.2,
    status: 'completed'
  },
  {
    id: 'v_26_159_5uum',
    date: '2026-02-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '582802201370330561',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_160_flz9',
    date: '2026-02-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1160',
        productName: 'cabo hdmi',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'cliente ps2',
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_161_4vpc',
    date: '2026-02-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1161',
        productName: 'ps2',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    clientName: 'cliente ps2',
    paymentMethod: 'money',
    total: 25,
    totalCost: 0,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_26_162_rxg4',
    date: '2026-02-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1162',
        productName: 'adptador hdmi ps2',
        quantity: 1,
        costPrice: 20,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'cliente ps2',
    paymentMethod: 'money',
    total: 30,
    totalCost: 20,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_163_izze',
    date: '2026-02-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1129',
        productName: 'Controle Ps2',
        quantity: 1,
        costPrice: 20,
        salePrice: 36,
        total: 36
      },
    ],
    clientName: 'cliente ps2',
    paymentMethod: 'money',
    total: 15,
    totalCost: 10,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_164_pj3u',
    date: '2026-03-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1164',
        productName: 'mouse pad',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_165_ggu5',
    date: '2026-03-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1165',
        productName: 'computador',
        quantity: 1,
        costPrice: 0,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 0,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_26_166_fbca',
    date: '2026-03-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1166',
        productName: 'computador 1 in all lenovo',
        quantity: 1,
        costPrice: 400,
        salePrice: 600,
        total: 600
      },
    ],
    clientName: 'paulinha',
    paymentMethod: 'money',
    total: 600,
    totalCost: 400,
    profit: 200,
    status: 'completed'
  },
  {
    id: 'v_26_167_kf8q',
    date: '2026-03-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1167',
        productName: 'estensao 10m',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'paulinha',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_168_2l94',
    date: '2026-03-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1039',
        productName: 'Cabo De Força - 2 Pinos',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_169_z7t5',
    date: '2026-03-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1169',
        productName: 'camera dupla',
        quantity: 2,
        costPrice: 140,
        salePrice: 200,
        total: 400
      },
    ],
    clientName: 'patricia',
    paymentMethod: 'money',
    total: 400,
    totalCost: 280,
    profit: 120,
    status: 'completed'
  },
  {
    id: 'v_26_170_2pkr',
    date: '2026-03-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1170',
        productName: 'camera simples',
        quantity: 1,
        costPrice: 90,
        salePrice: 150,
        total: 150
      },
    ],
    clientName: 'patricia',
    paymentMethod: 'money',
    total: 150,
    totalCost: 90,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_26_171_zakz',
    date: '2026-03-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1171',
        productName: 'Cartao de memoria 64gb',
        quantity: 3,
        costPrice: 45,
        salePrice: 55,
        total: 165
      },
    ],
    clientName: 'patricia',
    paymentMethod: 'money',
    total: 165,
    totalCost: 135,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_26_172_eror',
    date: '2026-03-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1172',
        productName: 'brinquedo aviao',
        quantity: 1,
        costPrice: 0,
        salePrice: 8,
        total: 8
      },
    ],
    paymentMethod: 'money',
    total: 8,
    totalCost: 0,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_26_173_25e3',
    date: '2026-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_174_54pk',
    date: '2026-03-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1174',
        productName: 'hd 750gb',
        quantity: 1,
        costPrice: 0,
        salePrice: 80,
        total: 80
      },
    ],
    clientName: 'paulinho',
    paymentMethod: 'money',
    total: 80,
    totalCost: 0,
    profit: 80,
    status: 'completed'
  },
  {
    id: 'v_26_175_fbo6',
    date: '2026-03-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1175',
        productName: 'titwwer',
        quantity: 1,
        costPrice: 0,
        salePrice: 150,
        total: 150
      },
    ],
    clientName: 'olx',
    paymentMethod: 'money',
    total: 150,
    totalCost: 0,
    profit: 150,
    status: 'completed'
  },
  {
    id: 'v_26_176_9nk1',
    date: '2026-03-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1088',
        productName: 'Carregador Completo Iphone 20W',
        quantity: 1,
        costPrice: 15,
        salePrice: 27,
        total: 27
      },
    ],
    clientName: 'elza',
    paymentMethod: 'money',
    total: 50,
    totalCost: 15,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_26_177_ewch',
    date: '2026-03-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '582949664542655793',
    paymentMethod: 'money',
    total: 8.99,
    totalCost: 0.7,
    profit: 8.290000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_178_dr54',
    date: '2026-03-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 2,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 2.52
      },
    ],
    clientName: '582969363430213371',
    paymentMethod: 'money',
    total: 17.98,
    totalCost: 1.4,
    profit: 16.580000000000002,
    status: 'completed'
  },
  {
    id: 'v_26_179_cxea',
    date: '2026-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'aleatoria',
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_180_vwj2',
    date: '2026-03-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1180',
        productName: 'cabo iphone 2m',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_181_2h1o',
    date: '2026-03-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1304',
        productName: 'Serviço Aleatorio',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_182_wskq',
    date: '2026-03-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2603143RH3G5SJ',
    paymentMethod: 'money',
    total: 7.02,
    totalCost: 0.7,
    profit: 6.319999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_183_c9ut',
    date: '2026-03-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260311SUCVJT5B',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_184_f9wd',
    date: '2026-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260312UJJBBAVE',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_185_ynly',
    date: '2026-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260311SA40Y1F8',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_186_4o2c',
    date: '2026-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260311SNXJHKSB',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_187_r6pi',
    date: '2026-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260313103HV5F6',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_188_lvbp',
    date: '2026-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2603131G6CJM2Y',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_189_va8q',
    date: '2026-03-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26031325T58KDX',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_190_z5vp',
    date: '2026-03-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2603143K853WWM',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_191_757s',
    date: '2026-03-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2603145F5U847D',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_192_uzr8',
    date: '2026-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1192',
        productName: 'Case hd 2.5',
        quantity: 1,
        costPrice: 15,
        salePrice: 43.52,
        total: 43.52
      },
    ],
    clientName: '583003560395768948',
    paymentMethod: 'money',
    total: 43.52,
    totalCost: 15,
    profit: 28.520000000000003,
    status: 'completed'
  },
  {
    id: 'v_26_193_9a4f',
    date: '2026-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583028210992842730',
    paymentMethod: 'money',
    total: 8.99,
    totalCost: 0.7,
    profit: 8.290000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_194_7boc',
    date: '2026-03-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583076402794039259',
    paymentMethod: 'money',
    total: 8.99,
    totalCost: 0.7,
    profit: 8.290000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_195_wp5r',
    date: '2026-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1195',
        productName: 'evok 280 rms',
        quantity: 1,
        costPrice: 350,
        salePrice: 453.69,
        total: 453.69
      },
    ],
    clientName: '2603156GA6X2KW',
    paymentMethod: 'money',
    total: 453.69,
    totalCost: 350,
    profit: 103.69,
    status: 'completed'
  },
  {
    id: 'v_26_196_2kt4',
    date: '2026-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2603168MB44W5B',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_197_whgv',
    date: '2026-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2603157YRJQ60Y',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_198_neu9',
    date: '2026-03-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2603168N84XUJ5',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_199_w0mw',
    date: '2026-03-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2603169878A177',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_200_o6it',
    date: '2026-03-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1200',
        productName: 'chip com recarga',
        quantity: 1,
        costPrice: 18.5,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 18.5,
    profit: 11.5,
    status: 'completed'
  },
  {
    id: 'v_26_201_skss',
    date: '2026-03-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1201',
        productName: 'pente',
        quantity: 1,
        costPrice: 0,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 0,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_202_mxyv',
    date: '2026-03-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1190',
        productName: 'Gravação De Musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_203_j4xe',
    date: '2026-03-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1203',
        productName: 'fonte de celular simples',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_204_9phk',
    date: '2026-03-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_1088',
        productName: 'Carregador Completo Iphone 20W',
        quantity: 1,
        costPrice: 15,
        salePrice: 27,
        total: 27
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 15,
    profit: 35,
    status: 'completed'
  },
  {
    id: 'v_26_205_2u9r',
    date: '2026-03-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260320MRH5UP5A',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_206_jnj0',
    date: '2026-03-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260323UA87XECC',
    paymentMethod: 'money',
    total: 14.04,
    totalCost: 7.5,
    profit: 6.539999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_207_n7j1',
    date: '2026-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1207',
        productName: 'fone pmcell',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_26_208_hvx8',
    date: '2026-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1208',
        productName: 'hd 1t',
        quantity: 1,
        costPrice: 0,
        salePrice: 100,
        total: 100
      },
    ],
    clientName: 'paulinho',
    paymentMethod: 'money',
    total: 100,
    totalCost: 0,
    profit: 100,
    status: 'completed'
  },
  {
    id: 'v_26_209_pc05',
    date: '2026-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583086581104871031',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_210_3e6e',
    date: '2026-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583098538648110579',
    paymentMethod: 'money',
    total: 8.99,
    totalCost: 0.7,
    profit: 8.290000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_211_878x',
    date: '2026-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583114960457861054',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_212_7me8',
    date: '2026-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583128761118000431',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_213_8pbq',
    date: '2026-03-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583128912663119443',
    paymentMethod: 'money',
    total: 8.99,
    totalCost: 0.7,
    profit: 8.290000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_214_dbir',
    date: '2026-03-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583155029219772144',
    paymentMethod: 'money',
    total: 8.99,
    totalCost: 0.7,
    profit: 8.290000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_215_tbd8',
    date: '2026-03-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 2,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 2.52
      },
    ],
    clientName: '583191996668544497',
    paymentMethod: 'money',
    total: 27.2,
    totalCost: 1.4,
    profit: 25.8,
    status: 'completed'
  },
  {
    id: 'v_26_216_u0c3',
    date: '2026-03-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1216',
        productName: 'notebook terceiro',
        quantity: 1,
        costPrice: 0,
        salePrice: 80,
        total: 80
      },
    ],
    paymentMethod: 'money',
    total: 80,
    totalCost: 0,
    profit: 80,
    status: 'completed'
  },
  {
    id: 'v_26_217_bmtu',
    date: '2026-03-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 6,
        costPrice: 0,
        salePrice: 5,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 4.199999999999999,
    profit: 25.8,
    status: 'completed'
  },
  {
    id: 'v_26_218_wpyu',
    date: '2026-03-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1218',
        productName: 'frigideira ovo',
        quantity: 1,
        costPrice: 35,
        salePrice: 50,
        total: 50
      },
    ],
    clientName: 'santa',
    paymentMethod: 'money',
    total: 50,
    totalCost: 35,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_219_d32i',
    date: '2026-03-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1219',
        productName: 'bolsa termica',
        quantity: 1,
        costPrice: 25,
        salePrice: 40,
        total: 40
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 40,
    totalCost: 25,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_220_1jkl',
    date: '2026-03-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1282',
        productName: 'Mouse Sem Fio',
        quantity: 1,
        costPrice: 0,
        salePrice: 35,
        total: 35
      },
    ],
    clientName: 'eliane',
    paymentMethod: 'money',
    total: 35,
    totalCost: 18,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_26_221_mi8b',
    date: '2026-03-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1221',
        productName: 'cabo tipo c',
        quantity: 2,
        costPrice: 4,
        salePrice: 15,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 8,
    profit: 22,
    status: 'completed'
  },
  {
    id: 'v_26_222_njne',
    date: '2026-03-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1222',
        productName: 'formataçao',
        quantity: 1,
        costPrice: 0,
        salePrice: 60,
        total: 60
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 0,
    profit: 60,
    status: 'completed'
  },
  {
    id: 'v_26_223_16vx',
    date: '2026-03-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1223',
        productName: 'gravaçao',
        quantity: 1,
        costPrice: 0,
        salePrice: 1,
        total: 1
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0,
    profit: 1,
    status: 'completed'
  },
  {
    id: 'v_26_224_200k',
    date: '2026-03-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1224',
        productName: 'balança grande',
        quantity: 1,
        costPrice: 35,
        salePrice: 60,
        total: 60
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 60,
    totalCost: 35,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_26_225_vdsz',
    date: '2026-03-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1225',
        productName: 'mochila termica',
        quantity: 1,
        costPrice: 25,
        salePrice: 40,
        total: 40
      },
    ],
    clientName: 'mara',
    paymentMethod: 'money',
    total: 40,
    totalCost: 25,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_226_ni4u',
    date: '2026-04-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 6,
        costPrice: 0,
        salePrice: 5,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 4.199999999999999,
    profit: 25.8,
    status: 'completed'
  },
  {
    id: 'v_26_227_4blt',
    date: '2026-04-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 2,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 27
      },
    ],
    clientName: '2604052N4YAKVP',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_228_dqsb',
    date: '2026-04-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260403U0Q395NK',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_229_r4di',
    date: '2026-04-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260403TU7QV6XT',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_230_up3l',
    date: '2026-04-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260401NR0BA272',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_231_1nm8',
    date: '2026-04-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260328BWM81AGS',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_232_xne0',
    date: '2026-04-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260409CD2W2XJB',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_233_6esf',
    date: '2026-04-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260409BFX8SS7A',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_234_cafz',
    date: '2026-04-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260409BSHH7E0Q',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_235_xltr',
    date: '2026-04-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2604089DYV9NFE',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_236_ujq6',
    date: '2026-04-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2604088H2RCBCG',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_237_5kf3',
    date: '2026-04-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2604088EAMB58S',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_238_y00v',
    date: '2026-04-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26040888X1M69H',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_239_lx08',
    date: '2026-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '2604088WQH4MP3',
    paymentMethod: 'money',
    total: 12.14,
    totalCost: 7.5,
    profit: 4.640000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_240_hd1m',
    date: '2026-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '2604077VFTMCCS',
    paymentMethod: 'money',
    total: 12.14,
    totalCost: 7.5,
    profit: 4.640000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_241_2y3h',
    date: '2026-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583421944481809850',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_242_ucd7',
    date: '2026-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583435469169263884',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_243_uhnc',
    date: '2026-04-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583436730013615732',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_244_gtez',
    date: '2026-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1244',
        productName: 'cabo iphone',
        quantity: 1,
        costPrice: 4,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'vall pequena',
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_26_245_fa57',
    date: '2026-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'matheus',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_246_xbzz',
    date: '2026-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260410DK38AXXA',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_247_lik8',
    date: '2026-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260410DP6H17MK',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_248_yr49',
    date: '2026-04-10T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260410F789WW11',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_249_7n7g',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    clientName: 'marcelo pai',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3,
    profit: 7,
    status: 'completed'
  },
  {
    id: 'v_26_250_auto',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'relogio',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_251_acts',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1251',
        productName: 'pc dell',
        quantity: 1,
        costPrice: 0,
        salePrice: 325,
        total: 325
      },
    ],
    paymentMethod: 'money',
    total: 325,
    totalCost: 0,
    profit: 325,
    status: 'completed'
  },
  {
    id: 'v_26_252_w3b2',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1252',
        productName: 'carregador completo tipo c',
        quantity: 1,
        costPrice: 10,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_253_n545',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1253',
        productName: 'cabo iphone',
        quantity: 1,
        costPrice: 5,
        salePrice: 28.3,
        total: 28.3
      },
    ],
    clientName: '260413PV0SU306',
    paymentMethod: 'money',
    total: 28.3,
    totalCost: 5,
    profit: 23.3,
    status: 'completed'
  },
  {
    id: 'v_26_254_2sle',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260411HKY18FYT',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_255_gbo5',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260401NR0BA272',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_256_fkj0',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 4,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 5.04
      },
    ],
    clientName: '260413NCR54MQE',
    paymentMethod: 'money',
    total: 16.9,
    totalCost: 2.8,
    profit: 14.099999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_257_usmq',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1344',
        productName: 'Evok 6\'\' 6mb300 300w Rms Mid Bass',
        quantity: 1,
        costPrice: 350,
        salePrice: 630,
        total: 630
      },
    ],
    clientName: '260414R65317J0',
    paymentMethod: 'money',
    total: 414.33,
    totalCost: 350,
    profit: 64.32999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_258_rpid',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260411G5FBQ3XV',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_259_ega5',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260411GFJ31RRA',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_260_70a1',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260412JPXBAC7T',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_261_5mwr',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260413MR5QNNP9',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_262_9bf0',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260412K9E3GT7K',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_263_ihh6',
    date: '2026-04-11T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260413NHDG2M9S',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_264_qg4v',
    date: '2026-04-12T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1264',
        productName: 'Lanterna Multiuso 8 Em 1',
        quantity: 1,
        costPrice: 10,
        salePrice: 18.22,
        total: 18.22
      },
    ],
    clientName: '260412KUNPAFPG',
    paymentMethod: 'money',
    total: 18.22,
    totalCost: 10,
    profit: 8.219999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_265_rg96',
    date: '2026-04-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260413NQ1NXHYE',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_266_sn4l',
    date: '2026-04-14T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260413PVYRRD3C',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_267_i248',
    date: '2026-04-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260415SNH97YP2',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_268_jv7c',
    date: '2026-04-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1264',
        productName: 'Mini Máquina De Costura',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260414Q9STB3DN',
    paymentMethod: 'money',
    total: 15.38,
    totalCost: 7.5,
    profit: 7.880000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_269_5j8e',
    date: '2026-04-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260414QVW70J9K',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_270_t1x3',
    date: '2026-04-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2604172JHMVSDW',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_271_6219',
    date: '2026-04-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26041847PHYC32',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_272_qqmb',
    date: '2026-04-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1264',
        productName: 'Mini Máquina De Costura',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '26041619KGDYFH',
    paymentMethod: 'money',
    total: 15.38,
    totalCost: 7.5,
    profit: 7.880000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_273_1ok9',
    date: '2026-04-17T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2604184UTQHWTB',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_274_mubu',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1274',
        productName: 'fone de ouvido para iphone',
        quantity: 1,
        costPrice: 15,
        salePrice: 30,
        total: 30
      },
    ],
    clientName: 'mae bebe',
    paymentMethod: 'money',
    total: 30,
    totalCost: 15,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_275_8je6',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1275',
        productName: 'cabo iphone',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_276_93i1',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583479030878472056',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_277_e7f9',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583479882090972614',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_278_k8r9',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583496655317993267',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_279_zxxy',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 3,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 3.7800000000000002
      },
    ],
    clientName: '583507949532579537',
    paymentMethod: 'money',
    total: 27.599999999999998,
    totalCost: 2.0999999999999996,
    profit: 25.5,
    status: 'completed'
  },
  {
    id: 'v_26_280_92x5',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583508537126847701',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_281_5st2',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583535071876711979',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_282_axbv',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583549454049118089',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_283_cfhs',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 2,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 2.52
      },
    ],
    clientName: '583551026406720705',
    paymentMethod: 'money',
    total: 18.4,
    totalCost: 1.4,
    profit: 17,
    status: 'completed'
  },
  {
    id: 'v_26_284_6x6z',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583553405403694455',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_285_ud5n',
    date: '2026-04-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_1286',
        productName: 'Pelicula 3D',
        quantity: 1,
        costPrice: 3,
        salePrice: 5.4,
        total: 5.4
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_286_a0v2',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1286',
        productName: 'formataçao',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_26_287_0znp',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1287',
        productName: 'adaptador wifi',
        quantity: 1,
        costPrice: 50,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 50,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_288_6ang',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1204',
        productName: 'Jogos De Ps2',
        quantity: 6,
        costPrice: 0,
        salePrice: 5,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 4.199999999999999,
    profit: 25.8,
    status: 'completed'
  },
  {
    id: 'v_26_289_9ibh',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1289',
        productName: 'Power Vox 12 Polegadas 800w',
        quantity: 1,
        costPrice: 600,
        salePrice: 646.4,
        total: 646.4
      },
    ],
    clientName: '260421C6SSPHA5',
    paymentMethod: 'money',
    total: 646.4,
    totalCost: 600,
    profit: 46.39999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_290_oa1v',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1290',
        productName: 'Power Vox 12 Polegadas 800w',
        quantity: 1,
        costPrice: 600,
        salePrice: 646.4,
        total: 646.4
      },
    ],
    clientName: '260421CMEX7DWT',
    paymentMethod: 'money',
    total: 646.4,
    totalCost: 600,
    profit: 46.39999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_291_7zy7',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1291',
        productName: 'Power Vox 12 Polegadas 800w',
        quantity: 1,
        costPrice: 600,
        salePrice: 642.29,
        total: 642.29
      },
    ],
    clientName: '260421CNENTYWD',
    paymentMethod: 'money',
    total: 642.29,
    totalCost: 600,
    profit: 42.289999999999964,
    status: 'completed'
  },
  {
    id: 'v_26_292_wi7e',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260421C89S5NE6',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_293_iblh',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2604209HXS1DJ5',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_294_1zkt',
    date: '2026-04-20T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260420BBSM223J',
    paymentMethod: 'money',
    total: 5.5,
    totalCost: 0.7,
    profit: 4.8,
    status: 'completed'
  },
  {
    id: 'v_26_295_69pn',
    date: '2026-04-21T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1295',
        productName: 'mouse simples',
        quantity: 1,
        costPrice: 5.5,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 5.5,
    profit: 14.5,
    status: 'completed'
  },
  {
    id: 'v_26_296_luk0',
    date: '2026-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1296',
        productName: 'teclado simples',
        quantity: 1,
        costPrice: 19,
        salePrice: 35,
        total: 35
      },
    ],
    clientName: 'kadu',
    paymentMethod: 'money',
    total: 35,
    totalCost: 19,
    profit: 16,
    status: 'completed'
  },
  {
    id: 'v_26_297_k3b5',
    date: '2026-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1297',
        productName: 'cabeça usp',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'boneca',
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_298_m31h',
    date: '2026-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1298',
        productName: 'super cola',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 2,
        total: 2
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.7,
    profit: 1.3,
    status: 'completed'
  },
  {
    id: 'v_26_299_1ivm',
    date: '2026-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1299',
        productName: 'relogio m2',
        quantity: 1,
        costPrice: 10,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_300_6ea0',
    date: '2026-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1300',
        productName: 'gatilho simples',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_26_301_e9l4',
    date: '2026-04-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1301',
        productName: 'smartwhat xaiome',
        quantity: 1,
        costPrice: 150,
        salePrice: 235,
        total: 235
      },
    ],
    clientName: 'mara',
    paymentMethod: 'money',
    total: 235,
    totalCost: 150,
    profit: 85,
    status: 'completed'
  },
  {
    id: 'v_26_302_nsb3',
    date: '2026-05-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1302',
        productName: 'balança digital',
        quantity: 1,
        costPrice: 20,
        salePrice: 35,
        total: 35
      },
    ],
    clientName: 'mae bebe',
    paymentMethod: 'money',
    total: 35,
    totalCost: 20,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_303_8a15',
    date: '2026-05-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_1205',
        productName: 'Jogos De Xbox',
        quantity: 3,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 40.5
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 22.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_26_304_f87n',
    date: '2026-05-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_305_td8w',
    date: '2026-05-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2604280T01SJ8T',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_306_bnuo',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1306',
        productName: 'Power Vox 12 Polegadas 800w',
        quantity: 1,
        costPrice: 600,
        salePrice: 638.2,
        total: 638.2
      },
    ],
    clientName: '260423K0DD8TQ5',
    paymentMethod: 'money',
    total: 638.2,
    totalCost: 600,
    profit: 38.200000000000045,
    status: 'completed'
  },
  {
    id: 'v_26_307_8oox',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1337',
        productName: 'Desentupidor',
        quantity: 1,
        costPrice: 12.5,
        salePrice: 22.5,
        total: 22.5
      },
    ],
    clientName: '260425NRMJTJ1W',
    paymentMethod: 'money',
    total: 18.49,
    totalCost: 15,
    profit: 3.4899999999999984,
    status: 'completed'
  },
  {
    id: 'v_26_308_90fx',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260426RJS23MB2',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_309_i8io',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260426S0SH02BJ',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_310_4w7a',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2605019WWE8B9Y',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_311_qi7c',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '60502AD1TAKX0',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_312_ucwy',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260502B264YRW1',
    paymentMethod: 'money',
    total: 13.8,
    totalCost: 7.5,
    profit: 6.300000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_313_kmq0',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '26042701X1MQWY',
    paymentMethod: 'money',
    total: 13.8,
    totalCost: 7.5,
    profit: 6.300000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_314_vohr',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260505JFA3YXQE',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_315_nhse',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260506MDXPYT4P',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_316_1624',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260506MUHE6AAR',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_317_2wrz',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1317',
        productName: 'carregador completo',
        quantity: 1,
        costPrice: 10,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_318_hcih',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583876539229374042',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_319_q0o4',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1319',
        productName: 'gatilho simples',
        quantity: 1,
        costPrice: 4,
        salePrice: 7.23,
        total: 7.23
      },
    ],
    clientName: '583899379960350386',
    paymentMethod: 'money',
    total: 7.23,
    totalCost: 4,
    profit: 3.2300000000000004,
    status: 'completed'
  },
  {
    id: 'v_26_320_c739',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583915753558738499',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_321_pybm',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583619328241861914',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_322_f6iq',
    date: '2026-05-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583637996265834144',
    paymentMethod: 'money',
    total: 25.04,
    totalCost: 0.7,
    profit: 24.34,
    status: 'completed'
  },
  {
    id: 'v_26_323_wdi1',
    date: '2026-05-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583657289674360718',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_324_4jbn',
    date: '2026-05-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583699368798159949',
    paymentMethod: 'money',
    total: 34.24,
    totalCost: 0.7,
    profit: 33.54,
    status: 'completed'
  },
  {
    id: 'v_26_325_mr0c',
    date: '2026-05-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583729687816472455',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_326_by0r',
    date: '2026-05-06T03:06:28.000Z',
    items: [
      {
        productId: 'p_1338',
        productName: 'Jogo Ps2 tiktok',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '583847449511429402',
    paymentMethod: 'money',
    total: 9.2,
    totalCost: 0.7,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_327_1fbi',
    date: '2026-05-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260507QWTJATPX',
    paymentMethod: 'money',
    total: 8.18,
    totalCost: 0.7,
    profit: 7.4799999999999995,
    status: 'completed'
  },
  {
    id: 'v_26_328_2sso',
    date: '2026-05-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1344',
        productName: 'Evok 6\'\' 6mb300 300w Rms Mid Bass',
        quantity: 1,
        costPrice: 350,
        salePrice: 630,
        total: 630
      },
    ],
    clientName: '260507RR9X6HP4',
    paymentMethod: 'money',
    total: 413.02,
    totalCost: 350,
    profit: 63.01999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_329_m5ox',
    date: '2026-05-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1329',
        productName: 'formataçao',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_26_330_7jjr',
    date: '2026-05-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1330',
        productName: 'super cola',
        quantity: 1,
        costPrice: 0.5,
        salePrice: 2,
        total: 2
      },
    ],
    clientName: 'karol',
    paymentMethod: 'money',
    total: 2,
    totalCost: 0.5,
    profit: 1.5,
    status: 'completed'
  },
  {
    id: 'v_26_331_8b28',
    date: '2026-05-08T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1331',
        productName: 'cabo carregador tipoc',
        quantity: 1,
        costPrice: 4,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_26_332_7kkn',
    date: '2026-05-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1332',
        productName: 'carregador completo',
        quantity: 1,
        costPrice: 10,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_333_26m4',
    date: '2026-05-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1333',
        productName: 'gravaçao musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 0,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_334_rywj',
    date: '2026-05-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1334',
        productName: 'Power Vox 12 Polegadas 800w',
        quantity: 1,
        costPrice: 600,
        salePrice: 638.2,
        total: 638.2
      },
    ],
    clientName: '260513951BNUXD',
    paymentMethod: 'money',
    total: 638.2,
    totalCost: 600,
    profit: 38.200000000000045,
    status: 'completed'
  },
  {
    id: 'v_26_335_p8w8',
    date: '2026-05-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1344',
        productName: 'Evok 6\'\' 6mb300 300w Rms Mid Bass',
        quantity: 1,
        costPrice: 350,
        salePrice: 630,
        total: 630
      },
    ],
    clientName: '2605126P91C4RV',
    paymentMethod: 'money',
    total: 413.02,
    totalCost: 350,
    profit: 63.01999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_336_1qav',
    date: '2026-05-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26051154M47D2S',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_337_f07p',
    date: '2026-05-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26051023Y32UH6',
    paymentMethod: 'money',
    total: 9.13,
    totalCost: 0.7,
    profit: 8.430000000000001,
    status: 'completed'
  },
  {
    id: 'v_26_338_itao',
    date: '2026-05-13T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1338',
        productName: 'carregador tipo c',
        quantity: 1,
        costPrice: 10,
        salePrice: 30,
        total: 30
      },
    ],
    paymentMethod: 'money',
    total: 30,
    totalCost: 10,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_339_jbqa',
    date: '2026-05-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1339',
        productName: 'cabo iphone',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_340_g8d6',
    date: '2026-05-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1340',
        productName: 'carregador veicular',
        quantity: 1,
        costPrice: 15,
        salePrice: 35,
        total: 35
      },
    ],
    paymentMethod: 'money',
    total: 35,
    totalCost: 15,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_341_k0pt',
    date: '2026-05-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1341',
        productName: 'formataçao',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_26_342_e75a',
    date: '2026-05-15T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1342',
        productName: 'cabo iphone',
        quantity: 1,
        costPrice: 5,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 5,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_343_krlz',
    date: '2026-05-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_1202',
        productName: 'Jogo De Xbox',
        quantity: 1,
        costPrice: 5,
        salePrice: 9,
        total: 9
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_344_ij41',
    date: '2026-05-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1344',
        productName: 'luvinhas dedo',
        quantity: 1,
        costPrice: 1,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 1,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_26_345_7jjm',
    date: '2026-05-16T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1345',
        productName: 'formataçao',
        quantity: 1,
        costPrice: 0,
        salePrice: 100,
        total: 100
      },
    ],
    paymentMethod: 'money',
    total: 100,
    totalCost: 0,
    profit: 100,
    status: 'completed'
  },
  {
    id: 'v_26_346_vyn3',
    date: '2026-05-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1346',
        productName: 'cabo e força',
        quantity: 1,
        costPrice: 7,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 7,
    profit: 8,
    status: 'completed'
  },
  {
    id: 'v_26_347_cn6c',
    date: '2026-05-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1347',
        productName: 'bateria 2032',
        quantity: 1,
        costPrice: 1,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 1,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_26_348_m3i0',
    date: '2026-05-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1348',
        productName: 'cabo tipo c',
        quantity: 1,
        costPrice: 5,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 5,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_349_clpx',
    date: '2026-05-18T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1349',
        productName: 'teclado simples',
        quantity: 1,
        costPrice: 20,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 20,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_26_350_o4yh',
    date: '2026-05-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 20,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 2.6
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 1.4000000000000001,
    profit: 8.6,
    status: 'completed'
  },
  {
    id: 'v_26_351_cbe3',
    date: '2026-05-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1339',
        productName: 'Figurinhas copa ifood',
        quantity: 3,
        costPrice: 4.5,
        salePrice: 8.1,
        total: 24.299999999999997
      },
    ],
    clientName: 'mara',
    paymentMethod: 'money',
    total: 21,
    totalCost: 13.5,
    profit: 7.5,
    status: 'completed'
  },
  {
    id: 'v_26_352_sqs0',
    date: '2026-05-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1339',
        productName: 'Figurinhas copa ifood',
        quantity: 2,
        costPrice: 4.5,
        salePrice: 8.1,
        total: 16.2
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 14,
    totalCost: 9,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_353_cl44',
    date: '2026-05-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_1121',
        productName: 'Chip Sem Recarga',
        quantity: 1,
        costPrice: 0,
        salePrice: 20,
        total: 20
      },
    ],
    paymentMethod: 'money',
    total: 20,
    totalCost: 11,
    profit: 9,
    status: 'completed'
  },
  {
    id: 'v_26_354_loyp',
    date: '2026-05-19T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1354',
        productName: 'cabo iphone',
        quantity: 1,
        costPrice: 3,
        salePrice: 15,
        total: 15
      },
    ],
    paymentMethod: 'money',
    total: 15,
    totalCost: 3,
    profit: 12,
    status: 'completed'
  },
  {
    id: 'v_26_355_8dud',
    date: '2026-05-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1339',
        productName: 'Figurinhas copa ifood',
        quantity: 2,
        costPrice: 4.5,
        salePrice: 8.1,
        total: 16.2
      },
    ],
    clientName: 'mara',
    paymentMethod: 'money',
    total: 14,
    totalCost: 9,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_356_ru6w',
    date: '2026-05-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1339',
        productName: 'Figurinhas copa ifood',
        quantity: 2,
        costPrice: 4.5,
        salePrice: 8.1,
        total: 16.2
      },
    ],
    clientName: 'DAY',
    paymentMethod: 'money',
    total: 14,
    totalCost: 9,
    profit: 5,
    status: 'completed'
  },
  {
    id: 'v_26_357_48sz',
    date: '2026-05-22T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'SARAH',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_358_3zjb',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1340',
        productName: 'figurinha separada ifood',
        quantity: 2,
        costPrice: 0.7619047619047619,
        salePrice: 1.37,
        total: 2.74
      },
    ],
    clientName: 'kalebe',
    paymentMethod: 'money',
    total: 2,
    totalCost: 1.5238095238095237,
    profit: 0.4761904761904763,
    status: 'completed'
  },
  {
    id: 'v_26_359_1xud',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1340',
        productName: 'figurinha separada ifood',
        quantity: 33,
        costPrice: 0.7619047619047619,
        salePrice: 1.37,
        total: 45.21
      },
    ],
    clientName: 'mara',
    paymentMethod: 'money',
    total: 33,
    totalCost: 25.142857142857142,
    profit: 7.857142857142858,
    status: 'completed'
  },
  {
    id: 'v_26_360_0n4o',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1341',
        productName: 'Figurinhas copa brasil',
        quantity: 1,
        costPrice: 6,
        salePrice: 10.8,
        total: 10.8
      },
    ],
    clientName: 'sarah',
    paymentMethod: 'money',
    total: 7,
    totalCost: 6,
    profit: 1,
    status: 'completed'
  },
  {
    id: 'v_26_361_5bvq',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1341',
        productName: 'Figurinhas copa brasil',
        quantity: 2,
        costPrice: 6,
        salePrice: 10.8,
        total: 21.6
      },
    ],
    clientName: 'thuane',
    paymentMethod: 'money',
    total: 14,
    totalCost: 12,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_26_362_mg4i',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_1333',
        productName: 'Unitv V10',
        quantity: 1,
        costPrice: 305,
        salePrice: 549,
        total: 549
      },
    ],
    paymentMethod: 'money',
    total: 350,
    totalCost: 280,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_26_363_zrl4',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1363',
        productName: 'ferro de passar roupa',
        quantity: 1,
        costPrice: 30,
        salePrice: 60,
        total: 60
      },
    ],
    paymentMethod: 'money',
    total: 60,
    totalCost: 30,
    profit: 30,
    status: 'completed'
  },
  {
    id: 'v_26_364_bvzi',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1364',
        productName: 'relogio pequeno',
        quantity: 1,
        costPrice: 0,
        salePrice: 18,
        total: 18
      },
    ],
    paymentMethod: 'money',
    total: 18,
    totalCost: 0,
    profit: 18,
    status: 'completed'
  },
  {
    id: 'v_26_365_enfu',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1365',
        productName: 'formataçao',
        quantity: 1,
        costPrice: 0,
        salePrice: 50,
        total: 50
      },
    ],
    paymentMethod: 'money',
    total: 50,
    totalCost: 0,
    profit: 50,
    status: 'completed'
  },
  {
    id: 'v_26_366_i0r0',
    date: '2026-05-23T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1366',
        productName: 'ssd 12gb',
        quantity: 1,
        costPrice: 0,
        salePrice: 250,
        total: 250
      },
    ],
    paymentMethod: 'money',
    total: 250,
    totalCost: 0,
    profit: 250,
    status: 'completed'
  },
  {
    id: 'v_26_367_f9bb',
    date: '2026-05-24T03:06:28.000Z',
    items: [
      {
        productId: 'p_1342',
        productName: 'figurinhas',
        quantity: 25,
        costPrice: 0.71,
        salePrice: 1.28,
        total: 32
      },
    ],
    clientName: 'thuane',
    paymentMethod: 'money',
    total: 25,
    totalCost: 17.75,
    profit: 7.25,
    status: 'completed'
  },
  {
    id: 'v_26_368_iik9',
    date: '2026-05-25T03:06:28.000Z',
    items: [
      {
        productId: 'p_1342',
        productName: 'figurinhas',
        quantity: 10,
        costPrice: 0.71,
        salePrice: 1.28,
        total: 12.8
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 10,
    totalCost: 7.1,
    profit: 2.9000000000000004,
    status: 'completed'
  },
  {
    id: 'v_26_369_0dvh',
    date: '2026-05-26T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1369',
        productName: 'fone xaiome',
        quantity: 1,
        costPrice: 60,
        salePrice: 130,
        total: 130
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 130,
    totalCost: 60,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_26_370_xzte',
    date: '2026-05-27T03:06:28.000Z',
    items: [
      {
        productId: 'p_1339',
        productName: 'Figurinhas copa ifood',
        quantity: 4,
        costPrice: 4.5,
        salePrice: 8.1,
        total: 32.4
      },
    ],
    clientName: 'kalebe',
    paymentMethod: 'money',
    total: 28,
    totalCost: 22,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_26_371_bxsn',
    date: '2026-05-28T03:06:28.000Z',
    items: [
      {
        productId: 'p_1197',
        productName: 'Impressao Preta',
        quantity: 1,
        costPrice: 0.07,
        salePrice: 0.13,
        total: 0.13
      },
    ],
    clientName: 'matheus impressao',
    paymentMethod: 'money',
    total: 1,
    totalCost: 0.07,
    profit: 0.9299999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_372_uxke',
    date: '2026-05-29T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1372',
        productName: 'bandeirinha 3m',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3.5,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_373_amb2',
    date: '2026-05-30T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1373',
        productName: 'bandeirinha 3m',
        quantity: 1,
        costPrice: 3.5,
        salePrice: 10,
        total: 10
      },
    ],
    clientName: 'remedio',
    paymentMethod: 'money',
    total: 10,
    totalCost: 3.5,
    profit: 6.5,
    status: 'completed'
  },
  {
    id: 'v_26_374_waws',
    date: '2026-05-31T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1374',
        productName: 'porta rg',
        quantity: 1,
        costPrice: 3,
        salePrice: 5,
        total: 5
      },
    ],
    paymentMethod: 'money',
    total: 5,
    totalCost: 3,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_26_375_g1pd',
    date: '2026-06-01T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1375',
        productName: 'balança digital',
        quantity: 1,
        costPrice: 20,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 20,
    profit: 20,
    status: 'completed'
  },
  {
    id: 'v_26_376_mt2w',
    date: '2026-06-02T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1376',
        productName: 'adaptador wifi',
        quantity: 1,
        costPrice: 10,
        salePrice: 25,
        total: 25
      },
    ],
    paymentMethod: 'money',
    total: 25,
    totalCost: 10,
    profit: 15,
    status: 'completed'
  },
  {
    id: 'v_26_377_fq2f',
    date: '2026-06-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1377',
        productName: 'cabo de iphone',
        quantity: 1,
        costPrice: 4,
        salePrice: 15,
        total: 15
      },
    ],
    clientName: 'mikaely',
    paymentMethod: 'money',
    total: 15,
    totalCost: 4,
    profit: 11,
    status: 'completed'
  },
  {
    id: 'v_26_378_m4ox',
    date: '2026-06-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1378',
        productName: 'formataçao',
        quantity: 1,
        costPrice: 0,
        salePrice: 70,
        total: 70
      },
    ],
    paymentMethod: 'money',
    total: 70,
    totalCost: 0,
    profit: 70,
    status: 'completed'
  },
  {
    id: 'v_26_379_dqm7',
    date: '2026-06-03T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1379',
        productName: 'cartinha neymar',
        quantity: 1,
        costPrice: 0,
        salePrice: 2,
        total: 2
      },
    ],
    paymentMethod: 'money',
    total: 2,
    totalCost: 0,
    profit: 2,
    status: 'completed'
  },
  {
    id: 'v_26_380_lght',
    date: '2026-06-04T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1380',
        productName: 'grvaçao de musica',
        quantity: 1,
        costPrice: 0,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_381_3o0u',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1381',
        productName: 'jogo ps2',
        quantity: 2,
        costPrice: 0,
        salePrice: 5,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 0,
    profit: 10,
    status: 'completed'
  },
  {
    id: 'v_26_382_u9g0',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1382',
        productName: 'Power Vox 12 Polegadas 1000w',
        quantity: 1,
        costPrice: 650,
        salePrice: 945.51,
        total: 945.51
      },
    ],
    clientName: '260520TGBK12TA',
    paymentMethod: 'money',
    total: 945.51,
    totalCost: 650,
    profit: 295.51,
    status: 'completed'
  },
  {
    id: 'v_26_383_k2ir',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1383',
        productName: 'Power Vox 12 Polegadas 1000w',
        quantity: 1,
        costPrice: 650,
        salePrice: 945.51,
        total: 945.51
      },
    ],
    clientName: '260520TGBK12TB',
    paymentMethod: 'money',
    total: 945.51,
    totalCost: 650,
    profit: 295.51,
    status: 'completed'
  },
  {
    id: 'v_26_384_ptot',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260515EU5QUHSW',
    paymentMethod: 'money',
    total: 8.64,
    totalCost: 0.7,
    profit: 7.94,
    status: 'completed'
  },
  {
    id: 'v_26_385_0so1',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260526DTGJEGPQ',
    paymentMethod: 'money',
    total: 7.88,
    totalCost: 0.7,
    profit: 7.18,
    status: 'completed'
  },
  {
    id: 'v_26_386_8ms8',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260528HKCF4DH2',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_387_as4t',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1344',
        productName: 'Evok 6\'\' 6mb300 300w Rms Mid Bass',
        quantity: 1,
        costPrice: 350,
        salePrice: 630,
        total: 630
      },
    ],
    clientName: '260531S85XH2CM',
    paymentMethod: 'money',
    total: 394.71,
    totalCost: 350,
    profit: 44.70999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_388_zv8m',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260531U9XWGJNQ',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_389_dlqt',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260525C758V5PB',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_390_dc39',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260527FM7VYVW5',
    paymentMethod: 'money',
    total: 7.88,
    totalCost: 0.7,
    profit: 7.18,
    status: 'completed'
  },
  {
    id: 'v_26_391_5tr5',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260531UBQR4QEB',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_392_xmnq',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260529MV79AB08',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_393_ufkt',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 10,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 12.6
      },
    ],
    clientName: '260526D8R6YTW1',
    paymentMethod: 'money',
    total: 44.25,
    totalCost: 7,
    profit: 37.25,
    status: 'completed'
  },
  {
    id: 'v_26_394_u33t',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '2605248BHY5FNX',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_395_qhkn',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260529PCMCB6M5',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_396_pr83',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260528J1MSR1WM',
    paymentMethod: 'money',
    total: 8.37,
    totalCost: 0.7,
    profit: 7.669999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_397_ihhv',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260529MJP3NUNV',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_398_rnnk',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260529P78M9G45',
    paymentMethod: 'money',
    total: 8.37,
    totalCost: 0.7,
    profit: 7.669999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_399_2b4u',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260529NXFECXMX',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_400_dwou',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260601UG0U18WR',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_401_x3la',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260601UGBQ39NJ',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_402_q4e0',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260601UKQAUR2H',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_403_f7ah',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1344',
        productName: 'Evok 6\'\' 6mb300 300w Rms Mid Bass',
        quantity: 1,
        costPrice: 350,
        salePrice: 630,
        total: 630
      },
    ],
    clientName: '260601UXGQ01BJ',
    paymentMethod: 'money',
    total: 394.71,
    totalCost: 350,
    profit: 44.70999999999998,
    status: 'completed'
  },
  {
    id: 'v_26_404_ceht',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2606010MJDNVMR',
    paymentMethod: 'money',
    total: 8.37,
    totalCost: 0.7,
    profit: 7.669999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_405_0by7',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '260529MB8B6BM6',
    paymentMethod: 'money',
    total: 8.37,
    totalCost: 0.7,
    profit: 7.669999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_406_3490',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260530PMRMR99A',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_407_6bkd',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260602355XYHPS',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_408_r5ie',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '2606021D7H2QCC',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_409_htc9',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2606020YFPP4MQ',
    paymentMethod: 'money',
    total: 8.37,
    totalCost: 0.7,
    profit: 7.669999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_410_i7va',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '2606034202M90X',
    paymentMethod: 'money',
    total: 8.37,
    totalCost: 0.7,
    profit: 7.669999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_411_brs2',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1411',
        productName: 'Evok 6x9 280rms 560w 4ohms',
        quantity: 3,
        costPrice: 300,
        salePrice: 395.2,
        total: 1185.6
      },
    ],
    clientName: '2606035MGQMDYY',
    paymentMethod: 'money',
    total: 1185.6,
    totalCost: 900,
    profit: 285.5999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_412_ev27',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1344',
        productName: 'Evok 6\'\' 6mb300 300w Rms Mid Bass',
        quantity: 3,
        costPrice: 350,
        salePrice: 630,
        total: 1890
      },
    ],
    clientName: '2606045XY8MGF4',
    paymentMethod: 'money',
    total: 1185.6,
    totalCost: 1050,
    profit: 135.5999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_413_m4xm',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1413',
        productName: 'Power Vox 12 Polegadas 1000w Rms 4 Ohms Preto',
        quantity: 1,
        costPrice: 650,
        salePrice: 751.6,
        total: 751.6
      },
    ],
    clientName: '2606045Y090WHW',
    paymentMethod: 'money',
    total: 751.6,
    totalCost: 650,
    profit: 101.60000000000002,
    status: 'completed'
  },
  {
    id: 'v_26_414_105t',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '2606033UE8PV0V',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_415_bli3',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '2606035KKVFRNU',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_416_rtcx',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '2606046MGAH404',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_417_lw5e',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260606B1XKPJYT',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_418_lmxv',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260606B6MYY3DX',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_419_b722',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '2606046P31KQAH',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_420_kf6m',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '2606058PUG6HXN',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_421_eike',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1343',
        productName: 'Arquivo pdf Shopee',
        quantity: 1,
        costPrice: 1,
        salePrice: 1.8,
        total: 1.8
      },
    ],
    clientName: '260606B1FWFNXG',
    paymentMethod: 'money',
    total: 24.75,
    totalCost: 1,
    profit: 23.75,
    status: 'completed'
  },
  {
    id: 'v_26_422_tjqp',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1203',
        productName: 'Jogo Ps2 Shopee',
        quantity: 1,
        costPrice: 0.7,
        salePrice: 1.26,
        total: 1.26
      },
    ],
    clientName: '26060590G5B9P4',
    paymentMethod: 'money',
    total: 8.37,
    totalCost: 0.7,
    profit: 7.669999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_423_pnys',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '260606AY2SD1DW',
    paymentMethod: 'money',
    total: 11,
    totalCost: 7,
    profit: 4,
    status: 'completed'
  },
  {
    id: 'v_26_424_g562',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1118',
        productName: 'Cheirinho Para Carro',
        quantity: 1,
        costPrice: 7.5,
        salePrice: 13.5,
        total: 13.5
      },
    ],
    clientName: '26060481Y18VMK',
    paymentMethod: 'money',
    total: 11,
    totalCost: 7.5,
    profit: 3.5,
    status: 'completed'
  },
  {
    id: 'v_26_425_lgwh',
    date: '2026-06-05T03:06:28.000Z',
    items: [
      {
        productId: 'p_1344',
        productName: 'Evok 6\'\' 6mb300 300w Rms Mid Bass',
        quantity: 1,
        costPrice: 350,
        salePrice: 630,
        total: 630
      },
    ],
    clientName: '260606BPCWMEVU',
    paymentMethod: 'money',
    total: 395.2,
    totalCost: 350,
    profit: 45.19999999999999,
    status: 'completed'
  },
  {
    id: 'v_26_426_4q4j',
    date: '2026-06-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1426',
        productName: 'memorycard opl',
        quantity: 1,
        costPrice: 15,
        salePrice: 40,
        total: 40
      },
    ],
    paymentMethod: 'money',
    total: 40,
    totalCost: 15,
    profit: 25,
    status: 'completed'
  },
  {
    id: 'v_26_427_gw0v',
    date: '2026-06-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1427',
        productName: 'cabo v8',
        quantity: 1,
        costPrice: 4,
        salePrice: 10,
        total: 10
      },
    ],
    paymentMethod: 'money',
    total: 10,
    totalCost: 4,
    profit: 6,
    status: 'completed'
  },
  {
    id: 'v_26_428_au31',
    date: '2026-06-07T03:06:28.000Z',
    items: [
      {
        productId: 'p_1345',
        productName: 'figurinha personalizada',
        quantity: 8,
        costPrice: 0.1875,
        salePrice: 0.34,
        total: 2.72
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 10,
    totalCost: 1.5,
    profit: 8.5,
    status: 'completed'
  },
  {
    id: 'v_26_429_cnwk',
    date: '2026-06-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_1345',
        productName: 'figurinha personalizada',
        quantity: 2,
        costPrice: 0.1875,
        salePrice: 0.34,
        total: 0.68
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 4,
    totalCost: 0.375,
    profit: 3.625,
    status: 'completed'
  },
  {
    id: 'v_26_430_0t8j',
    date: '2026-06-09T03:06:28.000Z',
    items: [
      {
        productId: 'p_temp_1430',
        productName: 'mini boby god',
        quantity: 1,
        costPrice: 10,
        salePrice: 20,
        total: 20
      },
    ],
    clientName: 'day',
    paymentMethod: 'money',
    total: 20,
    totalCost: 10,
    profit: 10,
    status: 'completed'
  },
];
