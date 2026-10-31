(function(){
  "use strict";

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  menuBtn.addEventListener('click', function(){
    var open = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click', function(e){
    if(e.target.closest('a')) navLinks.classList.remove('open');
  });

  /* In-page navigation — make every anchor button scroll reliably to its section */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(!id || id.length < 2) return;
      var target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
      if(window.history && history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Toast */
  var toast = document.getElementById('toast'), toastTimer;
  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 2400);
  }
  function copyText(text, msg){
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){ showToast(msg); }, function(){ fallbackCopy(text, msg); });
    } else { fallbackCopy(text, msg); }
  }
  function fallbackCopy(text, msg){
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast(msg); } catch(e){ showToast('Gagal menyalin — catat manual ya'); }
    document.body.removeChild(ta);
  }

  /* Skin concern recommender */
  var RECO = {
    kusam:   { name:'Hydra Glow Facial', desc:'Kulit kusam biasanya haus hidrasi dan butuh eksfoliasi lembut. Hydra Glow membersihkan sel kulit mati sekaligus membanjiri kulit dengan serum hyaluronic — hasilnya cerah segar, bukan pucat.', time:'60 menit' },
    kering:  { name:'Hydra Glow Facial', desc:'Untuk kulit kering dan dehidrasi, fokusnya adalah mengembalikan kelembapan dan memperkuat skin barrier. Hydra Glow memberikan hidrasi berlapis yang langsung terasa kenyal dan nyaman.', time:'60 menit' },
    jerawat: { name:'Acne Clarifying Facial', desc:'Kulit berjerawat butuh pembersihan pori yang higienis tanpa memperparah peradangan. Treatment ini menenangkan jerawat aktif, mengangkat komedo, dan memberi panduan skincare yang realistis.', time:'75 menit' },
    sensitif:{ name:'Signature Wow Facial', desc:'Kulit sensitif paling cocok dengan pendekatan lembut dan bertahap. Signature Wow Facial kami sesuaikan penuh — produk penenang, tanpa eksfoliasi keras, dan tekanan pijatan ekstra ringan.', time:'75 menit' },
    penuaan: { name:'24K Gold Luxury Facial', desc:'Untuk garis halus dan kulit yang mulai kendur, 24K Gold Luxury Facial memberikan nutrisi anti-aging intensif plus stimulasi pijatan yang membantu kulit tampak lebih kencang dan bercahaya.', time:'90 menit' },
    flek:    { name:'Signature Wow Facial', desc:'Warna kulit tidak merata membaik dengan eksfoliasi teratur dan serum pencerah. Signature Wow Facial dengan booster vitamin C membantu menyamarkan flek secara bertahap dan aman.', time:'75 menit' }
  };
  var resultBox = document.getElementById('quizResult');
  function renderReco(key){
    var r = RECO[key]; if(!r) return;
    resultBox.innerHTML =
      '<span class="tag">Rekomendasi untukmu</span>' +
      '<h3>' + r.name + '</h3>' +
      '<p>' + r.desc + '</p>' +
      '<div class="meta"><span>Durasi ' + r.time + '</span></div>' +
      '<a class="btn btn-gold btn-sm" href="#reservasi" data-book="' + r.name + '">Reservasi Treatment Ini</a>';
    var link = resultBox.querySelector('[data-book]');
    link.addEventListener('click', function(){ selectTreatment(r.name); });
  }
  var chips = document.querySelectorAll('#concernChips .chip');
  chips.forEach(function(chip){
    chip.addEventListener('click', function(){
      chips.forEach(function(c){ c.classList.remove('active'); });
      chip.classList.add('active');
      renderReco(chip.getAttribute('data-concern'));
    });
  });
  renderReco('kusam');

  /* Treatment pre-select from cards / plans */
  var treatSelect = document.getElementById('fTreat');
  function selectTreatment(name){
    for(var i=0;i<treatSelect.options.length;i++){
      if(treatSelect.options[i].text.indexOf(name) === 0){ treatSelect.selectedIndex = i; return; }
    }
    for(var j=0;j<treatSelect.options.length;j++){
      if(treatSelect.options[j].text.toLowerCase().indexOf(name.toLowerCase().replace('paket ','')) !== -1){ treatSelect.selectedIndex = j; return; }
    }
  }
  document.querySelectorAll('[data-book]').forEach(function(el){
    el.addEventListener('click', function(){ selectTreatment(el.getAttribute('data-book')); });
  });


  /* Booking summary */
  var form = document.getElementById('bookForm');
  var summaryText = '';
  function fmtDate(val){
    if(!val) return '—';
    var d = new Date(val + 'T00:00:00');
    if(isNaN(d)) return val;
    return d.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('fName').value.trim();
    if(!name){ showToast('Isi namamu dulu ya'); document.getElementById('fName').focus(); return; }
    var treat = treatSelect.value;
    var date = fmtDate(document.getElementById('fDate').value);
    var time = document.getElementById('fTime').value;
    var concern = document.getElementById('fConcern').value.trim() || 'Tidak disebutkan';
    document.getElementById('sName').textContent = name;
    document.getElementById('sTreat').textContent = treat;
    document.getElementById('sDate').textContent = date;
    document.getElementById('sTime').textContent = time;
    document.getElementById('sConcern').textContent = concern;
    document.getElementById('summaryEmpty').hidden = true;
    document.getElementById('summaryContent').hidden = false;
    summaryText = 'RESERVASI FACIAL WOW\nNama: ' + name + '\nTreatment: ' + treat + '\nTanggal: ' + date + '\nJam: ' + time + '\nKeluhan kulit: ' + concern;
    document.getElementById('waSummary').href = 'https://wa.me/?text=' + encodeURIComponent(summaryText);
    showToast('Ringkasan reservasi dibuat — salin dan kirim ke tim kami ya!');
    document.getElementById('summaryBox').scrollIntoView({ behavior:'smooth', block:'nearest' });
  });
  document.getElementById('copySummary').addEventListener('click', function(){
    if(summaryText) copyText(summaryText, 'Ringkasan tersalin — siap dikirim!');
  });
  document.getElementById('resetSummary').addEventListener('click', function(){
    form.reset();
    summaryText = '';
    document.getElementById('summaryEmpty').hidden = false;
    document.getElementById('summaryContent').hidden = true;
  });
  /* default date = today */
  var today = new Date();
  var iso = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
  var dateInput = document.getElementById('fDate');
  dateInput.min = iso; dateInput.value = iso;

  /* FAQ accordion */
  document.querySelectorAll('.faq').forEach(function(faq){
    var btn = faq.querySelector('button');
    var ans = faq.querySelector('.ans');
    btn.addEventListener('click', function(){
      var isOpen = faq.classList.contains('open');
      document.querySelectorAll('.faq.open').forEach(function(o){
        o.classList.remove('open');
        o.querySelector('.ans').style.maxHeight = '0px';
        o.querySelector('button').setAttribute('aria-expanded','false');
      });
      if(!isOpen){
        faq.classList.add('open');
        ans.style.maxHeight = ans.scrollHeight + 'px';
        btn.setAttribute('aria-expanded','true');
      }
    });
  });

  /* Scroll reveal */
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }
})();
