/* Reefq ready-made invitation wording.
   Each text is the line shown ABOVE the couple's names, so it leads into them.
   The studio lets the team pick one per event type and tone, then edit it freely (custom text always wins).
   Openings are optional lines shown at the very top of the invitation. */
(function(){
'use strict';
/* Opening lines the couple can tick (several at once). Same ids and order as OPENING_LIST in engine.js, which holds the
   texts shown on the invitation; `ar` here is only what the forms display next to the box. */
var OPENINGS = [
  { id: 'bismillah', ar: 'بسم الله الرحمن الرحيم', label: { fr: 'Basmala', ar: 'البسملة', en: 'Basmala' } },
  { id: 'khaliq',    ar: 'باسم خالق الحبّ', label: { fr: 'Au nom du Créateur de l\'amour', ar: 'باسم خالق الحبّ', en: 'In the name of the Creator of love' } },
  { id: 'verse',     ar: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا…', label: { fr: 'Verset Ar-Rûm 21', ar: 'آية الروم ٢١', en: 'Verse Ar-Rum 21' } },
  { id: 'dhariyat',  ar: 'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ…', label: { fr: 'Verset Adh-Dhâriyât 49', ar: 'آية الذاريات ٤٩', en: 'Verse Adh-Dhariyat 49' } },
  { id: 'naba',      ar: 'وَخَلَقْنَاكُمْ أَزْوَاجًا', label: { fr: 'Verset An-Naba\' 8', ar: 'آية النبأ ٨', en: 'Verse An-Naba 8' } },
  { id: 'yasin',     ar: 'سُبْحَانَ الَّذِي خَلَقَ الْأَزْوَاجَ كُلَّهَا', label: { fr: 'Verset Yâ-Sîn 36', ar: 'آية يس ٣٦', en: 'Verse Ya-Sin 36' } },
  { id: 'furqan',    ar: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا…', label: { fr: 'Verset Al-Furqân 74', ar: 'آية الفرقان ٧٤', en: 'Verse Al-Furqan 74' } },
  { id: 'hamd',      ar: 'الحمد لله الذي بنعمته تتمّ الصالحات', label: { fr: 'Louange (hamd)', ar: 'الحمد لله', en: 'Praise (hamd)' } },
  { id: 'baraka',    ar: 'على بركة الله', label: { fr: 'Avec la bénédiction d\'Allah', ar: 'على بركة الله', en: 'With Allah\'s blessing' } }
];

var TONES = [
  { id: 'classic',   label: { fr: 'Classique', ar: 'كلاسيكي', en: 'Classic' } },
  { id: 'families',  label: { fr: 'Au nom des familles', ar: 'باسم العائلتين', en: 'From the families' } },
  { id: 'blessing',  label: { fr: 'Bénédiction', ar: 'بركة', en: 'Blessing' } },
  { id: 'modern',    label: { fr: 'Moderne et sobre', ar: 'عصري وبسيط', en: 'Modern and simple' } },
  { id: 'tunisian',  label: { fr: 'Traditionnel tunisien', ar: 'تقليدي تونسي', en: 'Traditional Tunisian' } },
  { id: 'honour',    label: { fr: 'Joie et honneur', ar: 'يسعدنا ويشرّفنا', en: 'Joy and honour' } },
  { id: 'joy',       label: { fr: 'Cœurs pleins de joie', ar: 'بقلوب ملؤها المحبّة', en: 'Hearts full of joy' } },
  { id: 'inshallah', label: { fr: 'Si Dieu le veut', ar: 'بمشيئة الله', en: 'God willing' } },
  { id: 'love',      label: { fr: 'Avec affection', ar: 'بكلّ الحبّ والتقدير', en: 'With love' } },
  { id: 'hearts',    label: { fr: 'Deux cœurs réunis', ar: 'جمع الله بين قلبين', en: 'Two hearts united' } },
  { id: 'poetic',    label: { fr: 'Poétique', ar: 'تزدان الأفراح بحضوركم', en: 'Poetic' } },
  { id: 'dialect',   label: { fr: 'Tunisien parlé', ar: 'باللهجة التونسية', en: 'Tunisian dialect' } },
  /* follows the "who invites" lines (parents or families): the invitation writes it with the right grammar for one or
     two families, with or without the mothers, so it is stored empty */
  { id: 'hosts',     label: { fr: 'Suite des parents / familles', ar: 'تكملة لاسم الوالدين أو العائلتين', en: 'Continues from the hosts' } }
];

/* optional last line of the invitation card */
var CLOSINGS = [
  { id: 'none',     label: { fr: 'Aucune', ar: 'بدون', en: 'None' } },
  { id: 'presence', label: { fr: 'Votre présence comblera notre joie', ar: 'بحضوركم تكتمل فرحتنا', en: 'Your presence…' },
    text: { ar: 'بحضوركم تكتمل فرحتنا', fr: 'Votre présence comblera notre joie', en: 'Your presence will make our joy complete' } },
  { id: 'dua',      label: { fr: 'Invocation pour les mariés', ar: 'دعاء للعروسين', en: 'Prayer for the couple' },
    text: { ar: 'بارك الله لهما وبارك عليهما وجمع بينهما في خير', fr: 'Qu\'Allah les bénisse et les unisse dans le bien', en: 'May Allah bless them and unite them in goodness' } },
  { id: 'homes',    label: { fr: 'Que la joie emplisse vos foyers', ar: 'دامت دياركم عامرة بالأفراح', en: 'Joy in your homes' },
    text: { ar: 'دامت دياركم عامرة بالأفراح', fr: 'Que la joie emplisse toujours vos foyers', en: 'May your homes always be filled with joy' } },
  { id: 'welcome',  label: { fr: 'Dans l\'attente de vous accueillir', ar: 'في انتظار تشريفكم', en: 'Looking forward' },
    text: { ar: 'ونحن في انتظار تشريفكم', fr: 'Dans l\'attente du plaisir de vous accueillir', en: 'We look forward to welcoming you' } }
];
function closing(id) {
  var c = CLOSINGS.filter(function (x) { return x.id === id; })[0];
  return c && c.text ? { fr: c.text.fr, ar: c.text.ar, en: c.text.en } : { fr: '', ar: '', en: '' };
}

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
                en: 'We are getting married, and the day would not be complete without you' },
    tunisian: { fr: 'Dans la joie et avec la bénédiction de Dieu, nous avons l\'honneur de vous convier au mariage de',
                ar: 'بكلّ فرحٍ وسرور، وعلى بركة الله، نتشرّف بدعوتكم لحضور حفل زفاف',
                en: 'With joy and God\'s blessing, we are honoured to invite you to the wedding of' }
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
                en: 'It\'s official: we are engaged, and we would love you to celebrate with us' },
    tunisian: { fr: 'Dans la joie et avec la bénédiction de Dieu, nous avons l\'honneur de vous convier aux fiançailles de',
                ar: 'بكلّ فرحٍ وسرور، وعلى بركة الله، نتشرّف بدعوتكم لحضور حفل خطوبة',
                en: 'With joy and God\'s blessing, we are honoured to invite you to the engagement of' }
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
                en: 'Henna, sweets and family together: an evening to celebrate' },
    tunisian: { fr: 'Dans la joie et la baraka, nous avons l\'honneur de vous convier à la soirée du henné de',
                ar: 'بكلّ فرحٍ وسرور، نتشرّف بدعوتكم لحضور سهرة حنّة',
                en: 'In joy and blessing, we are honoured to invite you to the henna night of' }
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
                en: 'We are making it official, and your presence would mean a lot to us' },
    tunisian: { fr: 'Selon la sunna de Dieu et de Son Messager, nous avons l\'honneur de vous convier au contrat de mariage de',
                ar: 'على سنّة الله ورسوله، نتشرّف بدعوتكم لحضور حفل عقد قران',
                en: 'Following the Sunnah of God and His Messenger, we are honoured to invite you to the marriage contract of' }
  }
};

