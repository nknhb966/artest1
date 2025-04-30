// locations.csvのパス
// const locationsFilePath = 'https://echizencity.github.io/opendata/kokufuhakkutsu/locations.csv';
const locationsFilePath = './csv/locations3.csv';
// const locationsFilePath = 'https://echizencity.github.io/artest/csv/locations2.csv';

// モデルの場所を設定
const targetPosition = `
    <a-entity gltf-model="#model-asset" scale="1 1 1" position="0 -1.5 0" rotation="0 20 0"></a-entity>
    <a-entity id="arrow1" gltf-model="#arrow-asset" position="1.5 0.8 -2.2" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: 1.5 0.7 -2.2; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow2" gltf-model="#arrow-asset" position="3.1 0.8 -2.2" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: 3.1 0.7 -2.2; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow3" gltf-model="#arrow-asset" position="-0.5 0.8 -0.5" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: -0.5 0.7 -0.5; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow4" gltf-model="#arrow-asset" position="-3.3 0.8 0" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: -3.3 0.7 0; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow5" gltf-model="#arrow-asset" position="2 0.8 1" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: 2 0.7 1; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow6" gltf-model="#arrow-asset" position="6.5 0.8 1.8" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: 6.5 0.7 1.8; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow7" gltf-model="#arrow-asset" position="-7 0.8 3" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: -7 0.7 3; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow8" gltf-model="#arrow-asset" position="5.2 0.8 1.45" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: 5.2 0.7 1.45; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow9" gltf-model="#arrow-asset" position="-7.2 0.8 0.2" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: -7.2 0.7 0.2; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    <a-entity id="arrow10" gltf-model="#arrow-asset" position="7.8 0.8 -0.8" scale="0.25 0.25 0.25" rotation="0 0 180"
                           animation="property: position; to: 7.8 0.7 -0.8; dur: 500; easing: easeInSine; loop: true; dir: alternate"></a-entity>
    `

// CSVファイルを取得してlocationsを更新する関数
async function fetchLocations() {
    try {
        const response = await fetch(locationsFilePath);
        const data = await response.text();
        const locations = parseCSV(data);
        locationsSet = locations;
        updateDropdown(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
    }
}

// CSVパース関数
function parseCSV(csvData) {
    const lines = csvData.split('\n');
    const result = [];
    const headers = lines[0].split(',');
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') {
            continue;
        }
        const obj = {};
        const currentline = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j].trim();
        }
        result.push(obj);
    }
    return result;
}

// ドロップダウンリストを更新する関数
function updateDropdown(locations) {
    const dropdown = document.createElement('select');
    dropdown.setAttribute('id', 'locationDropdown');
    dropdownContainer.appendChild(dropdown);
    dropdown.innerHTML = ''; // リストをクリア

    // リストが1件の場合はデフォルトオプションを表示しない
    if (locations.length > 1) {
        const defaultOption = document.createElement('option');
        defaultOption.value = -2;
        defaultOption.text = 'モデルを配置する場所を選択';
        dropdown.appendChild(defaultOption);
    }

    locations.forEach((location, index) => {
        const option = document.createElement('option');
        option.text = location.name;
        
        // "現在地"がある場合、そのオプションの値を-1に設定
        if (location.name === "現在地") {
            option.value = -1;
        } else {
            option.value = index;
        }
        dropdown.appendChild(option);
    });

    // リストが1件だけの場合は、その場所のモデルを直ちに表示
    if (locations.length === 1) {
        const selectedIndex = (locations[0].name === "現在地") ? -1 : 0;
        displaySelectedModel(selectedIndex, locations);
    }
}

// 現在の位置情報を保持する変数
let currentLatitude = null;
let currentLongitude = null;
let selectedLocation = {};

// モーダルが表示されているかどうかを追跡するフラグ
let isModalVisible = false;

// モーダルを表示する関数
function showModal() {
    isModalVisible = true;
}

// モーダルを非表示にする関数
function hideModal() {
    isModalVisible = false;
}

