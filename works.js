// 研究成果：用 AI 代理人做出來的網頁。對外文字只寫需求、做法、成果，不寫人名與內部用語。
// 分類：研究成果彈窗的頁籤，沒有作品的分類不顯示。
export const categories=[
  {id:'3d',label:'3D 與建築'},
  {id:'method',label:'方法研究'},
  {id:'tools',label:'實務工具'},
  {id:'media',label:'影像創作'},
  {id:'site',label:'本站製作'}
];

// 簡報：每本一組頁面圖（1600×900，p01.jpg 起），可附 PDF。
export const decks={};
decks.conch={
  title:'築匠海洋館｜虛實整合研究簡報',
  pages:50,
  dir:'./assets/works/conch-deck',
  pdf:'./assets/works/conch-deck/conch-museum-deck.pdf',
  pdfSize:'5.8 MB',
  chapters:[
    {page:1,title:'封面與數字'},{page:6,title:'一　起點'},{page:10,title:'二　判讀'},{page:16,title:'三　製作'},
    {page:25,title:'四　修正'},{page:39,title:'五　虛實對照'},{page:46,title:'六　細節'},{page:49,title:'七　數據與結論'}
  ]
};

decks.theatre={
  title:'《燈火未熄》創作紀實',
  pages:11,
  dir:'./assets/works/theatre-deck'
};

decks.miaoli={title:'苗栗透天宅｜九階段精華簡報',pages:10,dir:'./assets/works/miaoli-deck'};
decks.indigenous={title:'原住民族教育推廣中心｜競圖研究成果簡報（練習案）',pages:16,dir:'./assets/works/indigenous-deck'};
decks.argon={title:'Argon 測試檢討',pages:10,dir:'./assets/works/argon-deck'};
decks.conchreport={title:'築匠海洋館｜階段性結案報告',label:'階段報告',pages:96,dir:'./assets/works/conchreport-deck',portrait:true};

export const featured={
  id:'conch',cat:'3d',deck:'conch',moreDecks:['conchreport'],thumb:'conch-museum',tag:'3D 場景・研究簡報',
  title:'築匠海洋館｜從 AI 生成圖到走得進去的 3D 場景',
  url:'https://balli425.github.io/cta-conch-museum-3d/',
  summary:'只有九張 AI 生成的概念圖、沒有任何尺寸，一天之內判讀出尺度、造型、材質與光線，建成可以飛行、步行、上下樓的線上 3D 場景，並與原圖同角度對照。',
  stats:[['9 張','AI 生成參考圖'],['1 天','完成建置'],['10 輪','審閱與修正'],['50 頁','研究簡報']],
  period:'2026-11-16（單日完成）',
  need:'依九張沒有尺寸的 AI 生成概念圖，建置可以從外部瀏覽、也能走進室內的寫實線上 3D 場景，並且連結即可分享。',
  method:[
    '判讀：以人、樓層、船與總平面比例尺推估尺度；拆出十一片交疊穹頂；從反光與顏色讀出材質與光線',
    '製作：Blender＋Python 以參數產生全部模型，three.js 網頁即時算圖，四個背景助手同時處理天空材質、人物、船舶與植栽',
    '修正：十輪審閱，從憑印象、同角度並排，改為疊圖比對，兩版就讓輪廓對上',
    '驗證：以真實點擊與按鍵測試、逐點檢查落點與樓板、模擬步行走完八座樓梯'
  ],
  result:[
    '線上 3D 場景：飛行、步行、上下樓，白天、黃昏、夜晚三個時段',
    '透視選單與場景標記：鏡頭移到原圖角度，可在原圖與模型之間漸變對照',
    '50 頁研究簡報：判讀、製作、修正與虛實對照的完整紀錄'
  ]
};

