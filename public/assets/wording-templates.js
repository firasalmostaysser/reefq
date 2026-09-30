/* Reefq ready-made invitation wording.
   Each text is the line shown ABOVE the couple's names, so it leads into them.
   The studio lets the team pick one per event type and tone, then edit it freely (custom text always wins).
   Openings are optional lines shown at the very top of the invitation. */
(function(){
'use strict';
var OPENINGS = [
  { id: 'none',      label: { fr: 'Aucune', ar: 'بدون', en: 'None' } },
  { id: 'bismillah', label: { fr: 'Basmala', ar: 'البسملة', en: 'Basmala' },
    text: { ar: 'بسم الله الرحمن الرحيم' } },
  { id: 'verse',     label: { fr: 'Verset (Ar-Rûm 21)', ar: 'آية (الروم ٢١)', en: 'Verse (Ar-Rum 21)' },
    text: {
      ar: '﴿ وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ﴾',
      fr: 'Et parmi Ses signes, Il vous a créé des épouses issues de vous-mêmes, afin que vous trouviez auprès d\'elles la sérénité, et Il a mis entre vous affection et miséricorde.',
      en: 'And among His signs is that He created for you spouses from among yourselves, that you may find tranquillity in them, and He placed between you affection and mercy.'
    },
    ref: { ar: 'الروم: ٢١', fr: 'Sourate Ar-Rûm, 21', en: 'Surah Ar-Rum, 21' } }
];

var TONES = [
  { id: 'classic',   label: { fr: 'Classique', ar: 'كلاسيكي', en: 'Classic' } },
  { id: 'families',  label: { fr: 'Au nom des familles', ar: 'باسم العائلتين', en: 'From the families' } },
  { id: 'blessing',  label: { fr: 'Bénédiction', ar: 'بركة', en: 'Blessing' } },
  { id: 'modern',    label: { fr: 'Moderne et sobre', ar: 'عصري وبسيط', en: 'Modern and simple' } }
];

var EVENTS = [
  { id: 'wedding',    label: { fr: 'Mariage', ar: 'زفاف', en: 'Wedding' } },
  { id: 'engagement', label: { fr: 'Fiançailles', ar: 'خطوبة', en: 'Engagement' } },
  { id: 'henna',      label: { fr: 'Soirée du henné', ar: 'سهرة الحنّة', en: 'Henna night' } },
  { id: 'contract',   label: { fr: 'Contrat de mariage', ar: 'عقد القران', en: 'Marriage contract' } }
];

var T = {
  wedding: {
    classic:  { fr: 'Entourés de leurs familles, ils ont la joie de vous convier à la célébration de leur mariage',
                ar: 'بقلوبٍ يغمرها الفرح، يتشرّفان بدعوتكم لمشاركتهما فرحة زفافهما',
                en: 'Together with their families, they joyfully invite you to celebrate their wedding' },
    families: { fr: 'Les familles des mariés ont l\'honneur de vous inviter à célébrer l\'union de',
                ar: 'تتشرّف العائلتان الكريمتان بدعوتكم لحضور حفل زفاف',
                en: 'The families of the bride and groom request the honour of your presence at the marriage of' },
    blessing: { fr: 'Avec la bénédiction de Dieu et de leurs parents, ils vous invitent à partager la joie de leur union',
                ar: 'على بركة الله، وبرضا الوالدين، يسعدهما أن تشاركوهما فرحة زفافهما',
                en: 'With the blessing of God and their parents, they invite you to share the joy of their marriage' },
    modern:   { fr: 'Nous nous marions, et ce jour n\'aurait pas la même saveur sans vous',
                ar: 'قرّرنا أن نكمل الطريق معاً، ويسعدنا أن تكونوا معنا في هذا اليوم',
                en: 'We are getting married, and the day would not be complete without you' }
  },
  engagement: {
    classic:  { fr: 'Entourés de leurs familles, ils ont la joie de vous convier à la célébration de leurs fiançailles',
                ar: 'بكلّ فرح، يسرّهما أن تشاركوهما حفل خطوبتهما',
                en: 'Together with their families, they are delighted to invite you to celebrate their engagement' },
    families: { fr: 'Les deux familles ont le plaisir de vous inviter aux fiançailles de',
                ar: 'يسرّ العائلتين دعوتكم لحضور حفل خطوبة',
                en: 'Both families are pleased to invite you to the engagement of' },
    blessing: { fr: 'Avec la bénédiction de Dieu, ils vous invitent à célébrer le début de leur histoire',
                ar: 'على بركة الله، يدعوانكم للاحتفال بخطوبتهما وبداية حكايتهما',
                en: 'With God\'s blessing, they invite you to celebrate the beginning of their story' },
    modern:   { fr: 'C\'est officiel : nous nous fiançons, et nous voulons vous avoir à nos côtés',
                ar: 'أصبح الأمر رسمياً: نحتفل بخطوبتنا ونريدكم إلى جانبنا',
                en: 'It\'s official: we are engaged, and we would love you to celebrate with us' }
  },
  henna: {
    classic:  { fr: 'Fidèles aux traditions de nos familles, nous serions heureux de vous accueillir à la soirée du henné de',
                ar: 'وفاءً لتقاليد عائلاتنا، يسعدنا أن تشاركونا سهرة الحنّة احتفاءً بـ',
                en: 'Keeping our family traditions, we would be delighted to welcome you to the henna night of' },
    families: { fr: 'Les familles vous invitent à une soirée du henné, entre proches, en l\'honneur de',
                ar: 'تدعوكم العائلتان إلى سهرة الحنّة، في لمّة الأحباب، احتفاءً بـ',
                en: 'The families invite you to an evening of henna among loved ones, in honour of' },
    blessing: { fr: 'Dans la joie et la baraka, rejoignez-nous pour la soirée du henné de',
                ar: 'في جوٍّ من الفرح والبركة، نتشرّف بحضوركم سهرة حنّة',
                en: 'In joy and blessing, join us for the henna night of' },
    modern:   { fr: 'Henné, douceurs et famille réunie : une soirée pour célébrer',
                ar: 'حنّة وحلويات ولمّة عائلة: سهرة نحتفل فيها بـ',
                en: 'Henna, sweets and family together: an evening to celebrate' }
  },
  contract: {
    classic:  { fr: 'Ils ont la joie de vous convier à la conclusion de leur contrat de mariage',
                ar: 'يتشرّفان بدعوتكم لحضور عقد قرانهما',
                en: 'They are pleased to invite you to witness their marriage contract' },
    families: { fr: 'Les deux familles vous prient d\'honorer de votre présence le contrat de mariage de',
                ar: 'تتشرّف العائلتان بدعوتكم لحضور عقد قران',
                en: 'Both families request your presence at the marriage contract of' },
    blessing: { fr: 'Selon la sunna de Dieu et de Son Messager, ils scellent leur union et vous invitent à en être témoins',
                ar: 'على سنّة الله ورسوله، يتشرّفان بدعوتكم لحضور عقد قرانهما',
                en: 'Following the Sunnah of God and His Messenger, they invite you to witness their marriage contract' },
    modern:   { fr: 'Nous signons, officiellement. Votre présence compterait beaucoup pour nous',
                ar: 'نوقّع عقد قراننا، وحضوركم يعني لنا الكثير',
                en: 'We are making it official, and your presence would mean a lot to us' }
  }
};

/* get('wedding','blessing') → { fr, ar, en } ; falls back to wedding/classic */
function get(event, tone) {
  var e = T[event] || T.wedding;
  return e[tone] || e.classic;
}

window.ReefqWording = { OPENINGS: OPENINGS, TONES: TONES, EVENTS: EVENTS, TEXTS: T, get: get };
})();