// モデル作成
function createModelEntity(selectedIndex, locations) {
    const selectedModelId = `model${selectedIndex + 1}`;
    const modelEntity = document.createElement('a-entity');
    modelEntity.setAttribute('id', selectedModelId);

    const orientation1 = -90 - 13 + orientation;
    const rotationValue1 = "0 " + orientation1 + " 0";  // Y軸周り回転させる場合(iphone)
    const orientation2 = -90 - 26;
    const rotationValue2 = "0 " + orientation2 + " 0";  // Y軸周り回転させる場合(iphone以外)

    // 選択された場所が現在地の場合は、現在位置を取得してモデルを表示
    if (selectedIndex === -1) {
        selectedLocation = locationsSet[locationsSet.length - 1];
        if (currentLatitude !== null && currentLongitude !== null) {
            modelEntity.setAttribute("gps-new-entity-place", `latitude: ${currentLatitude}; longitude: ${currentLongitude};`);
        } else {
            // 現在の位置情報がまだ取得されていない場合は、再度取得する
            navigator.geolocation.getCurrentPosition(position => {
                currentLatitude = position.coords.latitude;
                currentLongitude = position.coords.longitude;
                modelEntity.setAttribute("gps-new-entity-place", `latitude: ${currentLatitude}; longitude: ${currentLongitude};`);
            });
        }
    } else {
        // 選択されたモデルを追加
        selectedLocation = locationsSet[selectedIndex];
        modelEntity.setAttribute('gps-new-entity-place', `latitude: ${selectedLocation.latitude}; longitude: ${selectedLocation.longitude};`);
    }
    modelEntity.innerHTML = targetPosition;

    const modelAssetItem = document.createElement('a-asset-item');
    modelAssetItem.setAttribute('id', 'model-asset');
    modelAssetItem.setAttribute('src', selectedLocation.modelURL);
    modelEntity.appendChild(modelAssetItem);
    
    if (os === "iphone") {
        modelEntity.setAttribute('rotation', rotationValue1);
    } else {
        modelEntity.setAttribute('rotation', rotationValue2);
    }
    
    return modelEntity;
}

// ロード時に最初のモデルを表示する関数
function displaySelectedModel(selectedIndex, locations) {
    const modelEntity = createModelEntity(selectedIndex, locations);

    // モデルをモデルコンテナに追加
    const modelContainer = document.getElementById('modelContainer');
    modelContainer.appendChild(modelEntity);

    // モデルに関連する情報を表示
    document.getElementById('overviewButton2').addEventListener('click', function() {
        document.getElementById('modalContainer2').style.display = 'block';
        document.getElementById('overviewTitle').innerText = selectedLocation.title;
        document.getElementById('overviewSubtitle').innerText = selectedLocation.subtitle;
        document.getElementById('overviewDescription').innerText = selectedLocation.description;
        document.getElementById('overviewImage').src = selectedLocation.image;
        document.getElementById('overviewUrl').href = selectedLocation.url;
        if (os == "iphone") {
            document.getElementById('overviewUrl').addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = selectedLocation.url;
                setTimeout(function() {
                    location.reload();
                }, 1000);
            });
        }
        showModal();
    });
    addCursor();
    initializemodal();
}

