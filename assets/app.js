/* Rendering and case controls shared by both tasks. */
const animated = $('body').attr('data-task') === '2';
const colors = { red: '#cf4650', blue: '#3978c5', green: '#338962', black: '#2c343b', yellow: '#dba522', purple: '#9060bc' };
const iconPaths = {
  phone: '<rect x="5" y="1" width="8" height="16" rx="2"/><path d="M8 14h2"/>',
  glasses: '<circle cx="4" cy="10" r="3"/><circle cx="14" cy="10" r="3"/><path d="M7 9h4M1 9l1-5m15 5-1-5"/>',
  bag: '<path d="M3 6h12l-1 11H4L3 6Z"/><path d="M6 7V4a3 3 0 0 1 6 0v3"/>',
  cup: '<path d="M2 6h11v7a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6Zm11 1h2a2 2 0 0 1 0 5h-2M5 1v2m4-2v2"/>',
  crumbs: '<path d="m2 9 6-7 7 7H2Zm0 0v7h13V9M2 12h13"/><circle cx="17" cy="15" r=".5"/><circle cx="17" cy="10" r=".5"/>'
};
const thingNames = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup', crumbs: 'cake crumbs' };
const miras = { name: 'Miras', color: 'blue', time: '21:20', aitu: true, things: ['phone'] };
let party = $.extend(true, [], window.originalParty);
let lastGuest = null;

function duration(ms) {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
}
function icon(type) {
  return $('<svg class="icon" viewBox="0 0 18 18" aria-hidden="true">' + iconPaths[type] + '</svg>');
}
function makeGuest(guest) {
  const card = $('<button>', { type: 'button', id: guest.name.toLowerCase(), class: 'guest ' + guest.color + (guest.aitu ? ' aitu' : ''),
    'data-name': guest.name, 'data-time': guest.time, 'data-color': guest.color, 'data-aitu': String(guest.aitu),
    'data-things': guest.things.join(','), 'aria-label': guest.name + ', arrived at ' + guest.time + ', wearing ' + guest.color
  }).css('--clothing', colors[guest.color]);
  const photo = $('<span>', { class: 'avatar-wrap' }).append($('<img>', { class: 'avatar',
    src: '../assets/avatars/' + guest.name + '.svg', alt: '', width: 51, height: 51 }));
  if (guest.aitu) photo.append($('<span>', { class: 'aitu-badge', text: 'AITU' }));
  card.append(photo, $('<span>', { class: 'guest-name', text: guest.name }), $('<span>', { class: 'guest-time', text: guest.time }));
  const things = $('<span>', { class: 'things', 'aria-label': guest.things.length ? 'Has ' + guest.things.map(t => thingNames[t]).join(', ') : 'Has nothing' });
  $.each(guest.things, function (_, type) {
    things.append($('<span>', { class: 'thing thing-' + type, title: thingNames[type] }).append(icon(type)));
  });
  if (!guest.things.length) things.append($('<span>', { class: 'no-things', text: 'nothing' }));
  return card.append(things);
}
function updateCounts() {
  $('.room').each(function () { $(this).find('.room-count').text($(this).find('.guest').length + ' guests'); });
  $('#guest-total').text($('.house .guest').length + ' guests');
}
function buildParty() {
  $('#house').empty();
  $.each([2, 1], function (_, floorNumber) {
    const floor = $('<section>', { class: 'floor', 'data-floor': floorNumber, 'aria-label': 'Floor ' + floorNumber });
    $.each(party.filter(room => room.floor === floorNumber), function (_, room) {
      const section = $('<section>', { class: 'room', id: room.id, 'data-room': room.name, 'aria-labelledby': room.id + '-title' });
      const heading = $('<div>', { class: 'room-heading' }).append($('<div>').append(
        $('<span>', { class: 'floor-tag', text: '0' + room.floor + ' /' }),
        $('<h3>', { id: room.id + '-title', text: room.name }).css('display', 'inline')));
      if (animated) heading.append($('<button>', { type: 'button', class: 'sort-button', text: room.sorted ? 'Picture order' : 'Sort by time', 'aria-pressed': String(!!room.sorted) }));
      const guests = $('<div>', { class: 'guests' });
      $.each(room.guests, function (_, guest) { guests.append(makeGuest(guest)); });
      section.append(heading, guests, $('<div>', { class: 'room-count' }));
      floor.append(section);
    });
    $('#house').append(floor);
  });
  updateCounts();
}
function settleEffects() {
  if (animated) { finishMove(); closeDetail(true); }
  $('.guest').stop(true, true).css({ top: 0, left: 0 });
}
function resetResult() {
  $('.case-button').attr('aria-pressed', 'false');
  $('#result-title').text('The cake is missing. Where would you start?');
  $('#result-names').text('Choose a case to highlight its matches.');
  $('#result-label').text('Investigation notes');
  $('#chain').text('// Select a case to see its jQuery chain.');
}
function runCase(index) {
  settleEffects();
  buildParty(); // Reset temporary arrivals/departures; keep moves made in Task 2.
  const item = window.partyCases[index];
  $('.case-button').attr('aria-pressed', 'false').eq(index).attr('aria-pressed', 'true');
  const matches = item.find();
  const guests = item.rooms ? matches.find('.guest') : matches;
  const names = matches.map(function () { return $(this).attr(item.rooms ? 'data-room' : 'data-name'); }).get();
  matches.addClass('is-found');
  if (animated) $('.house .guest').not(guests).stop(true, true).fadeTo(duration(300), 0.2);
  if (item.action !== 'leave') guests.animate({ top: -9 }, duration(150)).animate({ top: 0 }, duration(150));
  $('#result-label').text('Case ' + (index + 1) + ' / ' + (item.rooms ? 'Rooms' : 'Guests'));
  $('#result-title').text(item.action === 'arrive' ? 'Miras joins the party' : item.action === 'leave' ? 'Natasha leaves the party' : names.length + ' ' + (item.rooms ? 'room' : 'guest') + (names.length === 1 ? '' : 's') + ' found');
  $('#result-names').text(names.join(', ') || 'No matches in the current party.');
  if (index === 19 && names.length) $('#result-names').append(' — downstairs, after 21:00 and before 21:30; crumbs, no cup, and an AITU neighbour.');
  $('#chain').text(item.find.toString().replace(/^\(\) => /, ''));
  updateCounts();
}
$(function () {
  $.each(window.partyCases, function (index, item) {
    $('#case-list').append($('<button>', { type: 'button', class: 'case-button', 'data-case': index, 'aria-pressed': 'false' })
      .append($('<span>', { class: 'case-number', text: String(index + 1).padStart(2, '0') }), $('<span>', { text: item.title })));
  });
  $.each(iconPaths, function (type) { $('#legend').append($('<span>').append(icon(type), document.createTextNode(type === 'crumbs' ? 'Cake crumbs' : type[0].toUpperCase() + type.slice(1)))); });
  $('#case-list').on('click', '.case-button', function () { runCase(Number($(this).attr('data-case'))); });
  $('#clear').on('click', function () {
    settleEffects();
    $('.house .guest').stop(true, true).removeClass('is-found').fadeTo(duration(300), 1);
    $('.room').removeClass('is-found');
    resetResult();
  });
  $('#reset').on('click', function () {
    settleEffects(); party = $.extend(true, [], window.originalParty); buildParty(); resetResult();
  });
  buildParty(); resetResult();
});