/* get('wedding','blessing') → { fr, ar, en } ; falls back to wedding/classic */
/* Tones written once for every occasion: the line ends with the occasion, then the couple's names follow.
   ar = formal Arabic occasion, tn = how it is said in Tunisian dialect. */
var EV = {
  wedding:    { ar: 'حفل زفاف', tn: 'عرس', fr: 'au mariage de', en: 'the wedding of' },
  engagement: { ar: 'حفل خطوبة', tn: 'خطوبة', fr: 'aux fiançailles de', en: 'the engagement of' },
  henna:      { ar: 'سهرة حنّة', tn: 'حنّة', fr: 'à la soirée du henné de', en: 'the henna night of' },
  contract:   { ar: 'حفل عقد قران', tn: 'كتب كتاب', fr: 'au contrat de mariage de', en: 'the marriage contract of' }
};
var PATTERNS = {
  honour:    function (e) { return { ar: 'يسعدنا ويشرّفنا دعوتكم لحضور ' + e.ar, fr: 'Nous avons la joie et l\'honneur de vous convier ' + e.fr, en: 'It is our joy and honour to invite you to ' + e.en }; },
  joy:       function (e) { return { ar: 'بقلوبٍ ملؤها المحبّة والسرور، ندعوكم لمشاركتنا ' + e.ar, fr: 'Le cœur rempli de joie, nous vous invitons ' + e.fr, en: 'With hearts full of joy, we invite you to ' + e.en }; },
  inshallah: function (e) { return { ar: 'بمشيئة الله تعالى، نتشرّف بدعوتكم لحضور ' + e.ar, fr: 'Si Dieu le veut, nous aurons l\'honneur de vous recevoir ' + e.fr, en: 'God willing, we are honoured to invite you to ' + e.en }; },
  love:      function (e) { return { ar: 'بكلّ الحبّ والتقدير، نتشرّف بدعوتكم لحضور ' + e.ar, fr: 'Avec toute notre affection, nous vous convions ' + e.fr, en: 'With love and gratitude, we invite you to ' + e.en }; },
  hearts:    function (e) { return { ar: 'جمع الله بين قلبين على المودّة والرحمة، ويسعدنا دعوتكم لحضور ' + e.ar, fr: 'Allah a réuni deux cœurs dans l\'affection et la miséricorde ; nous serions heureux de vous accueillir ' + e.fr, en: 'Allah has united two hearts in affection and mercy; we would be delighted to welcome you to ' + e.en }; },
  poetic:    function (e) { return { ar: 'تزدان الأفراح بحضوركم، ويطيب لنا أن ندعوكم لحضور ' + e.ar, fr: 'Votre présence embellira notre joie : soyez des nôtres ' + e.fr, en: 'Your presence will complete our joy; join us at ' + e.en }; },
  dialect:   function (e) { return { ar: 'بكلّ فرحة، يشرّفنا نستدعيوكم باش تحضرو معانا ' + e.tn, fr: 'Avec beaucoup de joie, nous vous invitons ' + e.fr, en: 'With great joy, we invite you to ' + e.en }; }
};

function get(event, tone) {
  if (tone === 'hosts') return { fr: '', ar: '', en: '' };
  if (PATTERNS[tone]) return PATTERNS[tone](EV[event] || EV.wedding);
  var e = T[event] || T.wedding;
  return e[tone] || e.classic;
}

window.ReefqWording = { OPENINGS: OPENINGS, TONES: TONES, EVENTS: EVENTS, CLOSINGS: CLOSINGS, TEXTS: T, get: get, closing: closing };
})();
