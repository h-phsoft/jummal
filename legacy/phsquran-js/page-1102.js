$(document).ready(function () {

  $('#get2Words').on('click', function (ev) {
    var vWord1 = $('#word1').val();
    var vWord2 = $('#word2').val();
    var vHtml = '';
    var aData = Object.values(response.Data);
    var aCounts = Object.values(response.Counts);
    var vBackground1 = '';
    var vBackground2 = '';
    var vBackground3 = '';
    vHtml += '<table class="table table-striped table-bordered">';
    vHtml += '  <thead>';
    vHtml += '    <tr class="bg-success text-white">';
    vHtml += '      <th>#</th>';
    vHtml += '      <th>' + vWord1 + '</th>';
    vHtml += '      <th>' + vWord2 + '</th>';
    vHtml += '      <th>' + vWord1 + " & " + vWord2 + '</th>';
    vHtml += '      <th>السورة</th>';
    vHtml += '      <th>الآية</th>';
    vHtml += '    </tr>';
    vHtml += '  </thead>';
    vHtml += '  </tbody>';
    for (var i = 0; i < aData.length; i++) {
      vBackground1 = '';
      vBackground2 = '';
      vBackground3 = '';
      if (aData[i].Count1 !== '') {
        vBackground = ' class="bg-primary"';
      } else if (aData[i].Count2 !== '') {
        vBackground = ' class="bg-secondary"';
      } else if (aData[i].Count3 !== '') {
        vBackground = ' class="bg-info"';
      }
      if (aData[i].Count1 !== '') {
        vBackground1 = ' class="bg-primary"';
      }
      if (aData[i].Count2 !== '') {
        vBackground2 = ' class="bg-secondary"';
      }
      if (aData[i].Count3 !== '') {
        vBackground3 = ' class="bg-info"';
      }
      vHtml += '<tr>';
      vHtml += '  <td>' + aData[i].order + '</td>';
      vHtml += '  <td' + vBackground1 + '>' + aData[i].Count1 + '</td>';
      vHtml += '  <td' + vBackground2 + '>' + aData[i].Count2 + '</td>';
      vHtml += '  <td' + vBackground3 + '>' + aData[i].Count3 + '</td>';
      vHtml += '  <td>' + aData[i].SNum + " - " + aData[i].SName + '</td>';
      vHtml += '  <td class="quran-text text-13 text-left">' + aData[i].ANum + " - " + aData[i].AText + '</td>';
      vHtml += '</tr>';
    }
    vHtml += '<tr class="bg-success text-white">';
    vHtml += '  <td></td>';
    vHtml += '  <td>' + aCounts[0] + '</td>';
    vHtml += '  <td>' + aCounts[1] + '</td>';
    vHtml += '  <td>' + aCounts[2] + '</td>';
    vHtml += '  <td></td>';
    vHtml += '  <td></td>';
    vHtml += '</tr>';
    vHtml += '  </tbody>';
    vHtml += '</table>';
    $('#result').html(vHtml);
  });

});
