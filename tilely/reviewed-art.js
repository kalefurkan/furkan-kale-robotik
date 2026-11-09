(function (root) {
  'use strict';

  // Fixed 8×8 designs for the second-grade cards reported in play review.
  // Each entry has the card title, eight rows of tiles, and the existing mode.
  const reviewedArt = {
    oo: { 58: ['Dört köşeli mandala', 'P..P/.YY./.YY./P..P', ''] },
    s1: { 58: ['Çiçek halkalı mandala', 'P.LL.P/.PKKP./LKYYKL/LKYYKL/.PKKP./P.LL.P', ''] },
    s2: {
      129: ['İçi açık kalp', '.RR..RR./R..RR..R/R......R/R......R/.R....R./..R..R../...RR.../........', ''],
      58: ['Dört yapraklı mandala', [
        '...YY...',
        '.P.BB.P.',
        '..BYYB..',
        'YBYRRYBY',
        'YBYRRYBY',
        '..BYYB..',
        '.P.BB.P.',
        '...YY...'
      ].join('/'), ''],
      59: ['Bıyıklı kedi', [
        '.O....O.',
        '.OO..OO.',
        '.OKOOKO.',
        '.OOOOOO.',
        'NDODODON',
        'NOOKKOON',
        '.NOOON..',
        '..OOO...'
      ].join('/'), ''],
      60: ['Sarkık kulaklı köpek', [
        '..NNNN..',
        '.NONNON.',
        'NODOODON',
        'NONYYNON',
        'NLYDDYLN',
        'N.YYYY.N',
        '..NKKN..',
        '...NN...'
      ].join('/'), ''],
      61: ['Yuvarlak kulaklı panda', [
        '.DD..DD.',
        '.DDLLDD.',
        '.LLLLLL.',
        'LDDLLDDL',
        'LDLLLLDL',
        'LLLDDLLL',
        '.LLKKLL.',
        '..LLLL..'
      ].join('/'), 'm'],
      62: ['Uzun kulaklı tavşan', [
        '.L....L.',
        '.LK..KL.',
        '.LK..KL.',
        '..L..L..',
        '.LLLLLL.',
        '.LDLLDL.',
        '.LLKKLL.',
        '..LLLL..'
      ].join('/'), ''],
      63: ['Kırmızı çatılı ev', [
        '...RR...',
        '..RRRR..',
        '.RRRRRR.',
        'RRRRRRRR',
        'YYBYYBYY',
        'YYYYNNYY',
        'YYYYNNYY',
        'GGGGGGGG'
      ].join('/'), ''],
      68: ['Kırmızı yelkenli', [
        '...N....',
        '...NR...',
        '...NRR..',
        '...NRRR.',
        '...NRRRR',
        '...N....',
        'NNNNNNNN',
        '.NNNNNN.'
      ].join('/'), ''],
      76: ['İki renkli kalp', [
        '........',
        '.RR..RR.',
        'RKKRRKKR',
        'RKKRRKKR',
        '.RKKKKR.',
        '..RKKR..',
        '...RR...',
        '........'
      ].join('/'), 'm'],
      83: ['Kuyruğunu kaldıran kedi', [
        '......O.',
        '.O.O..O.',
        '.OOO..O.',
        '.DOD..O.',
        '.OOKOOO.',
        '..OOOOO.',
        '..O.O.O.',
        '..O...O.'
      ].join('/'), ''],
      84: ['Yürüyen köpek', [
        '........',
        '..NN....',
        '.NNDN..N',
        'NNNNN..N',
        '..RRNNNN',
        '..NNNNNN',
        '..N.N..N',
        '..N....N'
      ].join('/'), ''],
      85: ['Bambu tutan panda', [
        '..D..D..',
        '.DLLLLD.',
        '.LDLLDL.',
        '.LLDDLL.',
        '..LLLL..',
        '.DDGGDD.',
        'DDLGGLDD',
        '.DDGGDD.'
      ].join('/'), 'm'],
      86: ['Havuçlu tavşan', [
        '.L.L....',
        '.LKL....',
        '.LLL....',
        'LLLDL.GG',
        'LLLLL.G.',
        '.LLLL.O.',
        'LLLLLOO.',
        '.LLLL...'
      ].join('/'), ''],
      87: ['Bacalı ev', [
        '.....N..',
        '..R..N..',
        '.RRR.N..',
        'RRRRRR..',
        '.YBYYR..',
        '.YYYNR..',
        '.YYYNR..',
        'GGGGGGGG'
      ].join('/'), ''],
      92: ['Çift yelkenli tekne', [
        '....N...',
        '...YN...',
        '..YYNR..',
        '.YYYNRR.',
        'YYYYNRRR',
        '....N...',
        '.BBBBBBB',
        '..BBBBB.'
      ].join('/'), '']
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = reviewedArt;
  else root.TilelyReviewedArt = reviewedArt;
})(globalThis);
