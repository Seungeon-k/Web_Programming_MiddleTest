/* jQuery는 클릭과 상태만 제어하고, 실제 움직임은 animations.css가 담당합니다. */
$(function () {
  var $scene = $('#scene');
  var $characters = $('.character');
  var $progress = $('.progress-track');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var state = 'loading';
  var previousState = 'playing';
  var soundEnabled = false;
  var loaded = false;
  var colors = ['#6eae49', '#f2d447', '#e76878', '#58a6cd', '#a78bbd'];

  // 1. 상태에 맞춰 버튼, 안내 문구, 키보드 접근을 바꿉니다.
  function setState(next) {
    state = next;
    $scene.attr('data-state', state);
    $('body').toggleClass('is-paused', state === 'paused');
    var complete = state === 'complete' || (state === 'paused' && previousState === 'complete');
    var labels = {
      loading: '소대 연결 중', playing: '지구 침략 작전 진행 중',
      paused: '잠깐, 작전 회의 중', complete: '전원 집합! 캐릭터를 톡 눌러 보세요.'
    };
    $('.status-text').text(labels[state]);
    $characters.add('.title-lockup').prop('inert', !complete);
    $('#pause').prop('disabled', reducedMotion.matches || state === 'loading')
      .attr('aria-label', state === 'paused' ? '애니메이션 계속 재생' : '애니메이션 일시정지')
      .find('use').attr('href', state === 'paused' ? '#icon-play' : '#icon-pause');
    $('#skip').prop('disabled', complete || state === 'loading');
    $('#replay, #monitor').prop('disabled', state === 'loading');
  }

  // 회전한 모니터 화면의 중심을 장면 안의 좌표로 구합니다.
  function center($element) {
    var box = $element[0].getBoundingClientRect();
    var sceneBox = $scene[0].getBoundingClientRect();
    return { x: box.left + box.width / 2 - sceneBox.left, y: box.top + box.height / 2 - sceneBox.top };
  }

  // 2. 시작 위치와 화면 중앙까지의 거리만 계산해 CSS 변수로 전달합니다.
  function setFlightPaths() {
    var origin = center($('.monitor-screen'));
    $characters.each(function () {
      var $character = $(this);
      var x = parseFloat($character.css('left'));
      var y = parseFloat($character.css('top'));
      // perspective(900px), translateZ(320px)의 확대를 보정합니다.
      var correction = (900 - 320) / 900;
      $character.css({
        '--start-x': (origin.x - x) + 'px', '--start-y': (origin.y - y) + 'px',
        '--camera-x': ($scene.width() * .5 - x) * correction + 'px',
        '--camera-y': ($scene.height() * .45 - y) * correction + 'px'
      });
    });
  }

  function resetParallax() { $scene.css({ '--px': '0px', '--py': '0px' }); }

  // 같은 CSS 애니메이션을 다시 실행하려면 클래스 제거 → 레이아웃 반영 → 추가합니다.
  function restartClass($element, className) {
    $element.removeClass(className);
    void $element[0].offsetWidth;
    $element.addClass(className);
  }

  function start() {
    if (!loaded) return;
    $('body').removeClass('is-playing is-complete is-paused');
    $('.is-reacting').removeClass('is-reacting');
    $('#particles').empty();
    resetParallax();
    setFlightPaths();
    $progress.attr('aria-valuenow', 0);
    $('.screen-status').text('출동 준비');
    if (reducedMotion.matches) { finish(); return; }
    setState('playing');
    restartClass($('body'), 'is-playing');
  }

  function finish() {
    $('body').removeClass('is-playing is-paused').addClass('is-complete');
    $('.is-reacting').removeClass('is-reacting');
    $('#particles').empty();
    $progress.attr('aria-valuenow', 100);
    $('.screen-status').text('전원 집합!');
    if (reducedMotion.matches) resetParallax();
    setState('complete');
  }

  function pause() {
    if (state !== 'playing' && state !== 'complete') return;
    previousState = state;
    setState('paused');
    $('audio').each(function () { this.pause(); });
  }

  $('#replay, #monitor').on('click', start);
  $('#skip').on('click', finish);
  $('#pause').on('click', function () {
    if (state === 'paused') setState(previousState);
    else pause();
  });

  // CSS의 진행 막대가 끝나면 완성 상태로 전환합니다. 별도의 재생 타이머는 없습니다.
  $progress.find('span').on('animationend', function (event) {
    if (event.originalEvent.animationName === 'mission-progress') finish();
  });

  // 3. Canvas 대신 span 요소를 만들고 CSS로 별·원·색종이를 흩뿌립니다.
  function burst(x, y, count, color) {
    if (reducedMotion.matches || state === 'paused') return;
    var $burst = $('<div class="burst"></div>').css({ left: x, top: y, '--burst-color': color || '#f2d447' });
    if ($scene.width() < 600) count = Math.ceil(count * .65);
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var distance = 60 + Math.random() * 180;
      $('<span class="particle"></span>').addClass(['star', 'dot', 'confetti'][i % 3])
        .css({
          '--dx': Math.cos(angle) * distance + 'px', '--dy': Math.sin(angle) * distance - 70 + 'px',
          '--turn': (Math.random() * 720 - 360) + 'deg', '--life': (1 + Math.random() * .7) + 's',
          backgroundColor: i % 3 === 0 && color ? color : colors[i % colors.length]
        }).appendTo($burst);
    }
    // 연속 클릭해도 파티클 묶음은 최대 6개만 유지합니다.
    if ($('#particles .burst').length >= 6) $('#particles .burst').first().remove();
    $burst.appendTo('#particles');
  }
  $('#particles').on('animationend', '.burst', function (event) {
    if (event.originalEvent.animationName === 'burst-life') $(this).remove();
  });

  // 캐릭터와 타이틀의 CSS 시작 시점에 파티클·효과음을 연결합니다.
  $characters.on('animationstart', function (event) {
    if (event.originalEvent.animationName !== 'fly-out') return;
    var origin = center($('.monitor-screen'));
    burst(origin.x, origin.y, 30, $(this).css('--color'));
    playSound('pop-sound');
  }).on('animationend', function (event) {
    if (event.originalEvent.animationName !== 'fly-out') return;
    var landed = $characters.index(this) + 1;
    $progress.attr('aria-valuenow', Math.round(landed / 6 * 100));
  });
  $('.title-lockup').on('animationstart', function (event) {
    if (event.originalEvent.animationName !== 'title-pop') return;
    var point = center($(this));
    burst(point.x, point.y, 72);
    playSound('finale-sound');
  });

  // 4. 캐릭터 클릭 반응: 클래스 한 개만 붙이고 CSS가 끝나면 지웁니다.
  $('.character-hit').on('click', function () {
    if (state !== 'complete') return;
    var $character = $(this).closest('.character');
    $('.status-text').text($(this).find('img').attr('alt') + ', 출동!');
    if (reducedMotion.matches) return;
    restartClass($(this).find('img'), 'is-reacting');
    var point = center($character);
    burst(point.x, point.y, 36, $character.css('--color'));
    playSound('pop-sound');
  });
  $('.character img').on('animationend', function () { $(this).removeClass('is-reacting'); });

  // 5. 마우스 위치를 CSS 변수로 전달합니다. 정지 상태에서는 갱신하지 않습니다.
  $scene.on('pointermove', function (event) {
    if (event.originalEvent.pointerType !== 'mouse' || state !== 'complete' || reducedMotion.matches) return;
    var offset = $scene.offset();
    $scene.css({
      '--px': ((event.pageX - offset.left) / $scene.width() - .5) * 25 + 'px',
      '--py': ((event.pageY - offset.top) / $scene.height() - .5) * 20 + 'px'
    });
  }).on('mouseleave', function () {
    if (state !== 'paused') resetParallax();
  }).on('click', function (event) {
    if (state !== 'complete' || $(event.target).closest('button').length) return;
    var offset = $scene.offset();
    burst(event.pageX - offset.left, event.pageY - offset.top, 24);
  });

  // 6. 브라우저에서 소리를 합성하지 않고 짧은 WAV 파일을 재생합니다.
  function updateSoundButton() {
    $('.sound-button').attr({ 'aria-pressed': String(soundEnabled), 'aria-label': soundEnabled ? '효과음 끄기' : '효과음 켜기' })
      .find('span').text(soundEnabled ? '효과음 켜짐' : '효과음 꺼짐');
    $('.sound-button use').attr('href', soundEnabled ? '#icon-sound' : '#icon-mute');
  }
  function playSound(id) {
    if (!soundEnabled || state === 'paused') return;
    var audio = $('#' + id)[0];
    audio.currentTime = 0;
    audio.play().catch(function (error) {
      if (error.name === 'AbortError') return;
      soundEnabled = false;
      updateSoundButton();
    });
  }
  $('.sound-button').on('click', function () {
    soundEnabled = !soundEnabled;
    updateSoundButton();
    if (soundEnabled) playSound('pop-sound');
    else $('audio').each(function () { this.pause(); });
  });

  // 7. 화면 크기·접근성 설정이 바뀌어도 재생 상태를 유지합니다.
  $(window).on('resize', setFlightPaths);
  $(document).on('visibilitychange', function () { if (document.hidden) pause(); });
  $(reducedMotion).on('change', function () {
    if (!loaded) return;
    if (reducedMotion.matches) finish();
    else setState(state);
  });

  // 8. 캐시된 이미지, 로드 실패, 10초 이상 응답 없는 이미지도 처리합니다.
  var $images = $scene.find('img');
  var pending = $images.length;
  var loadingTimeout = setTimeout(ready, 10000);
  function ready() {
    if (loaded) return;
    loaded = true;
    clearTimeout(loadingTimeout);
    $images.off('.preload');
    if ($images.filter(function () { return !this.naturalWidth; }).length) {
      $('<p class="error-note"></p>').text('일부 이미지가 로드되지 않았습니다. 새로고침해 주세요.').appendTo($scene);
    }
    start();
  }
  $images.each(function () {
    if (this.complete) { pending--; return; }
    $(this).one('load.preload error.preload', function () { if (--pending === 0) ready(); });
  });
  if (pending === 0) ready();
});
