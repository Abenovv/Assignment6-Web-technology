/* Task 2 adds jQuery motion to the working selector page. */
let activeMove = null;
let detailGuest = null;
let detailVersion = 0;

function finishMove() {
  if (activeMove) activeMove();
}
function guestData(name) {
  for (const room of party) {
    const guest = room.guests.find(person => person.name === name);
    if (guest) return { guest, room };
  }
  // Case 18 is temporary, but Miras can still be inspected and moved.
  if (name === 'Miras') return { guest: miras, room: party.find(room => room.id === $('#miras').closest('.room').attr('id')) };
  return null;
}
function closeDetail(immediate, after) {
  const panel = $('.detail-card');
  const version = ++detailVersion;
  if (!panel.length) { if (after) after(); return; }
  if (immediate) {
    $('.detail-card, .detail-overlay').stop(true, false).remove();
    detailGuest = null;
    if (after) after();
    return;
  }
  const target = detailGuest && detailGuest.find('.avatar').length ? detailGuest.find('.avatar').offset() : { top: 0, left: 0 };
  panel.stop(true, false);
  $('.detail-content').stop(true, false).css('opacity', 0);
  $('.detail-overlay').stop(true, false).fadeOut(immediate ? 0 : duration(220));
  panel.animate({ left: target.left - $(window).scrollLeft(), top: target.top - $(window).scrollTop(), width: 51, height: 51, opacity: 0 }, immediate ? 0 : duration(220), function () {
    if (version !== detailVersion) return;
    $('.detail-card, .detail-overlay').remove();
    if (detailGuest && $.contains(document, detailGuest[0])) detailGuest.trigger('focus');
    detailGuest = null;
    if (after) after();
  });
}
function openDetail(card) {
  // Finish the old close before opening another card; there is only one dialog.
  closeDetail(true);
  detailGuest = card;
  const info = guestData(card.attr('data-name'));
  if (!info) return;
  const guest = info.guest;
  const start = card.find('.avatar').offset();
  const width = Math.min(410, $(window).width() - 32);
  const height = Math.min(430, $(window).height() - 32);
  const overlay = $('<div>', { class: 'detail-overlay' }).hide().appendTo('body');
  const panel = $('<section>', { class: 'detail-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'detail-title', tabindex: -1 })
    .css({ left: start.left - $(window).scrollLeft(), top: start.top - $(window).scrollTop(), width: 51, height: 51, opacity: 0.3 }).appendTo('body');
  const content = $('<div>', { class: 'detail-content' }).css('opacity', 0);
  content.append($('<div>', { class: 'detail-header' }).append(card.find('.avatar').clone(), $('<div>').append(
    $('<h2>', { id: 'detail-title', text: guest.name }), $('<p>', { text: info.room.name + ' · Floor ' + info.room.floor }))));
  content.append($('<div>', { class: 'detail-info' }).append(
    $('<p>', { text: 'Came at ' + guest.time }), $('<p>', { text: guest.aitu ? 'AITU student' : 'Not an AITU student' }),
    $('<p>', { text: 'Wearing ' + guest.color }), $('<p>', { text: guest.things.length ? 'Has ' + guest.things.map(t => thingNames[t]).join(' and ') : 'Has nothing with them' })));
  content.append($('<p>', { class: 'eyebrow', text: 'Send to another room' }));
  const actions = $('<div>', { class: 'detail-actions' });
  $.each(party, function (_, room) {
    if (room.id !== info.room.id) actions.append($('<button>', { type: 'button', class: 'small-button move-button', 'data-target': room.id, text: 'Move to the ' + room.name.toLowerCase() }));
  });
  content.append(actions, $('<button>', { type: 'button', class: 'small-button close-detail', text: 'Close · Esc' }));
  panel.append(content);
  overlay.fadeIn(duration(220));
  panel.animate({ left: ($(window).width() - width) / 2, top: Math.max(16, ($(window).height() - height) / 2), width, height, opacity: 1 }, duration(280), function () {
    panel.css('overflow-y', 'auto');
    content.animate({ opacity: 1 }, duration(100));
    panel.find('.close-detail').trigger('focus');
  });
}
function moveGuest(card, targetId) {
  finishMove();
  $('.house .guest').stop(true, true).css({ top: 0, left: 0 });
  const info = guestData(card.attr('data-name'));
  const targetRoom = party.find(room => room.id === targetId);
  if (!info || !targetRoom || info.room.id === targetId) return;
  const oldRoom = info.room;
  const sourceOffset = card.offset();
  const originalStyle = card.attr('style');
  const targetList = $('#' + targetId + ' .guests');
  const targetWidth = targetList.find('.guest').first().outerWidth() || card.outerWidth();
  const placeholder = $('<span>', { class: 'move-placeholder', 'aria-hidden': 'true' }).css({ width: 0, height: card.outerHeight() }).appendTo(targetList);
  const flight = card.clone().removeAttr('id').addClass('flight').attr({ 'aria-hidden': 'true', tabindex: -1 })
    .css({ position: 'absolute', left: sourceOffset.left, top: sourceOffset.top, width: card.outerWidth(), height: card.outerHeight(), margin: 0, opacity: 1 }).appendTo('body');
  let complete = false;
  activeMove = function () {
    if (complete) return;
    complete = true;
    activeMove = null;
    card.stop(true, false); placeholder.stop(true, false); flight.stop(true, false);
    flight.remove(); placeholder.remove();
    card.detach().attr('style', originalStyle).css({ top: 0, left: 0, opacity: 1 }).appendTo(targetList);
    oldRoom.guests = oldRoom.guests.filter(guest => guest.name !== info.guest.name);
    targetRoom.guests.push(info.guest);
    // The new room's picture-order baseline places the moved guest last.
    targetRoom.pictureOrder = (targetRoom.pictureOrder || targetRoom.guests.slice(0, -1).map(g => g.name)).concat(info.guest.name);
    oldRoom.pictureOrder = (oldRoom.pictureOrder || oldRoom.guests.map(g => g.name)).filter(name => name !== info.guest.name);
    targetRoom.sorted = false;
    $('#' + targetId + ' .sort-button').text('Sort by time').attr('aria-pressed', 'false');
    updateCounts();
    $('#result-label').text('Guest moved');
    $('#result-title').text(info.guest.name + ' → ' + targetRoom.name);
    $('#result-names').text('The next case will use this room arrangement.');
    card.trigger('focus');
  };
  placeholder.animate({ width: targetWidth }, duration(450));
  card.css('overflow', 'hidden').animate({ width: 0, paddingLeft: 0, paddingRight: 0, opacity: 0 }, duration(450));
  // Measure the destination after opening its place, then fly the clone there.
  placeholder.stop(true, true);
  const destination = placeholder.offset();
  placeholder.css('width', 0).animate({ width: targetWidth }, duration(450));
  flight.animate({ left: destination.left, top: destination.top, width: targetWidth }, duration(550), function () { finishMove(); });
}
function sortRoom(section) {
  finishMove();
  closeDetail(true);
  section.find('.guest').stop(true, true).css({ left: 0, top: 0 });
  const room = party.find(item => item.id === section.attr('id'));
  if (!room.pictureOrder) room.pictureOrder = room.guests.map(guest => guest.name);
  const oldPositions = {};
  section.find('.guest').each(function () { oldPositions[$(this).attr('data-name')] = $(this).offset(); });
  room.sorted = !room.sorted;
  if (room.sorted) room.guests.sort((a, b) => a.time.localeCompare(b.time));
  else room.guests.sort((a, b) => room.pictureOrder.indexOf(a.name) - room.pictureOrder.indexOf(b.name));
  $.each(room.guests, function (_, guest) { section.find('.guests').append($('#' + guest.name.toLowerCase())); });
  section.find('.guest').each(function () {
    const before = oldPositions[$(this).attr('data-name')];
    const after = $(this).offset();
    $(this).css({ left: before.left - after.left, top: before.top - after.top }).animate({ left: 0, top: 0 }, duration(450));
  });
  section.find('.sort-button').text(room.sorted ? 'Picture order' : 'Sort by time').attr('aria-pressed', String(room.sorted));
}
$(function () {
  $('#house').on('click', '.guest', function () { finishMove(); openDetail($(this)); });
  $('#house').on('click', '.sort-button', function () { sortRoom($(this).closest('.room')); });
  $(document).on('click', '.close-detail', function () { closeDetail(false); });
  $(document).on('click', '.detail-overlay', function (event) {
    // A click on another guest switches directly to that guest's card.
    if (typeof event.clientX === 'number') {
      $(this).hide();
      const clickedGuest = $(document.elementFromPoint(event.clientX, event.clientY)).closest('.guest');
      $(this).show();
      if (clickedGuest.length) { openDetail(clickedGuest); return; }
    }
    closeDetail(false);
  });
  $(document).on('click', '.move-button', function () {
    const card = detailGuest;
    const target = $(this).attr('data-target');
    closeDetail(true, function () { moveGuest(card, target); });
  });
  $(document).on('keydown', function (event) {
    if (event.key === 'Escape') closeDetail(false);
    if (event.key === 'Tab' && $('.detail-card').length) {
      const buttons = $('.detail-card button');
      if (event.shiftKey && document.activeElement === buttons.first()[0]) { event.preventDefault(); buttons.last().trigger('focus'); }
      else if (!event.shiftKey && document.activeElement === buttons.last()[0]) { event.preventDefault(); buttons.first().trigger('focus'); }
    }
  });
  $(window).on('resize', function () { finishMove(); closeDetail(true); $('.guest').stop(true, true).css({ left: 0, top: 0 }); });
});
