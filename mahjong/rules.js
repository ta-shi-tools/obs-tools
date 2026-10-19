// 雀魂 段位戦の段位ポイント計算（非公式）
// 出典：雀魂牌譜屋（amae-koromo）のソースコード定数、Game8、npmahjong を照合（2026-10-19時点）
// 銅・銀卓の卓ボーナスは攻略サイトのみが出典
(function (global) {
  // 段位：0〜14 = 初心1〜3, 雀士1〜3, 雀傑1〜3, 雀豪1〜3, 雀聖1〜3
  const RANK_NAMES = ['初心1', '初心2', '初心3', '雀士1', '雀士2', '雀士3', '雀傑1', '雀傑2', '雀傑3',
    '雀豪1', '雀豪2', '雀豪3', '雀聖1', '雀聖2', '雀聖3'];
  const MAX_POINTS = [20, 80, 200, 600, 800, 1000, 1200, 1400, 2000, 2800, 3200, 3600, 4000, 6000, 9000];

  // ラス（四麻4位・三麻3位）の追加減点 [段位]
  const PENALTY = {
    '4-hanchan': [0, 0, 0, 20, 40, 60, 80, 100, 120, 165, 180, 195, 210, 225, 240],
    '4-tonpu': [0, 0, 0, 10, 20, 30, 40, 50, 60, 80, 90, 100, 110, 120, 130],
    '3-hanchan': [0, 0, 0, 20, 40, 60, 80, 100, 120, 165, 190, 215, 240, 265, 290],
    '3-tonpu': [0, 0, 0, 10, 20, 30, 40, 50, 60, 80, 95, 110, 125, 140, 160],
  };

  // 卓ボーナス（順位別、ウマは別）
  const TABLE_BONUS = {
    '4-hanchan': { bronze: [20, 10, 0, 0], silver: [40, 20, 0, 0], gold: [80, 40, 0, 0], jade: [110, 55, 0, 0], throne: [120, 60, 0, 0] },
    '4-tonpu': { bronze: [10, 5, 0, 0], silver: [20, 10, 0, 0], gold: [40, 20, 0, 0], jade: [55, 30, 0, 0], throne: [60, 30, 0, 0] },
    '3-hanchan': { bronze: [30, 0, 0], silver: [60, 0, 0], gold: [105, 0, 0], jade: [160, 0, 0], throne: [240, 0, 0] },
    '3-tonpu': { bronze: [15, 0, 0], silver: [30, 0, 0], gold: [55, 0, 0], jade: [75, 0, 0], throne: [120, 0, 0] },
  };
  const UMA = { 4: [15, 5, -5, -15], 3: [15, 0, -15] };
  const BASE = { 4: 25000, 3: 35000 };
  const TABLE_NAMES = { bronze: '銅の間', silver: '銀の間', gold: '金の間', jade: '玉の間', throne: '王座の間' };

  const key = (players, length) => `${players}-${length}`;
  const startingPoint = (rank) => (rank < 3 ? 0 : MAX_POINTS[rank] / 2);
  // 降段がない段位：初心1〜3、雀士1
  const canDemote = (rank) => rank >= 4;

  // 1局分の段位ポイント増減
  // place: 1始まりの順位、score: 終局時の持ち点
  function delta({ players, length, table, rank, place, score }) {
    const k = key(players, length);
    const i = place - 1;
    const raw = (score - BASE[players]) / 1000 + UMA[players][i];
    let d = Math.ceil(raw - 1e-9) + TABLE_BONUS[k][table][i];
    if (place === players) d -= PENALTY[k][rank];
    return d;
  }

  // 増減を反映して、昇段・降段を処理する
  function apply(state, d) {
    let { rank, pt } = state;
    pt += d;
    let event = null;
    if (pt >= MAX_POINTS[rank]) {
      if (rank < MAX_POINTS.length - 1) { rank += 1; pt = startingPoint(rank); event = 'up'; }
      else { pt = MAX_POINTS[rank]; event = 'konten'; }
    } else if (pt < 0) {
      if (canDemote(rank)) { rank -= 1; pt = startingPoint(rank); event = 'down'; }
      else pt = 0;
    }
    return { rank, pt, event };
  }

  global.MJ = { RANK_NAMES, MAX_POINTS, TABLE_NAMES, startingPoint, canDemote, delta, apply };
})(typeof window !== 'undefined' ? window : globalThis);
