/**
 * 集計表 出力モジュール
 * 株式会社ミドリ商事 財務会計アプリ
 *
 * 按分の結果をスプレッドシートに出力する処理をまとめています。
 */


// ============================================
// 設定値
// ============================================

/**
 * 出力先のシート名
 */
const SHUKKEI_SHEET = '月次集計表';


/**
 * 出力する列の見出し
 */
const MIDASHI = [
  '対象年月',
  '部門名',
  '費目名',
  '按分前金額',
  '按分率',
  '按分後金額',
  '消費税額'
];


// ============================================
// 出力処理
// ============================================

/**
 * 集計表をスプレッドシートに出力します。
 *
 * @param {Array} kekkaList - 按分結果の配列
 */
function shukkeiShutsuryoku(kekkaList) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet()
                            .getSheetByName(SHUKKEI_SHEET);

  if (!sheet) {
    throw new Error('出力先のシートが見つかりません: ' + SHUKKEI_SHEET);
  }

  // 既存の内容を消す
  sheet.clear();

  // 見出しを書き込む
  sheet.getRange(1, 1, 1, MIDASHI.length).setValues([MIDASHI]);

  // 明細を組み立てる
  var rows = [];

  for (var i = 0; i < kekkaList.length; i++) {
    var kekka = kekkaList[i];

    rows.push([
      kekka.nengetsu,
      kekka.bumon,
      kekka.himoku,
      kekka.kingakuMae,
      kekka.rate,
      Math.round(kekka.kingakuAto),
      kekka.zeigaku
    ]);
  }

  // まとめて書き込む
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, MIDASHI.length).setValues(rows);
  }

  // 部門ごとの小計を追加する
  tsukeruShokei(sheet, kekkaList, rows.length);
}


/**
 * 部門ごとの小計行を追加します。
 *
 * @param {Sheet} sheet - 出力先のシート
 * @param {Array} kekkaList - 按分結果の配列
 * @param {number} meisaiKensu - 明細の件数
 */
function tsukeruShokei(sheet, kekkaList, meisaiKensu) {

  // 部門ごとに合計する
  var shokei = {};

  for (var i = 0; i < kekkaList.length; i++) {
    var kekka = kekkaList[i];

    if (!shokei[kekka.bumon]) {
      shokei[kekka.bumon] = 0;
    }

    shokei[kekka.bumon] += kekka.kingakuAto;
  }

  // 小計行を書き込む
  var gyo = meisaiKensu + 3;

  for (var bumon in shokei) {
    sheet.getRange(gyo, 2).setValue(bumon + ' 小計');
    sheet.getRange(gyo, 6).setValue(Math.round(shokei[bumon]));
    gyo++;
  }
}


/**
 * 月次処理をまとめて実行します。
 * AppSheet のボタンから呼び出されます。
 *
 * @param {string} nengetsu - 対象年月（例: '2026-08'）
 */
function getsujiShori(nengetsu) {

  // 明細を取り出す
  var meisaiList = yomikomuMeisai(nengetsu);

  // 按分する
  var haibunKekka = haibunMatomete(meisaiList);

  // 消費税を計算する
  for (var i = 0; i < haibunKekka.length; i++) {
    haibunKekka[i].zeigaku = keisanShohizei(haibunKekka[i].kingakuAto);
  }

  // 出力する
  shukkeiShutsuryoku(haibunKekka);

  return haibunKekka.length + '件の処理が完了しました。';
}


/**
 * 指定された年月の明細を読み込みます。
 *
 * @param {string} nengetsu - 対象年月
 * @return {Array} 明細の配列
 */
function yomikomuMeisai(nengetsu) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet()
                            .getSheetByName('共通費明細');

  if (!sheet) {
    throw new Error('明細シートが見つかりません');
  }

  var data = sheet.getDataRange().getValues();
  var meisaiList = [];

  // 1行目は見出しなので飛ばす
  for (var i = 1; i < data.length; i++) {

    // 対象の年月だけを取り出す
    if (data[i][0] !== nengetsu) {
      continue;
    }

    meisaiList.push({
      nengetsu:    data[i][0],
      himoku:      data[i][1],
      kanjoKamoku: data[i][2],
      kingaku:     data[i][3]
    });
  }

  return meisaiList;
}
