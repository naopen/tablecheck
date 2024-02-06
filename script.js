// 以下のコードは全てGoogle Apps Scriptで実行する
const lineNotifyToken = 'LINE Notifyのアクセストークンを入力';
const discordWebhookUrl = 'DiscordのWebhook URLを入力';
const lineNotifyApi = 'https://notify-api.line.me/api/notify';

// 設定用の定数
const BASE_URL = 'https://www.tablecheck.com/ja/shops/gyopao/available';
const AUTH_TOKEN = 'BkMzmdt9drvRuLa55NSl0fQKMBIjPpjPC1FYaz63n3UPonnZ6FPlHlPlJ6I2Iaut_WYif0ysxJef1rdaUNnKAg';
// const MENU_ITEM_ID = '5e257e626e731d7f95002477'; //デバッグ（おすすめプラン）用
const MENU_ITEM_ID = '5f1134a545306e000100422f'; //せんべろ用
const ADULTS_NUMBER = 2;
const GROUP_ORDER = 'true';
// 予約可能な時間が1つでもあったらTrueとするフラグ
let isAvailable = false;

// 曜日のリスト
const weekList = ['日', '月', '火', '水', '木', '金', '土'];

// メッセージを送信する関数
function sendLineMessage(message) {
	// メッセージの送信設定
	const options = {
		"method": "post",
		"payload": { "message": message },
		"headers": { "Authorization": "Bearer " + lineNotifyToken }
	};
	UrlFetchApp.fetch(lineNotifyApi, options);
}

function sendDiscordMessage(message) {
	const url = discordWebhookUrl;
	const data = {
		'content': message
	};
	const options = {
		'method': 'post',
		'contentType': 'application/json',
		'payload': JSON.stringify(data)
	};
	UrlFetchApp.fetch(url, options);
}


// 指定された期間と間隔で予約可能状況を確認する関数
function checkAvailabilityForPeriod(startDateTime, intervalMinutes, numberOfDays) {
	let dayStart = new Date(startDateTime);

	for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
		// 予約可能開始時間（12:00）をセット
		let checkTime = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + dayOffset, 12, 0, 0);
		// 予約可能終了時間（21:30）をセット
		let endTime = new Date(dayStart.getFullYear(), dayStart.getMonth(), dayStart.getDate() + dayOffset, 21, 30, 0);

		while (checkTime <= endTime) {
			const epochTime = Math.floor(checkTime.getTime() / 1000);
			sendGetRequest(epochTime, dayOffset);
			// リクエスト間のウェイト
			Utilities.sleep(1000);
			// 次のリクエストの時刻を設定
			checkTime.setMinutes(checkTime.getMinutes() + intervalMinutes);
		}
	}
}

