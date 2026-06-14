// 【重要】ここにGASでデプロイしたウェブアプリのURLを貼り付けます
const GAS_URL = "https://script.google.com/macros/s/xxxxxxxxx/exec";

/* -----------------------------------
 * 予約画面 (index.html) の処理
 * ----------------------------------- */
const timeSelect = document.getElementById('time');
const lunchGroup = document.getElementById('lunchGroup');
const reservationForm = document.getElementById('reservationForm');

// 時間選択時に「昼食」の表示/非表示を切り替える
if (timeSelect) {
  timeSelect.addEventListener('change', function() {
    const selectedOption = this.options[this.selectedIndex];
    // data-lunch属性がtrueなら表示
    if (selectedOption.getAttribute('data-lunch') === "true") {
      lunchGroup.style.display = "block";
    } else {
      lunchGroup.style.display = "none";
    }
  });
}

// フォーム送信処理
if (reservationForm) {
  reservationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 送信ボタンを非活性化
    const btn = reservationForm.querySelector('button');
    btn.disabled = true;
    btn.innerText = "送信中...";

    const lunchVal = lunchGroup.style.display === "block" 
      ? document.querySelector('input[name="lunch"]:checked').value 
      : "なし";

    const payload = {
      action: "reserve",
      data: {
        name: document.getElementById('name').value,
        className: document.getElementById('className').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        lunch: lunchVal,
        email: document.getElementById('email').value
      }
    };

    try {
      // GASへPOSTリクエスト
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      alert("予約が完了しました。確認メールを送信しました。");
      reservationForm.reset();
      lunchGroup.style.display = "none";
    } catch (error) {
      alert("エラーが発生しました。");
    } finally {
      btn.disabled = false;
      btn.innerText = "予約する";
    }
  });
}

/* -----------------------------------
 * 管理画面 (admin.html) の処理
 * ----------------------------------- */
const SESSION_MINUTES = 15; // パスワードを保持する分数

// ログイン時の処理
function login() {
  const pw = document.getElementById('adminPassword').value;
  // ※実際の運用ではGAS側で認証するのが安全ですが、今回は簡易的なセッション管理
  if (pw === "1234") { // 仮のパスワード
    const expireTime = new Date().getTime() + (SESSION_MINUTES * 60 * 1000);
    sessionStorage.setItem("admin_auth_expire", expireTime);
    showAdminScreen();
  } else {
    alert("パスワードが違います");
  }
}

// 画面ロード時にセッションが有効かチェック
window.addEventListener('DOMContentLoaded', () => {
  const adminScreen = document.getElementById('adminScreen');
  if (adminScreen) {
    const expireTime = sessionStorage.getItem("admin_auth_expire");
    const now = new Date().getTime();
    if (expireTime && now < expireTime) {
      showAdminScreen();
    }
    
    // SortableJSによるクラス設定のドラッグ＆ドロップ初期化
    const classList = document.getElementById('classList');
    if(classList) {
      new Sortable(classList, {
        animation: 150,
        ghostClass: 'blue-background-class'
      });
    }
  }
});

function showAdminScreen() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminScreen').style.display = 'flex';
}
