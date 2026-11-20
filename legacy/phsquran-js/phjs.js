/* global jaChapters */

function getVerseId(nChapterNo, nVerse) {
  var nVId = 0;
  for (var i = 0; i < nChapterNo + 1; i++) {
    if (i !== nChapterNo) {
      nVId += jaChapters[i].Vs;
    } else {
      nVId += nVerse;
    }
  }
  return nVId - 1;
}