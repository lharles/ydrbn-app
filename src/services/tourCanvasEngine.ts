import { AlbumEntry } from '../types';
import { resolveActiveLocale, SupportedLocale, toPigLatinText } from './i18nService';

export interface TourStop {
  date: string;
  city: string;
}

export const CANONICAL_TOUR_ROSTER: TourStop[] = [
  // Column 1 (West & Desert Circuit)
  { date: '6/09', city: 'Portland, OR' },
  { date: '6/10', city: 'Portland, OR' },
  { date: '6/11', city: 'Springfield, OR' },
  { date: '6/16', city: 'Springfield, OR' },
  { date: '6/17', city: 'Bikini Bottom, HI' },
  { date: '6/18', city: 'Bikini Bottom, HI' },
  { date: '6/23', city: 'Twin Peaks, WA' },
  { date: '6/24', city: 'Twin Peaks, WA' },
  { date: '6/25', city: 'Radiator Springs, CO' },
  { date: '6/30', city: 'Radiator Springs, CO' },
  { date: '7/01', city: 'South Park, CO' },
  { date: '7/02', city: 'South Park, CO' },
  { date: '7/07', city: 'Zion, CA' },
  { date: '7/08', city: 'Zion, CA' },
  { date: '7/09', city: 'Mordor, AZ' },
  { date: '7/14', city: 'Mordor, AZ' },
  { date: '7/15', city: 'Metropolis, KS' },
  { date: '7/16', city: 'Metropolis, KS' },

  // Column 2 (Midwest, Atlantic & Overseas Circuit)
  { date: '7/21', city: 'Gotham, IL' },
  { date: '7/22', city: 'Gotham, IL' },
  { date: '7/23', city: 'Shermer, IL' },
  { date: '7/28', city: 'Shermer, IL' },
  { date: '7/29', city: 'Pawnee, IN' },
  { date: '7/30', city: 'Pawnee, IN' },
  { date: '8/04', city: 'Amity Island, RI' },
  { date: '8/05', city: 'Amity Island, RI' },
  { date: '8/06', city: 'Bedford Falls, NY' },
  { date: '8/11', city: 'Bedford Falls, NY' },
  { date: '8/12', city: 'Castle Rock, ME' },
  { date: '8/13', city: 'Castle Rock, ME' },
  { date: '8/18', city: 'Derry, ME' },
  { date: '8/19', city: 'Derry, ME' },
  { date: '8/20', city: 'Hogsmeade, UK' },
  { date: '8/25', city: 'Hogsmeade, UK' },
  { date: '8/26', city: 'Bedrock, IE' },
  { date: '8/27', city: 'Bedrock, IE' },
];

export const MUNICIPAL_LORE_VENUES = [
  'Flumptown Annex, OH',
  'Zoning Board Rm B, NJ',
  'Abandoned Vicarage, UK',
  'Sub-Basement #4, AK',
  'Bursar Waiting Rm, VT',
  'Rotating Restaurant, WA',
  'Cul-De-Sac #7, IN',
  'Unfinished Bridge, OR',
  'Municipal Sump Pit, PA',
  'Appliance Depot, IL',
  'Patent Annex C, MA',
  'Bowling Rec Hall, WI',
  'Decommissioned Silo, KS',
  'Boiler Room 2B, MI',
  'Drainage District, TX',
  'Surplus Warehouse, NV',
  'Civic Boiler Annex, NY',
  'Orthopedic Ward, NC',
  'Records Vault #9, VA',
  'Parking Lot 14-B, MN',
  'Thermostat Lobby, CO',
  'Laminated Lounge, FL',
  'Clerical Elks #8, IA',
  'Tupperware Hall, MO',
  'Scone Conservatory, UK',
  'Cabbage Pavilion, ME',
];

export const TEMPORAL_FUTURE_VENUES = [
  'Sea of Tranquility, LUNA',
  'Olympus Mons Annex, MARS',
  'Orbital Cistern #4, LEO',
  'Neo-Flumptown Dome, OH',
  'Io Sulfur Refinery, JUP',
  'Titan Methane Bowl, SAT',
  'Lagrange Point L2, ORB',
  'Crater Tycho Civic, LUNA',
  'Sub-Level 99, CERES',
  'Ganymede Ice Rink, JUP',
  'Centauri Tollbooth, SEC-4',
  'Europa Hydro-Deck, JUP',
  'Phobos Parking Lot, MARS',
  'Deimos Youth Hostel, MARS',
  'Oort Cloud VFW #12, DEEP',
  'Venus Cloud Annex, VEN',
  'Mercury Sun-Shield, MER',
  'Callisto Bowling, JUP',
  'Asteroid 433 Rec, BELT',
  'Pluto Kiosk #2, KUI',
];