export const works=[
  {id:'miaoli',cat:'3d',thumb:'miaoli-teardown',video:{src:'./assets/works/video/teardown-demo.mp4',label:'播放示範・1 分鐘'},tag:'3D 互動・結構',title:'苗栗透天宅｜結構拆解 3D 互動頁',url:'https://balli425.github.io/cta-miaoli-house-teardown/',
   summary:'錯層中庭透天住宅，外皮、牆、樓板與梁、柱、基礎可以一層層拆開再組回，逐層透視並顯示構件尺寸與數量。',
   period:'2026-11-07（單日完成）',
   need:'簡報時用可以操作的 3D 頁面說明結構：由外皮、牆、柱到基礎逐層拆解與組裝；單一檔案即可開啟，手機也能看。',
   method:[
     'AI 代理人開發 3D 網頁，構件尺寸與設計模型一致',
     '每一版都實際操作測試：點擊、拖曳、手機觸控'
   ],
   result:[
     '拆解滑桿、單層檢視、剖切、四種視角、1F～RF 等角透視、外觀與室內透視圖、自動導覽',
     '結構資訊：RC 柱 30×80 公分 8 支、11 個樓板高程、前後棟錯開半層 1.6 公尺',
     '版本由 V1 演進到 V3.1（手機版與手機手勢），附自動導覽示範影片'
   ]},
  {id:'gem',cat:'tools',thumb:'gem-dashboard',tag:'AI 助理整合',title:'築匠 AI 助理｜Gem 前後對比整合頁',url:'https://balli425.github.io/CTA-GEM-Dashboard/',
   summary:'事務所建置的建築專用 AI 助理（Gem）集中在同一頁，每一個都以實際產出圖做 Before／After 對比，點了直接開啟使用。',
   period:'2026-04-18～2026-09-17（V1～V6）',
   need:'把分散在 Gemini 上的建築專用 Gem 集中展示，每個附上實例對比，讓使用者一眼看出用途並直接開啟。',
   method:[
     'AI 代理人協助每週建置新的 Gem，並產生 Before／After 測試圖',
     '逐一審閱，未達標準的不上架',
     '圖片統一壓縮，頁面載入更快'
   ],
   result:[
     '139 個 Gem、8 個分類：圖說／分析 39、特別空間改造 31、建築設計 24 等',
     '六次改版，累計數量 71 → 107 → 124 → 139',
     'V4 上線檢查：216 個圖片路徑缺檔 0'
   ]},
  {id:'exam',cat:'tools',thumb:'exam-practice',tag:'學習工具',title:'建築師考古題模擬系統',url:'https://balli425.github.io/CTA-Web-page/',
   summary:'歷屆建築師考試選擇題的線上模擬：標準版與圖文並茂版共用同一份題庫，作答即時計分，列出答錯題目。',
   period:'2026-04-14～2026-09-28',
   need:'考生不必對著紙本 PDF 練習，可以線上模擬作答，答完立即計分並檢討錯題。',
   method:[
     'AI 代理人由考選部網站下載歷屆試題與答案 PDF，依年度、科目整理',
     '判讀 PDF 轉成題庫資料，做成互動測驗頁；需要附圖的題目另做圖文並茂版',
     '首頁改為建築藍圖風格，沿用築匠色'
   ],
   result:[
     '標準版：100～114 年共 15 個年度、4 科，共 3,501 題',
     '圖文並茂版：110～114 年',
     '兩種介面共用同一份題庫'
   ]},
  {id:'permit',cat:'tools',thumb:'permit-fee',tag:'試算工具',title:'建照申請掛件費用計算系統',url:'https://balli425.github.io/hsinchu-building-permit-calculator/',disclaimer:'研究用，非正式掛件使用',
   summary:'依建築師酬金標準表、法定工程造價與協檢作業收費標準，自動計算建照掛件與領照應繳的各項費用，並輸出 PDF 明細。',
   period:'2026-05-18～2026-08-05（V1～V4.4）',
   need:'建築師掛件、領照時，一次算出應繳的各項費用並輸出明細，本縣與外縣市建築師都能使用。',
   method:[
     '依酬金標準表三類建築級距、縣府公告的 13 個構造類別法定造價、協檢作業收費標準計算',
     '外縣市協審費比對臺北、新北、桃園三地費率，依平等互惠取較高者',
     '總造價＝樓地板面積×構造單價＋附屬工程，四捨五入至千位；每版在本機實際驗算'
   ],
   result:[
     '32 個版本，由 V1 演進到 V4.4',
     '計算設計費（掛件 70%／領照 30%／一次繳清）、事業費、協檢費、行政作業費、外縣市補助費與協審費、合作設計比例',
     '多頁 PDF 明細輸出'
   ]},
  {id:'cost',cat:'tools',thumb:'cost-app',tag:'手機 App',title:'建照造價與費用查詢 App',url:null,
   summary:'可加到手機主畫面的查詢工具：選建築物類別、構造與面積，即時算出法定工程造價與應繳費用，離線也能用。',
   period:'2026-08-05～2026-09-28（v1.0～v1.2）',
   need:'讓建築師在手機上快速試算建照掛件、領照費用，加到主畫面即可使用，沒有網路也能查。',
   method:[
     '以網頁版 V4.4 的計算為底，精簡為手機介面',
     '可安裝到手機主畫面，沒有網路也能使用',
     '用 4 組案例與網頁版逐一比對，數字全部一致；手機寬度 375 像素實測無橫向捲動'
   ],
   result:[
     '內建 13 項構造單價表，造價標準更新日期標示在頁首',
     '3 個版次，附使用手冊'
   ]},
  {id:'interior',cat:'tools',thumb:'interior-fee',tag:'試算工具',title:'室內裝修審查費計算系統',url:'https://balli425.github.io/Hsinchu-County-Architects-Association/',
   summary:'依室內裝修審查收費標準，分圖說審查與竣工查驗兩階段累進計算，並產生繳費明細單 PDF。',
   period:'2026-04-13～2026-09-28（v1.0～v1.1）',
   need:'室內裝修案申請時，依面積自動算出兩階段審查費，並產生繳費明細單。',
   method:[
     '圖審：100 ㎡以下定額，超過部分依 15／10／6 元每㎡分段累進',
     '竣工：定額加分段累進，最後一段每㎡ 8 元；兩階段各自進位到百元',
     '網頁直接產生繳費明細單 PDF'
   ],
   result:[
     '輸入面積即得總額與明細單',
     '版面與計算架構成為後續其他縣市版本與建照費用系統的參考'
   ]},
  {id:'namecards',cat:'tools',thumb:'namecards',tag:'資料庫',title:'CTA 名片庫｜手機查詢',url:null,
   summary:'名片拍照或掃描後由 AI 辨識、歸檔到雲端試算表，手機登入即可依人員或公司查詢；名片資料不放在網頁裡。',
   period:'2026-11-11 上線',
   need:'把累積的名片整理成單一主檔，在手機上查詢、撥號、匯出聯絡人；收到新名片當天就能辨識、歸檔、同步。',
   method:[
     '名片由 AI 辨識後歸檔，同步到雲端，手機即可查詢',
     '公開網頁不含任何名片資料，登入後才能查看',
     '大量掃描時由多個 AI 助手同時辨識，再交叉核對重複'
   ],
   result:[
     '舊資料庫 389 筆全數轉入；一次掃描 177 張，新增 154 筆、更新 14 筆',
     '雲端主檔超過 560 筆；搜尋、分組、分類篩選、一鍵撥號、匯出 vCard'
   ]},
  {id:'cafe',cat:'media',thumb:'midnight-cafe',tag:'動畫系列',title:'建築師深夜咖啡館小劇場｜奶茶麻吉',
   summary:'把建築實務裡的責任、合作與職場處境，改編成紙雕風格的直式短片，由貓「奶茶」與狗「麻吉」演出；已在 YouTube、Facebook、Instagram、TikTok 公開 8 集。',
   period:'2026-07-18 起，持續製作中',
   need:'把建築人的日常與職場課題，轉成大眾看得懂、帶點幽默的短片；角色與畫風要固定，能逐集穩定製作。',
   method:[
     '改編自建築師本人的深夜隨筆，每集拆成約 20～30 段分鏡',
     'AI 生成紙雕風格畫面與動畫，配上固定聲線配音、AI 配樂與中英雙語字幕',
     '每一張畫面、每一段動畫都逐格檢查角色是否一致'
   ],
   result:[
     '已公開 8 集（MM000～MM007），每集 20 秒到 3 分鐘',
     '四個平台同步上線，全部附中英字幕'
   ],
   series:[
     {yt:'M04hgvshJeE',title:'MM000 麻吉奶茶自我介紹'},
     {yt:'prIkFCtYx28',title:'MM001 長長清單與剛剛好的家'},
     {yt:'QeFV87ikP8o',title:'MM002 小鮮肝與老肝'},
     {yt:'8Gi9hjXZeWA',title:'MM003 大家的事務所'},
     {yt:'Qq5XFlqALYg',title:'MM004 還沒決定，就先蓋嗎？'},
     {yt:'8x-db3xgLYE',title:'MM005 努力掃就對了'},
     {yt:'yRPDEdgLSfs',title:'MM006 模型很準，答案不一定'},
     {yt:'aPPyRcDFIdk',title:'MM007 證照不是終點線'}
   ]},
  {id:'sloth',cat:'media',thumb:'sloth-taichi',tag:'AI 動畫',title:'樹懶打太極｜動作轉移動畫',
   video:{src:'./assets/works/video/sloth-taichi.mp4',portrait:true,label:'播放影片・2 分 20 秒'},
   summary:'把一整套太極示範動作，轉給自創的卡通樹懶角色，做成 2 分 20 秒的直式短片。',
   period:'2026-08-21～2026-08-24',
   need:'讓自創角色完整演出一整套太極，長度與動作節奏和示範一致，畫面固定、構圖從容。',
   method:[
     '從示範動作抽出骨架，驅動樹懶角色逐段生成，再放大為直式 1080p',
     '補畫竹林場景並對齊角色比例，讓角色始終留在畫面中',
     '長時間生成以自動監看與檢查穩定跑完全片'
   ],
   result:[
     '2 分 20 秒直式成片，附片名字卡與 AI 配樂',
     '比較三種技術路線的取捨，整理成後續動畫製作的準則'
   ]},
  {id:'theatre',cat:'media',thumb:'theatre-trailer',tag:'AI 動畫・預告片',title:'舞台劇預告《燈火未熄》',deck:'theatre',
   video:{src:'./assets/works/video/theatre-trailer.mp4',label:'播放預告・45 秒'},
   summary:'把一組 AI 舞台劇場景圖，做成具電影預告張力的 45 秒宣傳片，保留台口、布景與追光的舞台質感。',
   period:'2026-08-04（單日完成）',
   need:'讓靜態的舞台場景動起來，做成有故事節奏的預告片，同時保留舞台劇的質感。',
   method:[
     '依故事起承轉合把場景拆成 7 段，每段只生成一次動畫，不重複、不倒播',
     '四段材質文字動畫作為章節重擊，搭配 AI 配樂與快慢交替的剪輯',
     '從第 1 版修到第 6 版：延長片頭、淘汰後製假光、重建聲畫節奏'
   ],
   result:[
     '45 秒 1080p 正式預告片',
     '11 頁創作紀實簡報'
   ]},
  {id:'intake',cat:'method',thumb:'site-intake',tag:'方法研究',title:'開案初步結果｜拿到地號 10～15 分鐘',
   summary:'拿到地號，10～15 分鐘要產出初步結果：基本法規分析、面積計算表、報價單。',
   need:'拿到地號，10～15 分鐘要產出初步結果。',
   method:[],
   result:['基本法規分析','面積計算表','報價單']},
  {id:'housing',cat:'method',thumb:'housing-research',tag:'方法研究',title:'集合住宅平面與法規研究',
   summary:'畫集合住宅標準層之前，先把台灣常見的平面做法與相關法規查清楚，寫成畫圖時就能逐條自檢的事務所標準。',
   period:'2026-10-30（一個下午）',
   need:'畫標準層之前，先查清楚常見的平面做法與法規，讓設計一開始就不違規。',
   method:[
     '判讀案例庫平面 591 張、網路案例 29 案、原圖與銷售平面 82 張',
     '建築技術規則 40 條以上逐條查證，本文、補充圖例與說明一起讀',
     '圖面觀察與推論分開標示，討論定案後才寫成標準'
   ],
   result:['事務所設計標準 15 條','標準層自動檢查 14 項','檢討工具表 4 張']},
  {id:'island',cat:'site',thumb:'airport-city',tag:'本站製作',title:'築匠 AI 空港城｜這個網站怎麼做出來',
   summary:'走進一座 3D 城市，就能看懂三堂 AI 課程；城市全部由程式即時建出，手機也能看，連結就能分享。',
   period:'2026-10-23 起，持續更新',
   need:'讓訪客不必讀長篇介紹，走進城市就能看懂三堂 AI 課程。',
   method:[
     '3D 城市全部以程式即時建出，沒有使用生成圖片或影片',
     '依審閱意見逐版修改：三座島變一座城、點建築選課、夜間照明、自由漫遊',
     '每一版自動檢查並核對上線檔案，公開網站只放網站本身'
   ],
   result:[
     '單日完成六個版本並公開上線',
     '城市裡有 70 個人物、10 輛車、1 架直升機，日夜兩種時段',
     '陸續加入課程影片、影片放映場、研究成果館與使用人次統計'
   ]},
  {id:'miaoli9',cat:'3d',thumb:'miaoli-nine',tag:'建築設計協作',title:'苗栗透天宅｜一張手稿，13 天一整套建築',deck:'miaoli',
   summary:'從建築師 2015 年的 A3 手稿出發，AI 協作在 13 天內完成九個階段：建模、建照圖、數量預算、細部設計、三個設計方案，到定案全套圖說。',
   period:'2026-10-01～2026-10-13',
   need:'只有一份 3 頁手繪草稿，要在短時間內做到可以送審、可以發包的整套設計。',
   method:[
     'AI 判讀手稿、校正比例，以程式操作 Revit 建出 4 層樓模型',
     '圖面、數量與預算都從同一個模型產生',
     '另提出三個截然不同的方案供選擇，定案後全套重做'
   ],
   result:['全套圖說 93 張、構造大樣 28 個、法規檢討 22 項','定案後一週內重做 47 張圖','10 頁精華簡報']},
  {id:'indigenous',cat:'3d',thumb:'indigenous',tag:'競圖研究・練習案',title:'原住民族教育推廣中心｜AI 協助競圖研究',deck:'indigenous',
   disclaimer:'練習案：以民國 105 年公開招標為研究題目',
   summary:'以一件公共建築競圖為題，研究 AI 怎麼協助從評估、法規量體、多方案模擬，一路做到完整設計與服務建議書。',
   period:'2026-10-15～2026-10-16',
   need:'遇到公共建築競圖，要能快速判斷值不值得投，投的話要快速做出完整設計。',
   method:[
     '查證相關法規，建立可量化的評估方式',
     '以生成式圖像工具模擬六輪外觀，融入泰雅織紋與竹格柵',
     '依定案以 Revit 重建模型，完成整套圖說'
   ],
   result:['總樓地板 1,165.9 ㎡','Revit 圖紙 11 張','16 頁成果簡報']},
  {id:'argon',cat:'method',thumb:'argon',tag:'方法研究',title:'Argon 測試｜AI 說完成了，真的完成了嗎？',deck:'argon',
   summary:'要求 AI 依一張建築圖做出可以編修的模型，逐輪比對七個版本，檢討 AI「宣稱完成」與實際成果之間的落差。',
   period:'2026-10-15（單日）',
   need:'要求 AI 依圖片做出可以編修的模型，並判斷它說「完成」的時候是否真的完成。',
   method:['001 到 007 共七輪建模與真實化，逐輪並排比對','逐輪整理「宣稱」與「實際」的差距'],
   result:['歸納三條驗收標準：同視角並排比對、關鍵構件核對、可編修模型驗收','10 頁檢討簡報']}
];