// GETリクエストを送信する関数
// User-Agentは、ランダムに変える
function sendGetRequest(epochTime, dayOffset) {
	const params = {
		'authenticity_token': AUTH_TOKEN,
		'reservation[start_at_epoch]': epochTime,
		'reservation[num_people_adult]': ADULTS_NUMBER,
		'reservation[orders_attributes][0][menu_item_id]': MENU_ITEM_ID,
		'reservation[orders_attributes][0][is_group_order]': GROUP_ORDER
	};
	const queryString = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
	const randomUserAgentList = [
		// ありとあらゆるブラウザのUser-Agentをランダムに設定
		'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.3',
		'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 OPR/45.0.2552.898',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Edge/16.16299',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Vivaldi/1.91.867.38',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 QupZilla/2.2.6',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Otter/1.0.01',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Midori/0.5',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Maxthon/5.2.1.6000',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Lunascape/6.15.2.27564',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Iron/58.0.3050.0',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 IceDragon/19.0.1.501',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Comodo_Dragon/58.0.3029.114',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Coc_Coc/66.4.126',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 Avast_Secure_Browser/75.0.1447.81',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 360SE',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 2345Explorer/9.7.0.18837',
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + '121.0.0.0 Safari/537.36 115Browser/8.7.0',
	];

	const options = {
		'method': 'get',
		'muteHttpExceptions': true,
		'headers': {
			'User-Agent': randomUserAgentList[Math.floor(Math.random() * randomUserAgentList.length)]
		}
	};

	const response = UrlFetchApp.fetch(`${BASE_URL}?${queryString}`, options);

	// エラーが発生した場合にログを残す
	if (response.getResponseCode() !== 200) {
		Logger.log(`Request failed for day ${dayOffset + 1} with response code ${response.getResponseCode()}`);
		return;
	}

	const content = JSON.parse(response.getContentText());

	// 日付には曜日を付けてログに残す
	Logger.log(Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd') + "（" + weekList[new Date(epochTime * 1000).getDay()] + "）" + (Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'HH:mm')) + " の予約可能状況を確認します。");

	if (content.status === "success") {
		Logger.log((Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd')) + "（" + weekList[new Date(epochTime * 1000).getDay()] + "）" + (Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'HH:mm')) + " は予約可能です。");
		sendLineMessage((Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd')) + "（" + weekList[new Date(epochTime * 1000).getDay()] + "）" + (Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'HH:mm')) + " は予約可能です。");
		sendDiscordMessage((Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd')) + "（" + weekList[new Date(epochTime * 1000).getDay()] + "）" + (Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'HH:mm')) + " は予約可能です。");
		isAvailable = true;
	} else {
		Logger.log((Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'yyyy-MM-dd')) + "（" + weekList[new Date(epochTime * 1000).getDay()] + "）" + (Utilities.formatDate(new Date(epochTime * 1000), Session.getScriptTimeZone(), 'HH:mm')) + " は予約不可です。");
	}
}

// 2ヶ月後の今日と同じ数の日まで実際は何日あるかの数を返す関数
// 今日が2月1日だとして、2ヶ月後の今日が4月1日だとすると、2月は28日か、29日まであり、3月は31日まであるので、合計で59日か、60日ある
function getNumberOfDays() {
	const today = new Date();
	const twoMonthsLater = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());
	const diff = twoMonthsLater - today;
	const numberOfDays = diff / (24 * 60 * 60 * 1000);
	// 小数点以下を切り捨てて返す
	return Math.floor(numberOfDays);
}

// 予約可能状況を確認する開始基準時刻と時間間隔を定義
const tomorrow = new Date();
// 11時を過ぎていたら、明日の日付を設定
if (tomorrow.getHours() >= 11) {
	tomorrow.setDate(tomorrow.getDate() + 1);
}
tomorrow.setHours(12, 0, 0, 0); // 明日の12時に設定

const INTERVAL_MINUTES = 30; // 確認したい時間間隔を分で設定
const NUMBER_OF_DAYS = getNumberOfDays() - 1; // ここに確認したい日数を設定

// メイン関数
function main() {
	// メッセージを送信
	// sendDiscordMessage('只今より、せんべろチェックを開始します。');
	// 予約可能状況を確認
	checkAvailabilityForPeriod(tomorrow, INTERVAL_MINUTES, NUMBER_OF_DAYS);
	// 予約可能な時間が1つでもあったらメッセージを送信
	if (isAvailable) {
		// sendLineMessage('【OK】予約可能な時間があります。せんべろを予約しましょう！');
		// sendDiscordMessage('【OK】予約可能な時間があります。せんべろを予約しましょう！');
	} else {
		// 何日から何日までの予約可能状況を確認したかをメッセージで送信
		// sendDiscordMessage('【NG】' + Utilities.formatDate(tomorrow, Session.getScriptTimeZone(), 'yyyy-MM-dd') + 'から' + Utilities.formatDate(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + NUMBER_OF_DAYS), Session.getScriptTimeZone(), 'yyyy-MM-dd') + 'までの予約可能状況を確認しました。予約可能な時間はありませんでした。');
	}
}