// Master 7-Language Venue Translation Table: English -> [es, pt, ja, zh, hi, ru]
const VENUE_I18N: Record<string, [string, string, string, string, string, string]> = {
  // Canonical '77 Circuit (18 unique stops)
  'Portland, OR': ['Puerto de Portland, OR', 'Porto de Portland, OR', 'ポートランド (オレゴン)', '波特兰, 俄勒冈', 'पोर्टलैंड, ओरेगन', 'Портленд, Орегон'],
  'Springfield, OR': ['Campo de Primavera, OR', 'Campo da Primavera, OR', 'スプリングフィールド (OR)', '春田市, 俄勒冈', 'स्प्रिंगफील्ड, ओरेगन', 'Спрингфилд, Орегон'],
  'Bikini Bottom, HI': ['Fondo de Bikini, HI', 'Fenda do Biquíni, HI', 'ビキニタウン (ハワイ)', '比奇堡, 夏威夷', 'बिकिनी बॉटम, हवाई', 'Бикини Боттом, Гавайи'],
  'Twin Peaks, WA': ['Picos Gemelos, WA', 'Picos Gêmeos, WA', 'ツイン・ピークス (WA)', '双峰镇, 华盛顿', 'ट्विन पीक्स, वॉशिंगटन', 'Твин Пикс, Вашингтон'],
  'Radiator Springs, CO': ['Manantiales del Radiador, CO', 'Fontes do Radiador, CO', 'ラジエーター・スプリングス', '水箱温泉镇, 科罗拉多', 'रेडिएटर स्प्रिंग्स, कोलोराडो', 'Радиатор-Спрингс, Колорадо'],
  'South Park, CO': ['Parque del Sur, CO', 'Parque do Sul, CO', 'サウスパーク (コロラド)', '南方公园, 科罗拉多', 'साउथ पार्क, कोलोराडो', 'Южный Парк, Колорадо'],
  'Zion, CA': ['Monte Sión, CA', 'Monte Sião, CA', 'ザイオン (カリフォルニア)', '锡安城, 加利福尼亚', 'ज़ायन, कैलिफ़ोर्निया', 'Зион, Калифорния'],
  'Mordor, AZ': ['Tierras de Mordor, AZ', 'Terras de Mordor, AZ', 'モルドール (アリゾナ)', '魔多, 亚利桑那', 'मोर्डोर, एरिज़ोना', 'Мордор, Аризона'],
  'Metropolis, KS': ['Metrópolis, KS', 'Metrópolis, KS', 'メトロポリス (カンザス)', '大都会, 堪萨斯', 'मेट्रोपोलिस, कंसास', 'Метрополис, Канзас'],
  'Gotham, IL': ['Ciudad Gótica, IL', 'Cidade de Gotham, IL', 'ゴッサム・シティ (IL)', '哥谭市, 伊利诺伊', 'गोथम शहर, इलिनॉय', 'Готэм-Сити, Иллинойс'],
  'Shermer, IL': ['Villa Shermer, IL', 'Vila Shermer, IL', 'シャーマー講堂 (イリノイ)', '舍默镇, 伊利诺伊', 'शेरमर नगर, इलिनॉय', 'Шермер, Иллинойс'],
  'Pawnee, IN': ['Parque de Pawnee, IN', 'Parque de Pawnee, IN', 'ポーニー市民会館 (IN)', '波尼镇, 印第安纳', 'पॉनी नगर, इंडियाना', 'Пауни, Индиана'],
  'Amity Island, RI': ['Isla Amity, RI', 'Ilha Amity, RI', 'アミティ島 (RI)', '艾米蒂岛, 罗得岛', 'एमिटी द्वीप, रोड आइलैंड', 'Остров Эмити, Род-Айленд'],
  'Bedford Falls, NY': ['Cascadas Bedford, NY', 'Cachoeiras de Bedford, NY', 'ベッドフォード・フォールズ', '贝德福德瀑布, 纽约', 'बेडफोर्ड फॉल्स, न्यूयॉर्क', 'Бедфорд-Фоллз, Нью-Йорк'],
  'Castle Rock, ME': ['Roca del Castillo, ME', 'Rocha do Castelo, ME', 'キャッスルロック (メイン)', '城堡岩, 缅因', 'कैसल रॉक, मेन', 'Касл-Рок, Мэн'],
  'Derry, ME': ['Villa de Derry, ME', 'Vila de Derry, ME', 'デリー町 (メイン)', '德里镇, 缅因', 'डेरी नगर, मेन', 'Дерри, Мэн'],
  'Hogsmeade, UK': ['Aldea Hogsmeade, RU', 'Vila de Hogsmeade, RU', 'ホグズミード村 (英国)', '霍格莫德村, 英国', 'हॉग्समीड गाँव, ब्रिटेन', 'Хогсмид, Британия'],
  'Bedrock, IE': ['Piedradura, IRL', 'Pedregulhos, IRL', 'ベッドロック (アイルランド)', '基岩城, 爱尔兰', 'बेडरॉक, आयरलैंड', 'Бедрок, Ирландия'],

  // Municipal Lore Circuit (26 venues)
  'Flumptown Annex, OH': ['Anexo de Flumptown, OH', 'Anexo de Flumptown, OH', 'フランプタウン別館 (OH)', '弗兰普顿附楼, OH', 'फ़्लम्पटाउन एनेक्स, OH', 'Фламптаун-Аннекс, OH'],
  'Zoning Board Rm B, NJ': ['Junta de Zonificación B, NJ', 'Sala de Zoneamento B, NJ', '区画整理委員会B室 (NJ)', '规划局B室, NJ', 'ज़ोनिंग बोर्ड रूम B, NJ', 'Зал Зонирования Б, NJ'],
  'Abandoned Vicarage, UK': ['Vicaría Abandonada, UK', 'Vicariato Abandonado, UK', '廃牧師館 (UK)', '废弃牧师宅邸, UK', 'पुराना पादरी घर, UK', 'Старый Викариат, UK'],
  'Sub-Basement #4, AK': ['Subsótano #4, AK', 'Subsolo #4, AK', '第4地下室 (AK)', '地下四层, AK', 'तहखाना #4, AK', 'Подвал №4, AK'],
  'Bursar Waiting Rm, VT': ['Sala del Tesorero, VT', 'Sala da Tesouraria, VT', '会計係待合室 (VT)', '财务处候客室, VT', 'कोषाध्यक्ष कक्ष, VT', 'Приёмная Казначея, VT'],
  'Rotating Restaurant, WA': ['Restaurante Giratorio, WA', 'Restaurante Giratório, WA', '回転レストラン (WA)', '旋转餐厅, WA', 'घूमता रेस्तरां, WA', 'Вращающийся Ресторан, WA'],
  'Cul-De-Sac #7, IN': ['Callejón sin Salida #7, IN', 'Rua Sem Saída #7, IN', '袋小路7番地 (IN)', '7号死胡同, IN', 'गली #7, IN', 'Тупик №7, IN'],
  'Unfinished Bridge, OR': ['Puente Inconcluso, OR', 'Ponte Inacabada, OR', '未完成の橋 (OR)', '未完工大桥, OR', 'अधूरा पुल, OR', 'Недостроенный Мост, OR'],
  'Municipal Sump Pit, PA': ['Pozo Municipal, PA', 'Poço Municipal, PA', '市営排水ピット (PA)', '市政集水坑, PA', 'नगरपालिका कुंड, PA', 'Муниципальный Коллектор, PA'],
  'Appliance Depot, IL': ['Depósito de Aparatos, IL', 'Depósito de Aparelhos, IL', '家電倉庫 (IL)', '家电仓库, IL', 'उपकरण डिपो, IL', 'Склад Бытовой Техники, IL'],
  'Patent Annex C, MA': ['Anexo de Patentes C, MA', 'Anexo de Patentes C, MA', '特許局別館C (MA)', '专利局附楼C, MA', 'पेटेंट एनेक्स C, MA', 'Патентный Отдел В, MA'],
  'Bowling Rec Hall, WI': ['Bolera Recreativa, WI', 'Boliche Recreativo, WI', 'ボウリング会館 (WI)', '保龄球娱乐厅, WI', 'बॉलिंग हॉल, WI', 'Боулинг-Клуб, WI'],
  'Decommissioned Silo, KS': ['Silo Clausurado, KS', 'Silo Desativado, KS', '廃サイロ施設 (KS)', '退役筒仓, KS', 'पुराना साइलो, KS', 'Списанный Силос, KS'],
  'Boiler Room 2B, MI': ['Sala de Calderas 2B, MI', 'Sala da Caldeira 2B, MI', '第2Bボイラー室 (MI)', '2B号锅炉房, MI', 'बॉयलर रूम 2B, MI', 'Котельная 2Б, MI'],
  'Drainage District, TX': ['Distrito de Drenaje, TX', 'Distrito de Drenagem, TX', '排水管区 (TX)', '排水管辖区, TX', 'ड्रेनेज डिस्ट्रिक्ट, TX', 'Дренажный Округ, TX'],
  'Surplus Warehouse, NV': ['Almacén de Excedentes, NV', 'Galpão de Excedentes, NV', '余剰品倉庫 (NV)', '剩余物资仓库, NV', 'सरप्लस गोदाम, NV', 'Склад Излишков, NV'],
  'Civic Boiler Annex, NY': ['Caldera Cívica, NY', 'Caldeira Cívica, NY', '市民ボイラー別館 (NY)', '市政锅炉房, NY', 'सिविक बॉयलर हॉल, NY', 'Городская Котельная, NY'],
  'Orthopedic Ward, NC': ['Pabellón Ortopédico, NC', 'Ala Ortopédica, NC', '整形外科病棟 (NC)', '骨科病房, NC', 'हड्डी रोग वार्ड, NC', 'Ортопедическое Отд., NC'],
  'Records Vault #9, VA': ['Bóveda de Archivos #9, VA', 'Cofre de Arquivos #9, VA', '第9記録保管庫 (VA)', '9号档案金库, VA', 'रिकॉर्ड वॉल्ट #9, VA', 'Архивный Бункер №9, VA'],
  'Parking Lot 14-B, MN': ['Estacionamiento 14-B, MN', 'Estacionamento 14-B, MN', '第14-B駐車場 (MN)', '14-B号停车场, MN', 'पार्किंग लॉट 14-B, MN', 'Парковка 14-Б, MN'],
  'Thermostat Lobby, CO': ['Vestíbulo del Termostato, CO', 'Lobby do Termostato, CO', 'サーモスタットロビー (CO)', '恒温器大厅, CO', 'थर्मोस्टेट लॉबी, CO', 'Холл Термостатов, CO'],
  'Laminated Lounge, FL': ['Salón Laminado, FL', 'Salão Laminado, FL', 'ラミネート・ラウンジ (FL)', '塑封酒廊, FL', 'लेमिनेटेड लाउंज, FL', 'Ламинированный Зал, FL'],
  'Clerical Elks #8, IA': ['Logia Clerical #8, IA', 'Loja Clerical #8, IA', '書記友愛会8支部 (IA)', '8号文员俱乐部, IA', 'क्लर्क क्लब #8, IA', 'Клуб Клерков №8, IA'],
  'Tupperware Hall, MO': ['Salón Tupperware, MO', 'Salão Tupperware, MO', 'タッパーウェア会館 (MO)', '保鲜盒礼堂, MO', 'टपरवेयर हॉल, MO', 'Зал Контейнеров, MO'],
  'Scone Conservatory, UK': ['Conservatorio del Scone, UK', 'Conservatório do Scone, UK', 'スコーン音楽院 (UK)', '司康饼音乐学院, UK', 'स्कोन कंजर्वेटरी, UK', 'Консерватория Сконов, UK'],
  'Cabbage Pavilion, ME': ['Pabellón del Repollo, ME', 'Pavilhão do Repolho, ME', 'キャベツ・パビリオン (ME)', '卷心菜展馆, ME', 'पत्तागोभी मंडप, ME', 'Капустный Павильон, ME'],

  // Chrono-Orbital Circuit (20 future venues)
  'Sea of Tranquility, LUNA': ['Mar de la Tranquilidad, LUNA', 'Mar da Tranquilidade, LUA', '静かの海 (月面)', '静海基地, 月球', 'शांत सागर, चंद्रमा', 'Море Спокойствия, ЛУНА'],
  'Olympus Mons Annex, MARS': ['Monte Olimpo, MARTE', 'Monte Olimpo, MARTE', 'オリンポス山別館 (火星)', '奥林帕斯山附楼, 火星', 'ओलंपस मॉन्स, मंगल', 'Олимп-Аннекс, МАРС'],
  'Orbital Cistern #4, LEO': ['Cisterna Orbital #4, LEO', 'Cisterna Orbital #4, LEO', '軌道貯水槽4号 (LEO)', '4号轨道蓄水池, LEO', 'ऑर्बिटल टैंक #4, LEO', 'Орбитальная Цистерна №4'],
  'Neo-Flumptown Dome, OH': ['Domo Neo-Flumptown, OH', 'Domo Neo-Flumptown, OH', 'ネオ・フランプタウンドーム', '新弗兰普顿穹顶, OH', 'नियो-फ़्लम्पटाउन डोम, OH', 'Купол Нео-Фламптаун'],
  'Io Sulfur Refinery, JUP': ['Refinería de Azufre Ío, JUP', 'Refinaria de Enxofre Io, JUP', 'イオ硫黄精製所 (木星)', '木卫一硫磺厂, 木星', 'आयो सल्फर रिफाइनरी, बृहस्पति', 'Серный Завод Ио, ЮПИТЕР'],
  'Titan Methane Bowl, SAT': ['Cuenca de Metano Titán, SAT', 'Bacia de Metano Titã, SAT', 'タイタン・メタンボウル (土星)', '泰坦甲烷剧场, 土星', 'टाइटन मीथेन बाउल, शनि', 'Метановый Зал Титана'],
  'Lagrange Point L2, ORB': ['Punto de Lagrange L2, ORB', 'Ponto de Lagrange L2, ORB', 'ラグランジュ点 L2 (軌道)', '拉格朗日点 L2, 轨道', 'लैग्रेंज पॉइंट L2, कक्षा', 'Точка Лагранжа L2'],
  'Crater Tycho Civic, LUNA': ['Cráter Tycho Cívico, LUNA', 'Cratera Tycho, LUA', 'ティコ・クレーター会館 (月)', '第谷陨石坑礼堂, 月球', 'टाइको क्रेटर हॉल, चंद्रमा', 'Кратер Тихо, ЛУНА'],
  'Sub-Level 99, CERES': ['Subnivel 99, CERES', 'Subnível 99, CERES', '地下99階層 (ケレス)', '地下99层, 谷神星', 'सब-लेवल 99, सेरेस', 'Подуровень 99, ЦЕРЕРА'],
  'Ganymede Ice Rink, JUP': ['Pista de Hielo Ganimedes', 'Pista de Gelo Ganimedes', 'ガニメデ・アイスリンク', '木卫三溜冰场, 木星', 'गैनीमीड आइस रिंक', 'Каток Ганимеда, ЮПИТЕР'],
  'Centauri Tollbooth, SEC-4': ['Peaje Centauri, SEC-4', 'Pedágio Centauri, SEC-4', 'ケンタウリ料金所 (SEC-4)', '半人马座收费站, SEC-4', 'सेंटॉरी टोलबूथ, SEC-4', 'Застава Центавра, СЕК-4'],
  'Europa Hydro-Deck, JUP': ['Hidrocubierta Europa, JUP', 'Hidro-Convés Europa, JUP', 'エウロパ水中デッキ (木星)', '木卫二水下甲板, 木星', 'यूरोपा हाइड्रो-डेक', 'Гидропалуба Европы'],
  'Phobos Parking Lot, MARS': ['Aparcamiento Fobos, MARTE', 'Estacionamento Fobos, MARTE', 'フォボス駐車場 (火星)', '火卫一停车场, 火星', 'फोबोस पार्किंग, मंगल', 'Парковка Фобоса, МАРС'],
  'Deimos Youth Hostel, MARS': ['Albergue Deimos, MARTE', 'Albergue Deimos, MARTE', 'ダイモス・ユースホステル', '火卫二青年旅舍, 火星', 'डीमोस हॉस्टल, मंगल', 'Хостел Деймоса, МАРС'],
  'Oort Cloud VFW #12, DEEP': ['Nube de Oort #12, DEEP', 'Nuvem de Oort #12, DEEP', 'オールトの雲 第12会館', '奥尔特云12号站, 深空', 'ऊर्ट क्लाउड #12, डीप', 'Облако Оорта №12'],
  'Venus Cloud Annex, VEN': ['Anexo Nuboso de Venus', 'Anexo das Nuvens de Vênus', '金星雲上別館 (VEN)', '金星云端附楼, 金星', 'शुक्र क्लाउड एनेक्स', 'Облачный Зал Венеры'],
  'Mercury Sun-Shield, MER': ['Escudo Solar Mercurio', 'Escudo Solar de Mercúrio', '水星サンシールド (MER)', '水星遮阳盾站, 水星', 'बुध सन-शील्ड, MER', 'Солнечный Щит Меркурия'],
  'Callisto Bowling, JUP': ['Bolera Calisto, JUP', 'Boliche Calisto, JUP', 'カリスト・ボウリング場', '木卫四保龄球馆, 木星', 'कैलिस्टो बॉलिंग, बृहस्पति', 'Боулинг Каллисто'],
  'Asteroid 433 Rec, BELT': ['Asteroide 433, CINTURÓN', 'Asteroide 433, CINTURÃO', '小惑星433レクリエーション', '433号小行星俱乐部', 'क्षुद्रग्रह 433 हॉल', 'Астероид 433, ПОЯС'],
  'Pluto Kiosk #2, KUI': ['Quiosco Plutón #2, KUI', 'Quiosque Plutão #2, KUI', '冥王星第2キオスク (KUI)', '冥王星2号亭, 柯伊伯带', 'प्लूटो कियोस्क #2', 'Киоск Плутона №2'],
};

