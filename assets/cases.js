/* Each case uses a single jQuery chain to search the DOM, never the data array. */
window.partyCases = [
  { title: 'Who is in the hall?', find: () => $('#hall .guest') },
  { title: 'Yellow or purple clothing', find: () => $('.guest.yellow, .guest.purple') },
  { title: 'AITU students upstairs', find: () => $('.floor[data-floor="2"]').find('.guest.aitu') },
  { title: 'Glasses or a bag', find: () => $('.guest:has(.thing-glasses), .guest:has(.thing-bag)') },
  { title: 'Nothing with them', find: () => $('.guest:not(:has(.thing))') },
  { title: 'A phone, but no bag', find: () => $('.guest:has(.thing-phone):not(:has(.thing-bag))') },
  { title: 'Arrived from 20:30 to 21:00', find: () => $('.guest').filter(function () {
    return $(this).attr('data-time') >= '20:30' && $(this).attr('data-time') <= '21:00';
  }) },
  { title: 'After 21:00, not an AITU student', find: () => $('.guest:not(.aitu)').filter(function () {
    return $(this).attr('data-time') > '21:00';
  }) },
  { title: 'Right next to Askar', find: () => $('#askar').prev('.guest').add($('#askar').next('.guest')) },
  { title: 'Last in each room', find: () => $('.guests > .guest:last-child') },
  { title: 'Third in each room', find: () => $('.guests > .guest:nth-child(3)') },
  { title: 'After Timur in his room', find: () => $('#timur').nextAll('.guest') },
  { title: 'Right before someone in black', find: () => $('.guest.black').prev('.guest') },
  { title: 'Which room has Aruzhan?', rooms: true, find: () => $('#aruzhan').closest('.room') },
  { title: 'Rooms with fewer than 6 guests', rooms: true, find: () => $('.room').filter(function () {
    return $(this).find('.guest').length < 6;
  }) },
  { title: 'A cup, but no glasses in the room', rooms: true,
    find: () => $('.room:has(.thing-cup):not(:has(.thing-glasses))') },
  { title: 'First to arrive in each room', find: () => $('.guest').filter(function () {
    const time = $(this).attr('data-time');
    return $(this).siblings('.guest').filter(function () {
      return $(this).attr('data-time') < time;
    }).length === 0;
  }) },
  { title: 'Miras joins Askar and Inkar', action: 'arrive', find: () => makeGuest(miras).hide()
    .insertAfter('#askar').fadeIn(duration(350)) },
  { title: 'Natasha goes home', action: 'leave', find: () => $('#natasha').fadeOut(duration(350), function () {
    $(this).remove();
    updateCounts();
  }) },
  { title: 'Who took the cake?', find: () => $('.floor[data-floor="1"] .guest:has(.thing-crumbs):not(:has(.thing-cup))')
    .filter(function () {
      const time = $(this).attr('data-time');
      return time > '21:00' && time < '21:30';
    }).filter(function () {
      return $(this).prev('.guest.aitu').add($(this).next('.guest.aitu')).length > 0;
    }) }
];
