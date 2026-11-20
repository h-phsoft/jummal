/* global jaChapters, jLabels */

$(document).ready(function () {

  $('#base-surah').on('change', function (ev) {
    var nChapterNo = parseInt($(this).val());
    if (nChapterNo > 0) {
      nChapterNo--;
      var vHtml = '';
      var uchars = Object.values(jaChapters[nChapterNo].UCs);
      var echars = Object.values(jaChapters[nChapterNo].ECs);
      vHtml += '<div class="row pt-3 pb-0">'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jLabels.CpName + '</span>'
              + '  </div>'
              + '  <div class="col-9">'
              + '    <span class="form-control form-label">' + jaChapters[nChapterNo].CpName + '</span>'
              + '  </div>'
              + '</div>'
              + '<div class="row pt-1 pb-0">'
              + '  <div class="col-4 col-sm-3">'
              + '    <span class="form-control form-label">' + jLabels.CpNo + '</span>'
              + '  </div>'
              + '  <div class="col-2 col-sm-3">'
              + '    <span class="form-control form-label">' + jaChapters[nChapterNo].CpNo + '</span>'
              + '  </div>'
              + '  <div class="col-4 col-sm-3">'
              + '    <span class="form-control form-label">' + jLabels.TO + '</span>'
              + '  </div>'
              + '  <div class="col-2 col-sm-3">'
              + '    <span class="form-control form-label">' + jaChapters[nChapterNo].TO + '</span>'
              + '  </div>'
              + '</div>'
              + '<div class="row pt-1 pb-0">'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jLabels.FC + '</span>'
              + '  </div>'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jaChapters[nChapterNo].FC + '</span>'
              + '  </div>'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jLabels.LC + '</span>'
              + '  </div>'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jaChapters[nChapterNo].LC + '</span>'
              + '  </div>'
              + '</div>'
              + '<div class="row pt-1 pb-0">'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jLabels.Vs + '</span>'
              + '  </div>'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jaChapters[nChapterNo].Vs + '</span>'
              + '  </div>'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jLabels.Cs + '</span>'
              + '  </div>'
              + '  <div class="col-3">'
              + '    <span class="form-control form-label">' + jaChapters[nChapterNo].Cs + '</span>'
              + '  </div>'
              + '</div>'
              + '<div class="row pt-1 pb-0">'
              + '  <div class="col-6">'
              + '    <span class="form-control form-label">' + jLabels.UCs + '</span>'
              + '  </div>'
              + '  <div class="col-6">'
              + '    <span class="form-control form-label">' + jLabels.ECs + '</span>'
              + '  </div>'
              + '</div>';
      for (var i = 0; i < uchars.length; i++) {
        if (uchars[i][0] !== '' || uchars[i][1] > 0 || echars[i][0] !== '' || echars[i][1] > 0) {
          vHtml += '<div class="row pt-1 pb-0">'
                  + '  <div class="col-3">'
                  + '    <span class="form-control form-label">' + uchars[i][0] + '</span>'
                  + '  </div>'
                  + '  <div class="col-3">'
                  + '    <span class="form-control form-label">' + (uchars[i][1] === 0 ? '' : uchars[i][1]) + '</span>'
                  + '  </div>'
                  + '  <div class="col-3">'
                  + '    <span class="form-control form-label">' + echars[i][0] + '</span>'
                  + '  </div>'
                  + '  <div class="col-3">'
                  + '    <span></span>'
                  + '  </div>'
                  + '</div>';
        }
      }
      $('#result').html(vHtml);
    }
  });

});