const LANG_INDEX: Partial<Record<SupportedLocale, number>> = {
  es: 0,
  pt: 1,
  ja: 2,
  zh: 3,
  hi: 4,
  ru: 5,
};

const EXTRA_VENUE_MAP: Partial<Record<SupportedLocale, Record<string, string>>> = {
  fr: {
    'Portland, OR': 'Port-de-Portland, OR',
    'Springfield, OR': 'Champ-du-Printemps, OR',
    'Bikini Bottom, HI': 'Bikini-les-Flots, HI',
    'Twin Peaks, WA': 'Pics Jumeaux, WA',
    'Radiator Springs, CO': 'Sources-du-Radiateur, CO',
    'South Park, CO': 'Parc-du-Sud, CO',
    'Zion, CA': 'Mont-Sion, CA',
    'Mordor, AZ': 'Terres du Mordor, AZ',
    'Metropolis, KS': 'Métropolis-sur-Plaine, KS',
    'Gotham, IL': 'Gotham-sur-Lac, IL',
    'Shermer, IL': 'Bourg-de-Shermer, IL',
    'Pawnee, IN': 'Parc-de-Pawnee, IN',
    'Amity Island, RI': 'Île d’Amity, RI',
    'Bedford Falls, NY': 'Chutes-de-Bedford, NY',
    'Castle Rock, ME': 'Rocher-du-Château, ME',
    'Derry, ME': 'Canal-de-Derry, ME',
    'Hogsmeade, UK': 'Pré-au-Lard, R.-U.',
    'Bedrock, IE': 'Caillouville, IRL',
    'Flumptown Annex, OH': 'Annexe de Flumptown, OH',
    'Zoning Board Rm B, NJ': 'Comité de Zonage B, NJ',
    'Abandoned Vicarage, UK': 'Presbytère Abandonné, UK',
    'Sub-Basement #4, AK': 'Sous-Sol n°4, AK',
    'Bursar Waiting Rm, VT': 'Salle de l’Économe, VT',
    'Rotating Restaurant, WA': 'Restaurant Tournant, WA',
    'Cul-De-Sac #7, IN': 'Impasse n°7, IN',
    'Unfinished Bridge, OR': 'Pont Inachevé, OR',
    'Municipal Sump Pit, PA': 'Fosse Municipale, PA',
    'Appliance Depot, IL': 'Dépôt d’Appareils, IL',
    'Patent Annex C, MA': 'Annexe des Brevets C, MA',
    'Bowling Rec Hall, WI': 'Salle de Bowling, WI',
    'Decommissioned Silo, KS': 'Silo Désaffecté, KS',
    'Boiler Room 2B, MI': 'Chaufferie 2B, MI',
    'Drainage District, TX': 'District de Drainage, TX',
    'Surplus Warehouse, NV': 'Entrepôt de Surplus, NV',
    'Civic Boiler Annex, NY': 'Chaufferie Civique, NY',
    'Orthopedic Ward, NC': 'Service Orthopédique, NC',
    'Records Vault #9, VA': 'Caveau d’Archives n°9, VA',
    'Parking Lot 14-B, MN': 'Parking 14-B, MN',
    'Thermostat Lobby, CO': 'Hall du Thermostat, CO',
    'Laminated Lounge, FL': 'Salon Plastifié, FL',
    'Clerical Elks #8, IA': 'Loge des Greffiers n°8, IA',
    'Tupperware Hall, MO': 'Salle Tupperware, MO',
    'Scone Conservatory, UK': 'Conservatoire du Scone, UK',
    'Cabbage Pavilion, ME': 'Pavillon du Chou, ME',
    'Sea of Tranquility, LUNA': 'Mer de la Tranquillité, LUNE',
    'Olympus Mons Annex, MARS': 'Annexe Olympus Mons, MARS',
    'Orbital Cistern #4, LEO': 'Citerne Orbitale n°4, LEO',
    'Neo-Flumptown Dome, OH': 'Dôme Néo-Flumptown, OH',
    'Io Sulfur Refinery, JUP': 'Raffinerie de Soufre Io, JUP',
    'Titan Methane Bowl, SAT': 'Bol de Méthane Titan, SAT',
    'Lagrange Point L2, ORB': 'Point de Lagrange L2, ORB',
    'Crater Tycho Civic, LUNA': 'Cratère Tycho, LUNE',
    'Sub-Level 99, CERES': 'Sous-Niveau 99, CÉRÈS',
    'Ganymede Ice Rink, JUP': 'Patinoire Ganymède, JUP',
    'Centauri Tollbooth, SEC-4': 'Péage Centauri, SEC-4',
    'Europa Hydro-Deck, JUP': 'Hydro-Pont Europe, JUP',
    'Phobos Parking Lot, MARS': 'Parking Phobos, MARS',
    'Deimos Youth Hostel, MARS': 'Auberge Deimos, MARS',
    'Oort Cloud VFW #12, DEEP': 'Nuage d’Oort n°12, DEEP',
    'Venus Cloud Annex, VEN': 'Annexe Nuageuse Vénus, VEN',
    'Mercury Sun-Shield, MER': 'Bouclier Solaire Mercure',
    'Callisto Bowling, JUP': 'Bowling Callisto, JUP',
    'Asteroid 433 Rec, BELT': 'Astéroïde 433, CEINTURE',
    'Pluto Kiosk #2, KUI': 'Kiosque Pluton n°2, KUI',
  },
  de: {
    'Portland, OR': 'Hafen Portland, OR',
    'Springfield, OR': 'Frühlingsfeld, OR',
    'Bikini Bottom, HI': 'Bikini-Atoll, HI',
    'Twin Peaks, WA': 'Zwillingsgipfel, WA',
    'Radiator Springs, CO': 'Kühlerquellen, CO',
    'South Park, CO': 'Südpark, CO',
    'Zion, CA': 'Berg Zion, CA',
    'Mordor, AZ': 'Schicksalsberg (Mordor), AZ',
    'Metropolis, KS': 'Metropolis-Stadt, KS',
    'Gotham, IL': 'Gotham-Stadt, IL',
    'Shermer, IL': 'Kleinstadt Shermer, IL',
    'Pawnee, IN': 'Gemeindehalle Pawnee, IN',
    'Amity Island, RI': 'Amity-Insel, RI',
    'Bedford Falls, NY': 'Bedford-Fälle, NY',
    'Castle Rock, ME': 'Schlossfelsen, ME',
    'Derry, ME': 'Kanalstadt Derry, ME',
    'Hogsmeade, UK': 'Ebermet-Dorf, GB',
    'Bedrock, IE': 'Steintal, IRL',
    'Flumptown Annex, OH': 'Flumptown-Nebengebäude, OH',
    'Zoning Board Rm B, NJ': 'Bauamt Raum B, NJ',
    'Abandoned Vicarage, UK': 'Verlassenes Pfarrhaus, UK',
    'Sub-Basement #4, AK': 'Tiefkeller Nr. 4, AK',
    'Bursar Waiting Rm, VT': 'Kassenwartezimmer, VT',
    'Rotating Restaurant, WA': 'Drehrestaurant, WA',
    'Cul-De-Sac #7, IN': 'Sackgasse Nr. 7, IN',
    'Unfinished Bridge, OR': 'Unvollendete Brücke, OR',
    'Municipal Sump Pit, PA': 'Städtische Sickergrube, PA',
    'Appliance Depot, IL': 'Geräte-Depot, IL',
    'Patent Annex C, MA': 'Patentamt Trakt C, MA',
    'Bowling Rec Hall, WI': 'Kegelbahn-Halle, WI',
    'Decommissioned Silo, KS': 'Stillgelegtes Silo, KS',
    'Boiler Room 2B, MI': 'Heizraum 2B, MI',
    'Drainage District, TX': 'Entwässerungsbezirk, TX',
    'Surplus Warehouse, NV': 'Restposten-Lager, NV',
    'Civic Boiler Annex, NY': 'Bürger-Kesselhaus, NY',
    'Orthopedic Ward, NC': 'Orthopädie-Station, NC',
    'Records Vault #9, VA': 'Archivtresor Nr. 9, VA',
    'Parking Lot 14-B, MN': 'Parkplatz 14-B, MN',
    'Thermostat Lobby, CO': 'Thermostat-Foyer, CO',
    'Laminated Lounge, FL': 'Laminierte Lounge, FL',
    'Clerical Elks #8, IA': 'Büro-Loge Nr. 8, IA',
    'Tupperware Hall, MO': 'Frischhaltedosen-Saal, MO',
    'Scone Conservatory, UK': 'Scone-Konservatorium, UK',
    'Cabbage Pavilion, ME': 'Kohlkopf-Pavillon, ME',
    'Sea of Tranquility, LUNA': 'Meer der Ruhe, MOND',
    'Olympus Mons Annex, MARS': 'Olympus-Mons-Trakt, MARS',
    'Orbital Cistern #4, LEO': 'Orbitalzisterne Nr. 4, LEO',
    'Neo-Flumptown Dome, OH': 'Neo-Flumptown-Kuppel, OH',
    'Io Sulfur Refinery, JUP': 'Io-Schwefelraffinerie, JUP',
    'Titan Methane Bowl, SAT': 'Titan-Methan-Arena, SAT',
    'Lagrange Point L2, ORB': 'Lagrange-Punkt L2, ORB',
    'Crater Tycho Civic, LUNA': 'Tycho-Krater-Halle, MOND',
    'Sub-Level 99, CERES': 'Unterebene 99, CERES',
    'Ganymede Ice Rink, JUP': 'Ganymed-Eisbahn, JUP',
    'Centauri Tollbooth, SEC-4': 'Centauri-Mautstelle, SEK-4',
    'Europa Hydro-Deck, JUP': 'Europa-Hydrodeck, JUP',
    'Phobos Parking Lot, MARS': 'Phobos-Parkdeck, MARS',
    'Deimos Youth Hostel, MARS': 'Deimos-Herberge, MARS',
    'Oort Cloud VFW #12, DEEP': 'Oortsche Wolke Nr. 12',
    'Venus Cloud Annex, VEN': 'Venus-Wolkenhalle, VEN',
    'Mercury Sun-Shield, MER': 'Merkur-Sonnenschild, MER',
    'Callisto Bowling, JUP': 'Kallisto-Bowling, JUP',
    'Asteroid 433 Rec, BELT': 'Asteroid 433, GÜRTEL',
    'Pluto Kiosk #2, KUI': 'Pluto-Kiosk Nr. 2, KUI',
  },
  id: {
    'Portland, OR': 'Pelabuhan Portland, OR',
    'Springfield, OR': 'Padang Semi, OR',
    'Bikini Bottom, HI': 'Dasar Bikini, HI',
    'Twin Peaks, WA': 'Puncak Kembar, WA',
    'Radiator Springs, CO': 'Mata Air Radiator, CO',
    'South Park, CO': 'Taman Selatan, CO',
    'Zion, CA': 'Bukit Sion, CA',
    'Mordor, AZ': 'Tanah Mordor, AZ',
    'Metropolis, KS': 'Kota Metropolis, KS',
    'Gotham, IL': 'Kota Gotham, IL',
    'Shermer, IL': 'Desa Shermer, IL',
    'Pawnee, IN': 'Taman Kota Pawnee, IN',
    'Amity Island, RI': 'Pulau Amity, RI',
    'Bedford Falls, NY': 'Air Terjun Bedford, NY',
    'Castle Rock, ME': 'Batu Kastil, ME',
    'Derry, ME': 'Kota Derry, ME',
    'Hogsmeade, UK': 'Desa Hogsmeade, Inggris',
    'Bedrock, IE': 'Kota Batu Dasar, Irlandia',
    'Flumptown Annex, OH': 'Paviliun Flumptown, OH',
    'Zoning Board Rm B, NJ': 'Ruang Tata Kota B, NJ',
    'Abandoned Vicarage, UK': 'Pastoran Tua, UK',
    'Sub-Basement #4, AK': 'Rubanah #4, AK',
    'Bursar Waiting Rm, VT': 'Ruang Tunggu Kasir, VT',
    'Rotating Restaurant, WA': 'Restoran Berputar, WA',
    'Cul-De-Sac #7, IN': 'Jalan Buntu #7, IN',
    'Unfinished Bridge, OR': 'Jembatan Belum Selesai, OR',
    'Municipal Sump Pit, PA': 'Sumur Resapan Kota, PA',
    'Appliance Depot, IL': 'Gudang Peralatan, IL',
    'Patent Annex C, MA': 'Gedung Paten C, MA',
    'Bowling Rec Hall, WI': 'Gedung Bowling, WI',
    'Decommissioned Silo, KS': 'Silo Nonaktif, KS',
    'Boiler Room 2B, MI': 'Ruang Ketel 2B, MI',
    'Drainage District, TX': 'Distrik Drainase, TX',
    'Surplus Warehouse, NV': 'Gudang Surplus, NV',
    'Civic Boiler Annex, NY': 'Paviliun Ketel Kota, NY',
    'Orthopedic Ward, NC': 'Bangsal Ortopedi, NC',
    'Records Vault #9, VA': 'Brankas Arsip #9, VA',
    'Parking Lot 14-B, MN': 'Area Parkir 14-B, MN',
    'Thermostat Lobby, CO': 'Lobi Termostat, CO',
    'Laminated Lounge, FL': 'Ruang Laminasi, FL',
    'Clerical Elks #8, IA': 'Balai Juru Tulis #8, IA',
    'Tupperware Hall, MO': 'Aula Tupperware, MO',
    'Scone Conservatory, UK': 'Konservatori Scone, UK',
    'Cabbage Pavilion, ME': 'Paviliun Kubis, ME',
    'Sea of Tranquility, LUNA': 'Laut Ketenangan, BULAN',
    'Olympus Mons Annex, MARS': 'Paviliun Olympus Mons, MARS',
    'Orbital Cistern #4, LEO': 'Tangki Orbital #4, LEO',
    'Neo-Flumptown Dome, OH': 'Kubah Neo-Flumptown, OH',
    'Io Sulfur Refinery, JUP': 'Kilang Belerang Io, JUP',
    'Titan Methane Bowl, SAT': 'Arena Metana Titan, SAT',
    'Lagrange Point L2, ORB': 'Titik Lagrange L2, ORB',
    'Crater Tycho Civic, LUNA': 'Kawah Tycho, BULAN',
    'Sub-Level 99, CERES': 'Sub-Level 99, CERES',
    'Ganymede Ice Rink, JUP': 'Arena Es Ganymede, JUP',
    'Centauri Tollbooth, SEC-4': 'Gerbang Tol Centauri',
    'Europa Hydro-Deck, JUP': 'Dek Hidro Europa, JUP',
    'Phobos Parking Lot, MARS': 'Parkir Phobos, MARS',
    'Deimos Youth Hostel, MARS': 'Asrama Deimos, MARS',
    'Oort Cloud VFW #12, DEEP': 'Awan Oort #12, DEEP',
    'Venus Cloud Annex, VEN': 'Paviliun Awan Venus',
    'Mercury Sun-Shield, MER': 'Perisai Surya Merkurius',
    'Callisto Bowling, JUP': 'Bowling Callisto, JUP',
    'Asteroid 433 Rec, BELT': 'Asteroid 433, SABUK',
    'Pluto Kiosk #2, KUI': 'Kios Pluto #2, KUI',
  },
  bn: {
    'Portland, OR': 'পোর্টল্যান্ড, ওরেগন',
    'Springfield, OR': 'স্প্রিংফিল্ড, ওরেগন',
    'Bikini Bottom, HI': 'বিকিনি বটম, হাওয়াই',
    'Twin Peaks, WA': 'টুইন পিকস, ওয়াশিংটন',
    'Radiator Springs, CO': 'রেডিয়েটর স্প্রিংস, কলোরাডো',
    'South Park, CO': 'সাউথ পার্ক, কলোরাডো',
    'Zion, CA': 'জায়ন, ক্যালিফোর্নিয়া',
    'Mordor, AZ': 'মর্ডর, অ্যারিজোনা',
    'Metropolis, KS': 'মেট্রোপলিস, কানসাস',
    'Gotham, IL': 'গোথাম শহর, ইলিনয়',
    'Shermer, IL': 'শেরমার টাউন, ইলিনয়',
    'Pawnee, IN': 'পনি টাউন, ইন্ডিয়ানা',
    'Amity Island, RI': 'অ্যামিটি দ্বীপ, রোড আইল্যান্ড',
    'Bedford Falls, NY': 'বেডফোর্ড জলপ্রপাত, নিউ ইয়র্ক',
    'Castle Rock, ME': 'ক্যাসেল রক, মেইন',
    'Derry, ME': 'ডেরি টাউন, মেইন',
    'Hogsmeade, UK': 'হগসমিড গ্রাম, যুক্তরাজ্য',
    'Bedrock, IE': 'বেডরক, আয়ারল্যান্ড',
    'Flumptown Annex, OH': 'ফ্লাম্পটাউন অ্যানেক্স, OH',
    'Zoning Board Rm B, NJ': 'জোনিং বোর্ড কক্ষ বি, NJ',
    'Abandoned Vicarage, UK': 'পরিত্যক্ত যাজক ভবন, UK',
    'Sub-Basement #4, AK': 'সাব-বেসমেন্ট #৪, AK',
    'Bursar Waiting Rm, VT': 'কোষাধ্যক্ষের প্রতীক্ষালয়, VT',
    'Rotating Restaurant, WA': 'ঘূর্ণায়মান রেস্তোরাঁ, WA',
    'Cul-De-Sac #7, IN': 'কানাগলি #৭, IN',
    'Unfinished Bridge, OR': 'অসমাপ্ত সেতু, OR',
    'Municipal Sump Pit, PA': 'পৌর নিষ্কাশন কুণ্ড, PA',
    'Appliance Depot, IL': 'যন্ত্রপাতি ডিপো, IL',
    'Patent Annex C, MA': 'পেটেন্ট ভবন সি, MA',
    'Bowling Rec Hall, WI': 'বোলিং হল, WI',
    'Decommissioned Silo, KS': 'পরিত্যক্ত সাইলো, KS',
    'Boiler Room 2B, MI': 'বয়লার রুম টু-বি, MI',
    'Drainage District, TX': 'ড্রেনেজ ডিস্ট্রিক্ট, TX',
    'Surplus Warehouse, NV': 'উদ্বৃত্ত গুদাম, NV',
    'Civic Boiler Annex, NY': 'পৌর বয়লার হল, NY',
    'Orthopedic Ward, NC': 'অর্থোপেডিক ওয়ার্ড, NC',
    'Records Vault #9, VA': 'রেকর্ড ভল্ট #৯, VA',
    'Parking Lot 14-B, MN': 'পার্কিং লট ১৪-বি, MN',
    'Thermostat Lobby, CO': 'থার্মোস্ট্যাট লবি, CO',
    'Laminated Lounge, FL': 'ল্যামিনেটেড লাউঞ্জ, FL',
    'Clerical Elks #8, IA': 'করণিক ক্লাব #৮, IA',
    'Tupperware Hall, MO': 'টাপারওয়্যার হল, MO',
    'Scone Conservatory, UK': 'স্কোন কনজারভেটরি, UK',
    'Cabbage Pavilion, ME': 'বাঁধাকপি প্যাভিলিয়ন, ME',
    'Sea of Tranquility, LUNA': 'প্রশান্ত সাগর, চাঁদ',
    'Olympus Mons Annex, MARS': 'অলিম্পাস মনস, মঙ্গল',
    'Orbital Cistern #4, LEO': 'অরবিটাল ট্যাংক #৪, LEO',
    'Neo-Flumptown Dome, OH': 'নিও-ফ্লাম্পটাউন ডোম',
    'Io Sulfur Refinery, JUP': 'আইও সালফার শোধনাগার',
    'Titan Methane Bowl, SAT': 'টাইটান মিথেন বোল, শনি',
    'Lagrange Point L2, ORB': 'ল্যাগ্রাঞ্জ পয়েন্ট L2',
    'Crater Tycho Civic, LUNA': 'টাইকো ক্রেটার হল, চাঁদ',
    'Sub-Level 99, CERES': 'সাব-লেভেল ৯৯, সেরেস',
    'Ganymede Ice Rink, JUP': 'গ্যানিমিড আইস রিঙ্ক',
    'Centauri Tollbooth, SEC-4': 'সেন্টোরি টোলবুথ, SEC-4',
    'Europa Hydro-Deck, JUP': 'ইউরোপা হাইড্রো-ডেক',
    'Phobos Parking Lot, MARS': 'ফোবোস পার্কিং, মঙ্গল',
    'Deimos Youth Hostel, MARS': 'ডেইমোস হোস্টেল, মঙ্গল',
    'Oort Cloud VFW #12, DEEP': 'উর্ট ক্লাউড #১২, ডিপ',
    'Venus Cloud Annex, VEN': 'শুক্র মেঘ ভবন, VEN',
    'Mercury Sun-Shield, MER': 'বুধ সান-শিল্ড, MER',
    'Callisto Bowling, JUP': 'ক্যালিস্টো বোলিং, বৃহস্পতি',
    'Asteroid 433 Rec, BELT': 'গ্রহাণু ৪৩৩ হল, বেল্ট',
    'Pluto Kiosk #2, KUI': 'প্লুটো কিয়স্ক #২, KUI',
  },
  ur: {
    'Portland, OR': 'پورٹ لینڈ، اوریگون',
    'Springfield, OR': 'اسپرنگ فیلڈ، اوریگون',
    'Bikini Bottom, HI': 'بکنی باٹم، ہوائی',
    'Twin Peaks, WA': 'ٹوئن پیکس، واشنگٹن',
    'Radiator Springs, CO': 'ریڈی ایٹر اسپرنگز، کولوراڈو',
    'South Park, CO': 'ساؤتھ پارک، کولوراڈو',
    'Zion, CA': 'زائین، کیلیفورنیا',
    'Mordor, AZ': 'مورڈور، ایریزونا',
    'Metropolis, KS': 'میٹروپولس، کنساس',
    'Gotham, IL': 'گوتھم شہر، الینوائے',
    'Shermer, IL': 'شرمر ٹاؤن، الینوائے',
    'Pawnee, IN': 'پونی ٹاؤن، انڈیانا',
    'Amity Island, RI': 'ایمٹی جزیرہ، روڈ آئی لینڈ',
    'Bedford Falls, NY': 'بیڈفورڈ آبشار، نیویارک',
    'Castle Rock, ME': 'کیسل راک، مین',
    'Derry, ME': 'ڈیری ٹاؤن، مین',
    'Hogsmeade, UK': 'ہاگسمیڈ گاؤں، برطانیہ',
    'Bedrock, IE': 'بیڈ راک، آئرلینڈ',
    'Flumptown Annex, OH': 'فلمپ ٹاؤن اینیکس، OH',
    'Zoning Board Rm B, NJ': 'زوننگ بورڈ کمرہ بی، NJ',
    'Abandoned Vicarage, UK': 'قدیم پادری ہاؤس، UK',
    'Sub-Basement #4, AK': 'تہہ خانہ نمبر 4، AK',
    'Bursar Waiting Rm, VT': 'خزانچی انتظار گاہ، VT',
    'Rotating Restaurant, WA': 'گھومتا ریستوران، WA',
    'Cul-De-Sac #7, IN': 'بند گلی نمبر 7، IN',
    'Unfinished Bridge, OR': 'نامکمل پل، OR',
    'Municipal Sump Pit, PA': 'بلدیاتی حوض، PA',
    'Appliance Depot, IL': 'آلات ڈپو، IL',
    'Patent Annex C, MA': 'پیٹنٹ اینیکس سی، MA',
    'Bowling Rec Hall, WI': 'بولنگ ہال، WI',
    'Decommissioned Silo, KS': 'متروک سائلو، KS',
    'Boiler Room 2B, MI': 'بوائلر روم 2B، MI',
    'Drainage District, TX': 'ڈرینج ڈسٹرکٹ، TX',
    'Surplus Warehouse, NV': 'فاضل گودام، NV',
    'Civic Boiler Annex, NY': 'شہری بوائلر ہال، NY',
    'Orthopedic Ward, NC': 'آرتھوپیڈک وارڈ، NC',
    'Records Vault #9, VA': 'ریکارڈ والٹ نمبر 9، VA',
    'Parking Lot 14-B, MN': 'پارکنگ لاٹ 14-B، MN',
    'Thermostat Lobby, CO': 'تھرموسٹیٹ لابی، CO',
    'Laminated Lounge, FL': 'لیمینٹڈ لاؤنج، FL',
    'Clerical Elks #8, IA': 'کلرک کلب نمبر 8، IA',
    'Tupperware Hall, MO': 'ٹپروئیر ہال، MO',
    'Scone Conservatory, UK': 'سکون کنزرویٹری، UK',
    'Cabbage Pavilion, ME': 'بند گوبھی پویلین، ME',
    'Sea of Tranquility, LUNA': 'بحرِ سکون، چاند',
    'Olympus Mons Annex, MARS': 'اولمپس مونس، مریخ',
    'Orbital Cistern #4, LEO': 'مداری ٹینک نمبر 4',
    'Neo-Flumptown Dome, OH': 'نیو فلمپ ٹاؤن گنبد',
    'Io Sulfur Refinery, JUP': 'آئی او سلفر ریفائنری',
    'Titan Methane Bowl, SAT': 'ٹائٹن میتھین باؤل، زحل',
    'Lagrange Point L2, ORB': 'لیگرانج پوائنٹ L2',
    'Crater Tycho Civic, LUNA': 'ٹائیکو کریٹر ہال، چاند',
    'Sub-Level 99, CERES': 'سب لیول 99، سیریس',
    'Ganymede Ice Rink, JUP': 'گینیمیڈ آئس رنک',
    'Centauri Tollbooth, SEC-4': 'سنٹوری ٹول بوتھ',
    'Europa Hydro-Deck, JUP': 'یوروپا ہائیڈرو ڈیک',
    'Phobos Parking Lot, MARS': 'فوبوس پارکنگ، مریخ',
    'Deimos Youth Hostel, MARS': 'ڈیموس ہاسٹل، مریخ',
    'Oort Cloud VFW #12, DEEP': 'اورٹ کلاؤڈ نمبر 12',
    'Venus Cloud Annex, VEN': 'زہرہ کلاؤڈ ہال',
    'Mercury Sun-Shield, MER': 'عطارد سن شیلڈ',
    'Callisto Bowling, JUP': 'کالسٹو بولنگ، مشتری',
    'Asteroid 433 Rec, BELT': 'سیارچہ 433 ہال',
    'Pluto Kiosk #2, KUI': 'پلوٹو کیوسک نمبر 2',
  },
  ar: {
    'Portland, OR': 'بورتلاند، أوريغون',
    'Springfield, OR': 'سبرينغفيلد، أوريغون',
    'Bikini Bottom, HI': 'قاع الهامور، هاواي',
    'Twin Peaks, WA': 'القمم التوأم، واشنطن',
    'Radiator Springs, CO': 'ينابيع المشعاع، كولورادو',
    'South Park, CO': 'الحديقة الجنوبية، كولورادو',
    'Zion, CA': 'صهيون، كاليفورنيا',
    'Mordor, AZ': 'أرض موردور، أريزونا',
    'Metropolis, KS': 'ميتروبوليس، كانساس',
    'Gotham, IL': 'مدينة غوثام، إلينوي',
    'Shermer, IL': 'بلدة شيرمر، إلينوي',
    'Pawnee, IN': 'بلدة باوني، إنديانا',
    'Amity Island, RI': 'جزيرة أميتي، رود آيلاند',
    'Bedford Falls, NY': 'شلالات بيدفورد، نيويورك',
    'Castle Rock, ME': 'صخرة القلعة، مين',
    'Derry, ME': 'بلدة ديري، مين',
    'Hogsmeade, UK': 'قرية هوغسميد، بريطانيا',
    'Bedrock, IE': 'بيدروك، أيرلندا',
    'Flumptown Annex, OH': 'ملحق فلامبتاون، OH',
    'Zoning Board Rm B, NJ': 'لجنة التخطيط ب، NJ',
    'Abandoned Vicarage, UK': 'الأبرشية المهجورة، UK',
    'Sub-Basement #4, AK': 'القبو الرابع، AK',
    'Bursar Waiting Rm, VT': 'قاعة أمين الصندوق، VT',
    'Rotating Restaurant, WA': 'المطعم الدوار، WA',
    'Cul-De-Sac #7, IN': 'الطريق المسدود 7، IN',
    'Unfinished Bridge, OR': 'الجسر غير المكتمل، OR',
    'Municipal Sump Pit, PA': 'الحفرة البلدية، PA',
    'Appliance Depot, IL': 'مستودع الأجهزة، IL',
    'Patent Annex C, MA': 'ملحق البراءات ج، MA',
    'Bowling Rec Hall, WI': 'صالة البولينغ، WI',
    'Decommissioned Silo, KS': 'الصومعة المتقاعدة، KS',
    'Boiler Room 2B, MI': 'غرفة المرجل 2ب، MI',
    'Drainage District, TX': 'حي التصريف، TX',
    'Surplus Warehouse, NV': 'مستودع الفائض، NV',
    'Civic Boiler Annex, NY': 'المرجل البلدي، NY',
    'Orthopedic Ward, NC': 'جناح العظام، NC',
    'Records Vault #9, VA': 'خزانة السجلات 9، VA',
    'Parking Lot 14-B, MN': 'موقف 14-ب، MN',
    'Thermostat Lobby, CO': 'بهو الثرموستات، CO',
    'Laminated Lounge, FL': 'الصالة المغلفة، FL',
    'Clerical Elks #8, IA': 'نادي الكتبة 8، IA',
    'Tupperware Hall, MO': 'قاعة تابروير، MO',
    'Scone Conservatory, UK': 'معهد السكون، UK',
    'Cabbage Pavilion, ME': 'جناح الملفوف، ME',
    'Sea of Tranquility, LUNA': 'بحر الهدوء، القمر',
    'Olympus Mons Annex, MARS': 'جبل أوليمبوس، المريخ',
    'Orbital Cistern #4, LEO': 'الصهريج المداري 4',
    'Neo-Flumptown Dome, OH': 'قبة نيو-فلامبتاون',
    'Io Sulfur Refinery, JUP': 'مصفاة كبريت آيو',
    'Titan Methane Bowl, SAT': 'حوض ميثان تيتان، زحل',
    'Lagrange Point L2, ORB': 'نقطة لاغرانج L2',
    'Crater Tycho Civic, LUNA': 'فوهة تايكو، القمر',
    'Sub-Level 99, CERES': 'المستوى الفرعي 99، سيريس',
    'Ganymede Ice Rink, JUP': 'حلبة غانيميد الجليدية',
    'Centauri Tollbooth, SEC-4': 'بوابة قنطورس، قطاع 4',
    'Europa Hydro-Deck, JUP': 'سطح أوروبا المائي',
    'Phobos Parking Lot, MARS': 'موقف فوبوس، المريخ',
    'Deimos Youth Hostel, MARS': 'نزل ديموس، المريخ',
    'Oort Cloud VFW #12, DEEP': 'سحابة أورت 12، الفضاء',
    'Venus Cloud Annex, VEN': 'ملحق سحاب الزهرة',
    'Mercury Sun-Shield, MER': 'درع عطارد الشمسي',
    'Callisto Bowling, JUP': 'بولينغ كاليستو، المشتري',
    'Asteroid 433 Rec, BELT': 'كويكب 433، الحزام',
    'Pluto Kiosk #2, KUI': 'كشك بلوتو 2، كايبر',
  },
  tlh: {
    'Portland, OR': "Qo'noS veng wa'DIch",
    'Springfield, OR': 'Khitomer Outpost',
    'Bikini Bottom, HI': 'Rura Penthe tlhIlHal',
    'Twin Peaks, WA': 'Boreth Monastery',
    'Radiator Springs, CO': 'Sto-Vo-Kor vaS',
    'South Park, CO': "Ty'Gokor Hall",
    'Zion, CA': 'Praxis Moon Remnant',
    'Mordor, AZ': "Gre'thor Gate",
    'Metropolis, KS': "Quin'lat City",
    'Gotham, IL': 'Narendra III Annex',
    'Shermer, IL': 'Morska Sub-Station',
    'Pawnee, IN': 'Kriosian Hall',
    'Amity Island, RI': 'Organia Border Zone',
    'Bedford Falls, NY': 'Nimbus III Saloon',
    'Castle Rock, ME': 'Ceti Alpha V Dunes',
    'Derry, ME': 'Ganalda IV Station',
    'Hogsmeade, UK': 'Drozana Corridor',
    'Bedrock, IE': "Tong'vey Sector",
    'Flumptown Annex, OH': "Flumptown qach, Qo'noS",
    'Zoning Board Rm B, NJ': "yoS yejHaD pa' B",
    'Abandoned Vicarage, UK': "qach ngo', UK",
    'Sub-Basement #4, AK': "bIng pa' #4, AK",
    'Bursar Waiting Rm, VT': "Huch vu'wI' pa', VT",
    'Rotating Restaurant, WA': "DIngbogh Soj qach, WA",
    'Cul-De-Sac #7, IN': "He mev #7, IN",
    'Unfinished Bridge, OR': "rInbe'bogh QI, OR",
    'Municipal Sump Pit, PA': "yoS bIQem, PA",
    'Appliance Depot, IL': "Jan ngaSwI', IL",
    'Patent Annex C, MA': "chut qach C, MA",
    'Bowling Rec Hall, WI': "Quj vaS, WI",
    'Decommissioned Silo, KS': "Silo ngo', KS",
    'Boiler Room 2B, MI': "tujmoHwI' pa' 2B, MI",
    'Drainage District, TX': "bIQ He yoS, TX",
    'Surplus Warehouse, NV': "tep ngaSwI', NV",
    'Civic Boiler Annex, NY': "veng tujmoHwI', NY",
    'Orthopedic Ward, NC': "Hom rop pa', NC",
    'Records Vault #9, VA': "mem ngaSwI' #9, VA",
    'Parking Lot 14-B, MN': "Duj vergh 14-B, MN",
    'Thermostat Lobby, CO': "tuj SeHlaw vaS, CO",
    'Laminated Lounge, FL': "ghoD vaS, FL",
    'Clerical Elks #8, IA': "ghItlhwI' ghom #8, IA",
    'Tupperware Hall, MO': "ngaSwI' vaS, MO",
    'Scone Conservatory, UK': "Soj bom qach, UK",
    'Cabbage Pavilion, ME': "naH vaS, ME",
    'Sea of Tranquility, LUNA': "Praxis bIQ'a', maS",
    'Olympus Mons Annex, MARS': "Olympus HuD, MARS",
    'Orbital Cistern #4, LEO': "bavwI' ngaSwI' #4",
    'Neo-Flumptown Dome, OH': "Neo-Flumptown Dech",
    'Io Sulfur Refinery, JUP': "Io tlhIl qach, JUP",
    'Titan Methane Bowl, SAT': "Titan SIp vaS, SAT",
    'Lagrange Point L2, ORB': "Lagrange Daq L2, ORB",
    'Crater Tycho Civic, LUNA': "Tycho vaS, maS",
    'Sub-Level 99, CERES': "bIng Patlh 99, CERES",
    'Ganymede Ice Rink, JUP': "Ganymede chuch Daq",
    'Centauri Tollbooth, SEC-4': "Centauri lojmIt, SEC-4",
    'Europa Hydro-Deck, JUP': "Europa bIQ rIymey",
    'Phobos Parking Lot, MARS': "Phobos Duj vergh",
    'Deimos Youth Hostel, MARS': "Deimos QongDaq, MARS",
    'Oort Cloud VFW #12, DEEP': "Oort 'eng #12, DEEP",
    'Venus Cloud Annex, VEN': "Venus 'eng qach, VEN",
    'Mercury Sun-Shield, MER': "Mercury Jul yoD, MER",
    'Callisto Bowling, JUP': "Callisto Quj vaS, JUP",
    'Asteroid 433 Rec, BELT': "nagh 433 vaS, BELT",
    'Pluto Kiosk #2, KUI': "Pluto qachHom #2, KUI",
  },
};