// ドロップダウンリストの変更イベントを監視し、選択されたモデルの表示・非表示を切り替える
dropdownContainer.addEventListener('change', function () {
    const dropdown = this.querySelector('#locationDropdown');
    const selectedIndex = parseInt(dropdown.value);

    // モデルコンテナからすべての子要素（モデル）を削除
    const modelContainer = document.getElementById('modelContainer');
    while (modelContainer.firstChild) {
        modelContainer.removeChild(modelContainer.firstChild);
    }

    // デフォルトオプションでは何もしない
    if (selectedIndex === -2) {
        return;
    }

    const modelEntity = createModelEntity(selectedIndex, locationsSet);

    // モデルをモデルコンテナに追加
    modelContainer.appendChild(modelEntity);

    // モデルに関連する情報を表示
    document.getElementById('overviewButton2').addEventListener('click', function() {
        document.getElementById('modalContainer2').style.display = 'block';
        document.getElementById('overviewTitle').innerText = selectedLocation.title;
        document.getElementById('overviewSubtitle').innerText = selectedLocation.subtitle;
        document.getElementById('overviewDescription').innerText = selectedLocation.description;
        document.getElementById('overviewImage').src = selectedLocation.image;
        document.getElementById('overviewUrl').href = selectedLocation.url;
        if (os == "iphone") {
            document.getElementById('overviewUrl').addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = selectedLocation.url;
                setTimeout(function() {
                    location.reload();
                }, 1000);
            });
        }
        showModal();
    });
    addCursor();
    initializemodal();
});


// 概要モーダルを閉じる
function closeModal2() {
    document.getElementById('modalContainer2').style.display = 'none';
    hideModal();
}

// 概要モーダルの背景をクリックしたらモーダルを閉じる
function closeModalBackground2(event) {
    var modal = document.getElementById('modalContainer2');
    if (event.target === modal) {
        modal.style.display = "none";
        hideModal();
    }
}

// 使い方モーダルを閉じる
function closeModal3() {
    document.getElementById('modalContainer3').style.display = 'none';
    hideModal();
}

// 使い方モーダルの背景をクリックしたらモーダルを閉じる
function closeModalBackground3(event) {
    var modal = document.getElementById('modalContainer3');
    if (event.target === modal) {
        modal.style.display = "none";
        hideModal();
    }
}

// リアルタイムで現在の位置情報を取得し、更新する
navigator.geolocation.watchPosition(position => {
    currentLatitude = position.coords.latitude;
    currentLongitude = position.coords.longitude;
});

// ピンチ操作の初期値を設定
var initialDistance = 0;
var initialAngle = 0;
var touchStartX = 0;
var touchStartY = 0;

// トグルの初期値を設定
let toggleValue = 0;

document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');

  // ローカルストレージから値を読み込み、チェック状態を設定
  const savedToggleState = localStorage.getItem('toggleState');
  if (savedToggleState === 'true') {
    toggleButton.checked = true;
    toggleValue = toggleButton.checked ? -90 : 0;
  }

  // チェック状態が変更されたらローカルストレージに値を保存
  toggleButton.addEventListener('change', function() {
    localStorage.setItem('toggleState', toggleButton.checked);
    toggleValue = toggleButton.checked ? -90 : 0;
  });
});

const init = () => {
    var lastTouchEnd = 0;
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', function (event) {
        var now = (new Date()).getTime();
        if (now - lastTouchEnd > 300) {
            addCursor();
        }
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
};

function onTouchStart(event) {
    if (isModalVisible) {
        return;
    }
    if (event.touches.length == 1) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }
    else if (event.touches.length == 2) {
        var touch1 = event.touches[0];
        var touch2 = event.touches[1];
        initialDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
        initialAngle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
    }
}

const pinchThreshold = 2;

function onTouchMove(event) {
  if (isModalVisible) {
      return;
  }

  for (let i = 0; i < locationsSet.length + 1; i++) {
        var model = document.getElementById(`model${i}`);

        if (model !== null && model.object3D !== null) {
            if (event.touches.length == 1) {
                event.preventDefault();
                
                var touchX = event.touches[0].clientX;
                var touchY = event.touches[0].clientY;
    
                var deltaX = touchX - touchStartX;
                var deltaY = touchY - touchStartY;
    
                let rad = 0;

                rad = (parseInt(degrees) + parseInt(toggleValue)) * Math.PI / 180;
      
                const newX = deltaX * Math.cos(rad) - deltaY * Math.sin(rad);
                const newY = deltaX * Math.sin(rad) + deltaY * Math.cos(rad);

                if(Math.sqrt(newX * newX + newY * newY) > 0.05) {
                  removeCursor();
                }

                model.object3D.position.x += newX * 0.012;
                model.object3D.position.z += newY * 0.012;
    
                touchStartX = touchX;
                touchStartY = touchY;
            }
            else if (event.touches.length == 2) {
                event.preventDefault();
                removeCursor();

                var touch1 = event.touches[0];
                var touch2 = event.touches[1];
                var currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
                var distanceDiff = currentDistance - initialDistance;
                var currentAngle = Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
    
                if (currentDistance - pinchThreshold > initialDistance) {
                    model.object3D.position.y += 0.1;
                } else if (currentDistance + pinchThreshold < initialDistance) {
                    model.object3D.position.y -= 0.1;
                }
    
                var angleChange = currentAngle - initialAngle;
                model.object3D.rotation.y -= angleChange * Math.PI / 180 * 1;
    
                initialDistance = currentDistance;
                initialAngle = currentAngle;
            }
        }
    }
}


