/* Adjusted curated artwork and titles, keyed by the original group and card number. */
(function (root) {
  'use strict';

  const review = {
    oo: {
      3: ['Mor dikdörtgen'],
      4: ['Yeşil yapraklar', 'GG./.GG/..G'],
      6: ['Fidan', '.G./GG./.N.'],
      8: ['Güneş', 'OYO/.Y./OYO'],
      9: ['Kırmızı çerçeve', 'RRR/R.R/RRR'],
      10: ['Mavi filiz', 'G../GL./.L.'],
      11: ['Basamaklar', 'R../RR./RRR'],
      13: ['Külah', 'KKK/O.O/.O.'],
      14: ['Turuncu ve sarı desen', 'O.O/YYY/..O'],
      16: ['Pembe kelebek', 'KPK/.P./K.K'],
      18: ['Papatya', 'K.K/.Y./.G.'],
      27: ['Kırmızı elma', '.G../.RR./RRRR/RRR.'],
      28: ['Lolipop', '.KK./KYYK/KKK./.N..'],
      30: ['Ağaç', '.GG./GGGG/..GG/..N.'],
      32: ['Mavi U'],
      39: ['Pencere', 'NNNN/NLLN/NLLN/N.NN'],
      40: ['Mutlu yüz', '.YY./DYYD/YYYY/.D..'],
      42: ['Çiçek', '.K../KYYK/.KK./.GG.'],
      43: ['Mavi çiçek', 'B.B./.YB./.G../GG..'],
      45: ['Mor kelebek', 'P..P/PBBP/.BB./P..P'],
      46: ['Sarı kapı'],
      47: ['Mavi yıldız', '.P../BPB./.B../B.B.'],
      48: ['Kırmızı ve turuncu desen', '.RR./ROOR/.OO./R..R'],
      50: ['Robot yüzü']
    },
    s1: {
      6: ['Mavi desen'],
      12: ['Dondurma', '..K../.KKK./KKKKK/OOOOO/..O..'],
      13: ['Elma', '..G../.RRR./RRRRR/RRRR./.RRR.'],
      14: ['Güneş', '.O.O./OYYYO/.YYY./OYYYO/.O.O.'],
      20: ['Mor ve mavi baklava'],
      34: ['Yeşil çerçeve']
    },
    s2: {
      11: ['Sarı ve kırmızı desen'],
      18: ['Mor mandala'],
      23: ['Mavi ve turuncu mandala'],
      30: ['Köşe çiçekleri'],
      33: ['Dört renkli mozaik'],
      35: ['Mor ve pembe desen'],
      42: ['Yeşil mandala'],
      46: ['Renkli simetri']
    }
  };

  root.TilelyCuratedReview = review;
  if (typeof module !== 'undefined' && module.exports) module.exports = review;
})(typeof globalThis !== 'undefined' ? globalThis : window);