export function localizeVenueName(city: string, lang: SupportedLocale = resolveActiveLocale()): string {
  if (lang === 'en') return city;
  if (lang === 'pig') return toPigLatinText(city);
  const customDict = EXTRA_VENUE_MAP[lang];
  if (customDict && customDict[city]) return customDict[city];
  const idx = (LANG_INDEX as any)[lang];
  const row = VENUE_I18N[city];
  if (row && idx !== undefined) return row[idx];
  return city;
}

export function localizeTourDate(dateStr: string, lang: SupportedLocale = resolveActiveLocale()): string {
  if (lang === 'en') return dateStr;
  const parts = dateStr.split('/');
  if (parts.length !== 2) return dateStr;
  const [m, d] = parts;
  switch (lang) {
    case 'es':
    case 'pt':
    case 'fr':
    case 'id':
    case 'hi':
    case 'bn':
    case 'ur':
    case 'ar':
      return `${d}/${m.padStart(2, '0')}`;
    case 'de':
      return `${d}.${m.padStart(2, '0')}.`;
    case 'ru':
      return `${d}.${m.padStart(2, '0')}`;
    case 'ja':
    case 'zh':
      return `${m}月${d}日`;
    case 'tlh':
      return `jaj ${m}.${d}`;
    default:
      return dateStr;
  }
}

