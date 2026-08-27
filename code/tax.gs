/**
 * 消費税 計算モジュール
 * 株式会社ミドリ商事 財務会計アプリ
 *
 * 消費税額の計算処理をまとめています。
 */


// ============================================
// 設定値
// ============================================

/**
 * 消費税率
 */
const ZEIRITSU = 0.10;


// ============================================
// 消費税の計算
// ============================================

/**
 * 税抜金額から消費税額を計算します。
 *
 * @param {number} zeinuki - 税抜金額
 * @return {number} 消費税額（1円未満切り捨て）
 */
function keisanShohizei(zeinuki) {

  if (typeof zeinuki !== 'number' || zeinuki < 0) {
    throw new Error('金額が正しくありません: ' + zeinuki);
  }

  var zeigaku = zeinuki * ZEIRITSU;

  // 1円未満は切り捨て
  return Math.floor(zeigaku);
}


/**
 * 税抜金額から税込金額を計算します。
 *
 * @param {number} zeinuki - 税抜金額
 * @return {number} 税込金額
 */
function keisanZeikomi(zeinuki) {
  return zeinuki + keisanShohizei(zeinuki);
}


/**
 * 税込金額から税抜金額を逆算します。
 *
 * @param {number} zeikomi - 税込金額
 * @return {number} 税抜金額（1円未満切り捨て）
 */
function keisanZeinuki(zeikomi) {

  if (typeof zeikomi !== 'number' || zeikomi < 0) {
    throw new Error('金額が正しくありません: ' + zeikomi);
  }

  var zeinuki = zeikomi / (1 + ZEIRITSU);

  return Math.floor(zeinuki);
}


/**
 * 複数件の明細について、消費税額をまとめて計算します。
 *
 * @param {Array} meisaiList - 明細の配列
 * @return {Array} 消費税額を追加した明細の配列
 */
function shohizeiMatomete(meisaiList) {

  var kekkaList = [];

  for (var i = 0; i < meisaiList.length; i++) {
    var meisai = meisaiList[i];

    kekkaList.push({
      nengetsu:  meisai.nengetsu,
      bumon:     meisai.bumon,
      himoku:    meisai.himoku,
      kanjoKamoku: meisai.kanjoKamoku,
      zeinuki:   meisai.kingaku,
      zeigaku:   keisanShohizei(meisai.kingaku),
      zeikomi:   keisanZeikomi(meisai.kingaku)
    });
  }

  return kekkaList;
}
