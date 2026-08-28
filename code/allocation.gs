/**
 * 部門別費用按分 計算モジュール
 * 株式会社ミドリ商事 財務会計アプリ
 *
 * 共通費を各部門に振り分ける処理をまとめています。
 */


// ============================================
// 設定値
// ============================================

/**
 * 按分基準
 * 2026年4月改定
 */
const HAIBUN_KIJUN = 'uriage';  // 売上高ベース


/**
 * 部門別の按分率
 */
const HAIBUN_RATE = {
  eigyo: 0.5,   // 営業部門
  kanri: 0.5    // 管理部門
};


/**
 * 部門コードと部門名の対応
 */
const BUMON_NAME = {
  eigyo: '営業部門',
  kanri: '管理部門'
};


/**
 * 按分の対象となる費目
 */
const HAIBUN_TAISHO = [
  '水道光熱費',
  '通信費',
  '賃借料',
  '事務用品費',
  '保険料'
];


// ============================================
// 按分計算
// ============================================

/**
 * 1件の共通費を、各部門に按分します。
 *
 * @param {number} kingaku - 按分前の金額
 * @param {string} himoku - 費目名
 * @return {Object} 部門ごとの按分後金額
 */
function haibunSuru(kingaku, himoku) {

  // 按分の対象かどうかを確認
  if (!isHaibunTaisho(himoku)) {
    throw new Error('按分の対象外の費目です: ' + himoku);
  }

  // 金額が正しいかを確認
  if (typeof kingaku !== 'number' || kingaku < 0) {
    throw new Error('金額が正しくありません: ' + kingaku);
  }

  var kekka = {};

  // 部門ごとに按分率を掛ける
  for (var bumon in HAIBUN_RATE) {
    kekka[bumon] = kingaku * HAIBUN_RATE[bumon];
  }

  return kekka;
}


/**
 * 指定された費目が按分の対象かどうかを判定します。
 *
 * @param {string} himoku - 費目名
 * @return {boolean} 対象であれば true
 */
function isHaibunTaisho(himoku) {
  return HAIBUN_TAISHO.indexOf(himoku) >= 0;
}


/**
 * 按分率の合計が 1.0 になっているかを確認します。
 * 設定ミスを早期に発見するための検算用です。
 *
 * @return {boolean} 正しければ true
 */
function checkHaibunRate() {
  var gokei = 0;

  for (var bumon in HAIBUN_RATE) {
    gokei += HAIBUN_RATE[bumon];
  }

  // 小数の誤差を考慮して判定
  return Math.abs(gokei - 1.0) < 0.0001;
}


/**
 * 複数件の共通費をまとめて按分します。
 *
 * @param {Array} meisaiList - 明細の配列
 * @return {Array} 按分結果の配列
 */
function haibunMatomete(meisaiList) {

  if (!checkHaibunRate()) {
    throw new Error('按分率の設定が正しくありません。合計が100%になっていません。');
  }

  var kekkaList = [];

  for (var i = 0; i < meisaiList.length; i++) {
    var meisai = meisaiList[i];

    // 按分の対象外はそのまま通す
    if (!isHaibunTaisho(meisai.himoku)) {
      continue;
    }

    var haibunKekka = haibunSuru(meisai.kingaku, meisai.himoku);

    // 部門ごとに1行ずつ作る
    for (var bumon in haibunKekka) {
      kekkaList.push({
        nengetsu:    meisai.nengetsu,
        bumon:       BUMON_NAME[bumon],
        himoku:      meisai.himoku,
        kingakuMae:  meisai.kingaku,
        rate:        HAIBUN_RATE[bumon],
        kingakuAto:  haibunKekka[bumon]
      });
    }
  }

  return kekkaList;
}
