// CSVデータのURL
const csvURL = "https://echizencity.github.io/opendata/kokufuhakkutsu/10000_contents.csv";

// CSVファイルからデータを読み込む関数
async function fetchData() {
  const response = await fetch(csvURL);
  const data = await response.text();
  return data;
}

// モーダルを作成する関数
function createModal(id, title, images, descriptions) {
  const modalContainer = document.getElementById('modalContainer');
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal(${id})">&times;</span>
      ${title ? `<p>${title}</p>` : ''}
      ${createSlides(images, descriptions)}
      ${images.length > 1 ? createSlideNavigation(id) : ''}
      ${images.length > 1 ? createSlideButtons(images.length, id) : ''}
    </div>
  `;
  modalContainer.appendChild(modal);

  // モーダルの背景をクリックしたらモーダルを閉じる
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal(id);
    }
  });
}

// スライドを作成する関数
function createSlides(images, descriptions) {
  let slides = '';
  for (let i = 0; i < images.length; i++) {
    slides += `
      <div class="slide">
        <div style="text-align:center"><img src="https://echizencity.github.io/opendata/kokufuhakkutsu/${images[i]}" alt="Slide ${i + 1}"></div>
        ${descriptions[i] ? `<p>${descriptions[i]}</p>` : ''}
      </div>
    `;
  }
  return slides;
}

// スライドボタンを作成する関数
function createSlideButtons(numSlides, modalIndex) {
  let buttons = '';
  for (let i = 0; i < numSlides; i++) {
    buttons += `<span class="dot" onclick="currentSlide(${i + 1}, ${modalIndex})"></span>`;
  }
  buttons = `<div style="text-align:center">` + buttons + `</div>`
  return buttons;
}

// ナビゲーションボタンを作成する関数
function createSlideNavigation(id) {
  return `
    <div>
      <button class="prev" onclick="plusSlides(-1, ${id})">&#10094;</button>
      <button class="next" onclick="plusSlides(1, ${id})">&#10095;</button>
    </div>
  `;
}

var touchstartX2 = 0;
var touchendX2 = 0;

var touchStartHandler;
var touchEndHandler;

// モーダルの読み込み完了までのフラグ
let modalLoaded = false;

// モーダルが表示されているかどうかを追跡するフラグ
let modalShown = false;

// モーダルを開く関数
function openModal(id) {
  // モーダルが読み込み完了していない場合は何もしない
  if (!modalLoaded) {
      return;
  }
  // モーダルが表示されている場合は、処理を終了する
  if (modalShown) {
      return;
  }

  const modal = document.querySelectorAll('.modal')[id - 1];
  modal.style.display = 'block';

  showModal();
  modalShown = true;

  // 一定時間後にフラグをリセットする
  setTimeout(function() {
      modalShown = false;
  }, 1500);

  slideIndex = 1;
  showSlides(1, id);

  // モーダルを開いたときにイベントリスナーを追加する
  modal.addEventListener('touchstart', touchStartHandler = function(event) {
    touchstartX2 = event.touches[0].clientX;
  }, false);

  modal.addEventListener('touchend', touchEndHandler = function(event) {
    touchendX2 = event.changedTouches[0].clientX;
    if (touchstartX2 !== 0) {
      handleGesture(id);
    }
    // タッチ座標をクリアする
    touchstartX2 = 0;
    touchendX2 = 0;    
  }, false);
}

function handleGesture(modalIndex) {
  const deltaX = touchendX2 - touchstartX2;
  if (deltaX < -75) {
    plusSlides(1, modalIndex); // 左方向へのスワイプ
  } else if (deltaX > 75) {
    plusSlides(-1, modalIndex); // 右方向へのスワイプ
  }
}

// モーダルを閉じる関数
function closeModal(id) {
  const modal = document.querySelectorAll('.modal')[id - 1];
  modal.style.display = 'none';
  // モーダルを閉じたときにイベントリスナーを削除する
  modal.removeEventListener('touchstart', touchStartHandler, false);
  modal.removeEventListener('touchend', touchEndHandler, false);
  // モーダルを閉じたときにタッチ座標をクリアする
  touchstartX2 = 0;
  touchendX2 = 0;
  hideModal();
}

// スライドのインデックスを定義
let slideIndex;

// スライド操作関数
function showSlides(n, modalIndex) {
  const modal = document.querySelectorAll('.modal')[modalIndex - 1];
  const slides = modal ? modal.getElementsByClassName("slide") : [];
  const dots = modal ? modal.getElementsByClassName("dot") : [];
  
  // スライドのインデックスを更新
  slideIndex = n;

  // スライドのインデックスがスライドの範囲外にならないようにする
  if (slideIndex > slides.length) {
    slideIndex = 1;
  } else if (slideIndex < 1) {
    slideIndex = slides.length;
  }

  // スライドを表示するために正しいインデックスを使用する
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  if (slides[slideIndex - 1]) {
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
  }
}

// スライドを切り替える関数
function currentSlide(n, modalIndex) {
  showSlides(n, modalIndex);
}

// スライドショーの前後に移動する関数
function plusSlides(n, modalIndex) {
  const modal = document.querySelectorAll('.modal')[modalIndex - 1];
  const slides = modal ? modal.getElementsByClassName("slide") : [];
  if (slides.length === 0) return;

  slideIndex += n;
  if (slideIndex > slides.length) {
    slideIndex = 1;
  } else if (slideIndex < 1) {
    slideIndex = slides.length;
  }
  showSlides(slideIndex, modalIndex);
}

// 初期化関数
async function initializemodal() {
  const csvData = await fetchData();
  const rows = parseCSVmodal(csvData);

  rows.forEach(row => {
    const [id, title, image1, description1, image2, description2, image3, description3, image4, description4] = row;
    const images = [image1, image2, image3, image4].filter(Boolean); // 空の画像をフィルタリング
    const descriptions = [description1, description2, description3, description4].filter(Boolean); // 空の説明文をフィルタリング
    createModal(id, title, images, descriptions);

    const model = document.getElementById(`arrow${id}`);
    model.addEventListener('click', () => openModal(id));
  });

  // モーダル読み込み完了のフラグを設定
  modalLoaded = true;
}


// CSVデータをパースする関数
function parseCSVmodal(csvData) {
  const lines = csvData.split("\n");
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(",");
    const record = [];
    let field = "";

    for (let j = 0; j < fields.length; j++) {
      field += fields[j].trim();

      if (field.charAt(0) === '"' && field.charAt(field.length - 1) === '"') {
        field = field.substr(1, field.length - 2);
      }

      if ((field.match(/"/g) || []).length % 2 === 0) {
        record.push(field);
        field = "";
      } else {
        field += ",";
      }
    }

    if (fields.length === 1) {
      break;
    }
    result.push(record);
  }

  return result;
}