export function localizeTourStops(
  stops: TourStop[],
  lang: SupportedLocale = resolveActiveLocale()
): TourStop[] {
  return stops.map((s) => ({
    date: localizeTourDate(s.date, lang),
    city: localizeVenueName(s.city, lang),
  }));
}

const DAYS_IN_MONTH: Record<number, number> = {
  1: 31,
  2: 28,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};

function createSeededRng(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return () => {
    let t = (h += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function advanceCalendarDate(
  month: number,
  day: number,
  deltaDays: number
): { month: number; day: number } {
  let m = month;
  let d = day + deltaDays;
  while (d > (DAYS_IN_MONTH[m] || 30)) {
    d -= DAYS_IN_MONTH[m] || 30;
    m = m >= 12 ? 1 : m + 1;
  }
  return { month: m, day: d };
}

export function generateProceduralTourRoster(
  album: AlbumEntry,
  lang: SupportedLocale = resolveActiveLocale()
): TourStop[] {
  const nextRand = createSeededRng(`${album.id}|${album.bandName}|${album.year}`);

  const isFuture = parseInt(album.year, 10) > new Date().getFullYear();
  const pool = isFuture ? [...TEMPORAL_FUTURE_VENUES] : [...MUNICIPAL_LORE_VENUES];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const stops: TourStop[] = [];
  let month = 6;
  let day = 4 + Math.floor(nextRand() * 5);

  for (let s = 0; s < 18; s++) {
    const venue = pool[s % pool.length];
    for (let night = 0; night < 2; night++) {
      stops.push({
        date: `${month}/${String(day).padStart(2, '0')}`,
        city: venue,
      });
      if (night === 0) {
        const next = advanceCalendarDate(month, day, 1);
        month = next.month;
        day = next.day;
      }
    }
    const travel = advanceCalendarDate(month, day, 3 + Math.floor(nextRand() * 3));
    month = travel.month;
    day = travel.day;
  }

  return localizeTourStops(stops, lang);
}

export function generateMixedTourRoster(
  album: AlbumEntry,
  shuffleSeed: number = 0,
  lang: SupportedLocale = resolveActiveLocale()
): TourStop[] {
  const nextRand = createSeededRng(
    `${album.id}|${album.bandName}|${album.year}|mixed|${shuffleSeed}`
  );

  const isFuture = parseInt(album.year, 10) > new Date().getFullYear();
  const canonicalCities = Array.from(new Set(CANONICAL_TOUR_ROSTER.map((s) => s.city)));
  const combinedPool = Array.from(
    new Set([
      ...canonicalCities,
      ...MUNICIPAL_LORE_VENUES,
      ...(isFuture ? TEMPORAL_FUTURE_VENUES : []),
    ])
  );

  const shufflePool = (arr: string[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  let bag = shufflePool(combinedPool);
  let bagIdx = 0;
  const drawVenue = (): string => {
    if (bagIdx >= bag.length) {
      bag = shufflePool(combinedPool);
      bagIdx = 0;
    }
    return bag[bagIdx++];
  };

  let month = 4 + Math.floor(nextRand() * 4);
  let day = 2 + Math.floor(nextRand() * 9);

  const stops: TourStop[] = [];
  while (stops.length < 36) {
    const venue = drawVenue();
    const isTwoNightStand = stops.length <= 34 && nextRand() < 0.28;

    stops.push({
      date: `${month}/${String(day).padStart(2, '0')}`,
      city: venue,
    });

    if (isTwoNightStand && stops.length < 36) {
      const secondNight = advanceCalendarDate(month, day, 1);
      month = secondNight.month;
      day = secondNight.day;
      stops.push({
        date: `${month}/${String(day).padStart(2, '0')}`,
        city: venue,
      });
    }

    const travelDays = 2 + Math.floor(nextRand() * 4);
    const nextStopDate = advanceCalendarDate(month, day, travelDays);
    month = nextStopDate.month;
    day = nextStopDate.day;
  }

  return localizeTourStops(stops, lang);
}

export type CustomStopPlacement = 'mid-tour' | 'two-night' | 'finale';

export interface CustomStopInjectionResult {
  stops: TourStop[];
  injectedDates: string[];
  column: 1 | 2;
}

export function injectCustomTourStop(
  baseStops: TourStop[],
  customCity: string,
  placement: CustomStopPlacement = 'mid-tour',
  seedStr: string = 'custom'
): CustomStopInjectionResult {
  const cleanCity = customCity.trim();
  if (!cleanCity || baseStops.length === 0) {
    return { stops: baseStops, injectedDates: [], column: 1 };
  }

  const updated = baseStops.map((s) => ({ ...s }));
  const half = Math.ceil(updated.length / 2);

  if (placement === 'finale') {
    const lastIdx = updated.length - 1;
    updated[lastIdx].city = cleanCity;
    return {
      stops: updated,
      injectedDates: [updated[lastIdx].date],
      column: 2,
    };
  }

  const rng = createSeededRng(`${seedStr}|${cleanCity}`);
  const pairCount = Math.max(1, Math.floor((updated.length - 6) / 2));
  const targetIdx = 2 + Math.floor(rng() * pairCount) * 2;

  updated[targetIdx].city = cleanCity;
  const injectedDates = [updated[targetIdx].date];

  if (placement === 'two-night' && targetIdx + 1 < updated.length) {
    updated[targetIdx + 1].city = cleanCity;
    injectedDates.push(updated[targetIdx + 1].date);
  }

  return {
    stops: updated,
    injectedDates,
    column: targetIdx < half ? 1 : 2,
  };
}

export interface TourRenderOptions {
  stops?: TourStop[];
  accentColor?: string;
  showDividingLine?: boolean;
}

export function renderTourBackGraphic(options: TourRenderOptions = {}): string {
  const canvas = document.createElement('canvas');
  canvas.width = 3600;
  canvas.height = 4800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const ink = options.accentColor || '#8b1410';
  const stops =
    options.stops && options.stops.length > 0
      ? options.stops
      : localizeTourStops(CANONICAL_TOUR_ROSTER);
  const half = Math.ceil(stops.length / 2);
  const leftCol = stops.slice(0, half);
  const rightCol = stops.slice(half);

  // 1. Center Vertical Rule (Center is X = 1800)
  if (options.showDividingLine !== false) {
    ctx.strokeStyle = ink;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(1800, 360);
    ctx.lineTo(1800, 4440);
    ctx.stroke();
  }

  // 2. Typography Geometry (with CJK, Devanagari & Cyrillic display fallbacks)
  const startY = 490;
  const rowCount = Math.max(leftCol.length, rightCol.length);
  const availableHeight = 3900;
  const lineHeight = availableHeight / rowCount;

  ctx.fillStyle = ink;
  ctx.font =
    'bold italic 112px "Playfair Display", Georgia, "Times New Roman", "Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", "Microsoft YaHei", "Noto Sans Devanagari", "Noto Sans Bengali", "Noto Sans Arabic", "Noto Nastaliq Urdu", serif';
  ctx.textBaseline = 'middle';

  // Left Column (Max width stops before 1800)
  leftCol.forEach((item, i) => {
    const y = startY + i * lineHeight;
    ctx.textAlign = 'left';
    ctx.fillText(item.date, 130, y, 420);
    ctx.fillText(item.city, 580, y, 1140);
  });

  // Right Column (Max width stops before 3600)
  rightCol.forEach((item, i) => {
    const y = startY + i * lineHeight;
    ctx.textAlign = 'left';
    ctx.fillText(item.date, 1930, y, 420);
    ctx.fillText(item.city, 2380, y, 1140);
  });

  // 3. Tiny Manufacturer Mark at the Bottom
  ctx.textAlign = 'center';
  ctx.font = 'bold 60px "Space Mono", monospace';
  ctx.fillText('Y.D.R.B.N.', 1800, 4650);

  return canvas.toDataURL('image/png');
}