function removeCursor() {
    var cursor = document.querySelector('a-entity[cursor]');
    if (cursor) {
        cursor.parentNode.removeChild(cursor);
    }
}

function addCursor() {
    var existingCursor = document.querySelector('a-entity[cursor]');
    if (!existingCursor) {
        var scene = document.querySelector('a-scene');
        var cursorEntity = document.createElement('a-entity');
        cursorEntity.setAttribute('cursor', 'rayOrigin: mouse');
        scene.appendChild(cursorEntity);
    }
}

// OS識別
let os;

window.addEventListener("DOMContentLoaded", initOS);

function initOS() {
    os = detectOSSimply();
    if (os == "iphone") {
        permitDeviceOrientationForSafari();
        window.addEventListener(
            "deviceorientation",
            handleOrientation,
            true
        );
    } else {
        window.addEventListener(
            "deviceorientationabsolute",
            handleOrientation,
            true
        );
    }
}

// 方位角取得  
let degrees = 0;
let orientation = 0;

function handleOrientation(event) {
  let alpha = event.alpha;
  if(os == "iphone") {
    // degrees = compassHeading(alpha);
    degrees = event.webkitCompassHeading;
  }else{
    degrees = compassHeading(alpha);
  }
  if(window.orientation !== undefined) {
      orientation = window.orientation;
  }
  else {
      orientation = 0;
  }
  document.querySelector("#direction").innerHTML = "【確認用】" + os + " : " + orientation + " : " + parseInt(degrees) + " : " + toggleValue;
}

function compassHeading(alpha) {
    var degtorad = Math.PI / 180;
    var _z = alpha ? alpha * degtorad : 0;
    var cZ = Math.cos(_z);
    var sZ = Math.sin(_z);
    var compassHeading = Math.atan(-sZ / cZ);
    if (cZ < 0) {
        compassHeading += Math.PI;
    } else if (-sZ < 0) {
        compassHeading += 2 * Math.PI;
    }
    return compassHeading * (180 / Math.PI);
}

function detectOSSimply() {
    let ret;
    if (
        navigator.userAgent.indexOf("iPhone") > 0 ||
        navigator.userAgent.indexOf("iPad") > 0 ||
        navigator.userAgent.indexOf("iPod") > 0
    ) {
        ret = "iphone";
    } else if (navigator.userAgent.indexOf("Android") > 0) {
        ret = "android";
    } else {
        ret = "pc";
    }
    return ret;
}

function permitDeviceOrientationForSafari() {
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            if (response === "granted") {
                window.addEventListener(
                    "deviceorientation",
                    detectDirection
                );
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function checkOrientation() {
    if (window.matchMedia("(min-width: 1000px)").matches || Math.abs(window.orientation) === 0) {
        $('#rotateMessageContainer').hide();
        $('#contentWrapper').show();
    } else {
        $('#rotateMessageContainer').show();
        $('#contentWrapper').hide();
    }
}

document.getElementById('overviewButton3').addEventListener('click', function() {
    document.getElementById('modalContainer3').style.display = 'block';
    showModal();
});

init();
fetchLocations();
