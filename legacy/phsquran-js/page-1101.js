/* global jLabels, jaChapters */

$(document).ready(function () {

  $('#base-surah').on('change', function (ev) {
    var nUp = parseInt($(this).val());
    if (nUp > 0) {

      var nDn = nUp - 1;
      var nUpFlg = 1;
      var nDnFlg = 1;
      if (nDn < 1) {
        nDn = 114;
      }
      var RightArray = [];
      var LeftArray = [];
      for (i = 1; i <= 57; i++) {
        RightArray.push(jaChapters[nUp - 1]);
        LeftArray.push(jaChapters[nDn - 1]);
        nUp++;
        nDn--;
        if (nUpFlg === 1 && nUp > 114) {
          nUp = 1;
          nUpFlg = 0;
        }
        if (nDnFlg === 1 && nDn < 1) {
          nDn = 114;
          nDnFlg = 0;
        }
      }
      for (var i = 0; i < RightArray.length; i++) {
        console.log('UP', i, RightArray[i].CpName);
      }
      for (var i = 0; i < LeftArray.length; i++) {
        console.log('DN', i, LeftArray[i].CpName);
      }
      var vHtml = '';
      vHtml += '<div class="row py-3 pt-3 pb-0">'
              + '  <div class="col-3 mx-auto">'
              + '    <span class="form-control form-label">' + RightArray[0].CpNo + ' ' + RightArray[0].CpName + '</span>'
              + '  </div>'
              + '</div>'
              + '<div class="row p-0">'
              + '  <div class="col-3 mx-auto">'
              + '    <span class="form-control form-label">' + RightArray[0].Vs + '</span>'
              + '  </div>'
              + '</div>';
      vHtml += '<div class="row py-0">'
              + '  <div class="col-5 p-0">'
              + '    <span class="form-control form-label bg-success text-white">' + jLabels['Chapter and Verses'] + '</span>'
              + '  </div>'
              + '  <div class="col-2 p-0">'
              + '    <span class="form-control form-label bg-danger text-white">' + jLabels['TVs'] + '</span>'
              + '  </div>'
              + '  <div class="col-5 p-0">'
              + '    <span class="form-control form-label bg-success text-white">' + jLabels['Chapter and Verses'] + '</span>'
              + '  </div>'
              + '</div>';
      for (var i = 0; i < RightArray.length - 1; i++) {
        vHtml += '<div class="row p-0">'
                + '  <div class="col-4 p-0 text-right">'
                + '    <span class="form-control form-label">' + LeftArray[i].CpName + ' - ' + LeftArray[i].CpNo + '</span>'
                + '  </div>'
                + '  <div class="col-1 p-0 text-left">'
                + '    <span class="form-control form-label">' + LeftArray[i].Vs + '</span>'
                + '  </div>'
                + '  <div class="col-2 p-0">'
                + '    <span class="form-control form-label">' + (LeftArray[i].Vs + RightArray[i + 1].Vs) + '</span>'
                + '  </div>'
                + '  <div class="col-1 p-0 text-right">'
                + '    <span class="form-control form-label">' + RightArray[i + 1].Vs + '</span>'
                + '  </div>'
                + '  <div class="col-4 p-0 text-left">'
                + '    <span class="form-control form-label">' + RightArray[i + 1].CpNo + ' - ' + RightArray[i + 1].CpName + '</span>'
                + '  </div>'
                + '</div>';
      }
      vHtml += '<div class="row p-0">'
              + '  <div class="col-3 mx-auto">'
              + '    <span class="form-control form-label">' + LeftArray[LeftArray.length - 1].Vs + '</span>'
              + '  </div>'
              + '</div>'
              + '<div class="row p-0">'
              + '  <div class="col-3 mx-auto">'
              + '    <span class="form-control form-label">' + LeftArray[LeftArray.length - 1].CpNo + ' ' + LeftArray[LeftArray.length - 1].CpName + '</span>'
              + '  </div>'
              + '</div>';
      $('#result').html(vHtml);
    }
  });

});
