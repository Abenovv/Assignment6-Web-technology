(async () => {
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const results = [];
  const assert = (label, condition, actual) => {
    results.push({ label, pass: Boolean(condition), ...(condition ? {} : { actual }) });
  };
  const names = selection => selection.map(function () { return $(this).attr('data-name') || $(this).attr('data-room'); }).get();
  const expected = [
    ['Arman','Sophia','Dias','Bekzat','Aruzhan','Saule'],
    ['Arman','Sophia','Bekzat','Sergey','Natasha','Inkar'],
    ['Aigerim','Ivan','Sophia','Dias','Aruzhan'],
    ['Madina','Arman','Bekzat','Saule','Emma','Timur','Yerlan','Daniel','Zarina','Inkar'],
    ['Dias','Sergey','Natasha'], ['Aliya','Sophia','Aruzhan','Nurlan','Yerlan','Askar'],
    ['Aigerim','Arman','Bekzat','Sergey','Natasha','Askar'], ['Aliya','Madina','Saule','Zarina'],
    ['Natasha','Inkar'], ['Ivan','Saule','Kamila','Inkar'], ['Madina','Dias','Timur','Natasha'],
    ['Sergey','Yerlan','Kamila'], ['Aigerim','Madina','Nurlan','Natasha'], ['Hall'],
    ['Balcony','Living room'], ['Balcony'], ['Ivan','Dias','Nurlan','Daniel'], ['Miras'], ['Natasha'], ['Zarina']
  ];
  $('#reset').trigger('click');
  for (let index = 0; index < 20; index++) {
    runCase(index);
    const actual = $('#result-names').text().split(' — ')[0].split(', ');
    // .add() returns document order, so compare sets as well as counts.
    assert('Case ' + (index + 1), JSON.stringify(actual.slice().sort()) === JSON.stringify(expected[index].slice().sort()), actual);
    await pause(400);
    if (index === 17) assert('Miras appears between Askar and Inkar', $('#askar').next().attr('id') === 'miras' && $('#miras').next().attr('id') === 'inkar' && $('#miras').is(':visible'), names($('#living-room .guest')));
    if (index === 18) assert('Natasha is removed', $('#natasha').length === 0, $('#natasha').length);
  }
  if (animated) {
    $('#reset').trigger('click');
    runCase(2); await pause(400);
    assert('Spotlight matches stay bright', $('.house .guest.is-found').toArray().every(e => Number($(e).css('opacity')) === 1));
    assert('Other guests fade to 20%', $('.house .guest:not(.is-found)').toArray().every(e => Math.abs(Number($(e).css('opacity')) - 0.2) < 0.001));
    $('#clear').trigger('click'); await pause(400);
    assert('Clear restores everyone', $('.house .guest').toArray().every(e => Number($(e).css('opacity')) === 1));
    $('#arman').trigger('click'); await pause(450);
    assert('Guest dialog opens with information', $('.detail-card').length === 1 && $('.detail-info').text().includes('Came at 20:35') && $('.detail-info').text().includes('a bag and glasses'));
    $(document).trigger($.Event('keydown', { key: 'Escape' })); await pause(300);
    assert('Esc closes the dialog', $('.detail-card').length === 0);
    $('#arman').trigger('click'); await pause(400);
    $('.move-button[data-target="balcony"]').trigger('click'); await pause(650);
    assert('Arman moves to the end of the balcony', $('#balcony .guest:last-child').attr('id') === 'arman' && $('#hall #arman').length === 0);
    assert('Move updates the array', party.find(r => r.id === 'balcony').guests.at(-1).name === 'Arman' && !party.find(r => r.id === 'hall').guests.some(g => g.name === 'Arman'));
    runCase(0);
    assert('Case 1 uses the moved party', !$('#result-names').text().includes('Arman'));
    $('#reset').trigger('click');
    const sort = $('#living-room .sort-button');
    sort.trigger('click'); await pause(500);
    assert('Living room sorts by arrival time', JSON.stringify(names($('#living-room .guest'))) === JSON.stringify(['Daniel','Inkar','Natasha','Askar','Zarina']));
    sort.trigger('click'); await pause(500);
    assert('Second sort restores picture order', JSON.stringify(names($('#living-room .guest'))) === JSON.stringify(['Daniel','Zarina','Natasha','Askar','Inkar']));
    for (let i = 0; i < 5; i++) sort.trigger('click');
    await pause(500);
    assert('Five fast sorts end sorted', JSON.stringify(names($('#living-room .guest'))) === JSON.stringify(['Daniel','Inkar','Natasha','Askar','Zarina']));
    for (let i = 0; i < 10; i++) { runCase(i % 3); $('#clear').trigger('click'); }
    await pause(500);
    assert('Fast cases and Clear leave no animation queues', $('.house .guest:animated').length === 0 && $('.house .guest').toArray().every(e => $.queue(e).length === 0 && Number($(e).css('opacity')) === 1));
    for (let i = 0; i < 7; i++) { $('#arman').trigger('click'); $('#timur').trigger('click'); }
    await pause(450);
    assert('Fast guest clicks keep one correct dialog', $('.detail-card').length === 1 && $('#detail-title').text() === 'Timur');
    $('.detail-overlay').trigger('click'); await pause(300);
    assert('Outside click closes the dialog', $('.detail-card').length === 0);
    $('#arman').trigger('click'); await pause(400);
    $('.move-button[data-target="balcony"]').trigger('click');
    runCase(0); await pause(650);
    assert('Case during a flight settles the move', $('#balcony #arman').length === 1 && $('.flight,.move-placeholder').length === 0 && !$('#result-names').text().includes('Arman'));
  }
  $('#reset').trigger('click');
  assert('All avatars load locally', $('.avatar').toArray().every(img => img.complete && img.naturalWidth > 0));
  assert('No horizontal overflow', document.documentElement.scrollWidth <= window.innerWidth);
  return { task: animated ? 2 : 1, passed: results.filter(r => r.pass).length, total: results.length, results };
})()
