import { SupportedLocale, resolveActiveLocale, toPigLatinText, toPigLatinHtml, PRESSED_PREFIXES } from './i18nService';

type PhraseTable = Partial<Record<SupportedLocale, string>>;

// 1. Rich HTML paragraphs (containing inline <strong> tags), keyed by normalized textContent
const RAW_RICH_BLOCKS: Record<string, [string, string, string, string, string, string]> = {
  "Tap the Share button in Safari's toolbar.": [
    "Toca el botón <strong>Compartir</strong> en la barra de Safari.",
    "Toque no botão <strong>Compartilhar</strong> na barra do Safari.",
    "Safariのツールバーにある<strong>共有</strong>ボタンをタップします。",
    "点击 Safari 工具栏中的<strong>分享</strong>按钮。",
    "Safari के टूलबार में <strong>Share</strong> बटन पर टैप करें।",
    "Нажмите кнопку <strong>Поделиться</strong> на панели Safari."
  ],
  "Scroll down and tap “Add to Home Screen”.": [
    "Desplázate hacia abajo y toca <strong>«Añadir a pantalla de inicio»</strong>.",
    "Role para baixo e toque em <strong>“Adicionar à Tela de Início”</strong>.",
    "下にスクロールして<strong>「ホーム画面に追加」</strong>をタップします。",
    "向下滚动并点击<strong>“添加到主屏幕”</strong>。",
    "नीचे स्क्रॉल करें और <strong>“Add to Home Screen”</strong> पर टैप करें।",
    "Прокрутите вниз и выберите <strong>«На экран „Домой“»</strong>."
  ],
  "Tap Chrome's menu (⋮) in the top-right corner.": [
    "Toca el menú de Chrome (<strong>⋮</strong>) en la esquina superior derecha.",
    "Toque no menu do Chrome (<strong>⋮</strong>) no canto superior direito.",
    "右上のChromeメニュー（<strong>⋮</strong>）をタップします。",
    "点击右上角的 Chrome 菜单 (<strong>⋮</strong>)。",
    "ऊपरी-दाएँ कोने में Chrome के मेनू (<strong>⋮</strong>) पर टैप करें।",
    "Нажмите на меню Chrome (<strong>⋮</strong>) в правом верхнем углу."
  ],
  "Tap “Install app” (or “Add to Home screen”).": [
    "Toca <strong>«Instalar aplicación»</strong> (o <strong>«Añadir a pantalla de inicio»</strong>).",
    "Toque em <strong>“Instalar aplicativo”</strong> (ou <strong>“Adicionar à tela inicial”</strong>).",
    "<strong>「アプリをインストール」</strong>（または<strong>「ホーム画面に追加」</strong>）をタップします。",
    "点击<strong>“安装应用”</strong>（或<strong>“添加到主屏幕”</strong>）。",
    "<strong>“Install app”</strong> (या <strong>“Add to Home screen”</strong>) पर टैप करें।",
    "Нажмите <strong>«Установить приложение»</strong> (или <strong>«Добавить на гл. экран»</strong>)."
  ],
  "Click the Install icon on the right side of your address bar, or open the browser menu (⋮) and choose “Install Y.D.R.B.N.”": [
    "Haz clic en el icono <strong>Instalar</strong> a la derecha de la barra de direcciones, o abre el menú (<strong>⋮</strong>) y elige <strong>«Instalar Y.D.R.B.N.»</strong>",
    "Clique no ícone <strong>Instalar</strong> no lado direito da barra de endereços, ou abra o menu (<strong>⋮</strong>) e escolha <strong>“Instalar Y.D.R.B.N.”</strong>",
    "アドレスバー右側の<strong>インストール</strong>アイコンをクリックするか、メニュー（<strong>⋮</strong>）から<strong>「Y.D.R.B.N.をインストール」</strong>を選択してください。",
    "点击地址栏右侧的<strong>安装</strong>图标，或打开浏览器菜单 (<strong>⋮</strong>) 并选择<strong>“安装 Y.D.R.B.N.”</strong>",
    "एड्रेस बार के दाईं ओर <strong>Install</strong> आइकन पर क्लिक करें, या ब्राउज़र मेनू (<strong>⋮</strong>) खोलें और <strong>“Install Y.D.R.B.N.”</strong> चुनें।",
    "Нажмите значок <strong>Установить</strong> справа в адресной строке или откройте меню (<strong>⋮</strong>) и выберите <strong>«Установить Y.D.R.B.N.»</strong>"
  ],
  "Hit ⚡ Daily Drop to forge today's surreal fictional band and vinyl artwork!": [
    "¡Pulsa <span class=\"text-orange-400 font-bold\">⚡ Disco del Día</span> para forjar la banda surrealista y el arte en vinilo de hoy!",
    "Toque em <span class=\"text-orange-400 font-bold\">⚡ Disco do Dia</span> para criar a banda surreal e a capa de vinil de hoje!",
    "<span class=\"text-orange-400 font-bold\">⚡ 本日のドロップ</span>を押して、今日の架空バンドとレコードジャケットを生成しましょう！",
    "点击 <span class=\"text-orange-400 font-bold\">⚡ 今日唱片掉落</span>，锻造今日超现实虚拟乐队与黑胶封面！",
    "आज का काल्पनिक बैंड और विनाइल कवर बनाने के लिए <span class=\"text-orange-400 font-bold\">⚡ डेली ड्रॉप</span> दबाएँ!",
    "Нажмите <span class=\"text-orange-400 font-bold\">⚡ Диск Дня</span>, чтобы создать сегодняшнюю группу и обложку винила!"
  ],
  "Web browsers block apps from pre-loading files onto external store pages—the links below open a blank t-shirt designer. Save your 300 DPI PNG(s) in Step 1 first, then use the vendor's “Upload / Add Image” button to select the saved file(s) from your device's Downloads folder.": [
    "Los navegadores bloquean la carga automática en tiendas externas: los enlaces de abajo abren un <strong>diseñador de camisetas en blanco</strong>. Guarda primero tus PNGs de 300 DPI en el <strong>Paso 1</strong> y luego usa el botón <strong>«Subir / Añadir Imagen»</strong> de la tienda desde tu carpeta de Descargas.",
    "Os navegadores bloqueiam o envio automático para lojas externas: os links abaixo abrem um <strong>criador de camisetas em branco</strong>. Salve primeiro seus PNGs de 300 DPI no <strong>Passo 1</strong> e depois use o botão <strong>“Upload / Adicionar Imagem”</strong> da loja a partir da pasta Downloads.",
    "ブラウザのセキュリティ仕様により外部ストアへ画像を自動入力することはできません。下のリンクは<strong>無地のTシャツ作成画面</strong>を開きます。まず<strong>手順1</strong>で300 DPIのPNGを保存し、業者サイトの<strong>「画像をアップロード / 追加」</strong>ボタンから保存したファイルを選択してください。",
    "浏览器安全机制禁止应用将文件预加载到外部商店页面——下方链接将打开<strong>空白T恤设计器</strong>。请先在<strong>第1步</strong>保存 300 DPI PNG，然后使用印制商网站上的<strong>“上传 / 添加图片”</strong>按钮从设备“下载”文件夹中选择文件。",
    "वेब ब्राउज़र बाहरी स्टोर पेज पर फ़ाइलें पहले से लोड करने से रोकते हैं—नीचे दिए गए लिंक एक <strong>खाली टी-शर्ट डिज़ाइनर</strong> खोलते हैं। पहले <strong>चरण 1</strong> में अपने 300 DPI PNG सेव करें, फिर अपने डिवाइस के डाउनलोड फ़ोल्डर से फ़ाइल चुनने के लिए विक्रेता के <strong>“Upload / Add Image”</strong> बटन का उपयोग करें।",
    "Браузеры блокируют автозагрузку файлов на внешние сайты — ссылки ниже открывают <strong>пустой конструктор футболок</strong>. Сначала сохраните PNG (300 DPI) на <strong>Шаге 1</strong>, а затем нажмите <strong>«Загрузить / Добавить изображение»</strong> на сайте печати и выберите файлы из папки «Загрузки»."
  ],
  "✦ Custom Drop: Enter any fields you choose. Anything left blank will be generated automatically. Custom drops do not consume your 24h Daily Drop timer.": [
    "✦ <strong>Disco Personalizado:</strong> Rellena los campos que quieras. Lo que dejes en blanco se generará automáticamente sin consumir tu temporizador de 24 h.",
    "✦ <strong>Disco Personalizado:</strong> Preencha os campos que quiser. O que ficar em branco será gerado automaticamente sem consumir seu cronômetro de 24h.",
    "✦ <strong>カスタム制作:</strong> 好きな項目だけ入力してください（空欄は自動生成されます）。24時間のデイリードロップ制限は消費しません。",
    "✦ <strong>自定义唱片：</strong>填写任意字段，留空项将自动生成。制作自定义唱片不会消耗 24 小时每日掉落冷却时间。",
    "✦ <strong>कस्टम ड्रॉप:</strong> अपनी पसंद के कोई भी फ़ील्ड भरें। खाली छोड़े गए भाग अपने आप बन जाएंगे। कस्टम ड्रॉप आपके 24 घंटे के टाइमर का उपयोग नहीं करते।",
    "✦ <strong>Свой Выпуск:</strong> Заполните любые поля по желанию. Пустые поля сгенерируются автоматически без сброса 24-часового таймера."
  ],
  "Tap any word pill to switch between [N]oun, [A]djective, [E]nsemble, or [SKIP].": [
    "Toca cualquier palabra para alternar entre <strong>[N]</strong>ombre, <strong>[A]</strong>djetivo, <strong>[E]</strong>nsamble o <strong>[SKIP]</strong> (Omitir).",
    "Toque em qualquer palavra para alternar entre <strong>[N]</strong>ome, <strong>[A]</strong>djetivo, <strong>[E]</strong>nsemble ou <strong>[SKIP]</strong> (Pular).",
    "単語バッジをタップして <strong>[N]</strong>名詞・<strong>[A]</strong>形容詞・<strong>[E]</strong>編成・<strong>[SKIP]</strong>除外 を切り替えます。",
    "点击任意词汇标签可在 <strong>[N]</strong>名词、<strong>[A]</strong>形容词、<strong>[E]</strong>乐团编制 或 <strong>[SKIP]</strong>跳过 之间切换。",
    "किसी भी शब्द पर टैप करके <strong>[N]</strong>संज्ञा, <strong>[A]</strong>विशेषण, <strong>[E]</strong>समूह, या <strong>[SKIP]</strong> के बीच बदलें।",
    "Нажмите на слово для переключения: <strong>[N]</strong>сущ., <strong>[A]</strong>прил., <strong>[E]</strong>ансамбль или <strong>[SKIP]</strong>пропуск."
  ],
  "Press once every 24 hours to mint today's album. Swipe left or right on the sleeve to browse your crate, tap Zoom or ↺ Flip in the corner, and tap Read ↗ on the back for full Liner Notes.": [
    "Pulsa una vez cada 24 horas para prensar el álbum del día. <strong>Desliza a izquierda o derecha</strong> sobre la portada para explorar tu caja, toca <strong>Zoom</strong> o <strong>↺ Voltear</strong> en la esquina, y toca <strong>Leer ↗</strong> detrás para abrir las Notas.",
    "Pressione uma vez a cada 24 horas para prensar o álbum do dia. <strong>Deslize para a esquerda ou direita</strong> na capa para navegar pela caixa, toque em <strong>Zoom</strong> ou <strong>↺ Virar</strong> no canto, e em <strong>Ler ↗</strong> atrás para abrir as Notas.",
    "24時間に1回タップして本日のアルバムをプレスします。ジャケットを<strong>左右にスワイプ</strong>してクレートを切り替え、右下の<strong>拡大</strong>や<strong>↺ 裏返す</strong>、裏面の<strong>読む ↗</strong>からライナーノーツ全文を表示できます。",
    "每 24 小时按一次即可压制今日专辑。在封套上<strong>左右滑动</strong>浏览唱片箱，点击右下角的<strong>放大</strong>或<strong>↺ 翻转</strong>，点击背面的<strong>阅读 ↗</strong>查看完整内页说明。",
    "आज का एल्बम बनाने के लिए हर 24 घंटे में एक बार दबाएँ। अपने क्रेट को देखने के लिए कवर पर <strong>बाएँ या दाएँ स्वाइप करें</strong>, कोने में <strong>ज़ूम</strong> या <strong>↺ पलटें</strong> दबाएँ, और पूरे नोट्स के लिए पीछे <strong>पढ़ें ↗</strong> पर टैप करें।",
    "Нажимайте раз в 24 часа для выпуска альбома дня. <strong>Листайте влево или вправо</strong> по обложке для просмотра ящика, жмите <strong>Зум</strong> или <strong>↺ Оборот</strong> в углу и <strong>Читать ↗</strong> на обороте."
  ],
  "Open Customize A Drop to retouch the current sleeve with 1970s darkroom filters, or open Custom Drop Studio to press a brand-new record anytime.": [
    "Abre <strong>Personalizar Lanzamiento</strong> para retocar la portada actual con filtros de cuarto oscuro de los años 70, o abre el <strong>Estudio Personalizado</strong> para prensar un disco nuevo cuando quieras.",
    "Abra <strong>Personalizar Disco</strong> para retocar a capa atual com filtros de câmara escura dos anos 70, ou abra o <strong>Estúdio Personalizado</strong> para prensar um disco novo a qualquer momento.",
    "<strong>カスタム制作</strong>を開いて現在のジャケットに70年代の暗室フィルターをかけたり、<strong>カスタム制作スタジオ</strong>でいつでも新しいレコードをプレスできます。",
    "打开<strong>自定义唱片</strong>使用 1970 年代暗房滤镜修饰当前封套，或随时打开<strong>自定义唱片工作室</strong>压制全新唱片。",
    "वर्तमान कवर पर 1970 के दशक के डार्करूम फ़िल्टर लगाने के लिए <strong>कस्टम रिकॉर्ड बनाएँ</strong> खोलें, या कभी भी नया रिकॉर्ड बनाने के लिए <strong>कस्टम ड्रॉप स्टूडियो</strong> खोलें।",
    "Откройте <strong>Свой Выпуск</strong> для ретуши обложки фильтрами фотолаборатории 70-х или запустите <strong>Студию Своего Выпуска</strong> для создания новой пластинки в любое время."
  ],
  "Y.D.R.B.N. runs 100% offline on your device. Installing mounts it to your home screen or desktop without browser bars, app stores, or accounts.": [
    "Y.D.R.B.N. funciona <strong>100% sin conexión</strong> en tu dispositivo. Instalarlo lo añade a tu pantalla de inicio o escritorio sin barras de navegador, tiendas ni cuentas.",
    "O Y.D.R.B.N. roda <strong>100% offline</strong> no seu dispositivo. A instalação fixa o app na tela inicial ou área de trabalho sem barras de navegador, lojas ou contas.",
    "Y.D.R.B.N. は端末上で<strong>100%オフライン</strong>で動作します。インストールするとブラウザバーやストア、アカウント不要でホーム画面やデスクトップから起動できます。",
    "Y.D.R.B.N. 在您的设备上 <strong>100% 离线</strong>运行。安装后可直接固定到主屏幕或桌面，无需浏览器地址栏、应用商店或账号。",
    "Y.D.R.B.N. आपके डिवाइस पर <strong>100% ऑफ़लाइन</strong> चलता है। इंस्टॉल करने से यह बिना ब्राउज़र बार, ऐप स्टोर या खाते के आपकी होम स्क्रीन या डेस्कटॉप पर जुड़ जाता है।",
    "Y.D.R.B.N. работает <strong>на 100% офлайн</strong> на вашем устройстве. Установка добавляет приложение на главный экран или рабочий стол без адресной строки и аккаунтов."
  ]
};

// 2. Single-Node & Split-Fragment Phrase Dictionary: Normalized English -> [es, pt, ja, zh, hi, ru]
const RAW_PHRASES: Record<string, [string, string, string, string, string, string]> = {
  "Copy & Translate": ["Copiar y Traducir", "Copiar e Traduzir", "複製して翻訳", "复制并翻译", "कॉपी और अनुवाद करें", "Копировать и перевести"],
  "Canonical '77": ["Canónico '77", "Canônico '77", "1977年カノン", "1977经典路线", "कैननिकल '77", "Канон '77"],
  "Municipal Lore": ["Lore Municipal", "Lore Municipal", "地方自治体ロア", "市政传说路线", "म्युनिसिपल लोर", "Муниципальный"],
  "Chrono-Orbital": ["Crono-Orbital", "Crono-Orbital", "クロノ軌道", "时空轨道路线", "क्रोनो-ऑर्बिटल", "Орбитальный"],
  "FIELD GUIDE v1.2": ["GUÍA DE USO v1.2", "GUIA DE USO v1.2", "操作ガイド v1.2", "操作指南 v1.2", "फ़ील्ड गाइड v1.2", "РУКОВОДСТВО v1.2"],
  "DATA SHEET v1.2": ["FICHA TÉCNICA v1.2", "FICHA TÉCNICA v1.2", "仕様書 v1.2", "技术规格 v1.2", "डेटा शीट v1.2", "ТЕХПАСПОРТ v1.2"],
  "45 RPM (HI-SPEED)": ["45 RPM (ALTA VEL.)", "45 RPM (ALTA VEL.)", "45回転 (高速)", "45转 (高速)", "45 RPM (तेज़)", "45 ОБ/МИН (БЫСТРО)"],
  "16⅔ RPM (SLUDGE)": ["16⅔ RPM (LENTO)", "16⅔ RPM (LENTO)", "16⅔回転 (低速スラッジ)", "16⅔转 (慢速泥泞)", "16⅔ RPM (धीमा)", "16⅔ ОБ/МИН (МЕДЛЕННО)"],
  "Forging Vinyl Artwork...": ["Forjando Arte en Vinilo...", "Criando Arte em Vinil...", "ジャケットを描画中...", "正在锻造黑胶艺术图...", "विनाइल आर्टवर्क बन रहा है...", "Создание обложки..."],
  "Pressing Vinyl...": ["Prensando Vinilo...", "Prensando Vinil...", "レコードをプレス中...", "正在压制黑胶...", "विनाइल प्रेस हो रहा है...", "Прессовка винила..."],
  "Processing Custom Photo...": ["Procesando Foto...", "Processando Foto...", "カスタム写真を現像中...", "正在处理自定义照片...", "फ़ोटो प्रोसेस हो रही है...", "Обработка фото..."],
  "Install Y.D.R.B.N. Now (Android)": ["Instalar Y.D.R.B.N. Ahora (Android)", "Instalar Y.D.R.B.N. Agora (Android)", "今すぐインストール (Android)", "立即安装 Y.D.R.B.N. (Android)", "Y.D.R.B.N. अभी इंस्टॉल करें (Android)", "Установить Y.D.R.B.N. (Android)"],
  "Install Y.D.R.B.N. Now (Desktop)": ["Instalar Y.D.R.B.N. Ahora (PC)", "Instalar Y.D.R.B.N. Agora (Desktop)", "今すぐインストール (PC)", "立即安装 Y.D.R.B.N. (桌面)", "Y.D.R.B.N. अभी इंस्टॉल करें (डेस्कटॉप)", "Установить Y.D.R.B.N. (ПК)"],
  "Desktop Browser (Chrome / Edge):": ["Navegador de Escritorio (Chrome / Edge):", "Navegador Desktop (Chrome / Edge):", "PCブラウザ (Chrome / Edge):", "桌面浏览器 (Chrome / Edge):", "डेस्कटॉप ब्राउज़र (Chrome / Edge):", "Браузер на ПК (Chrome / Edge):"],
  "Walkthrough // Functionality Guide": ["Demostración // Guía de Funciones", "Demonstração // Guia de Funções", "ウォークスルー // 機能ガイド", "功能演示 // 操作指南", "वॉकथ्रू // फ़ंक्शन गाइड", "Видеообзор // Руководство"],
  "⚡ NEW UPDATE READY — TAP TO RELOAD": ["⚡ NUEVA ACTUALIZACIÓN LISTA — TOCA PARA RECARGAR", "⚡ NOVA ATUALIZAÇÃO PRONTA — TOQUE PARA RECARREGAR", "⚡ 最新アップデート準備完了 — タップして再読み込み", "⚡ 新版本已就绪 — 点击重新加载", "⚡ नया अपडेट तैयार — रीलोड करने के लिए टैप करें", "⚡ ОБНОВЛЕНИЕ ГОТОВО — НАЖМИТЕ ДЛЯ ПЕРЕЗАГРУЗКИ"],
  "Inspection Error": ["Error de Inspección", "Erro de Inspeção", "検査エラー", "检验错误", "निरीक्षण त्रुटि", "Ошибка Проверки"],
  "e.g. '1970s Municipal Pool', 'Disgruntled Botanists', 'Mid-Century Dental Equipment'...": ["ej. «Piscina Municipal de los 70», «Botánicos Descontentos»...", "ex. “Piscina Municipal dos Anos 70”, “Botânicos Descontentes”...", "例：「1970年代の市営プール」「不機嫌な植物学者」...", "例如：“1970年代市政泳池”、“不满的植物学家”...", "उदा. '1970 का स्विमिंग पूल', 'नाराज़ वनस्पतिशास्त्री'...", "напр., «Муниципальный бассейн 70-х», «Сердитые ботаники»..."],
  "e.g. Nouns: 'Spork', 'Microfiche'. Adjectives: 'Uncalibrated', 'Pre-Shrunk'...": ["ej. Sustantivos: «Cuchara», «Microficha». Adjetivos: «Descalibrado»...", "ex. Substantivos: “Colher”, “Microficha”. Adjetivos: “Descalibrado”...", "例：名詞「スポーク」「マイクロフィッシュ」、形容詞「未校正の」...", "例如：名词“叉勺”、“缩微胶片”；形容词“未校准的”...", "उदा. संज्ञा: 'चम्मच'; विशेषण: 'असंतुलित'...", "напр., Сущ.: «Ложка-вилка». Прил.: «Некалиброванный»..."],
  "e.g. A rotary telephone wearing a mustache, or a rubber stamp reading 'DENIED BY TODDLER'...": ["ej. Un teléfono de disco con bigote, o un sello que diga «DENEGADO»...", "ex. Um telefone de disco com bigode, ou um carimbo “NEGADO”...", "例：口ひげを生やした黒電話、「幼児により却下」のゴム印...", "例如：留着胡子的转盘电话，或写着“被幼儿驳回”的印章...", "उदा. मूंछों वाला पुराना टेलीफोन, या रबर स्टैम्प...", "напр., Дисковый телефон с усами или штамп «ОТКЛОНЕНО»..."],
  "Describe the unexpected glitch, visual overlap, or audio behavior...": ["Describe el fallo inesperado, solapamiento visual o comportamiento de audio...", "Descreva o erro inesperado, sobreposição visual ou comportamento de áudio...", "予期しない不具合、表示の重なり、音声の挙動などを記入してください...", "请描述遇到的异常错误、文字重叠或音频问题...", "अप्रत्याशित गड़बड़ी, दृश्य ओवरलैप या ऑडियो समस्या का वर्णन करें...", "Опишите неожиданную ошибку, наложение текста или проблему со звуком..."],
  // --- SubHeader & Sleeve Badges ---
  "Today's Selection": ["Selección de Hoy", "Seleção de Hoje", "本日のセレクション", "今日精选", "आज का चयन", "Выбор Дня"],
  "Ready for your daily drop": ["Listo para tu disco del día", "Pronto para o disco do dia", "本日のドロップ準備完了", "准备好迎接今日唱片", "आज के ड्रॉप के लिए तैयार", "Готов к выпуску дня"],
  "Zoom": ["Zoom", "Zoom", "拡大", "放大", "ज़ूम", "Зум"],
  "↺ Flip": ["↺ Voltear", "↺ Virar", "↺ 裏返す", "↺ 翻转", "↺ पलटें", "↺ Оборот"],
  "Read ↗": ["Leer ↗", "Ler ↗", "読む ↗", "阅读 ↗", "पढ़ें ↗", "Читать ↗"],
  "Program Tracklist (Tap Track To Spin)": ["Lista de Pistas (Toca para Girar)", "Faixas (Toque para Tocar)", "収録曲リスト (タップで再生)", "曲目列表 (点击曲目播放)", "ट्रैकलिस्ट (चलाने के लिए टैप करें)", "Треклист (Нажмите для прослушивания)"],
  "Program Tracklist": ["Lista de Pistas", "Lista de Faixas", "収録曲リスト", "曲目列表", "ट्रैकलिस्ट", "Треклист"],
  "Archival Liner Notes": ["Notas de Archivo del Álbum", "Notas de Capa de Arquivo", "アーカイブ・ライナーノーツ", "档案专辑内页说明", "पुरालेख लाइनर नोट्स", "Архивные Заметки на Обложке"],
  "Critical Reception": ["Recepción de la Crítica", "Recepção da Crítica", "批評家の反応", "乐评反响", "आलोचकों की प्रतिक्रिया", "Отзывы Критиков"],
  "Band Biography & Recording Lore": ["Biografía y Lore de Grabación", "Biografia e História da Gravação", "バンド略歴・録音秘話", "乐队传记与录音轶事", "बैंड की जीवनी और रिकॉर्डिंग कहानी", "Биография Группы и История Записи"],
  "Close Notes": ["Cerrar Notas", "Fechar Notas", "ノーツを閉じる", "关闭说明", "नोट्स बंद करें", "Закрыть Заметки"],
  "Master Tape Ready": ["Cinta Maestra Lista", "Fita Mestra Pronta", "マスターテープ準備完了", "母带准备就绪", "मास्टर टेप तैयार", "Мастер-лента Готова"],
  "Rendering Visual Gag on Canvas...": ["Renderizando Arte en Lienzo...", "Renderizando Arte no Canvas...", "キャンバスにアートを描画中...", "正在画布上渲染视觉艺术...", "कैनवास पर कला बनाई जा रही है...", "Рендеринг обложки на холсте..."],

  // --- Custom Photo & Customize Drawer ---
  "Active Record": ["Disco Activo", "Disco Ativo", "現在のレコード", "当前唱片", "सक्रिय रिकॉर्ड", "Текущий Диск"],
  "PHOTO STAGED": ["FOTO LISTA", "FOTO PRONTA", "写真選択済", "照片已就绪", "फ़ोटो तैयार", "ФОТО ГОТОВО"],
  "Select a photo to retouch the active sleeve:": ["Selecciona una foto para retocar la portada:", "Selecione uma foto para retocar a capa:", "写真を選択してジャケットを加工:", "选择照片以修饰当前封套:", "वर्तमान कवर को सजाने के लिए फ़ोटो चुनें:", "Выберите фото для ретуши обложки:"],
  "Click Darkroom Filter repeatedly to cycle styles:": ["Pulsa Filtro de Cuarto Oscuro para alternar estilos:", "Clique em Filtro de Câmara Escura para alternar estilos:", "暗室フィルターを連打してスタイル切替:", "重复点击暗房滤镜以切换风格:", "शैली बदलने के लिए डार्करूम फ़िल्टर बार-बार दबाएँ:", "Нажимайте «Фотофильтр» для смены стилей ретуши:"],
  "Select Photo": ["Elegir Foto", "Escolher Foto", "写真を選択", "选择照片", "फ़ोटो चुनें", "Выбрать Фото"],
  "Change": ["Cambiar", "Trocar", "変更", "更换", "बदलें", "Изменить"],
  "Remove": ["Quitar", "Remover", "削除", "移除", "हटाएँ", "Удалить"],
  "Darkroom Filter": ["Filtro Cuarto Oscuro", "Filtro Câmara Escura", "暗室フィルター", "暗房滤镜", "डार्करूम फ़िल्टर", "Фотофильтр"],
  "Use Photo (As-Is)": ["Usar Foto (Original)", "Usar Foto (Original)", "そのまま使用", "使用原图", "मूल फ़ोटो लगाएँ", "Без Фильтра"],

  // --- Archive Drawer (including split JSX text fragments) ---
  "Vinyl Crate Archive": ["Archivo de Cajas de Vinilo", "Arquivo de Discos de Vinil", "レコードクレート保管庫", "黑胶唱片箱档案库", "विनाइल क्रेट पुरालेख", "Архив Винилового Ящика"],
  "Crate Slots:": ["Espacios:", "Vagas na Caixa:", "保管スロット:", "唱片槽位:", "क्रेट स्लॉट:", "Ячейки ящика:"],
  "(Full)": ["(Lleno)", "(Cheio)", "(満杯)", "(已满)", "(भरा हुआ)", "(Полон)"],
  "Auto-Spin": ["Auto-Giro", "Auto-Tocar", "自動再生", "自动连播", "ऑटो-स्पिन", "Авто-Радио"],
  "Radio ON": ["Radio ACTIVA", "Rádio LIGADA", "ラジオ再生中", "电台开启", "रेडियो चालू", "Радио ВКЛ"],
  "All Records (": ["Todos (", "Todos (", "全レコード (", "全部唱片 (", "सभी रिकॉर्ड (", "Все диски ("],
  "Favorites (": ["Favoritos (", "Favoritos (", "お気に入り (", "收藏 (", "पसंदीदा (", "Избранное ("],
  "Crate full (all 14 hearted) — oldest pressing rotates out on next drop.": ["Caja llena (14/14 favoritos) — el disco más antiguo saldrá en el próximo lanzamiento.", "Caixa cheia (14/14 favoritos) — o disco mais antigo sairá no próximo lançamento.", "クレート満杯 (全14枚お気に入り) — 次回ドロップ時に最古の盤が入れ替わります。", "唱片箱已满（全部14张已收藏）— 下次掉落时最早的唱片将被替换。", "क्रेट भरा है (सभी 14 पसंदीदा) — अगले ड्रॉप पर सबसे पुराना रिकॉर्ड बाहर हो जाएगा।", "Ящик полон (все 14 в избранном) — старейший диск выбывает при следующем выпуске."],
  "Crate full (14/14) — oldest un-hearted record rotates out on next drop.": ["Caja llena (14/14) — el disco más antiguo sin corazón saldrá en el próximo lanzamiento.", "Caixa cheia (14/14) — o disco mais antigo não favoritado sairá no próximo lançamento.", "クレート満杯 (14/14) — 次回ドロップ時にお気に入り以外の最古盤が入れ替わります。", "唱片箱已满 (14/14) — 下次掉落时最早的未收藏唱片将被替换。", "क्रेट भरा है (14/14) — अगले ड्रॉप पर सबसे पुराना गैर-पसंदीदा रिकॉर्ड बाहर हो जाएगा।", "Ящик полон (14/14) — старейший неотмеченный диск выбывает при следующем выпуске."],
  "Search band, title, catalog...": ["Buscar banda, título, catálogo...", "Buscar banda, título, catálogo...", "バンド名・タイトル・型番を検索...", "搜索乐队、专辑、编号...", "बैंड, शीर्षक, कैटलॉग खोजें...", "Поиск группы, альбома, каталога..."],
  "No records found in this crate.": ["No se encontraron discos en esta caja.", "Nenhum disco encontrado nesta caixa.", "このクレートにレコードがありません。", "此唱片箱中未找到唱片。", "इस क्रेट में कोई रिकॉर्ड नहीं मिला।", "В этом ящике пластинок не найдено."],
  "View all records": ["Ver todos los discos", "Ver todos os discos", "すべてのレコードを表示", "查看所有唱片", "सभी रिकॉर्ड देखें", "Показать все диски"],

  // --- Share Modal ---
  "Export & Share Pressing": ["Exportar y Compartir Disco", "Exportar e Compartilhar Disco", "レコードのエクスポートと共有", "导出与分享唱片", "रिकॉर्ड एक्सपोर्ट और शेयर करें", "Экспорт и Отправка Пластинки"],
  "Instant Pressing Clone (Link or DNA)": ["Clon Instantáneo (Enlace o ADN)", "Clone Instantâneo (Link ou DNA)", "レコード即時クローン (リンク / DNA)", "唱片一键克隆 (链接或DNA)", "इंस्टेंट रिकॉर्ड क्लोन (लिंक या DNA)", "Мгновенный Клон (Ссылка или ДНК)"],
  "Send a 1-tap web link to clone directly onto a friend's turntable, or copy the offline DNA string.": ["Envía un enlace web de 1 toque para clonar este disco en el plato de un amigo, o copia el código ADN sin conexión.", "Envie um link web de 1 toque para clonar direto na vitrola de um amigo, ou copie o código DNA offline.", "ワンタップで友人のターンテーブルに複製できるWebリンク、またはオフラインDNAコードをコピーします。", "发送一键网页链接直接克隆到朋友的唱机上，或复制离线DNA代码。", "दोस्त के टर्नटेबल पर सीधे क्लोन करने के लिए 1-टैप वेब लिंक भेजें, या ऑफ़लाइन DNA कोड कॉपी करें।", "Отправьте веб-ссылку для клонирования в 1 касание на вертушку друга или скопируйте офлайн ДНК-код."],
  "Copy Clone Link": ["Copiar Enlace Clon", "Copiar Link Clone", "クローンリンクをコピー", "复制克隆链接", "क्लोन लिंक कॉपी करें", "Копировать Ссылку"],
  "Link Copied!": ["¡Enlace Copiado!", "Link Copiado!", "リンクをコピーしました！", "链接已复制！", "लिंक कॉपी हो गया!", "Ссылка Скопирована!"],
  "Raw DNA": ["ADN Puro", "DNA Puro", "DNAコード", "原始DNA", "रॉ DNA", "ДНК-код"],
  "Copied": ["Copiado", "Copiado", "コピー済", "已复制", "कॉपी हुआ", "Скопировано"],
  "Sleeve Artwork": ["Arte de la Funda", "Arte da Capa", "ジャケット画像", "封套艺术图", "कवर आर्टवर्क", "Обложка Пластинки"],
  "Front Cover": ["Portada", "Capa Frontal", "フロントカバー", "正面封面", "मुख्य कवर", "Передняя Обложка"],
  "Back Liner": ["Contraportada", "Contracapa", "バックカバー", "背面内页", "पिछला कवर", "Задняя Обложка"],
  "Text & Metadata": ["Texto y Metadatos", "Texto e Metadados", "テキスト・メタデータ", "文本与元数据", "टेक्स्ट और मेटाडेटा", "Текст и Метаданные"],
  "Band, Title, Catalog & Condition": ["Banda, Título, Catálogo y Estado", "Banda, Título, Catálogo e Estado", "バンド名・タイトル・型番・状態", "乐队、专辑名、编号与品相", "बैंड, शीर्षक, कैटलॉग और स्थिति", "Группа, Альбом, Каталог и Состояние"],
  "Numbered Tracklist (1-8)": ["Lista de Pistas Numerada (1-8)", "Lista de Faixas Numerada (1-8)", "トラックリスト (1〜8)", "编号曲目列表 (1-8)", "क्रमांकित ट्रैकलिस्ट (1-8)", "Список Треков (1-8)"],
  "Archival Recording Notes (Bio)": ["Notas de Grabación (Biografía)", "Notas de Gravação (Biografia)", "録音アーカイブ記録 (略歴)", "档案录音笔记 (传记)", "रिकॉर्डिंग नोट्स (जीवनी)", "История Записи (Биография)"],
  "Satirical Critic Quotes": ["Citas Satíricas de Críticos", "Citações Satíricas da Crítica", "批評家の風刺レビュー", "讽刺乐评引述", "व्यंग्यात्मक समीक्षक उद्धरण", "Сатирические Рецензии"],
  "Preparing Artwork...": ["Preparando Arte...", "Preparando Arte...", "アートワーク準備中...", "正在准备图像...", "आर्टवर्क तैयार हो रहा है...", "Подготовка графики..."],
  "Launching Share...": ["Abriendo Compartir...", "Abrindo Compartilhamento...", "共有を起動中...", "正在启动分享...", "शेयर खुल रहा है...", "Открытие меню..."],
  "Share Selected Payload": ["Compartir Selección", "Compartilhar Seleção", "選択した内容を共有", "分享所选内容", "चुनी गई सामग्री शेयर करें", "Поделиться Выбранным"],
  "Copy Text": ["Copiar Texto", "Copiar Texto", "テキストをコピー", "复制文本", "टेक्स्ट कॉपी करें", "Копировать Текст"],
  "Save Images": ["Guardar Imágenes", "Salvar Imagens", "画像を保存", "保存图片", "इमेज सेव करें", "Сохранить Фото"],

  // --- Apparel Fabrication Terminal (including split Step 1 button fragments & disclaimer) ---
  "Apparel Fabrication Terminal": ["Terminal de Estampado Textil", "Terminal de Estamparia Têxtil", "アパレルプリント制作ターミナル", "服饰印花制作终端", "अपैरल प्रिंटिंग टर्मिनल", "Терминал Печати Мерча"],
  "300 DPI Print PNGs • Save Locally & Self-Upload": ["PNGs de 300 DPI • Guarda Localmente y Sube a la Tienda", "PNGs 300 DPI • Salve Localmente e Envie à Loja", "300 DPI印刷用PNG • 保存してプリント業者へアップロード", "300 DPI 印花 PNG • 本地保存并自行上传", "300 DPI प्रिंट PNG • सेव करें और स्वयं अपलोड करें", "PNG 300 DPI • Сохраните и загрузите на сайт печати"],
  "Front: Chest": ["Frente: Pecho", "Frente: Peito", "前面：チェスト", "正面：胸前", "सामने: चेस्ट", "Спереди: Грудь"],
  "Save Front": ["Guardar Frente", "Salvar Frente", "前面を保存", "保存正面", "फ्रंट सेव करें", "Сохр. перед"],
  "Back: Tour": ["Espalda: Gira", "Costas: Turnê", "背面：ツアー日程", "背面：巡演", "पीछे: टूर", "Сзади: Тур"],
  "Save Back": ["Guardar Espalda", "Salvar Costas", "背面を保存", "保存背面", "बैक सेव करें", "Сохр. спину"],
  "Rendering...": ["Renderizando...", "Renderizando...", "描画中...", "渲染中...", "तैयार हो रहा है...", "Рендеринг..."],
  "Back Disabled": ["Espalda Desactivada", "Costas Desativadas", "背面プリント無効", "背面已禁用", "बैक प्रिंट बंद", "Спина отключена"],
  "Front Print Format": ["Formato de Estampado Frontal", "Formato da Estampa Frontal", "前面プリント形式", "正面印花格式", "फ्रंट प्रिंट फ़ॉर्मेट", "Формат Переднего Принта"],
  "Isolated Cutout": ["Recorte Aislado (Sin Fondo)", "Recorte Isolado (Sem Fundo)", "背景透過カットアウト", "透明背景抠图", "पारदर्शी कटआउट", "Вырез без фона"],
  "Transparent alpha; fabric shows through (ideal for black shirts).": ["Fondo transparente; la tela se ve a través (ideal para camisetas negras).", "Fundo transparente; o tecido aparece (ideal para camisetas pretas).", "背景透過PNG（黒Tシャツ等の生地を活かすのに最適）。", "透明通道；透出T恤底色（最适合黑色T恤）。", "पारदर्शी पृष्ठभूमि; कपड़े का रंग दिखेगा (काले टी-शर्ट के लिए उत्तम)।", "Прозрачный фон; видна ткань (идеально для чёрных футболок)."],
  "Full Sleeve Plaque": ["Placa de Portada Completa", "Placa de Capa Completa", "フルジャケット・プレート", "完整封套方框", "पूरा एल्बम कवर प्लाक", "Полная Обложка 1:1"],
  "Exact 1:1 square sleeve cover from the main deck.": ["Portada cuadrada 1:1 idéntica a la del plato principal.", "Capa quadrada 1:1 idêntica à da vitrola principal.", "メインデッキと完全一致する1:1正方形ジャケット。", "与主唱机完全一致的 1:1 正方形封面。", "मुख्य डेक के समान सटीक 1:1 वर्गाकार कवर।", "Точная квадратная обложка 1:1 как на главной деке."],
  "Tour Schedule (Back Print)": ["Fechas de Gira (Espalda)", "Agenda da Turnê (Costas)", "ツアースケジュール (背面プリント)", "巡演日程 (背面印花)", "टूर शेड्यूल (बैक प्रिंट)", "Расписание Тура (Принт на спине)"],
  "Enabled": ["Activado", "Ativado", "有効", "已启用", "चालू", "Включено"],
  "Disabled": ["Desactivado", "Desativado", "無効", "已禁用", "बंद", "Отключено"],
  "Canonical '77 Circuit": ["Circuito Canónico '77", "Circuito Canônico '77", "1977年カノン・ツアー", "1977 经典巡演路线", "कैननिकल '77 सर्किट", "Канонический Тур '77"],
  "Twin Peaks, Bikini Bottom, Mordor...": ["Picos Gemelos, Fondo de Bikini, Mordor...", "Picos Gêmeos, Fenda do Biquíni, Mordor...", "ツイン・ピークス、ビキニタウン、モルドール...", "双峰镇、比奇堡、魔多...", "ट्विन पीक्स, बिकिनी बॉटम, मोर्डोर...", "Твин Пикс, Бикини Боттом, Мордор..."],
  "Municipal Lore Circuit": ["Circuito Municipal de Lore", "Circuito Municipal de Lore", "地方自治体ロア・サーキット", "市政传说巡演路线", "म्युनिसिपल लोर सर्किट", "Муниципальный Тур"],
  "Chrono-Orbital Circuit": ["Circuito Crono-Orbital", "Circuito Crono-Orbital", "クロノ軌道サーキット", "时空轨道巡演路线", "क्रोनो-ऑर्बिटल सर्किट", "Орбитальный Тур"],
  "Flumptown Annex, Zoning Board...": ["Anexo de Flumptown, Junta de Zonificación...", "Anexo de Flumptown, Conselho de Zoneamento...", "フランプタウン別館、区画整理委員会...", "弗兰普顿附楼、规划委员会...", "फ़्लम्पटाउन एनेक्स, ज़ोनिंग बोर्ड...", "Фламптаун, Комитет зонирования..."],
  "Luna, Mars, Orbital Cistern #4...": ["Luna, Marte, Cisterna Orbital #4...", "Lua, Marte, Cisterna Orbital #4...", "月面、火星、軌道貯水槽4号...", "月球、火星、4号轨道蓄水池...", "चंद्रमा, मंगल, ऑर्बिटल टैंक #4...", "Луна, Марс, Орбитальная цистерна №4..."],
  "Mixed Mashup Circuit (Randomized)": ["Circuito Combinado (Aleatorio)", "Circuito Misto (Aleatório)", "ミックス・マッシュアップ (ランダム)", "混合混搭巡演路线 (随机)", "मिक्स्ड मैशअप सर्किट (रैंडम)", "Смешанный Тур (Случайный)"],
  "Shuffles Canonical &": ["Combina paradas Canónicas y", "Mistura paradas Canônicas e", "カノン会場と", "按日期顺序随机混合经典与", "कैननिकल और", "Перемешивает канонические и"],
  "stops in chronological date order": ["en orden cronológico", "em ordem cronológica", "の会場を日付順にシャッフル", "演出站点", "स्थानों को तारीख के क्रम में मिलाता है", "площадки по датам"],
  "Municipal": ["Municipales", "Municipais", "地方自治体", "市政", "म्युनिसिपल", "муниципальные"],
  "Orbital/Municipal": ["Orbitales/Municipales", "Orbitais/Municipais", "軌道・地方", "轨道/市政", "ऑर्बिटल/म्युनिसिपल", "орбитальные"],
  "Reshuffle": ["Mezclar", "Reembaralhar", "再シャッフル", "重新洗牌", "फिर से मिलाएँ", "Перемешать"],
  "Mix": ["Mezclar", "Misturar", "ミックス", "混合", "मिक्स", "Микс"],
  "Custom Tour Stop (One-Off / Non-Persistent):": ["Parada Personalizada (Solo para esta exportación):", "Parada Personalizada (Apenas nesta exportação):", "カスタム公演地 (今回限り・非保存):", "自定义巡演站点 (仅限本次导出):", "कस्टम टूर स्टॉप (केवल इस एक्सपोर्ट के लिए):", "Свой Город Тура (Только для этого экспорта):"],
  "✓ Combined into": ["✓ Combinado en", "✓ Combinado em", "✓ 統合先:", "✓ 已合并至", "✓ इसमें जोड़ा गया:", "✓ Добавлено в"],
  "Mixed Mashup": ["Circuito Combinado", "Circuito Misto", "ミックス・マッシュアップ", "混合混搭路线", "मिक्स्ड मैशअप", "Смешанный Тур"],
  "1 Night": ["1 Noche", "1 Noite", "1夜", "1晚", "1 रात", "1 Ночь"],
  "2 Nights": ["2 Noches", "2 Noites", "2夜連続", "2晚", "2 रातें", "2 Ночи"],
  "Finale": ["Final", "Final", "千秋楽", "收官站", "फ़िनाले", "Финал"],
  "Clear": ["Borrar", "Limpar", "クリア", "清除", "साफ़ करें", "Сброс"],
  "e.g., Longview, WA or Budokan, JP (this export only)": ["ej., Madrid, ES o Budokan, JP (solo esta exportación)", "ex., São Paulo, BR ou Budokan, JP (só nesta exportação)", "例：日本武道館、Longview, WA (今回のみ)", "例如：上海, CN 或 日本武道馆 (仅本次导出)", "उदा., मुंबई, IN या टोक्यो (केवल इस बार)", "напр., Лонгвью, WA или Будокан (только сейчас)"],
  "Back Ink Pigment:": ["Tinta Trasera:", "Cor da Tinta Traseira:", "背面インク色:", "背面油墨颜色:", "बैक इंक रंग:", "Цвет чернил спины:"],
  "Crimson Red": ["Rojo Carmesí", "Vermelho Carmesim", "クリムゾンレッド", "深绯红", "क्रिमसन लाल", "Багрово-красный"],
  "Amber Gold": ["Oro Ámbar", "Ouro Âmbar", "アンバーゴールド", "琥珀金", "एम्बर गोल्ड", "Янтарное золото"],
  "Warm Eggshell": ["Blanco Hueso", "Branco Casca de Ovo", "エッグシェル(生成り)", "暖蛋壳白", "हल्का क्रीम", "Тёплый кремовый"],
  "Manual Upload Required (Images Do Not Auto-Fill)": ["Subida Manual Requerida (Las imágenes no se cargan solas)", "Upload Manual Necessário (Imagens não preenchem sozinhas)", "手動アップロードが必要です (画像は自動入力されません)", "需手动上传图片 (不会自动填入商店页面)", "मैनुअल अपलोड आवश्यक है (इमेज अपने आप नहीं भरती)", "Требуется Ручная Загрузка (Файлы не вставляются сами)"],
  "Notice: No Affiliation With Vendors": ["Aviso: Sin Afiliación con Tiendas Externas", "Aviso: Sem Afiliação com Fornecedores", "免責事項：外部プリント業者との提携はありません", "声明：与外部印制商无任何关联", "सूचना: विक्रेताओं के साथ कोई संबद्धता नहीं", "Уведомление: Нет связи с магазинами мерча"],
  "Once you are redirected to the vendor's site, you are on your own! All sizing and color choices happen independently, as Y.D.R.B.N. has no commercial ties and assumes zero liability for clothing items, orders, or deliveries. Y.D.R.B.N. does not recommend any particular vendors, these were just handy options. DO NOT FOLD, SPINDLE, OR MUTILATE Y.D.R.B.N.": [
    "¡Una vez redirigido al sitio del proveedor, estás por tu cuenta! Todas las tallas y colores se eligen de forma independiente; Y.D.R.B.N. no tiene vínculos comerciales ni asume responsabilidad alguna por prendas, pedidos o envíos. NO DOBLE, PERFORE NI MUTILE A Y.D.R.B.N.",
    "Ao ser redirecionado para o site do fornecedor, você está por sua conta! Tamanhos e cores são escolhidos de forma independente; o Y.D.R.B.N. não possui vínculos comerciais e não assume responsabilidade por peças, pedidos ou entregas. NÃO DOBRE, PERFURE OU MUTILE O Y.D.R.B.N.",
    "外部サイトへ移動した後は各自での操作となります。サイズや色の選択はすべて独立しており、Y.D.R.B.N.は業者との商業的提携はなく、衣類・注文・配送に関して一切の責任を負いません。Y.D.R.B.N.を折り曲げたり損傷しないでください。",
    "跳转到外部印制商网站后由您自行操作！所有尺码与颜色选择均独立进行，Y.D.R.B.N. 与任何商家无商业关联，对衣物、订单或配送不承担任何责任。请勿折叠、穿孔或损毁 Y.D.R.B.N.。",
    "विक्रेता की साइट पर जाने के बाद, सभी आकार और रंग के चुनाव स्वतंत्र रूप से होते हैं। Y.D.R.B.N. का किसी भी विक्रेता से कोई व्यावसायिक संबंध नहीं है और वह कपड़ों, ऑर्डर या डिलीवरी के लिए कोई ज़िम्मेदारी नहीं लेता है।",
    "После перехода на сайт магазина вы действуете самостоятельно! Выбор размеров и цветов происходит независимо: Y.D.R.B.N. не имеет коммерческих связей и не несёт ответственности за заказы или доставку. НЕ СГИБАТЬ И НЕ ПОВРЕЖДАТЬ Y.D.R.B.N."
  ],
  "Step 1: Save 300 DPI": ["Paso 1: Guardar 300 DPI", "Passo 1: Salvar 300 DPI", "手順1：300 DPI", "第1步：保存 300 DPI", "चरण 1: 300 DPI", "Шаг 1: Сохранить 300 DPI"],
  "Front & Back PNGs": ["(PNGs Frontal y Trasero)", "(PNGs Frente e Costas)", "前面＆背面PNGを保存", "正背面 PNG", "फ्रंट और बैक PNG सेव करें", "PNG переда и спины"],
  "Front PNG": ["(PNG Frontal)", "(PNG Frontal)", "前面PNGを保存", "正面 PNG", "फ्रंट PNG सेव करें", "PNG переда"],
  "✓ Saved to Downloads (Tap to Save": ["✓ Guardado en Descargas (Toca para guardar", "✓ Salvo em Downloads (Toque para salvar", "✓ 保存完了 (タップで", "✓ 已保存至下载 (点击重新保存", "✓ डाउनलोड में सेव हुआ (फिर से", "✓ Сохранено в Загрузки (Нажмите для"],
  "Both": ["ambos", "ambos", "両方", "两张", "दोनों", "обоих"],
  "Again)": ["de nuevo)", "novamente)", "再保存)", "图片)", "सेव करें)", "повтора)"],
  "Step 2: Open Blank Shirt Designer (Upload Your Saved PNGs There)": ["Paso 2: Abrir Diseñador de Camisetas (Sube allí tus PNGs)", "Passo 2: Abrir Criador de Camisetas (Envie seus PNGs lá)", "手順2：Tシャツ作成サイトを開く (保存したPNGをアップロード)", "第2步：打开空白T恤设计器 (在那里上传保存的PNG)", "चरण 2: टी-शर्ट डिज़ाइनर खोलें (वहाँ अपनी सेव की गई PNG अपलोड करें)", "Шаг 2: Открыть конструктор футболок (Загрузите PNG туда)"],
  "Back Tour Roster": ["Fechas de Gira (Espalda)", "Agenda da Turnê (Costas)", "背面ツアー日程プレビュー", "背面巡演日程表", "बैक टूर शेड्यूल", "Расписание Тура (Спина)"],
  "Drag to pan • Use presets (100%–250%) or +/- above to adjust scale": ["Arrastra para mover • Usa 100%–250% o +/- arriba para ajustar", "Arraste para mover • Use 100%–250% ou +/- acima para ajustar", "ドラッグで移動 • 上部の100%〜250%または+/-で倍率調整", "拖动平移 • 使用上方 100%–250% 或 +/- 调整缩放", "घुमाने के लिए खींचें • ज़ूम बदलने के लिए ऊपर 100%–250% या +/- दबाएँ", "Тяните для панорамы • Используйте 100%–250% или +/- сверху"],
  "Tap preset (150%, 200%, 250%) or + to inspect tour stops": ["Toca 150%, 200%, 250% o + para ampliar las paradas de la gira", "Toque em 150%, 200%, 250% ou + para ampliar as paradas da turnê", "150%・200%・250% または + をタップしてツアー日程を拡大", "点击 150%、200%、250% 或 + 放大查看巡演站点", "टूर स्टॉप को ज़ूम करने के लिए 150%, 200%, 250% या + दबाएँ", "Нажмите 150%, 200%, 250% или + для увеличения дат тура"],

  // --- Custom Drop Studio ---
  "Custom Drop Studio": ["Estudio de Disco Personalizado", "Estúdio de Disco Personalizado", "カスタム・レコード制作スタジオ", "自定义唱片工作室", "कस्टम ड्रॉप स्टूडियो", "Студия Своего Выпуска"],
  "Clone from Pressing DNA Code": ["Clonar desde Código ADN", "Clonar a partir de Código DNA", "DNAコードからレコードを復元", "从唱片DNA代码克隆", "प्रेसिंग DNA कोड से क्लोन करें", "Клонировать из ДНК-кода"],
  "Paste YDRBN-DNA:... string here": ["Pega el código YDRBN-DNA:... aquí", "Cole o código YDRBN-DNA:... aqui", "YDRBN-DNA:... コードを貼り付け", "在此粘贴 YDRBN-DNA:... 代码", "यहाँ YDRBN-DNA:... कोड पेस्ट करें", "Вставьте код YDRBN-DNA:... сюда"],
  "Clone": ["Clonar", "Clonar", "復元", "克隆", "क्लोन", "Клон"],
  "Band / Artist Name": ["Nombre de la Banda / Artista", "Nome da Banda / Artista", "バンド名 / アーティスト名", "乐队 / 艺人名称", "बैंड / कलाकार का नाम", "Название Группы / Артиста"],
  "e.g., Unreasonable Elbow (or leave blank)": ["ej., Codo Irrazonable (o déjalo en blanco)", "ex., Cotovelo Irrazoável (ou deixe em branco)", "例：不合理な肘 (空欄で自動生成)", "例如：不合理的手肘 (留空则自动生成)", "उदा., अतार्किक कोहनी (या खाली छोड़ें)", "напр., Необоснованный Локоть (или пусто)"],
  "Album Title": ["Título del Álbum", "Título do Álbum", "アルバムタイトル", "专辑名称", "एल्बम का शीर्षक", "Название Альбома"],
  "e.g., Plastic Spoons": ["ej., Cucharas de Plástico", "ex., Colheres de Plástico", "例：プラスチックスプーン", "例如：塑料勺", "उदा., प्लास्टिक के चम्मच", "напр., Пластиковые Ложки"],
  "Pressing Year": ["Año de Edición", "Ano de Prensagem", "プレス年", "发行年份", "प्रेसिंग वर्ष", "Год Выпуска"],
  "e.g., 1978": ["ej., 1978", "ex., 1978", "例：1978", "例如：1978", "उदा., 1978", "напр., 1978"],
  "Audio Soundscape Flavor": ["Estilo de Sonido del Sintetizador", "Estilo Sonoro do Sintetizador", "オーディオ・サウンドスケープ", "音频合成器风格", "ऑडियो साउंडस्केप शैली", "Звуковой Стиль Синтезатора"],
  "1980s Analog Synth & Arpeggio": ["Sintetizador Analógico y Arpegio de los 80", "Sintetizador Analógico e Arpejo dos Anos 80", "1980年代アナログシンセ＆アルペジオ", "1980年代模拟合成器与琶音", "1980 के दशक का एनालॉग सिंथ और आर्पेगियो", "Аналоговый синт и арпеджио 1980-х"],
  "1970s Psychedelic Rock & Phasers": ["Rock Psicodélico y Phasers de los 70", "Rock Psicodélico e Phasers dos Anos 70", "1970年代サイケデリックロック＆フェイザー", "1970年代迷幻摇滚与移相器", "1970 के दशक का साइकेडेलिक रॉक", "Психоделик-рок и фейзеры 1970-х"],
  "1970s Krautrock & Motorik Beat": ["Krautrock y Ritmo Motorik de los 70", "Krautrock e Batida Motorik dos Anos 70", "1970年代クラウトロック＆モートリックビート", "1970年代泡菜摇滚与机械节拍", "1970 के दशक का क्राउटरॉक बीट", "Краутрок и моторик-бит 1970-х"],
  "1980s Angular Post-Punk Riff": ["Riff Post-Punk Angular de los 80", "Riff Pós-Punk Angular dos Anos 80", "1980年代ポストパンク・リフ", "1980年代棱角后朋克段子", "1980 के दशक का पोस्ट-पंक रिफ़", "Угловатый пост-панк рифф 1980-х"],
  "Deep Atmospheric Tape Drone": ["Drone Atmosférico de Cinta Profunda", "Drone Atmosférico de Fita", "ディープ・アンビエント・テープドローン", "深邃氛围磁带长音", "गहरा एम्बिएंट टेप ड्रोन", "Глубокий атмосферный ленточный дрон"],
  "Custom Photo Cover (Optional — Syncs with Deck)": ["Foto de Portada (Opcional — Sincroniza con el Plato)", "Foto da Capa (Opcional — Sincroniza com a Vitrola)", "カスタム表紙写真 (任意・メイン画面と連動)", "自定义封面照片 (可选 — 与主唱机同步)", "कस्टम कवर फ़ोटो (वैकल्पिक — डेक के साथ सिंक)", "Фото Обложки (Опционально — Синхр. с декой)"],
  "No cover photo staged": ["Ninguna foto seleccionada", "Nenhuma foto selecionada", "写真未選択", "未选择封面照片", "कोई कवर फ़ोटो नहीं चुनी गई", "Фото обложки не выбрано"],
  "Photo staged": ["Foto lista", "Foto pronta", "写真選択済", "照片已就绪", "फ़ोटो तैयार", "Фото выбрано"],
  "(Cutout alpha)": ["(Recorte sin fondo)", "(Recorte sem fundo)", "(透過PNG)", "(透明抠图)", "(पारदर्शी)", "(Без фона)"],
  "Tracklist (One track per line)": ["Lista de Pistas (Una por línea)", "Lista de Faixas (Uma por linha)", "トラックリスト (1行に1曲)", "曲目列表 (每行一首)", "ट्रैकलिस्ट (प्रति पंक्ति एक गाना)", "Треклист (По одному треку на строку)"],
  "Liner Notes / Band Bio": ["Notas del Álbum / Biografía", "Notas de Capa / Biografia", "ライナーノーツ / バンド略歴", "内页说明 / 乐队传记", "लाइनर नोट्स / बैंड जीवनी", "Заметки / Биография Группы"],
  "Recorded in an abandoned cinema using surplus telephone wire...": ["Grabado en un cine abandonado usando cable telefónico excedente...", "Gravado em um cinema abandonado usando fio telefônico excedente...", "廃映画館で余剰電話線を使って録音...", "在废弃电影院使用剩余电话线录制...", "एक पुराने सिनेमाघर में टेलीफोन के तारों से रिकॉर्ड किया गया...", "Записано в заброшенном кинотеатре на телефонный провод..."],
  "Faux Review / Critical Quote": ["Reseña Satírica / Cita Crítica", "Resenha Satírica / Citação Crítica", "架空の批評レビュー", "戏仿乐评 / 评论引述", "समीक्षा / आलोचक उद्धरण", "Рецензия / Цитата Критика"],
  "An acoustic triumph that defies all conventional protocol.": ["Un triunfo acústico que desafía todo protocolo convencional.", "Um triunfo acústico que desafia todos os protocolos convencionais.", "従来のプロトコルを覆す音響的勝利。", "一场无视一切常规协议的声学胜利。", "एक ध्वनिक विजय जो सभी पारंपरिक नियमों को चुनौती देती है।", "Акустический триумф, бросающий вызов всем протоколам."],
  "Add new words & artwork into generator rotation": ["Añadir palabras y arte nuevos a la rotación del generador", "Adicionar novas palavras e arte à rotação do gerador", "新しい単語と画像をジェネレーターのローテーションに追加", "将新词汇和图片加入生成器轮换池", "नए शब्दों और कला को जनरेटर रोटेशन में जोड़ें", "Добавить новые слова и арт в ротацию генератора"],
  "Saves novel words and uploaded art into your local “Custom Drop Additions” crate, automatically ignoring words already in the app or active expansion packs.": [
    "Guarda palabras nuevas y arte subido en tu caja local «Adiciones Personalizadas», ignorando automáticamente las palabras que ya existen.",
    "Salva palavras novas e arte enviada na sua caixa local “Adições Personalizadas”, ignorando automaticamente palavras já existentes.",
    "未登録の単語やアップロード画像をローカルの「Custom Drop Additions」クレートに保存します（既存の単語は自動的に除外されます）。",
    "将新词汇和上传图片保存到本地“Custom Drop Additions”扩展箱中，自动忽略已在词库中的重复词。",
    "नए शब्दों और अपलोड की गई कला को आपके लोकल क्रेट में सेव करता है, और पहले से मौजूद शब्दों को अपने आप छोड़ देता है।",
    "Сохраняет новые слова и обложки в локальный ящик «Custom Drop Additions», автоматически пропуская уже имеющиеся слова."
  ],
  "Novel Words Detected (": ["Palabras Nuevas Detectadas (", "Palavras Novas Detectadas (", "検出された新出単語 (", "检测到新词汇 (", "नए शब्द मिले (", "Найдено новых слов ("],
  "existing skipped": ["existentes omitidas", "existentes ignoradas", "件の既存語を除外", "个已有词已跳过", "मौजूदा शब्द छोड़े गए", "существующих пропущено"],
  "Type a custom band name, title, or tracks above to extract novel words.": ["Escribe arriba un nombre de banda, título o pistas para extraer palabras nuevas.", "Digite acima um nome de banda, título ou faixas para extrair palavras novas.", "上の欄にバンド名・タイトル・曲名を入力すると新出単語を抽出します。", "在上方输入自定义乐队名、专辑名或曲目以提取新词汇。", "नए शब्द निकालने के लिए ऊपर बैंड का नाम, शीर्षक या ट्रैक लिखें।", "Введите название группы, альбома или треки выше для извлечения новых слов."],
  "Rotate Uploaded Image As:": ["Usar Imagen Subida Como:", "Usar Imagem Enviada Como:", "アップロード画像の用途:", "将上传图片轮换为:", "अपलोड की गई इमेज का उपयोग:", "Использовать фото в ротации как:"],
  "Backdrop": ["Fondo", "Plano de Fundo", "背景", "背景图", "बैकड्रॉप", "Фон"],
  "Subject Stamp": ["Sello Central", "Estampa Central", "被写体スタンプ", "主体贴图", "सब्जेक्ट स्टैम्प", "Предмет"],
  "Skip Image": ["Omitir Imagen", "Ignorar Imagem", "画像をスキップ", "跳过图片", "इमेज छोड़ें", "Пропустить"],
  "Create Custom Drop": ["Crear Disco Personalizado", "Criar Disco Personalizado", "カスタムレコードをプレス", "压制自定义唱片", "कस्टम ड्रॉप बनाएँ", "Создать Пластинку"],
  "Pressing Custom Drop...": ["Prensando Disco Personalizado...", "Prensando Disco Personalizado...", "カスタム盤をプレス中...", "正在压制自定义唱片...", "कस्टम ड्रॉप प्रेस हो रहा है...", "Прессовка пластинки..."],

  // --- Sleeve Zoom Modal ---
  "Front View": ["Vista Frontal", "Vista Frontal", "表面表示", "正面视图", "सामने का दृश्य", "Спереди"],
  "Back Notes": ["Notas Traseras", "Notas de Costas", "裏面ノーツ", "背面内页", "पीछे के नोट्स", "Оборот"],
  "Drag to pan • Use Front View / Back Notes button above to flip": ["Arrastra para mover • Usa el botón superior para voltear", "Arraste para mover • Use o botão acima para virar", "ドラッグで移動 • 上部ボタンで表裏切替", "拖动平移 • 使用上方按钮翻转正背面", "घुमाने के लिए खींचें • पलटने के लिए ऊपर का बटन दबाएँ", "Тяните для панорамы • Кнопка сверху переворачивает конверт"],
  "Tap preset (150%, 200%) or +/- to inspect artwork and liner notes": ["Toca 150%, 200% o +/- para inspeccionar el arte y las notas", "Toque em 150%, 200% ou +/- para ampliar a arte e as notas", "150%・200% または +/- でジャケットとノーツを拡大", "点击 150%、200% 或 +/- 放大查看封面与内页", "कवर और नोट्स को ज़ूम करने के लिए 150%, 200% या +/- दबाएँ", "Нажмите 150%, 200% или +/- для увеличения обложки и текста"],

  // --- Operator's Guide & Data Sheet (HelpModal) & InstallModal ---
  "Operator's Guide & Data Sheet": ["Guía del Operador y Ficha Técnica", "Guia do Operador e Ficha Técnica", "操作ガイド＆データシート", "操作指南与技术手册", "ऑपरेटर गाइड और डेटा शीट", "Руководство и Техпаспорт"],
  "Field Guide": ["Guía de Uso", "Guia de Uso", "操作ガイド", "操作指南", "फ़ील्ड गाइड", "Руководство"],
  "Data Sheet & Credits": ["Ficha Técnica y Créditos", "Ficha Técnica e Créditos", "仕様＆クレジット", "技术规格与致谢", "डेटा शीट और क्रेडिट", "Спецификации"],
  "Welcome to Y.D.R.B.N.": ["Bienvenido a Y.D.R.B.N.", "Bem-vindo ao Y.D.R.B.N.", "Y.D.R.B.N. へようこそ", "欢迎使用 Y.D.R.B.N.", "Y.D.R.B.N. में आपका स्वागत है", "Добро пожаловать в Y.D.R.B.N."],
  "Your Daily Random Band Name is a 100% offline-capable band name, vinyl sleeve, and synth audio generator. When online, you can optionally check Settings for new app builds or Cargo Bay content packs.": [
    "Your Daily Random Band Name es un generador de bandas, portadas de vinilo y audio sintetizado 100% sin conexión. Cuando estés en línea, puedes revisar Ajustes opcionalmente para buscar actualizaciones o paquetes de contenido.",
    "Your Daily Random Band Name é um gerador de bandas, capas de vinil e áudio sintetizado 100% offline. Quando estiver online, você pode verificar as Configurações opcionalmente para buscar atualizações ou pacotes.",
    "Y.D.R.B.N. は100%オフラインで動作する架空バンド名・レコードジャケット・シンセ音源ジェネレーターです。オンライン時は設定画面からアプリの更新や拡張パックを確認できます。",
    "Y.D.R.B.N. 是一款 100% 离线运行的随机乐队名、黑胶封套与合成器音频生成器。联网时，您可选择在“设置”中检查应用更新或货舱扩展包。",
    "Y.D.R.B.N. एक 100% ऑफ़लाइन बैंड नाम, विनाइल कवर और सिंथ ऑडियो जनरेटर है। ऑनलाइन होने पर आप सेटिंग्स में जाकर नए अपडेट या कंटेंट पैक की जांच कर सकते हैं।",
    "Y.D.R.B.N. — это 100% автономный генератор групп, виниловых обложек и синтезаторного звука. При наличии сети в Настройках можно проверять обновления и пакеты контента."
  ],
  "Watch Functionality Walkthrough": ["Ver Video de Demostración", "Assistir Vídeo de Demonstração", "機能ウォークスルー動画を見る", "观看功能演示视频", "फ़ंक्शन वॉकथ्रू वीडियो देखें", "Смотреть Видеообзор Функций"],
  "Top Bar Faceplate Key": ["Clave del Panel Superior", "Chave do Painel Superior", "上部パネル操作キー", "顶部面板按钮说明", "टॉप बार कंट्रोल कुंजी", "Клавиши Верхней Панели"],
  "Tap to Open": ["Toca para Abrir", "Toque para Abrir", "タップで開く", "点击打开", "खोलने के लिए टैप करें", "Нажмите для открытия"],
  "Archive:": ["Archivo:", "Arquivo:", "保管庫:", "唱片箱:", "पुरालेख:", "Архив:"],
  "14-slot record crate & Auto-Spin radio": ["Caja de 14 discos y radio Auto-Giro", "Caixa de 14 discos e rádio Auto-Tocar", "14枚収納クレート＆自動再生ラジオ", "14槽唱片箱与自动连播电台", "14-स्लॉट रिकॉर्ड क्रेट और ऑटो-स्पिन रेडियो", "Ящик на 14 дисков и Авто-Радио"],
  "Install:": ["Instalar:", "Instalar:", "設置:", "安装:", "इंस्टॉल:", "Установка:"],
  "Mount app to home screen for offline use": ["Instala la app en tu pantalla para uso sin conexión", "Instale na tela inicial para uso offline", "ホーム画面に追加してオフライン起動", "安装到主屏幕以便离线使用", "ऑफ़लाइन उपयोग के लिए होम स्क्रीन पर जोड़ें", "Добавить на экран для офлайн-работы"],
  "Today:": ["Hoy:", "Hoje:", "今日:", "今日:", "आज:", "Сегодня:"],
  "Jump straight to your latest pressing": ["Salta directamente a tu último disco", "Pule direto para o disco mais recente", "最新のレコードへすぐ移動", "直接跳转到最新压制的唱片", "सीधे अपने नवीनतम रिकॉर्ड पर जाएँ", "Перейти к последней пластинке"],
  "Favorite:": ["Favorito:", "Favorito:", "お気に入り:", "收藏:", "पसंदीदा:", "Избранное:"],
  "Protect a pressing from crate rotation": ["Protege un disco de la rotación de la caja", "Proteja um disco da rotação da caixa", "レコードをクレート入れ替えから保護", "保护唱片不被轮换移出", "रिकॉर्ड को क्रेट रोटेशन से सुरक्षित रखें", "Защитить пластинку от ротации ящика"],
  "Share:": ["Compartir:", "Compartilhar:", "共有:", "分享:", "शेयर:", "Поделиться:"],
  "Export JPEGs, text, or a 1-tap DNA clone link": ["Exporta JPEGs, texto o enlace clon ADN de 1 toque", "Exporte JPEGs, texto ou link clone DNA de 1 toque", "画像・テキスト出力、1タップDNAクローンリンク", "导出图片、文本或一键DNA克隆链接", "JPEG, टेक्स्ट या 1-टैप DNA क्लोन लिंक भेजें", "Экспорт JPEG, текста или ДНК-ссылки в 1 клик"],
  "Apparel:": ["Ropa:", "Estamparia:", "アパレル:", "服饰:", "अपैरल:", "Мерч:"],
  "300 DPI t-shirt chest & tour-back PNGs": ["PNGs de 300 DPI para pecho y espalda de gira", "PNGs 300 DPI para peito e costas de turnê", "300 DPI Tシャツ前面＆ツアー背面PNG出力", "300 DPI T恤胸前与巡演背面 PNG", "300 DPI टी-शर्ट फ्रंट और टूर बैक PNG", "PNG 300 DPI для печати на футболках"],
  "⚡ Daily Drop & Sleeve Gestures": ["⚡ Disco Diario y Gestos en la Funda", "⚡ Disco Diário e Gestos na Capa", "⚡ デイリードロップ＆ジャケット操作", "⚡ 每日掉落与封套手势", "⚡ डेली ड्रॉप और कवर जेस्चर", "⚡ Диск Дня и Жесты Обложки"],
  "Swap Cover Art & Custom Drops": ["Cambiar Portada y Discos Personalizados", "Trocar Capa e Discos Personalizados", "表紙写真の変更＆カスタム制作", "更换封面与自定义唱片", "कवर आर्ट बदलें और कस्टम ड्रॉप", "Смена Обложки и Свои Пластинки"],
  "Cargo Bay & Director's Chair": ["Bodega de Carga y Silla del Director", "Porão de Carga e Cadeira do Diretor", "カーゴベイ＆ディレクターズチェア", "货舱扩展包与导演椅", "कार्गो बे और डायरेक्टर्स चेयर", "Грузовой Отсек и Кресло Режиссёра"],
  "Tap the footer gear icon to install expansion packs, author custom crates in The Crate Forge, or isolate custom pools.": [
    "Toca el engranaje inferior para instalar paquetes de expansión, crear cajas propias en La Forja o aislar bancos personalizados.",
    "Toque na engrenagem inferior para instalar pacotes de expansão, criar caixas na Forja ou isolar bancos personalizados.",
    "右下の歯車アイコンから拡張パックの導入、クレート・フォージでの自作パック作成、生成プールの個別切替が行えます。",
    "点击底部齿轮图标安装扩展包、在唱片箱工坊自制词库与贴图，或单独开关生成池。",
    "विस्तार पैक इंस्टॉल करने, क्रेट फोर्ज में कस्टम पैक बनाने या पूल बदलने के लिए नीचे गियर आइकन पर टैप करें।",
    "Нажмите на шестерёнку внизу для установки пакетов, создания своих ящиков в Кузнице или настройки пулов."
  ],
  "Cache Refresh & Reset": ["Refrescar Caché y Restablecer", "Atualizar Cache e Restaurar", "キャッシュ更新＆リセット", "刷新缓存与重置", "कैश रिफ्रेश और रीसेट", "Обновление Кэша и Сброс"],
  "Refresh app code safely (keeping your crate) or run a factory wipe in Settings.": [
    "Refresca el código de la app de forma segura (conservando tu caja) o ejecuta un borrado de fábrica en Ajustes.",
    "Atualize o código do app com segurança (mantendo sua caixa) ou execute uma restauração de fábrica nas Configurações.",
    "クレートを保持したまま安全にキャッシュを更新するか、設定から工場出荷時リセットを実行できます。",
    "安全刷新应用代码（保留唱片箱数据），或在设置中执行恢复出厂设置。",
    "अपना क्रेट सुरक्षित रखते हुए ऐप कैश रिफ्रेश करें या सेटिंग्स में फ़ैक्टरी रीसेट करें।",
    "Безопасно обновите кэш кода (сохранив ящик) или выполните полный сброс в Настройках."
  ],
  "Open →": ["Abrir →", "Abrir →", "開く →", "打开 →", "खोलें →", "Открыть →"],
  "100% Client-Side Synthesis Engine": ["Motor de Síntesis 100% en tu Dispositivo", "Motor de Síntese 100% Local", "100% クライアントサイド合成エンジン", "100% 本地客户端合成引擎", "100% क्लाइंट-साइड सिंथेसिस इंजन", "100% Локальный Движок Синтеза"],
  "Self-contained HTML5 2D Canvas compositor and Web Audio API synthesizer. Zero cloud servers, accounts, or tracking. Internet connectivity is never required—and is only used if you opt in to check for app or Cargo Bay pack updates in Settings.": [
    "Compositor HTML5 Canvas 2D y sintetizador Web Audio autónomo. Cero servidores en la nube, cuentas o rastreo. Nunca requiere internet, salvo que decidas buscar actualizaciones en Ajustes.",
    "Compositor HTML5 Canvas 2D e sintetizador Web Audio autônomo. Zero servidores na nuvem, contas ou rastreamento. Nunca requer internet, exceto se você optar por verificar atualizações nas Configurações.",
    "自己完結型のHTML5 2D CanvasコンポジターおよびWeb Audioシンセサイザー。クラウドサーバー・アカウント・追跡は一切ありません。通信は設定画面で更新確認を選択した場合にのみ使用されます。",
    "完全自包含的 HTML5 2D Canvas 合成器与 Web Audio 音频引擎。零云服务器、零账号、零追踪。完全无需联网——仅在您主动检查更新时使用网络。",
    "स्वयं-निहित HTML5 2D कैनवास और वेब ऑडियो सिंथेसाइज़र। कोई क्लाउड सर्वर, खाता या ट्रैकिंग नहीं। इंटरनेट की कभी आवश्यकता नहीं होती।",
    "Автономный композитор HTML5 2D Canvas и синтезатор Web Audio API. Без облачных серверов, аккаунтов и слежки. Интернет не требуется."
  ],
  "On-Device Darkroom & 14-Slot Crate": ["Cuarto Oscuro Local y Caja de 14 Discos", "Câmara Escura Local e Caixa de 14 Discos", "端末内暗室処理＆14枚収納クレート", "本地暗房滤镜与14槽唱片箱", "ऑन-डिवाइस डार्करूम और 14-स्लॉट क्रेट", "Локальная Фотолаборатория и Ящик на 14 Дисков"],
  "Uploaded cover photos are processed locally in IndexedDB with 1970s Kodachrome, Cyanotype, Noir, and X-Ray darkroom wear. Your crate preserves up to 14 pressings at a time—tap the Heart icon on any standout record so it never rotates out.": [
    "Las fotos subidas se procesan localmente en IndexedDB con filtros Kodachrome, Cianotipia, Noir y Rayos X de los años 70. Tu caja guarda hasta 14 discos; marca con el Corazón tus favoritos para protegerlos.",
    "As fotos enviadas são processadas localmente no IndexedDB com filtros Kodachrome, Cianotipia, Noir e Raio-X dos anos 70. Sua caixa preserva até 14 discos; toque no Coração para proteger seus favoritos.",
    "アップロードした写真はIndexedDB内で70年代コダクローム・青写真・ノワール・X線フィルター処理されます。クレートは最大14枚保存可能で、ハートを付けると自動入れ替えから保護されます。",
    "上传的封面照片在本地 IndexedDB 中通过 70 年代柯达克罗姆、蓝晒、黑色电影和 X 光暗房滤镜处理。唱片箱最多保存 14 张唱片——点击红心即可永久保护。",
    "अपलोड की गई कवर फ़ोटो को लोकल IndexedDB में 1970 के दशक के कोडाक्रोम, सायनोटाइप, नोयर और एक्स-रे फ़िल्टर के साथ प्रोसेस किया जाता है। आपका क्रेट 14 रिकॉर्ड तक सुरक्षित रखता है।",
    "Загруженные фото обрабатываются локально в IndexedDB фильтрами Kodachrome, Цианотипия, Нуар и Рентген 70-х. Ящик вмещает до 14 пластинок — отметьте сердечком лучшие, чтобы защитить их."
  ],
  "Temporal Anomalies & Radiator Warp": ["Anomalías Temporales y Deformación por Radiador", "Anomalias Temporais e Empeno de Radiador", "時空異常盤＆ラジエーター歪み効果", "时空异常版与暖气片弯曲音效", "टेम्पोरल विसंगतियाँ और रेडिएटर वॉर्प", "Временные Аномалии и Деформация Винила"],
  "Future-dated pressings trigger a holographic security sash, while bargain-bin G+ and FAIR copies exhibit authentic 0.55 Hz radiator-warp pitch wow on the turntable.": [
    "Las ediciones con fecha futura activan una banda holográfica de seguridad, mientras que las copias G+ y FAIR muestran una auténtica fluctuación de tono de 0,55 Hz en el plato.",
    "Prensagens com data futura ativam uma faixa holográfica de segurança, enquanto cópias G+ e FAIR exibem autêntica oscilação de rotação de 0,55 Hz na vitrola.",
    "未来の年号が刻印された盤にはホログラム帯が出現し、G+やFAIR状態の特価盤では0.55Hzのリアルなレコード反り（ピッチ揺れ）が再現されます。",
    "未来年份的唱片会触发全息安全封带，而 G+ 与 FAIR 品相的特价旧盘在播放时会呈现真实的 0.55 Hz 暖气片热弯音高颤动。",
    "भविष्य की तारीख वाले रिकॉर्ड होलोग्राफिक सुरक्षा पट्टी दिखाते हैं, जबकि G+ और FAIR प्रतियां टर्नटेबल पर 0.55 Hz पिच वाउ प्रभाव देती हैं।",
    "Пластинки из будущего получают голографическую ленту, а уценённые копии G+ и FAIR воспроизводятся с аутентичным плаванием звука 0,55 Гц."
  ],
  "Inspired by the aesthetic of “Random Band Names, Volume One” by Charles Key": [
    "Inspirado en la estética de «Random Band Names, Volume One» de Charles Key",
    "Inspirado na estética de “Random Band Names, Volume One” de Charles Key",
    "Charles Key 著『Random Band Names, Volume One』の美学にインスパイアされた作品",
    "灵感源自 Charles Key 所著《Random Band Names, Volume One》的视觉美学",
    "चार्ल्स की (Charles Key) की पुस्तक “Random Band Names, Volume One” के सौंदर्यशास्त्र से प्रेरित",
    "Вдохновлено эстетикой книги Чарльза Ки «Random Band Names, Volume One»"
  ],
  "Subsidize Virtual Turntable Maintenance [donate]": ["Apoyar el Mantenimiento del Plato Virtual [donar]", "Apoiar a Manutenção da Vitrola Virtual [doar]", "仮想ターンテーブルの保守を支援 [寄付]", "赞助虚拟唱机维护 [捐赠]", "वर्चुअल टर्नटेबल रखरखाव में सहयोग करें [दान]", "Поддержать обслуживание вертушки [донат]"],
  "Understood": ["Entendido", "Entendido", "了解", "明白了", "समझ गया", "Понятно"],
  "Install Offline Deck": ["Instalar Receptor sin Conexión", "Instalar Vitrola Offline", "オフラインデッキをインストール", "安装离线唱机应用", "ऑफ़लाइन डेक इंस्टॉल करें", "Установить Офлайн-Деку"],
  "Deck is mounted and operating in standalone offline mode.": ["El receptor está instalado y funcionando en modo autónomo sin conexión.", "A vitrola está instalada e operando em modo offline autônomo.", "デッキはスタンドアロンのオフラインモードで稼働中です。", "唱机已安装并以独立离线模式运行。", "डेक इंस्टॉल है और ऑफ़लाइन मोड में काम कर रहा है।", "Дека установлена и работает в автономном офлайн-режиме."],
  "Close": ["Cerrar", "Fechar", "閉じる", "关闭", "बंद करें", "Закрыть"],

  // --- Settings, Cargo Bay, Crate Forge & Dispatch (including all Screenshot 3, 4 & 5 strings!) ---
  "Y.D.R.B.N. System Settings": ["Ajustes del Sistema Y.D.R.B.N.", "Configurações do Sistema Y.D.R.B.N.", "Y.D.R.B.N. システム設定", "Y.D.R.B.N. 系统设置", "Y.D.R.B.N. सिस्टम सेटिंग्स", "Системные Настройки Y.D.R.B.N."],
  "The Cargo Bay": ["La Bodega de Carga", "O Porão de Carga", "カーゴベイ (拡張パック)", "货舱 (扩展包)", "कार्गो बे (पैक)", "Грузовой Отсек"],
  "Manage packs": ["Gestionar paquetes", "Gerenciar pacotes", "パック管理", "管理扩展包", "पैक प्रबंधित करें", "Пакеты контента"],
  "Director's Chair": ["Silla del Director", "Cadeira do Diretor", "ディレクターズチェア", "导演椅", "डायरेक्टर्स चेयर", "Кресло Режиссёра"],
  "The Director's Chair": ["La Silla del Director", "A Cadeira do Diretor", "ディレクターズチェア", "导演椅", "डायरेक्टर्स चेयर", "Кресло Режиссёра"],
  "Pool overrides": ["Control de bancos", "Controle de bancos", "生成プール設定", "生成池开关", "पूल ओवरराइड", "Настройки пулов"],
  "Interface Color Mode": ["Modo de Color de la Interfaz", "Modo de Cor da Interface", "インターフェース配色モード", "界面色彩模式", "इंटरफ़ेस कलर मोड", "Цветовая Тема Интерфейса"],
  "default": ["predet.", "padrão", "標準", "默认", "डिफ़ॉल्ट", "стандарт"],
  "Walnut": ["Nogal", "Nogueira", "ウォルナット", "胡桃木", "अखरोट", "Орех"],
  "70s Brown/Gold": ["Marrón/Oro 70s", "Marrom/Ouro 70s", "70年代ブラウン/金", "70年代棕金", "70s भूरा/सुनहरा", "70-е Коричневый"],
  "Dark": ["Oscuro", "Escuro", "ダーク", "深色", "डार्क", "Тёмная"],
  "Obsidian Slate": ["Pizarra Obsidiana", "Ardósia Obsidiana", "黒曜石スレート", "黑曜石暗灰", "ओब्सीडियन स्लेट", "Обсидиан"],
  "Light": ["Claro", "Claro", "ライト", "浅色", "लाइट", "Светлая"],
  "Daylight Paper": ["Papel de Día", "Papel Claro", "デイライト紙", "日光羊皮纸", "डेलाइट पेपर", "Дневная бумага"],
  "Contrast": ["Contraste", "Contraste", "コントラスト", "高对比", "कॉन्ट्रास्ट", "Контраст"],
  "Hi-Vis Black": ["Negro Alto Contr.", "Preto Alto Contr.", "高視認ブラック", "高可视纯黑", "हाई-विज़ ब्लैक", "Высококонтр."],
  "App & Content Updates": ["Actualizaciones de App y Contenido", "Atualizações do App e Conteúdo", "アプリ＆コンテンツ更新", "应用与内容包更新", "ऐप और सामग्री अपडेट", "Обновления Приложения и Пакетов"],
  "Online": ["En Línea", "Online", "オンライン", "在线", "ऑनलाइन", "Онлайн"],
  "Offline": ["Sin Red", "Offline", "オフライン", "离线", "ऑफ़लाइन", "Офлайн"],
  "Y.D.R.B.N. never requires internet access to run. Enable this option if you want the deck to check for new app versions and Cargo Bay packs when online.": [
    "Y.D.R.B.N. nunca requiere acceso a internet para funcionar. Activa esta opción si deseas que el plato busque nuevas versiones y paquetes de la Bodega cuando estés en línea.",
    "O Y.D.R.B.N. nunca requer acesso à internet para funcionar. Ative esta opção se quiser que a vitrola verifique novas versões do app e pacotes quando estiver online.",
    "Y.D.R.B.N. の動作にインターネット接続は不要です。オンライン時にアプリの更新やカーゴベイの拡張パックを自動確認したい場合のみ有効にしてください。",
    "Y.D.R.B.N. 运行完全不需要互联网。如果您希望唱机在联网时自动检查新版本和货舱扩展包，请勾选此项。",
    "Y.D.R.B.N. को चलाने के लिए कभी भी इंटरनेट की आवश्यकता नहीं होती है। यदि आप ऑनलाइन होने पर नए अपडेट और पैक की जांच करना चाहते हैं तो इसे चालू करें।",
    "Y.D.R.B.N. не требует интернета для работы. Включите эту опцию, если хотите проверять обновления приложения и пакетов при наличии сети."
  ],
  "Check for app & pack updates when online": ["Buscar actualizaciones de app y paquetes al estar en línea", "Verificar atualizações do app e pacotes quando online", "オンライン時にアプリとパックの更新を確認", "联网时自动检查应用与扩展包更新", "ऑनलाइन होने पर ऐप और पैक अपडेट जांचें", "Проверять обновления при наличии сети"],
  "Check for Updates Now": ["Buscar Actualizaciones Ahora", "Verificar Atualizações Agora", "今すぐ更新を確認", "立即检查更新", "अभी अपडेट जांचें", "Проверить Обновления Сейчас"],
  "Checking...": ["Buscando...", "Verificando...", "確認中...", "正在检查...", "जांच रहा है...", "Проверка..."],
  "Offline — Internet Required to Check": ["Sin Conexión — Se Requiere Internet", "Offline — Requer Internet para Verificar", "オフライン — 確認には通信が必要です", "离线 — 检查更新需要联网", "ऑफ़लाइन — जांचने के लिए इंटरनेट चाहिए", "Офлайн — Для проверки нужна сеть"],
  "Apply Ready App Update & Reload": ["Aplicar Actualización y Recargar", "Aplicar Atualização e Recarregar", "更新を適用して再読み込み", "应用更新并重新加载", "अपडेट लागू करें और रीलोड करें", "Применить Обновление и Перезагрузить"],
  "Offline App Mount": ["Instalación sin Conexión", "Instalação Offline do App", "オフラインアプリ設置", "离线应用安装", "ऑफ़लाइन ऐप इंस्टॉल", "Офлайн-Установка Приложения"],
  "Install to your home screen or desktop": ["Instala en tu pantalla de inicio o escritorio", "Instale na tela inicial ou área de trabalho", "ホーム画面やデスクトップに設置", "安装到主屏幕或桌面", "अपनी होम स्क्रीन या डेस्कटॉप पर इंस्टॉल करें", "Установить на главный экран или ПК"],
  "Mounted in standalone offline mode": ["Instalado en modo autónomo sin conexión", "Instalado em modo offline autônomo", "スタンドアロンモードで稼働中", "已作为独立离线应用运行", "स्टैंडअलोन ऑफ़लाइन मोड में स्थापित", "Установлено в автономном режиме"],
  "Install App": ["Instalar App", "Instalar App", "インストール", "安装应用", "ऐप इंस्टॉल करें", "Установить"],
  "Archival Dispatch": ["Despacho de Archivo", "Despacho de Arquivo", "アーカイブ通信 (フィードバック)", "档案通讯 (匿名反馈)", "पुरालेख डिस्पैच (फ़ीडबैक)", "Архивная Депеша"],
  "Anonymous word, cutout & bug submissions": ["Envío anónimo de palabras, recortes y errores", "Envio anônimo de palavras, recortes e bugs", "単語・切り抜き・不具合の匿名送信", "匿名提交词汇、贴图创意与问题反馈", "अनाम शब्द, कटआउट और बग सुझाव", "Анонимная отправка слов, идей и багов"],
  "Open": ["Abrir", "Abrir", "開く", "打开", "खोलें", "Открыть"],
  "Maintenance, Cache & Reset": ["Mantenimiento, Caché y Restablecimiento", "Manutenção, Cache e Restauração", "メンテナンス・キャッシュ・初期化", "维护、缓存与重置", "रखरखाव, कैश और रीसेट", "Обслуживание, Кэш и Сброс"],
  "1. Refresh App Cache (Safe)": ["1. Refrescar Caché de la App (Seguro)", "1. Atualizar Cache do App (Seguro)", "1. アプリキャッシュを更新 (安全)", "1. 刷新应用缓存 (安全保留数据)", "1. ऐप कैश रिफ्रेश करें (सुरक्षित)", "1. Обновить Кэш Приложения (Безопасно)"],
  "Keeps Crate & Packs": ["Conserva Caja y Paquetes", "Mantém Caixa e Pacotes", "クレートとパックを保持", "保留唱片箱与扩展包", "क्रेट और पैक सुरक्षित रखता है", "Сохраняет ящик и пакеты"],
  "Reloads fresh app code and resets offline worker caches while keeping all saved records, favorites, and Cargo Bay packs intact.": [
    "Recarga el código más reciente y limpia la caché del Service Worker conservando intactos todos tus discos, favoritos y paquetes.",
    "Recarrega o código mais recente e redefine o cache offline mantendo todos os seus discos, favoritos e pacotes intactos.",
    "保存済みのレコード、お気に入り、拡張パックをすべて保持したまま、最新のアプリコードとキャッシュを再読み込みします。",
    "重新加载最新应用代码并重置离线缓存，同时完整保留所有已保存的唱片、收藏和货舱扩展包。",
    "आपके सभी सेव किए गए रिकॉर्ड, पसंदीदा और कार्गो बे पैक को सुरक्षित रखते हुए नया ऐप कोड और ऑफ़लाइन कैश रीलोड करता है।",
    "Перезагружает свежий код приложения и сбрасывает кэш воркера, сохраняя все пластинки, избранное и пакеты."
  ],
  "Refresh App Cache & Reload": ["Refrescar Caché y Recargar", "Atualizar Cache e Recarregar", "キャッシュを更新して再読み込み", "刷新缓存并重新加载", "कैश रिफ्रेश और रीलोड करें", "Обновить Кэш и Перезагрузить"],
  "2. Factory Wipe (Erase All Data)": ["2. Borrado de Fábrica (Borrar Todo)", "2. Restauração de Fábrica (Apagar Tudo)", "2. 工場出荷時リセット (全データ消去)", "2. 恢复出厂设置 (清除所有数据)", "2. फ़ैक्टरी रीसेट (सारा डेटा मिटाएँ)", "2. Сброс до Заводских (Удалить Всё)"],
  "Deletes all saved records, favorites, downloaded packs, preferences, and offline caches.": [
    "Elimina todos los discos guardados, favoritos, paquetes descargados, preferencias y cachés sin conexión.",
    "Apaga todos os discos salvos, favoritos, pacotes baixados, preferências e caches offline.",
    "保存したレコード、お気に入り、導入済みパック、設定、オフラインキャッシュをすべて完全に消去します。",
    "删除所有已保存的唱片、收藏、已下载扩展包、偏好设置与离线缓存。",
    "सभी सेव किए गए रिकॉर्ड, पसंदीदा, डाउनलोड किए गए पैक, सेटिंग्स और ऑफ़लाइन कैश को मिटा देता है।",
    "Удаляет все сохранённые пластинки, избранное, скачанные пакеты, настройки и офлайн-кэш."
  ],
  "Factory Wipe App Data": ["Borrar Todos los Datos de la App", "Apagar Todos os Dados do App", "全データを初期化する", "清除所有应用数据", "सारा ऐप डेटा मिटाएँ", "Полный Сброс Данных"],
  "Erase crate, favorites & packs? Cannot be undone.": ["¿Borrar caja, favoritos y paquetes? No se puede deshacer.", "Apagar caixa, favoritos e pacotes? Não pode ser desfeito.", "クレート・お気に入り・パックを消去しますか？（元に戻せません）", "确定清除唱片箱、收藏和扩展包？此操作无法撤销。", "क्रेट, पसंदीदा और पैक मिटाएँ? इसे पूर्ववत नहीं किया जा सकता।", "Удалить ящик, избранное и пакеты? Это действие необратимо."],
  "Cancel": ["Cancelar", "Cancelar", "キャンセル", "取消", "रद्द करें", "Отмена"],
  "Confirm Wipe": ["Confirmar Borrado", "Confirmar Exclusão", "消去を確定", "确认清除", "मिटाना सुनिश्चित करें", "Удалить Всё"],
  "Developer Controls": ["Controles de Desarrollador", "Controles de Desenvolvedor", "開発者コントロール", "开发者控制项", "डेवलपर नियंत्रण", "Панель Разработчика"],
  "Lock and unlock bypass controls here.": ["Bloquea y desbloquea los controles de prueba aquí.", "Bloqueie e desbloqueie controles de teste aqui.", "開発者用バイパス制御のロック／解除を行います。", "在此锁定或解锁开发者调试控制项。", "यहाँ बायपास नियंत्रण लॉक और अनलॉक करें।", "Блокировка и разблокировка отладочных функций."],
  "LOCKED": ["BLOQUEADO", "BLOQUEADO", "ロック中", "已锁定", "लॉक", "ЗАКРЫТО"],
  "UNLOCKED": ["DESBLOQUEADO", "DESBLOQUEADO", "解除済", "已解锁", "अनलॉक", "ОТКРЫТО"],
  "Dev Mode (Unlimited Drops)": ["Modo Dev (Lanzamientos Ilimitados)", "Modo Dev (Discos Ilimitados)", "開発モード (無制限ドロップ)", "开发者模式 (无限掉落)", "डेव मोड (असीमित ड्रॉप)", "Режим Dev (Без лимита)"],
  "Bypasses 24-hour drop countdown.": ["Omite la cuenta regresiva de 24 horas.", "Ignora a contagem regressiva de 24 horas.", "24時間のクールダウン制限を無効化します。", "跳过 24 小时掉落冷却倒计时。", "24-घंटे के काउंटडाउन को बायपास करता है।", "Отключает 24-часовой таймер ожидания."],
  "Open Technician Service Deck": ["Abrir Panel Técnico de Servicio", "Abrir Painel Técnico de Serviço", "技術者サービスデッキを開く", "打开技术员服务面板", "तकनीशियन सर्विस डेक खोलें", "Открыть Сервисную Деку Техника"],
  "Back": ["Atrás", "Voltar", "戻る", "返回", "वापस", "Назад"],
  "Done": ["Listo", "Concluído", "完了", "完成", "पूर्ण", "Готово"],
  "Asset & Generator Overrides": ["Control de Activos y Generador", "Controle de Ativos e Gerador", "アセット＆ジェネレーター優先設定", "素材与生成器池开关", "एसेट और जनरेटर ओवरराइड", "Управление Пулами Генератора"],
  "Fine-tune synthesis pools. Disable default built-in vectors, backgrounds, or stock words to generate albums exclusively from your installed expansion packs.": [
    "Ajusta los bancos de síntesis. Desactiva los vectores, fondos o palabras predeterminadas para generar álbumes exclusivamente con tus paquetes instalados.",
    "Ajuste os bancos de síntese. Desative vetores, fundos ou palavras padrão para gerar álbuns exclusivamente com seus pacotes instalados.",
    "合成プールを微調整します。内蔵の標準ベクター・背景・単語を無効にすると、導入した拡張パックのみからアルバムを生成します。",
    "微调合成素材池。禁用默认内置图形、背景或基础词库后，将仅使用您安装的扩展包生成专辑。",
    "सिंथेसिस पूल को समायोजित करें। केवल अपने इंस्टॉल किए गए पैक से एल्बम बनाने के लिए डिफ़ॉल्ट शब्दों या चित्रों को बंद करें।",
    "Тонкая настройка пулов синтеза. Отключите встроенные фигуры, фоны или базовые слова, чтобы генерировать альбомы только из установленных пакетов."
  ],
  "Core Word Pools": ["Bancos de Palabras Base", "Bancos de Palavras Base", "標準ワードプール", "核心词汇池", "मुख्य शब्द पूल", "Базовый Словарь"],
  "Disable default vocabulary to draw names exclusively from installed word packs.": [
    "Desactiva el vocabulario base para extraer nombres exclusivamente de los paquetes de palabras instalados.",
    "Desative o vocabulário padrão para extrair nomes exclusivamente dos pacotes de palavras instalados.",
    "標準語彙を無効にし、導入済みの単語パックからのみバンド名やタイトルを生成します。",
    "禁用默认词库，仅从已安装的词汇扩展包中抽取名称。",
    "केवल इंस्टॉल किए गए शब्द पैक से नाम चुनने के लिए डिफ़ॉल्ट शब्दावली बंद करें।",
    "Отключить базовый словарь, чтобы брать слова только из установленных пакетов."
  ],
  "Core Subjects (3D Shapes)": ["Sujetos Base (Formas 3D)", "Sujeitos Base (Formas 3D)", "標準被写体 (ベクター図形)", "核心主体图形", "मुख्य आकृतियाँ (3D)", "Базовые Предметы"],
  "Disable procedural vector drawings to pull exclusively from installed subject cutout packs.": [
    "Desactiva los dibujos vectoriales base para usar exclusivamente los paquetes de recortes instalados.",
    "Desative os desenhos vetoriais padrão para usar exclusivamente os pacotes de recortes instalados.",
    "標準ベクター図形を無効にし、導入済みの被写体カットアウトパックのみを使用します。",
    "禁用默认矢量图形，仅使用已安装的主体抠图扩展包。",
    "केवल इंस्टॉल किए गए कटआउट पैक का उपयोग करने के लिए डिफ़ॉल्ट आकृतियाँ बंद करें।",
    "Отключить стандартные векторные рисунки и использовать только вырезки из пакетов."
  ],
  "Core Backdrops & Scenes": ["Fondos y Escenas Base", "Fundos e Cenas Base", "標準背景＆シーン", "核心背景与场景", "मुख्य बैकड्रॉप और दृश्य", "Базовые Фоны и Сцены"],
  "Disable default canvas scenes to use only installed background texture packs.": [
    "Desactiva las escenas base del lienzo para usar solo los paquetes de texturas de fondo instalados.",
    "Desative as cenas padrão do canvas para usar apenas os pacotes de texturas de fundo instalados.",
    "標準キャンバス背景を無効にし、導入済みの背景テクスチャパックのみを使用します。",
    "禁用默认画布场景，仅使用已安装的背景纹理扩展包。",
    "केवल इंस्टॉल किए गए बैकग्राउंड टेक्सचर पैक का उपयोग करने के लिए डिफ़ॉल्ट दृश्य बंद करें।",
    "Отключить базовые сцены холста и использовать только текстуры из пакетов."
  ],
  "Emoji Modifier Stamps": ["Sellos Modificadores Emoji", "Estampas de Emoji", "絵文字スタンプ", "表情符号修饰印章", "इमोजी स्टैम्प", "Эмодзи-Штампы"],
  "Exclude emoji modifier stamps and sticker layers from generated sleeve artwork.": [
    "Excluye los sellos de emojis de las portadas generadas.",
    "Exclua as estampas de emojis das capas geradas.",
    "生成されるジャケットから絵文字スタンプを除外します。",
    "在生成的封套艺术图中排除表情符号修饰贴纸。",
    "जनरेट किए गए कवर आर्टवर्क से इमोजी स्टैम्प को हटाएँ।",
    "Исключить эмодзи-штампы из генерируемых обложек."
  ],
  "ENABLED": ["ACTIVADO", "ATIVADO", "有効", "已启用", "चालू", "ВКЛ"],
  "DISABLED": ["DESACTIVADO", "DESATIVADO", "無効", "已禁用", "बंद", "ВЫКЛ"],

  // --- Cargo Bay & Crate Forge (Screenshots 3 & 4) ---
  "The Crate Forge": ["La Forja de Cajas", "A Forja de Caixas", "クレート・フォージ (自作スタジオ)", "唱片箱工坊 (自定义扩展)", "क्रेट फोर्ज (कस्टम पैक)", "Кузница Ящиков"],
  "Author custom word lists and transparent cutout stamps directly on your device.": [
    "Crea listas de palabras personalizadas y sellos recortados transparentes directamente en tu dispositivo.",
    "Crie listas de palavras personalizadas e estampas recortadas transparentes diretamente no seu dispositivo.",
    "オリジナルの単語リストや背景透過スタンプを端末上で直接作成・保存できます。",
    "直接在您的设备上编写自定义词表并上传透明背景抠图印章。",
    "सीधे अपने डिवाइस पर कस्टम शब्द सूचियाँ और पारदर्शी कटआउट स्टैम्प बनाएँ।",
    "Создавайте собственные списки слов и прозрачные штампы прямо на устройстве."
  ],
  "New Crate": ["Nueva Caja", "Nova Caixa", "新規作成", "新建扩展箱", "नया क्रेट", "Новый Ящик"],
  "Installed Content Manifest": ["Manifiesto de Contenido Instalado", "Manifesto de Conteúdo Instalado", "インストール済コンテンツ一覧", "已安装内容清单", "इंस्टॉल की गई सामग्री सूची", "Установленные Пакеты Контента"],
  "User-Forged Crates": ["Cajas Creadas por el Usuario", "Caixas Criadas pelo Usuário", "自作カスタムクレート", "用户自制扩展箱", "उपयोगकर्ता द्वारा निर्मित क्रेट", "Пользовательские Ящики"],
  "Word Expansion Packs": ["Paquetes de Expansión de Palabras", "Pacotes de Expansão de Palavras", "単語拡張パック", "词汇扩展包", "शब्द विस्तार पैक", "Пакеты Расширения Слов"],
  "Subject Cutout Packs": ["Paquetes de Recortes Centrales", "Pacotes de Recortes Centrais", "被写体カットアウトパック", "主体抠图扩展包", "सब्जेक्ट कटआउट पैक", "Пакеты Вырезок Предметов"],
  "Background Texture Packs": ["Paquetes de Texturas de Fondo", "Pacotes de Texturas de Fundo", "背景テクスチャパック", "背景纹理扩展包", "बैकग्राउंड टेक्सचर पैक", "Пакеты Фоновых Текстур"],
  "All In": ["Todo Instalado", "Tudo Instalado", "全導入済", "已全部安装", "सभी इंस्टॉल", "Все Уст."],
  "Install Rest": ["Instalar Resto", "Instalar Restante", "残りを導入", "安装剩余项", "बाकी इंस्टॉल करें", "Доустановить"],
  "Install All": ["Instalar Todo", "Instalar Tudo", "すべて導入", "全部安装", "सभी इंस्टॉल करें", "Установить Все"],
  "Installing...": ["Instalando...", "Instalando...", "導入中...", "正在安装...", "इंस्टॉल हो रहा है...", "Установка..."],
  "Removing...": ["Eliminando...", "Removendo...", "削除中...", "正在移除...", "हटाया जा रहा है...", "Удаление..."],
  "Not installed": ["No instalado", "Não instalado", "未導入", "未安装", "इंस्टॉल नहीं है", "Не установлен"],
  "No remote or local content packs detected.": ["No se detectaron paquetes de contenido locales ni remotos.", "Nenhum pacote de conteúdo local ou remoto detectado.", "コンテンツパックが見つかりません。", "未检测到远程或本地扩展包。", "कोई कंटेंट पैक नहीं मिला।", "Пакеты контента не обнаружены."],
  "MOUNTED": ["MONTADO", "MONTADO", "マウント中", "已挂载", "माउंटेड", "АКТИВЕН"],
  "OFFLINE": ["INACTIVO", "INATIVO", "オフ", "已停用", "निष्क्रिय", "ОТКЛЮЧЕН"],
  "Offline Modular Content Studio": ["Estudio Modular de Contenido sin Conexión", "Estúdio Modular de Conteúdo Offline", "オフライン・モジュラーコンテンツ制作スタジオ", "离线模块化内容创作工坊", "ऑफ़लाइन मॉड्यूलर कंटेंट स्टूडियो", "Офлайн-Студия Модульного Контента"],
  "Crate Name:": ["Nombre de Caja:", "Nome da Caixa:", "クレート名:", "扩展箱名称:", "क्रेट का नाम:", "Имя Ящика:"],
  "e.g. Victorian Eccentrics, Basement Tools (optional)...": ["ej. Excéntricos Victorianos, Herramientas (opcional)...", "ex. Excêntricos Vitorianos, Ferramentas (opcional)...", "例：ヴィクトリア朝の奇人、地下室の工具 (任意)...", "例如：维多利亚怪人、地下室工具 (可选)...", "उदा. विक्टोरियन अजीबोगरीब, तहखाने के औजार (वैकल्पिक)...", "напр., Викторианские Чудаки, Инструменты (опц.)..."],
  "Words & Metadata": ["Palabras y Metadatos", "Palavras e Metadados", "単語＆メタデータ", "词汇与元数据", "शब्द और मेटाडेटा", "Слова и Метаданные"],
  "Subject Stamps": ["Sellos de Sujeto", "Estampas de Sujeito", "被写体スタンプ", "主体贴图", "सब्जेक्ट स्टैम्प", "Штампы Предметов"],
  "Archivist / Author": ["Archivista / Autor", "Arquivista / Autor", "作成者 / アーキビスト", "档案员 / 作者", "पुरालेखपाल / लेखक", "Архивариус / Автор"],
  "Author name": ["Nombre del autor", "Nome do autor", "作成者名", "作者名称", "लेखक का नाम", "Имя автора"],
  "Anonymous Archivist": ["Archivista Anónimo", "Arquivista Anônimo", "名無しのアーキビスト", "匿名档案员", "अनाम पुरालेखपाल", "Анонимный Архивариус"],
  "Version": ["Versión", "Versão", "バージョン", "版本号", "संस्करण", "Версия"],
  "Description / Lore": ["Descripción / Lore", "Descrição / Lore", "説明・ロア", "描述与背景故事", "विवरण / कहानी", "Описание / Лор"],
  "A brief note on the aesthetic of this pack...": ["Una breve nota sobre la estética de este paquete...", "Uma breve nota sobre a estética deste pacote...", "このパックのテーマや美学に関する簡単なメモ...", "关于此扩展包美学风格的简短说明...", "इस पैक की शैली पर एक संक्षिप्त नोट...", "Краткая заметка об эстетике этого пакета..."],
  "Nouns (One per line or comma-separated)": ["Sustantivos (Uno por línea o separados por comas)", "Substantivos (Um por linha ou separados por vírgula)", "名詞 (1行に1語、またはカンマ区切り)", "名词 (每行一个或用逗号分隔)", "संज्ञाएँ (प्रति पंक्ति एक या अल्पविराम से अलग)", "Существительные (По одному в строке или через запятую)"],
  "Spork, Radiator, Bureaucrat, Flannel, Lawn Chair...": ["Cuchara, Radiador, Burócrata, Franela, Silla...", "Colher, Radiador, Burocrata, Flanela, Cadeira...", "スポーク、ラジエーター、官僚、フランネル、折り畳み椅子...", "叉勺、散热器、官僚、法兰绒、沙滩椅...", "चम्मच, रेडिएटर, नौकरशाह, फलालैन, कुर्सी...", "Ложка-вилка, Радиатор, Бюрократ, Фланель, Шезлонг..."],
  "Adjectives (One per line or comma-separated)": ["Adjetivos (Uno por línea o separados por comas)", "Adjetivos (Um por linha ou separados por vírgula)", "形容詞 (1行に1語、またはカンマ区切り)", "形容词 (每行一个或用逗号分隔)", "विशेषण (प्रति पंक्ति एक या अल्पविराम से अलग)", "Прилагательные (По одному в строке или через запятую)"],
  "Overpriced, Melancholic, Resonant, Beige, Unironic...": ["Carísimo, Melancólico, Resonante, Beige, Irónico...", "Caro, Melancólico, Ressonante, Bege, Sem Ironia...", "高すぎる、憂鬱な、共鳴する、ベージュの、大真面目な...", "溢价的、忧郁的、共鸣的、米色的、一本正经的...", "महंगा, उदास, गूंजने वाला, बेज, गंभीर...", "Переоценённый, Меланхоличный, Резонансный, Бежевый..."],
  "Ensembles / Group Formats (Optional)": ["Ensambles / Formatos de Grupo (Opcional)", "Conjuntos / Formatos de Grupo (Opcional)", "バンド編成・グループ形式 (任意)", "乐团编制 / 组合形式 (可选)", "समूह प्रारूप / एनसेंबल (वैकल्पिक)", "Ансамбли / Форматы Групп (Опционально)"],
  "Quartet, Collective, Society, Department, Experience...": ["Cuarteto, Colectivo, Sociedad, Departamento...", "Quarteto, Coletivo, Sociedade, Departamento...", "四重奏団、コレクティブ、協会、部門、エクスペリエンス...", "四重奏、公社、协会、部门、体验团...", "चौकड़ी, सामूहिक, समाज, विभाग, अनुभव...", "Квартет, Коллектив, Общество, Отдел, Проект..."],
  "loaded": ["cargadas", "carregadas", "件読込済", "个已加载", "लोड किए गए", "загружено"],
  "Transparent PNG Subject Stamps": ["Sellos de Sujeto PNG Transparentes", "Estampas PNG Transparentes", "背景透過PNG 被写体スタンプ", "透明 PNG 主体印章", "पारदर्शी PNG सब्जेक्ट स्टैम्प", "Прозрачные PNG-Штампы Предметов"],
  "Upload cutouts (transparent PNG or WebP) to appear as surreal album centerpieces. Images are converted and stored locally in your browser's IndexedDB.": [
    "Sube recortes (PNG o WebP transparente) para que aparezcan como piezas centrales en las portadas. Se guardan localmente en IndexedDB.",
    "Envie recortes (PNG ou WebP transparente) para aparecerem como peças centrais nas capas. As imagens ficam salvas localmente no IndexedDB.",
    "透過PNGまたはWebP画像をアップロードすると、アルバム表紙の中央モチーフとして使用されます（ブラウザ内のIndexedDBにローカル保存されます）。",
    "上传透明背景 PNG 或 WebP 抠图作为超现实专辑封面主体。图像将保存在浏览器本地 IndexedDB 中。",
    "एल्बम कवर के केंद्र में दिखाने के लिए पारदर्शी PNG या WebP कटआउट अपलोड करें। इमेज आपके ब्राउज़र के IndexedDB में सेव होती हैं।",
    "Загрузите вырезки (прозрачный PNG или WebP) для использования в центре обложек. Изображения сохраняются локально в IndexedDB."
  ],
  "Select PNG / WebP Cutouts": ["Seleccionar Recortes PNG / WebP", "Selecionar Recortes PNG / WebP", "PNG / WebP カットアウトを選択", "选择 PNG / WebP 抠图文件", "PNG / WebP कटआउट चुनें", "Выбрать PNG / WebP Вырезки"],
  "Transparent backgrounds recommended": ["Se recomiendan fondos transparentes", "Fundos transparentes recomendados", "背景透過画像を推奨します", "建议使用透明背景图片", "पारदर्शी पृष्ठभूमि की सिफारिश की जाती है", "Рекомендуется прозрачный фон"],
  "No cutout stamps added to this crate yet.": ["Aún no se han añadido sellos a esta caja.", "Nenhuma estampa adicionada a esta caixa ainda.", "このクレートにはまだスタンプが追加されていません。", "此扩展箱尚未添加任何抠图印章。", "इस क्रेट में अभी तक कोई कटआउट स्टैम्प नहीं जोड़ा गया है।", "В этот ящик ещё не добавлено ни одного штампа."],
  "Import": ["Importar", "Importar", "読込", "导入", "इम्पोर्ट", "Импорт"],
  "Export": ["Exportar", "Exportar", "書出", "导出", "एक्सपोर्ट", "Экспорт"],
  "Assemble Crate": ["Ensamblar Caja", "Montar Caixa", "クレートを保存", "组装唱片箱", "क्रेट बनाएँ", "Собрать Ящик"],
  "Assembling...": ["Ensamblando...", "Montando...", "保存中...", "正在组装...", "बनाया जा रहा है...", "Сборка..."],

  // --- Archival Dispatch Modal ---
  "Anonymous Feedback & Content": ["Comentarios y Contenido Anónimos", "Feedback e Conteúdo Anônimos", "匿名フィードバック＆コンテンツ提案", "匿名反馈与内容提案", "अनाम फ़ीडबैक और सामग्री सुझाव", "Анонимные Отзывы и Идеи"],
  "Propose new vocabulary pools, suggest visual cutouts, or report generator quirks. Zero personal identity or emails are collected.": [
    "Propón nuevos bancos de palabras, sugiere recortes visuales o informa de curiosidades del generador. No se recopilan datos personales ni correos.",
    "Proponha novos bancos de palavras, sugira recortes visuais ou relate peculiaridades do gerador. Nenhum dado pessoal ou e-mail é coletado.",
    "新しい単語プールの提案、視覚スタンプのアイデア、不具合の報告を送信できます。個人情報やメールアドレスは一切収集されません。",
    "提议新词汇池、视觉抠图创意或报告生成器异常。绝不收集任何个人身份信息或电子邮件。",
    "नए शब्द पूल, विज़ुअल कटआउट का सुझाव दें या बग रिपोर्ट करें। कोई व्यक्तिगत पहचान या ईमेल एकत्र नहीं किया जाता है।",
    "Предлагайте новые слова, идеи для вырезок или сообщайте об ошибках. Личные данные и email не собираются."
  ],
  "Transmission Category": ["Categoría de Transmisión", "Categoria da Transmissão", "送信カテゴリ", "通讯类别", "ट्रांसमिशन श्रेणी", "Категория Сообщения"],
  "Expansion Pack Theme": ["Tema para Paquete de Expansión", "Tema de Pacote de Expansão", "拡張パックのテーマ案", "扩展包主题建议", "विस्तार पैक थीम", "Тема Пакета Расширения"],
  "Vocabulary / Word Submissions": ["Envío de Vocabulario / Palabras", "Envio de Vocabulário / Palavras", "単語・語彙の提案", "词汇 / 词条投稿", "शब्दावली / शब्द सुझाव", "Предложение Слов"],
  "Visual Gag / Cutout Idea": ["Idea de Gag Visual / Recorte", "Ideia de Piada Visual / Recorte", "視覚ギャグ・切り抜き案", "视觉笑料 / 抠图创意", "विज़ुअल गैग / कटआउट आइडिया", "Идея Визуального Гэга / Вырезки"],
  "System Anomaly / Bug": ["Anomalía del Sistema / Error", "Anomalia do Sistema / Bug", "システム異常・不具合報告", "系统异常 / 错误报告", "सिस्टम त्रुटि / बग", "Системная Аномалия / Баг"],
  "Suggestion / Content": ["Sugerencia / Contenido", "Sugestão / Conteúdo", "提案内容・メッセージ", "建议 / 内容详情", "सुझाव / सामग्री", "Предложение / Описание"],
  "Anomaly Description": ["Descripción de la Anomalía", "Descrição da Anomalia", "不具合の詳細", "异常情况描述", "त्रुटि का विवरण", "Описание Ошибки"],
  "IDENTITY: ANONYMOUS": ["IDENTIDAD: ANÓNIMA", "IDENTIDADE: ANÔNIMA", "識別情報：完全匿名", "身份：完全匿名", "पहचान: अनाम", "ЛИЧНОСТЬ: АНОНИМНО"],
  "INCLUDES BASIC DISPLAY METRICS": ["INCLUYE MÉTRICAS DE PANTALLA", "INCLUI MÉTRICAS DE TELA", "基本画面サイズ情報を含む", "包含基础屏幕分辨率信息", "बेसिक डिस्प्ले मेट्रिक्स शामिल", "ВКЛЮЧАЕТ РАЗМЕР ЭКРАНА"],
  "Transmit Dispatch": ["Transmitir Despacho", "Transmitir Despacho", "通信を送信", "发送反馈", "डिस्पैच भेजें", "Отправить Депешу"],
  "Transmitting...": ["Transmitiendo...", "Transmitindo...", "送信中...", "正在发送...", "भेजा जा रहा है...", "Отправка..."],
  "Transmission Received": ["Transmisión Recibida", "Transmissão Recebida", "通信を受信しました", "通讯已收到", "संदेश प्राप्त हुआ", "Сообщение Получено"],
  "Your submission has logged to the private archival queue for daily ingestion.": [
    "Tu envío se ha registrado en la cola privada de archivo para su revisión diaria.",
    "Sua sugestão foi registrada na fila privada de arquivo para revisão diária.",
    "あなたの提案はアーカイブの非公開キューに記録されました。",
    "您的提交已记录到私有档案队列中。",
    "आपका सुझाव निजी पुरालेख कतार में दर्ज कर लिया गया है।",
    "Ваше сообщение добавлено в приватную архивную очередь."
  ],
};

const NORMALIZED_LOOKUP: Map<string, PhraseTable> = new Map();
for (const [enKey, arr] of Object.entries(RAW_PHRASES)) {
  const norm = enKey.replace(/\s+/g, ' ').trim();
  NORMALIZED_LOOKUP.set(norm, {
    es: arr[0],
    pt: arr[1],
    ja: arr[2],
    zh: arr[3],
    hi: arr[4],
    ru: arr[5],
  });
}


const EXTRA_RICH_BLOCKS: Record<string, Partial<Record<SupportedLocale, string>>> = {
  "Web browsers block apps from pre-loading files onto external store pages—the links below open a blank t-shirt designer. Save your 300 DPI PNG(s) in Step 1 first, then use the vendor's “Upload / Add Image” button to select the saved file(s) from your device's Downloads folder.": {
    fr: "Les navigateurs bloquent le pré-chargement sur les boutiques externes : les liens ci-dessous ouvrent un <strong>atelier t-shirt vierge</strong>. Enregistrez d'abord vos PNG 300 DPI à l'<strong>Étape 1</strong>, puis utilisez le bouton <strong>« Téléverser / Ajouter une image »</strong> du site.",
    de: "Browser blockieren das automatische Hochladen auf externe Shop-Seiten — die Links unten öffnen einen <strong>leeren T-Shirt-Designer</strong>. Speichere zuerst deine 300-DPI-PNGs in <strong>Schritt 1</strong> und nutze dann dort <strong>„Bild hochladen / hinzufügen“</strong>.",
    id: "Browser memblokir aplikasi memuat file otomatis ke toko eksternal—tautan di bawah membuka <strong>desainer kaos kosong</strong>. Simpan PNG 300 DPI Anda di <strong>Langkah 1</strong> dulu, lalu gunakan tombol <strong>“Unggah / Tambah Gambar”</strong> di situs toko.",
    bn: "ওয়েব ব্রাউজার बाहरी স্টোরে ফাইল অটো-লোড ব্লক করে—নিচের লিঙ্কগুলো একটি <strong>খালি টি-শার্ট ডিজাইনার</strong> খুলবে। প্রথমে <strong>ধাপ ১</strong>-এ আপনার ৩০০ DPI PNG সেভ করুন, তারপর দোকানের <strong>“Upload / Add Image”</strong> বাটন দিয়ে ডাউনলোড ফোল্ডার থেকে ফাইলটি নিন।",
    ur: "ویب براؤزرز بیرونی اسٹورز پر خودکار فائل لوڈنگ روکتے ہیں—نیچے دیے گئے لنکس <strong>خالی ٹی شرٹ ڈیزائنر</strong> کھولتے ہیں۔ پہلے <strong>مرحلہ 1</strong> میں 300 DPI PNG محفوظ کریں، پھر اسٹور کے <strong>“Upload / Add Image”</strong> بٹن سے فائل اپ لوڈ کریں۔",
    ar: "تمنع المتصفحات التحميل التلقائي للمتاجر الخارجية — الروابط أدناه تفتح <strong>مصمم قمصان فارغاً</strong>. احفظ ملفات PNG بدقة 300 DPI في <strong>الخطوة 1</strong> أولاً، ثم استخدم زر <strong>«رفع / إضافة صورة»</strong> في الموقع.",
    tlh: "External ngevwI'Daq De' ngeHbe' Browser — <strong>Sut chenmoHwI' chIm</strong> poSmoH Link. <strong>mIw 1</strong>-Daq 300 DPI PNG yIpol, ghIq <strong>«Upload / Add Image»</strong> yIlo'."
  },
  "✦ Custom Drop: Enter any fields you choose. Anything left blank will be generated automatically. Custom drops do not consume your 24h Daily Drop timer.": {
    fr: "✦ <strong>Disque sur Mesure :</strong> Remplissez les champs de votre choix. Tout champ laissé vide sera généré automatiquement sans consommer votre tirage quotidien de 24 h.",
    de: "✦ <strong>Eigene Pressung:</strong> Fülle beliebige Felder aus. Alles, was leer bleibt, wird automatisch generiert und verbraucht nicht deinen 24h-Timer.",
    id: "✦ <strong>Rilisan Kustom:</strong> Isi kolom mana saja yang Anda pilih. Kolom kosong akan dibuat otomatis tanpa memakai waktu tunggu 24 jam Anda.",
    bn: "✦ <strong>কাস্টম ড্রপ:</strong> আপনার পছন্দমতো যেকোনো ঘর পূরণ করুন। খালি রাখা অংশগুলো স্বয়ংক্রিয়ভাবে তৈরি হবে এবং এটি আপনার ২৪ ঘণ্টার ডেইলি ড্রপ টাইমার খরচ করবে না।",
    ur: "✦ <strong>کسٹم ڈراپ:</strong> اپنی پسند کے خانے بھریں۔ خالی چھوڑے گئے حصے خودکار بن جائیں گے اور اس سے آپ کا 24 گھنٹے کا ٹائمر متاثر نہیں ہوگا۔",
    ar: "✦ <strong>إصدار مخصص:</strong> أدخل أي حقول تختارها، وسيتم توليد الحقول الفارغة تلقائياً دون استهلاك مؤقت الـ 24 ساعة اليومي.",
    tlh: "✦ <strong>QoQ chu':</strong> pong DamaSbogh yIghItlh. chImbogh Daq chenmoHlu' automatically 'ej 24-rep poH natlhbe'."
  },
  "Tap any word pill to switch between [N]oun, [A]djective, [E]nsemble, or [SKIP].": {
    fr: "Touchez un mot pour basculer entre <strong>[N]</strong>om, <strong>[A]</strong>djectif, <strong>[E]</strong>nsemble ou <strong>[SKIP]</strong> (Ignorer).",
    de: "Tippe auf ein Wort, um zwischen <strong>[N]</strong>omen, <strong>[A]</strong>djektiv, <strong>[E]</strong>nsemble oder <strong>[SKIP]</strong> zu wechseln.",
    id: "Ketuk kata mana saja untuk mengganti antara <strong>[N]</strong>omina, <strong>[A]</strong>djektiva, <strong>[E]</strong>nsembel, atau <strong>[SKIP]</strong> (Lewati).",
    bn: "যেকোনো শব্দে ট্যাপ করে <strong>[N]</strong>বিশেষ্য, <strong>[A]</strong>বিশেষণ, <strong>[E]</strong>দল বা <strong>[SKIP]</strong> (বাদ)-এর মধ্যে পরিবর্তন করুন।",
    ur: "کسی بھی لفظ پر ٹیپ کر کے <strong>[N]</strong>اسم، <strong>[A]</strong>صفت، <strong>[E]</strong>بینڈ یا <strong>[SKIP]</strong> کے درمیان بدلیں۔",
    ar: "اضغط على أي كلمة للتبديل بين <strong>[N]</strong>اسم، <strong>[A]</strong>صفة، <strong>[E]</strong>فرقة، أو <strong>[SKIP]</strong> (تخطي).",
    tlh: "mu' yI'uy: <strong>[N]</strong>DIp, <strong>[A]</strong>chovnatlh, <strong>[E]</strong>ghom pagh <strong>[SKIP]</strong>."
  },
  "Press once every 24 hours to mint today's album. Swipe left or right on the sleeve to browse your crate, tap Zoom or ↺ Flip in the corner, and tap Read ↗ on the back for full Liner Notes.": {
    fr: "Appuyez une fois toutes les 24 h pour presser l'album du jour. <strong>Glissez à gauche ou à droite</strong> sur la pochette pour parcourir votre caisse, touchez <strong>Zoom</strong> ou <strong>↺ Verso</strong> dans le coin, et <strong>Lire ↗</strong> au dos.",
    de: "Drücke einmal alle 24 Stunden für die Tages-Pressung. <strong>Wische nach links oder rechts</strong> über das Cover, tippe auf <strong>Zoom</strong> oder <strong>↺ Wenden</strong> in der Ecke und hinten auf <strong>Lesen ↗</strong>.",
    id: "Tekan sekali setiap 24 jam untuk mencetak album hari ini. <strong>Geser kiri atau kanan</strong> pada sampul untuk melihat kotak Anda, ketuk <strong>Perbesar</strong> atau <strong>↺ Balik</strong>, dan ketuk <strong>Baca ↗</strong> di belakang.",
    bn: "আজকের অ্যালবাম তৈরি করতে প্রতি ২৪ ঘণ্টায় একবার চাপুন। আপনার ক্রেট দেখতে কভারে <strong>বামে বা ডানে সোয়াইপ করুন</strong>, কোণায় <strong>জুম</strong> বা <strong>↺ উল্টান</strong> চাপুন এবং পিছনে <strong>পড়ুন ↗</strong>-এ ট্যাপ করুন।",
    ur: "آج کا البم بنانے کے لیے ہر 24 گھنٹے بعد دبائیں۔ اپنا کریٹ دیکھنے کے لیے کور پر <strong>بائیں یا دائیں سوائپ کریں</strong>، کونے میں <strong>زوم</strong> یا <strong>↺ پلٹیں</strong> دبائیں، اور پیچھے <strong>پڑھیں ↗</strong> پر ٹیپ کریں۔",
    ar: "اضغط مرة كل 24 ساعة لكبس ألبوم اليوم. <strong>اسحب يميناً أو يساراً</strong> على الغلاف لتصفح صندوقك، واضغط <strong>تكبير</strong> أو <strong>↺ اقلب</strong> في الزاوية، واضغط <strong>اقرأ ↗</strong> في الخلف.",
    tlh: "24 rep לו' DaHjaj QoQ yIchenmoH. DechDaq <strong>poS pagh nIH yIСуD</strong>, <strong>tInmoH</strong> pagh <strong>↺ choH</strong> yI'uy, 'ej 'emDaq <strong>laD ↗</strong> yI'uy."
  },
  "Open Customize A Drop to retouch the current sleeve with 1970s darkroom filters, or open Custom Drop Studio to press a brand-new record anytime.": {
    fr: "Ouvrez <strong>Personnaliser un Disque</strong> pour retoucher la pochette avec des filtres des années 70, ou ouvrez le <strong>Studio sur Mesure</strong> pour presser un nouveau disque à tout moment.",
    de: "Öffne <strong>Platte Anpassen</strong>, um das aktuelle Cover mit 70er-Dunkelkammer-Filtern zu bearbeiten, oder starte das <strong>Eigene Presswerk-Studio</strong> für eine neue Platte.",
    id: "Buka <strong>Kustomisasi Rilisan</strong> untuk memoles sampul saat ini dengan filter kamar gelap 1970-an, atau buka <strong>Studio Rilisan Kustom</strong> kapan saja.",
    bn: "১৯৭০-এর ডার্করুম ফিল্টার দিয়ে বর্তমান কভার সাজাতে <strong>কাস্টম রেকর্ড তৈরি</strong> খুলুন, অথবা যেকোনো সময় নতুন রেকর্ড তৈরি করতে <strong>কাস্টম ড্রপ স্টুডিও</strong> খুলুন।",
    ur: "موجودہ کور کو 1970 کی دہائی کے ڈارک روم فلٹرز سے سجانے کے لیے <strong>کسٹم ریکارڈ بنائیں</strong> کھولیں، یا نیا ریکارڈ بنانے کے لیے <strong>کسٹم ڈراپ اسٹوڈیو</strong> کھولیں۔",
    ar: "افتح <strong>تخصيص إصدار</strong> لتعديل الغلاف الحالي بفلاتر السبعينيات، أو افتح <strong>استوديو الإصدار المخصص</strong> لكبس اسطوانة جديدة في أي وقت.",
    tlh: "<strong>QoQ lIngmeH choH</strong> yIpoSmoH 'ej 1970 Hurgh Filter yIlo', pagh <strong>QoQ chenmoHwI'</strong> yIpoSmoH."
  },
  "Y.D.R.B.N. runs 100% offline on your device. Installing mounts it to your home screen or desktop without browser bars, app stores, or accounts.": {
    fr: "Y.D.R.B.N. fonctionne <strong>100 % hors-ligne</strong> sur votre appareil. L'installation l'ajoute à votre écran d'accueil ou bureau sans barres de navigateur, boutiques ni comptes.",
    de: "Y.D.R.B.N. läuft zu <strong>100 % offline</strong> auf deinem Gerät. Die Installation fügt es ohne Browserleisten, App-Stores oder Konten deinem Startbildschirm hinzu.",
    id: "Y.D.R.B.N. berjalan <strong>100% offline</strong> di perangkat Anda. Memasang aplikasi akan menempatkannya di layar utama atau desktop tanpa bilah browser atau akun.",
    bn: "Y.D.R.B.N. আপনার ডিভাইসে <strong>১০০% অফলাইনে</strong> চলে। ইনস্টল করলে এটি কোনো ব্রাউজার বার বা অ্যাকাউন্ট ছাড়াই আপনার হোম স্ক্রিন বা ডেস্কটপে যুক্ত হবে।",
    ur: "Y.D.R.B.N. آپ کے ڈیوائس پر <strong>100% آف لائن</strong> چلتا ہے۔ انسٹال کرنے سے یہ براؤزر بار یا اکاؤنٹ کے بغیر آپ کی ہوم اسکرین یا ڈیسک ٹاپ پر شامل ہو جاتا ہے۔",
    ar: "يعمل Y.D.R.B.N. <strong>بنسبة 100% بدون إنترنت</strong> على جهازك. يتيح التثبيت إضافته إلى شاشتك الرئيسية أو سطح المكتب بدون أشرطة متصفح أو حسابات.",
    tlh: "<strong>100% De'wI'Qo'</strong> Qap Y.D.R.B.N. bIjomDI' jIHlIjDaqמונHlu' — Browser naQmey pagh Account poQbe'."
  },
  "Tap the Share button in Safari's toolbar.": {
    fr: "Touchez le bouton <strong>Partager</strong> dans la barre d'outils de Safari.",
    de: "Tippe in der Safari-Symbolleiste auf die Taste <strong>Teilen</strong>.",
    id: "Ketuk tombol <strong>Bagikan (Share)</strong> di bilah alat Safari.",
    bn: "Safari-র টুলবারে থাকা <strong>Share</strong> বাটনে ট্যাপ করুন।",
    ur: "سفاری کے ٹول بار میں <strong>Share</strong> بٹن پر ٹیپ کریں۔",
    ar: "اضغط على زر <strong>مشاركة (Share)</strong> في شريط أدوات Safari.",
    tlh: "SafariDaq <strong>Share</strong> leQ yI'uy."
  },
  "Scroll down and tap “Add to Home Screen”.": {
    fr: "Faites défiler vers le bas et touchez <strong>« Sur l'écran d'accueil »</strong>.",
    de: "Scrolle nach unten und tippe auf <strong>„Zum Home-Bildschirm“</strong>.",
    id: "Gulir ke bawah dan ketuk <strong>“Tambahkan ke Layar Utama”</strong>.",
    bn: "নিচে স্ক্রল করুন এবং <strong>“Add to Home Screen”</strong>-এ ট্যাপ করুন।",
    ur: "نیچے اسکرول کریں اور <strong>“Add to Home Screen”</strong> پر ٹیپ کریں۔",
    ar: "مرر لأسفل واضغط على <strong>«إضافة إلى الشاشة الرئيسية»</strong>.",
    tlh: "bIngDaq <strong>“Add to Home Screen”</strong> yI'uy."
  },
  "Tap Chrome's menu (⋮) in the top-right corner.": {
    fr: "Touchez le menu de Chrome (<strong>⋮</strong>) dans le coin supérieur droit.",
    de: "Tippe oben rechts auf das Chrome-Menü (<strong>⋮</strong>).",
    id: "Ketuk menu Chrome (<strong>⋮</strong>) di pojok kanan atas.",
    bn: "উপরে ডানদিকের কোণায় Chrome-এর মেনুতে (<strong>⋮</strong>) ট্যাপ করুন।",
    ur: "اوپر دائیں کونے میں کروم کے مینو (<strong>⋮</strong>) پر ٹیپ کریں۔",
    ar: "اضغط على قائمة Chrome (<strong>⋮</strong>) في الزاوية العلوية.",
    tlh: "Chrome (<strong>⋮</strong>) lojmIt yI'uy."
  },
  "Tap “Install app” (or “Add to Home screen”).": {
    fr: "Touchez <strong>« Installer l'application »</strong> (ou <strong>« Ajouter à l'écran d'accueil »</strong>).",
    de: "Tippe auf <strong>„App installieren“</strong> (oder <strong>„Zum Startbildschirm hinzufügen“</strong>).",
    id: "Ketuk <strong>“Instal aplikasi”</strong> (atau <strong>“Tambahkan ke Layar utama”</strong>).",
    bn: "<strong>“Install app”</strong> (অথবা <strong>“Add to Home screen”</strong>)-এ ট্যাপ করুন।",
    ur: "<strong>“Install app”</strong> (یا <strong>“Add to Home screen”</strong>) پر ٹیپ کریں۔",
    ar: "اضغط على <strong>«تثبيت التطبيق»</strong> (أو <strong>«الإضافة إلى الشاشة الرئيسية»</strong>).",
    tlh: "<strong>“Install app”</strong> (pagh <strong>“Add to Home screen”</strong>) yI'uy."
  },
  "Click the Install icon on the right side of your address bar, or open the browser menu (⋮) and choose “Install Y.D.R.B.N.”": {
    fr: "Cliquez sur l'icône <strong>Installer</strong> à droite de la barre d'adresse, ou ouvrez le menu (<strong>⋮</strong>) et choisissez <strong>« Installer Y.D.R.B.N. »</strong>",
    de: "Klicke rechts in der Adressleiste auf das Symbol <strong>Installieren</strong> oder öffne das Browsermenü (<strong>⋮</strong>) und wähle <strong>„Y.D.R.B.N. installieren“</strong>.",
    id: "Klik ikon <strong>Instal</strong> di sisi kanan bilah alamat, atau buka menu browser (<strong>⋮</strong>) dan pilih <strong>“Instal Y.D.R.B.N.”</strong>",
    bn: "অ্যাড্রেস বারের ডান পাশে <strong>Install</strong> আইকনে ক্লিক করুন, অথবা ব্রাউজার মেনু (<strong>⋮</strong>) খুলে <strong>“Install Y.D.R.B.N.”</strong> বেছে নিন।",
    ur: "ایڈریس بار کے دائیں جانب <strong>Install</strong> آئیکن پر کلک کریں، یا براؤزر مینو (<strong>⋮</strong>) کھول کر <strong>“Install Y.D.R.B.N.”</strong> منتخب کریں۔",
    ar: "انقر على أيقونة <strong>تثبيت</strong> في شريط العنوان، أو افتح قائمة المتصفح (<strong>⋮</strong>) واختر <strong>«تثبيت Y.D.R.B.N.»</strong>",
    tlh: "Address Bar nIHDaq <strong>Install</strong> yI'uy, pagh (<strong>⋮</strong>) lojmItDaq <strong>“Install Y.D.R.B.N.”</strong> yIwIv."
  },
  "Hit ⚡ Daily Drop to forge today's surreal fictional band and vinyl artwork!": {
    fr: "Appuyez sur <span class=\"text-orange-400 font-bold\">⚡ Tirage du Jour</span> pour créer le groupe surréaliste et la pochette vinyle d'aujourd'hui !",
    de: "Drücke <span class=\"text-orange-400 font-bold\">⚡ Tages-Pressung</span>, um die heutige surreale Band und das Vinyl-Artwork zu schmieden!",
    id: "Tekan <span class=\"text-orange-400 font-bold\">⚡ Rilisan Harian</span> untuk mencetak band fiksi surealis dan sampul vinil hari ini!",
    bn: "আজকের কাল্পনিক ব্যান্ড এবং ভিনাইল আর্টওয়ার্ক তৈরি করতে <span class=\"text-orange-400 font-bold\">⚡ ডেইলি ড্রপ</span> চাপুন!",
    ur: "آج کا خیالی بینڈ اور وینائل آرٹ ورک بنانے کے لیے <span class=\"text-orange-400 font-bold\">⚡ ڈیلی ڈراپ</span> دبائیں!",
    ar: "اضغط على <span class=\"text-orange-400 font-bold\">⚡ إصدار اليوم</span> لتوليد فرقة اليوم الخيالية وغلاف الفينيل!",
    tlh: "<span class=\"text-orange-400 font-bold\">⚡ DaHjaj QoQchu'</span> yI'uy 'ej DaHjaj ghom mIllogh je yIchenmoH!"
  }
};

const NORMALIZED_RICH_LOOKUP: Map<string, PhraseTable> = new Map();
for (const [enKey, arr] of Object.entries(RAW_RICH_BLOCKS)) {
  const norm = enKey.replace(/\s+/g, ' ').trim();
  const extra = EXTRA_RICH_BLOCKS[norm] || {};
  NORMALIZED_RICH_LOOKUP.set(norm, {
    es: arr[0],
    pt: arr[1],
    ja: arr[2],
    zh: arr[3],
    hi: arr[4],
    ru: arr[5],
    ...extra,
  });
}

function translateDynamicPattern(text: string, lang: Exclude<SupportedLocale, 'en'>): string | null {
  // 1. "All Records (14)"
  const mAll = text.match(/^All Records \((\d+)\)$/);
  if (mAll) {
    const n = mAll[1];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `Todos (${n})`,
      pt: `Todos (${n})`,
      fr: `Tous (${n})`,
      de: `Alle (${n})`,
      id: `Semua (${n})`,
      ja: `全レコード (${n})`,
      zh: `全部唱片 (${n})`,
      hi: `सभी रिकॉर्ड (${n})`,
      bn: `সব রেকর্ড (${n})`,
      ur: `تمام ریکارڈز (${n})`,
      ar: `الكل (${n})`,
      ru: `Все диски (${n})`,
      tlh: `Hoch (${n})`,
    };
    return map[lang] || null;
  }

  // 2. "Favorites (3)"
  const mFav = text.match(/^Favorites \((\d+)\)$/);
  if (mFav) {
    const n = mFav[1];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `Favoritos (${n})`,
      pt: `Favoritos (${n})`,
      fr: `Favoris (${n})`,
      de: `Favoriten (${n})`,
      id: `Favorit (${n})`,
      ja: `お気に入り (${n})`,
      zh: `收藏 (${n})`,
      hi: `पसंदीदा (${n})`,
      bn: `পছন্দের (${n})`,
      ur: `پسندیدہ (${n})`,
      ar: `المفضلة (${n})`,
      ru: `Избранное (${n})`,
      tlh: `parHa' (${n})`,
    };
    return map[lang] || null;
  }

  // 3. "Novel Words Detected (4):"
  const mNovel = text.match(/^Novel Words Detected \((\d+)\):$/);
  if (mNovel) {
    const n = mNovel[1];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `Palabras Nuevas Detectadas (${n}):`,
      pt: `Palavras Novas Detectadas (${n}):`,
      fr: `Nouveaux Mots Détectés (${n}) :`,
      de: `Neue Wörter Erkannt (${n}):`,
      id: `Kata Baru Terdeteksi (${n}):`,
      ja: `検出された新出単語 (${n}):`,
      zh: `检测到新词汇 (${n}):`,
      hi: `नए शब्द मिले (${n}):`,
      bn: `নতুন শব্দ পাওয়া গেছে (${n}):`,
      ur: `نئے الفاظ ملے (${n}):`,
      ar: `كلمات جديدة مكتشفة (${n}):`,
      ru: `Найдено новых слов (${n}):`,
      tlh: `mu' chu' (${n}):`,
    };
    return map[lang] || null;
  }

  // 4. "12 loaded"
  const mLoaded = text.match(/^(\d+) loaded$/);
  if (mLoaded) {
    const n = mLoaded[1];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `${n} cargadas`,
      pt: `${n} carregadas`,
      fr: `${n} chargés`,
      de: `${n} geladen`,
      id: `${n} dimuat`,
      ja: `${n} 件読込済`,
      zh: `已加载 ${n} 个`,
      hi: `${n} लोड किए गए`,
      bn: `${n}টি লোড হয়েছে`,
      ur: `${n} لوڈ شدہ`,
      ar: `${n} محملة`,
      ru: `${n} загружено`,
      tlh: `${n} lInglu'`,
    };
    return map[lang] || null;
  }

  // 5. "3 existing skipped"
  const mSkip = text.match(/^(\d+) existing skipped$/);
  if (mSkip) {
    const n = mSkip[1];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `${n} existentes omitidas`,
      pt: `${n} existentes ignoradas`,
      fr: `${n} existants ignorés`,
      de: `${n} vorhandene übersprungen`,
      id: `${n} sudah ada dilewati`,
      ja: `既存 ${n} 語を除外`,
      zh: `已跳过 ${n} 个已有词`,
      hi: `${n} मौजूदा शब्द छोड़े गए`,
      bn: `${n}টি বিদ্যমান শব্দ বাদ`,
      ur: `${n} موجودہ الفاظ چھوڑے گئے`,
      ar: `تم تخطي ${n} موجودة`,
      ru: `${n} сущ. пропущено`,
      tlh: `${n} ngo' juSlu'`,
    };
    return map[lang] || null;
  }

  // 6. "Saved: ..."
  if (text.startsWith('Saved: ')) {
    const rest = text.slice(7);
    const prefixMap: Partial<Record<SupportedLocale, string>> = {
      es: 'Guardado: ',
      pt: 'Salvo: ',
      fr: 'Enregistré : ',
      de: 'Gespeichert: ',
      id: 'Tersimpan: ',
      ja: '保存済: ',
      zh: '已保存: ',
      hi: 'सेव किया गया: ',
      bn: 'সেভ হয়েছে: ',
      ur: 'محفوظ شدہ: ',
      ar: 'تم الحفظ: ',
      ru: 'Сохранено: ',
      tlh: 'polta’: ',
    };
    return (prefixMap[lang] || 'Saved: ') + rest;
  }

  // 7. "Col 1 • 6/17"
  const mCol = text.match(/^Col (\d) • (.+)$/);
  if (mCol) {
    const colMap: Partial<Record<SupportedLocale, string>> = {
      es: 'Col',
      pt: 'Col',
      fr: 'Col',
      de: 'Sp.',
      id: 'Kol',
      ja: '列',
      zh: '第',
      hi: 'कॉलम',
      bn: 'কলাম',
      ur: 'کالم',
      ar: 'عمود',
      ru: 'Кол.',
      tlh: 'gho',
    };
    const colWord = colMap[lang] || 'Col';
    return lang === 'zh'
      ? `第${mCol[1]}列 • ${mCol[2]}`
      : `${colWord} ${mCol[1]} • ${mCol[2]}`;
  }

  // 8. "Allow “...” to drop follow-up albums in future rolls"
  const mRec = text.match(/^Allow “(.+)” to drop follow-up albums in future rolls$/);
  if (mRec) {
    const b = mRec[1];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `Permitir que «${b}» lance álbumes adicionales en futuros sorteos`,
      pt: `Permitir que “${b}” lance novos álbuns em sorteios futuros`,
      fr: `Autoriser « ${b} » à sortir d'autres albums lors de futurs tirages`,
      de: `Erlaube „${b}“, bei künftigen Ziehungen weitere Alben zu veröffentlichen`,
      id: `Izinkan “${b}” merilis album lanjutan di undian mendatang`,
      ja: `「${b}」が今後のドロップで続編アルバムをリリースすることを許可する`,
      zh: `允许“${b}”在未来的随机掉落中发行续作专辑`,
      hi: `भविष्य के ड्रॉप में “${b}” को नए एल्बम जारी करने की अनुमति दें`,
      bn: `ভবিষ্যতের ড্রপে “${b}”-কে পরবর্তী অ্যালবাম প্রকাশের অনুমতি দিন`,
      ur: `مستقبل کے ڈراپس میں “${b}” کو نئے البمز جاری کرنے کی اجازت دیں`,
      ar: `السماح لفرقة «${b}» بإصدار ألبومات لاحقة في السحوبات القادمة`,
      ru: `Разрешить группе «${b}» выпускать новые альбомы в будущем`,
      tlh: `«${b}» QoQ chu' lIngmeH chaw'`,
    };
    return map[lang] || null;
  }

  // 9. Dynamic Toast: "Pressed: Band — Title"
  const mPressed = text.match(/^Pressed: (.+)$/);
  if (mPressed) {
    return `${PRESSED_PREFIXES[lang]}: ${mPressed[1]}`;
  }

  // 10. Dynamic Toast: "✦ Custom Drop Minted: ..."
  const mCustomMint = text.match(/^✦ Custom Drop Minted: (.+)$/);
  if (mCustomMint) {
    const map: Partial<Record<SupportedLocale, string>> = {
      es: '✦ Disco Personalizado Prensado',
      pt: '✦ Disco Personalizado Prensado',
      fr: '✦ Disque Personnalisé Pressé',
      de: '✦ Eigene Pressung Erstellt',
      id: '✦ Rilisan Kustom Dicetak',
      ja: '✦ カスタム盤プレス完了',
      zh: '✦ 自定义唱片已压制',
      hi: '✦ कस्टम ड्रॉप तैयार',
      bn: '✦ কাস্টম ড্রপ তৈরি হয়েছে',
      ur: '✦ کسٹم ڈراپ تیار',
      ar: '✦ تم كبس الإصدار المخصص',
      ru: '✦ Своя Пластинка Создана',
      tlh: "✦ QoQ chu' chenmoHlu'pu'",
    };
    return `${map[lang] || '✦ Custom Drop Minted'}: ${mCustomMint[1]}`;
  }

  // 11. Dynamic Toast: "🧬 Cloned Shared/DNA Pressing: ..."
  const mClone = text.match(/^🧬 Cloned (?:Shared|DNA) Pressing: (.+)$/);
  if (mClone) {
    const map: Partial<Record<SupportedLocale, string>> = {
      es: '🧬 Disco ADN Clonado',
      pt: '🧬 Disco DNA Clonado',
      fr: '🧬 Pressage ADN Cloné',
      de: '🧬 DNA-Pressung Geklont',
      id: '🧬 Piringan DNA Dikloning',
      ja: '🧬 DNAレコードを復元',
      zh: '🧬 已克隆 DNA 唱片',
      hi: '🧬 DNA रिकॉर्ड क्लोन हुआ',
      bn: '🧬 DNA রেকর্ড ক্লোন হয়েছে',
      ur: '🧬 DNA ریکارڈ کلون ہو گیا',
      ar: '🧬 تم استنساخ اسطوانة DNA',
      ru: '🧬 ДНК-Пластинка Клонирована',
      tlh: "🧬 DNA QoQ velta'",
    };
    return `${map[lang] || '🧬 Cloned Pressing'}: ${mClone[1]}`;
  }

  // 12. Dynamic Toast: "Saved <file> to Downloads." or "Saved <file>"
  const mSavedToast = text.match(/^Saved (.+?)(?: to Downloads\.)?$/);
  if (mSavedToast && mSavedToast[1].includes('.png')) {
    const files = mSavedToast[1];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `Guardado en Descargas: ${files}`,
      pt: `Salvo em Downloads: ${files}`,
      fr: `Enregistré dans Téléchargements : ${files}`,
      de: `Gespeichert unter Downloads: ${files}`,
      id: `Disimpan ke Unduhan: ${files}`,
      ja: `ダウンロードに保存しました: ${files}`,
      zh: `已保存至下载: ${files}`,
      hi: `डाउनलोड में सेव किया गया: ${files}`,
      bn: `ডাউনলোডে সেভ হয়েছে: ${files}`,
      ur: `ڈاؤن لوڈز میں محفوظ: ${files}`,
      ar: `تم الحفظ في التنزيلات: ${files}`,
      ru: `Сохранено в Загрузки: ${files}`,
      tlh: `polta': ${files}`,
    };
    return map[lang] || null;
  }

  // 13. Dynamic Toast: "Applied <Filter> filter with <Fit> layout!"
  const mDarkroom = text.match(/^Applied (.+) filter with (.+) layout!$/);
  if (mDarkroom) {
    const fltMap: Record<string, Partial<Record<SupportedLocale, string>>> = {
      'X-Ray': { es: 'Rayos X', pt: 'Raio-X', fr: 'Rayons X', de: 'Röntgen', id: 'X-Ray', ja: 'X線', zh: 'X光', hi: 'एक्स-रे', bn: 'এক্স-রে', ur: 'ایکس رے', ar: 'أشعة إكس', ru: 'Рентген', tlh: 'X-Ray' },
      'Noir Grayscale': { es: 'Noir Blanco y Negro', pt: 'Noir Preto e Branco', fr: 'Noir & Blanc', de: 'Noir-Graustufen', id: 'Hitam-Putih Noir', ja: 'ノワール白黒', zh: '黑色电影黑白', hi: 'नोयर ब्लैक एंड व्हाइट', bn: 'নয়ার সাদাকালো', ur: 'نوئر بلیک اینڈ وائٹ', ar: 'نوار أبيض وأسود', ru: 'Нуар Ч/Б', tlh: 'Noir qIj/chIS' },
      'Cyanotype': { es: 'Cianotipia', pt: 'Cianotipia', fr: 'Cyanotype', de: 'Cyanotypie', id: 'Sianotipe', ja: '青写真(サイアノタイプ)', zh: '蓝晒', hi: 'सायनोटाइप', bn: 'সায়ানোটাইপ', ur: 'سیانوٹائپ', ar: 'سيانوتايب', ru: 'Цианотипия', tlh: 'SuD Cyanotype' },
      'Kodachrome': { es: 'Kodachrome', pt: 'Kodachrome', fr: 'Kodachrome', de: 'Kodachrome', id: 'Kodachrome', ja: 'コダクローム', zh: '柯达克罗姆', hi: 'कोडाक्रोम', bn: 'কোডাক্রোম', ur: 'کوڈاکروم', ar: 'كوداكروم', ru: 'Kodachrome', tlh: 'Kodachrome' },
    };
    const fitMap: Record<string, Partial<Record<SupportedLocale, string>>> = {
      'Cinematic Blur': { es: 'Desenfoque de Cine', pt: 'Desfoque de Cinema', fr: 'Flou Cinéma', de: 'Kino-Unschärfe', id: 'Blur Sinematik', ja: 'シネマぼかし', zh: '电影模糊背景', hi: 'सिनेमैटिक ब्लर', bn: 'সিনেমাটিক ব্লার', ur: 'سنیما بلر', ar: 'تمويه سينمائي', ru: 'Кино-размытие', tlh: 'Blur' },
      'Triptych Split': { es: 'Tríptico', pt: 'Tríptico', fr: 'Triptyque', de: 'Triptychon', id: 'Triptych Tiga Panel', ja: '三連トリプティック', zh: '三联画对称', hi: 'ट्रिप्टिक स्प्लिट', bn: 'ট্রিপটিক স্প্লিট', ur: 'ٹرپٹک اسپلٹ', ar: 'ثلاثية متناظرة', ru: 'Триптих', tlh: 'wej-ay' },
      'Classic Crop': { es: 'Recorte Clásico', pt: 'Corte Clássico', fr: 'Carré Classique', de: 'Klassischer Zuschnitt', id: 'Potong Klasik', ja: 'クラシック正方形', zh: '经典居中裁切', hi: 'क्लासिक क्रॉप', bn: 'ক্লাসিক ক্রপ', ur: 'کلاسک کراپ', ar: 'قص كلاسيكي', ru: 'Классический квадрат', tlh: 'Crop' },
    };
    const flt = fltMap[mDarkroom[1]]?.[lang] || mDarkroom[1];
    const fit = fitMap[mDarkroom[2]]?.[lang] || mDarkroom[2];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `¡Filtro ${flt} aplicado con encuadre ${fit}!`,
      pt: `Filtro ${flt} aplicado com enquadramento ${fit}!`,
      fr: `Filtre ${flt} appliqué avec cadrage ${fit} !`,
      de: `${flt}-Filter mit ${fit}-Layout angewendet!`,
      id: `Filter ${flt} diterapkan dengan tata letak ${fit}!`,
      ja: `${flt}フィルター（${fit}レイアウト）を適用しました！`,
      zh: `已应用 ${flt} 滤镜与 ${fit} 构图！`,
      hi: `${fit} लेआउट के साथ ${flt} फ़िल्टर लगाया गया!`,
      bn: `${fit} লেআউট সহ ${flt} ফিল্টার প্রয়োগ করা হয়েছে!`,
      ur: `${fit} لے آؤٹ کے ساتھ ${flt} فلٹر لگایا گیا!`,
      ar: `تم تطبيق فلتر ${flt} مع تخطيط ${fit}!`,
      ru: `Применён фильтр ${flt} (макет: ${fit})!`,
      tlh: `${flt} / ${fit} lo'ta'!`,
    };
    return map[lang] || null;
  }


  // 14. Dynamic Toast: "Harvested <N> novel word(s) ... into generator rotation!"
  const mHarv = text.match(/^Harvested (\d+) novel words?(?: \+ 1 (subject|backdrop))? into generator rotation!$/);
  if (mHarv) {
    const n = mHarv[1];
    const hasImg = Boolean(mHarv[2]);
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `¡${n} palabra(s) nueva(s)${hasImg ? ' + 1 imagen' : ''} añadida(s) a la rotación del generador!`,
      pt: `${n} palavra(s) nova(s)${hasImg ? ' + 1 imagem' : ''} adicionada(s) à rotação do gerador!`,
      fr: `${n} nouveau(x) mot(s)${hasImg ? ' + 1 image' : ''} ajouté(s) à la rotation du générateur !`,
      de: `${n} neue(s) Wort/Wörter${hasImg ? ' + 1 Bild' : ''} in die Generator-Rotation aufgenommen!`,
      id: `${n} kata baru${hasImg ? ' + 1 gambar' : ''} ditambahkan ke rotasi generator!`,
      ja: `${n}個の新出単語${hasImg ? '＋画像1枚' : ''}をジェネレーターのローテーションに追加しました！`,
      zh: `已将 ${n} 个新词汇${hasImg ? ' + 1 张图片' : ''}加入生成器轮换池！`,
      hi: `${n} नए शब्द${hasImg ? ' + 1 इमेज' : ''} जनरेटर रोटेशन में जोड़े गए!`,
      bn: `${n}টি নতুন শব্দ${hasImg ? ' + ১টি ছবি' : ''} জেনারেটর রোটেশনে যোগ করা হয়েছে!`,
      ur: `${n} نئے الفاظ${hasImg ? ' + 1 تصویر' : ''} جنریٹر روٹیشن میں شامل!`,
      ar: `تمت إضافة ${n} كلمة جديدة${hasImg ? ' + صورة واحدة' : ''} إلى دورة المولد!`,
      ru: `Добавлено в ротацию генератора: ${n} сл.${hasImg ? ' + 1 арт' : ''}!`,
      tlh: `${n} mu' chu'${hasImg ? ' + 1 mIllogh' : ''} GeneratorDaq chellu'ta'!`,
    };
    return map[lang] || null;
  }


  // 15. Dynamic Confirm: 'Discard "..." from your archive?'
  const mDisc = text.match(/^Discard "(.+)" from your archive\?$/);
  if (mDisc) {
    const b = mDisc[1];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `¿Descartar «${b}» de tu archivo?`,
      pt: `Descartar “${b}” do seu arquivo?`,
      fr: `Retirer « ${b} » de votre archive ?`,
      de: `„${b}“ aus deinem Archiv entfernen?`,
      id: `Hapus “${b}” dari arsip Anda?`,
      ja: `「${b}」を保管庫から削除しますか？`,
      zh: `确定从档案库中移除“${b}”吗？`,
      hi: `क्या आप अपने पुरालेख से “${b}” को हटाना चाहते हैं?`,
      bn: `আপনার আর্কাইভ থেকে “${b}” সরিয়ে ফেলবেন?`,
      ur: `کیا آپ اپنے آرکائیو سے “${b}” کو ہٹانا چاہتے ہیں؟`,
      ar: `هل تريد إزالة «${b}» من أرشيفك؟`,
      ru: `Удалить «${b}» из вашего архива?`,
      tlh: `memvo' «${b}» teq'a'?`,
    };
    return map[lang] || null;
  }

  // 16. Dynamic Toast: '🌐 Translated (XX): ...'
  const mTrToast = text.match(/^🌐 Translated \(([A-Z]+)\): (.+)$/);
  if (mTrToast) {
    const badge = mTrToast[1];
    const rest = mTrToast[2];
    const map: Partial<Record<SupportedLocale, string>> = {
      es: `🌐 Copia traducida (${badge}): ${rest}`,
      pt: `🌐 Cópia traduzida (${badge}): ${rest}`,
      fr: `🌐 Copie traduite (${badge}) : ${rest}`,
      de: `🌐 Übersetzte Kopie (${badge}): ${rest}`,
      id: `🌐 Salinan diterjemahkan (${badge}): ${rest}`,
      ja: `🌐 翻訳複製 (${badge}): ${rest}`,
      zh: `🌐 已复制并翻译 (${badge}): ${rest}`,
      hi: `🌐 अनूदित प्रति (${badge}): ${rest}`,
      bn: `🌐 অনূদিত কপি (${badge}): ${rest}`,
      ur: `🌐 ترجمہ شدہ کاپی (${badge}): ${rest}`,
      ar: `🌐 نسخة مترجمة (${badge}): ${rest}`,
      ru: `🌐 Переведённая копия (${badge}): ${rest}`,
      tlh: `🌐 mughta' (${badge}): ${rest}`,
    };
    return map[lang] || null;
  }

  return null;
}

const EXTRA_PHRASES: Record<string, Partial<Record<SupportedLocale, string>>> = {
  "Copy & Translate": { fr: "Copier & Traduire", de: "Kopieren & Übersetzen", id: "Salin & Terjemahkan", bn: "কপি ও অনুবাদ করুন", ur: "کاپی اور ترجمہ کریں", ar: "نسخ وترجمة", tlh: "lIl & mugh" },
  "Photo loaded. Click [Darkroom Filter] repeatedly to cycle variations, or [Use Photo (As-Is)].": { es: "Foto cargada. Pulsa [Filtro Cuarto Oscuro] para alternar estilos o [Usar Foto (Original)].", pt: "Foto carregada. Clique em [Filtro Câmara Escura] para alternar estilos ou [Usar Foto (Original)].", fr: "Photo chargée. Cliquez sur [Filtre Chambre Noire] pour varier les styles ou [Photo Originale].", de: "Foto geladen. Klicke mehrfach auf [Dunkelkammer-Filter] oder wähle [Originalfoto Nutzen].", id: "Foto dimuat. Klik [Filter Kamar Gelap] berulang kali atau [Gunakan Foto Asli].", ja: "写真を読み込みました。[暗室フィルター]でスタイル切替、または[そのまま使用]を選択してください。", zh: "照片已加载。重复点击[暗房滤镜]切换风格，或点击[使用原图]。", hi: "फ़ोटो लोड हो गई। शैली बदलने के लिए [डार्करूम फ़िल्टर] दबाएँ या [मूल फ़ोटो लगाएँ] चुनें।", bn: "ছবি লোড হয়েছে। স্টাইল বদলাতে [ডার্করুম ফিল্টার] চাপুন অথবা [আসল ছবি ব্যবহার করুন]।", ur: "تصویر لوڈ ہو گئی۔ انداز بدلنے کے لیے [ڈارک روم فلٹر] دبائیں یا [اصل تصویر لگائیں]۔", ar: "تم تحميل الصورة. اضغط [فلتر الغرفة المظلمة] لتبديل الأنماط أو [استخدم الصورة كما هي].", ru: "Фото загружено. Нажимайте [Фотофильтр] для смены стилей или [Без Фильтра].", tlh: "mIllogh lInglu'ta'. [Hurgh Filter] pagh [mIllogh lo'] yI'uy." },
  "App and installed Cargo Bay packs are up to date.": { es: "La aplicación y los paquetes instalados están al día.", pt: "O aplicativo e os pacotes instalados estão atualizados.", fr: "L'application et les packs installés sont à jour.", de: "App und installierte Frachtraum-Pakete sind auf dem neuesten Stand.", id: "Aplikasi dan paket Ruang Kargo sudah versi terbaru.", ja: "アプリと導入済みパックはすべて最新です。", zh: "应用与已安装的货舱扩展包均为最新版本。", hi: "ऐप और इंस्टॉल किए गए पैक पूरी तरह अपडेट हैं।", bn: "অ্যাপ এবং ইনস্টল করা প্যাকগুলো আপ-টু-ডেট আছে।", ur: "ایپ اور انسٹال کردہ پیکس بالکل اپ ٹو ڈیٹ ہیں۔", ar: "التطبيق والحزم المثبتة محدثة بالكامل.", ru: "Приложение и установленные пакеты обновлены.", tlh: "App Packmey je chu'choH." },
  "Offline — internet connection required to check for updates.": { es: "Sin conexión — se requiere internet para buscar actualizaciones.", pt: "Offline — conexão com a internet necessária para verificar atualizações.", fr: "Hors-ligne — connexion internet requise pour vérifier les mises à jour.", de: "Offline — Internetverbindung zum Prüfen auf Updates erforderlich.", id: "Offline — koneksi internet diperlukan untuk memeriksa pembaruan.", ja: "オフライン — 更新の確認にはインターネット接続が必要です。", zh: "当前离线 — 检查更新需要互联网连接。", hi: "ऑफ़लाइन — अपडेट जांचने के लिए इंटरनेट कनेक्शन आवश्यक है।", bn: "অफलाइन — আপডেট চেক করতে ইন্টারনেট সংযোগ প্রয়োজন।", ur: "آف لائن — اپ ڈیٹس چیک کرنے کے لیے انٹرنیٹ درکار ہے۔", ar: "غير متصل — يلزم الاتصال بالإنترنت للتحقق من التحديثات.", ru: "Офлайн — для проверки обновлений требуется интернет.", tlh: "De'wI'Qo' — chu'moH nejmeH Internet poQlu'." },
  "Deck mounted for offline standalone use!": { es: "¡Receptor instalado para uso autónomo sin conexión!", pt: "Vitrola instalada para uso autônomo offline!", fr: "Platine installée pour une utilisation autonome hors-ligne !", de: "Deck für eigenständige Offline-Nutzung installiert!", id: "Dek terpasang untuk penggunaan mandiri offline!", ja: "オフライン専用モードとしてデッキを設置しました！", zh: "唱机已安装，可随时独立离线使用！", hi: "ऑफ़लाइन उपयोग के लिए डेक इंस्टॉल हो गया!", bn: "অফলাইন ব্যবহারের জন্য ডেক ইনস্টল হয়েছে!", ur: "آف لائن استعمال کے لیے ڈیک انسٹال ہو گیا!", ar: "تم تثبيت الجهاز للعمل المستقل بدون إنترنت!", ru: "Дека установлена для автономной работы офлайн!", tlh: "De'wI'Qo' ModeDaq Deck jomlu'ta'!" },
  "Viewing Today's latest pressing.": { es: "Viendo la última edición de hoy.", pt: "Visualizando a prensagem mais recente de hoje.", fr: "Affichage du dernier pressage d'aujourd'hui.", de: "Zeige die neueste Pressung von heute.", id: "Menampilkan cetakan terbaru hari ini.", ja: "本日の最新プレス盤を表示しています。", zh: "正在查看今日最新压制的唱片。", hi: "आज का नवीनतम रिकॉर्ड देखा जा रहा है।", bn: "আজকের সর্বশেষ রেকর্ডটি দেখানো হচ্ছে।", ur: "آج کا تازہ ترین ریکارڈ دکھایا جا رہا ہے۔", ar: "عرض أحدث اسطوانة لليوم.", ru: "Просмотр сегодняшней пластинки.", tlh: "DaHjaj QoQ chu' leghlu'." },
  "Canonical '77": { fr: "Canonique '77", de: "Kanonisch '77", id: "Kanonik '77", bn: "ক্যাননিক্যাল '৭৭", ur: "کینونیکل '77", ar: "جولة 77", tlh: "'77 leng" },
  "Municipal Lore": { fr: "Circuit Municipal", de: "Kommunal-Tour", id: "Sirkuit Kota", bn: "পৌর সার্কিট", ur: "بلدیاتی سرکٹ", ar: "الجولة البلدية", tlh: "yoS leng" },
  "Chrono-Orbital": { fr: "Chrono-Orbital", de: "Chrono-Orbital", id: "Krono-Orbital", bn: "ক্রোনো-অরবিটাল", ur: "کرونو آربیٹل", ar: "الجولة المدارية", tlh: "bavwI' leng" },
  "FIELD GUIDE v1.2": { fr: "GUIDE PRATIQUE v1.2", de: "HANDBUCH v1.2", id: "PANDUAN v1.2", bn: "ফিল্ড গাইড v1.2", ur: "فیلڈ گائیڈ v1.2", ar: "دليل الاستخدام v1.2", tlh: "LO' PAQ v1.2" },
  "DATA SHEET v1.2": { fr: "FICHE TECHNIQUE v1.2", de: "DATENBLATT v1.2", id: "LEMBAR DATA v1.2", bn: "ডেটা শিট v1.2", ur: "ڈیٹا شیٹ v1.2", ar: "ورقة البيانات v1.2", tlh: "JAN DE' v1.2" },
  "Novel Words Detected (": { fr: "Nouveaux Mots Détectés (", de: "Neue Wörter Erkannt (", id: "Kata Baru Terdeteksi (", bn: "নতুন শব্দ পাওয়া গেছে (", ur: "نئے الفاظ ملے (", ar: "كلمات جديدة مكتشفة (", tlh: "mu' chu' (" },
  "existing skipped": { fr: "existants ignorés", de: "vorhandene übersprungen", id: "sudah ada dilewati", bn: "বিদ্যমান শব্দ বাদ", ur: "موجودہ الفاظ چھوڑے گئے", ar: "موجودة تم تخطيها", tlh: "ngo' juSlu'" },
  "Allow “": { es: "Permitir que «", pt: "Permitir que “", fr: "Autoriser « ", de: "Erlaube „", id: "Izinkan “", ja: "「", zh: "允许“", hi: "भविष्य के ड्रॉप में “", bn: "ভবিষ্যতের ড্রপে “", ur: "مستقبل کے ڈراپس میں “", ar: "السماح لفرقة «", ru: "Разрешить группе «", tlh: "«" },
  "” to drop follow-up albums in future rolls": { es: "» lance álbumes adicionales en futuros sorteos", pt: "” lance novos álbuns em sorteios futuros", fr: " » à sortir d'autres albums lors de futurs tirages", de: "“, bei künftigen Ziehungen weitere Alben zu veröffentlichen", id: "” merilis album lanjutan di undian mendatang", ja: "」が今後のドロップで続編アルバムを出すことを許可", zh: "”在未来的随机掉落中发行续作专辑", hi: "” को नए एल्बम जारी करने की अनुमति दें", bn: "”-কে পরবর্তী অ্যালবাম প্রকাশের অনুমতি দিন", ur: "” کو نئے البمز جاری کرنے کی اجازت دیں", ar: "» بإصدار ألبومات لاحقة في السحوبات القادمة", ru: "» выпускать новые альбомы в будущем", tlh: "» QoQ chu' lIngmeH chaw'" },
  "Front View": { fr: "Vue Recto", de: "Vorderseite", id: "Tampak Depan", bn: "সামনের দৃশ্য", ur: "سامنے کا منظر", ar: "الوجه الأمامي", tlh: "bI'reS" },
  "Back Notes": { fr: "Notes Verso", de: "Rückseite", id: "Catatan Belakang", bn: "পিছনের নোটস", ur: "پچھلے نوٹس", ar: "الوجه الخلفي", tlh: "'em De'" },
  "Drag to pan • Use Front View / Back Notes button above to flip": { fr: "Glissez pour déplacer • Utilisez le bouton ci-dessus pour retourner", de: "Ziehen zum Verschieben • Oben zwischen Vorder-/Rückseite wechseln", id: "Geser untuk melihat • Gunakan tombol di atas untuk membalik", bn: "সরাতে ড্র্যাগ করুন • উল্টাতে উপরের বাটন ব্যবহার করুন", ur: "کھینچ کر دیکھیں • پلٹنے کے لیے اوپر والا بٹن دبائیں", ar: "اسحب للتحريك • استخدم الزر بالأعلى لقلب الغلاف", tlh: "yISuD • choHmeH Dung leQ yIlo'" },
  "Tap preset (150%, 200%) or +/- to inspect artwork and liner notes": { fr: "Touchez 150 %, 200 % ou +/- pour inspecter la pochette et les notes", de: "Tippe auf 150%, 200% oder +/- zum Vergrößern von Cover und Notizen", id: "Ketuk 150%, 200% atau +/- untuk memeriksa sampul dan catatan", bn: "আর্টওয়ার্ক ও নোটস বড় করে দেখতে ১৫০%, ২০০% বা +/- চাপুন", ur: "آرٹ ورک اور نوٹس دیکھنے کے لیے 150%، 200% یا +/- دبائیں", ar: "اضغط 150% أو 200% أو +/- لتكبير الغلاف والملاحظات", tlh: "150%, 200% pagh +/- yI'uy" },
  "Welcome to Y.D.R.B.N.": { fr: "Bienvenue sur Y.D.R.B.N.", de: "Willkommen bei Y.D.R.B.N.", id: "Selamat Datang di Y.D.R.B.N.", bn: "Y.D.R.B.N.-এ স্বাগতম", ur: "Y.D.R.B.N. میں خوش آمدید", ar: "مرحباً بك في Y.D.R.B.N.", tlh: "Y.D.R.B.N.Daq yIel" },
  "Your Daily Random Band Name is a 100% offline-capable band name, vinyl sleeve, and synth audio generator. When online, you can optionally check Settings for new app builds or Cargo Bay content packs.": { fr: "Your Daily Random Band Name est un générateur de groupes, de pochettes vinyles et d'audio synthétisé 100 % hors-ligne. En ligne, vous pouvez vérifier les mises à jour dans les Paramètres.", de: "Your Daily Random Band Name ist ein 100 % offline-fähiger Bandnamen-, Vinyl-Cover- und Synth-Audio-Generator. Online kannst du in den Einstellungen nach Updates oder Paketen suchen.", id: "Your Daily Random Band Name adalah generator nama band, sampul vinil, dan audio synth 100% offline. Saat online, Anda dapat memeriksa pembaruan di Pengaturan.", bn: "Your Daily Random Band Name হলো ১০০% অফলাইনে চলা ব্যান্ড নাম, ভিনাইল কভার এবং সিন্থ অডিও জেনারেটর। অনলাইনে থাকলে সেটিংস থেকে আপডেট ও প্যাক চেক করতে পারেন।", ur: "Your Daily Random Band Name ایک 100% آف لائن بینڈ نام، وینائل کور اور سنتھ آڈیو جنریٹر ہے۔ آن لائن ہونے پر آپ سیٹنگز میں اپ ڈیٹس چیک کر سکتے ہیں۔", ar: "تطبيق Y.D.R.B.N. هو مولد أسماء فرق وأغلفة فينيل وصوتيات يعمل 100% بدون إنترنت. عند الاتصال يمكنك التحقق من التحديثات في الإعدادات.", tlh: "100% De'wI'Qo' ghom pong, QoQ Dech, wab je chenmoHwI' 'oH Y.D.R.B.N.'e'." },
  "Watch Functionality Walkthrough": { fr: "Voir la Vidéo de Démonstration", de: "Funktions-Walkthrough Ansehen", id: "Tonton Video Panduan Fungsi", bn: "ফাংশন ওয়াকথ্রু ভিডিও দেখুন", ur: "فنکشن واک تھرو ویڈیو دیکھیں", ar: "مشاهدة فيديو شرح الميزات", tlh: "mIw HaSta yIlegh" },
  "Walkthrough // Functionality Guide": { fr: "Démonstration // Guide des Fonctions", de: "Walkthrough // Funktionshandbuch", id: "Panduan Video // Fitur Dek", bn: "ওয়াকথ্রু // ফাংশন গাইড", ur: "واک تھرو // فنکشن گائیڈ", ar: "جولة مرئية // دليل الميزات", tlh: "HaSta // lo' paq" },
  "Top Bar Faceplate Key": { fr: "Clé des Commandes Supérieures", de: "Bedienfeld-Legende (Oben)", id: "Kunci Tombol Baris Atas", bn: "টপ বার বাটন পরিচিতি", ur: "ٹاپ بار بٹن کلید", ar: "مفتاح أزرار الشريط العلوي", tlh: "Dung SeHlaw leQmey" },
  "Tap to Open": { fr: "Toucher pour Ouvrir", de: "Tippen zum Öffnen", id: "Ketuk untuk Buka", bn: "খুলতে ট্যাপ করুন", ur: "کھولنے کے لیے ٹیپ کریں", ar: "اضغط للفتح", tlh: "poSmoHmeH yI'uy" },
  "Archive:": { fr: "Archive :", de: "Archiv:", id: "Arsip:", bn: "আর্কাইভ:", ur: "آرکائیو:", ar: "الأرشيف:", tlh: "mem:" },
  "14-slot record crate & Auto-Spin radio": { fr: "Caisse de 14 disques & radio Auto-Lecture", de: "14-Plätze-Plattenkiste & Auto-Radio", id: "Kotak 14 piringan & radio Putar-Otomatis", bn: "১৪-স্লট রেকর্ড ক্রেট ও অটো-স্পিন রেডিও", ur: "14-سلاٹ ریکارڈ کریٹ اور آٹو اسپن ریڈیو", ar: "صندوق بـ 14 خانة وراديو تشغيل تلقائي", tlh: "14-QoQ ngaSwI' & Auto-Spin" },
  "Install:": { fr: "Installer :", de: "Installieren:", id: "Instal:", bn: "ইনস্টল:", ur: "انسٹال:", ar: "تثبيت:", tlh: "jom:" },
  "Mount app to home screen for offline use": { fr: "Ajouter à l'écran d'accueil pour usage hors-ligne", de: "Für Offline-Nutzung zum Startbildschirm hinzufügen", id: "Pasang ke layar utama untuk mode offline", bn: "অফলাইন ব্যবহারের জন্য হোম স্ক্রিনে যুক্ত করুন", ur: "آف لائن استعمال کے لیے ہوم اسکرین پر لگائیں", ar: "تثبيت التطبيق على الشاشة الرئيسية للعمل بدون إنترنت", tlh: "De'wI'Qo' lo'meH jIHlIjDaq yIjom" },
  "Today:": { fr: "Aujourd'hui :", de: "Heute:", id: "Hari Ini:", bn: "আজ:", ur: "آج:", ar: "اليوم:", tlh: "DaHjaj:" },
  "Jump straight to your latest pressing": { fr: "Aller directement à votre dernier pressage", de: "Direkt zur neuesten Pressung springen", id: "Lompat langsung ke cetakan terbaru Anda", bn: "সরাসরি আপনার সর্বশেষ রেকর্ডে যান", ur: "براہِ راست اپنے تازہ ترین ریکارڈ پر جائیں", ar: "الانتقال مباشرة إلى أحدث اسطوانة", tlh: "QoQ chu'Daq yISup" },
  "Favorite:": { fr: "Favori :", de: "Favorit:", id: "Favorit:", bn: "পছন্দ:", ur: "پسندیدہ:", ar: "مفضلة:", tlh: "parHa':" },
  "Protect a pressing from crate rotation": { fr: "Protéger un disque de la rotation de la caisse", de: "Platte vor dem Herausrotieren schützen", id: "Lindungi piringan agar tidak terganti otomatis", bn: "ক্রেট রোটেশন থেকে রেকর্ড সুরক্ষিত রাখুন", ur: "ریکارڈ کو کریٹ روٹیشن سے محفوظ رکھیں", ar: "حماية الاسطوانة من الاستبدال التلقائي", tlh: "QoQ poltaH" },
  "Share:": { fr: "Partager :", de: "Teilen:", id: "Bagikan:", bn: "শেয়ার:", ur: "شیئر:", ar: "مشاركة:", tlh: "ngeH:" },
  "Export JPEGs, text, or a 1-tap DNA clone link": { fr: "Exporter JPEG, texte ou lien de clonage ADN en 1 clic", de: "JPEGs, Text oder 1-Klick-DNA-Klon-Link teilen", id: "Ekspor JPEG, teks, atau tautan klon DNA 1-ketuk", bn: "JPEG, টেক্সট বা ১-ট্যাপ DNA ক্লোন লিঙ্ক শেয়ার করুন", ur: "JPEG، ٹیکسٹ یا 1-ٹیپ DNA کلون لنک شیئر کریں", ar: "تصدير صور JPEG أو نص أو رابط استنساخ DNA الفوري", tlh: "JPEG, ghItlh pagh DNA Link ngeH" },
  "Apparel:": { fr: "Textile :", de: "Textildruck:", id: "Kaos:", bn: "অ্যাপারেল:", ur: "ملبوسات:", ar: "الملابس:", tlh: "Sut:" },
  "300 DPI t-shirt chest & tour-back PNGs": { fr: "PNG 300 DPI poitrine & dos de tournée pour t-shirt", de: "300 DPI T-Shirt-Brust- & Tour-Rücken-PNGs", id: "PNG 300 DPI dada & jadwal tur belakang kaos", bn: "৩০০ DPI টি-শার্টের সামনের ও পিছনের ট্যুর PNG", ur: "300 DPI ٹی شرٹ فرنٹ اور بیک ٹور PNGs", ar: "ملفات PNG بدقة 300 DPI لصدر وظهر القميص", tlh: "300 DPI Sut bI'reS 'em je PNG" },
  "⚡ Daily Drop & Sleeve Gestures": { fr: "⚡ Tirage du Jour & Gestes sur la Pochette", de: "⚡ Tages-Pressung & Cover-Gesten", id: "⚡ Rilisan Harian & Gestur Sampul", bn: "⚡ ডেইলি ড্রপ ও কভার জেসচার", ur: "⚡ ڈیلی ڈراپ اور کور اشارے", ar: "⚡ إصدار اليوم وإيماءات الغلاف", tlh: "⚡ DaHjaj QoQ & Dech mIwmey" },
  "Swap Cover Art & Custom Drops": { fr: "Changer la Pochette & Disques sur Mesure", de: "Cover Tauschen & Eigene Pressungen", id: "Ganti Sampul & Rilisan Kustom", bn: "কভার আর্ট পরিবর্তন ও কাস্টম ড্রপ", ur: "کور آرٹ کی تبدیلی اور کسٹم ڈراپس", ar: "تبديل الغلاف والإصدارات المخصصة", tlh: "Dech choH & QoQ chu'" },
  "Cargo Bay & Director's Chair": { fr: "La Soute & Fauteuil du Réalisateur", de: "Frachtraum & Regiestuhl", id: "Ruang Kargo & Kursi Sutradara", bn: "কার্গো বে ও ডিরেক্টরস চেয়ার", ur: "کارگو بے اور ڈائریکٹرز چیئر", ar: "عنبر الشحن وكرسي المخرج", tlh: "tep Duj & ra'wI' quS" },
  "Tap the footer gear icon to install expansion packs, author custom crates in The Crate Forge, or isolate custom pools.": { fr: "Touchez l'engrenage en bas pour installer des packs, créer vos propres caisses dans La Forge ou isoler les banques de mots.", de: "Tippe unten auf das Zahnrad, um Erweiterungspakete zu installieren, eigene Kisten zu schmieden oder Generator-Pools zu steuern.", id: "Ketuk ikon roda gigi di bawah untuk memasang paket ekspansi, membuat kotak di Tempaan Kotak, atau mengatur kumpulan kata.", bn: "এক্সপ্যানশন প্যাক ইনস্টল করতে বা ক্রেট ফোর্জে নিজস্ব প্যাক তৈরি করতে নিচের গিয়ার আইকনে ট্যাপ করুন।", ur: "ایکسپینشن پیکس انسٹال کرنے یا کریٹ فورج میں اپنے پیک بنانے کے لیے نیچے گیئر آئیکن پر ٹیپ کریں۔", ar: "اضغط على أيقونة الترس بالأسفل لتثبيت الحزم الإضافية أو إنشاء صناديقك الخاصة في المسبك.", tlh: "bIngDaq Gear Icon yI'uy 'ej Pack chu' yIjom." },
  "Cache Refresh & Reset": { fr: "Actualiser le Cache & Réinitialiser", de: "Cache Aktualisieren & Reset", id: "Segarkan Cache & Reset", bn: "ক্যাশে রিফ্রেশ ও রিসেট", ur: "کیش ریفریش اور ری سیٹ", ar: "تحديث التخزين المؤقت وإعادة الضبط", tlh: "Cache chu'moH & Reset" },
  "Refresh app code safely (keeping your crate) or run a factory wipe in Settings.": { fr: "Actualisez le code en toute sécurité (en gardant votre caisse) ou réinitialisez tout dans les Paramètres.", de: "App-Cache sicher aktualisieren (Kiste bleibt erhalten) oder Werksreset in den Einstellungen ausführen.", id: "Segarkan kode aplikasi dengan aman (menyimpan kotak Anda) atau jalankan hapus pabrik di Pengaturan.", bn: "আপনার ক্রেট অক্ষত রেখে নিরাপদে অ্যাপ রিফ্রেশ করুন অথবা সেটিংসে ফ্যাক্টরি রিসেট করুন।", ur: "اپنا کریٹ محفوظ رکھتے ہوئے ایپ کوڈ ریفریش کریں یا سیٹنگز میں فیکٹری ری سیٹ کریں۔", ar: "قم بتحديث كود التطبيق بأمان (مع الاحتفاظ بصندوقك) أو نفذ مسح المصنع في الإعدادات.", tlh: "ngaSwI'lIj poltaHvIS App yIchu'moH pagh Factory Wipe yIlo'." },
  "Open →": { fr: "Ouvrir →", de: "Öffnen →", id: "Buka →", bn: "খুলুন →", ur: "کھولیں →", ar: "فتح ←", tlh: "poSmoH →" },
  "100% Client-Side Synthesis Engine": { fr: "Moteur de Synthèse 100 % Local", de: "100 % Clientseitige Synthese-Engine", id: "Mesin Sintesis 100% Lokal di Perangkat", bn: "১০০% ক্লায়েন্ট-সাইড সিন্থেসিস ইঞ্জিন", ur: "100% کلائنٹ سائیڈ سنتھیسس انجن", ar: "محرك توليد محلي 100% على جهازك", tlh: "100% De'wI'lIjDaq Synthesis Engine" },
  "Self-contained HTML5 2D Canvas compositor and Web Audio API synthesizer. Zero cloud servers, accounts, or tracking. Internet connectivity is never required—and is only used if you opt in to check for app or Cargo Bay pack updates in Settings.": { fr: "Compositeur HTML5 Canvas 2D et synthétiseur Web Audio autonomes. Zéro serveur cloud, compte ou pistage. Internet n'est jamais requis.", de: "Eigenständiger HTML5-2D-Canvas-Kompositor und Web-Audio-Synthesizer. Keine Cloud-Server, Konten oder Tracking. Internet wird nie benötigt.", id: "Kompositor HTML5 Canvas 2D dan synthesizer Web Audio mandiri. Tanpa server cloud, akun, atau pelacakan. Internet tidak pernah diperlukan.", bn: "স্বয়ংসম্পূর্ণ HTML5 2D ক্যানভাস এবং ওয়েব অডিও সিন্থেসাইজার। কোনো ক্লাউড সার্ভার, অ্যাকাউন্ট বা ট্র্যাকিং নেই। ইন্টারনেটের প্রয়োজন হয় না।", ur: "خودکار HTML5 2D کینوس اور ویب آڈیو سنتھیسائزر۔ کوئی کلاؤڈ سرور، اکاؤنٹ یا ٹریکنگ نہیں۔ انٹرنیٹ کی کبھی ضرورت نہیں ہوتی۔", ar: "مركب لوحات HTML5 2D ومولد صوتيات Web Audio مستقل بالكامل. بدون خوادم سحابية أو حسابات أو تتبع.", tlh: "HTML5 2D Canvas & Web Audio Engine. Cloud Server pagh Account poQbe'." },
  "On-Device Darkroom & 14-Slot Crate": { fr: "Chambre Noire Locale & Caisse 14 Places", de: "Lokale Dunkelkammer & 14-Plätze-Kiste", id: "Kamar Gelap Lokal & Kotak 14 Slot", bn: "অন-ডিভাইস ডার্করুম ও ১৪-স্লট ক্রেট", ur: "آن ڈیوائس ڈارک روم اور 14-سلاٹ کریٹ", ar: "غرفة مظلمة محلية وصندوق بـ 14 خانة", tlh: "Hurgh Filter & 14-QoQ ngaSwI'" },
  "Uploaded cover photos are processed locally in IndexedDB with 1970s Kodachrome, Cyanotype, Noir, and X-Ray darkroom wear. Your crate preserves up to 14 pressings at a time—tap the Heart icon on any standout record so it never rotates out.": { fr: "Les photos sont traitées localement dans IndexedDB avec des filtres Kodachrome, Cyanotype, Noir et Rayons X. Votre caisse garde jusqu'à 14 disques : touchez le Cœur pour protéger vos favoris.", de: "Hochgeladene Fotos werden lokal in IndexedDB mit 70er-Kodachrome-, Cyanotypie-, Noir- und Röntgen-Filtern entwickelt. Deine Kiste speichert bis zu 14 Platten — schütze Favoriten mit dem Herz-Symbol.", id: "Foto sampul diproses secara lokal di IndexedDB dengan filter Kodachrome, Cyanotype, Noir, dan X-Ray. Kotak Anda menyimpan hingga 14 piringan—ketuk ikon Hati agar piringan favorit tidak terganti.", bn: "আপলোড করা কভার ছবি লোকাল IndexedDB-তে ১৯৭০-এর কোডাক্রোম, সায়ানোটাইপ, নয়ার ও এক্স-রে ফিল্টারে প্রসেস হয়। আপনার ক্রেটে সর্বোচ্চ ১৪টি রেকর্ড থাকে—পছন্দের রেকর্ডে হার্ট চিহ্ন দিয়ে রাখুন।", ur: "اپ لوڈ کردہ تصاویر مقامی طور پر IndexedDB میں 1970 کی دہائی کے کوڈاکروم، سیانوٹائپ، نوئر اور ایکس رے فلٹرز سے پراسیس ہوتی ہیں۔ آپ کا کریٹ 14 ریکارڈز محفوظ رکھتا ہے۔", ar: "تُعالج الصور محلياً في IndexedDB بفلاتر كوداكروم وسيانوتايب ونوار وأشعة إكس. يحفظ صندوقك حتى 14 اسطوانة — اضغط رمز القلب لحماية مفضلاتك.", tlh: "IndexedDBDaq mIllogh choHlu'. 14 QoQ ngaS ngaSwI'lIj — parHa'bogh QoQ yIchoQ." },
  "Temporal Anomalies & Radiator Warp": { fr: "Anomalies Temporelles & Voile de Radiateur", de: "Zeitanomalien & Heizkörper-Verzug", id: "Anomali Temporal & Lengkungan Radiator", bn: "টেম্পোরাল অ্যানোমালি ও রেডিয়েটর ওয়ার্প", ur: "زمانی بے قاعدگیاں اور ریڈی ایٹر وارپ", ar: "الطفرات الزمنية وتموج الفينيل الحراري", tlh: "poHuten & Radiator Warp" },
  "Future-dated pressings trigger a holographic security sash, while bargain-bin G+ and FAIR copies exhibit authentic 0.55 Hz radiator-warp pitch wow on the turntable.": { fr: "Les pressages datés du futur affichent un bandeau holographique, tandis que les copies G+ et FAIR présentent un pleurage authentique de 0,55 Hz sur la platine.", de: "Zukunfts-Pressungen erhalten eine Hologramm-Banderole, während G+- und FAIR-Exemplare ein authentisches 0,55-Hz-Tonhöhenschwanken auf dem Plattenspieler aufweisen.", id: "Cetakan bertanggal masa depan menampilkan pita holografik, sedangkan piringan kondisi G+ dan FAIR menghasilkan ayunan nada 0,55 Hz autentik di turntable.", bn: "ভবিষ্যতের তারিখের রেকর্ডে হলোগ্রাফিক ব্যান্ড থাকে, এবং G+ ও FAIR কপিগুলোতে টার্নটেবিলে ০.৫৫ Hz পিচ ওয়াও ইফেক্ট শোনা যায়।", ur: "مستقبل کی تاریخ والے ریکارڈز پر ہولوگرافک پٹی نمودار ہوتی ہے، جبکہ G+ اور FAIR کاپیوں میں 0.55 Hz پچ واؤ شامل ہوتا ہے۔", ar: "تظهر الاسطوانات المؤرخة في المستقبل بشريط هولوغرافي، بينما تُصدر نسخ G+ وFAIR تموجاً صوتياً بتردد 0.55 هرتز.", tlh: "pIq DIS QoQDaq Hologram Dech leghlu', 'ej G+ / FAIR QoQDaq 0.55 Hz wab choH." },
  "Inspired by the aesthetic of “Random Band Names, Volume One” by Charles Key": { fr: "Inspiré par l'esthétique de « Random Band Names, Volume One » de Charles Key", de: "Inspiriert von der Ästhetik von „Random Band Names, Volume One“ von Charles Key", id: "Terinspirasi oleh estetika “Random Band Names, Volume One” karya Charles Key", bn: "চার্লস কি (Charles Key)-এর “Random Band Names, Volume One”-এর নান্দনিকতা থেকে অনুপ্রাণিত", ur: "چارلس کی (Charles Key) کی کتاب “Random Band Names, Volume One” سے متاثر", ar: "مستوحى من جمالية كتاب «Random Band Names, Volume One» للمؤلف تشارلز كي", tlh: "Charles Key paq «Random Band Names, Volume One» rur" },
  "Subsidize Virtual Turntable Maintenance [donate]": { fr: "Soutenir la Maintenance de la Platine Virtuelle [don]", de: "Wartung des Virtuellen Plattenspielers Unterstützen [Spende]", id: "Dukung Pemeliharaan Turntable Virtual [donasi]", bn: "ভার্চুয়াল টার্নটেবিল রক্ষণাবেক্ষণে সহায়তা করুন [ডোনেট]", ur: "ورچوئل ٹرن ٹیبل کی دیکھ بھال میں تعاون کریں [عطیہ]", ar: "دعم صيانة جهاز الاسطوانات الافتراضي [تبرع]", tlh: "Turntable qa'meH Huch [donate]" },
  "Install Offline Deck": { fr: "Installer la Platine Hors-Ligne", de: "Offline-Deck Installieren", id: "Pasang Dek Offline", bn: "অফলাইন ডেক ইনস্টল করুন", ur: "آف لائن ڈیک انسٹال کریں", ar: "تثبيت الجهاز بدون إنترنت", tlh: "De'wI'Qo' Deck yIjom" },
  "Deck is mounted and operating in standalone offline mode.": { fr: "La platine est installée et fonctionne en mode autonome hors-ligne.", de: "Das Deck ist installiert und läuft im eigenständigen Offline-Modus.", id: "Dek telah terpasang dan beroperasi dalam mode mandiri offline.", bn: "ডেকটি ইনস্টল করা হয়েছে এবং স্ট্যান্ডঅ্যালোন অফলাইন মোডে চলছে।", ur: "ڈیک انسٹال ہے اور اسٹینڈ الون آف لائن موڈ میں کام کر رہا ہے۔", ar: "الجهاز مثبت ويعمل في وضع مستقل بدون إنترنت.", tlh: "Deck jomlu'ta' 'ej De'wI'Qo' ModeDaq QaptaH." },
  "Install Y.D.R.B.N. Now (Android)": { fr: "Installer Y.D.R.B.N. Maintenant (Android)", de: "Y.D.R.B.N. Jetzt Installieren (Android)", id: "Instal Y.D.R.B.N. Sekarang (Android)", bn: "এখনই Y.D.R.B.N. ইনস্টল করুন (Android)", ur: "ابھی Y.D.R.B.N. انسٹال کریں (Android)", ar: "تثبيت Y.D.R.B.N. الآن (أندرويد)", tlh: "DaH Y.D.R.B.N. yIjom (Android)" },
  "Install Y.D.R.B.N. Now (Desktop)": { fr: "Installer Y.D.R.B.N. Maintenant (Bureau)", de: "Y.D.R.B.N. Jetzt Installieren (Desktop)", id: "Instal Y.D.R.B.N. Sekarang (Desktop)", bn: "এখনই Y.D.R.B.N. ইনস্টল করুন (ডেস্কটপ)", ur: "ابھی Y.D.R.B.N. انسٹال کریں (ڈیسک ٹاپ)", ar: "تثبيت Y.D.R.B.N. الآن (سطح المكتب)", tlh: "DaH Y.D.R.B.N. yIjom (Desktop)" },
  "Desktop Browser (Chrome / Edge):": { fr: "Navigateur de Bureau (Chrome / Edge) :", de: "Desktop-Browser (Chrome / Edge):", id: "Browser Desktop (Chrome / Edge):", bn: "ডেস্কটপ ব্রাউজার (Chrome / Edge):", ur: "ڈیسک ٹاپ براؤزر (Chrome / Edge):", ar: "متصفح سطح المكتب (Chrome / Edge):", tlh: "Desktop Browser (Chrome / Edge):" },
  "Manage packs": { fr: "Gérer les packs", de: "Pakete verwalten", id: "Kelola paket", bn: "প্যাক পরিচালনা", ur: "پیکس منظم کریں", ar: "إدارة الحزم", tlh: "Pack SeH" },
  "The Director's Chair": { fr: "Le Fauteuil du Réalisateur", de: "Der Regiestuhl", id: "Kursi Sutradara", bn: "ডিরেক্টরস চেয়ার", ur: "ڈائریکٹرز چیئر", ar: "كرسي المخرج", tlh: "ra'wI' quS" },
  "Pool overrides": { fr: "Banques de génération", de: "Pool-Steuerung", id: "Pengaturan pool", bn: "পুল ওভাররাইড", ur: "پول اوور رائیڈز", ar: "التحكم بالمجموعات", tlh: "Pool SeH" },
  "default": { fr: "défaut", de: "Standard", id: "bawaan", bn: "ডিফল্ট", ur: "ڈیفالٹ", ar: "افتراضي", tlh: "motlh" },
  "Walnut": { fr: "Noyer", de: "Walnuss", id: "Kenari", bn: "ওয়ালনাট", ur: "اخروٹ", ar: "جوزي", tlh: "Sor" },
  "70s Brown/Gold": { fr: "Brun/Or 70s", de: "70er Braun/Gold", id: "Cokelat/Emas 70s", bn: "৭০-এর বাদামী/সোনালী", ur: "70s براؤن/گولڈ", ar: "بني وذهبي 70s", tlh: "70s Doq/SuD" },
  "Dark": { fr: "Sombre", de: "Dunkel", id: "Gelap", bn: "ডার্ক", ur: "ڈارک", ar: "داكن", tlh: "Hurgh" },
  "Obsidian Slate": { fr: "Ardoise Obsidienne", de: "Obsidian-Schiefer", id: "Batu Obsidian", bn: "অবসিডিয়ান স্লেট", ur: "اوبسیڈین سلیٹ", ar: "أردوازي داكن", tlh: "qIj" },
  "Light": { fr: "Clair", de: "Hell", id: "Terang", bn: "লাইট", ur: "لائٹ", ar: "فاتح", tlh: "wov" },
  "Daylight Paper": { fr: "Papier Jour", de: "Tageslicht-Papier", id: "Kertas Siang", bn: "ডেলাইট পেপার", ur: "ڈے لائٹ پیپر", ar: "ورق نهاري", tlh: "chIS" },
  "Contrast": { fr: "Contraste", de: "Kontrast", id: "Kontras", bn: "কনট্রাস্ট", ur: "کنٹراسٹ", ar: "تباين عالٍ", tlh: "pIm" },
  "Hi-Vis Black": { fr: "Noir Haute-Vis", de: "Hochkontrast", id: "Hitam Kontras", bn: "হাই-ভিজ ব্ল্যাক", ur: "ہائی وِز بلیک", ar: "أسود عالي التباين", tlh: "qIj wov" },
  "Online": { fr: "En Ligne", de: "Online", id: "Online", bn: "অনলাইন", ur: "آن لائن", ar: "متصل", tlh: "rar" },
  "Offline": { fr: "Hors-Ligne", de: "Offline", id: "Offline", bn: "অফলাইন", ur: "آف لائن", ar: "غير متصل", tlh: "rarHa'" },
  "Y.D.R.B.N. never requires internet access to run. Enable this option if you want the deck to check for new app versions and Cargo Bay packs when online.": { fr: "Y.D.R.B.N. n'a jamais besoin d'internet pour fonctionner. Activez cette option si vous souhaitez vérifier les nouvelles versions et les packs de la Soute lorsque vous êtes en ligne.", de: "Y.D.R.B.N. benötigt niemals Internet zum Laufen. Aktiviere diese Option, wenn das Deck online nach neuen App-Versionen und Frachtraum-Paketen suchen soll.", id: "Y.D.R.B.N. tidak pernah memerlukan internet untuk berjalan. Aktifkan opsi ini jika Anda ingin dek memeriksa versi baru dan paket Ruang Kargo saat online.", bn: "Y.D.R.B.N. চালানোর জন্য কখনোই ইন্টারনেট লাগে না। অনলাইনে থাকাকালীন নতুন অ্যাপ ভার্সন ও কার্গো বে প্যাক খুঁজতে চাইলে এটি চালু করুন।", ur: "Y.D.R.B.N. کو چلنے کے لیے کبھی انٹرنیٹ کی ضرورت نہیں ہوتی۔ اگر آپ آن لائن ہونے پر نئے ورژن اور پیکس چیک کرنا چاہتے ہیں تو اسے فعال کریں۔", ar: "لا يحتاج Y.D.R.B.N. إلى الإنترنت للعمل أبداً. فعّل هذا الخيار إذا كنت ترغب في التحقق من التحديثات والحزم عند الاتصال.", tlh: "Internet poQbe' Y.D.R.B.N. Online bItaHvIS chu'moH nejmeH DuH yIchu'." },
  "Check for app & pack updates when online": { fr: "Vérifier les mises à jour (app & packs) en ligne", de: "Online nach App- & Paket-Updates suchen", id: "Periksa pembaruan aplikasi & paket saat online", bn: "অনলাইনে থাকলে অ্যাপ ও প্যাক আপডেট খুঁজুন", ur: "آن لائن ہونے پر ایپ اور پیک اپ ڈیٹس چیک کریں", ar: "التحقق من تحديثات التطبيق والحزم عند الاتصال", tlh: "Online bItaHvIS chu'moH yInej" },
  "Check for Updates Now": { fr: "Vérifier les Mises à Jour Maintenant", de: "Jetzt nach Updates Suchen", id: "Periksa Pembaruan Sekarang", bn: "এখনই আপডেট চেক করুন", ur: "ابھی اپ ڈیٹس چیک کریں", ar: "التحقق من التحديثات الآن", tlh: "DaH chu'moH yInej" },
  "Checking...": { fr: "Vérification...", de: "Prüfe...", id: "Memeriksa...", bn: "চেক করা হচ্ছে...", ur: "چیک ہو رہا ہے...", ar: "جارٍ التحقق...", tlh: "nejlu'..." },
  "Offline — Internet Required to Check": { fr: "Hors-Ligne — Internet Requis pour Vérifier", de: "Offline — Internet zum Prüfen Erforderlich", id: "Offline — Perlu Internet untuk Memeriksa", bn: "অফলাইন — চেক করতে ইন্টারনেট প্রয়োজন", ur: "آف لائن — چیک کرنے کے لیے انٹرنیٹ درکار ہے", ar: "غير متصل — يلزم الإنترنت للتحقق", tlh: "De'wI'Qo' — nejmeH Internet poQlu'" },
  "Apply Ready App Update & Reload": { fr: "Appliquer la Mise à Jour & Recharger", de: "Bereites Update Anwenden & Neu Laden", id: "Terapkan Pembaruan & Muat Ulang", bn: "প্রস্তুত আপডেট প্রয়োগ ও রিলোড করুন", ur: "تیار اپ ڈیٹ لاگو کریں اور ری لوڈ کریں", ar: "تطبيق التحديث الجاهز وإعادة التحميل", tlh: "chu'moH yIlo' & Reload" },
  "Offline App Mount": { fr: "Installation Hors-Ligne", de: "Offline-App-Installation", id: "Pemasangan Aplikasi Offline", bn: "অফলাইন অ্যাপ মাউন্ট", ur: "آف لائن ایپ انسٹالیشن", ar: "تثبيت التطبيق بدون إنترنت", tlh: "De'wI'Qo' App jom" },
  "Install to your home screen or desktop": { fr: "Installer sur votre écran d'accueil ou bureau", de: "Auf Startbildschirm oder Desktop installieren", id: "Pasang ke layar utama atau desktop Anda", bn: "আপনার হোম স্ক্রিন বা ডেস্কটপে ইনস্টল করুন", ur: "اپنی ہوم اسکرین یا ڈیسک ٹاپ پر انسٹال کریں", ar: "تثبيت على الشاشة الرئيسية أو سطح المكتب", tlh: "jIHlIjDaq pagh DesktopDaq yIjom" },
  "Mounted in standalone offline mode": { fr: "Installé en mode autonome hors-ligne", de: "Im eigenständigen Offline-Modus installiert", id: "Terpasang dalam mode mandiri offline", bn: "স্ট্যান্ডঅ্যালোন অফলাইন মোডে মাউন্টেড", ur: "اسٹینڈ الون آف لائن موڈ میں نصب", ar: "مثبت في وضع مستقل بدون إنترنت", tlh: "De'wI'Qo' ModeDaq jomlu'ta'" },
  "Install App": { fr: "Installer l'App", de: "App Installieren", id: "Instal Aplikasi", bn: "অ্যাপ ইনস্টল", ur: "ایپ انسٹال کریں", ar: "تثبيت التطبيق", tlh: "App yIjom" },
  "Archival Dispatch": { fr: "Dépêche d'Archive", de: "Archiv-Depesche", id: "Kiriman Arsip", bn: "আর্কাইভাল ডিসপ্যাচ", ur: "آرکائیول ڈسپیچ", ar: "إرسالية الأرشيف", tlh: "mem QIn" },
  "Anonymous word, cutout & bug submissions": { fr: "Envoi anonyme de mots, découpes et bugs", de: "Anonyme Wort-, Motiv- & Bug-Einsendungen", id: "Kirim kata, gambar & laporan bug secara anonim", bn: "বেনামে শব্দ, কাটআউট ও বাগ রিপোর্ট পাঠান", ur: "گمنام الفاظ، کٹ آؤٹ اور بگ تجاویز", ar: "إرسال كلمات وملصقات وبلاغات أخطاء دون هوية", tlh: "pong pagh mu', mIllogh, Bug QIn" },
  "Open": { fr: "Ouvrir", de: "Öffnen", id: "Buka", bn: "খুলুন", ur: "کھولیں", ar: "فتح", tlh: "poSmoH" },
  "1. Refresh App Cache (Safe)": { fr: "1. Actualiser le Cache de l'App (Sûr)", de: "1. App-Cache Aktualisieren (Sicher)", id: "1. Segarkan Cache Aplikasi (Aman)", bn: "১. অ্যাপ ক্যাশে রিফ্রেশ (নিরাপদ)", ur: "1. ایپ کیش ریفریش کریں (محفوظ)", ar: "1. تحديث ذاكرة التطبيق (آمن)", tlh: "1. App Cache chu'moH (Safe)" },
  "Keeps Crate & Packs": { fr: "Garde Caisse & Packs", de: "Behält Kiste & Pakete", id: "Simpan Kotak & Paket", bn: "ক্রেট ও প্যাক অক্ষত রাখে", ur: "کریٹ اور پیکس محفوظ رکھتا ہے", ar: "يحفظ الصندوق والحزم", tlh: "ngaSwI' Pack je pol" },
  "Reloads fresh app code and resets offline worker caches while keeping all saved records, favorites, and Cargo Bay packs intact.": { fr: "Recharge le code le plus récent et réinitialise le cache hors-ligne tout en conservant tous vos disques, favoris et packs de la Soute.", de: "Lädt frischen App-Code und leert den Service-Worker-Cache, während alle gespeicherten Platten, Favoriten und Frachtraum-Pakete erhalten bleiben.", id: "Memuat ulang kode aplikasi terbaru dan mengatur ulang cache offline sambil menjaga semua piringan, favorit, dan paket Ruang Kargo tetap utuh.", bn: "আপনার সব সেভ করা রেকর্ড, ফেভারিট এবং কার্গো বে প্যাক অক্ষত রেখে নতুন অ্যাপ কোড ও অফলাইন ক্যাশে রিলোড করে।", ur: "آپ کے تمام محفوظ ریکارڈز، پسندیدہ اور کارگو بے پیکس کو برقرار رکھتے ہوئے تازہ ایپ کوڈ اور آف لائن کیش کو ری لوڈ کرتا ہے۔", ar: "يعيد تحميل أحدث كود للتطبيق ويمسح ذاكرة الخدمة المؤقتة مع الاحتفاظ بجميع اسطواناتك ومفضلاتك وحزمك.", tlh: "ngaSwI'lIj PackmeylIj je poltaHvIS App ngoq chu' lIng." },
  "Refresh App Cache & Reload": { fr: "Actualiser le Cache & Recharger", de: "Cache Aktualisieren & Neu Laden", id: "Segarkan Cache & Muat Ulang", bn: "ক্যাশে রিফ্রেশ ও রিলোড করুন", ur: "کیش ریفریش اور ری لوڈ کریں", ar: "تحديث الذاكرة المؤقتة وإعادة التحميل", tlh: "Cache chu'moH & Reload" },
  "2. Factory Wipe (Erase All Data)": { fr: "2. Réinitialisation Usine (Tout Effacer)", de: "2. Werksreset (Alle Daten Löschen)", id: "2. Hapus Pabrik (Hapus Semua Data)", bn: "২. ফ্যাক্টরি ওয়াইপ (সব ডেটা মুছুন)", ur: "2. فیکٹری وائپ (تمام ڈیٹا مٹائیں)", ar: "2. مسح المصنع (حذف جميع البيانات)", tlh: "2. Factory Wipe (Hoch De' Qaw')" },
  "Deletes all saved records, favorites, downloaded packs, preferences, and offline caches.": { fr: "Supprime tous les disques enregistrés, favoris, packs téléchargés, préférences et caches hors-ligne.", de: "Löscht alle gespeicherten Platten, Favoriten, heruntergeladenen Pakete, Einstellungen und Offline-Caches.", id: "Menghapus semua piringan tersimpan, favorit, paket unduhan, preferensi, dan cache offline.", bn: "সব সেভ করা রেকর্ড, ফেভারিট, ডাউনলোড করা প্যাক, পছন্দ এবং অফলাইন ক্যাশে মুছে ফেলে।", ur: "تمام محفوظ ریکارڈز، پسندیدہ، ڈاؤن لوڈ کردہ پیکس، ترجیحات اور آف لائن کیش کو حذف کرتا ہے۔", ar: "يحذف جميع الاسطوانات المحفوظة والمفضلة والحزم المحملة والإعدادات والذاكرة المؤقتة.", tlh: "Hoch QoQ, parHa', Packmey, Cache je Qaw'." },
  "Factory Wipe App Data": { fr: "Effacer Toutes les Données de l'App", de: "Alle App-Daten auf Werkseinstellung Zurücksetzen", id: "Hapus Seluruh Data Aplikasi", bn: "সব অ্যাপ ডেটা মুছে ফেলুন", ur: "تمام ایپ ڈیٹا صاف کریں", ar: "مسح جميع بيانات التطبيق", tlh: "App De' Hoch Qaw'" },
  "Erase crate, favorites & packs? Cannot be undone.": { fr: "Effacer caisse, favoris et packs ? Action irréversible.", de: "Kiste, Favoriten & Pakete löschen? Nicht widerrufbar.", id: "Hapus kotak, favorit & paket? Tidak dapat dibatalkan.", bn: "ক্রেট, ফেভারিট ও প্যাক মুছে ফেলবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।", ur: "کریٹ، پسندیدہ اور پیکس مٹائیں؟ یہ واپس نہیں ہو سکتا۔", ar: "مسح الصندوق والمفضلة والحزم؟ لا يمكن التراجع عن ذلك.", tlh: "ngaSwI' Packmey je Qaw''a'?" },
  "Cancel": { fr: "Annuler", de: "Abbrechen", id: "Batal", bn: "বাতিল", ur: "منسوخ", ar: "إلغاء", tlh: "qIl" },
  "Confirm Wipe": { fr: "Confirmer la Suppression", de: "Löschen Bestätigen", id: "Konfirmasi Hapus", bn: "মুছে ফেলা নিশ্চিত করুন", ur: "مٹانے کی تصدیق کریں", ar: "تأكيد المسح", tlh: "Qaw'" },
  "Developer Controls": { fr: "Contrôles Développeur", de: "Entwickler-Steuerung", id: "Kontrol Pengembang", bn: "ডেভেলপার কন্ট্রোল", ur: "ڈیولپر کنٹرولز", ar: "أدوات المطور", tlh: "Developer SeHlaw" },
  "Lock and unlock bypass controls here.": { fr: "Verrouillez et déverrouillez les contrôles de test ici.", de: "Bypass-Steuerung hier sperren und entsperren.", id: "Kunci dan buka kunci kontrol pintasan di sini.", bn: "এখানে বাইপাস কন্ট্রোল লক ও আনলক করুন।", ur: "یہاں بائی پاس کنٹرولز لاک اور ان لاک کریں۔", ar: "قفل وفتح أدوات التجاوز الاختبارية هنا.", tlh: "Bypass SeHlaw naDev yIngaQmoH." },
  "LOCKED": { fr: "VERROUILLÉ", de: "GESPERRT", id: "TERKUNCI", bn: "লকড", ur: "مقفل", ar: "مقفل", tlh: "ngaQ" },
  "UNLOCKED": { fr: "DÉVERROUILLÉ", de: "ENTSPERRT", id: "TERBUKA", bn: "আনলকড", ur: "کھلا ہوا", ar: "مفتوح", tlh: "poS" },
  "Dev Mode (Unlimited Drops)": { fr: "Mode Dev (Tirages Illimités)", de: "Dev-Modus (Unbegrenzte Drops)", id: "Mode Dev (Rilisan Tanpa Batas)", bn: "ডেভ মোড (আনলিমিটেড ড্রপ)", ur: "ڈیو موڈ (لامحدود ڈراپس)", ar: "وضع المطور (إصدارات غير محدودة)", tlh: "Dev Mode (Unlimited)" },
  "Bypasses 24-hour drop countdown.": { fr: "Ignore le compte à rebours de 24 heures.", de: "Umgeht den 24-Stunden-Countdown.", id: "Melewati hitung mundur 24 jam.", bn: "২৪ ঘণ্টার কাউন্টডাউন বাইপাস করে।", ur: "24 گھنٹے کے کاؤنٹ ڈاؤن کو بائی پاس کرتا ہے۔", ar: "يتجاوز العد التنازلي لمدة 24 ساعة.", tlh: "24-rep poH juS." },
  "Open Technician Service Deck": { fr: "Ouvrir le Panneau Technique", de: "Techniker-Servicedeck Öffnen", id: "Buka Dek Layanan Teknisi", bn: "টেকনিশিয়ান সার্ভিস ডেক খুলুন", ur: "ٹیکنیشن سروس ڈیک کھولیں", ar: "فتح لوحة خدمة الفنيين", tlh: "Technician Deck poSmoH" },
  "Asset & Generator Overrides": { fr: "Contrôle des Banques & du Générateur", de: "Asset- & Generator-Steuerung", id: "Pengaturan Aset & Generator", bn: "অ্যাসেট ও জেনারেটর ওভাররাইড", ur: "ایسٹ اور جنریٹر اوور رائیڈز", ar: "التحكم بالأصول ومجموعات المولد", tlh: "Generator Pool SeHlaw" },
  "Fine-tune synthesis pools. Disable default built-in vectors, backgrounds, or stock words to generate albums exclusively from your installed expansion packs.": { fr: "Affinez les banques de synthèse. Désactivez les vecteurs, fonds ou mots intégrés pour générer des albums uniquement à partir de vos packs installés.", de: "Passe die Synthese-Pools an. Deaktiviere Standard-Vektoren, -Hintergründe oder -Wörter, um Alben ausschließlich aus deinen installierten Paketen zu generieren.", id: "Sesuaikan kumpulan sintesis. Nonaktifkan vektor, latar, atau kata bawaan untuk menghasilkan album hanya dari paket ekspansi Anda.", bn: "সিন্থেসিস পুল টিউন করুন। শুধুমাত্র আপনার ইনস্টল করা প্যাক থেকে অ্যালবাম তৈরি করতে ডিফল্ট শব্দ বা ছবি বন্ধ করুন।", ur: "سنتھیسس پولز کو ایڈجسٹ کریں۔ صرف اپنے انسٹال کردہ پیکس سے البم بنانے کے لیے ڈیفالٹ الفاظ یا تصاویر بند کریں۔", ar: "اضبط مجموعات التوليد. عطّل الرسوم أو الخلفيات أو الكلمات الافتراضية لتوليد الألبومات حصرياً من حزمك المثبتة.", tlh: "Generator Pool yISeH. PackmeylIj neH lo'meH motlh mu'mey mIlloghmey je yIQotlh." },
  "Core Word Pools": { fr: "Banques de Mots de Base", de: "Standard-Wortpools", id: "Kumpulan Kata Inti", bn: "মূল শব্দ পুল", ur: "بنیادی الفاظ کا ذخیرہ", ar: "مجموعات الكلمات الأساسية", tlh: "motlh mu' Pool" },
  "Disable default vocabulary to draw names exclusively from installed word packs.": { fr: "Désactivez le vocabulaire par défaut pour tirer les noms uniquement des packs installés.", de: "Deaktiviere das Standardvokabular, um Namen nur aus installierten Wortpaketen zu ziehen.", id: "Nonaktifkan kosakata bawaan untuk mengambil nama hanya dari paket kata terpasang.", bn: "শুধুমাত্র ইনস্টল করা শব্দ প্যাক থেকে নাম নিতে ডিফল্ট শব্দভাণ্ডার বন্ধ করুন।", ur: "صرف انسٹال کردہ لفظ پیکس سے نام لینے کے لیے ڈیفالٹ ذخیرہ الفاظ بند کریں۔", ar: "عطّل المفردات الافتراضية لسحب الأسماء حصرياً من حزم الكلمات المثبتة.", tlh: "Pack mu'mey neH lo'meH motlh mu'mey yIQotlh." },
  "Core Subjects (3D Shapes)": { fr: "Sujets de Base (Formes 3D)", de: "Standard-Motive (3D-Formen)", id: "Subjek Inti (Bentuk 3D)", bn: "মূল সাবজেক্ট (3D আকৃতি)", ur: "بنیادی شکلیں (3D)", ar: "العناصر الأساسية (أشكال ثلاثية الأبعاد)", tlh: "motlh chovnatlh (3D)" },
  "Disable procedural vector drawings to pull exclusively from installed subject cutout packs.": { fr: "Désactivez les dessins vectoriels pour utiliser uniquement les packs de découpes installés.", de: "Deaktiviere Standard-Vektorgrafiken, um nur installierte Motiv-Pakete zu nutzen.", id: "Nonaktifkan gambar vektor bawaan untuk menggunakan paket potongan subjek saja.", bn: "শুধুমাত্র ইনস্টল করা কাটআউট প্যাক ব্যবহার করতে ডিফল্ট ভেক্টর ছবি বন্ধ করুন।", ur: "صرف انسٹال کردہ کٹ آؤٹ پیکس استعمال کرنے کے لیے ڈیفالٹ ویکٹر ڈرائنگز بند کریں۔", ar: "عطّل الرسوم المتجهة الافتراضية لاستخدام حزم الملصقات المثبتة فقط.", tlh: "Pack chovnatlh neH lo'meH motlh Vector yIQotlh." },
  "Core Backdrops & Scenes": { fr: "Fonds & Scènes de Base", de: "Standard-Hintergründe & Szenen", id: "Latar & Adegan Inti", bn: "মূল ব্যাকড্রপ ও দৃশ্য", ur: "بنیادی پس منظر اور مناظر", ar: "الخلفيات والمشاهد الأساسية", tlh: "motlh 'em & Scene" },
  "Disable default canvas scenes to use only installed background texture packs.": { fr: "Désactivez les scènes par défaut pour utiliser uniquement les packs de textures de fond.", de: "Deaktiviere Standard-Szenen, um nur installierte Hintergrund-Pakete zu verwenden.", id: "Nonaktifkan adegan kanvas bawaan untuk menggunakan paket tekstur latar saja.", bn: "শুধুমাত্র ইনস্টল করা ব্যাকগ্রাউন্ড টেক্সচার প্যাক ব্যবহার করতে ডিফল্ট দৃশ্য বন্ধ করুন।", ur: "صرف انسٹال کردہ بیک گراؤنڈ ٹیکسچر پیکس استعمال کرنے کے لیے ڈیفالٹ مناظر بند کریں۔", ar: "عطّل مشاهد اللوحة الافتراضية لاستخدام حزم الخلفيات المثبتة فقط.", tlh: "Pack 'em neH lo'meH motlh Scene yIQotlh." },
  "Emoji Modifier Stamps": { fr: "Tampons Modificateurs Emoji", de: "Emoji-Modifikator-Stempel", id: "Stempel Modifikasi Emoji", bn: "ইমোজি মডিফায়ার স্ট্যাম্প", ur: "ایموجی موڈیفائر اسٹیمپس", ar: "أختام الرموز التعبيرية", tlh: "Emoji chovnatlh" },
  "Exclude emoji modifier stamps and sticker layers from generated sleeve artwork.": { fr: "Exclure les tampons emoji des pochettes générées.", de: "Emoji-Stempel aus generierten Plattenhüllen ausschließen.", id: "Kecualikan stempel emoji dari sampul yang dihasilkan.", bn: "তৈরি করা কভার আর্টওয়ার্ক থেকে ইমোজি স্ট্যাম্প বাদ দিন।", ur: "تیار کردہ کور آرٹ ورک سے ایموجی اسٹیمپس خارج کریں۔", ar: "استبعاد أختام الرموز التعبيرية من أغلفة الاسطوانات المولدة.", tlh: "QoQ Dechvo' Emoji yIteq." },
  "ENABLED": { fr: "ACTIVÉ", de: "AKTIV", id: "AKTIF", bn: "চালু", ur: "فعال", ar: "مفعّل", tlh: "CHU'" },
  "DISABLED": { fr: "DÉSACTIVÉ", de: "INAKTIV", id: "NONAKTIF", bn: "বন্ধ", ur: "غیر فعال", ar: "معطّل", tlh: "QOTLH" },
  "Author custom word lists and transparent cutout stamps directly on your device.": { fr: "Créez des listes de mots personnalisées et des découpes transparentes directement sur votre appareil.", de: "Erstelle eigene Wortlisten und transparente Stempel direkt auf deinem Gerät.", id: "Buat daftar kata kustom dan stempel potongan transparan langsung di perangkat Anda.", bn: "সরাসরি আপনার ডিভাইসে কাস্টম শব্দ তালিকা এবং স্বচ্ছ কাটআউট স্ট্যাম্প তৈরি করুন।", ur: "براہِ راست اپنے ڈیوائس پر کسٹم الفاظ کی فہرست اور شفاف کٹ آؤٹ اسٹیمپس بنائیں۔", ar: "أنشئ قوائم كلمات مخصصة وملصقات شفافة مباشرة على جهازك.", tlh: "De'wI'lIjDaq mu' tetlh chu' mIllogh je yIchenmoH." },
  "Installed Content Manifest": { fr: "Manifeste du Contenu Installé", de: "Installiertes Inhalts-Manifest", id: "Manifes Konten Terpasang", bn: "ইনস্টল করা কনটেন্ট তালিকা", ur: "انسٹال شدہ مواد کی فہرست", ar: "قائمة المحتوى المثبت", tlh: "jomta'bogh Pack tetlh" },
  "User-Forged Crates": { fr: "Caisses Créées par l'Utilisateur", de: "Selbstgeschmiedete Kisten", id: "Kotak Buatan Pengguna", bn: "ব্যবহারকারীর তৈরি ক্রেট", ur: "صارف کے بنائے ہوئے کریٹس", ar: "صناديق من صنع المستخدم", tlh: "lo'wI' ngaSwI'mey" },
  "Word Expansion Packs": { fr: "Packs d'Expansion de Mots", de: "Wort-Erweiterungspakete", id: "Paket Ekspansi Kata", bn: "শব্দ এক্সপ্যানশন প্যাক", ur: "الفاظ کے ایکسپینশন پیکس", ar: "حزم توسعة الكلمات", tlh: "mu' Packmey" },
  "Subject Cutout Packs": { fr: "Packs de Découpes Sujets", de: "Motiv-Ausschnitt-Pakete", id: "Paket Potongan Subjek", bn: "সাবজেক্ট কাটআউট প্যাক", ur: "سبجیکٹ کٹ آؤٹ پیکس", ar: "حزم ملصقات العناصر", tlh: "chovnatlh Packmey" },
  "Background Texture Packs": { fr: "Packs de Textures de Fond", de: "Hintergrund-Texturpakete", id: "Paket Tekstur Latar", bn: "ব্যাকগ্রাউন্ড টেক্সচার প্যাক", ur: "بیک گراؤنڈ ٹیکسچر پیکس", ar: "حزم خلفيات الغلاف", tlh: "'em Packmey" },
  "All In": { fr: "Tout Installé", de: "Alle Drin", id: "Semua Terpasang", bn: "সব ইনস্টলড", ur: "سب انسٹال", ar: "الكل مثبت", tlh: "Hoch jomta'" },
  "Install Rest": { fr: "Installer le Reste", de: "Rest Installieren", id: "Pasang Sisanya", bn: "বাকিগুলো ইনস্টল", ur: "باقی انسٹال کریں", ar: "تثبيت الباقي", tlh: "latlh yIjom" },
  "Install All": { fr: "Tout Installer", de: "Alle Installieren", id: "Pasang Semua", bn: "সব ইনস্টল করুন", ur: "سب انسٹال کریں", ar: "تثبيت الكل", tlh: "Hoch yIjom" },
  "Installing...": { fr: "Installation...", de: "Installiere...", id: "Memasang...", bn: "ইনস্টল হচ্ছে...", ur: "انسٹال ہو رہا ہے...", ar: "جارٍ التثبيت...", tlh: "jomlu'..." },
  "Removing...": { fr: "Suppression...", de: "Entferne...", id: "Menghapus...", bn: "সরানো হচ্ছে...", ur: "ہٹایا جا رہا ہے...", ar: "جارٍ الإزالة...", tlh: "teqlu'..." },
  "Not installed": { fr: "Non installé", de: "Nicht installiert", id: "Belum terpasang", bn: "ইনস্টল করা নেই", ur: "انسٹال نہیں ہے", ar: "غير مثبت", tlh: "jombe'lu'" },
  "No remote or local content packs detected.": { fr: "Aucun pack de contenu local ou distant détecté.", de: "Keine lokalen oder externen Inhaltspakete gefunden.", id: "Tidak ada paket konten lokal atau jarak jauh yang terdeteksi.", bn: "কোনো কনটেন্ট প্যাক পাওয়া যায়নি।", ur: "کوئی مواد پیک نہیں ملا۔", ar: "لم يتم العثور على أي حزم محتوى.", tlh: "Pack tu'lu'be'." },
  "MOUNTED": { fr: "INSTALLÉ", de: "AKTIV", id: "TERPASANG", bn: "মাউন্টেড", ur: "نصب شدہ", ar: "مُثبَّت", tlh: "JOMTA'" },
  "OFFLINE": { fr: "DÉSACTIVÉ", de: "AUS", id: "NONAKTIF", bn: "নিষ্ক্রিয়", ur: "غیر فعال", ar: "معطل", tlh: "QOTLH" },
  "Offline Modular Content Studio": { fr: "Studio Modulaire Hors-Ligne", de: "Modulares Offline-Inhaltsstudio", id: "Studio Konten Modular Offline", bn: "অফলাইন মডুলার কনটেন্ট স্টুডিও", ur: "آف لائن ماڈیولر مواد اسٹوڈیو", ar: "استوديو المحتوى المعياري بدون إنترنت", tlh: "De'wI'Qo' Pack chenmoHwI'" },
  "Crate Name:": { fr: "Nom de Caisse :", de: "Kistenname:", id: "Nama Kotak:", bn: "ক্রেটের নাম:", ur: "کریٹ کا نام:", ar: "اسم الصندوق:", tlh: "ngaSwI' pong:" },
  "e.g. Victorian Eccentrics, Basement Tools (optional)...": { fr: "ex. Excentriques Victoriens, Outils de Cave (optionnel)...", de: "z.B. Viktorianische Exzentriker, Kellerwerkzeug (optional)...", id: "mis. Eksentrik Victoria, Alat Ruang Bawah Tanah (opsional)...", bn: "যেমন: ভিক্টোরিয়ান খামখেয়ালী, বেসমেন্ট টুলস (ঐচ্ছিক)...", ur: "مثلاً وکٹورین عجیب و غریب، تہہ خانے کے اوزار (اختیاری)...", ar: "مثال: غرائب فيكتوريا، أدوات القبو (اختياري)...", tlh: "e.g., Qo'noS SuvwI'pu' (optional)..." },
  "Words & Metadata": { fr: "Mots & Métadonnées", de: "Wörter & Metadaten", id: "Kata & Metadata", bn: "শব্দ ও মেটাডেটা", ur: "الفاظ اور میٹا ڈیٹا", ar: "الكلمات والبيانات", tlh: "mu'mey & De'" },
  "Subject Stamps": { fr: "Découpes Sujets", de: "Motiv-Stempel", id: "Stempel Subjek", bn: "সাবজেক্ট স্ট্যাম্প", ur: "سبجیکٹ اسٹیمپس", ar: "ملصقات العناصر", tlh: "chovnatlh" },
  "Archivist / Author": { fr: "Archiviste / Auteur", de: "Archivar / Autor", id: "Arsiparis / Penulis", bn: "আর্কাইভিস্ট / লেখক", ur: "آرکائیوسٹ / مصنف", ar: "المؤرشف / المؤلف", tlh: "ghItlhwI'" },
  "Author name": { fr: "Nom de l'auteur", de: "Autorenname", id: "Nama penulis", bn: "লেখকের নাম", ur: "مصنف کا نام", ar: "اسم المؤلف", tlh: "ghItlhwI' pong" },
  "Anonymous Archivist": { fr: "Archiviste Anonyme", de: "Anonymer Archivar", id: "Arsiparis Anonim", bn: "বেনামী আর্কাইভিস্ট", ur: "گمنام آرکائیوسٹ", ar: "مؤرشف مجهول", tlh: "pong pagh ghItlhwI'" },
  "Version": { fr: "Version", de: "Version", id: "Versi", bn: "ভার্সন", ur: "ورژن", ar: "الإصدار", tlh: "Version" },
  "Description / Lore": { fr: "Description / Lore", de: "Beschreibung / Lore", id: "Deskripsi / Kisah", bn: "বিবরণ / কাহিনী", ur: "تفصیل / کہانی", ar: "الوصف / القصة", tlh: "De' / lut" },
  "A brief note on the aesthetic of this pack...": { fr: "Une brève note sur l'esthétique de ce pack...", de: "Eine kurze Notiz zur Ästhetik dieses Pakets...", id: "Catatan singkat tentang estetika paket ini...", bn: "এই প্যাকের নান্দনিকতা সম্পর্কে সংক্ষিপ্ত নোট...", ur: "اس پیک کے انداز کے بارے میں مختصر نوٹ...", ar: "ملاحظة موجزة حول جمالية هذه الحزمة...", tlh: "Packvam lut..." },
  "Nouns (One per line or comma-separated)": { fr: "Noms (Un par ligne ou séparés par des virgules)", de: "Substantive (Eines pro Zeile oder kommagetrennt)", id: "Kata Benda (Satu per baris atau pisahkan koma)", bn: "বিশেষ্য (প্রতি লাইনে একটি বা কমা দিয়ে আলাদা)", ur: "اسم (ہر سطر میں ایک یا کوما سے الگ)", ar: "الأسماء (واحد في كل سطر أو مفصولة بفواصل)", tlh: "DIp (Nouns)" },
  "Spork, Radiator, Bureaucrat, Flannel, Lawn Chair...": { fr: "Cuillère-fourchette, Radiateur, Bureaucrate, Flanelle...", de: "Göffel, Heizkörper, Bürokrat, Flanell, Gartenstuhl...", id: "Sendok Garpu, Radiator, Birokrat, Flanel, Kursi Taman...", bn: "চামচ, রেডিয়েটর, আমলা, ফ্ল্যানেল, চেয়ার...", ur: "چمچ، ریڈی ایٹر، بیوروکریٹ، فلالین، کرسی...", ar: "ملعقة، مشعاع، بيروقراطي، فانيلة، كرسي...", tlh: "DeS'a', tujmoHwI', baghneQ..." },
  "Adjectives (One per line or comma-separated)": { fr: "Adjectifs (Un par ligne ou séparés par des virgules)", de: "Adjektive (Eines pro Zeile oder kommagetrennt)", id: "Kata Sifat (Satu per baris atau pisahkan koma)", bn: "বিশেষণ (প্রতি লাইনে একটি বা কমা দিয়ে আলাদা)", ur: "صفت (ہر سطر میں ایک یا کوما سے الگ)", ar: "الصفات (واحدة في كل سطر أو مفصولة بفواصل)", tlh: "Adjectives" },
  "Overpriced, Melancholic, Resonant, Beige, Unironic...": { fr: "Surévalué, Mélancolique, Résonnant, Beige...", de: "Überteuert, Melancholisch, Resonant, Beige...", id: "Kemahalan, Melankolis, Bergema, Krem...", bn: "অতিমূল্যায়িত, বিষণ্ণ, অনুরণিত, বেইজ...", ur: "مہنگا، اداس، گونجدار، بیج...", ar: "مبالغ في سعره، كئيب، رنان، بيج...", tlh: "QIp, HoSghaj, quv..." },
  "Ensembles / Group Formats (Optional)": { fr: "Ensembles / Formats de Groupe (Optionnel)", de: "Ensembles / Bandformate (Optional)", id: "Ansambel / Format Grup (Opsional)", bn: "এনসেম্বল / গ্রুপ ফরম্যাট (ঐচ্ছিক)", ur: "طائفے / گروپ فارمیٹس (اختیاری)", ar: "التشكيلات / صيغ الفرق (اختياري)", tlh: "ghom Segh (Optional)" },
  "Quartet, Collective, Society, Department, Experience...": { fr: "Quatuor, Collectif, Société, Département, Expérience...", de: "Quartett, Kollektiv, Gesellschaft, Abteilung...", id: "Kuartet, Kolektif, Masyarakat, Departemen...", bn: "কোয়ার্টেট, কালেক্টিভ, সোসাইটি, ডিপার্টমেন্ট...", ur: "چوکڑی، اجتماع، سوسائٹی، محکمہ...", ar: "رباعي، جماعة، جمعية، قسم...", tlh: "yej, ghom, DIvI'..." },
  "loaded": { fr: "chargés", de: "geladen", id: "dimuat", bn: "লোড হয়েছে", ur: "لوڈ شدہ", ar: "محملة", tlh: "lInglu'" },
  "Transparent PNG Subject Stamps": { fr: "Découpes PNG Transparentes", de: "Transparente PNG-Motivstempel", id: "Stempel Subjek PNG Transparan", bn: "স্বচ্ছ PNG সাবজেক্ট স্ট্যাম্প", ur: "شفاف PNG سبجیکٹ اسٹیمپس", ar: "ملصقات عناصر PNG شفافة", tlh: "PNG chovnatlh" },
  "Upload cutouts (transparent PNG or WebP) to appear as surreal album centerpieces. Images are converted and stored locally in your browser's IndexedDB.": { fr: "Téléversez des découpes (PNG ou WebP transparents) comme motifs centraux. Les images sont stockées localement dans IndexedDB.", de: "Lade Freisteller (transparente PNG/WebP) als Cover-Motive hoch. Bilder werden lokal in IndexedDB gespeichert.", id: "Unggah gambar potongan (PNG atau WebP transparan) sebagai motif tengah sampul. Disimpan secara lokal di IndexedDB browser Anda.", bn: "অ্যালবাম কভারের কেন্দ্রে দেখানোর জন্য স্বচ্ছ PNG বা WebP কাটআউট আপলোড করুন। এগুলো ব্রাউজারের IndexedDB-তে সেভ থাকে।", ur: "البم کور کے مرکز کے لیے شفاف PNG یا WebP کٹ آؤٹ اپ لوڈ کریں۔ تصاویر مقامی طور پر IndexedDB میں محفوظ ہوتی ہیں۔", ar: "ارفع صور PNG أو WebP شفافة لتظهر في وسط الغلاف. تُحفظ الصور محلياً في IndexedDB.", tlh: "PNG pagh WebP mIllogh yIngeH (IndexedDBDaq pollu')." },
  "Select PNG / WebP Cutouts": { fr: "Choisir des Découpes PNG / WebP", de: "PNG- / WebP-Ausschnitte Wählen", id: "Pilih Potongan PNG / WebP", bn: "PNG / WebP কাটআউট বেছে নিন", ur: "PNG / WebP کٹ آؤٹ منتخب کریں", ar: "اختر ملصقات PNG / WebP", tlh: "PNG / WebP yIwIv" },
  "Transparent backgrounds recommended": { fr: "Fonds transparents recommandés", de: "Transparenter Hintergrund empfohlen", id: "Disarankan latar belakang transparan", bn: "স্বচ্ছ ব্যাকগ্রাউন্ড সুপারিশ করা হয়", ur: "شفاف پس منظر کی سفارش کی جاتی ہے", ar: "يُنصح بخلفيات شفافة", tlh: "chIm 'em chup" },
  "No cutout stamps added to this crate yet.": { fr: "Aucune découpe ajoutée à cette caisse pour l'instant.", de: "Dieser Kiste wurden noch keine Stempel hinzugefügt.", id: "Belum ada stempel potongan di kotak ini.", bn: "এই ক্রেটে এখনো কোনো কাটআউট স্ট্যাম্প যোগ করা হয়নি।", ur: "اس کریٹ میں ابھی تک کوئی اسٹیمپ شامل نہیں کیا گیا۔", ar: "لم تتم إضافة أي ملصقات إلى هذا الصندوق بعد.", tlh: "ngaSwI'vamDaq chovnatlh tu'lu'be'." },
  "Import": { fr: "Importer", de: "Import", id: "Impor", bn: "ইমপোর্ট", ur: "امپورٹ", ar: "استيراد", tlh: "lIng" },
  "Export": { fr: "Exporter", de: "Export", id: "Ekspor", bn: "এক্সপোর্ট", ur: "ایکسپورٹ", ar: "تصدير", tlh: "ngeH" },
  "Assemble Crate": { fr: "Assembler la Caisse", de: "Kiste Speichern", id: "Rakit Kotak", bn: "ক্রেট তৈরি করুন", ur: "کریٹ تیار کریں", ar: "تجميع الصندوق", tlh: "ngaSwI' chenmoH" },
  "Assembling...": { fr: "Assemblage...", de: "Speichere...", id: "Merakit...", bn: "তৈরি হচ্ছে...", ur: "تیار ہو رہا ہے...", ar: "جارٍ التجميع...", tlh: "chenmoHlu'..." },
  "Anonymous Feedback & Content": { fr: "Commentaires & Contenu Anonymes", de: "Anonymes Feedback & Ideen", id: "Masukan & Ide Konten Anonim", bn: "বেনামী মতামত ও কনটেন্ট প্রস্তাব", ur: "گمنام تاثرات اور مواد کی تجاویز", ar: "ملاحظات واقتراحات محتوى مجهولة الهوية", tlh: "pong pagh QIn & mu'mey" },
  "Propose new vocabulary pools, suggest visual cutouts, or report generator quirks. Zero personal identity or emails are collected.": { fr: "Proposez de nouveaux mots, suggérez des découpes visuelles ou signalez un bug. Aucune donnée personnelle ni e-mail n'est collecté.", de: "Schlage neue Wortpools oder Motive vor oder melde Fehler. Es werden keinerlei persönliche Daten oder E-Mails erfasst.", id: "Usulkan kumpulan kata baru, ide gambar potongan, atau laporkan bug generator. Tanpa pengumpulan identitas pribadi atau email.", bn: "নতুন শব্দ পুল, ভিজ্যুয়াল কাটআউট প্রস্তাব করুন বা বাগ জানান। কোনো ব্যক্তিগত তথ্য বা ইমেইল সংগ্রহ করা হয় না।", ur: "نئے الفاظ، کٹ آؤٹ آئیڈیاز تجویز کریں یا بگ رپورٹ کریں۔ کوئی ذاتی شناخت یا ای میل جمع نہیں کی جاتی۔", ar: "اقترح كلمات جديدة أو ملصقات بصرية أو أبلغ عن خطأ. لا يتم جمع أي بيانات شخصية أو بريد إلكتروني.", tlh: "mu' chu', mIllogh pagh Bug yIngeH. ponglIj poQbe'lu'." },
  "Transmission Category": { fr: "Catégorie de Transmission", de: "Übertragungs-Kategorie", id: "Kategori Kiriman", bn: "ট্রান্সমিশন বিভাগ", ur: "ترسیل کی قسم", ar: "فئة الإرسالية", tlh: "QIn Segh" },
  "Expansion Pack Theme": { fr: "Thème de Pack d'Expansion", de: "Erweiterungspaket-Thema", id: "Tema Paket Ekspansi", bn: "এক্সপ্যানশন প্যাকের থিম", ur: "ایکسپینشن پیک کا موضوع", ar: "موضوع حزمة توسعة", tlh: "Pack chu' Theme" },
  "Vocabulary / Word Submissions": { fr: "Soumission de Mots / Vocabulaire", de: "Wort- / Vokabelvorschläge", id: "Usulan Kata / Kosakata", bn: "শব্দ / শব্দভাণ্ডার প্রস্তাব", ur: "الفاظ / ذخیرہ الفاظ کی تجاویز", ar: "اقتراح مفردات / كلمات", tlh: "mu'mey chu'" },
  "Visual Gag / Cutout Idea": { fr: "Idée de Gag Visuel / Découpe", de: "Visueller Gag / Motiv-Idee", id: "Ide Lelucon Visual / Potongan Gambar", bn: "ভিজ্যুয়াল গ্যাগ / কাটআউট আইডিয়া", ur: "بصری مذاق / کٹ آؤٹ آئیڈیا", ar: "فكرة دعابة بصرية / ملصق", tlh: "mIllogh chu'" },
  "System Anomaly / Bug": { fr: "Anomalie Système / Bug", de: "Systemfehler / Bug", id: "Anomali Sistem / Bug", bn: "সিস্টেম ত্রুটি / বাগ", ur: "سسٹم کی خرابی / بگ", ar: "خلل في النظام / خطأ برمجي", tlh: "System Qagh / Bug" },
  "Suggestion / Content": { fr: "Suggestion / Contenu", de: "Vorschlag / Inhalt", id: "Saran / Konten", bn: "প্রস্তাব / বিবরণ", ur: "تجویز / تفصیل", ar: "الاقتراح / المحتوى", tlh: "QIn ghItlh" },
  "Anomaly Description": { fr: "Description de l'Anomalie", de: "Fehlerbeschreibung", id: "Deskripsi Masalah", bn: "ত্রুটির বিবরণ", ur: "خرابی کی تفصیل", ar: "وصف الخلل", tlh: "Qagh De'" },
  "IDENTITY: ANONYMOUS": { fr: "IDENTITÉ : ANONYME", de: "IDENTITÄT: ANONYM", id: "IDENTITAS: ANONIM", bn: "পরিচয়: বেনামী", ur: "شناخت: گمنام", ar: "الهوية: مجهول", tlh: "PONG: PAGH" },
  "INCLUDES BASIC DISPLAY METRICS": { fr: "INCLUT LES MESURES D'ÉCRAN", de: "INKL. ANZEIGE-METRIKEN", id: "TERMASUK UKURAN LAYAR DASAR", bn: "সাধারণ ডিসপ্লে তথ্য সহ", ur: "بنیادی اسکرین معلومات شامل", ar: "يتضمن أبعاد الشاشة الأساسية", tlh: "JIH DE' NGA'" },
  "Transmit Dispatch": { fr: "Transmettre la Dépêche", de: "Depesche Senden", id: "Kirim Pesan", bn: "ডিসপ্যাচ পাঠান", ur: "ڈسپیچ بھیجیں", ar: "إرسال البرقية", tlh: "QIn yIngeH" },
  "Transmitting...": { fr: "Transmission...", de: "Sende...", id: "Mengirim...", bn: "পাঠানো হচ্ছে...", ur: "بھیجا جا رہا ہے...", ar: "جارٍ الإرسال...", tlh: "ngeHlu'..." },
  "Transmission Received": { fr: "Transmission Reçue", de: "Übertragung Empfangen", id: "Kiriman Diterima", bn: "বার্তা গৃহীত হয়েছে", ur: "پیغام موصول ہو گیا", ar: "تم استلام الإرسالية", tlh: "QIn Hevlu'ta'" },
  "Your submission has logged to the private archival queue for daily ingestion.": { fr: "Votre envoi a été enregistré dans la file d'attente privée de l'archive.", de: "Dein Beitrag wurde in die private Archiv-Warteschlange aufgenommen.", id: "Kiriman Anda telah dicatat ke antrean arsip pribadi.", bn: "আপনার প্রস্তাবটি প্রাইভেট আর্কাইভ কিউতে জমা হয়েছে।", ur: "آپ کی تجویز نجی آرکائیو قطار میں درج کر لی گئی ہے۔", ar: "تم تسجيل مساهمتك في قائمة الانتظار الأرشيفية الخاصة.", tlh: "memDaq QInlIj qonlu'ta'." },
  "⚡ NEW UPDATE READY — TAP TO RELOAD": { fr: "⚡ MISE À JOUR PRÊTE — TOUCHER POUR RECHARGER", de: "⚡ NEUES UPDATE BEREIT — TIPPEN ZUM NEU LADEN", id: "⚡ PEMBARUAN SIAP — KETUK UNTUK MUAT ULANG", bn: "⚡ নতুন আপডেট প্রস্তুত — রিলোড করতে ট্যাপ করুন", ur: "⚡ نیا اپ ڈیٹ تیار ہے — ری لوڈ کرنے کے لیے ٹیپ کریں", ar: "⚡ تحديث جديد جاهز — اضغط لإعادة التحميل", tlh: "⚡ CHU'MOH GHUH — RELOADMEH YI'UY" },
  "Inspection Error": { fr: "Erreur d'Inspection", de: "Prüffehler", id: "Kesalahan Pemeriksaan", bn: "পরীক্ষা ত্রুটি", ur: "معائنہ کی خرابی", ar: "خطأ في الفحص", tlh: "Qagh" },
  "e.g. '1970s Municipal Pool', 'Disgruntled Botanists', 'Mid-Century Dental Equipment'...": { fr: "ex. « Piscine Municipale 70s », « Botanistes Mécontents »...", de: "z.B. „70er Stadtbad“, „Verärgerte Botaniker“...", id: "mis. 'Kolam Renang Kota 70-an', 'Ahli Botani Marah'...", bn: "যেমন: '১৯৭০-এর সুইমিং পুল', 'রাগান্বিত উদ্ভিদবিদ'...", ur: "مثلاً '1970 کا میونسپل پول'، 'ناراض ماہرینِ نباتات'...", ar: "مثال: «مسبح بلدي في السبعينيات»، «علماء نبات غاضبون»...", tlh: "e.g., 'Qo'noS Hongghor', 'SuvwI' Ho' Jan'..." },
  "e.g. Nouns: 'Spork', 'Microfiche'. Adjectives: 'Uncalibrated', 'Pre-Shrunk'...": { fr: "ex. Noms : « Cuillère », « Microfiche ». Adjectifs : « Décalibré »...", de: "z.B. Nomen: „Göffel“, „Mikrofiche“. Adjektive: „Unkalibriert“...", id: "mis. Kata Benda: 'Sendok', 'Mikrofis'. Kata Sifat: 'Aus'...", bn: "যেমন: বিশেষ্য: 'চামচ'; বিশেষণ: 'অমীমাংসিত'...", ur: "مثلاً اسم: 'چمچ'۔ صفت: 'غیر متوازن'...", ar: "مثال: أسماء: «ملعقة». صفات: «غير معاير»...", tlh: "e.g., DIp: 'baghneQ'. Adjectives: 'QIp'..." },
  "e.g. A rotary telephone wearing a mustache, or a rubber stamp reading 'DENIED BY TODDLER'...": { fr: "ex. Un téléphone à cadran avec une moustache, ou un tampon « REFUSÉ »...", de: "z.B. Ein Wählscheibentelefon mit Schnurrbart oder ein Stempel „ABGELEHNT“...", id: "mis. Telepon putar berkumis, atau stempel karet 'DITOLAK BALITA'...", bn: "যেমন: গোঁফওয়ালা পুরনো টেলিফোন, বা রাবার স্ট্যাম্প...", ur: "مثلاً مونچھوں والا پرانا ٹیلی فون، یا ربڑ اسٹیمپ...", ar: "مثال: هاتف قديم بشارب، أو ختم مطاطي مكتوب عليه «مرفوض»...", tlh: "e.g., rol ghajbogh ghogh HablI'..." },
  "Describe the unexpected glitch, visual overlap, or audio behavior...": { fr: "Décrivez le bug inattendu, le chevauchement visuel ou le problème audio...", de: "Beschreibe den unerwarteten Fehler, Überlappungen oder das Audio-Verhalten...", id: "Jelaskan kendala tak terduga, tampilan tumpang tindih, atau masalah suara...", bn: "অপ্রত্যাশিত ত্রুটি, লেখার ওভারল্যাপ বা অডিও সমস্যার বিবরণ দিন...", ur: "غیر متوقع خرابی، بصری اوورلیپ یا آڈیو مسئلے کی تفصیل لکھیں...", ar: "صف الخلل غير المتوقع أو تداخل العناصر أو مشكلة الصوت...", tlh: "Qagh, mIllogh pagh wab Seng yIghItlh..." },
  "45 RPM (HI-SPEED)": { fr: "45 TPM (RAPIDE)", de: "45 RPM (SCHNELL)", id: "45 RPM (CEPAT)", bn: "৪৫ RPM (দ্রুত)", ur: "45 RPM (تیز)", ar: "45 دورة (سريع)", tlh: "45 RPM (nom)" },
  "16⅔ RPM (SLUDGE)": { fr: "16⅔ TPM (LENT)", de: "16⅔ RPM (LANGSAM)", id: "16⅔ RPM (LAMBAT)", bn: "১৬⅔ RPM (ধীর)", ur: "16⅔ RPM (آہستہ)", ar: "16⅔ دورة (بطيء)", tlh: "16⅔ RPM (QIt)" },
  "Program Tracklist (Tap Track To Spin)": { fr: "Liste des Pistes (Touchez pour Lire)", de: "Titelliste (Antippen zum Abspielen)", id: "Daftar Lagu (Ketuk Lagu untuk Memutar)", bn: "ট্র্যাকলিস্ট (বাজাতে গানে ট্যাপ করুন)", ur: "ٹریک لسٹ (چلانے کے لیے گانے پر ٹیپ کریں)", ar: "قائمة الأغاني (اضغط لتشغيل المسار)", tlh: "bom tetlh (chu'meH yI'uy)" },
  "Program Tracklist": { fr: "Liste des Pistes", de: "Titelliste", id: "Daftar Lagu", bn: "ট্র্যাকলিস্ট", ur: "ٹریک لسٹ", ar: "قائمة الأغاني", tlh: "bom tetlh" },
  "Archival Liner Notes": { fr: "Notes de Pochette d'Archive", de: "Archiv-Liner-Notes", id: "Catatan Sampul Arsip", bn: "আর্কাইভ লাইনার নোটস", ur: "آرکائیو لائنر نوٹس", ar: "ملاحظات الغلاف الأرشيفية", tlh: "mem QoQ ghItlh" },
  "Critical Reception": { fr: "Réception Critique", de: "Kritikerstimmen", id: "Ulasan Kritikus", bn: "সমালোচকদের প্রতিক্রিয়া", ur: "ناقدین کی رائے", ar: "آراء النقاد", tlh: "chovwI'pu' mu'" },
  "Band Biography & Recording Lore": { fr: "Biographie du Groupe & Lore", de: "Band-Biografie & Studio-Lore", id: "Biografi Band & Kisah Rekaman", bn: "ব্যান্ডের জীবনী ও রেকর্ডিং কাহিনী", ur: "بینڈ کی سوانح اور ریکارڈنگ کہانی", ar: "سيرة الفرقة وقصة التسجيل", tlh: "ghom lut & qonmeH De'" },
  "Close Notes": { fr: "Fermer les Notes", de: "Notizen Schließen", id: "Tutup Catatan", bn: "নোটস বন্ধ করুন", ur: "نوٹس بند کریں", ar: "إغلاق الملاحظات", tlh: "ghItlh SoQmoH" },
  "Master Tape Ready": { fr: "Bande Master Prête", de: "Masterband Bereit", id: "Pita Master Siap", bn: "মাস্টার টেপ প্রস্তুত", ur: "ماسٹر ٹیپ تیار", ar: "الشريط الرئيسي جاهز", tlh: "Master Tape ghuH" },
  "Rendering Visual Gag on Canvas...": { fr: "Rendu de l'Illustration sur Canevas...", de: "Grafik wird auf Canvas gerendert...", id: "Merender Gambar Sampul di Kanvas...", bn: "ক্যানভাসে আর্টওয়ার্ক তৈরি হচ্ছে...", ur: "کینوس پر تصویر بنائی جا رہی ہے...", ar: "جارٍ رسم الغلاف على اللوحة...", tlh: "CanvasDaq mIllogh chenmoHlu'..." },
  "Forging Vinyl Artwork...": { fr: "Création de la Pochette...", de: "Vinyl-Artwork wird erstellt...", id: "Membuat Sampul Vinil...", bn: "ভিনাইল আর্টওয়ার্ক তৈরি হচ্ছে...", ur: "وینائل آرٹ ورک بن رہا ہے...", ar: "جارٍ تصميم غلاف الفينيل...", tlh: "QoQ mIllogh chenmoHlu'..." },
  "Pressing Vinyl...": { fr: "Pressage du Vinyle...", de: "Vinyl wird gepresst...", id: "Mencetak Vinil...", bn: "ভিনাইল প্রেস হচ্ছে...", ur: "وینائل پریس ہو رہا ہے...", ar: "جارٍ كبس الفينيل...", tlh: "QoQ chenmoHlu'..." },
  "Processing Custom Photo...": { fr: "Traitement de la Photo...", de: "Foto wird entwickelt...", id: "Memproses Foto Kustom...", bn: "কাস্টম ছবি প্রসেস হচ্ছে...", ur: "تصویر پراسیس ہو رہی ہے...", ar: "جارٍ معالجة الصورة...", tlh: "mIllogh choHlu'..." },
  "Active Record": { fr: "Disque Actif", de: "Aktive Platte", id: "Piringan Aktif", bn: "সক্রিয় রেকর্ড", ur: "فعال ریکارڈ", ar: "الاسطوانة النشطة", tlh: "DaH QoQ" },
  "PHOTO STAGED": { fr: "PHOTO PRÊTE", de: "FOTO BEREIT", id: "FOTO SIAP", bn: "ছবি প্রস্তুত", ur: "فوٹو تیار", ar: "الصورة جاهزة", tlh: "MILLOGH GHUH" },
  "Send a 1-tap web link to clone directly onto a friend's turntable, or copy the offline DNA string.": { fr: "Envoyez un lien web en 1 clic pour cloner ce disque sur la platine d'un ami, ou copiez le code ADN hors-ligne.", de: "Sende einen 1-Klick-Weblink zum direkten Klonen auf den Plattenspieler eines Freundes oder kopiere den Offline-DNA-Code.", id: "Kirim tautan web 1-ketuk untuk mengkloning langsung ke turntable teman, atau salin kode DNA offline.", bn: "বন্ধুর টার্নটেবিলে সরাসরি ক্লোন করতে ১-ট্যাপ ওয়েব লিঙ্ক পাঠান, অথবা অফলাইন DNA কোড কপি করুন।", ur: "دوست کے ٹرن ٹیبل پر براہِ راست کلون کرنے کے لیے 1-ٹیپ ویب لنک بھیجیں، یا آف لائن DNA کوڈ کاپی کریں۔", ar: "أرسل رابط ويب بضغطة واحدة لاستنساخ الاسطوانة مباشرة لدى صديقك، أو انسخ كود DNA.", tlh: "jup TurntableDaq velmeH 1-Tap Link yIngeH, pagh DNA ngoq yIlIl." },
  "Link Copied!": { fr: "Lien Copié !", de: "Link Kopiert!", id: "Tautan Disalin!", bn: "লিঙ্ক কপি হয়েছে!", ur: "لنک کاپی ہو گیا!", ar: "تم نسخ الرابط!", tlh: "Link lIlta'!" },
  "Copied": { fr: "Copié", de: "Kopiert", id: "Disalin", bn: "কপি হয়েছে", ur: "کاپی شدہ", ar: "تم النسخ", tlh: "lIlta'" },
  "Band, Title, Catalog & Condition": { fr: "Groupe, Titre, Référence & État", de: "Band, Titel, Katalog & Zustand", id: "Band, Judul, Katalog & Kondisi", bn: "ব্যান্ড, শিরোনাম, ক্যাটালগ ও অবস্থা", ur: "بینڈ، عنوان، کیٹلاگ اور حالت", ar: "الفرقة، العنوان، الرقم والحالة", tlh: "ghom, pong, mI' & Dotlh" },
  "Numbered Tracklist (1-8)": { fr: "Liste des Pistes Numérotée (1-8)", de: "Nummerierte Titelliste (1-8)", id: "Daftar Lagu Bernomor (1-8)", bn: "ক্রমিক ট্র্যাকলিস্ট (১-৮)", ur: "نمبر شمار ٹریک لسٹ (1-8)", ar: "قائمة الأغاني المرقمة (1-8)", tlh: "bom tetlh (1-8)" },
  "Archival Recording Notes (Bio)": { fr: "Notes d'Enregistrement (Bio)", de: "Archiv-Aufnahmenotizen (Bio)", id: "Catatan Rekaman Arsip (Bio)", bn: "রেকর্ডিং নোটস (জীবনী)", ur: "ریکارڈنگ نوٹس (سوانح)", ar: "ملاحظات التسجيل الأرشيفية (السيرة)", tlh: "qonmeH De' (lut)" },
  "Satirical Critic Quotes": { fr: "Citations Satiriques des Critiques", de: "Satirische Kritikerzitate", id: "Kutipan Kritikus Satiris", bn: "ব্যঙ্গাত্মক সমালোচক উদ্ধৃতি", ur: "طنزیہ ناقدین کے اقتباسات", ar: "اقتباسات نقدية ساخرة", tlh: "chovwI'pu' mu'mey" },
  "Preparing Artwork...": { fr: "Préparation des Images...", de: "Grafik wird vorbereitet...", id: "Menyiapkan Gambar...", bn: "আর্টওয়ার্ক তৈরি হচ্ছে...", ur: "تصاویر تیار ہو رہی ہیں...", ar: "جارٍ تحضير الصور...", tlh: "mIllogh ghuHmoHlu'..." },
  "Launching Share...": { fr: "Ouverture du Partage...", de: "Teilen wird geöffnet...", id: "Membuka Berbagi...", bn: "শেয়ার খোলা হচ্ছে...", ur: "شیئر کھل رہا ہے...", ar: "جارٍ فتح المشاركة...", tlh: "ngeHmeH poSmoHlu'..." },
  "Rendering...": { fr: "Rendu...", de: "Rendert...", id: "Merender...", bn: "রেন্ডার হচ্ছে...", ur: "تیار ہو رہا ہے...", ar: "جارٍ الرسم...", tlh: "chenmoHlu'..." },
  "Back Disabled": { fr: "Dos Désactivé", de: "Rücken Deaktiviert", id: "Belakang Nonaktif", bn: "পিছনের প্রিন্ট বন্ধ", ur: "بیک پرنٹ بند", ar: "الخلف معطل", tlh: "'em Qotlh" },
  "Transparent alpha; fabric shows through (ideal for black shirts).": { fr: "Fond transparent ; le tissu apparaît (idéal pour t-shirts noirs).", de: "Transparenter Hintergrund; Stoff scheint durch (ideal für schwarze Shirts).", id: "Latar transparan; kain kaos terlihat (ideal untuk kaos hitam).", bn: "স্বচ্ছ ব্যাকগ্রাউন্ড; কাপড়ের রঙ দেখা যাবে (কালো টি-শার্টের জন্য সেরা)।", ur: "شفاف پس منظر؛ کپڑا نظر آتا ہے (سیاہ شرٹس کے لیے بہترین)۔", ar: "خلفية شفافة؛ يظهر قماش القميص من خلالها (مثالي للقمصان السوداء).", tlh: "chIm 'em; Sut rItlh leghlu' (qIj SutvaD nIv)." },
  "Exact 1:1 square sleeve cover from the main deck.": { fr: "Pochette carrée 1:1 identique à celle de la platine principale.", de: "Exaktes 1:1-Quadrat-Cover wie auf dem Hauptdeck.", id: "Sampul persegi 1:1 persis seperti di dek utama.", bn: "মূল ডেকের মতো হুবহু ১:১ বর্গাকার কভার।", ur: "مین ڈیک کے مطابق مکمل 1:1 مربع البم کور۔", ar: "غلاف مربع 1:1 مطابق تماماً للواجهة الرئيسية.", tlh: "Main Deck rurbogh 1:1 Dech." },
  "Enabled": { fr: "Activé", de: "Aktiviert", id: "Aktif", bn: "চালু", ur: "فعال", ar: "مفعّل", tlh: "chu'" },
  "Disabled": { fr: "Désactivé", de: "Deaktiviert", id: "Nonaktif", bn: "বন্ধ", ur: "غیر فعال", ar: "معطّل", tlh: "Qotlh" },
  "Twin Peaks, Bikini Bottom, Mordor...": { fr: "Pics Jumeaux, Bikini-les-Flots, Mordor...", de: "Zwillingsgipfel, Bikini-Atoll, Mordor...", id: "Puncak Kembar, Dasar Bikini, Mordor...", bn: "টুইন পিকস, বিকিনি বটম, মর্ডর...", ur: "ٹوئن پیکس، بکنی باٹم، مورڈور...", ar: "توين بيكس، قاع الهامور، موردور...", tlh: "Qo'noS, Rura Penthe, Gre'thor..." },
  "Chrono-Orbital Circuit": { fr: "Circuit Chrono-Orbital", de: "Chrono-Orbital-Tour", id: "Sirkuit Krono-Orbital", bn: "ক্রোনো-অরবিটাল সার্কিট", ur: "کرونو آربیٹل سرکٹ", ar: "الجولة المدارية الزمنية", tlh: "bavwI' leng" },
  "Flumptown Annex, Zoning Board...": { fr: "Annexe de Flumptown, Comité de Zonage...", de: "Flumptown-Nebengebäude, Bauamt...", id: "Paviliun Flumptown, Ruang Tata Kota...", bn: "ফ্লাম্পটাউন অ্যানেক্স, জোনিং বোর্ড...", ur: "فلمپ ٹاؤن اینیکس، زوننگ بورڈ...", ar: "ملحق فلامبتاون، لجنة التخطيط...", tlh: "Flumptown qach, yoS yejHaD..." },
  "Luna, Mars, Orbital Cistern #4...": { fr: "Lune, Mars, Citerne Orbitale n°4...", de: "Mond, Mars, Orbitalzisterne Nr. 4...", id: "Bulan, Mars, Tangki Orbital #4...", bn: "চাঁদ, মঙ্গল, অরবিটাল ট্যাংক #৪...", ur: "چاند، مریخ، مداری ٹینک نمبر 4...", ar: "القمر، المريخ، الصهريج المداري 4...", tlh: "maS, Mars, bavwI' ngaSwI' #4..." },
  "Shuffles Canonical &": { fr: "Mélange les dates Canoniques &", de: "Mischt Kanonische &", id: "Mengacak lokasi Kanonik &", bn: "ক্যাননিক্যাল এবং", ur: "کینونیکل اور", ar: "يدمج محطات الكلاسيكية و", tlh: "'77 leng &" },
  "stops in chronological date order": { fr: "par ordre chronologique", de: "Stopps in chronologischer Reihenfolge", id: "secara berurutan menurut tanggal", bn: "স্টপগুলো তারিখ অনুযায়ী সাজায়", ur: "مقامات کو تاریخ کے لحاظ سے ملاتا ہے", ar: "بترتيب زمني", tlh: "Daqmey mISmoH" },
  "Municipal": { fr: "Municipales", de: "Kommunale", id: "Kota", bn: "পৌর", ur: "بلدیاتی", ar: "البلدية", tlh: "yoS" },
  "Orbital/Municipal": { fr: "Orbitales/Municipales", de: "Orbitale/Kommunale", id: "Orbital/Kota", bn: "অরবিটাল/পৌর", ur: "مداری/بلدیاتی", ar: "المدارية/البلدية", tlh: "bavwI'/yoS" },
  "Reshuffle": { fr: "Remélanger", de: "Neu Mischen", id: "Acak Ulang", bn: "পুনরায় মেশান", ur: "دوبارہ ملائیں", ar: "إعادة خلط", tlh: "mISqa'" },
  "Mix": { fr: "Mélanger", de: "Mischen", id: "Campur", bn: "মেশান", ur: "ملائیں", ar: "خلط", tlh: "DuD" },
  "✓ Combined into": { fr: "✓ Intégré dans", de: "✓ Kombiniert in", id: "✓ Digabung ke", bn: "✓ যুক্ত হয়েছে:", ur: "✓ شامل کیا گیا:", ar: "✓ تم الدمج في", tlh: "✓ DuDlu'ta':" },
  "Mixed Mashup": { fr: "Circuit Mixte", de: "Gemischte Tour", id: "Sirkuit Campuran", bn: "মিশ্র সার্কিট", ur: "مخلوط سرکٹ", ar: "الجولة المختلطة", tlh: "leng DuD" },
  "1 Night": { fr: "1 Soir", de: "1 Abend", id: "1 Malam", bn: "১ রাত", ur: "1 رات", ar: "ليلة 1", tlh: "1 ram" },
  "2 Nights": { fr: "2 Soirs", de: "2 Abende", id: "2 Malam", bn: "২ রাত", ur: "2 راتیں", ar: "ليلتان", tlh: "2 ram" },
  "Finale": { fr: "Finale", de: "Finale", id: "Final", bn: "সমাপনী", ur: "اختتام", ar: "الختام", tlh: "pItlh" },
  "Clear": { fr: "Effacer", de: "Löschen", id: "Hapus", bn: "মুছুন", ur: "صاف کریں", ar: "مسح", tlh: "teq" },
  "e.g., Longview, WA or Budokan, JP (this export only)": { fr: "ex. Paris, FR ou Budokan, JP (cet export uniquement)", de: "z.B. Berlin, DE oder Budokan, JP (nur dieser Export)", id: "mis. Jakarta, ID atau Budokan, JP (ekspor ini saja)", bn: "যেমন: ঢাকা, BD বা বুদোকান, JP (শুধু এই এক্সপোর্টে)", ur: "مثلاً لاہور، PK یا ٹوکیو، JP (صرف اس بار)", ar: "مثال: القاهرة أو طوكيو (لهذا التصدير فقط)", tlh: "e.g., Ty'Gokor pagh Budokan, JP" },
  "Once you are redirected to the vendor's site, you are on your own! All sizing and color choices happen independently, as Y.D.R.B.N. has no commercial ties and assumes zero liability for clothing items, orders, or deliveries. Y.D.R.B.N. does not recommend any particular vendors, these were just handy options. DO NOT FOLD, SPINDLE, OR MUTILATE Y.D.R.B.N.": { fr: "Une fois redirigé vers le site marchand, vous êtes autonome ! Les choix de taille et de couleur se font indépendamment ; Y.D.R.B.N. n'a aucun lien commercial et décline toute responsabilité concernant les vêtements, commandes ou livraisons. NE PAS PLIER NI MUTILER Y.D.R.B.N.", de: "Sobald du zum Shop weitergeleitet wirst, handelst du eigenständig! Größen- und Farbauswahl erfolgen unabhängig; Y.D.R.B.N. hat keinerlei Geschäftsverbindung zu den Anbietern und übernimmt keine Haftung für Bestellungen oder Lieferungen. Y.D.R.B.N. NICHT KNICKEN ODER BESCHÄDIGEN.", id: "Setelah diarahkan ke situs penyedia, semua pilihan ukuran dan warna dilakukan secara mandiri. Y.D.R.B.N. tidak memiliki ikatan komersial dan tidak bertanggung jawab atas pakaian, pesanan, atau pengiriman. JANGAN MELIPAT ATAU MERUSAK Y.D.R.B.N.", bn: "বিক্রেতার সাইটে যাওয়ার পর আকার এবং রঙের সব পছন্দ আপনার নিজস্ব! Y.D.R.B.N.-এর সাথে কোনো দোকানের ব্যবসায়িক সম্পর্ক নেই এবং পোশাক বা ডেলিভারির জন্য কোনো দায়ভার নেই।", ur: "دکاندار کی ویب سائٹ پر جانے کے بعد سائز اور رنگ کا انتخاب آپ کی اپنی ذمہ داری ہے! Y.D.R.B.N. کا کسی دکان سے تجارتی تعلق نہیں ہے اور نہ ہی آرڈر یا ڈیلیوری کی کوئی ذمہ داری ہے۔", ar: "بمجرد انتقالك إلى موقع المتجر، تتم جميع اختيارات المقاسات والألوان بشكل مستقل؛ لا تربط Y.D.R.B.N. أي علاقة تجارية ولا تتحمل أي مسؤولية عن الطلبات أو الشحن.", tlh: "ngevwI' DaqDaq bIlengDI', SoH neH bIwuq! Y.D.R.B.N. ngevwI'pu' je pImchu' — Sut Huch HIjmeH Qu' ngoy'be' Y.D.R.B.N." },
  "Front PNG": { fr: "(PNG Avant)", de: "(Vorderseiten-PNG)", id: "(PNG Depan)", bn: "(সামনের PNG)", ur: "(فرنٹ PNG)", ar: "(ملف الأمام PNG)", tlh: "(bI'reS PNG)" },
  "✓ Saved to Downloads (Tap to Save": { fr: "✓ Enregistré dans Téléchargements (Touchez pour", de: "✓ Unter Downloads gespeichert (Tippen zum", id: "✓ Disimpan ke Unduhan (Ketuk untuk simpan", bn: "✓ ডাউনলোডে সেভ হয়েছে (আবার সেভ করতে", ur: "✓ ڈاؤن لوڈز میں محفوظ (دوبارہ محفوظ کرنے کے لیے", ar: "✓ تم الحفظ في التنزيلات (اضغط لحفظ", tlh: "✓ polta' (polqa'meH" },
  "Both": { fr: "les deux", de: "beide", id: "keduanya", bn: "দুটোই", ur: "دونوں", ar: "الاثنين", tlh: "cha'DIch" },
  "Again)": { fr: "à nouveau)", de: "erneut speichern)", id: "lagi)", bn: "ট্যাপ করুন)", ur: "ٹیپ کریں)", ar: "مجدداً)", tlh: "yI'uy)" },
  "Back Tour Roster": { fr: "Aperçu de la Tournée (Dos)", de: "Tourplan-Vorschau (Rücken)", id: "Daftar Tur Belakang", bn: "পিছনের ট্যুর সূচি", ur: "بیک ٹور شیڈول", ar: "جدول الجولة الخلفي", tlh: "'em leng tetlh" },
  "Drag to pan • Use presets (100%–250%) or +/- above to adjust scale": { fr: "Glissez pour déplacer • Utilisez 100 %–250 % ou +/- ci-dessus", de: "Ziehen zum Verschieben • Oben 100%–250% oder +/- nutzen", id: "Geser untuk melihat • Gunakan 100%–250% atau +/- di atas", bn: "সরাতে ড্র্যাগ করুন • উপরে ১০০%–২৫০% বা +/- ব্যবহার করুন", ur: "کھینچ کر دیکھیں • اوپر 100% تا 250% یا +/- استعمال کریں", ar: "اسحب للتحريك • استخدم 100%–250% أو +/- بالأعلى", tlh: "yISuD • DungDaq 100%–250% pagh +/- yIlo'" },
  "Tap preset (150%, 200%, 250%) or + to inspect tour stops": { fr: "Touchez 150 %, 200 %, 250 % ou + pour inspecter les dates", de: "Tippe auf 150%, 200%, 250% oder + zum Vergrößern der Tourdaten", id: "Ketuk 150%, 200%, 250% atau + untuk memeriksa jadwal tur", bn: "ট্যুর স্টপ বড় করে দেখতে ১৫০%, ২০০%, ২৫০% বা + চাপুন", ur: "ٹور اسٹاپس دیکھنے کے لیے 150%، 200%، 250% یا + دبائیں", ar: "اضغط 150% أو 200% أو 250% أو + لتكبير محطات الجولة", tlh: "150%, 200%, 250% pagh + yI'uy" },
  "Clone from Pressing DNA Code": { fr: "Cloner depuis un Code ADN", de: "Aus DNA-Code Klonen", id: "Kloning dari Kode DNA", bn: "DNA কোড থেকে ক্লোন করুন", ur: "DNA کوڈ سے کلون کریں", ar: "استنساخ من كود DNA", tlh: "DNA ngoqvo' vel" },
  "Paste YDRBN-DNA:... string here": { fr: "Collez le code YDRBN-DNA:... ici", de: "YDRBN-DNA:... Code hier einfügen", id: "Tempel kode YDRBN-DNA:... di sini", bn: "এখানে YDRBN-DNA:... কোড পেস্ট করুন", ur: "یہاں YDRBN-DNA:... کوڈ پیسٹ کریں", ar: "الصق كود YDRBN-DNA:... هنا", tlh: "YDRBN-DNA:... ngoq naDev yIlan" },
  "Clone": { fr: "Cloner", de: "Klonen", id: "Klon", bn: "ক্লোন", ur: "کلون", ar: "استنساخ", tlh: "vel" },
  "Band / Artist Name": { fr: "Nom du Groupe / Artiste", de: "Band- / Künstlername", id: "Nama Band / Artis", bn: "ব্যান্ড / শিল্পীর নাম", ur: "بینڈ / فنکار کا نام", ar: "اسم الفرقة / الفنان", tlh: "ghom pong" },
  "e.g., Unreasonable Elbow (or leave blank)": { fr: "ex. Coude Déraisonnable (ou laisser vide)", de: "z.B. Unvernünftiger Ellbogen (oder leer lassen)", id: "mis. Siku Tidak Masuk Akal (atau kosongkan)", bn: "যেমন: অযৌক্তিক কনুই (বা খালি রাখুন)", ur: "مثلاً غیر معقول کہنی (یا خالی چھوڑ دیں)", ar: "مثال: المرفق غير المعقول (أو اتركه فارغاً)", tlh: "e.g., DeS'a' QIp (pagh chIm)" },
  "Album Title": { fr: "Titre de l'Album", de: "Albumtitel", id: "Judul Album", bn: "অ্যালবামের শিরোনাম", ur: "البم کا عنوان", ar: "عنوان الألبوم", tlh: "QoQ pong" },
  "e.g., Plastic Spoons": { fr: "ex. Cuillères en Plastique", de: "z.B. Plastiklöffel", id: "mis. Sendok Plastik", bn: "যেমন: প্লাস্টিকের চামচ", ur: "مثلاً پلاسٹک کے چمچ", ar: "مثال: ملاعق بلاستيكية", tlh: "e.g., baghneQ" },
  "Pressing Year": { fr: "Année de Pressage", de: "Pressjahr", id: "Tahun Cetakan", bn: "প্রেসিং সাল", ur: "پریسنگ کا سال", ar: "سنة الطبعة", tlh: "DIS" },
  "e.g., 1978": { fr: "ex. 1978", de: "z.B. 1978", id: "mis. 1978", bn: "যেমন: ১৯৭৮", ur: "مثلاً 1978", ar: "مثال: 1978", tlh: "e.g., 1978" },
  "Audio Soundscape Flavor": { fr: "Style Sonore du Synthétiseur", de: "Klangcharakter des Synthesizers", id: "Karakter Suara Synthesizer", bn: "অডিও সাউন্ডস্কেপ ধরন", ur: "آڈیو ساؤنڈ اسکیپ انداز", ar: "طابع الصوت والموسيقى", tlh: "wab Segh" },
  "1980s Analog Synth & Arpeggio": { fr: "Synthé Analogique & Arpèges 80s", de: "1980er Analog-Synth & Arpeggio", id: "Synth Analog & Arpeggio 1980-an", bn: "১৯৮০-এর অ্যানালগ সিন্থ ও আর্পেজিও", ur: "1980 کا اینالاگ سنتھ اور آرپیجیو", ar: "سينث تناظري وأربيجيو الثمانينيات", tlh: "1980s Analog Synth" },
  "1970s Psychedelic Rock & Phasers": { fr: "Rock Psychédélique & Phasers 70s", de: "1970er Psychedelic Rock & Phaser", id: "Rock Psikedelik & Phaser 1970-an", bn: "১৯৭০-এর সাইকেডেলিক রক ও ফেজার", ur: "1970 کا سائیکیڈیلک راک", ar: "روك سايكدلك السبعينيات", tlh: "1970s Psych-Rock" },
  "1970s Krautrock & Motorik Beat": { fr: "Krautrock & Rythme Motorik 70s", de: "1970er Krautrock & Motorik-Beat", id: "Krautrock & Ketukan Motorik 1970-an", bn: "১৯৭০-এর ক্রাউটরক ও মোটরিক বিট", ur: "1970 کا کراؤٹ راک بیٹ", ar: "كراوتروك وإيقاع السبعينيات", tlh: "1970s Krautrock" },
  "1980s Angular Post-Punk Riff": { fr: "Riff Post-Punk Anguleux 80s", de: "1980er Kantiges Post-Punk-Riff", id: "Riff Post-Punk Tajam 1980-an", bn: "১৯৮০-এর পোস্ট-পাঙ্ক রিফ", ur: "1980 کا پوسٹ پنک رف", ar: "ريف بوست بانك الثمانينيات", tlh: "1980s Post-Punk" },
  "Deep Atmospheric Tape Drone": { fr: "Drone de Bande Magnétique Profond", de: "Tiefer Atmosphärischer Band-Drone", id: "Drone Pita Atmosferik Dalam", bn: "গভীর অ্যাটমোস্ফিয়ারিক টেপ ড্রোন", ur: "گہرا ایٹموسفرک ٹیپ ڈرون", ar: "درون شريطي عميق", tlh: "Deep Tape Drone" },
  "Custom Photo Cover (Optional — Syncs with Deck)": { fr: "Photo de Pochette (Optionnel — Synchronisé)", de: "Eigenes Coverfoto (Optional — Synchronisiert)", id: "Foto Sampul Kustom (Opsional — Sinkron)", bn: "কাস্টম কভার ছবি (ঐচ্ছিক — ডেকের সাথে সিঙ্ক)", ur: "کسٹم کور فوٹو (اختیاری — ڈیک سے منسلک)", ar: "صورة غلاف مخصصة (اختياري — يتزامن مع الواجهة)", tlh: "mIllogh chu' (Optional)" },
  "No cover photo staged": { fr: "Aucune photo sélectionnée", de: "Kein Coverfoto ausgewählt", id: "Belum ada foto sampul", bn: "কোনো কভার ছবি বাছাই করা হয়নি", ur: "کوئی کور فوٹو منتخب نہیں", ar: "لم يتم اختيار صورة غلاف", tlh: "mIllogh pagh" },
  "Photo staged": { fr: "Photo prête", de: "Foto bereit", id: "Foto siap", bn: "ছবি প্রস্তুত", ur: "فوٹو تیار", ar: "الصورة جاهزة", tlh: "mIllogh ghuH" },
  "(Cutout alpha)": { fr: "(Découpe transparente)", de: "(Freisteller transparent)", id: "(Potongan transparan)", bn: "(স্বচ্ছ কাটআউট)", ur: "(شفاف کٹ آؤٹ)", ar: "(مفرغ شفاف)", tlh: "(Alpha pe')" },
  "Tracklist (One track per line)": { fr: "Liste des Pistes (Une par ligne)", de: "Titelliste (Ein Song pro Zeile)", id: "Daftar Lagu (Satu lagu per baris)", bn: "ট্র্যাকলিস্ট (প্রতি লাইনে একটি গান)", ur: "ٹریک لسٹ (ہر سطر میں ایک گانا)", ar: "قائمة الأغاني (أغنية في كل سطر)", tlh: "bom tetlh" },
  "Liner Notes / Band Bio": { fr: "Notes de Pochette / Biographie", de: "Liner Notes / Band-Biografie", id: "Catatan Sampul / Biografi Band", bn: "লাইনার নোটস / ব্যান্ড জীবনী", ur: "لائنر نوٹس / بینڈ سوانح", ar: "ملاحظات الغلاف / سيرة الفرقة", tlh: "QoQ ghItlh / lut" },
  "Recorded in an abandoned cinema using surplus telephone wire...": { fr: "Enregistré dans un cinéma abandonné avec du fil téléphonique...", de: "Aufgenommen in einem verlassenen Kino mit altem Telefonkabel...", id: "Direkam di bioskop tua menggunakan kabel telepon bekas...", bn: "পরিত্যক্ত সিনেমা হলে পুরনো টেলিফোন তার দিয়ে রেকর্ড করা...", ur: "ایک پرانے سنیما میں ٹیلی فون کے تاروں سے ریکارڈ کیا گیا...", ar: "سُجِّل في سينما مهجورة باستخدام أسلاك هاتف فائضة...", tlh: "qach ngo'Daq qonlu'pu'..." },
  "Faux Review / Critical Quote": { fr: "Critique Satirique / Citation Presse", de: "Satirische Kritik / Pressezitat", id: "Ulasan Satiris / Kutipan Kritikus", bn: "ব্যঙ্গাত্মক রিভিউ / সমালোচক উদ্ধৃতি", ur: "طنزیہ تبصرہ / ناقد کا قول", ar: "مراجعة ساخرة / اقتباس نقدي", tlh: "chovwI' mu'" },
  "An acoustic triumph that defies all conventional protocol.": { fr: "Un triomphe acoustique qui défie tout protocole conventionnel.", de: "Ein akustischer Triumph, der jedem Protokoll trotzt.", id: "Kemenangan akustik yang menentang semua protokol konvensional.", bn: "একটি শাব্দিক বিজয় যা সমস্ত প্রচলিত নিয়মকে চ্যালেঞ্জ করে।", ur: "ایک صوتی فتح جو تمام روایتی اصولوں کو چیلنج کرتی ہے۔", ar: "انتصار صوتي يتحدى جميع البروتوكولات التقليدية.", tlh: "Hoch chutmey HIvbogh wab yay." },
  "Add new words & artwork into generator rotation": { fr: "Ajouter les nouveaux mots et l'image dans la rotation du générateur", de: "Neue Wörter & Bild in die Generator-Rotation aufnehmen", id: "Tambahkan kata & gambar baru ke rotasi generator", bn: "নতুন শব্দ ও ছবি জেনারেটর রোটেশনে যোগ করুন", ur: "نئے الفاظ اور تصویر کو جنریٹر روٹیشن میں شامل کریں", ar: "إضافة الكلمات والصور الجديدة إلى دورة المولد", tlh: "mu' chu' mIllogh je GeneratorDaq chel" },
  "Saves novel words and uploaded art into your local “Custom Drop Additions” crate, automatically ignoring words already in the app or active expansion packs.": { fr: "Enregistre les nouveaux mots et l'image dans votre caisse locale « Custom Drop Additions », en ignorant les mots déjà présents.", de: "Speichert neue Wörter und Kunstwerke in deiner lokalen Kiste „Custom Drop Additions“ und überspringt bereits vorhandene Wörter.", id: "Menyimpan kata baru dan gambar ke kotak lokal “Custom Drop Additions”, otomatis melewati kata yang sudah ada.", bn: "নতুন শব্দ ও ছবি আপনার লোকাল “Custom Drop Additions” ক্রেটে সেভ করে এবং আগে থেকে থাকা শব্দগুলো বাদ দেয়।", ur: "نئے الفاظ اور تصاویر کو آپ کے لوکل کریٹ میں محفوظ کرتا ہے اور پہلے سے موجود الفاظ کو چھوڑ دیتا ہے۔", ar: "يحفظ الكلمات والصور الجديدة في صندوقك المحلي مع تجاهل الكلمات الموجودة مسبقاً تلقائياً.", tlh: "mu' chu' mIllogh je pol 'ej mu' ngo' juS." },
  "Type a custom band name, title, or tracks above to extract novel words.": { fr: "Saisissez un nom de groupe, un titre ou des pistes ci-dessus pour extraire les nouveaux mots.", de: "Gib oben einen Bandnamen, Titel oder Songs ein, um neue Wörter zu erkennen.", id: "Ketik nama band, judul, atau lagu di atas untuk mengekstrak kata baru.", bn: "নতুন শব্দ খুঁজে পেতে উপরে ব্যান্ডের নাম, শিরোনাম বা গান লিখুন।", ur: "نئے الفاظ نکالنے کے لیے اوپر بینڈ کا نام، عنوان یا گانے لکھیں۔", ar: "اكتب اسم فرقة أو ألبوم أو أغاني بالأعلى لاستخراج الكلمات الجديدة.", tlh: "DungDaq ghom pong pagh bom yIghItlh." },
  "Rotate Uploaded Image As:": { fr: "Utiliser l'Image Téléversée Comme :", de: "Hochgeladenes Bild Verwenden Als:", id: "Gunakan Gambar Unggahan Sebagai:", bn: "আপলোড করা ছবি যেভাবে ঘুরবে:", ur: "اپ لوڈ کردہ تصویر کا استعمال:", ar: "استخدام الصورة المرفوعة كـ:", tlh: "mIllogh lo'meH Segh:" },
  "Backdrop": { fr: "Fond", de: "Hintergrund", id: "Latar", bn: "ব্যাকড্রপ", ur: "پس منظر", ar: "خلفية", tlh: "'em" },
  "Subject Stamp": { fr: "Timbre Sujet", de: "Motiv-Stempel", id: "Stempel Subjek", bn: "সাবজেক্ট স্ট্যাম্প", ur: "سبجیکٹ اسٹیمپ", ar: "ملصق العنصر", tlh: "chovnatlh" },
  "Skip Image": { fr: "Ignorer l'Image", de: "Bild Überspringen", id: "Lewati Gambar", bn: "ছবি বাদ দিন", ur: "تصویر چھوڑیں", ar: "تخطي الصورة", tlh: "juS" },
  "Create Custom Drop": { fr: "Créer le Disque sur Mesure", de: "Eigene Pressung Erstellen", id: "Buat Rilisan Kustom", bn: "কাস্টম ড্রপ তৈরি করুন", ur: "کسٹم ڈراپ بنائیں", ar: "إنشاء الإصدار المخصص", tlh: "QoQ chu' chenmoH" },
  "Pressing Custom Drop...": { fr: "Pressage sur Mesure...", de: "Eigene Pressung läuft...", id: "Mencetak Rilisan Kustom...", bn: "কাস্টম ড্রপ প্রেস হচ্ছে...", ur: "کسٹم ڈراپ پریس ہو رہا ہے...", ar: "جارٍ كبس الإصدار المخصص...", tlh: "QoQ chu' chenmoHlu'..." },
  "Crate full (14/14) — oldest un-hearted record rotates out on next drop.": {
    fr: "Caisse pleine (14/14) — le plus ancien disque non favori sortira au prochain tirage.",
    de: "Kiste voll (14/14) — älteste Platte ohne Herz rotiert beim nächsten Drop heraus.",
    id: "Kotak penuh (14/14) — piringan terlama tanpa tanda hati akan diganti pada rilisan berikutnya.",
    bn: "ক্রেট পূর্ণ (১৪/১৪) — পরবর্তী ড্রপে সবচেয়ে পুরনো অপছন্দের রেকর্ডটি সরে যাবে।",
    ur: "کریٹ مکمل (14/14) — اگلے ڈراپ پر سب سے پرانا غیر پسندیدہ ریکارڈ نکل جائے گا۔",
    ar: "الصندوق ممتلئ (14/14) — ستُستبدل أقدم اسطوانة غير مفضلة عند الإصدار القادم.",
    tlh: "buy' ngaSwI' (14/14) — QoQ ngo' parHa'be'lu'bogh polHa'lu'."
  },
  "Crate full (all 14 hearted) — oldest pressing rotates out on next drop.": {
    fr: "Caisse pleine (14/14 favoris) — le plus ancien pressage sortira au prochain tirage.",
    de: "Kiste voll (alle 14 mit Herz) — älteste Pressung rotiert beim nächsten Drop heraus.",
    id: "Kotak penuh (semua 14 favorit) — cetakan terlama akan diganti pada rilisan berikutnya.",
    bn: "ক্রেট পূর্ণ (সব ১৪টি পছন্দের) — পরবর্তী ড্রপে সবচেয়ে পুরনো রেকর্ডটি সরে যাবে।",
    ur: "کریٹ مکمل (تمام 14 پسندیدہ) — اگلے ڈراپ پر سب سے پرانا ریکارڈ نکل جائے گا۔",
    ar: "الصندوق ممتلئ (كل الـ 14 مفضلة) — ستُستبدل أقدم طبعة عند الإصدار القادم.",
    tlh: "buy' ngaSwI' (Hoch 14 parHa'lu') — QoQ ngo' polHa'lu'."
  },
  "No records found in this crate.": {
    fr: "Aucun disque trouvé dans cette caisse.",
    de: "Keine Platten in dieser Kiste gefunden.",
    id: "Tidak ada piringan ditemukan di kotak ini.",
    bn: "এই ক্রেটে কোনো রেকর্ড পাওয়া যায়নি।",
    ur: "اس کریٹ میں کوئی ریکارڈ نہیں ملا۔",
    ar: "لم يتم العثोर على اسطوانات في هذا الصندوق.",
    tlh: "ngaSwI'vamDaq QoQ tu'lu'be'."
  },
  "View all records": {
    fr: "Voir tous les disques",
    de: "Alle Platten anzeigen",
    id: "Lihat semua piringan",
    bn: "সব রেকর্ড দেখুন",
    ur: "تمام ریکارڈز دیکھیں",
    ar: "عرض كل الاسطوانات",
    tlh: "Hoch QoQ yIlegh"
  },
  "Record removed from vault.": { es: "Disco eliminado del archivo.", pt: "Disco removido do arquivo.", fr: "Disque retiré de l'archive.", de: "Platte aus dem Archiv entfernt.", id: "Piringan dihapus dari arsip.", ja: "レコードを保管庫から削除しました。", zh: "已从档案库移除唱片。", hi: "रिकॉर्ड पुरालेख से हटाया गया।", bn: "আর্কাইভ থেকে রেকর্ড সরানো হয়েছে।", ur: "ریکارڈ آرکائیو سے ہٹا دیا گیا۔", ar: "تمت إزالة الاسطوانة من الأرشيف.", ru: "Пластинка удалена из архива.", tlh: "memvo' QoQ teqlu'pu'." },
  "Album details copied to clipboard.": { es: "Detalles del álbum copiados al portapapeles.", pt: "Detalhes do álbum copiados.", fr: "Détails de l'album copiés.", de: "Albumdetails in die Zwischenablage kopiert.", id: "Detail album disalin ke papan klip.", ja: "アルバム情報をクリップボードにコピーしました。", zh: "专辑详情已复制到剪贴板。", hi: "एल्बम विवरण क्लिपबोर्ड पर कॉपी किया गया।", bn: "অ্যালবামের তথ্য কপি করা হয়েছে।", ur: "البم کی تفصیلات کاپی ہو گئیں۔", ar: "تم نسخ تفاصيل الألبوم إلى الحافظة.", ru: "Описание альбома скопировано.", tlh: "QoQ De' lIlta'." },
  "1-Tap Clone Link copied! Anyone opening it gets this pressing.": { es: "¡Enlace de clonación copiado! Quien lo abra recibirá este disco.", pt: "Link de clonagem copiado! Quem abrir receberá este disco.", fr: "Lien de clonage copié ! Quiconque l'ouvre recevra ce disque.", de: "1-Klick-Klon-Link kopiert!", id: "Tautan klon 1-ketuk disalin! Siapa pun yang membukanya akan mendapat piringan ini.", ja: "1タップ複製リンクをコピーしました！", zh: "一键克隆链接已复制！任何人打开即可获得此唱片。", hi: "1-टैप क्लोन लिंक कॉपी हो गया!", bn: "১-ট্যাপ ক্লোন লিঙ্ক কপি হয়েছে!", ur: "1-ٹیپ کلون لنک کاپی ہو گیا!", ar: "تم نسخ رابط الاستنساخ الفوري!", ru: "Ссылка-клон скопирована!", tlh: "DNA Link lIlta'!" },
  "Pressing DNA code copied! Paste in Custom Drop Studio to clone.": { es: "¡Código ADN copiado! Pégalo en el Estudio Personalizado.", pt: "Código DNA copiado! Cole no Estúdio Personalizado.", fr: "Code ADN copié ! Collez-le dans le Studio sur Mesure.", de: "DNA-Code kopiert! Im Eigenen Studio einfügen.", id: "Kode DNA disalin! Tempel di Studio Rilisan Kustom.", ja: "DNAコードをコピーしました！カスタム制作スタジオで復元できます。", zh: "唱片DNA代码已复制！可在自定义工作室粘贴克隆。", hi: "प्रेसिंग DNA कोड कॉपी हो गया!", bn: "DNA কোড কপি হয়েছে!", ur: "DNA کوڈ کاپی ہو گیا!", ar: "تم نسخ كود DNA!", ru: "ДНК-код скопирован!", tlh: "DNA ngoq lIlta'!" },
  "Sleeve graphics saved.": { es: "Imágenes de la funda guardadas.", pt: "Imagens da capa salvas.", fr: "Images de la pochette enregistrées.", de: "Cover-Grafiken gespeichert.", id: "Gambar sampul disimpan.", ja: "ジャケット画像を保存しました。", zh: "封套图片已保存。", hi: "कवर इमेज सेव हो गईं।", bn: "কভার ছবি সেভ হয়েছে।", ur: "کور تصاویر محفوظ ہو گئیں۔", ar: "تم حفظ صور الغلاف.", ru: "Изображения обложки сохранены.", tlh: "Dech mIllogh polta'." },
  "Applied original photo (as-is) to current sleeve.": { es: "Foto original aplicada a la portada actual.", pt: "Foto original aplicada à capa atual.", fr: "Photo originale appliquée à la pochette.", de: "Originalfoto auf aktuelles Cover angewendet.", id: "Foto asli diterapkan ke sampul saat ini.", ja: "元の写真をそのままジャケットに適用しました。", zh: "已将原图应用到当前封套。", hi: "मूल फ़ोटो वर्तमान कवर पर लगाई गई।", bn: "আসল ছবি কভারে প্রয়োগ করা হয়েছে।", ur: "اصل تصویر موجودہ کور پر لگا دی گئی۔", ar: "تم تطبيق الصورة الأصلية على الغلاف الحالي.", ru: "Оригинальное фото применено к обложке.", tlh: "mIllogh chu' lo'ta'." },
  "📻 College Radio ON: Auto-spinning your crate!": { es: "📻 Radio Universitaria ACTIVA: ¡Girando tu caja!", pt: "📻 Rádio Universitária LIGADA: Tocando sua caixa!", fr: "📻 Radio Campus ACTIVE : Lecture auto de votre caisse !", de: "📻 Campus-Radio AN: Deine Kiste rotiert!", id: "📻 Radio Kampus AKTIF: Memutar kotak Anda otomatis!", ja: "📻 カレッジラジオ ON：クレートを自動連続再生中！", zh: "📻 校园电台已开启：正在自动连播您的唱片箱！", hi: "📻 कॉलेज रेडियो चालू: आपका क्रेट ऑटो-स्पिन हो रहा है!", bn: "📻 কলেজ রেডিও চালু: আপনার ক্রেট অটো-স্পিন হচ্ছে!", ur: "📻 کالج ریڈیو آن: آپ کا کریٹ خودکار چل رہا ہے!", ar: "📻 راديو الجامعة يعمل: تشغيل تلقائي لصندوقك!", ru: "📻 Радио ВКЛ: Автопроигрывание вашего ящика!", tlh: "📻 wab chu': ngaSwI'lIj chu'taH!" },
  "📻 College Radio Auto-Spin stopped.": { es: "📻 Radio Universitaria detenida.", pt: "📻 Rádio Universitária parada.", fr: "📻 Radio Campus arrêtée.", de: "📻 Campus-Radio gestoppt.", id: "📻 Putar-Otomatis Radio dihentikan.", ja: "📻 カレッジラジオの自動再生を停止しました。", zh: "📻 校园电台自动连播已停止。", hi: "📻 कॉलेज रेडियो ऑटो-स्पिन बंद।", bn: "📻 কলেজ রেডিও বন্ধ হয়েছে।", ur: "📻 کالج ریڈیو رک گیا۔", ar: "📻 توقف التشغيل التلقائي للراديو.", ru: "📻 Авто-радио остановлено.", tlh: "📻 wab mevpu'." },
  "Today's Selection": { fr: "Sélection du Jour", de: "Heutige Auswahl", id: "Pilihan Hari Ini", bn: "আজকের নির্বাচন", ur: "آج کا انتخاب", ar: "اختيار اليوم", tlh: "DaHjaj wIv" },
  "Ready for your daily drop": { fr: "Prêt pour votre tirage du jour", de: "Bereit für die Tages-Pressung", id: "Siap untuk rilisan harian Anda", bn: "আপনার ডেইলি ড্রপের জন্য প্রস্তুত", ur: "آپ کے ڈیلی ڈراپ کے لیے تیار", ar: "جاهز لإصدار اليوم", tlh: "DaHjaj QoQvaD ghuH" },
  "Vinyl Crate Archive": { fr: "Archive de Caisses Vinyles", de: "Plattenkisten-Archiv", id: "Arsip Kotak Vinil", bn: "ভিনাইল ক্রেট আর্কাইভ", ur: "وینائل کریٹ آرکائیو", ar: "أرشيف صندوق الفينيل", tlh: "QoQ ngaSwI' mem" },
  "Crate Slots:": { fr: "Emplacements :", de: "Plätze:", id: "Slot Kotak:", bn: "ক্রেট স্লট:", ur: "کریٹ سلاٹ:", ar: "خانات الصندوق:", tlh: "ngaSwI'Daq:" },
  "(Full)": { fr: "(Plein)", de: "(Voll)", id: "(Penuh)", bn: "(পূর্ণ)", ur: "(مکمل)", ar: "(ممتلئ)", tlh: "(buy')" },
  "Auto-Spin": { fr: "Auto-Lecture", de: "Auto-Radio", id: "Putar-Otomatis", bn: "অটো-স্পিন", ur: "آٹو اسپن", ar: "تشغيل تلقائي", tlh: "chu'taH" },
  "Radio ON": { fr: "Radio ACTIVE", de: "Radio AN", id: "Radio AKTIF", bn: "রেডিও চালু", ur: "ریڈیو آن", ar: "الراديو يعمل", tlh: "wab chu'" },
  "All Records (": { fr: "Tous les Disques (", de: "Alle Platten (", id: "Semua Piringan (", bn: "সব রেকর্ড (", ur: "تمام ریکارڈز (", ar: "كل الاسطوانات (", tlh: "Hoch QoQ (" },
  "Favorites (": { fr: "Favoris (", de: "Favoriten (", id: "Favorit (", bn: "পছন্দের (", ur: "پسندیدہ (", ar: "المفضلة (", tlh: "parHa' (" },
  "Search band, title, catalog...": { fr: "Chercher groupe, titre, réf...", de: "Band, Titel, Katalog suchen...", id: "Cari band, judul, katalog...", bn: "ব্যান্ড, শিরোনাম, ক্যাটালগ খুঁজুন...", ur: "بینڈ، عنوان، کیٹلاگ تلاش کریں...", ar: "ابحث عن فرقة، ألبوم، رقم...", tlh: "ghom, pong, mI' nej..." },
  "Zoom": { fr: "Zoom", de: "Zoom", id: "Perbesar", bn: "জুম", ur: "زوم", ar: "تكبير", tlh: "tInmoH" },
  "↺ Flip": { fr: "↺ Verso", de: "↺ Wenden", id: "↺ Balik", bn: "↺ উল্টান", ur: "↺ پلٹیں", ar: "↺ اقلب", tlh: "↺ choH" },
  "Read ↗": { fr: "Lire ↗", de: "Lesen ↗", id: "Baca ↗", bn: "পড়ুন ↗", ur: "پڑھیں ↗", ar: "اقرأ ↗", tlh: "laD ↗" },
  "Select a photo to retouch the active sleeve:": { fr: "Sélectionnez une photo pour retoucher la pochette :", de: "Foto wählen, um das aktuelle Cover zu bearbeiten:", id: "Pilih foto untuk memoles sampul aktif:", bn: "কভার সাজাতে একটি ছবি বেছে নিন:", ur: "کور کو سجانے کے لیے تصویر منتخب کریں:", ar: "اختر صورة لتعديل الغلاف الحالي:", tlh: "mIllogh choHmeH mIllogh wIv:" },
  "Click Darkroom Filter repeatedly to cycle styles:": { fr: "Cliquez sur Filtre Chambre Noire pour changer de style :", de: "Dunkelkammer-Filter mehrmals klicken, um Stile zu wechseln:", id: "Klik Filter Kamar Gelap berulang kali untuk ganti gaya:", bn: "স্টাইল বদলাতে ডার্করুম ফিল্টার বারবার চাপুন:", ur: "انداز بدلنے کے لیے ڈارک روم فلٹر بار بار دبائیں:", ar: "اضغط فلتر الغرفة المظلمة لتبديل الأنماط:", tlh: "Hurgh Filter pIj yI'uy:" },
  "Select Photo": { fr: "Choisir Photo", de: "Foto Wählen", id: "Pilih Foto", bn: "ছবি বেছে নিন", ur: "فوٹو منتخب کریں", ar: "اختر صورة", tlh: "mIllogh wIv" },
  "Change": { fr: "Changer", de: "Ändern", id: "Ganti", bn: "বদলান", ur: "بدلیں", ar: "تغيير", tlh: "choH" },
  "Remove": { fr: "Retirer", de: "Entfernen", id: "Hapus", bn: "সরান", ur: "ہٹائیں", ar: "إزالة", tlh: "teq" },
  "Darkroom Filter": { fr: "Filtre Chambre Noire", de: "Dunkelkammer-Filter", id: "Filter Kamar Gelap", bn: "ডার্করুম ফিল্টার", ur: "ڈارک روم فلٹر", ar: "فلتر الغرفة المظلمة", tlh: "Hurgh Filter" },
  "Use Photo (As-Is)": { fr: "Photo Originale", de: "Originalfoto Nutzen", id: "Gunakan Foto Asli", bn: "আসল ছবি ব্যবহার করুন", ur: "اصل تصویر لگائیں", ar: "استخدم الصورة كما هي", tlh: "mIllogh lo'" },
  "Export & Share Pressing": { fr: "Exporter & Partager le Disque", de: "Pressung Exportieren & Teilen", id: "Ekspor & Bagikan Rilisan", bn: "রেকর্ড এক্সপোর্ট ও শেয়ার", ur: "ریکارڈ ایکسپورٹ اور شیئر کریں", ar: "تصدير ومشاركة الاسطوانة", tlh: "QoQ ngeH 'ej juS" },
  "Instant Pressing Clone (Link or DNA)": { fr: "Clone Instantané (Lien ou ADN)", de: "Sofort-Klon (Link oder DNA)", id: "Klon Instan (Tautan atau DNA)", bn: "ইনস্ট্যান্ট রেকর্ড ক্লোন (লিঙ্ক বা DNA)", ur: "فوری ریکارڈ کلون (لنک یا DNA)", ar: "استنساخ فوري (رابط أو DNA)", tlh: "QoQ velwI' (DNA)" },
  "Copy Clone Link": { fr: "Copier Lien Clone", de: "Klon-Link Kopieren", id: "Salin Tautan Klon", bn: "ক্লোন লিঙ্ক কপি করুন", ur: "کلون لنک کاپی کریں", ar: "نسخ رابط الاستنساخ", tlh: "DNA Link lIl" },
  "Raw DNA": { fr: "ADN Brut", de: "Roh-DNA", id: "DNA Mentah", bn: "র DNA", ur: "خام DNA", ar: "كود DNA", tlh: "DNA ngoq" },
  "Sleeve Artwork": { fr: "Illustrations de Pochette", de: "Cover-Grafiken", id: "Gambar Sampul", bn: "কভার আর্টওয়ার্ক", ur: "کور آرٹ ورک", ar: "رسوم الغلاف", tlh: "Dech mIllogh" },
  "Front Cover": { fr: "Recto Pochette", de: "Vorderseite", id: "Sampul Depan", bn: "সামনের কভার", ur: "سامنے والا کور", ar: "الغلاف الأمامي", tlh: "bI'reS Dech" },
  "Back Liner": { fr: "Verso Pochette", de: "Rückseite", id: "Sampul Belakang", bn: "পিছনের কভার", ur: "پچھلا کور", ar: "الغلاف الخلفي", tlh: "'em Dech" },
  "Text & Metadata": { fr: "Texte & Métadonnées", de: "Text & Metadaten", id: "Teks & Metadata", bn: "টেক্সট ও মেটাডেটা", ur: "ٹیکسٹ اور میٹا ڈیٹا", ar: "النص والبيانات", tlh: "ghItlh & De'" },
  "Share Selected Payload": { fr: "Partager la Sélection", de: "Auswahl Teilen", id: "Bagikan Pilihan", bn: "নির্বাচিত তথ্য শেয়ার করুন", ur: "منتخب مواد شیئر کریں", ar: "مشاركة العناصر المحددة", tlh: "wIvta'bogh ngeH" },
  "Copy Text": { fr: "Copier Texte", de: "Text Kopieren", id: "Salin Teks", bn: "টেক্সট কপি", ur: "ٹیکسٹ کاپی", ar: "نسخ النص", tlh: "ghItlh lIl" },
  "Save Images": { fr: "Enregistrer Images", de: "Bilder Speichern", id: "Simpan Gambar", bn: "ছবি সেভ করুন", ur: "تصاویر محفوظ کریں", ar: "حفظ الصور", tlh: "mIllogh pol" },
  "Apparel Fabrication Terminal": { fr: "Terminal d'Impression Textile", de: "Textildruck-Terminal", id: "Terminal Sablon Kaos", bn: "অ্যাপারেল প্রিন্টিং টার্মিনাল", ur: "ملبوسات پرنٹنگ ٹرمینل", ar: "محطة طباعة الملابس", tlh: "Sut chovnatlh Terminal" },
  "300 DPI Print PNGs • Save Locally & Self-Upload": { fr: "PNG 300 DPI • Enregistrer & Téléverser sur la Boutique", de: "300 DPI Druck-PNGs • Lokal Speichern & Hochladen", id: "PNG Cetak 300 DPI • Simpan & Unggah ke Toko", bn: "৩০০ DPI প্রিন্ট PNG • সেভ করে নিজে আপলোড করুন", ur: "300 DPI پرنٹ PNG • محفوظ کریں اور اپ لوڈ کریں", ar: "صور PNG بدقة 300 DPI • احفظها محلياً وارفعها للمتجر", tlh: "300 DPI PNG • pol 'ej ngeH" },
  "Front: Chest": { fr: "Avant : Poitrine", de: "Vorn: Brust", id: "Depan: Dada", bn: "সামনে: বুক", ur: "سامنے: سینہ", ar: "الأمام: الصدر", tlh: "bI'reS: ID" },
  "Save Front": { fr: "Enreg. Avant", de: "Vorn Speichern", id: "Simpan Depan", bn: "সামনে সেভ", ur: "فرنٹ محفوظ", ar: "حفظ الأمام", tlh: "bI'reS pol" },
  "Back: Tour": { fr: "Dos : Tournée", de: "Hinten: Tour", id: "Belakang: Tur", bn: "পিছনে: ট্যুর", ur: "پیچھے: ٹور", ar: "الخلف: الجولة", tlh: "'em: leng" },
  "Save Back": { fr: "Enreg. Dos", de: "Hinten Speichern", id: "Simpan Belakang", bn: "পিছনে সেভ", ur: "بیک محفوظ", ar: "حفظ الخلف", tlh: "'em pol" },
  "Front Print Format": { fr: "Format d'Impression Avant", de: "Vorderseiten-Format", id: "Format Cetak Depan", bn: "সামনের প্রিন্ট ফরম্যাট", ur: "فرنٹ پرنٹ فارمیٹ", ar: "تنسيق الطباعة الأمامية", tlh: "bI'reS mIllogh" },
  "Isolated Cutout": { fr: "Découpe Isolée (Transparent)", de: "Freigestellter Ausschnitt", id: "Potongan Transparan", bn: "স্বচ্ছ কাটআউট", ur: "شفاف کٹ آؤٹ", ar: "قص مفرغ شفاف", tlh: "pe'ta'bogh mIllogh" },
  "Full Sleeve Plaque": { fr: "Plaque Pochette Complète", de: "Vollständiges Cover-Quadrat", id: "Plakat Sampul Penuh", bn: "সম্পূর্ণ কভার ফলক", ur: "مکمل البم کور", ar: "لوحة الغلاف الكاملة", tlh: "Dech naQ" },
  "Tour Schedule (Back Print)": { fr: "Dates de Tournée (Dos)", de: "Tourdaten (Rückendruck)", id: "Jadwal Tur (Cetak Belakang)", bn: "ট্যুর সূচি (পিছনের প্রিন্ট)", ur: "ٹور شیڈول (بیک پرنٹ)", ar: "جدول الجولة (طباعة الخلف)", tlh: "leng mI' ('em)" },
  "Canonical '77 Circuit": { fr: "Circuit Canonique '77", de: "Kanonische '77er Tour", id: "Sirkuit Kanonik '77", bn: "ক্যাননিক্যাল '৭৭ সার্কিট", ur: "کینونیکل '77 سرکٹ", ar: "جولة 77 الكلاسيكية", tlh: "'77 Qo'noS leng" },
  "Municipal Lore Circuit": { fr: "Circuit Municipal", de: "Kommunale Lore-Tour", id: "Sirkuit Kota", bn: "মিউনিসিপ্যাল সার্কিট", ur: "بلدیاتی سرکٹ", ar: "الجولة البلدية", tlh: "yoS leng" },
  "Mixed Mashup Circuit (Randomized)": { fr: "Circuit Mixte (Aléatoire)", de: "Gemischte Tour (Zufällig)", id: "Sirkuit Campuran (Acak)", bn: "মিশ্র ট্যুর সার্কিট (র‍্যান্ডম)", ur: "مخلوط ٹور سرکٹ", ar: "جولة مختلطة (عشوائية)", tlh: "leng DuD (mIS)" },
  "Custom Tour Stop (One-Off / Non-Persistent):": { fr: "Ville sur Mesure (Cet export uniquement) :", de: "Eigener Tour-Stopp (Nur dieser Export):", id: "Kota Tur Kustom (Khusus ekspor ini):", bn: "কাস্টম ট্যুর স্টপ (শুধু এই এক্সপোর্টের জন্য):", ur: "کسٹم ٹور اسٹاپ (صرف اس بار):", ar: "محطة جولة مخصصة (لهذا التصدير فقط):", tlh: "leng Daq chu' (DaH neH):" },
  "Back Ink Pigment:": { fr: "Encre du Dos :", de: "Rücken-Druckfarbe:", id: "Warna Tinta Belakang:", bn: "পিছনের কালির রঙ:", ur: "بیک سیاہی کا رنگ:", ar: "لون حبر الخلف:", tlh: "'em rItlh:" },
  "Crimson Red": { fr: "Rouge Cramoisi", de: "Karmesinrot", id: "Merah Tua", bn: "গাঢ় লাল", ur: "قرمزی سرخ", ar: "أحمر قرمزي", tlh: "'Iw Doq" },
  "Amber Gold": { fr: "Or Ambré", de: "Bernsteingold", id: "Emas Amber", bn: "অ্যাম্বার গোল্ড", ur: "عنبر سنہری", ar: "ذهبي كهرماني", tlh: "qol'om SuD" },
  "Warm Eggshell": { fr: "Blanc Coquille", de: "Eierschalenweiß", id: "Putih Gading", bn: "হালকা ক্রিম", ur: "ہلکا کریم", ar: "أبيض عاجي", tlh: "chIS" },
  "Manual Upload Required (Images Do Not Auto-Fill)": { fr: "Téléversement Manuel Requis (Pas de remplissage auto)", de: "Manuelles Hochladen Erforderlich (Kein Auto-Fill)", id: "Wajib Unggah Manual (Gambar Tidak Otomatis Masuk)", bn: "ম্যানুয়াল আপলোড প্রয়োজন (ছবি একা লোড হয় না)", ur: "دستی اپ لوڈ ضروری ہے (تصاویر خودکار نہیں بھرتیں)", ar: "يلزم الرفع اليدوي (الصور لا تُملأ تلقائياً)", tlh: "cha'DIch ngeH (De'wI' ngeHbe')" },
  "Notice: No Affiliation With Vendors": { fr: "Avis : Aucune Affiliation avec les Boutiques", de: "Hinweis: Keine Verbindung zu Anbietern", id: "Catatan: Tidak Berafiliasi dengan Penyedia", bn: "বিজ্ঞপ্তি: বিক্রেতাদের সাথে কোনো সম্পর্ক নেই", ur: "نوٹس: دکانداروں سے کوئی تعلق نہیں", ar: "تنبيه: لا توجد أي علاقة تجارية مع المتاجر", tlh: "yaj: ngevwI'pu' DIpIm" },
  "Step 1: Save 300 DPI": { fr: "Étape 1 : Enregistrer 300 DPI", de: "Schritt 1: 300 DPI Speichern", id: "Langkah 1: Simpan 300 DPI", bn: "ধাপ ১: ৩০০ DPI সেভ করুন", ur: "مرحلہ 1: 300 DPI محفوظ کریں", ar: "الخطوة 1: حفظ بدقة 300 DPI", tlh: "mIw 1: 300 DPI pol" },
  "Front & Back PNGs": { fr: "(PNG Avant & Dos)", de: "(Vorn & Hinten PNGs)", id: "(PNG Depan & Belakang)", bn: "(সামনে ও পিছনের PNG)", ur: "(فرنٹ اور بیک PNG)", ar: "(ملفات الأمام والخلف)", tlh: "(bI'reS 'em je PNG)" },
  "Step 2: Open Blank Shirt Designer (Upload Your Saved PNGs There)": { fr: "Étape 2 : Ouvrir l'Atelier T-Shirt (Téléversez vos PNG là-bas)", de: "Schritt 2: T-Shirt-Designer Öffnen (PNGs dort hochladen)", id: "Langkah 2: Buka Desainer Kaos (Unggah PNG Anda di Sana)", bn: "ধাপ ২: টি-শার্ট ডিজাইনার খুলুন (সেখানে PNG আপলোড করুন)", ur: "مرحلہ 2: ٹی شرٹ ڈیزائنر کھولیں (وہاں PNG اپ لوڈ کریں)", ar: "الخطوة 2: افتح مصمم القمصان (ارفع ملفات PNG هناك)", tlh: "mIw 2: Sut chenmoHwI' poSmoH" },
  "Custom Drop Studio": { fr: "Studio de Pressage sur Mesure", de: "Eigenes Presswerk-Studio", id: "Studio Rilisan Kustom", bn: "কাস্টম ড্রপ স্টুডিও", ur: "کسٹم ڈراپ اسٹوڈیو", ar: "استوديو الإصدار المخصص", tlh: "QoQ chenmoHwI'" },
  "Operator's Guide & Data Sheet": { fr: "Guide de l'Opérateur & Fiche Technique", de: "Bedienungsanleitung & Datenblatt", id: "Panduan Operator & Lembar Data", bn: "অপারেটর গাইড ও ডেটা শিট", ur: "آپریٹر گائیڈ اور ڈیٹا شیٹ", ar: "دليل المشغل وورقة البيانات", tlh: "lo'wI' paq & De'" },
  "Field Guide": { fr: "Guide Pratique", de: "Handbuch", id: "Panduan", bn: "ফিল্ড গাইড", ur: "فیلڈ گائیڈ", ar: "دليل الاستخدام", tlh: "lo' paq" },
  "Data Sheet & Credits": { fr: "Fiche Technique & Crédits", de: "Datenblatt & Credits", id: "Spesifikasi & Kredit", bn: "ডেটা শিট ও ক্রেডিট", ur: "ڈیٹا شیٹ اور کریڈٹ", ar: "المواصفات والحقوق", tlh: "Jan De'" },
  "Understood": { fr: "Compris", de: "Verstanden", id: "Mengerti", bn: "বুঝেছি", ur: "سمجھ گیا", ar: "مفهوم", tlh: "yajchu'" },
  "Y.D.R.B.N. System Settings": { fr: "Paramètres Système Y.D.R.B.N.", de: "Y.D.R.B.N. Systemeinstellungen", id: "Pengaturan Sistem Y.D.R.B.N.", bn: "Y.D.R.B.N. সিস্টেম সেটিংস", ur: "Y.D.R.B.N. سسٹم سیٹنگز", ar: "إعدادات نظام Y.D.R.B.N.", tlh: "Y.D.R.B.N. SeHlaw" },
  "The Cargo Bay": { fr: "La Soute (Packs)", de: "Der Frachtraum", id: "Ruang Kargo", bn: "কার্গো বে (প্যাক)", ur: "کارگو بے", ar: "عنبر الشحن (الحزم)", tlh: "tep Duj" },
  "Director's Chair": { fr: "Fauteuil du Réalisateur", de: "Regiestuhl", id: "Kursi Sutradara", bn: "ডিরেক্টরস চেয়ার", ur: "ڈائریکٹرز چیئر", ar: "كرسي المخرج", tlh: "ra'wI' quS" },
  "The Crate Forge": { fr: "La Forge de Caisses", de: "Die Kisten-Schmiede", id: "Tempaan Kotak", bn: "ক্রেট ফোর্জ", ur: "کریٹ فورج", ar: "مسبك الصناديق", tlh: "ngaSwI' chenmoHwI'" },
  "New Crate": { fr: "Nouvelle Caisse", de: "Neue Kiste", id: "Kotak Baru", bn: "নতুন ক্রেট", ur: "نیا کریٹ", ar: "صندوق جديد", tlh: "chu'" },
  "Interface Color Mode": { fr: "Mode de Couleur", de: "Farbmodus", id: "Mode Warna Antarmuka", bn: "ইন্টারফেস কালার মোড", ur: "انٹرفیس کلر موڈ", ar: "نمط ألوان الواجهة", tlh: "rItlh SeH" },
  "App & Content Updates": { fr: "Mises à Jour App & Packs", de: "App- & Paket-Updates", id: "Pembaruan Aplikasi & Paket", bn: "অ্যাপ ও কনটেন্ট আপডেট", ur: "ایپ اور مواد اپ ڈیٹس", ar: "تحديثات التطبيق والحزم", tlh: "chu'moH" },
  "Maintenance, Cache & Reset": { fr: "Maintenance, Cache & Réinitialisation", de: "Wartung, Cache & Reset", id: "Pemeliharaan, Cache & Reset", bn: "রক্ষণাবেক্ষণ, ক্যাশে ও রিসেট", ur: "دیکھ بھال، کیش اور ری سیٹ", ar: "الصيانة والتخزين المؤقت وإعادة الضبط", tlh: "qa'meH & Reset" },
  "Done": { fr: "Terminé", de: "Fertig", id: "Selesai", bn: "সম্পন্ন", ur: "مکمل", ar: "تم", tlh: "pItlh" },
  "Close": { fr: "Fermer", de: "Schließen", id: "Tutup", bn: "বন্ধ করুন", ur: "بند کریں", ar: "إغلاق", tlh: "SoQmoH" },
  "Back": { fr: "Retour", de: "Zurück", id: "Kembali", bn: "পিছনে", ur: "واپس", ar: "رجوع", tlh: "chegh" }
};

export function translateUiString(raw: string, lang: SupportedLocale): string {
  if (lang === 'pig') return toPigLatinText(raw);
  if (lang === 'en') return raw;
  const trimmed = raw.replace(/\s+/g, ' ').trim();
  if (!trimmed) return raw;

  const lead = /^\s/.test(raw) ? ' ' : '';
  const trail = /\s$/.test(raw) ? ' ' : '';

  const extra = EXTRA_PHRASES[trimmed]?.[lang];
  if (extra) {
    return `${lead}${extra}${trail}`;
  }

  const exact = NORMALIZED_LOOKUP.get(trimmed);
  if (exact && (exact as any)[lang]) {
    return `${lead}${(exact as any)[lang]}${trail}`;
  }

  const dyn = translateDynamicPattern(trimmed, lang);
  if (dyn) return dyn;

  return raw;
}

function shouldSkipTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return true;
  const tag = parent.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'CODE') {
    return true;
  }
  if (parent.closest('[data-i18n-rich="true"]')) {
    return true;
  }
  const inFrontSleeve = parent.closest('#sleeve-front');
  if (inFrontSleeve && !parent.closest('.export-exclude')) {
    return true;
  }
  return false;
}

function processRichElement(el: HTMLElement, lang: SupportedLocale) {
  if (el.tagName !== 'P' && el.tagName !== 'DIV' && el.tagName !== 'SPAN') return;
  if (el.children.length === 0) return;

  // Only inspect leaf text blocks that contain inline formatting tags (STRONG / EM / SPAN)
  const hasOnlyInlineChildren = Array.from(el.children).every((c) =>
    ['STRONG', 'B', 'EM', 'I', 'SPAN'].includes(c.tagName)
  );
  if (!hasOnlyInlineChildren) return;

  if (!el.dataset.origRichText) {
    const norm = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (NORMALIZED_RICH_LOOKUP.has(norm)) {
      el.dataset.origRichText = norm;
      el.dataset.origRichHtml = el.innerHTML;
      el.setAttribute('data-i18n-rich', 'true');
    } else {
      return;
    }
  }

  const key = el.dataset.origRichText!;
  const entry = NORMALIZED_RICH_LOOKUP.get(key);
  if (!entry) return;

  const targetHtml =
    lang === 'en'
      ? el.dataset.origRichHtml!
      : lang === 'pig'
      ? toPigLatinHtml(el.dataset.origRichHtml!)
      : (entry as any)[lang] || el.dataset.origRichHtml!;
  if (el.innerHTML !== targetHtml) {
    el.innerHTML = targetHtml;
  }
}

function processTextNode(node: Text, lang: SupportedLocale) {
  if (shouldSkipTextNode(node)) return;
  const currentVal = node.nodeValue || '';
  if (!currentVal.trim()) return;

  const anyNode = node as any;
  if (anyNode.__origEn === undefined || (anyNode.__lastLoc !== undefined && currentVal !== anyNode.__lastLoc)) {
    anyNode.__origEn = currentVal;
  }

  const orig: string = anyNode.__origEn;
  const target = lang === 'en' ? orig : translateUiString(orig, lang);

  if (currentVal !== target) {
    anyNode.__lastLoc = target;
    node.nodeValue = target;
  } else {
    anyNode.__lastLoc = target;
  }
}

function processElementAttributes(el: HTMLElement, lang: SupportedLocale) {
  processRichElement(el, lang);

  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const curPh = el.getAttribute('placeholder');
    if (curPh) {
      if (!el.dataset.origPh || (el.dataset.lastPh && curPh !== el.dataset.lastPh)) {
        el.dataset.origPh = curPh;
      }
      const nextPh = lang === 'en' ? el.dataset.origPh : translateUiString(el.dataset.origPh, lang).trim();
      if (curPh !== nextPh) {
        el.dataset.lastPh = nextPh;
        el.setAttribute('placeholder', nextPh);
      }
    }

    // Translate default author input value ("Anonymous Archivist") if untouched by user
    if (
      el instanceof HTMLInputElement &&
      (el.value === 'Anonymous Archivist' || el.dataset.origDefaultVal === 'Anonymous Archivist')
    ) {
      el.dataset.origDefaultVal = 'Anonymous Archivist';
      const nextVal =
        lang === 'en'
          ? 'Anonymous Archivist'
          : translateUiString('Anonymous Archivist', lang).trim();
      if (el.value !== nextVal) {
        el.value = nextVal;
      }
    }
  }
}

export function applyDomLocalization(root: Node = document.body) {
  if (typeof document === 'undefined' || !root) return;
  const lang = resolveActiveLocale();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr';

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let current: Node | null = walker.currentNode;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      processElementAttributes(current as HTMLElement, lang);
    } else if (current.nodeType === Node.TEXT_NODE) {
      processTextNode(current as Text, lang);
    }
    current = walker.nextNode();
  }
}

let observerInitialized = false;

export function initDomLocalizationObserver() {
  if (typeof document === 'undefined' || observerInitialized) return;
  observerInitialized = true;

  applyDomLocalization(document.body);

  const observer = new MutationObserver((mutations) => {
    const lang = resolveActiveLocale();
    for (const m of mutations) {
      if (m.type === 'characterData' && m.target.nodeType === Node.TEXT_NODE) {
        processTextNode(m.target as Text, lang);
      } else if (m.type === 'childList') {
        m.addedNodes.forEach((added) => {
          if (added.nodeType === Node.TEXT_NODE) {
            processTextNode(added as Text, lang);
          } else if (added.nodeType === Node.ELEMENT_NODE) {
            applyDomLocalization(added);
          }
        });
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
