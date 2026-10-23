async function performNumberStudy() {
  const targetNum = parseInt(document.getElementById('studyNumber').value);
  const resultContainer = document.querySelector('#number-Study-Result');

  if (isNaN(targetNum)) {
    alert('الرجاء إدخال رقم صحيح');
    return;
  }

  try {
    // todo
  } catch (error) {
    resultContainer.innerHTML = `<tr><td colspan="4" style="color:red; text-align:center;">خطأ: ${error.message}</td></tr>`;
  }
}

$('#studyNumber').on('keypress', function (e) {
  if (e.which === 13) {
    performNumberStudy();
  }
});
