(function () {
  var questions = Array.isArray(window.QUIZ_DATA) ? window.QUIZ_DATA : [];
  if (!questions.length) return;

  var quizImageEl = document.querySelector('.quiz-image');
  var questionEl = document.querySelector('.quiz-domanda');
  var answerButtons = Array.prototype.slice.call(document.querySelectorAll('.quiz-risposta-wrap .quiz-tasto'));
  var popupWrapper = document.querySelector('.popup-wrapper');
  var popupWinner = document.querySelector('.popup-content-winner');
  var popupLoser = document.querySelector('.popup-content-loser');
  var popupCloseButtons = Array.prototype.slice.call(document.querySelectorAll('.popup-close'));
  var shareButtons = Array.prototype.slice.call(document.querySelectorAll('.popup-cta'));

  if (!quizImageEl || !questionEl || answerButtons.length !== 4 || !popupWrapper || !popupWinner || !popupLoser) {
    return;
  }

  var ANSWER_DELAY_MS = 1000;
  var SHARE_URL = 'https://www.ita-airways.com';
  var currentQuestion = pickRandomQuestion(questions);
  var selected = false;

  renderQuestion(currentQuestion);
  bindAnswers();
  bindShareButtons();
  bindPopupClose();

  function pickRandomQuestion(pool) {
    var randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }

  function renderQuestion(question) {
    questionEl.textContent = question.question;

    quizImageEl.src = question.quizImage;
    quizImageEl.alt = 'Quiz ' + question.id;
    quizImageEl.removeAttribute('srcset');
    quizImageEl.removeAttribute('sizes');

    answerButtons.forEach(function (button, index) {
      button.classList.remove('corretta', 'sbagliata');
      button.removeAttribute('aria-disabled');

      var textEl = button.querySelector('.quiz-risposta-testo');
      if (textEl) {
        textEl.textContent = question.answers[index] || '';
      }
    });
  }

  function bindAnswers() {
    answerButtons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        if (selected) return;

        selected = true;
        var isCorrect = index === currentQuestion.correctIndex;
        button.classList.add(isCorrect ? 'corretta' : 'sbagliata');

        answerButtons.forEach(function (btn) {
          btn.setAttribute('aria-disabled', 'true');
        });

        window.setTimeout(function () {
          openPopup(isCorrect);
        }, ANSWER_DELAY_MS);
      });
    });
  }

  function openPopup(isCorrect) {
    popupWrapper.style.display = 'flex';
    popupWinner.style.display = isCorrect ? 'flex' : 'none';
    popupLoser.style.display = isCorrect ? 'none' : 'flex';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    popupWrapper.style.display = 'none';
    popupWinner.style.display = 'none';
    popupLoser.style.display = 'none';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  function bindPopupClose() {
    popupCloseButtons.forEach(function (button) {
      button.addEventListener('click', closePopup);
    });

    popupWrapper.addEventListener('click', function (event) {
      if (event.target === popupWrapper) {
        closePopup();
      }
    });
  }

  function bindShareButtons() {
    shareButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        shareQuestionImage(currentQuestion);
      });
    });
  }

  async function shareQuestionImage(question) {
    var shareData = {
      title: 'ITA Airways - The Italian Piazza',
      text: question.shareText || 'Ho appena giocato al quiz ITA Airways.',
      url: SHARE_URL
    };

    if (navigator.share) {
      try {
        var file = await buildShareFile(question.shareImage, question.id);
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }

    var encodedText = encodeURIComponent(shareData.text + ' ' + SHARE_URL);
    window.open('https://wa.me/?text=' + encodedText, '_blank', 'noopener,noreferrer');
  }

  async function buildShareFile(imagePath, id) {
    try {
      var response = await fetch(imagePath, { cache: 'no-store' });
      if (!response.ok) return null;
      var blob = await response.blob();
      var extension = (blob.type && blob.type.split('/')[1]) || 'jpg';
      return new File([blob], 'postcard-' + id + '.' + extension, { type: blob.type || 'image/jpeg' });
    } catch (error) {
      return null;
    }
  }
})();
